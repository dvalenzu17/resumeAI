import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sl_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch { /* ignore */ }
  }, []);

  function applyConsent(granted) {
    try {
      localStorage.setItem(STORAGE_KEY, granted ? 'granted' : 'denied');
    } catch { /* ignore */ }
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
      });
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: '#18181b',
      borderTop: '1px solid #27272a',
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      flexWrap: 'wrap',
      fontSize: 13,
      color: '#a1a1aa',
    }}>
      <span>
        We use analytics to understand how people find and use Shortlisted.{' '}
        <a href="/privacy" style={{ color: '#e85d04', textDecoration: 'none' }}>Privacy policy</a>
      </span>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => applyConsent(true)}
          style={{
            background: '#e85d04',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '7px 16px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Accept
        </button>
        <button
          onClick={() => applyConsent(false)}
          style={{
            background: 'transparent',
            color: '#71717a',
            border: '1px solid #3f3f46',
            borderRadius: 6,
            padding: '7px 16px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
