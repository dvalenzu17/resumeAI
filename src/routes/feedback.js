import { Router } from 'express';
import { db } from '../lib/db.js';
import { logger } from '../lib/logger.js';

export const feedbackRouter = Router();

// POST /api/feedback
// Records feedback result for a job. Called from the FeedbackView frontend page.
feedbackRouter.post('/', async (req, res) => {
  const { jobId, result } = req.body ?? {};

  if (!jobId || !['yes', 'no'].includes(result)) {
    return res.status(400).json({ error: 'jobId and result (yes|no) are required' });
  }

  try {
    const job = await db.job.findUnique({ where: { id: jobId }, select: { id: true, feedbackResult: true } });

    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Only record once — don't overwrite if already set
    if (!job.feedbackResult) {
      await db.job.update({ where: { id: jobId }, data: { feedbackResult: result } });
      logger.info({ jobId, result }, 'Feedback recorded');
    }

    res.json({ ok: true });
  } catch (err) {
    logger.error({ jobId, err }, 'Failed to record feedback');
    res.status(500).json({ error: 'Could not record feedback' });
  }
});
