import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';

const PAYPAL_BASE = env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const TIER_PRICES = { BASIC: '12.00', FULL: '29.00' };

export async function getPayPalAccessToken() {
  const creds = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed (${res.status}): ${text}`);
  }
  const { access_token } = await res.json();
  return access_token;
}

export async function createCheckoutSession({ jobId, tier }) {
  const token = await getPayPalAccessToken();
  const price = TIER_PRICES[tier] ?? TIER_PRICES.BASIC;
  const label = tier === 'FULL' ? 'The Glow-Up' : 'The Audit';

  logger.info({ jobId, tier, price }, 'Creating PayPal order');

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        custom_id: jobId,
        description: `Shortlisted - ${label}`,
        amount: { currency_code: 'USD', value: price },
      }],
      payment_source: {
        paypal: {
          experience_context: {
            return_url: `${env.APP_URL}/success?jobId=${jobId}&tier=${tier}`,
            cancel_url: `${env.APP_URL}/preview?jobId=${jobId}`,
            user_action: 'PAY_NOW',
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    logger.error({ jobId, tier, status: res.status, errText }, 'PayPal order creation failed');
    throw new Error('PayPal order creation failed');
  }

  const data = await res.json();
  const approveLink = data.links?.find((l) => l.rel === 'payer-action')?.href;

  if (!approveLink) {
    logger.error({ jobId, links: data.links }, 'PayPal order missing approve link');
    throw new Error('PayPal order missing approve link');
  }

  logger.info({ jobId, orderId: data.id }, 'PayPal order created');
  return { id: data.id, url: approveLink };
}

export async function capturePayPalOrder(orderId) {
  const token = await getPayPalAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });

  // 422 ORDER_ALREADY_CAPTURED means a webhook already captured it — treat as success
  if (res.status === 422) {
    const body = await res.json().catch(() => ({}));
    const alreadyCaptured = body.details?.some((d) => d.issue === 'ORDER_ALREADY_CAPTURED');
    if (alreadyCaptured) {
      logger.info({ orderId }, 'PayPal order already captured — idempotent OK');
      return { status: 'COMPLETED' };
    }
  }

  if (!res.ok) {
    const errText = await res.text();
    logger.error({ orderId, status: res.status, errText }, 'PayPal capture failed');
    throw new Error('PayPal capture failed');
  }

  const data = await res.json();
  logger.info({ orderId, status: data.status }, 'PayPal order captured');
  return data;
}
