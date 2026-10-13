export interface PlanConfig {
  id: string;
  name: string;
  priceId: string;
  tier: 'pro' | 'enterprise';
  interval: 'month' | 'year';
  amountCents: number;
  currency: string;
  features: string[];
}

export interface BillingConfig {
  stripeSecretKey: string | null;
  stripeWebhookSecret: string | null;
  appUrl: string;
  plans: Record<string, PlanConfig>;
}

export function getBillingConfig(): BillingConfig {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || null;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';

  const plans: Record<string, PlanConfig> = {
    pro_monthly: {
      id: 'pro_monthly',
      name: 'OpenMAIC Pro (Monthly)',
      priceId: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || 'price_pro_monthly_placeholder',
      tier: 'pro',
      interval: 'month',
      amountCents: 2900, // $29/mo
      currency: 'usd',
      features: [
        'Unlimited AI classroom generation',
        'High-tier model routing (Claude 3.7 Sonnet, GPT-4o, Gemini 2.5 Pro)',
        'Priority concurrency & increased rate limits',
        'Custom template exports & audio cloning',
      ],
    },
    pro_yearly: {
      id: 'pro_yearly',
      name: 'OpenMAIC Pro (Yearly)',
      priceId: process.env.STRIPE_PRICE_ID_PRO_YEARLY || 'price_pro_yearly_placeholder',
      tier: 'pro',
      interval: 'year',
      amountCents: 29000, // $290/yr ($24/mo)
      currency: 'usd',
      features: [
        'All Pro Monthly features',
        'Two months free ($58 savings)',
        'Dedicated compute priority',
      ],
    },
  };

  return {
    stripeSecretKey,
    stripeWebhookSecret,
    appUrl: appUrl.replace(/\/+$/, ''),
    plans,
  };
}
