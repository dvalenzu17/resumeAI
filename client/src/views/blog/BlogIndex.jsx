import { Link } from 'react-router-dom';
import styles from './BlogIndex.module.css';

const posts = [
  {
    slug: 'how-ats-systems-work',
    title: 'How ATS Systems Actually Work — And Why Your Resume Keeps Getting Filtered',
    description: 'Most job seekers have no idea that a piece of software rejects their resume before a human ever sees it. Here is how it actually works.',
    date: 'April 2025',
    readTime: '6 min read',
  },
  {
    slug: 'resume-keywords',
    title: 'The Exact Keywords Your Resume Is Missing (And How to Find Them)',
    description: 'ATS systems reject resumes based on keyword mismatches. Here is the systematic process for finding and adding the right ones without stuffing.',
    date: 'April 2025',
    readTime: '5 min read',
  },
  {
    slug: 'software-engineer-resume-ats',
    title: 'ATS-Friendly Resume Tips for Software Engineers in 2025',
    description: 'Tech resumes have specific failure modes. Here is what Workday, Greenhouse, and Lever flag in software engineering resumes — and how to fix them.',
    date: 'April 2025',
    readTime: '7 min read',
  },
];

export default function BlogIndex() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>short<span className={styles.logoAccent}>listed</span></Link>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Resources</p>
          <h1 className={styles.heading}>Job search, demystified.</h1>
          <p className={styles.sub}>
            No career fluff. No generic tips. Just the specific, technical things that determine whether your resume gets through or gets filtered.
          </p>
        </div>

        <div className={styles.posts}>
          {posts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className={styles.postCard}>
              <div className={styles.postMeta}>
                <span className={styles.postReadTime}>{post.readTime}</span>
              </div>
              <h2 className={styles.postTitle}>{post.title}</h2>
              <p className={styles.postDescription}>{post.description}</p>
              <span className={styles.postCta}>Read article →</span>
            </Link>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <Link to="/" className={styles.footerCta}>Get your free ATS score →</Link>
        <div className={styles.footerLinks}>
          <Link to="/privacy" className={styles.footerLink}>Privacy</Link>
          <span>·</span>
          <Link to="/terms" className={styles.footerLink}>Terms</Link>
        </div>
      </footer>
    </div>
  );
}
