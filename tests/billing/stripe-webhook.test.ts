import crypto from 'crypto';
import { describe, it, expect, beforeEach } from 'vitest';
import { verifyStripeWebhook } from '@/lib/server/billing/stripe';
import {
  getEntitlement,
  saveEntitlement,
  resetEntitlementCache,
  type UserEntitlement,
} from '@/lib/server/billing/storage';

describe('billing module', () => {
  const secret = 'whsec_test_secret_1234567890';

  beforeEach(() => {
    resetEntitlementCache();
  });

  describe('verifyStripeWebhook', () => {
    it('verifies valid HMAC-SHA256 signature', () => {
      const payload = JSON.stringify({ id: 'evt_123', type: 'checkout.session.completed' });
      const now = Math.floor(Date.now() / 1000);
      const signature = crypto
        .createHmac('sha256', secret)
        .update(`${now}.${payload}`, 'utf8')
        .digest('hex');

      const header = `t=${now},v1=${signature}`;
      expect(verifyStripeWebhook(payload, header, secret)).toBe(true);
    });

    it('rejects tampered payload', () => {
      const payload = JSON.stringify({ id: 'evt_123', type: 'checkout.session.completed' });
      const tampered = JSON.stringify({ id: 'evt_123', type: 'hacked' });
      const now = Math.floor(Date.now() / 1000);
      const signature = crypto
        .createHmac('sha256', secret)
        .update(`${now}.${payload}`, 'utf8')
        .digest('hex');

      const header = `t=${now},v1=${signature}`;
      expect(verifyStripeWebhook(tampered, header, secret)).toBe(false);
    });

    it('rejects expired timestamp beyond tolerance', () => {
      const payload = JSON.stringify({ id: 'evt_123' });
      const staleTimestamp = Math.floor(Date.now() / 1000) - 400; // 400s > 300s window
      const signature = crypto
        .createHmac('sha256', secret)
        .update(`${staleTimestamp}.${payload}`, 'utf8')
        .digest('hex');

      const header = `t=${staleTimestamp},v1=${signature}`;
      expect(verifyStripeWebhook(payload, header, secret)).toBe(false);
    });
  });

  describe('storage entitlements', () => {
    it('returns free tier for unrecorded owner', async () => {
      const res = await getEntitlement('non_existent_owner');
      expect(res.tier).toBe('free');
      expect(res.status).toBe('none');
    });

    it('saves and retrieves updated entitlement', async () => {
      const testEntitlement: UserEntitlement = {
        ownerId: 'user_test_999',
        stripeCustomerId: 'cus_12345',
        stripeSubscriptionId: 'sub_67890',
        tier: 'pro',
        status: 'active',
        currentPeriodEnd: Date.now() + 86400000,
        updatedAt: Date.now(),
      };

      await saveEntitlement(testEntitlement);
      const retrieved = await getEntitlement('user_test_999');

      expect(retrieved.ownerId).toBe('user_test_999');
      expect(retrieved.tier).toBe('pro');
      expect(retrieved.status).toBe('active');
      expect(retrieved.stripeCustomerId).toBe('cus_12345');
    });
  });
});
