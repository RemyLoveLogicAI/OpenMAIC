import crypto from 'crypto';
import { getBillingConfig } from './config';

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

export interface CreateCheckoutSessionInput {
  ownerId: string;
  priceId: string;
  customerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface StripeCheckoutResponse {
  id: string;
  url: string;
  customer?: string;
}

export interface StripePortalResponse {
  id: string;
  url: string;
}

/**
 * Perform authenticated request to Stripe REST API.
 */
async function stripeRequest<T>(endpoint: string, method: string, data?: Record<string, string>): Promise<T> {
  const { stripeSecretKey } = getBillingConfig();
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured in environment variables');
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${stripeSecretKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const body = data ? new URLSearchParams(data).toString() : undefined;

  const res = await fetch(`${STRIPE_API_BASE}${endpoint}`, {
    method,
    headers,
    body,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || `Stripe API error: ${res.status} ${res.statusText}`);
  }

  return json as T;
}

/**
 * Create a Stripe Checkout Session for subscription purchase.
 */
export async function createCheckoutSession(input: CreateCheckoutSessionInput): Promise<StripeCheckoutResponse> {
  const { appUrl } = getBillingConfig();
  const successUrl = input.successUrl || `${appUrl}/workbench?billing=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = input.cancelUrl || `${appUrl}/workbench?billing=cancel`;

  const params: Record<string, string> = {
    mode: 'subscription',
    'line_items[0][price]': input.priceId,
    'line_items[0][quantity]': '1',
    success_url: successUrl,
    cancel_url: cancelUrl,
    'metadata[ownerId]': input.ownerId,
    'client_reference_id': input.ownerId,
  };

  if (input.customerEmail) {
    params['customer_email'] = input.customerEmail;
  }

  return stripeRequest<StripeCheckoutResponse>('/checkout/sessions', 'POST', params);
}

/**
 * Create a Stripe Billing Customer Portal Session to manage/cancel subscriptions.
 */
export async function createPortalSession(customerId: string, returnUrl?: string): Promise<StripePortalResponse> {
  const { appUrl } = getBillingConfig();
  const params: Record<string, string> = {
    customer: customerId,
    return_url: returnUrl || `${appUrl}/workbench`,
  };

  return stripeRequest<StripePortalResponse>('/billing_portal/sessions', 'POST', params);
}

/**
 * Verify Stripe webhook signature using native node:crypto.
 * Signature header format: `t=1492774577,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd`
 */
export function verifyStripeWebhook(payload: string, signatureHeader: string, secret: string): boolean {
  if (!signatureHeader || !secret) return false;

  const parts = signatureHeader.split(',');
  let timestamp: string | undefined;
  const signatures: string[] = [];

  for (const part of parts) {
    const [k, v] = part.split('=');
    if (k.trim() === 't') {
      timestamp = v.trim();
    } else if (k.trim() === 'v1') {
      signatures.push(v.trim());
    }
  }

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  // Check timestamp drift (5 minute tolerance)
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const eventTimestamp = parseInt(timestamp, 10);
  if (isNaN(eventTimestamp) || Math.abs(currentTimestamp - eventTimestamp) > 300) {
    return false;
  }

  // Compute expected HMAC
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');

  // Constant-time compare against all provided v1 signatures
  for (const signature of signatures) {
    if (signature.length === expectedSignature.length) {
      if (crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expectedSignature, 'utf8'))) {
        return true;
      }
    }
  }

  return false;
}
