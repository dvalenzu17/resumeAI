import './lib/env.js'; // validate env first
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
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

// Rate limiter for job submissions — 5 per IP per 10 minutes
const jobRateLimit = rateLimit({
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

// Lemon Squeezy webhook needs raw body before JSON parsing
app.use('/api/webhooks', rawBody);
app.use('/api/webhooks', webhooksRouter);

// Standard JSON parsing for all other routes
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api/stats', statsRateLimit, statsRouter);
app.use('/api/jobs', jobRateLimit, jobsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/cron', cronRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/admin', adminRouter);

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
