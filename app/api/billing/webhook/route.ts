import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import { getBillingConfig } from '@/lib/server/billing/config';
import {
  getEntitlement,
  getEntitlementByCustomerId,
  saveEntitlement,
} from '@/lib/server/billing/storage';
import { verifyStripeWebhook } from '@/lib/server/billing/stripe';

const log = createLogger('StripeWebhook');

/**
 * POST /api/billing/webhook
 *
 * Receives and processes asynchronous lifecycle events from Stripe with HMAC signature verification.
 */
export async function POST(req: NextRequest) {
  try {
    const config = getBillingConfig();
    const signature = req.headers.get('stripe-signature');

    if (!config.stripeWebhookSecret) {
      log.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 });
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const rawBody = await req.text();
    const isValid = verifyStripeWebhook(rawBody, signature, config.stripeWebhookSecret);

    if (!isValid) {
      log.warn('Stripe webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    log.info(`Processing Stripe webhook event: ${event.type} (${event.id})`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const ownerId = session.metadata?.ownerId || session.client_reference_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (ownerId) {
          const current = await getEntitlement(ownerId);
          current.stripeCustomerId = customerId;
          current.stripeSubscriptionId = subscriptionId;
          current.tier = 'pro';
          current.status = 'active';
          await saveEntitlement(current);
          log.info(`Upgraded owner '${ownerId}' to PRO after checkout session completed`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const customerId = sub.customer;
        const entitlement = await getEntitlementByCustomerId(customerId);

        if (entitlement) {
          entitlement.status = sub.status;
          entitlement.cancelAtPeriodEnd = sub.cancel_at_period_end;
          entitlement.currentPeriodEnd = sub.current_period_end ? sub.current_period_end * 1000 : undefined;

          if (sub.status === 'active' || sub.status === 'trialing') {
            entitlement.tier = 'pro';
          } else if (sub.status === 'canceled' || sub.status === 'unpaid') {
            entitlement.tier = 'free';
          }

          await saveEntitlement(entitlement);
          log.info(`Updated subscription for customer '${customerId}': status=${sub.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer;
        const entitlement = await getEntitlementByCustomerId(customerId);

        if (entitlement) {
          entitlement.status = 'canceled';
          entitlement.tier = 'free';
          await saveEntitlement(entitlement);
          log.info(`Canceled subscription for customer '${customerId}'`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const entitlement = await getEntitlementByCustomerId(customerId);

        if (entitlement) {
          entitlement.status = 'active';
          entitlement.tier = 'pro';
          await saveEntitlement(entitlement);
          log.info(`Invoice payment succeeded for customer '${customerId}'`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const entitlement = await getEntitlementByCustomerId(customerId);

        if (entitlement) {
          entitlement.status = 'past_due';
          await saveEntitlement(entitlement);
          log.warn(`Invoice payment failed for customer '${customerId}': status=past_due`);
        }
        break;
      }

      default:
        log.debug(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    log.error('Stripe webhook handling failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook error' },
      { status: 500 },
    );
  }
}
