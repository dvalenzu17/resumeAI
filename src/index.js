console.log('Node process starting...');
import './lib/env.js'; // validate env first
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { rawBody } from './middleware/rawBody.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';
import { jobsRouter } from './routes/jobs.js';
import { webhooksRouter } from './routes/webhooks.js';

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

// Rate limiter for job submissions — 5 per IP per 10 minutes
const jobRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a few minutes before trying again.', code: 'RATE_LIMITED' },
});

// Lemon Squeezy webhook needs raw body before JSON parsing
app.use('/api/webhooks', rawBody);
app.use('/api/webhooks', webhooksRouter);

// Standard JSON parsing for all other routes
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api/jobs', jobRateLimit, jobsRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, mock: env.MOCK_CLAUDE, skipPayment: env.SKIP_PAYMENT }, 'ResumeAI server started');
});
