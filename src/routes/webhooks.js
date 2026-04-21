import { Router } from 'express';
import { Webhook } from 'svix';
import { runFullReport } from '../services/analyser.js';
import { getPayPalAccessToken } from '../services/payments.js';
import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';
import { db } from '../lib/db.js';
import { logEvent } from '../services/analytics.js';

export const webhooksRouter = Router();

const PAYPAL_BASE = env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// PayPal sends raw body — rawBody middleware must be applied before this route.
// Signature is verified via PayPal's verify-webhook-signature API when PAYPAL_WEBHOOK_ID is set.
webhooksRouter.post('/paypal', async (req, res) => {
  let payload;
  try {
    payload = JSON.parse(req.rawBody);
  } catch {
    return res.status(400).send('Invalid JSON');
  }

  // Verify signature using PayPal's verification endpoint
  if (env.PAYPAL_WEBHOOK_ID) {
    const transmissionId   = req.headers['paypal-transmission-id'];
    const transmissionTime = req.headers['paypal-transmission-time'];
    const certUrl          = req.headers['paypal-cert-url'];
    const authAlgo         = req.headers['paypal-auth-algo'];
    const transmissionSig  = req.headers['paypal-transmission-sig'];

    if (!transmissionId || !transmissionSig || !certUrl || !authAlgo || !transmissionTime) {
      logger.warn('PayPal webhook missing required headers');
      return res.status(400).send('Missing PayPal headers');
    }

    try {
      const accessToken = await getPayPalAccessToken();
      const verifyRes = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_algo: authAlgo,
          cert_url: certUrl,
          transmission_id: transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: transmissionTime,
          webhook_id: env.PAYPAL_WEBHOOK_ID,
          webhook_event: payload,
        }),
      });
      const verifyData = await verifyRes.json();
      if (verifyData.verification_status !== 'SUCCESS') {
        logger.warn({ status: verifyData.verification_status }, 'PayPal webhook signature verification failed');
        return res.status(400).send('Invalid signature');
      }
    } catch (err) {
      logger.error({ err }, 'PayPal webhook verification error');
      return res.status(500).send('Verification error');
    }
  }

  const eventType = payload.event_type;
  logger.info({ eventType }, 'PayPal webhook received');

  if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
    const jobId = payload.resource?.custom_id;

    if (jobId) {
      const kickoff = async () => {
        const job = await db.job.findUnique({ where: { id: jobId }, select: { status: true } }).catch(() => null);
        if (job && (job.status === 'PROCESSING' || job.status === 'COMPLETE')) {
          logger.info({ jobId, status: job.status }, 'PayPal webhook duplicate — report already running or done, skipping');
          return;
        }
        runFullReport(jobId).catch((err) => {
          logger.error({ jobId, err }, 'runFullReport uncaught error');
        });
        logEvent('payment_completed', {
          jobId,
          properties: { amount: payload.resource?.amount?.value ?? null },
        });
      };
      kickoff();
    } else {
      logger.warn({ payload }, 'PAYMENT.CAPTURE.COMPLETED webhook missing custom_id');
    }
  }

  if (eventType === 'PAYMENT.CAPTURE.REFUNDED') {
    const jobId = payload.resource?.custom_id ?? null;
    logEvent('refund_issued', {
      jobId,
      properties: { amount: payload.resource?.amount?.value ?? null },
    });
    logger.info({ jobId }, 'PayPal refund event logged');
  }

  res.json({ received: true });
});

// Resend email event webhooks — opens, clicks, bounces, spam complaints.
// Requires RESEND_WEBHOOK_SECRET from Resend dashboard → Webhooks → Signing secret.
// rawBody middleware is applied to /api/webhooks in index.js.
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
