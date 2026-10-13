import { promises as fs } from 'fs';
import path from 'path';
import { createLogger } from '@/lib/logger';

const log = createLogger('BillingStorage');

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'unpaid' | 'incomplete' | 'none';
export type EntitlementTier = 'free' | 'pro' | 'enterprise';

export interface UserEntitlement {
  ownerId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planId?: string;
  tier: EntitlementTier;
  status: SubscriptionStatus;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
  updatedAt: number;
}

function billingDir(baseDir?: string): string {
  return baseDir ?? path.join(process.cwd(), 'data', 'billing');
}

function entitlementFilePath(dir: string): string {
  return path.join(dir, 'entitlements.json');
}

// In-memory cache for fast lookups
let cache: Map<string, UserEntitlement> | null = null;

async function loadEntitlements(): Promise<Map<string, UserEntitlement>> {
  if (cache) return cache;
  const dir = billingDir();
  const file = entitlementFilePath(dir);

  try {
    const data = await fs.readFile(file, 'utf-8');
    const records = JSON.parse(data) as Record<string, UserEntitlement>;
    cache = new Map(Object.entries(records));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      log.warn('Failed to read entitlements file, initializing empty store:', error);
    }
    cache = new Map();
  }
  return cache;
}

async function persistEntitlements(): Promise<void> {
  if (!cache) return;
  const dir = billingDir();
  await fs.mkdir(dir, { recursive: true });
  const file = entitlementFilePath(dir);
  const tmpFile = `${file}.tmp.${Date.now()}`;

  const recordObject: Record<string, UserEntitlement> = {};
  for (const [key, val] of cache.entries()) {
    recordObject[key] = val;
  }

  await fs.writeFile(tmpFile, JSON.stringify(recordObject, null, 2), 'utf-8');
  await fs.rename(tmpFile, file);
}

/**
 * Get entitlement for a given owner/user ID.
 */
export async function getEntitlement(ownerId: string): Promise<UserEntitlement> {
  const store = await loadEntitlements();
  const existing = store.get(ownerId);

  if (existing) {
    // Check if expired
    if (existing.currentPeriodEnd && existing.currentPeriodEnd < Date.now() && existing.status === 'active') {
      existing.status = 'canceled';
      existing.tier = 'free';
    }
    return existing;
  }

  return {
    ownerId,
    tier: 'free',
    status: 'none',
    updatedAt: Date.now(),
  };
}

/**
 * Lookup entitlement by Stripe Customer ID.
 */
export async function getEntitlementByCustomerId(customerId: string): Promise<UserEntitlement | null> {
  const store = await loadEntitlements();
  for (const entitlement of store.values()) {
    if (entitlement.stripeCustomerId === customerId) {
      return entitlement;
    }
  }
  return null;
}

/**
 * Save or update an entitlement.
 */
export async function saveEntitlement(entitlement: UserEntitlement): Promise<void> {
  const store = await loadEntitlements();
  entitlement.updatedAt = Date.now();
  store.set(entitlement.ownerId, entitlement);
  await persistEntitlements();
}

/**
 * Clear cache (for testing).
 */
export function resetEntitlementCache(): void {
  cache = null;
}
