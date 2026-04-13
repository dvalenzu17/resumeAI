import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  SKIP_PAYMENT: z.coerce.boolean().default(false),
  MOCK_CLAUDE: z.coerce.boolean().default(false),
  STATS_SEED: z.coerce.number().default(0),
  // Used in dev when SKIP_PAYMENT=true (no LS checkout to capture email)
  DEV_EMAIL: z.string().default('dev@localhost'),
  DATABASE_URL: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().default(''),
  // Payment — only required when SKIP_PAYMENT=false
  LEMONSQUEEZY_API_KEY: z.string().default(''),
  LEMONSQUEEZY_WEBHOOK_SECRET: z.string().default(''),
  LEMONSQUEEZY_STORE_ID: z.string().default(''),
  LEMONSQUEEZY_VARIANT_ID_BASIC: z.string().default(''),
  LEMONSQUEEZY_VARIANT_ID_FULL: z.string().default(''),
  // Email — optional until ready
  RESEND_API_KEY: z.string().default(''),
  // R2 — optional until ready
  R2_ACCOUNT_ID: z.string().default(''),
  R2_ACCESS_KEY_ID: z.string().default(''),
  R2_SECRET_ACCESS_KEY: z.string().default(''),
  R2_BUCKET_NAME: z.string().default(''),
  APP_URL: z.string().url().default('http://localhost:5173'),
  CRON_SECRET: z.string().default(''),
  ADMIN_SECRET: z.string().default(''),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
