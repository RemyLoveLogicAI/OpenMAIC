import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/server/api-response';

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
  retryAfterSec: number;
}

interface WindowBucket {
  timestamps: number[];
  lastCleanup: number;
}

// In-memory sliding window bucket store
const memoryStore = new Map<string, WindowBucket>();

// Periodic cleanup threshold (every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastGlobalCleanup = Date.now();

function cleanupGlobal(now: number): void {
  if (now - lastGlobalCleanup < CLEANUP_INTERVAL_MS) return;
  lastGlobalCleanup = now;
  for (const [key, bucket] of memoryStore.entries()) {
    // Drop bucket if no timestamps in the last 10 minutes
    if (bucket.timestamps.length === 0 || now - bucket.lastCleanup > CLEANUP_INTERVAL_MS * 2) {
      memoryStore.delete(key);
    }
  }
}

/**
 * Check and record a rate limit hit using sliding-window counter.
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  cleanupGlobal(now);

  const windowStart = now - options.windowMs;
  let bucket = memoryStore.get(key);

  if (!bucket) {
    bucket = { timestamps: [], lastCleanup: now };
    memoryStore.set(key, bucket);
  }

  // Filter timestamps within current window
  bucket.timestamps = bucket.timestamps.filter((ts) => ts > windowStart);
  bucket.lastCleanup = now;

  const count = bucket.timestamps.length;
  const resetMs = bucket.timestamps.length > 0 ? bucket.timestamps[0] + options.windowMs : now + options.windowMs;
  const retryAfterSec = Math.max(1, Math.ceil((resetMs - now) / 1000));

  if (count >= options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetMs,
      retryAfterSec,
    };
  }

  // Record hit
  bucket.timestamps.push(now);

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - bucket.timestamps.length,
    resetMs,
    retryAfterSec: 0,
  };
}

/**
 * Reset memory store (useful for unit tests).
 */
export function resetRateLimitStore(): void {
  memoryStore.clear();
  lastGlobalCleanup = Date.now();
}

/**
 * Extract client identifier for rate limiting from request.
 */
export function getClientRateLimitIdentifier(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : req.headers.get('x-real-ip') || '127.0.0.1';

  // Use owner cookie or access token if available to group client sessions
  const cookieOwner = req.cookies.get('openmaic_anon_owner')?.value || req.cookies.get('openmaic_access')?.value;
  return cookieOwner ? `user:${cookieOwner}` : `ip:${ip}`;
}

/**
 * Configure endpoint rate limits from environment or defaults.
 */
export function getRateLimitConfig(pathname: string): RateLimitOptions {
  const isLlmEndpoint = pathname.startsWith('/api/generate') || pathname.startsWith('/api/chat');

  if (isLlmEndpoint) {
    const limit = Number(process.env.RATE_LIMIT_LLM_RPM) || 30; // 30 requests/min default for LLM
    const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000;
    return { limit, windowMs };
  }

  const limit = Number(process.env.RATE_LIMIT_GLOBAL_RPM) || 120; // 120 requests/min default general
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000;
  return { limit, windowMs };
}

/**
 * Helper to construct a standard 429 response with rate limit headers.
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  const res = apiError(
    'RATE_LIMITED',
    429,
    'Too many requests. Please slow down and try again.',
    `Rate limit exceeded: ${result.limit} requests per window. Retry in ${result.retryAfterSec}s.`,
  );

  res.headers.set('Retry-After', String(result.retryAfterSec));
  res.headers.set('X-RateLimit-Limit', String(result.limit));
  res.headers.set('X-RateLimit-Remaining', String(result.remaining));
  res.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetMs / 1000)));

  return res;
}

/**
 * Middleware rate limit guard. Returns 429 response if rate limited, or null if allowed.
 */
export function applyRateLimit(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  // Only apply to protected API endpoints
  if (!pathname.startsWith('/api/')) return null;

  // Whitelist health, access-code, and webhooks
  if (
    pathname === '/api/health' ||
    pathname.startsWith('/api/access-code/') ||
    pathname.startsWith('/api/billing/webhook')
  ) {
    return null;
  }

  const clientId = getClientRateLimitIdentifier(request);
  const config = getRateLimitConfig(pathname);
  const key = `${clientId}:${pathname.startsWith('/api/generate') || pathname.startsWith('/api/chat') ? 'llm' : 'api'}`;

  const result = checkRateLimit(key, config);
  if (!result.success) {
    return rateLimitResponse(result);
  }

  return null;
}
