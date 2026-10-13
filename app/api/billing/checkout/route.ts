import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { getBillingConfig } from '@/lib/server/billing/config';
import { createCheckoutSession } from '@/lib/server/billing/stripe';

/**
 * POST /api/billing/checkout
 *
 * Initiates a Stripe Checkout session for subscription purchase.
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
    const { planId = 'pro_monthly', customerEmail, successUrl, cancelUrl } = body;

    const plan = config.plans[planId];
    if (!plan) {
      return apiError(
        'INVALID_REQUEST',
        400,
        `Invalid planId: '${planId}'. Available plans: ${Object.keys(config.plans).join(', ')}`,
      );
    }

    // Resolve caller identity from cookie or client reference
    const cookieOwner =
      req.cookies.get('openmaic_anon_owner')?.value ||
      req.cookies.get('openmaic_access')?.value ||
      body.ownerId ||
      'anonymous';

    const session = await createCheckoutSession({
      ownerId: cookieOwner,
      priceId: plan.priceId,
      customerEmail,
      successUrl,
      cancelUrl,
    });

    return apiSuccess({
      sessionId: session.id,
      checkoutUrl: session.url,
      plan: {
        id: plan.id,
        name: plan.name,
        amountCents: plan.amountCents,
        currency: plan.currency,
        interval: plan.interval,
      },
    });
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to create checkout session',
    );
  }
}
