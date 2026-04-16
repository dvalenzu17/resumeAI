import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useT, LangSwitcher } from '../lib/i18n.jsx';
import styles from './ProcessingView.module.css';

const POLL_INTERVAL = 3000;

export default function ProcessingView() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const jobId = params.get('jobId');
  const [status, setStatus] = useState('ANALYZING');
  const [tier, setTier] = useState(null);
  const [reportUrl, setReportUrl] = useState(null);
  const [cvUrl, setCvUrl] = useState(null);
  const [error, setError] = useState('');
  const [teaserStep, setTeaserStep] = useState(1);
  const [fullStep, setFullStep] = useState(1);
  const fullStepStarted = useRef(false);
  const { t } = useT();

  // Teaser step progression (~15-25s total)
  useEffect(() => {
    const timers = [
      setTimeout(() => setTeaserStep(s => Math.max(s, 2)), 3000),
      setTimeout(() => setTeaserStep(s => Math.max(s, 3)), 12000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Full report step progression — starts when PROCESSING is detected
  useEffect(() => {
    if (status !== 'PROCESSING') return;
    if (fullStepStarted.current) return;
    fullStepStarted.current = true;
    const timers = [
      setTimeout(() => setFullStep(s => Math.max(s, 2)), 25000),
      setTimeout(() => setFullStep(s => Math.max(s, 3)), 55000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [status]);

  // Poll for status
  useEffect(() => {
    if (!jobId) { setError('Missing job ID.'); return; }
    let stopped = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}/status`);
        if (!res.ok) {
          if (res.status >= 400 && res.status < 500 && res.status !== 429) {
            setError('Could not retrieve status.');
            return;
          }
          if (!stopped) setTimeout(poll, POLL_INTERVAL);
          return;
        }
        const data = await res.json();
        if (stopped) return;
        setStatus(data.status);
        if (data.tier) setTier(data.tier);
        if (data.status === 'COMPLETE') {
          if (data.reportUrl) setReportUrl(data.reportUrl);
          if (data.cvUrl) setCvUrl(data.cvUrl);
        }
        if (data.status === 'PREVIEW_READY') {
          setTeaserStep(3);
          setTimeout(() => navigate(`/preview?jobId=${jobId}`), 600);
          return;
        }
        if (data.status === 'FAILED') return;
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

  if (status === 'COMPLETE') {
    const isFull = tier === 'FULL';
    return (
      <Shell>
        <div className={styles.stateCard}>
          <div className={`${styles.stateIcon} ${styles.success}`}>
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 className={styles.stateHeading}>{t('processing_done')}</h1>
          {reportUrl ? (
            <>
              <p className={styles.stateBody}>
                {isFull
                  ? 'Your analysis report and tailored CV are ready. Download them below. Links expire in 72 hours.'
                  : 'Your report is ready. Download it below. The link expires in 72 hours.'}
              </p>
              <a href={reportUrl} className={styles.btn} download>Download Analysis Report</a>
              {cvUrl && <a href={cvUrl} className={styles.btn} download style={{ marginTop: '12px' }}>Download Tailored CV</a>}
              <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-subtle)' }}>A copy has also been sent to your email.</p>
            </>
          ) : (
            <p className={styles.stateBody}>Check your inbox. The PDF is waiting for you. If it's not there, check your spam.</p>
          )}
          <Link to="/" className={styles.btn} style={{ marginTop: '16px' }}>{t('success_another')}</Link>
        </div>
      </Shell>
    );
  }

  if (status === 'PENDING_PAYMENT') {
    return (
      <Shell>
        <div className={styles.processingCard}>
          <div className={styles.spinnerWrap}>
            <div className={styles.spinner} />
            <div className={styles.spinnerInner} />
          </div>
          <h1 className={styles.processingHeading}>Payment received</h1>
          <p className={styles.processingBody}>Confirming your order. This usually takes under 30 seconds. Please keep this page open.</p>
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
          <p className={styles.stateBody} style={{ marginTop: '8px', fontSize: '14px' }}>
            A refund email is on its way. If you don't see it in 10 minutes, reply to your confirmation email or contact{' '}
            <a href="mailto:hello@getshortlisted.fyi" style={{ color: 'var(--accent)' }}>hello@getshortlisted.fyi</a>.
          </p>
          <Link to="/" className={styles.btn} style={{ marginTop: '20px' }}>{t('processing_start_over')}</Link>
        </div>
      </Shell>
    );
  }

  const isFullReport = status === 'PROCESSING';

  const teaserSteps = [
    { labelKey: 'processing_step1_label', subKey: 'processing_step1_sub' },
    { labelKey: 'processing_step2_label', subKey: 'processing_step2_sub' },
    { labelKey: 'processing_step3_label', subKey: 'processing_step3_sub' },
  ];

  const fullSteps = [
    { labelKey: 'processing_full_step1_label', subKey: 'processing_full_step1_sub' },
    { labelKey: 'processing_full_step2_label', subKey: 'processing_full_step2_sub' },
    { labelKey: 'processing_full_step3_label', subKey: 'processing_full_step3_sub' },
  ];

  const steps = isFullReport ? fullSteps : teaserSteps;
  const activeStep = isFullReport ? fullStep : teaserStep;

  return (
    <Shell>
      <div className={styles.processingCard}>
        <div className={styles.spinnerWrap}>
          <div className={styles.spinner} />
          <div className={styles.spinnerInner} />
        </div>

        <h1 className={styles.processingHeading}>
          {isFullReport ? t('processing_full_heading') : t('processing_teaser_heading')}
        </h1>
        <p className={styles.processingBody}>
          {isFullReport ? t('processing_full_body') : t('processing_teaser_body')}
        </p>

        <div className={styles.steps}>
          {steps.map((step, i) => {
            const stepNum = i + 1;
            const isDone = stepNum < activeStep;
            const isActive = stepNum === activeStep;
            return (
              <div
                key={step.labelKey}
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
                  <div className={styles.stepLabel}>{t(step.labelKey)}</div>
                  {isActive && <div className={styles.stepSubtitle}>{t(step.subKey)}</div>}
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
