import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { trackPurchaseComplete } from '../lib/analytics.js';
import { useT, LangSwitcher } from '../lib/i18n.jsx';
import styles from './SuccessView.module.css';

export default function SuccessView() {
  const [params] = useSearchParams();
  const jobId = params.get('jobId');
  const tier = params.get('tier') ?? 'FULL';
  const orderId = params.get('token'); // PayPal passes the order ID as ?token= (legacy redirect flow)

  const { t } = useT();
  const [captureError, setCaptureError] = useState(null);
  const [captured, setCaptured] = useState(!orderId); // no token = SDK flow, already captured
  const [clContext, setClContext] = useState({ companyWhy: '', topAchievement: '', uniqueAngle: '' });
  const [contextSaved, setContextSaved] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const contextSubmitted = useRef(false);

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

  const handleContextSubmit = async (e) => {
    e.preventDefault();
    if (contextSubmitted.current || !jobId) return;
    contextSubmitted.current = true;
    setContextLoading(true);
    try {
      await fetch(`/api/jobs/${jobId}/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clContext),
      });
    } catch { /* non-critical, report generates fine without it */ }
    setContextSaved(true);
    setContextLoading(false);
  };

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

          {tier === 'FULL' && !contextSaved && (
            <div style={{ margin: '24px 0', padding: '20px', background: '#111827', borderRadius: '12px', border: '1px solid #1f2937' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#f9fafb', marginBottom: '4px' }}>
                Personalise your cover letter (optional)
              </p>
              <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
                Takes 60 seconds. Fill this in while your report generates and we'll tailor the cover letter specifically to you.
              </p>
              <form onSubmit={handleContextSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                    What do you know about this company or role that makes you want it specifically?
                  </label>
                  <textarea
                    rows={2}
                    value={clContext.companyWhy}
                    onChange={(e) => setClContext((c) => ({ ...c, companyWhy: e.target.value }))}
                    placeholder="e.g. They just raised Series B, I follow their blog, or I used their product for 3 years..."
                    style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '8px 10px', color: '#f9fafb', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                    What's your most relevant achievement for this role? Include numbers if you can.
                  </label>
                  <textarea
                    rows={2}
                    value={clContext.topAchievement}
                    onChange={(e) => setClContext((c) => ({ ...c, topAchievement: e.target.value }))}
                    placeholder="e.g. Led a team of 5, reduced churn by 18% in 6 months, shipped X that generated Y..."
                    style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '8px 10px', color: '#f9fafb', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                    What makes you a non-obvious choice that doesn't show up clearly on your resume?
                  </label>
                  <textarea
                    rows={2}
                    value={clContext.uniqueAngle}
                    onChange={(e) => setClContext((c) => ({ ...c, uniqueAngle: e.target.value }))}
                    placeholder="e.g. I built a side project in this exact space, I speak the language of their target market..."
                    style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '8px 10px', color: '#f9fafb', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    type="submit"
                    disabled={contextLoading}
                    style={{ padding: '8px 18px', background: 'var(--accent, #6366f1)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: contextLoading ? 0.7 : 1 }}
                  >
                    {contextLoading ? 'Saving...' : 'Personalise my report'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { contextSubmitted.current = true; setContextSaved(true); }}
                    style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    Skip
                  </button>
                </div>
              </form>
            </div>
          )}

          {tier === 'FULL' && contextSaved && (
            <p style={{ fontSize: '13px', color: '#059669', textAlign: 'center', margin: '16px 0', padding: '10px', background: '#052e16', borderRadius: '8px' }}>
              Context saved. Your cover letter will be personalised.
            </p>
          )}

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
