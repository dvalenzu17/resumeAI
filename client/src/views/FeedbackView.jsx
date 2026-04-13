import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styles from './FeedbackView.module.css';

export default function FeedbackView() {
  const [params] = useSearchParams();
  const jobId = params.get('jobId');
  const v = params.get('v'); // 'yes' | 'no'
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!jobId || !['yes', 'no'].includes(v)) return;

    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, result: v }),
    }).catch(() => {}); // fire-and-forget, UI doesn't depend on it

    setDone(true);
  }, [jobId, v]);

  const handleCopy = () => {
    navigator.clipboard?.writeText('https://getshortlisted.fyi').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!done) return null;

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>short<span className={styles.logoAccent}>listed</span></Link>
      </nav>

      <main className={styles.main}>
        <div className={styles.card}>
          {v === 'yes' ? (
            <>
              <div className={styles.icon}>
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className={styles.heading}>Glad it helped.</h1>
              <p className={styles.body}>
                That's exactly what this is for. Good luck with the application.
              </p>
              <p className={styles.sub}>
                Know someone else job hunting? Send them here.
              </p>
              <button className={styles.btn} onClick={handleCopy}>
                {copied ? 'Link copied!' : 'Copy link to share'}
              </button>
            </>
          ) : (
            <>
              <div className={`${styles.icon} ${styles.iconMuted}`}>
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h1 className={styles.heading}>Sorry to hear that.</h1>
              <p className={styles.body}>
                Reply to the email we sent you or write to{' '}
                <a href="mailto:hello@getshortlisted.fyi" className={styles.emailLink}>
                  hello@getshortlisted.fyi
                </a>
                . We'll sort it out.
              </p>
              <p className={styles.sub}>
                If the report missed something or the analysis was off, we want to know. That's how we fix it.
              </p>
            </>
          )}

          <Link to="/" className={styles.homeLink}>Back to home</Link>
        </div>
      </main>
    </div>
  );
}
