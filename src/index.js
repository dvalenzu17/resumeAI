import './lib/env.js'; // validate env first
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as Sentry from '@sentry/node';
import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { db } from './lib/db.js';
import { rawBody } from './middleware/rawBody.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';
import { jobsRouter } from './routes/jobs.js';
import { webhooksRouter } from './routes/webhooks.js';
import { statsRouter } from './routes/stats.js';
import { cronRouter } from './routes/cron.js';
import { feedbackRouter } from './routes/feedback.js';
import { adminRouter } from './routes/admin.js';
import { analyticsRouter } from './routes/analytics.js';

// Sentry error monitoring — initialise before anything else runs
if (env.SENTRY_DSN) {
  Sentry.init({ dsn: env.SENTRY_DSN, environment: env.NODE_ENV });
  logger.info('Sentry initialised');
}

// Production safety guard
if (env.NODE_ENV === 'production') {
  if (env.MOCK_CLAUDE) {
    logger.error('MOCK_CLAUDE=true in production — refusing to start');
    process.exit(1);
  }
  if (env.SKIP_PAYMENT) {
    logger.error('SKIP_PAYMENT=true in production — refusing to start');
    process.exit(1);
  }
}

const app = express();
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false, // CSP would break inline scripts and Google Fonts
  crossOriginEmbedderPolicy: false, // would break Lemon Squeezy checkout redirect
}));

// Rate limiter for job creation only — 5 submissions per IP per 10 minutes
const jobCreateRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a few minutes before trying again.', code: 'RATE_LIMITED' },
});

// Rate limiter for stats — 60 per IP per minute
const statsRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// Webhook routes need raw body before JSON parsing (LS + Resend signature verification)
app.use('/api/webhooks', rawBody);
app.use('/api/webhooks', webhooksRouter);

// Standard JSON parsing for all other routes
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api/stats', statsRateLimit, statsRouter);
app.post('/api/jobs', jobCreateRateLimit);  // rate-limit creation only, not status polls
app.use('/api/jobs', jobsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/cron', cronRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/admin', adminRouter);

// ── Unsubscribe ───────────────────────────────────────────────────────────────
// Linked from all marketing emails. Sets marketingOptOut=true on the job record.
// Returns a plain HTML page so it works without the React SPA loaded.
function unsubHtml(message, success) {
  const color = success ? '#059669' : '#dc2626';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed | Shortlisted</title><style>*{box-sizing:border-box;margin:0;padding:0}body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f0f0f;font-family:system-ui,-apple-system,sans-serif;padding:24px}.card{max-width:440px;width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;padding:40px 36px;text-align:center}.logo{font-size:20px;font-weight:800;color:#f9fafb;letter-spacing:-0.5px;margin-bottom:28px}.logo span{color:#e85d04}h1{font-size:20px;font-weight:700;color:${color};margin-bottom:12px}p{font-size:14px;color:#9ca3af;line-height:1.6;margin-bottom:20px}a{color:#e85d04;font-size:14px;text-decoration:none}</style></head><body><div class="card"><p class="logo">short<span>listed</span></p><h1>${message}</h1><p>You will no longer receive follow-up emails from us.<br>Transactional emails (your report, receipts) are unaffected.</p><a href="https://getshortlisted.fyi">← Back to Shortlisted</a></div></body></html>`;
}

app.get('/api/unsubscribe', async (req, res) => {
  const { jobId } = req.query;
  if (!jobId || typeof jobId !== 'string' || jobId.length > 40) {
    return res.status(400).send(unsubHtml('Invalid unsubscribe link.', false));
  }
  try {
    const result = await db.job.updateMany({
      where: { id: jobId },
      data: { marketingOptOut: true },
    });
    if (result.count === 0) {
      return res.status(404).send(unsubHtml('Link not found.', false));
    }
    logger.info({ jobId }, 'User unsubscribed from marketing emails');
    res.send(unsubHtml("You've been unsubscribed.", true));
  } catch (err) {
    logger.error({ err, jobId }, 'Unsubscribe failed');
    res.status(500).send(unsubHtml('Something went wrong. Please try again.', false));
  }
});

app.use(errorHandler);

// Serve built React frontend in production
const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDist = join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(join(clientDist, 'index.html'));
});

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, mock: env.MOCK_CLAUDE, skipPayment: env.SKIP_PAYMENT }, 'ResumeAI server started');
});
