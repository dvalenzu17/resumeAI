import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { trackPurchaseComplete } from '../lib/analytics.js';
import styles from './SuccessView.module.css';

export default function SuccessView() {
  const [params] = useSearchParams();
  const jobId = params.get('jobId');
  const tier = params.get('tier') ?? 'FULL';

  useEffect(() => {
    trackPurchaseComplete({ tier, price: tier === 'FULL' ? 29 : 12 });
  }, []);

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>short<span className={styles.logoAccent}>listed</span></Link>
      </nav>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.iconWrap}>
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className={styles.badge}>Payment confirmed</div>

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
            <p className={styles.referralText}>
              Know someone job hunting? Send them here.
            </p>
            <a
              href="https://getshortlisted.fyi"
              className={styles.referralLink}
              onClick={(e) => {
                e.preventDefault();
                navigator.clipboard?.writeText('https://getshortlisted.fyi').catch(() => {});
                e.currentTarget.textContent = 'Link copied!';
                setTimeout(() => { e.currentTarget.textContent = 'Copy link'; }, 2000);
              }}
            >
              Copy link
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
