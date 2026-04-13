import { Router } from 'express';
import { db } from '../lib/db.js';
import { env } from '../lib/env.js';

export const statsRouter = Router();

// GET /api/stats
// Returns total resumes analysed. STATS_SEED offsets the real count for launch baseline.
statsRouter.get('/', async (req, res, next) => {
  try {
    const count = await db.job.count({
      where: { status: { in: ['PREVIEW_READY', 'PENDING_PAYMENT', 'PROCESSING', 'COMPLETE'] } },
    });
    res.json({ total: count + env.STATS_SEED });
  } catch (err) {
    next(err);
  }
});
