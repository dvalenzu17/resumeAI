import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styles from './FeedbackView.module.css';

const REASONS = [
  { value: 'wrong_salary', label: 'The salary range was off for my location or role' },
  { value: 'wrong_role', label: "The advice didn't fit my specific role or industry" },
  { value: 'confusing', label: 'The report was hard to understand or act on' },
  { value: 'other', label: 'Something else' },
];

export default function FeedbackView() {
  const [params] = useSearchParams();
  const jobId = params.get('jobId');
  const v = params.get('v'); // 'yes' | 'no'

  const [phase, setPhase] = useState(() => {
    if (v === 'yes') return 'yes_done';
    if (v === 'no') return 'no_form';
    return 'invalid';
  });

  const [selectedReason, setSelectedReason] = useState('');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // 'yes' — fire immediately, no form needed
  useEffect(() => {
    if (v === 'yes' && jobId) {
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, result: 'yes' }),
      }).catch(() => {});
    }
  }, []);

  const handleNoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReason) return;
    setSubmitting(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, result: 'no', reason: selectedReason, detail: detail.trim() || null }),
      });
    } catch { /* ignore */ }
    setPhase('no_done');
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText('https://getshortlisted.fyi').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (phase === 'invalid') return null;

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>short<span className={styles.logoAccent}>listed</span></Link>
      </nav>

      <main className={styles.main}>
        <div className={styles.card}>

          {phase === 'yes_done' && (
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
          )}

          {phase === 'no_form' && (
            <>
              <div className={`${styles.icon} ${styles.iconMuted}`}>
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h1 className={styles.heading}>What went wrong?</h1>
              <p className={styles.body}>
                Takes 10 seconds. Helps us fix the exact thing that wasn't useful.
              </p>
              <form onSubmit={handleNoSubmit} className={styles.reasonForm}>
                <div className={styles.radioGroup}>
                  {REASONS.map((r) => (
                    <label key={r.value} className={`${styles.radioLabel} ${selectedReason === r.value ? styles.radioSelected : ''}`}>
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={selectedReason === r.value}
                        onChange={() => setSelectedReason(r.value)}
                        className={styles.radioInput}
                      />
                      {r.label}
                    </label>
                  ))}
                </div>
                <textarea
                  className={styles.detailInput}
                  rows={3}
                  placeholder="Anything else to add? (optional)"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  maxLength={500}
                />
                <button
                  type="submit"
                  className={styles.btn}
                  disabled={!selectedReason || submitting}
                  style={{ width: '100%' }}
                >
                  {submitting ? 'Sending…' : 'Send feedback'}
                </button>
              </form>
            </>
          )}

          {phase === 'no_done' && (
            <>
              <div className={`${styles.icon} ${styles.iconMuted}`}>
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className={styles.heading}>Thanks for telling us.</h1>
              <p className={styles.body}>
                That's exactly how we make the next report better.
              </p>
              <p className={styles.sub}>
                If you want a refund or to talk it through, email{' '}
                <a href="mailto:hello@getshortlisted.fyi" className={styles.emailLink}>
                  hello@getshortlisted.fyi
                </a>
                .
              </p>
            </>
          )}

          <Link to="/" className={styles.homeLink}>Back to home</Link>
        </div>
      </main>
    </div>
  );
}
