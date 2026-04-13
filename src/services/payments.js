import {
  lemonSqueezySetup,
  createCheckout,
} from '@lemonsqueezy/lemonsqueezy.js';
import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';

lemonSqueezySetup({ apiKey: env.LEMONSQUEEZY_API_KEY });

export async function createCheckoutSession({ jobId, tier, email }) {
  const variantId =
    tier === 'FULL'
      ? env.LEMONSQUEEZY_VARIANT_ID_FULL
      : env.LEMONSQUEEZY_VARIANT_ID_BASIC;

  logger.info({ jobId, tier, storeId: env.LEMONSQUEEZY_STORE_ID, variantId }, 'Creating LS checkout session');

  const { data, error } = await createCheckout(env.LEMONSQUEEZY_STORE_ID, variantId, {
    checkoutOptions: {
      embed: false,
      media: false,
    },
    checkoutData: {
      ...(email ? { email } : {}),
      custom: {
        job_id: jobId,
      },
    },
    productOptions: {
      redirectUrl: `${env.APP_URL}/success?jobId=${jobId}`,
    },
  });

  if (error) {
    logger.error({ jobId, variantId, storeId: env.LEMONSQUEEZY_STORE_ID, error }, 'Lemon Squeezy checkout creation failed');
    throw new Error(`Lemon Squeezy checkout error: ${error.message}`);
  }

  const checkoutUrl = data.data.attributes.url;
  logger.info({ jobId, checkoutUrl }, 'LS checkout session created');

  return {
    id: data.data.id,
    url: checkoutUrl,
  };
}
