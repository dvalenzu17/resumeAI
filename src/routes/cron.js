import { Router } from 'express';
import { db } from '../lib/db.js';
import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';
import { sendFollowUp1Email, sendFollowUp2Email, sendPreviewNudgeEmail, sendWebhookAlertEmail, sendDailyPulseEmail } from '../services/email.js';

export const cronRouter = Router();

// Called hourly by an external cron service (e.g. cron-job.org).
// Requires X-Cron-Secret header matching CRON_SECRET env var.
// Safe to call multiple times — checks sent flags before sending.
cronRouter.post('/followups', async (req, res) => {
  if (!env.CRON_SECRET || req.headers['x-cron-secret'] !== env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const now = new Date();
  const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000);
  const ninetyMinsAgo = new Date(now - 90 * 60 * 1000);
  const day3Ago = new Date(now - 3 * 24 * 60 * 60 * 1000);
  const day7Ago = new Date(now - 7 * 24 * 60 * 60 * 1000);

  let sentNudge = 0;
  let sent1 = 0;
  let sent2 = 0;

  try {
    // Preview nudge: PREVIEW_READY, 2+ hours ago, email present, nudge not yet sent, not opted out
    const needsNudge = await db.job.findMany({
      where: {
        status: 'PREVIEW_READY',
        email: { not: '' },
        previewNudgeSentAt: null,
        marketingOptOut: false,
        createdAt: { lte: twoHoursAgo },
      },
      select: { id: true, email: true, analysisResult: true },
    });

    for (const job of needsNudge) {
      try {
        const analysis = job.analysisResult;
        const shortlistMatchRate = analysis?.shortlist_match_rate ?? null;
        const firstGap = Array.isArray(analysis?.keyword_gaps) ? analysis.keyword_gaps[0] : null;
        if (shortlistMatchRate !== null) {
          await sendPreviewNudgeEmail(job.email, job.id, env.APP_URL, shortlistMatchRate, firstGap);
          await db.job.update({ where: { id: job.id }, data: { previewNudgeSentAt: now } });
          sentNudge++;
          logger.info({ jobId: job.id, shortlistMatchRate }, 'Preview nudge sent');
        }
      } catch (err) {
        logger.error({ jobId: job.id, err }, 'Failed to send preview nudge');
      }
    }

    // Follow-up 1: COMPLETE, 3+ days ago, email present, not opted out, not yet sent
    const needsFollowUp1 = await db.job.findMany({
      where: {
        status: 'COMPLETE',
        email: { not: '' },
        followUp1SentAt: null,
        marketingOptOut: false,
        updatedAt: { lte: day3Ago },
      },
      select: { id: true, email: true },
    });

    for (const job of needsFollowUp1) {
      try {
        await sendFollowUp1Email(job.email, job.id, env.APP_URL);
        await db.job.update({ where: { id: job.id }, data: { followUp1SentAt: now } });
        sent1++;
        logger.info({ jobId: job.id }, 'Follow-up 1 sent');
      } catch (err) {
        logger.error({ jobId: job.id, err }, 'Failed to send follow-up 1');
      }
    }

    // Follow-up 2: COMPLETE, 7+ days ago, email present, followUp1 sent, not opted out, followUp2 not yet sent
    const needsFollowUp2 = await db.job.findMany({
      where: {
        status: 'COMPLETE',
        email: { not: '' },
        followUp1SentAt: { not: null },
        followUp2SentAt: null,
        marketingOptOut: false,
        updatedAt: { lte: day7Ago },
      },
      select: { id: true, email: true },
    });

    for (const job of needsFollowUp2) {
      try {
        await sendFollowUp2Email(job.email, job.id, env.APP_URL);
        await db.job.update({ where: { id: job.id }, data: { followUp2SentAt: now } });
        sent2++;
        logger.info({ jobId: job.id }, 'Follow-up 2 sent');
      } catch (err) {
        logger.error({ jobId: job.id, err }, 'Failed to send follow-up 2');
      }
    }

    // Webhook silence detector: jobs stuck in PENDING_PAYMENT for 90+ minutes.
    // Could mean PayPal webhook not firing, or user abandoned after approval without capture completing.
    const stuckJobs = await db.job.findMany({
      where: {
        status: 'PENDING_PAYMENT',
        createdAt: { lte: ninetyMinsAgo },
      },
      select: { id: true, email: true, createdAt: true },
    });
    if (stuckJobs.length > 0) {
      try {
        await sendWebhookAlertEmail('hello@getshortlisted.fyi', stuckJobs);
        logger.warn({ stuckCount: stuckJobs.length }, 'Webhook silence alert sent');
      } catch (err) {
        logger.error({ err }, 'Failed to send webhook silence alert');
      }
    }

    logger.info({ sentNudge, sent1, sent2, stuckJobs: stuckJobs.length }, 'Follow-up cron complete');
    res.json({ ok: true, sentNudge, sent1, sent2, webhookAlert: stuckJobs.length });
  } catch (err) {
    logger.error({ err }, 'Follow-up cron failed');
    res.status(500).json({ error: 'Cron failed' });
  }
});

// Called once daily at 6am by an external cron service.
// Sends a revenue + activity summary to the admin email.
cronRouter.post('/daily-pulse', async (req, res) => {
  if (!env.CRON_SECRET || req.headers['x-cron-secret'] !== env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const now = new Date();

  // Yesterday: UTC midnight-to-midnight
  const yesterdayStart = new Date(now);
  yesterdayStart.setUTCHours(0, 0, 0, 0);
  yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);
  const yesterdayEnd = new Date(now);
  yesterdayEnd.setUTCHours(0, 0, 0, 0);

  const dateStr = yesterdayStart.toISOString().slice(0, 10);

  try {
    const [completedYesterday, jobsCreated, failedJobs, nudgesSent, fu1Sent, fu2Sent] = await Promise.all([
      db.job.findMany({
        where: { status: 'COMPLETE', updatedAt: { gte: yesterdayStart, lt: yesterdayEnd } },
        select: { tier: true },
      }),
      db.job.count({ where: { createdAt: { gte: yesterdayStart, lt: yesterdayEnd } } }),
      db.job.findMany({
        where: { status: 'FAILED', updatedAt: { gte: yesterdayStart, lt: yesterdayEnd } },
        select: { id: true, email: true },
      }),
      db.job.count({ where: { previewNudgeSentAt: { gte: yesterdayStart, lt: yesterdayEnd } } }),
      db.job.count({ where: { followUp1SentAt:   { gte: yesterdayStart, lt: yesterdayEnd } } }),
      db.job.count({ where: { followUp2SentAt:   { gte: yesterdayStart, lt: yesterdayEnd } } }),
    ]);

    const basicCount = completedYesterday.filter(j => j.tier === 'BASIC').length;
    const fullCount  = completedYesterday.filter(j => j.tier === 'FULL').length;
    const revenue    = basicCount * 12 + fullCount * 29;

    await sendDailyPulseEmail('hello@getshortlisted.fyi', {
      date: dateStr,
      revenue,
      basicCount,
      fullCount,
      jobsCreated,
      failedJobs,
      nudgesSent,
      fu1Sent,
      fu2Sent,
    });

    logger.info({ date: dateStr, revenue, sales: basicCount + fullCount }, 'Daily pulse sent');
    res.json({ ok: true, date: dateStr, revenue, sales: basicCount + fullCount });
  } catch (err) {
    logger.error({ err }, 'Daily pulse cron failed');
    res.status(500).json({ error: 'Daily pulse failed' });
  }
});
