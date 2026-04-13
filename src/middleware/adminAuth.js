import { env } from '../lib/env.js';

export function requireAdminSecret(req, res, next) {
  if (!env.ADMIN_SECRET) {
    return res.status(503).json({ error: 'Admin not configured' });
  }
  if (req.headers['x-admin-secret'] !== env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
