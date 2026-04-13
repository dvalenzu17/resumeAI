import { Router } from 'express';
import crypto from 'crypto';
import { runFullReport } from '../services/analyser.js';
import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';
import { db } from '../lib/db.js';

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
        if (email) {
          await db.job.update({ where: { id: jobId }, data: { email } }).catch((err) => {
            logger.error({ jobId, err }, 'Failed to update job email from webhook');
          });
        }
        runFullReport(jobId).catch((err) => {
          logger.error({ jobId, err }, 'runFullReport uncaught error');
        });
      };
      kickoff();
    } else {
      logger.warn({ payload }, 'order_created webhook missing job_id in custom_data');
    }
  }

  res.json({ received: true });
});
