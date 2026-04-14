import { Router } from 'express';
import crypto from 'crypto';
import { runFullReport } from '../services/analyser.js';
import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';
import { db } from '../lib/db.js';
import { logEvent } from '../services/analytics.js';

export const webhooksRouter = Router();

// Lemon Squeezy sends raw body — rawBody middleware must be applied before this route.
// Signature is HMAC-SHA256 of the raw body using LEMONSQUEEZY_WEBHOOK_SECRET.
webhooksRouter.post('/lemonsqueezy', async (req, res) => {
  const sig = req.headers['x-signature'];

  if (!sig) {
    logger.warn('Lemon Squeezy webhook missing x-signature header');
    return res.status(400).send('Missing signature');
  }

  const hmac = crypto.createHmac('sha256', env.LEMONSQUEEZY_WEBHOOK_SECRET);
  hmac.update(req.rawBody);
  const digest = hmac.digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(digest))) {
    logger.warn('Lemon Squeezy webhook signature mismatch');
    return res.status(400).send('Invalid signature');
  }

  let payload;
  try {
    payload = JSON.parse(req.rawBody);
  } catch {
    return res.status(400).send('Invalid JSON');
  }

  const eventName = payload.meta?.event_name;
  logger.info({ eventName }, 'Lemon Squeezy webhook received');

  if (eventName === 'order_created') {
    const jobId = payload.meta?.custom_data?.job_id;
    const email = payload.data?.attributes?.user_email ?? '';

    if (jobId) {
      // Stamp email first (awaited), then fire report — prevents race where
      // runFullReport reads job.email before the update commits
      const kickoff = async () => {
        const job = await db.job.findUnique({ where: { id: jobId }, select: { status: true } }).catch(() => null);
        if (job && (job.status === 'PROCESSING' || job.status === 'COMPLETE')) {
          logger.info({ jobId, status: job.status }, 'Webhook duplicate — report already running or done, skipping');
          return;
        }
        if (email) {
          await db.job.update({ where: { id: jobId }, data: { email } }).catch((err) => {
            logger.error({ jobId, err }, 'Failed to update job email from webhook');
          });
        }
        runFullReport(jobId).catch((err) => {
          logger.error({ jobId, err }, 'runFullReport uncaught error');
        });
        logEvent('payment_completed', { jobId, properties: { tier: payload.data?.attributes?.first_order_item?.variant_name || null } });
      };
      kickoff();
    } else {
      logger.warn({ payload }, 'order_created webhook missing job_id in custom_data');
    }
  }

  if (eventName === 'order_refunded') {
    const jobId = payload.meta?.custom_data?.job_id ?? null;
    logEvent('refund_issued', {
      jobId,
      properties: {
        amount: payload.data?.attributes?.refund_amount ?? null,
        reason: payload.data?.attributes?.notes ?? null,
      },
    });
    logger.info({ jobId }, 'Refund event logged');
  }

  res.json({ received: true });
});
