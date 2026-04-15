import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProcessingView.module.css';

export default function RedownloadView() {
  const [jobId, setJobId] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!jobId.trim() || !email.trim()) {
      setError('Both Job ID and email are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId.trim()}/download?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not find your report. Check your Job ID and email.');
        return;
      }
      setResult(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>short<span>listed</span></Link>
      </nav>
      <main className={styles.main}>
        <div className={styles.stateCard}>
          <h1 className={styles.stateHeading}>Re-download your report</h1>
          <p className={styles.stateBody} style={{ marginBottom: '24px' }}>
            Enter the Job ID from your confirmation email and the email address you used at checkout.
          </p>

          {!result ? (
            <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Job ID (e.g. cmo0lfede00071mwc...)"
                value={jobId}
                onChange={e => setJobId(e.target.value)}
                style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', fontFamily: 'monospace' }}
                required
              />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px' }}
                required
              />
              {error && <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className={styles.btn}
              >
                {loading ? 'Looking up...' : 'Get download links'}
              </button>
            </form>
          ) : (
            <>
              <p className={styles.stateBody}>Fresh links generated. Valid for 72 hours.</p>
              <a href={result.reportUrl} className={styles.btn} download>Download Analysis Report</a>
              {result.cvUrl && (
                <a href={result.cvUrl} className={styles.btn} download style={{ marginTop: '12px' }}>Download Tailored CV</a>
              )}
              <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '16px' }}>
                Link not working? <a href="mailto:hello@getshortlisted.fyi" style={{ color: '#e85d04' }}>Email us</a>.
              </p>
            </>
          )}

          <Link to="/" style={{ marginTop: '24px', fontSize: '13px', color: '#6b7280' }}>← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
