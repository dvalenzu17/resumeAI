import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { trackPurchaseComplete } from '../lib/analytics.js';
import { useT, LangSwitcher } from '../lib/i18n.jsx';
import styles from './SuccessView.module.css';

export default function SuccessView() {
  const [params] = useSearchParams();
  const jobId = params.get('jobId');
  const tier = params.get('tier') ?? 'FULL';
  const orderId = params.get('token'); // PayPal passes the order ID as ?token=

  const { t } = useT();
  const [captureError, setCaptureError] = useState(null);
  const [captured, setCaptured] = useState(!orderId); // no token = already captured or SKIP_PAYMENT

  useEffect(() => {
    if (!orderId || !jobId) return;

    fetch(`/api/jobs/${jobId}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.error || 'Capture failed'); });
        return res.json();
      })
      .then(() => {
        setCaptured(true);
        trackPurchaseComplete({ tier, price: tier === 'FULL' ? 29 : 12 });
      })
      .catch((err) => {
        setCaptureError(err.message);
        setCaptured(true); // still show the page
      });
  }, []);

  useEffect(() => {
    if (!orderId) trackPurchaseComplete({ tier, price: tier === 'FULL' ? 29 : 12 });
  }, []);

  if (!captured) {
    return (
      <div className={styles.page}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>short<span className={styles.logoAccent}>listed</span></Link>
        </nav>
        <main className={styles.main}>
          <div className={styles.card} style={{ textAlign: 'center' }}>
            <p style={{ color: '#9ca3af', fontSize: '15px' }}>Confirming your payment...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>short<span className={styles.logoAccent}>listed</span></Link>
        <LangSwitcher className={styles.langSwitcher} />
      </nav>

      <main className={styles.main}>
        <div className={styles.card}>
          {captureError && (
            <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px', padding: '10px 14px', background: '#1f0a0a', borderRadius: '8px', border: '1px solid #7f1d1d' }}>
              Payment confirmation failed: {captureError}. If you were charged, email us at hello@getshortlisted.fyi with your Job ID.
            </p>
          )}
          <div className={styles.iconWrap}>
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className={styles.badge}>Payment confirmed</div>
          {jobId && (
            <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#9ca3af', margin: '4px 0 0', letterSpacing: '0.02em' }}>
              Job ID: {jobId}
            </p>
          )}

          <h1 className={styles.heading}>
            Report incoming.<br />
            <span className={styles.gradientText}>Check your inbox.</span>
          </h1>

          <p className={styles.body}>
            Generating your full PDF now. It'll be in your inbox in about <strong>60 seconds</strong>.
            Download link is valid for 72 hours.
          </p>

          <p className={styles.spamNote}>
            Nothing after 3 minutes? Check spam. Still missing?{' '}
            <a href="mailto:hello@getshortlisted.fyi" className={styles.contactLink}>
              hello@getshortlisted.fyi
            </a>
          </p>
          <p className={styles.spamNote} style={{ marginTop: '8px' }}>
            Link expired?{' '}
            <Link to={`/redownload`} className={styles.contactLink}>
              Re-generate your download links
            </Link>
            {' '}using your Job ID and email.
          </p>

          <p className={styles.body2}>
            Go touch grass. You've done the hard part.
          </p>

          <div className={styles.actions}>
            {jobId && (
              <Link to={`/processing?jobId=${jobId}`} className={styles.btnPrimary}>
                Track progress
              </Link>
            )}
            <Link to="/" className={styles.btnSecondary}>
              Analyse another resume
            </Link>
          </div>

          <div className={styles.referral}>
            <p className={styles.referralHeading}>One favour.</p>
            <p className={styles.referralText}>
              Most job seekers don't know their resume is being filtered before a recruiter reads it.
              If you know someone applying right now, send them here. Free score, 30 seconds.
            </p>
            <div className={styles.referralActions}>
              <button
                className={styles.referralBtn}
                onClick={(e) => {
                  navigator.clipboard?.writeText('https://getshortlisted.fyi').catch(() => {});
                  e.currentTarget.textContent = 'Copied!';
                  setTimeout(() => { e.currentTarget.textContent = 'Copy link'; }, 2000);
                }}
              >
                Copy link
              </button>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://getshortlisted.fyi')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.referralLinkedIn}
              >
                Share on LinkedIn
              </a>
            </div>
            <p className={styles.referralUrl}>getshortlisted.fyi</p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <Link to="/privacy" className={styles.footerLink}>Privacy</Link>
        <span className={styles.footerDot}>·</span>
        <Link to="/terms" className={styles.footerLink}>Terms</Link>
        <span className={styles.footerDot}>·</span>
        <a href="mailto:hello@getshortlisted.fyi" className={styles.footerLink}>hello@getshortlisted.fyi</a>
      </footer>
    </div>
  );
}
