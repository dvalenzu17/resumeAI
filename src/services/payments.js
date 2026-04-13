import {
  lemonSqueezySetup,
  createCheckout,
} from '@lemonsqueezy/lemonsqueezy.js';
import { env } from '../lib/env.js';

lemonSqueezySetup({ apiKey: env.LEMONSQUEEZY_API_KEY });

export async function createCheckoutSession({ jobId, tier, email }) {
  const variantId =
    tier === 'FULL'
      ? env.LEMONSQUEEZY_VARIANT_ID_FULL
      : env.LEMONSQUEEZY_VARIANT_ID_BASIC;

  const { data, error } = await createCheckout(env.LEMONSQUEEZY_STORE_ID, variantId, {
    checkoutOptions: {
      embed: false,
      media: false,
    },
    checkoutData: {
      email,
      custom: {
        job_id: jobId,
      },
    },
    productOptions: {
      redirectUrl: `${env.APP_URL}/success?jobId=${jobId}`,
    },
  });

  if (error) {
    throw new Error(`Lemon Squeezy checkout error: ${error.message}`);
  }

  return {
    id: data.data.id,
    url: data.data.attributes.url,
  };
}
