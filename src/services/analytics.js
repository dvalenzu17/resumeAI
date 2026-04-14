import { db } from '../lib/db.js';
import { logger } from '../lib/logger.js';

// Fire-and-forget — never blocks the calling function
export function logEvent(event, data = {}) {
  setImmediate(() => {
    db.analyticsEvent.create({ data: { event, ...data } })
      .catch((err) => logger.warn({ err, event }, 'Analytics write failed'));
  });
}

export function parseUA(ua = '') {
  let device = 'desktop';
  if (/mobile|android|iphone|ipod/i.test(ua)) device = 'mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'tablet';

  let browser = 'other';
  if (/edg\//i.test(ua)) browser = 'edge';
  else if (/opr\//i.test(ua)) browser = 'opera';
  else if (/chrome\//i.test(ua)) browser = 'chrome';
  else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) browser = 'safari';
  else if (/firefox\//i.test(ua)) browser = 'firefox';

  let os = 'other';
  if (/windows/i.test(ua)) os = 'windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macos';
  else if (/android/i.test(ua)) os = 'android';
  else if (/iphone|ipad/i.test(ua)) os = 'ios';
  else if (/linux/i.test(ua)) os = 'linux';

  return { device, browser, os };
}

export function extractCountry(req) {
  return req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'] || null;
}
