import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { getBillingConfig } from '@/lib/server/billing/config';
import { getEntitlement } from '@/lib/server/billing/storage';

/**
 * GET /api/billing/status
 *
 * Retrieves current entitlement, subscription state, and available plans for the requesting user.
 */
export async function GET(req: NextRequest) {
  try {
    const config = getBillingConfig();
    const cookieOwner =
      req.cookies.get('openmaic_anon_owner')?.value ||
      req.cookies.get('openmaic_access')?.value ||
      req.nextUrl.searchParams.get('ownerId') ||
      'anonymous';

    const entitlement = await getEntitlement(cookieOwner);

    return apiSuccess({
      entitlement: {
        tier: entitlement.tier,
        status: entitlement.status,
        planId: entitlement.planId,
        currentPeriodEnd: entitlement.currentPeriodEnd,
        cancelAtPeriodEnd: entitlement.cancelAtPeriodEnd,
        isPro: entitlement.tier === 'pro' || entitlement.tier === 'enterprise',
      },
      availablePlans: Object.values(config.plans).map((p) => ({
        id: p.id,
        name: p.name,
        tier: p.tier,
        amountCents: p.amountCents,
        currency: p.currency,
        interval: p.interval,
        features: p.features,
      })),
      isBillingConfigured: Boolean(config.stripeSecretKey),
    });
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to retrieve billing status',
    );
  }
}
