import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './BlogLayout.module.css';

export default function BlogLayout({ children, title, description, date }) {
  useEffect(() => {
    if (title) document.title = `${title} — Shortlisted`;
    return () => { document.title = 'Shortlisted — Beat the bots. Get the interview.'; };
  }, [title]);
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
