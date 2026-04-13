import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { trackPreviewViewed, trackTierSelected, trackCheckoutStarted } from '../lib/analytics.js';
import styles from './PreviewView.module.css';

function ScoreRing({ score, label }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = score >= 75 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626';

  return (
    <div className={styles.scoreRing}>
      <svg viewBox="0 0 120 120" className={styles.ringsvg}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className={styles.ringInner}>
        <span className={styles.ringScore} style={{ color }}>{score}</span>
        <span className={styles.ringLabel}>{label}</span>
      </div>
    </div>
  );
}

function BlurredBadge({ text }) {
  return (
    <span className={styles.blurredBadge}>
      <span className={styles.blurredText}>{text}</span>
      <svg className={styles.lockIcon} viewBox="0 0 16 16" fill="none">
        <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </span>
  );
}

export default function PreviewView() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const jobId = params.get('jobId');
  const [preview, setPreview] = useState(null);
  const [tier, setTier] = useState('FULL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState('FULL');
  const [step, setStep] = useState('preview'); // 'preview' | 'personalise'
  const [clContext, setClContext] = useState({ companyWhy: '', topAchievement: '', uniqueAngle: '' });
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!jobId) { setError('Missing job ID.'); return; }

    fetch(`/api/jobs/${jobId}/status`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status !== 'PREVIEW_READY' && data.status !== 'PENDING_PAYMENT') {
          navigate(`/processing?jobId=${jobId}`);
          return;
        }
        setPreview(data.preview);
        setTier(data.tier);
        setSelectedTier(data.tier);
        trackPreviewViewed({ ats_score: data.preview?.ats_score, tier: data.tier });
      })
      .catch(() => setError('Could not load your preview.'));
  }, [jobId, navigate]);

  const handleUnlock = async () => {
    if (!email || !email.includes('@')) {
      setError('Enter your email so we can send the report.');
      return;
    }

    // For FULL tier, show personalisation step first
    if (selectedTier === 'FULL' && step === 'preview') {
      setStep('personalise');
      return;
    }

    setLoading(true);
    setError('');
    trackCheckoutStarted({ tier: selectedTier, price: selectedTier === 'FULL' ? 29 : 12 });
    try {
      const coverLetterContext = selectedTier === 'FULL'
        ? { companyWhy: clContext.companyWhy || null, topAchievement: clContext.topAchievement || null, uniqueAngle: clContext.uniqueAngle || null }
        : null;

      const res = await fetch(`/api/jobs/${jobId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedTier, coverLetterContext, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        navigate(`/processing?jobId=${jobId}`);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Shell>
        <div className={styles.errorCard}>
          <p>{error}</p>
          <Link to="/" className={styles.retryLink}>Start over</Link>
        </div>
      </Shell>
    );
  }

  if (!preview) {
    return (
      <Shell>
        <div className={styles.loading}>Loading your results…</div>
      </Shell>
    );
  }

  const price = selectedTier === 'FULL' ? '$29' : '$12';
  const tierLabel = selectedTier === 'FULL' ? 'The Glow-Up' : 'The Audit';
  const scoreVerdict =
    preview.ats_score >= 75
      ? 'Strong resume. A few tweaks will make it airtight.'
      : preview.ats_score >= 50
      ? 'Room for improvement. Keyword gaps are costing you callbacks.'
      : "The bots are filtering you out before a human ever sees this.";

  const placeholderGaps = Array(Math.max(0, preview.gap_count - preview.keyword_gaps_teaser.length))
    .fill(null)
    .map((_, i) => `keyword_${i}`);

  return (
    <Shell>
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerPill}>Your free score</div>
          <h1 className={styles.heading}>
            {preview.ats_score >= 75
              ? <>You're in the top tier.<br /><span className={styles.headingAccent}>Now let's make it airtight.</span></>
              : preview.ats_score >= 50
              ? <>You're close.<br /><span className={styles.headingAccent}>The gaps are fixable.</span></>
              : <>The bots filtered you out.<br /><span className={styles.headingAccent}>Here's the full damage report.</span></>
            }
          </h1>
          <p className={styles.verdict}>{scoreVerdict}</p>
        </div>

        {/* Score rings */}
        <div className={styles.scores}>
          <ScoreRing score={preview.ats_score} label="ATS Score" />
          {preview.human_score != null && <ScoreRing score={preview.human_score} label="Human Readability" />}
          <ScoreRing score={preview.experience_match} label="Experience Match" />
        </div>

        {/* Keyword gaps — 2 visible, rest blurred */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Keyword Gaps</h2>
            <span className={styles.sectionCount}>{preview.gap_count} found</span>
          </div>
          <p className={styles.sectionNote}>
            These are the exact keywords the ATS is looking for that aren't in your resume.
          </p>
          <div className={styles.tagGrid}>
            {preview.keyword_gaps_teaser.map((gap) => (
              <span key={gap} className={styles.gapTag}>{gap}</span>
            ))}
            {placeholderGaps.map((key) => (
              <BlurredBadge key={key} text="keyword" />
            ))}
          </div>
        </div>

        {/* Locked sections */}
        <div className={styles.lockedGrid}>
          <div className={styles.lockedCard}>
            <div className={styles.lockedHeader}>
              <span className={styles.lockedTitle}>Keyword Matches</span>
              <span className={styles.lockedCount}>{preview.match_count}</span>
            </div>
            <div className={styles.lockedBlur}>
              {Array(Math.min(preview.match_count, 5)).fill(null).map((_, i) => (
                <BlurredBadge key={i} text="match_keyword" />
              ))}
            </div>
          </div>

          <div className={styles.lockedCard}>
            <div className={styles.lockedHeader}>
              <span className={styles.lockedTitle}>Strengths</span>
              <span className={styles.lockedCount}>{preview.strengths_count}</span>
            </div>
            <div className={styles.lockedLines}>
              {Array(preview.strengths_count).fill(null).map((_, i) => (
                <div key={i} className={styles.lockedLine} style={{ width: `${70 + (i * 13) % 30}%` }} />
              ))}
            </div>
          </div>

          <div className={styles.lockedCard}>
            <div className={styles.lockedHeader}>
              <span className={styles.lockedTitle}>Weaknesses</span>
              <span className={styles.lockedCount}>{preview.weaknesses_count}</span>
            </div>
            <div className={styles.lockedLines}>
              {Array(preview.weaknesses_count).fill(null).map((_, i) => (
                <div key={i} className={styles.lockedLine} style={{ width: `${65 + (i * 11) % 30}%` }} />
              ))}
            </div>
          </div>

          <div className={styles.lockedCard}>
            <div className={styles.lockedHeader}>
              <span className={styles.lockedTitle}>LinkedIn Headline</span>
            </div>
            <div className={styles.lockedLines}>
              <div className={styles.lockedLine} style={{ width: '90%' }} />
            </div>
          </div>
        </div>

        {/* Tier picker + CTA */}
        <div className={styles.paywall}>
          <div className={styles.paywallInner}>
            <h2 className={styles.paywallHeading}>
              {preview.gap_count} keyword {preview.gap_count === 1 ? 'gap' : 'gaps'} found.
              Here's the full picture.
            </h2>
            <p className={styles.paywallSub}>
              Every gap, every match, every fix. Delivered as a PDF in about 60 seconds.
              Apply to the same role tomorrow with a resume that actually passes.
            </p>

            {step === 'preview' && (
              <>
                <div className={styles.tierPicker}>
                  <button
                    type="button"
                    className={`${styles.tierOption} ${selectedTier === 'BASIC' ? styles.tierSelected : ''}`}
                    onClick={() => { setSelectedTier('BASIC'); trackTierSelected({ tier: 'BASIC' }); }}
                  >
                    <div className={styles.tierName}>The Audit</div>
                    <div className={styles.tierDesc}>All {preview.gap_count} gaps · JD red flags · salary range · LinkedIn headline</div>
                    <div className={styles.tierPrice}>$12</div>
                  </button>
                  <button
                    type="button"
                    className={`${styles.tierOption} ${selectedTier === 'FULL' ? styles.tierSelected : ''}`}
                    onClick={() => { setSelectedTier('FULL'); trackTierSelected({ tier: 'FULL' }); }}
                  >
                    <div className={styles.tierBadge}>Best value</div>
                    <div className={styles.tierName}>The Glow-Up</div>
                    <div className={styles.tierDesc}>Everything + AI bullet rewrites · cover letter · 8 interview questions with STAR answers</div>
                    <div className={styles.tierPrice}>$29</div>
                  </button>
                </div>

                <div className={styles.emailCapture}>
                  <label htmlFor="report-email" className={styles.emailLabel}>
                    Where should we send your report?
                  </label>
                  <input
                    id="report-email"
                    type="email"
                    className={styles.emailInput}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                {error && <p className={styles.errorMsg}>{error}</p>}

                <button className={styles.unlockBtn} onClick={handleUnlock} disabled={loading}>
                  {loading ? 'Redirecting…' : `Unlock ${tierLabel} for ${price}`}
                </button>
                <p className={styles.paywallNote}>
                  One-time · No account · PDF link valid 72h · <a href="mailto:hello@getshortlisted.fyi" className={styles.paywallContact}>hello@getshortlisted.fyi</a> for refunds
                  {' · '}<Link to="/terms" className={styles.paywallContact}>Terms</Link>
                  {' · '}<Link to="/privacy" className={styles.paywallContact}>Privacy</Link>
                </p>
              </>
            )}

            {step === 'personalise' && (
              <>
                <div className={styles.personaliseHeader}>
                  <p className={styles.personaliseTitle}>Make your cover letter sound like <em>you</em></p>
                  <p className={styles.personaliseNote}>3 quick questions. All optional. Skip any you'd rather leave out. Your answers make the difference between AI-sounding and actually compelling.</p>
                </div>
                <div className={styles.personaliseForm}>
                  <label className={styles.personaliseLabel}>
                    What's one specific thing about this company or role that made you apply?
                    <textarea
                      className={styles.personaliseInput}
                      rows={2}
                      placeholder="e.g. Their engineering blog on distributed systems, or the focus on developer tooling"
                      value={clContext.companyWhy}
                      onChange={(e) => setClContext((c) => ({ ...c, companyWhy: e.target.value }))}
                    />
                  </label>
                  <label className={styles.personaliseLabel}>
                    What's the one achievement from your career most relevant to this role?
                    <textarea
                      className={styles.personaliseInput}
                      rows={2}
                      placeholder="e.g. Cut API latency by 80% by rewriting the query layer. Went from 600ms to 95ms"
                      value={clContext.topAchievement}
                      onChange={(e) => setClContext((c) => ({ ...c, topAchievement: e.target.value }))}
                    />
                  </label>
                  <label className={styles.personaliseLabel}>
                    Anything non-obvious about your background that's relevant here?
                    <textarea
                      className={styles.personaliseInput}
                      rows={2}
                      placeholder="e.g. I ran a 3-person freelance agency before joining my current company, so I've done every part of the stack"
                      value={clContext.uniqueAngle}
                      onChange={(e) => setClContext((c) => ({ ...c, uniqueAngle: e.target.value }))}
                    />
                  </label>
                </div>

                {error && <p className={styles.errorMsg}>{error}</p>}

                <button className={styles.unlockBtn} onClick={handleUnlock} disabled={loading}>
                  {loading ? 'Redirecting…' : 'Continue to checkout for $29'}
                </button>
                <p className={styles.paywallNote}>Sending to {email} · One-time · PDF link valid 72h · <a href="mailto:hello@getshortlisted.fyi" className={styles.paywallContact}>hello@getshortlisted.fyi</a> for refunds</p>
              </>
            )}
          </div>
        </div>

      </div>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className={styles.shell}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>short<span className={styles.logoAccent}>listed</span></Link>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
