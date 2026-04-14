import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { trackPreviewViewed, trackTierSelected, trackCheckoutStarted } from '../lib/analytics.js';
import { useT, LangSwitcher } from '../lib/i18n.jsx';
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
  const { t } = useT();
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
      ? t('preview_verdict_high')
      : preview.ats_score >= 50
      ? t('preview_verdict_mid')
      : t('preview_verdict_low');

  const placeholderGaps = Array(Math.max(0, preview.gap_count - preview.keyword_gaps_teaser.length))
    .fill(null)
    .map((_, i) => `keyword_${i}`);

  return (
    <Shell>
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerPill}>{t('preview_score_header')}</div>
          <h1 className={styles.heading}>
            {preview.ats_score >= 75
              ? <>{t('preview_heading_high')}<br /><span className={styles.headingAccent}>{t('preview_heading_high_accent')}</span></>
              : preview.ats_score >= 50
              ? <>{t('preview_heading_mid')}<br /><span className={styles.headingAccent}>{t('preview_heading_mid_accent')}</span></>
              : <>{t('preview_heading_low')}<br /><span className={styles.headingAccent}>{t('preview_heading_low_accent')}</span></>
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
            <h2 className={styles.sectionTitle}>{t('preview_section_gaps')}</h2>
            <span className={styles.sectionCount}>{preview.gap_count} {t('preview_gap_found')}</span>
          </div>
          <p className={styles.sectionNote}>{t('preview_section_gaps_note')}</p>
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
              <span className={styles.lockedTitle}>{t('preview_section_matches')}</span>
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
              <span className={styles.lockedTitle}>{t('preview_section_strengths')}</span>
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
              <span className={styles.lockedTitle}>{t('preview_section_weaknesses')}</span>
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
              <span className={styles.lockedTitle}>{t('preview_section_linkedin')}</span>
            </div>
            <div className={styles.lockedLines}>
              <div className={styles.lockedLine} style={{ width: '90%' }} />
            </div>
          </div>
        </div>

        {/* Rewrite teaser — shows outcome before asking to pay */}
        <div className={styles.rewriteTeaser}>
          <div className={styles.rewriteTeaserHeader}>
            <span className={styles.rewriteTeaserBadge}>{t('teaser_badge')}</span>
            <h3 className={styles.rewriteTeaserTitle}>{t('teaser_title')}</h3>
            <p className={styles.rewriteTeaserSub}>{t('teaser_sub')}</p>
          </div>
          <div className={styles.rewriteComparison}>
            <div className={styles.rewriteCol}>
              <p className={styles.rewriteColLabel}>{t('teaser_before')}</p>
              <div className={styles.rewriteBullet} style={{ opacity: 0.6 }}>
                <span className={styles.bulletDot} />
                <span>{t('teaser_before_bullet')}</span>
              </div>
            </div>
            <div className={styles.rewriteArrow}>
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.rewriteCol}>
              <p className={styles.rewriteColLabel} style={{ color: 'var(--accent)' }}>{t('teaser_after')}</p>
              <div className={`${styles.rewriteBullet} ${styles.rewriteBulletBlur}`}>
                <span className={styles.bulletDot} style={{ background: 'var(--accent)' }} />
                <span>{t('teaser_after_bullet')}</span>
              </div>
            </div>
          </div>
          <p className={styles.rewriteTeaserNote}>{t('teaser_note')}</p>
        </div>

        {/* Tier picker + CTA */}
        <div className={styles.paywall}>
          <div className={styles.urgencyStrip}>
            {t('preview_urgency')}
          </div>
          <div className={styles.paywallInner}>
            <h2 className={styles.paywallHeading}>
              {preview.gap_count} {t('preview_paywall_heading_suffix')}
            </h2>
            <p className={styles.paywallSub}>{t('preview_paywall_sub')}</p>

            {step === 'preview' && (
              <>
                <div className={styles.tierPicker}>
                  <button
                    type="button"
                    className={`${styles.tierOption} ${selectedTier === 'BASIC' ? styles.tierSelected : ''}`}
                    onClick={() => { setSelectedTier('BASIC'); trackTierSelected({ tier: 'BASIC' }); }}
                  >
                    <div className={styles.tierName}>{t('tier_basic_name')}</div>
                    <div className={styles.tierDesc}>All {preview.gap_count} gaps · JD red flags · salary range · LinkedIn headline</div>
                    <div className={styles.tierPrice}>$12</div>
                  </button>
                  <button
                    type="button"
                    className={`${styles.tierOption} ${selectedTier === 'FULL' ? styles.tierSelected : ''}`}
                    onClick={() => { setSelectedTier('FULL'); trackTierSelected({ tier: 'FULL' }); }}
                  >
                    <div className={styles.tierBadge}>{t('preview_tier_badge')}</div>
                    <div className={styles.tierName}>{t('tier_full_name')}</div>
                    <div className={styles.tierDesc}>Everything + AI bullet rewrites · cover letter · 8 interview questions with STAR answers</div>
                    <div className={styles.tierPrice}>$29</div>
                  </button>
                </div>

                <div className={styles.emailCapture}>
                  <label htmlFor="report-email" className={styles.emailLabel}>
                    {t('preview_email_label')}
                  </label>
                  <input
                    id="report-email"
                    type="email"
                    className={styles.emailInput}
                    placeholder={t('preview_email_placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                {error && <p className={styles.errorMsg}>{error}</p>}

                <button className={styles.unlockBtn} onClick={handleUnlock} disabled={loading}>
                  {loading ? t('preview_redirecting') : `${t('preview_unlock_btn')} ${tierLabel} ${t('preview_unlock_for')} ${price}`}
                </button>
                <p className={styles.paywallNote}>
                  {t('preview_paywall_note')} <a href="mailto:hello@getshortlisted.fyi" className={styles.paywallContact}>{t('preview_refunds')}</a>
                  {' · '}<Link to="/terms" className={styles.paywallContact}>Terms</Link>
                  {' · '}<Link to="/privacy" className={styles.paywallContact}>Privacy</Link>
                </p>
              </>
            )}

            {step === 'personalise' && (
              <>
                <div className={styles.personaliseHeader}>
                  <p className={styles.personaliseTitle}>{t('preview_personalise_title')} <em>{t('preview_personalise_you')}</em></p>
                  <p className={styles.personaliseNote}>{t('preview_personalise_note')}</p>
                </div>
                <div className={styles.personaliseForm}>
                  <label className={styles.personaliseLabel}>
                    {t('preview_cl_q1')}
                    <textarea
                      className={styles.personaliseInput}
                      rows={2}
                      placeholder={t('preview_cl_q1_ph')}
                      value={clContext.companyWhy}
                      onChange={(e) => setClContext((c) => ({ ...c, companyWhy: e.target.value }))}
                    />
                  </label>
                  <label className={styles.personaliseLabel}>
                    {t('preview_cl_q2')}
                    <textarea
                      className={styles.personaliseInput}
                      rows={2}
                      placeholder={t('preview_cl_q2_ph')}
                      value={clContext.topAchievement}
                      onChange={(e) => setClContext((c) => ({ ...c, topAchievement: e.target.value }))}
                    />
                  </label>
                  <label className={styles.personaliseLabel}>
                    {t('preview_cl_q3')}
                    <textarea
                      className={styles.personaliseInput}
                      rows={2}
                      placeholder={t('preview_cl_q3_ph')}
                      value={clContext.uniqueAngle}
                      onChange={(e) => setClContext((c) => ({ ...c, uniqueAngle: e.target.value }))}
                    />
                  </label>
                </div>

                {error && <p className={styles.errorMsg}>{error}</p>}

                <button className={styles.unlockBtn} onClick={handleUnlock} disabled={loading}>
                  {loading ? t('preview_redirecting') : t('preview_continue_checkout')}
                </button>
                <p className={styles.paywallNote}>{t('preview_sending_to')} {email} · {t('preview_paywall_note')} <a href="mailto:hello@getshortlisted.fyi" className={styles.paywallContact}>{t('preview_refunds')}</a></p>
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
        <LangSwitcher className={styles.langSwitcher} />
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
