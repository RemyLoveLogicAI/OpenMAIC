import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, resetRateLimitStore, getRateLimitConfig } from '@/lib/server/rate-limit';

describe('rate-limit module', () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it('allows requests within limit', () => {
    const key = 'test-client-1';
    const options = { limit: 3, windowMs: 1000 };

    const r1 = checkRateLimit(key, options);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(key, options);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(key, options);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('blocks requests exceeding limit and returns retryAfterSec', () => {
    const key = 'test-client-2';
    const options = { limit: 2, windowMs: 1000 };

    checkRateLimit(key, options);
    checkRateLimit(key, options);

    const blocked = checkRateLimit(key, options);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it('isolates different client keys', () => {
    const options = { limit: 1, windowMs: 1000 };

    const c1 = checkRateLimit('client-a', options);
    expect(c1.success).toBe(true);

    const c2 = checkRateLimit('client-b', options);
    expect(c2.success).toBe(true);

    const c1Repeat = checkRateLimit('client-a', options);
    expect(c1Repeat.success).toBe(false);

    const c2Repeat = checkRateLimit('client-b', options);
    expect(c2Repeat.success).toBe(false);
  });

  it('resolves correct config for LLM vs general endpoints', () => {
    const llmConfig = getRateLimitConfig('/api/generate/scene-content');
    expect(llmConfig.limit).toBe(30);

    const generalConfig = getRateLimitConfig('/api/identity');
    expect(generalConfig.limit).toBe(120);
  });
});
