import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { trackResumeSubmitted } from '../lib/analytics.js';
import { track, trackOnce, getSessionId, getUtm } from '../lib/tracker.js';
import { Reveal } from '../lib/Reveal.jsx';
import { useStats } from '../lib/useStats.js';
import { useT, LangSwitcher } from '../lib/i18n.jsx';
import styles from './UploadView.module.css';

// ─────────────────────────────────────────────
//  How It Works
// ─────────────────────────────────────────────
function HowItWorks() {
  const { t } = useT();
  const steps = [
    { n: '01', titleKey: 'step1_title', bodyKey: 'step1_body' },
    { n: '02', titleKey: 'step2_title', bodyKey: 'step2_body' },
    { n: '03', titleKey: 'step3_title', bodyKey: 'step3_body' },
  ];
  return (
    <section className={styles.howSection}>
      <div className={styles.sectionWrap}>
        <p className={styles.eyebrow}>{t('how_eyebrow')}</p>
        <h2 className={styles.sectionHeading}>{t('how_heading')}</h2>
        <div className={styles.stepsGrid}>
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className={styles.stepItem}>
                <span className={styles.stepNum}>{s.n}</span>
                <h3 className={styles.stepTitle}>{t(s.titleKey)}</h3>
                <p className={styles.stepBody}>{t(s.bodyKey)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  Results Preview (static mockup)
// ─────────────────────────────────────────────
function ResultsPreview() {
  const { t } = useT();
  return (
    <section className={styles.previewSection}>
      <div className={styles.sectionWrap}>
        <p className={styles.eyebrow}>{t('preview_eyebrow')}</p>
        <h2 className={styles.sectionHeading}>{t('preview_heading')}</h2>
        <p className={styles.previewSub}>{t('preview_sub')}</p>
        <Reveal>
        <div className={styles.mockup}>
          <div className={styles.mockupHeader}>
            <span className={styles.mockupPill}>{t('preview_free_score')}</span>
          </div>
          <div className={styles.mockupBody}>
            <div className={styles.mockupScores}>
              <div className={styles.mockupRing}>
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#dc2626" strokeWidth="10"
                    strokeDasharray="190 327" strokeLinecap="round" transform="rotate(-90 60 60)" />
                </svg>
                <div className={styles.mockupRingInner}>
                  <span className={styles.mockupScore} style={{ color: '#dc2626' }}>58</span>
                  <span className={styles.mockupScoreLabel}>ATS Score</span>
                </div>
              </div>
              <div className={styles.mockupRing}>
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#059669" strokeWidth="10"
                    strokeDasharray="252 327" strokeLinecap="round" transform="rotate(-90 60 60)" />
                </svg>
                <div className={styles.mockupRingInner}>
                  <span className={styles.mockupScore} style={{ color: '#059669' }}>77</span>
                  <span className={styles.mockupScoreLabel}>Experience</span>
                </div>
              </div>
            </div>

            <div className={styles.mockupGaps}>
              <div className={styles.mockupGapsHeader}>
                <span className={styles.mockupGapsTitle}>{t('preview_keyword_gaps')}</span>
                <span className={styles.mockupGapsCount}>{t('preview_gaps_found')}</span>
              </div>
              <div className={styles.mockupTags}>
                <span className={styles.mockupTag}>cross-functional collaboration</span>
                <span className={styles.mockupTag}>stakeholder management</span>
                <span className={`${styles.mockupTag} ${styles.mockupTagBlur}`}>••••••••••••</span>
                <span className={`${styles.mockupTag} ${styles.mockupTagBlur}`}>••••••••</span>
                <span className={`${styles.mockupTag} ${styles.mockupTagBlur}`}>••••••••••</span>
                <span className={`${styles.mockupTag} ${styles.mockupTagBlur}`}>•••••••</span>
              </div>
              <p className={styles.mockupBlurNote}>
                <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                  <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {t('preview_blur_note')}
              </p>
            </div>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  Pricing
// ─────────────────────────────────────────────
function Pricing() {
  const { t } = useT();
  const audit = [
    'All keyword gaps (not just the first 2)',
    'Keyword matches you already have',
    'Resume strengths and weaknesses',
    'JD red flags before you apply',
    'Salary range intel for the role',
    'LinkedIn headline rewrite',
    'Full PDF report in your inbox',
  ];
  const glowup = [
    'Everything in The Audit',
    'Tailored CV — fully rewritten, ready to submit',
    'Professional summary rewrite',
    'Skills section reordered to match the JD',
    'Personalised cover letter',
    '8 interview questions with STAR answers',
    'Salary negotiation script',
  ];

  return (
    <section className={styles.pricingSection}>
      <div className={styles.sectionWrap}>
        <p className={styles.eyebrow}>{t('pricing_eyebrow')}</p>
        <h2 className={styles.sectionHeading}>{t('pricing_heading')}</h2>
        <p className={styles.pricingSub}>{t('pricing_sub')}</p>
        <div className={styles.pricingGrid}>
          <Reveal delay={0}>
          <div className={styles.pricingCard}>
            <div className={styles.pricingTop}>
              <div>
                <p className={styles.pricingName}>{t('tier_basic_name')}</p>
                <p className={styles.pricingDesc}>{t('tier_basic_desc')}</p>
              </div>
              <p className={styles.pricingPrice}>$12</p>
            </div>
            <ul className={styles.featureList}>
              {audit.map((f) => (
                <li key={f} className={styles.featureItem}>
                  <svg viewBox="0 0 16 16" fill="none" className={styles.checkIcon}>
                    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <p className={styles.pricingMeta}>{t('pricing_meta')}</p>
          </div>
          </Reveal>

          <Reveal delay={120}>
          <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
            <div className={styles.featuredBadge}>{t('tier_most_popular')}</div>
            <div className={styles.pricingTop}>
              <div>
                <p className={styles.pricingName}>{t('tier_full_name')}</p>
                <p className={styles.pricingDesc}>{t('tier_full_desc')}</p>
              </div>
              <p className={styles.pricingPrice}>$29</p>
            </div>
            <ul className={styles.featureList}>
              {glowup.map((f) => (
                <li key={f} className={styles.featureItem}>
                  <svg viewBox="0 0 16 16" fill="none" className={`${styles.checkIcon} ${styles.checkIconAccent}`}>
                    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <p className={styles.pricingMeta}>{t('pricing_meta')}</p>
          </div>
          </Reveal>
        </div>
        <p className={styles.pricingCoach}>{t('pricing_coach')}</p>
        <p className={styles.sampleLink}>
          {t('pricing_sample')}{' '}
          <a href="/sample-report.pdf" target="_blank" rel="noopener noreferrer" className={styles.sampleAnchor}>
            {t('pricing_sample_link')}
          </a>
          {' '}or{' '}
          <a href="/sample-cv.pdf" target="_blank" rel="noopener noreferrer" className={styles.sampleAnchor}>
            see the tailored CV
          </a>
          {' '}{t('pricing_sample_suffix')}
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  FAQ
// ─────────────────────────────────────────────
function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const { t } = useT();

  const faqs = [
    { q: t('faq1_q'), a: t('faq1_a') },
    { q: t('faq2_q'), a: t('faq2_a') },
    { q: t('faq3_q'), a: t('faq3_a') },
    { q: t('faq4_q'), a: t('faq4_a') },
  ];

  return (
    <section className={styles.faqSection}>
      <div className={styles.sectionWrap}>
        <h2 className={styles.sectionHeading}>{t('faq_heading')}</h2>
        <div className={styles.faqList}>
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={item.q} delay={i * 60}>
                <div className={styles.faqItem}>
                  <button
                    className={styles.faqTrigger}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span className={styles.faqQ}>{item.q}</span>
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className={`${styles.faqChevron} ${isOpen ? styles.faqChevronOpen : ''}`}
                    >
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className={`${styles.faqBody} ${isOpen ? styles.faqBodyOpen : ''}`}>
                    <div style={{ overflow: 'hidden' }}>
                      <p className={styles.faqA}>{item.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  Main View
// ─────────────────────────────────────────────
export default function UploadView() {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isTouch, setIsTouch] = useState(false);
  const fileInputRef = useRef(null);
  const pricingRef = useRef(null);
  const howRef = useRef(null);
  const resultRef = useRef(null);
  const faqRef = useRef(null);
  const total = useStats();
  const { t } = useT();

  // Detect touch devices to show "Tap to upload" instead of "Drop"
  useEffect(() => { setIsTouch('ontouchstart' in window); }, []);

  useEffect(() => {
    const returning = !!localStorage.getItem('sl_visited');
    localStorage.setItem('sl_visited', '1');
    track('page_view', { page: 'landing', screenWidth: window.screen.width, lang: navigator.language, returning });
    const cleanups = [
      trackOnce(howRef.current,     'scroll_depth',    { depth: 25 }),
      trackOnce(resultRef.current,  'scroll_depth',    { depth: 50 }),
      trackOnce(pricingRef.current, 'scroll_to_pricing', { page: 'landing' }),
      trackOnce(pricingRef.current, 'scroll_depth',    { depth: 75 }),
      trackOnce(faqRef.current,     'scroll_depth',    { depth: 100 }),
    ];
    return () => cleanups.forEach(fn => fn());
  }, []);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError(t('form_err_pdf'));
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError(t('form_err_size'));
      return;
    }
    setError('');
    setFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    track('upload_started', { method: 'drop' });
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) return setError(t('form_err_file'));
    if (jobDescription.length < 100) return setError(t('form_err_jd'));
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setError(t('form_err_email_required'));
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('analytics', JSON.stringify({ sessionId: getSessionId(), utm: getUtm(), referrer: document.referrer }));
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);
      formData.append('tier', 'FULL');
      if (email) formData.append('email', email);
      const res = await fetch('/api/jobs', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      trackResumeSubmitted({ tier: 'FULL' });
      navigate(`/processing?jobId=${data.jobId}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>

      {/* ── NAV ─────────────────────────────── */}
      <nav className={styles.nav}>
        <span className={styles.logo}>short<span className={styles.logoAccent}>listed</span></span>
        <div className={styles.navRight}>
          <Link to="/blog" className={styles.navBlogLink}>Blog</Link>
          <LangSwitcher className={styles.langSwitcher} />
          <a href="#analyse" className={styles.navCta}>{t('nav_cta')}</a>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroInner}>

          <div className={styles.trustBadge}>
            <span className={styles.trustDot} />
            {total > 0 ? `${total.toLocaleString()}+ resumes scored · ` : ''}{t('hero_badge')}
          </div>

          <div className={styles.rejectCard}>
            <div className={styles.rejectTop}>
              <span className={styles.inBadge}>in</span>
              <span className={styles.rejectSource}>{t('hero_reject_source')}</span>
            </div>
            <p className={styles.rejectQuote}>{t('hero_reject_quote')}</p>
            <p className={styles.rejectCaption}>{t('hero_reject_caption')}</p>
          </div>

          <h1 className={styles.headline}>
            {t('hero_headline_line1')}<br />
            {t('hero_headline_line2')}<br />
            <span className={styles.accentText}>{t('hero_headline_accent')}</span>
          </h1>

          <p className={styles.sub}>{t('hero_sub')}</p>

          <div className={styles.heroCtaGroup}>
            <a href="#analyse" className={styles.heroCta}>
              {t('hero_cta')}
              <svg viewBox="0 0 20 20" fill="none" className={styles.heroCtaIcon} aria-hidden="true">
                <path d="M10 4v12M4 10l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="/sample-report.pdf" target="_blank" rel="noopener noreferrer" className={styles.heroSampleLink}>
              {t('pricing_sample_link')} →
            </a>
          </div>

          <div className={styles.statGrid}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>{t('stat1_num')}</span>
              <span className={styles.statDesc}>{t('stat1_desc')}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>{t('stat2_num')}</span>
              <span className={styles.statDesc}>{t('stat2_desc')}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>
                {total > 0 ? `${total.toLocaleString()}+` : 'Free'}
              </span>
              <span className={styles.statDesc}>
                {total > 0 ? 'resumes scored and counting' : 'your ATS score, keyword gaps, and experience match'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div ref={howRef}><HowItWorks /></div>
      <div ref={resultRef}><ResultsPreview /></div>

      {/* ── FORM ────────────────────────────── */}
      <main id="analyse" className={styles.main}>
        <div className={styles.formCard}>
          <div className={styles.formCardHeader}>
            <h2 className={styles.formCardTitle}>{t('form_title')}</h2>
            <p className={styles.formCardSub}>{t('form_sub')}</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.section}>
              <p className={styles.sectionLabel}>{t('form_resume_label')}</p>
              <div
                className={`${styles.dropzone} ${dragging ? styles.dropzoneDragging : ''} ${file ? styles.dropzoneHasFile : ''}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className={styles.fileInput}
                  onChange={(e) => { track('upload_started', { method: 'browse' }); handleFile(e.target.files[0]); }}
                />
                {file ? (
                  <div className={styles.fileSelected}>
                    <svg viewBox="0 0 24 24" fill="none" className={styles.fileIcon}>
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <div>
                      <p className={styles.fileName}>{file.name}</p>
                      <p className={styles.fileSize}>{(file.size / 1024).toFixed(0)} KB · {t('form_ready')}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.uploadIconWrap}>
                      <svg viewBox="0 0 24 24" fill="none" className={styles.uploadIcon}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className={styles.dropzoneText}>
                      {isTouch ? 'Tap to upload your resume' : t('form_drop_text')}
                    </p>
                    {!isTouch && (
                      <p className={styles.dropzoneHint}>
                        or{' '}
                        <span
                          className={styles.browseLink}
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        >
                          {t('form_browse')}
                        </span>
                        {' '}· {t('form_drop_hint_suffix')}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.sectionLabel}>{t('form_jd_label')}</p>
              <textarea
                id="jd"
                className={styles.textarea}
                placeholder={t('form_jd_placeholder')}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                onBlur={(e) => { if (e.target.value.length > 50) track('jd_started', { charCount: e.target.value.length }); }}
                rows={8}
                required
              />
              <p className={`${styles.hint} ${jobDescription.length > 0 && jobDescription.length < 100 ? styles.hintWarn : ''}`}>
                {jobDescription.length === 0
                  ? t('form_jd_hint_empty')
                  : jobDescription.length < 100
                  ? `${100 - jobDescription.length} ${t('form_jd_hint_more')}`
                  : `${jobDescription.length.toLocaleString()} ${t('form_jd_hint_good')}`}
              </p>
            </div>

            <div className={styles.section}>
              <p className={styles.sectionLabel}>{t('form_email_label')}</p>
              <input
                type="email"
                className={styles.emailInput}
                placeholder={t('form_email_placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <p className={styles.hint}>{t('form_email_hint_required')}</p>
            </div>

            {error && (
              <div className={styles.errorBox}>
                <svg viewBox="0 0 16 16" fill="none" className={styles.errorIcon}>
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 5v3M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <span className={styles.btnLoading}>
                  <span className={styles.btnDot} /><span className={styles.btnDot} /><span className={styles.btnDot} />
                  {t('form_submitting')}
                </span>
              ) : t('form_submit')}
            </button>

            {file && (
              <p className={styles.privacyNote}>{t('form_privacy')}</p>
            )}

            <p className={styles.secureNote}>{t('form_secure')}</p>
          </form>
        </div>
      </main>

      <div ref={pricingRef}><Pricing /></div>
      <div ref={faqRef}><FAQ /></div>

      {/* ── WHY THIS EXISTS ─────────────────── */}
      <section className={styles.testimonialSection}>
        <div className={styles.sectionWrap}>
          <p className={styles.eyebrow}>{t('founder_eyebrow')}</p>
          <div className={styles.testimonialCard}>
            <p className={styles.testimonialQuote}>{t('founder_quote')}</p>
            <div className={styles.testimonialAuthor}>
              <img
                src="/images/daniel.jpg"
                alt="Daniel"
                className={styles.testimonialPhoto}
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
              />
              <div className={styles.testimonialAvatar} style={{ display: 'none' }}>D</div>
              <div>
                <p className={styles.testimonialName}>{t('founder_name')}</p>
                <p className={styles.testimonialRole}>
                  {t('founder_role')} ·{' '}
                  <a
                    href="https://www.linkedin.com/in/dvalenzu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.testimonialLinkedin}
                  >
                    LinkedIn
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerLogo}>short<span className={styles.logoAccent}>listed</span></span>
          <span className={styles.footerTagline}>{t('footer_tagline')}</span>
          <div className={styles.footerLinks}>
            <Link to="/blog" className={styles.footerLink}>Blog</Link>
            <span className={styles.footerDivider}>·</span>
            <Link to="/privacy" className={styles.footerLink}>{t('footer_privacy')}</Link>
            <span className={styles.footerDivider}>·</span>
            <Link to="/terms" className={styles.footerLink}>{t('footer_terms')}</Link>
            <span className={styles.footerDivider}>·</span>
            <a href="mailto:hello@getshortlisted.fyi" className={styles.footerLink}>hello@getshortlisted.fyi</a>
          </div>
          <span className={styles.footerMeta}>{t('footer_built')}</span>
        </div>
      </footer>

    </div>
  );
}
