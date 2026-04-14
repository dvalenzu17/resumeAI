import { Router } from 'express';
import { db } from '../lib/db.js';
import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';
import { sendFollowUp1Email, sendFollowUp2Email, sendPreviewNudgeEmail } from '../services/email.js';

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
  const day3Ago = new Date(now - 3 * 24 * 60 * 60 * 1000);
  const day7Ago = new Date(now - 7 * 24 * 60 * 60 * 1000);

  let sentNudge = 0;
  let sent1 = 0;
  let sent2 = 0;

  try {
    // Preview nudge: PREVIEW_READY, 2+ hours ago, email present, nudge not yet sent
    const needsNudge = await db.job.findMany({
      where: {
        status: 'PREVIEW_READY',
        email: { not: '' },
        previewNudgeSentAt: null,
        createdAt: { lte: twoHoursAgo },
      },
      select: { id: true, email: true, analysisResult: true },
    });

    for (const job of needsNudge) {
      try {
        const analysis = job.analysisResult;
        const atsScore = analysis?.ats_score ?? null;
        const firstGap = Array.isArray(analysis?.keyword_gaps) ? analysis.keyword_gaps[0] : null;
        if (atsScore !== null) {
          await sendPreviewNudgeEmail(job.email, job.id, env.APP_URL, atsScore, firstGap);
          await db.job.update({ where: { id: job.id }, data: { previewNudgeSentAt: now } });
          sentNudge++;
          logger.info({ jobId: job.id, atsScore }, 'Preview nudge sent');
        }
      } catch (err) {
        logger.error({ jobId: job.id, err }, 'Failed to send preview nudge');
      }
    }

    // Follow-up 1: COMPLETE, 3+ days ago, email present, not yet sent
    const needsFollowUp1 = await db.job.findMany({
      where: {
        status: 'COMPLETE',
        email: { not: '' },
        followUp1SentAt: null,
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

    // Follow-up 2: COMPLETE, 7+ days ago, email present, followUp1 sent, followUp2 not yet sent
    const needsFollowUp2 = await db.job.findMany({
      where: {
        status: 'COMPLETE',
        email: { not: '' },
        followUp1SentAt: { not: null },
        followUp2SentAt: null,
        updatedAt: { lte: day7Ago },
      },
      select: { id: true, email: true },
    });

    for (const job of needsFollowUp2) {
      try {
        await sendFollowUp2Email(job.email, env.APP_URL);
        await db.job.update({ where: { id: job.id }, data: { followUp2SentAt: now } });
        sent2++;
        logger.info({ jobId: job.id }, 'Follow-up 2 sent');
      } catch (err) {
        logger.error({ jobId: job.id, err }, 'Failed to send follow-up 2');
      }
    }

    logger.info({ sentNudge, sent1, sent2 }, 'Follow-up cron complete');
    res.json({ ok: true, sentNudge, sent1, sent2 });
  } catch (err) {
    logger.error({ err }, 'Follow-up cron failed');
    res.status(500).json({ error: 'Cron failed' });
  }
});
