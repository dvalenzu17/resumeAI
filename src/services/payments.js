import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';

const LS_API_BASE = 'https://api.lemonsqueezy.com/v1';

const VARIANT_IDS = {
  BASIC: env.LS_VARIANT_BASIC,
  FULL:  env.LS_VARIANT_FULL,
};

/**
 * Creates a Lemon Squeezy hosted checkout and returns the checkout URL.
 * The user is redirected to this URL to complete payment.
 * On success, LS redirects back to successUrl and fires an order_created webhook.
 */
export async function createCheckoutSession({ jobId, tier, email, successUrl }) {
  const variantId = VARIANT_IDS[tier] ?? VARIANT_IDS.BASIC;

  logger.info({ jobId, tier, variantId }, 'Creating Lemon Squeezy checkout');

  const res = await fetch(`${LS_API_BASE}/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.LS_API_KEY}`,
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            ...(email ? { email } : {}),
            // custom is forwarded verbatim to webhook meta.custom_data
            custom: { job_id: jobId, tier },
          },
          product_options: {
            redirect_url: successUrl,
            receipt_link_url: successUrl,
          },
          checkout_options: {
            button_color: '#e85d04',
          },
        },
        relationships: {
          store:   { data: { type: 'stores',   id: String(env.LS_STORE_ID) } },
          variant: { data: { type: 'variants', id: String(variantId) } },
        },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    logger.error({ jobId, tier, status: res.status, errText }, 'Lemon Squeezy checkout creation failed');
    throw new Error('Checkout creation failed');
  }

  const data = await res.json();
  const checkoutUrl = data.data?.attributes?.url;
  const checkoutId  = data.data?.id ?? null;

  if (!checkoutUrl) {
    throw new Error('No checkout URL in Lemon Squeezy response');
  }

  logger.info({ jobId, checkoutId }, 'Lemon Squeezy checkout created');
  return { url: checkoutUrl, id: checkoutId };
}
