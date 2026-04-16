import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { logEvent, parseUA, extractCountry } from '../services/analytics.js';

export const analyticsRouter = Router();

const limit = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false });

analyticsRouter.post('/event', limit, (req, res) => {
  const { event, jobId, sessionId, properties, utm = {}, referrer } = req.body ?? {};
  if (!event || typeof event !== 'string') return res.status(400).json({ error: 'event required' });

  const { device, browser, os } = parseUA(req.headers['user-agent'] || '');
  const clientCountry = typeof req.body?.clientCountry === 'string' && /^[A-Z]{2}$/.test(req.body.clientCountry)
    ? req.body.clientCountry : null;
  const country = extractCountry(req) || clientCountry;

  let safeReferrer = null;
  if (referrer && typeof referrer === 'string') {
    try {
      const u = new URL(referrer);
      safeReferrer = `${u.hostname}${u.pathname}`.slice(0, 200);
    } catch { /* skip */ }
  }

  logEvent(event, {
    jobId: jobId || null,
    sessionId: sessionId || null,
    device, browser, os, country,
    utmSource:   utm.utm_source   || null,
    utmMedium:   utm.utm_medium   || null,
    utmCampaign: utm.utm_campaign || null,
    utmTerm:     utm.utm_term     || null,
    utmContent:  utm.utm_content  || null,
    referrer: safeReferrer,
    properties: properties ?? null,
  });

  res.json({ ok: true });
});
