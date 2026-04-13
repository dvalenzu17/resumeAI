import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useT, LangSwitcher } from '../lib/i18n.jsx';
import styles from './ProcessingView.module.css';

const POLL_INTERVAL = 3000;

const STEPS = [
  { label: 'Resume received', subtitle: 'Text extracted successfully' },
  { label: 'Scoring against job description', subtitle: 'Checking keywords, experience, gaps' },
  { label: 'Building your preview', subtitle: 'Almost there' },
];

export default function ProcessingView() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const jobId = params.get('jobId');
  const [status, setStatus] = useState('ANALYZING');
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(1);
  const { t } = useT();

  // Simulate step progression — teaser analysis is ~15-25s
  useEffect(() => {
    const timings = [3000, 12000];
    const timers = timings.map((ms, i) =>
      setTimeout(() => setActiveStep((s) => Math.max(s, i + 2)), ms)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Poll for status
  useEffect(() => {
    if (!jobId) {
      setError('Missing job ID.');
      return;
    }

    let stopped = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}/status`);
        if (!res.ok) { setError('Could not retrieve status.'); return; }
        const data = await res.json();
        if (stopped) return;
        setStatus(data.status);
        if (data.status === 'PREVIEW_READY') {
          setActiveStep(3);
          setTimeout(() => navigate(`/preview?jobId=${jobId}`), 600);
          return;
        }
        if (data.status === 'FAILED') return;
        if (data.status === 'PENDING_PAYMENT') return;
        setTimeout(poll, POLL_INTERVAL);
      } catch {
        if (!stopped) setTimeout(poll, POLL_INTERVAL);
      }
    };

    poll();
    return () => { stopped = true; };
  }, [jobId]);

  if (!jobId || error) {
    return (
      <Shell>
        <div className={styles.stateCard}>
          <div className={`${styles.stateIcon} ${styles.fail}`}>
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <h1 className={styles.stateHeading}>{t('processing_failed')}</h1>
          <p className={styles.stateBody}>{error || 'Invalid page state.'}</p>
          <Link to="/" className={styles.btn}>{t('processing_start_over')}</Link>
        </div>
      </Shell>
    );
  }

  if (status === 'PENDING_PAYMENT') {
    return (
      <Shell>
        <div className={styles.stateCard}>
          <div className={`${styles.stateIcon} ${styles.success}`}>
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <h1 className={styles.stateHeading}>{t('processing_confirming')}</h1>
          <p className={styles.stateBody}>{t('processing_confirming_sub')}</p>
        </div>
      </Shell>
    );
  }

  if (status === 'COMPLETE') {
    return (
      <Shell>
        <div className={styles.stateCard}>
          <div className={`${styles.stateIcon} ${styles.success}`}>
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 className={styles.stateHeading}>{t('processing_done')}</h1>
          <p className={styles.stateBody}>
            Check your inbox. The PDF is waiting for you. If it's not there, check your spam. It happens to the best of us.
          </p>
          <Link to="/" className={styles.btn}>{t('success_another')}</Link>
        </div>
      </Shell>
    );
  }

  if (status === 'FAILED') {
    return (
      <Shell>
        <div className={styles.stateCard}>
          <div className={`${styles.stateIcon} ${styles.fail}`}>
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <h1 className={styles.stateHeading}>{t('processing_failed')}</h1>
          <p className={styles.stateBody}>{t('processing_failed_sub')}</p>
          <Link to="/" className={styles.btn}>{t('processing_start_over')}</Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className={styles.processingCard}>
        <div className={styles.spinnerWrap}>
          <div className={styles.spinner} />
          <div className={styles.spinnerInner} />
        </div>

        <h1 className={styles.processingHeading}>Reading every line. Judging accordingly.</h1>
        <p className={styles.processingBody}>
          Comparing your resume against the job description word by word,
          scoring keywords, experience fit, and every gap the ATS would catch.
          About 15–25 seconds.
        </p>

        <div className={styles.steps}>
          {STEPS.map((step, i) => {
            const stepNum = i + 1;
            const isDone = stepNum < activeStep;
            const isActive = stepNum === activeStep;
            return (
              <div
                key={step.label}
                className={`${styles.step} ${isDone ? styles.stepDone : ''} ${isActive ? styles.stepActive : ''}`}
              >
                <div className={styles.stepIndicator}>
                  {isDone ? (
                    <svg viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="8" fill="currentColor"/>
                      <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span>{stepNum}</span>
                  )}
                </div>
                <div className={styles.stepText}>
                  <div className={styles.stepLabel}>{step.label}</div>
                  {isActive && <div className={styles.stepSubtitle}>{step.subtitle}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>short<span className={styles.logoAccent}>listed</span></Link>
        <LangSwitcher className={styles.langSwitcher} />
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
