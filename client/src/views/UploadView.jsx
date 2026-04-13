import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UploadView.module.css';

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
    if (jobDescription.length < 100) return setError('Need more of the job description — paste the whole thing.');

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

      {/* ── Dark hero ───────────────────────────── */}
      <section className={styles.hero}>
        <nav className={styles.nav}>
          <span className={styles.logo}>short<span className={styles.logoAccent}>listed</span></span>
          <span className={styles.navTag}>free preview</span>
        </nav>

        <div className={styles.heroInner}>

          {/* The villain: a LinkedIn rejection card */}
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
            Free score in ~30 seconds.
          </p>

          <div className={styles.statGrid}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>75%</span>
              <span className={styles.statDesc}>of resumes filtered before a human sees them</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>7s</span>
              <span className={styles.statDesc}>average recruiter time per resume — if it gets through</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>Free</span>
              <span className={styles.statDesc}>your ATS score, keyword gaps, and experience match</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── Form ────────────────────────────────── */}
      <main className={styles.main}>
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
                  <p className={styles.dropzoneHint}>or <span className={styles.browseLink} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>browse files</span> · PDF · max 10 MB</p>
                </>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>The job description</p>
            <textarea
              id="jd"
              className={styles.textarea}
              placeholder={"Paste the full job posting here — responsibilities, requirements, the whole thing. The more you give us, the more accurate the analysis. Don't just paste the title."}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              required
            />
            <p className={`${styles.hint} ${jobDescription.length > 0 && jobDescription.length < 100 ? styles.hintWarn : ''}`}>
              {jobDescription.length === 0
                ? 'Paste the full posting — not just the title'
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
      </main>

      <footer className={styles.footer}>
        <span className={styles.footerLogo}>short<span className={styles.logoAccent}>listed</span></span>
        <span className={styles.footerSep}>·</span>
        <span>Built for job seekers who are done getting ghosted</span>
      </footer>
    </div>
  );
}
