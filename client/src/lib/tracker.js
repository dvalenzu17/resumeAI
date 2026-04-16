const SESSION_KEY = 'sl_sid';
const UTM_KEY = 'sl_utm';

export function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getUtm() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const v = params.get(k);
    if (v) utm[k] = v;
  }
  if (Object.keys(utm).length > 0) {
    sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
    return utm;
  }
  const saved = sessionStorage.getItem(UTM_KEY);
  return saved ? JSON.parse(saved) : {};
}

// Derive 2-letter ISO country code from browser locale (e.g. "en-US" → "US").
// Works for most users; falls back to null if unavailable.
export function getClientCountry() {
  try {
    const parts = (navigator.language || '').split('-');
    if (parts.length > 1) {
      const code = parts[parts.length - 1].toUpperCase();
      if (/^[A-Z]{2}$/.test(code)) return code;
    }
  } catch { /* ignore */ }
  return null;
}

export function track(event, properties = {}, jobId = null) {
  const sessionId = getSessionId();
  const utm = getUtm();
  const clientCountry = getClientCountry();
  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, jobId: jobId || undefined, sessionId, properties, utm, referrer: document.referrer || undefined, clientCountry }),
    keepalive: true,
  }).catch(() => {});
}

export function trackOnce(ref, event, properties = {}, jobId = null) {
  // Returns cleanup fn. Tracks when the element first enters viewport.
  if (!ref) return () => {};
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        track(event, properties, jobId);
        observer.disconnect();
      }
    },
    { threshold: 0.25 }
  );
  observer.observe(ref);
  return () => observer.disconnect();
}
