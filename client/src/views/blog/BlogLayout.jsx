import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './BlogLayout.module.css';

export default function BlogLayout({ children, title, description, date }) {
  useEffect(() => {
    if (title) document.title = `${title} — Shortlisted`;

    const setMeta = (name, content, prop = false) => {
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
      return el;
    };

    const metas = [];
    if (description) {
      metas.push(setMeta('description', description));
      metas.push(setMeta('og:description', description, true));
    }
    if (title) {
      metas.push(setMeta('og:title', `${title} — Shortlisted`, true));
    }
    metas.push(setMeta('og:type', 'article', true));

    return () => {
      document.title = 'Shortlisted — Beat the bots. Get the interview.';
      metas.forEach(el => el.remove());
    };
  }, [title, description]);
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>short<span className={styles.logoAccent}>listed</span></Link>
        <Link to="/blog" className={styles.navLink}>All posts</Link>
      </nav>

      <main className={styles.main}>
        <article className={styles.article}>
          {date && <p className={styles.date}>{date}</p>}
          {title && <h1 className={styles.title}>{title}</h1>}
          {description && <p className={styles.description}>{description}</p>}
          <div className={styles.content}>{children}</div>
          <div style={{
            margin: '48px 0 0',
            padding: '28px 32px',
            background: 'linear-gradient(135deg, #fff7f0 0%, #fff 100%)',
            border: '1px solid #f97316',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <p style={{ fontWeight: 700, fontSize: '18px', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
              See exactly where your resume stands.
            </p>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 20px', lineHeight: '1.6' }}>
              Upload your resume and the job description. Get your ATS score, every keyword gap, and salary intel in 30 seconds. Free preview, no account needed.
            </p>
            <Link
              to="/"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #e85d04, #f97316)',
                color: '#fff',
                textDecoration: 'none',
                padding: '13px 28px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '15px',
                letterSpacing: '-0.2px'
              }}
            >
              Get your free ATS score →
            </Link>
          </div>
        </article>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link to="/" className={styles.footerCta}>Get your free ATS score →</Link>
          <div className={styles.footerLinks}>
            <Link to="/privacy" className={styles.footerLink}>Privacy</Link>
            <span>·</span>
            <Link to="/terms" className={styles.footerLink}>Terms</Link>
            <span>·</span>
            <a href="mailto:hello@getshortlisted.fyi" className={styles.footerLink}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
