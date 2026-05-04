import crypto from 'crypto';
import { Router } from 'express';
import { Webhook } from 'svix';
import { runFullReport } from '../services/analyser.js';
import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';
import { db } from '../lib/db.js';
import { logEvent } from '../services/analytics.js';

export const webhooksRouter = Router();

// ── Lemon Squeezy ─────────────────────────────────────────────────────────────
// Respond 200 immediately — never await analysis in the handler.
// rawBody middleware is applied to /api/webhooks in index.js.
webhooksRouter.post('/lemonsqueezy', async (req, res) => {
  const signature = req.headers['x-signature'];

  if (!signature || !env.LS_WEBHOOK_SECRET) {
    logger.warn('Lemon Squeezy webhook missing signature or secret not configured');
    return res.status(400).send('Missing signature');
  }

  // Verify HMAC-SHA256 signature
  const digest = crypto
    .createHmac('sha256', env.LS_WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest('hex');

  let signatureValid = false;
  try {
    signatureValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(digest, 'hex'),
    );
  } catch {
    // Buffer lengths differ — invalid signature format
  }

  if (!signatureValid) {
    logger.warn('Lemon Squeezy webhook signature verification failed');
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

  // Respond before any async work — LS expects 200 in < 5s
  res.json({ received: true });

  if (eventName === 'order_created') {
    const jobId  = payload.meta?.custom_data?.job_id ?? null;
    const amount = payload.data?.attributes?.total ?? null; // in cents

    if (jobId) {
      const kickoff = async () => {
        const job = await db.job.findUnique({ where: { id: jobId }, select: { status: true } }).catch(() => null);
        if (job && (job.status === 'PROCESSING' || job.status === 'COMPLETE')) {
          logger.info({ jobId, status: job.status }, 'LS webhook duplicate — report already running or done, skipping');
          return;
        }
        runFullReport(jobId).catch((err) => {
          logger.error({ jobId, err }, 'runFullReport uncaught error');
        });
        logEvent('payment_completed', {
          jobId,
          properties: { amount: amount !== null ? amount / 100 : null, provider: 'lemonsqueezy' },
        });
      };
      kickoff();
    } else {
      logger.warn({ meta: payload.meta }, 'LS order_created webhook missing job_id in custom_data');
    }
  }

  if (eventName === 'order_refunded') {
    const jobId  = payload.meta?.custom_data?.job_id ?? null;
    const amount = payload.data?.attributes?.total ?? null;
    logEvent('refund_issued', {
      jobId,
      properties: { amount: amount !== null ? amount / 100 : null, provider: 'lemonsqueezy' },
    });
    logger.info({ jobId }, 'LS refund event logged');
  }
});

// ── Resend email events ────────────────────────────────────────────────────────
// Opens, clicks, bounces, spam complaints.
// Requires RESEND_WEBHOOK_SECRET from Resend dashboard → Webhooks → Signing secret.
const RESEND_EVENT_MAP = {
  'email.opened':         'email_opened',
  'email.clicked':        'email_clicked',
  'email.bounced':        'email_bounced',
  'email.spam_complaint': 'email_spam',
  'email.unsubscribed':   'email_unsubscribed',
};

webhooksRouter.post('/resend', async (req, res) => {
  if (!env.RESEND_WEBHOOK_SECRET) {
    logger.warn('RESEND_WEBHOOK_SECRET not set — rejecting Resend webhook');
    return res.status(400).send('Webhook not configured');
  }

  const svixId        = req.headers['svix-id'];
  const svixTimestamp = req.headers['svix-timestamp'];
  const svixSignature = req.headers['svix-signature'];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).send('Missing svix headers');
  }

  let payload;
  try {
    const wh = new Webhook(env.RESEND_WEBHOOK_SECRET);
    payload = wh.verify(req.rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    logger.warn({ err }, 'Resend webhook signature verification failed');
    return res.status(400).send('Invalid signature');
  }

  const analyticsEventName = RESEND_EVENT_MAP[payload.type];
  if (!analyticsEventName) {
    return res.json({ received: true }); // ignore unknown event types
  }

  const data = payload.data ?? {};
  try {
    await logEvent(analyticsEventName, {
      properties: {
        resend_email_id: data.email_id || null,
        subject: data.subject || null,
        to: data.to?.[0] || null,
        click_url: data.click?.url || null,
      },
    });
    logger.info({ type: payload.type, emailId: data.email_id }, 'Resend email event logged');
  } catch (err) {
    logger.error({ err, type: payload.type }, 'Failed to log Resend email event');
  }

  res.json({ received: true });
});
