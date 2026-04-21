import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { trackPreviewViewed, trackTierSelected, trackCheckoutStarted, trackPurchaseComplete } from '../lib/analytics.js';
import { track, trackOnce } from '../lib/tracker.js';
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

// Loads the PayPal JS SDK script and resolves when ready.
function loadPayPalSDK(clientId) {
  return new Promise((resolve, reject) => {
    if (window.paypal) { resolve(); return; }
    const existing = document.getElementById('paypal-sdk');
    if (existing) { existing.addEventListener('load', resolve); return; }
    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&disable-funding=venmo,paylater&intent=capture`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
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
  const [email, setEmail] = useState('');
  // 'idle' | 'preparing' | 'ready' — controls whether PayPal buttons are shown
  const [checkoutStep, setCheckoutStep] = useState('idle');
  const [orderId, setOrderId] = useState(null);
  const paywallRef = useRef(null);
  const tierTrackedRef = useRef(false);
  const previewLoadedAt = useRef(null);
  const paypalRendered = useRef(false);

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
        if (data.email) setEmail(data.email);
        trackPreviewViewed({ shortlist_match_rate: data.preview?.shortlist_match_rate, tier: data.tier });
        previewLoadedAt.current = Date.now();
        track('preview_loaded', { shortlist_match_rate: data.preview?.shortlist_match_rate, gap_count: data.preview?.gap_count }, jobId);
      })
      .catch(() => setError('Could not load your preview.'));
  }, [jobId, navigate]);

  useEffect(() => {
    if (!preview || !paywallRef.current) return;
    return trackOnce(paywallRef.current, 'scroll_to_paywall', { shortlist_match_rate: preview.shortlist_match_rate }, jobId);
  }, [preview, jobId]);

  useEffect(() => {
    if (!tierTrackedRef.current) { tierTrackedRef.current = true; return; }
    track('tier_switched', { tier: selectedTier }, jobId);
  }, [selectedTier]);

  const handleUnlock = async () => {
    const timeToDecisionMs = previewLoadedAt.current ? Date.now() - previewLoadedAt.current : null;
    track('checkout_clicked', { tier: selectedTier, price: selectedTier === 'FULL' ? 29 : 12, timeToDecisionMs }, jobId);
    if (!email || !email.includes('@')) {
      setError('Enter your email so we can send the report.');
      return;
    }

    setLoading(true);
    setError('');
    trackCheckoutStarted({ tier: selectedTier, price: selectedTier === 'FULL' ? 29 : 12 });

    try {
      const res = await fetch(`/api/jobs/${jobId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedTier, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');

      // SKIP_PAYMENT mode (dev/test) — no PayPal needed
      if (!data.orderId) {
        navigate(`/processing?jobId=${jobId}`);
        return;
      }

      await loadPayPalSDK(data.clientId);
      paypalRendered.current = false;
      setOrderId(data.orderId);
      setCheckoutStep('ready');
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Render PayPal Buttons once order is ready and SDK is loaded
  useEffect(() => {
    if (checkoutStep !== 'ready' || !orderId || paypalRendered.current) return;
    if (!window.paypal) return;
    paypalRendered.current = true;

    window.paypal.Buttons({
      createOrder: () => orderId,
      onApprove: async (data) => {
        setLoading(true);
        setError('');
        try {
          const res = await fetch(`/api/jobs/${jobId}/capture`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: data.orderID }),
          });
          if (!res.ok) {
            const d = await res.json().catch(() => ({}));
            throw new Error(d.error || 'Capture failed');
          }
          trackPurchaseComplete({ tier: selectedTier, price: selectedTier === 'FULL' ? 29 : 12 });
          navigate(`/success?jobId=${jobId}&tier=${selectedTier}`);
        } catch (err) {
          setError(`Payment received but we had a technical error. Email hello@getshortlisted.fyi with Job ID: ${jobId}`);
          setLoading(false);
        }
      },
      onCancel: () => {
        setCheckoutStep('idle');
        setOrderId(null);
        paypalRendered.current = false;
      },
      onError: () => {
        setError('Payment failed. Please try again.');
        setCheckoutStep('idle');
        setOrderId(null);
        paypalRendered.current = false;
      },
      style: { layout: 'vertical', shape: 'rect', label: 'pay' },
    }).render('#paypal-buttons');
  }, [checkoutStep, orderId]);

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
    preview.shortlist_match_rate >= 75
      ? t('preview_verdict_high')
      : preview.shortlist_match_rate >= 50
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
            {preview.shortlist_match_rate >= 75
              ? <>{t('preview_heading_high')}<br /><span className={styles.headingAccent}>{t('preview_heading_high_accent')}</span></>
              : preview.shortlist_match_rate >= 50
              ? <>{t('preview_heading_mid')}<br /><span className={styles.headingAccent}>{t('preview_heading_mid_accent')}</span></>
              : <>{t('preview_heading_low')}<br /><span className={styles.headingAccent}>{t('preview_heading_low_accent')}</span></>
            }
          </h1>
          <p className={styles.verdict}>{scoreVerdict}</p>
        </div>

        {/* Score rings */}
        <div className={styles.scores}>
          <ScoreRing score={preview.shortlist_match_rate} label="Shortlist Match Rate" />
          {preview.human_score != null && <ScoreRing score={preview.human_score} label="Human Readability" />}
          <ScoreRing score={preview.experience_match} label="Experience Match" />
        </div>

        {/* Score breakdown — weakest component callout */}
        {preview.score_breakdown && (() => {
          const bd = preview.score_breakdown;
          const components = [
            { label: 'Hard Skills Match', val: bd.hard_skill_score, max: 35 },
            { label: 'Job Title Alignment', val: bd.job_title_score, max: 20 },
            { label: 'Resume Parseability', val: bd.parseability_score, max: 15 },
            { label: 'Section Completeness', val: bd.section_completeness_score, max: 15 },
            { label: 'Soft Skills Match', val: bd.soft_skill_score, max: 10 },
            { label: 'Experience Match', val: bd.experience_score, max: 5 },
          ];
          const weakest = components.reduce((a, b) => (a.val / a.max < b.val / b.max ? a : b));
          return (
            <div className={styles.breakdownCallout}>
              {components.map(c => (
                <div key={c.label} className={styles.breakdownRow}>
                  <span className={styles.breakdownLabel}>{c.label}</span>
                  <div className={styles.breakdownBarWrap}>
                    <div
                      className={styles.breakdownBarFill}
                      style={{
                        width: `${Math.round((c.val / c.max) * 100)}%`,
                        background: c.val / c.max >= 0.7 ? '#16a34a' : c.val / c.max >= 0.4 ? '#d97706' : '#dc2626',
                      }}
                    />
                  </div>
                  <span className={styles.breakdownVal}>{c.val}<span className={styles.breakdownMax}>/{c.max}</span></span>
                </div>
              ))}
              <p className={styles.breakdownHint}>Biggest gap: <strong>{weakest.label}</strong> ({weakest.val}/{weakest.max})</p>
            </div>
          );
        })()}

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
                <span>{preview.sample_weak_bullet || t('teaser_before_bullet')}</span>
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
        <div className={styles.paywall} ref={paywallRef}>
          <div className={styles.urgencyStrip}>
            {t('preview_urgency')}
          </div>
          <div className={styles.paywallInner}>
            <h2 className={styles.paywallHeading}>
              {preview.gap_count} {t('preview_paywall_heading_suffix')}
            </h2>
            <p className={styles.paywallSub}>{t('preview_paywall_sub')}</p>

            {checkoutStep === 'idle' && (
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
                    <div className={styles.tierDesc}>Everything + tailored CV ready to submit · cover letter · 8 interview questions with STAR answers</div>
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
                  {loading ? 'Preparing checkout...' : `${t('preview_unlock_btn')} ${tierLabel} ${t('preview_unlock_for')} ${price}`}
                </button>
                <p className={styles.guarantee}>
                  Not happy with the report? Full refund, no questions. Email us.
                </p>
                <p className={styles.paywallNote}>
                  {t('preview_paywall_note')} <a href="mailto:hello@getshortlisted.fyi" className={styles.paywallContact}>{t('preview_refunds')}</a>
                  {' · '}<Link to="/terms" className={styles.paywallContact}>Terms</Link>
                  {' · '}<Link to="/privacy" className={styles.paywallContact}>Privacy</Link>
                </p>
              </>
            )}

            {checkoutStep === 'ready' && (
              <>
                <p style={{ textAlign: 'center', fontSize: '14px', color: '#9ca3af', marginBottom: '12px' }}>
                  Paying {price} for {tierLabel}. Choose your payment method:
                </p>
                {error && <p className={styles.errorMsg}>{error}</p>}
                <div id="paypal-buttons" style={{ maxWidth: '400px', margin: '0 auto' }} />
                <p style={{ textAlign: 'center', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => { setCheckoutStep('idle'); setOrderId(null); paypalRendered.current = false; }}
                    style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    Back
                  </button>
                </p>
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
