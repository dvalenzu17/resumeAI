import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './UploadView.module.css';

// ─────────────────────────────────────────────
//  How It Works
// ─────────────────────────────────────────────
function HowItWorks() {
  return (
    <section className={styles.howSection}>
      <div className={styles.sectionWrap}>
        <p className={styles.eyebrow}>Simple by design</p>
        <h2 className={styles.sectionHeading}>Three steps. Thirty seconds.</h2>
        <div className={styles.stepsGrid}>
          {[
            {
              n: '01',
              title: 'Upload your resume',
              body: 'PDF only. We extract the text and read every line the way an ATS does — no OCR, no guessing.',
            },
            {
              n: '02',
              title: 'Paste the job posting',
              body: 'The full thing. Responsibilities, requirements, all of it. More detail means a more precise match.',
            },
            {
              n: '03',
              title: 'Get your score free',
              body: 'ATS compatibility score, keyword gaps, and experience match. Instant. No account. No card.',
            },
          ].map((s) => (
            <div key={s.n} className={styles.stepItem}>
              <span className={styles.stepNum}>{s.n}</span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepBody}>{s.body}</p>
            </div>
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
  return (
    <section className={styles.previewSection}>
      <div className={styles.sectionWrap}>
        <p className={styles.eyebrow}>What you see first, free</p>
        <h2 className={styles.sectionHeading}>Your score before you pay anything.</h2>
        <p className={styles.previewSub}>
          You get a real ATS score and the first two keyword gaps before we ask for a cent.
          If the score surprises you, that's exactly the point.
        </p>
        <div className={styles.mockup}>
          <div className={styles.mockupHeader}>
            <span className={styles.mockupPill}>Your free score</span>
          </div>
          <div className={styles.mockupBody}>
            <div className={styles.mockupScores}>
              <div className={styles.mockupRing}>
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#d97706" strokeWidth="10"
                    strokeDasharray="196 327" strokeLinecap="round" transform="rotate(-90 60 60)" />
                </svg>
                <div className={styles.mockupRingInner}>
                  <span className={styles.mockupScore} style={{ color: '#d97706' }}>62</span>
                  <span className={styles.mockupScoreLabel}>ATS Score</span>
                </div>
              </div>
              <div className={styles.mockupRing}>
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#059669" strokeWidth="10"
                    strokeDasharray="262 327" strokeLinecap="round" transform="rotate(-90 60 60)" />
                </svg>
                <div className={styles.mockupRingInner}>
                  <span className={styles.mockupScore} style={{ color: '#059669' }}>80</span>
                  <span className={styles.mockupScoreLabel}>Experience</span>
                </div>
              </div>
            </div>

            <div className={styles.mockupGaps}>
              <div className={styles.mockupGapsHeader}>
                <span className={styles.mockupGapsTitle}>Keyword Gaps</span>
                <span className={styles.mockupGapsCount}>8 found</span>
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
                6 more gaps revealed after upgrade
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  Pricing
// ─────────────────────────────────────────────
function Pricing() {
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
    'Top 5 bullet rewrites (AI-powered)',
    'Full resume summary rewrite',
    'Tailored skills section',
    'Personalised cover letter',
    '8 interview questions with STAR answers',
    'Salary negotiation script',
  ];

  return (
    <section className={styles.pricingSection}>
      <div className={styles.sectionWrap}>
        <p className={styles.eyebrow}>After your free preview</p>
        <h2 className={styles.sectionHeading}>Simple, one-time pricing.</h2>
        <p className={styles.pricingSub}>No subscription. No account. Pay once, get the PDF. That's it.</p>
        <div className={styles.pricingGrid}>
          <div className={styles.pricingCard}>
            <div className={styles.pricingTop}>
              <div>
                <p className={styles.pricingName}>The Audit</p>
                <p className={styles.pricingDesc}>Everything wrong with your resume, and exactly how to fix it.</p>
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
            <p className={styles.pricingMeta}>One-time · No account · PDF in ~60s</p>
          </div>

          <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
            <div className={styles.featuredBadge}>Most popular</div>
            <div className={styles.pricingTop}>
              <div>
                <p className={styles.pricingName}>The Glow-Up</p>
                <p className={styles.pricingDesc}>Not just the analysis. The actual rewrites. Ready to paste in.</p>
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
            <p className={styles.pricingMeta}>One-time · No account · PDF in ~60s</p>
          </div>
        </div>
        <p className={styles.pricingCoach}>
          A career coach charges $150+ for one hour. The Glow-Up costs less than a coffee meeting and delivers in 60 seconds.
        </p>
        <p className={styles.sampleLink}>
          Not sure what you're getting?{' '}
          <a href="/sample-report.pdf" target="_blank" rel="noopener noreferrer" className={styles.sampleAnchor}>
            See a sample report
          </a>
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  FAQ
// ─────────────────────────────────────────────
function FAQ() {
  const faqs = [
    {
      q: 'Is my resume data safe?',
      a: "Your resume is processed server-side to generate your report. It's never sold, shared, or used to train AI models. We store the text temporarily to run the analysis — that's it.",
    },
    {
      q: 'How accurate is the ATS score?',
      a: "We use the same keyword-matching logic most corporate ATS systems use, plus an AI layer that catches semantic gaps the basic systems miss. It correlates well with what Workday, Greenhouse, and Lever flag, but no third-party tool can replicate the exact same software.",
    },
    {
      q: "What if I'm not happy with the report?",
      a: "Email hello@getshortlisted.fyi and we'll refund you. No questions asked. If the report doesn't work for your situation, you shouldn't pay for it.",
    },
    {
      q: 'Do I need an account?',
      a: "No. You submit, you pay, you get the PDF. We only collect your email at checkout so we can send you the report link. That's the only reason.",
    },
  ];

  return (
    <section className={styles.faqSection}>
      <div className={styles.sectionWrap}>
        <h2 className={styles.sectionHeading}>Questions</h2>
        <div className={styles.faqGrid}>
          {faqs.map((item) => (
            <div key={item.q} className={styles.faqItem}>
              <h3 className={styles.faqQ}>{item.q}</h3>
              <p className={styles.faqA}>{item.a}</p>
            </div>
          ))}
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
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('PDF files only. Not a JPEG of your resume.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File must be under 10 MB.');
      return;
    }
    setError('');
    setFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) return setError('Drop your resume first.');
    if (jobDescription.length < 100) return setError('Need more of the job description. Paste the whole thing.');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);
      formData.append('tier', 'FULL');
      const res = await fetch('/api/jobs', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
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
        <a href="#analyse" className={styles.navCta}>Get free score</a>
      </nav>

      {/* ── HERO ────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroInner}>

          <div className={styles.trustBadge}>
            <span className={styles.trustDot} />
            Free ATS analysis · No account · Results in ~30 seconds
          </div>

          <div className={styles.rejectCard}>
            <div className={styles.rejectTop}>
              <span className={styles.inBadge}>in</span>
              <span className={styles.rejectSource}>linkedin.com · just now</span>
            </div>
            <p className={styles.rejectQuote}>
              "After careful consideration, we've decided to move forward with other candidates."
            </p>
            <p className={styles.rejectCaption}>
              The recruiter never read your resume. The ATS filtered it out in under a second.
            </p>
          </div>

          <h1 className={styles.headline}>
            Stop losing to<br />
            an algorithm<br />
            <span className={styles.accentText}>you can't even see.</span>
          </h1>

          <p className={styles.sub}>
            We score your resume against the job description, find every keyword the
            ATS is penalising you for, and tell you exactly what to fix.
          </p>

          <a href="#analyse" className={styles.heroCta}>
            Get my free score
            <svg viewBox="0 0 20 20" fill="none" className={styles.heroCtaIcon} aria-hidden="true">
              <path d="M10 4v12M4 10l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>

          <div className={styles.statGrid}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>75%</span>
              <span className={styles.statDesc}>of resumes filtered before a human sees them</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>7s</span>
              <span className={styles.statDesc}>average recruiter time per resume, if it gets through</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>Free</span>
              <span className={styles.statDesc}>your ATS score, keyword gaps, and experience match</span>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      <ResultsPreview />

      {/* ── FORM ────────────────────────────── */}
      <main id="analyse" className={styles.main}>
        <div className={styles.formCard}>
          <div className={styles.formCardHeader}>
            <h2 className={styles.formCardTitle}>Analyse your resume</h2>
            <p className={styles.formCardSub}>Free score in ~30 seconds. No account required.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.section}>
              <p className={styles.sectionLabel}>Your resume</p>
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
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                {file ? (
                  <div className={styles.fileSelected}>
                    <svg viewBox="0 0 24 24" fill="none" className={styles.fileIcon}>
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <div>
                      <p className={styles.fileName}>{file.name}</p>
                      <p className={styles.fileSize}>{(file.size / 1024).toFixed(0)} KB · ready to analyse</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.uploadIconWrap}>
                      <svg viewBox="0 0 24 24" fill="none" className={styles.uploadIcon}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className={styles.dropzoneText}>Drop your resume here</p>
                    <p className={styles.dropzoneHint}>
                      or{' '}
                      <span
                        className={styles.browseLink}
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      >
                        browse files
                      </span>
                      {' '}· PDF · max 10 MB
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.sectionLabel}>The job description</p>
              <textarea
                id="jd"
                className={styles.textarea}
                placeholder="Paste the full job posting here: responsibilities, requirements, the whole thing. The more you give us, the more accurate the analysis. Don't just paste the title."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                required
              />
              <p className={`${styles.hint} ${jobDescription.length > 0 && jobDescription.length < 100 ? styles.hintWarn : ''}`}>
                {jobDescription.length === 0
                  ? 'Paste the full posting, not just the title'
                  : jobDescription.length < 100
                  ? `${100 - jobDescription.length} more characters needed`
                  : `${jobDescription.length.toLocaleString()} characters · good`}
              </p>
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
                  Analysing…
                </span>
              ) : 'Get My Free Score'}
            </button>

            <p className={styles.secureNote}>
              No account · No card · Your data is never sold or shared
            </p>
          </form>
        </div>
      </main>

      <Pricing />
      <FAQ />

      {/* ── TESTIMONIAL ─────────────────────── */}
      <section className={styles.testimonialSection}>
        <div className={styles.sectionWrap}>
          <p className={styles.eyebrow}>Why this exists</p>
          <div className={styles.testimonialCard}>
            <p className={styles.testimonialQuote}>
              "I built Shortlisted after watching my own resume get filtered out for roles I was genuinely
              qualified for. I had no idea which keywords I was missing or why the ATS kept rejecting me.
              After fixing the gaps the tool identified, I started getting callbacks. That's the whole reason
              this exists."
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.testimonialAvatar}>DV</div>
              <div>
                <p className={styles.testimonialName}>Daniel Valenzuela</p>
                <p className={styles.testimonialRole}>Founder, Shortlisted</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerLogo}>short<span className={styles.logoAccent}>listed</span></span>
          <span className={styles.footerTagline}>Beat the bots. Get the interview.</span>
          <div className={styles.footerLinks}>
            <Link to="/privacy" className={styles.footerLink}>Privacy Policy</Link>
            <span className={styles.footerDivider}>·</span>
            <Link to="/terms" className={styles.footerLink}>Terms of Service</Link>
            <span className={styles.footerDivider}>·</span>
            <a href="mailto:hello@getshortlisted.fyi" className={styles.footerLink}>hello@getshortlisted.fyi</a>
          </div>
          <span className={styles.footerMeta}>Built by Daniel Valenzuela · Panama</span>
        </div>
      </footer>

    </div>
  );
}
