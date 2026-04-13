import { Router } from 'express';
import { db } from '../lib/db.js';

export const healthRouter = Router();

healthRouter.get('/health', async (req, res, next) => {
  try {
    await db.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});
