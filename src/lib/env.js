import { z } from 'zod';

// z.coerce.boolean() treats "false" as true (non-empty string). Handle string and native boolean.
const envBool = z.union([z.boolean(), z.string()]).transform((v) => v === true || v === 'true' || v === '1').pipe(z.boolean());

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  SKIP_PAYMENT: envBool.default(false),
  MOCK_CLAUDE: envBool.default(false),
  STATS_SEED: z.coerce.number().default(0),
  // Used in dev when SKIP_PAYMENT=true (no LS checkout to capture email)
  DEV_EMAIL: z.string().default('dev@localhost'),
  DATABASE_URL: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().default(''),
  // Payment — only required when SKIP_PAYMENT=false
  PAYPAL_CLIENT_ID: z.string().default(''),
  PAYPAL_CLIENT_SECRET: z.string().default(''),
  PAYPAL_WEBHOOK_ID: z.string().default(''),
  // Email — optional until ready
  RESEND_API_KEY: z.string().default(''),
  RESEND_WEBHOOK_SECRET: z.string().default(''),
  // R2 — optional until ready
  R2_ACCOUNT_ID: z.string().default(''),
  R2_ACCESS_KEY_ID: z.string().default(''),
  R2_SECRET_ACCESS_KEY: z.string().default(''),
  R2_BUCKET_NAME: z.string().default(''),
  APP_URL: z.string().url().default('http://localhost:5173'),
  CRON_SECRET: z.string().default(''),
  ADMIN_SECRET: z.string().default(''),
  SENTRY_DSN: z.string().default(''),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
