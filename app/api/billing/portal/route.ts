import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { getBillingConfig } from '@/lib/server/billing/config';
import { getEntitlement } from '@/lib/server/billing/storage';
import { createPortalSession } from '@/lib/server/billing/stripe';

/**
 * POST /api/billing/portal
 *
 * Creates a Stripe Customer Portal session for managing/canceling subscriptions.
 */
export async function POST(req: NextRequest) {
  try {
    const config = getBillingConfig();
    if (!config.stripeSecretKey) {
      return apiError(
        'INTERNAL_ERROR',
        503,
        'Billing service unavailable: STRIPE_SECRET_KEY is not configured',
      );
    }

    const body = await req.json().catch(() => ({}));
    const cookieOwner =
      req.cookies.get('openmaic_anon_owner')?.value ||
      req.cookies.get('openmaic_access')?.value ||
      body.ownerId;

    if (!cookieOwner) {
      return apiError('UNAUTHENTICATED', 401, 'Owner identity could not be resolved');
    }

    const entitlement = await getEntitlement(cookieOwner);
    if (!entitlement.stripeCustomerId) {
      return apiError(
        'INVALID_REQUEST',
        400,
        'No active billing customer found for this account. Complete a checkout first.',
      );
    }

    const portal = await createPortalSession(entitlement.stripeCustomerId, body.returnUrl);

    return apiSuccess({
      portalUrl: portal.url,
    });
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to create customer portal session',
    );
  }
}
