import { Link } from 'react-router-dom';
import styles from './BlogIndex.module.css';

const posts = [
  {
    slug: 'what-is-ats',
    title: 'What Is an ATS? How Applicant Tracking Systems Actually Work',
    description: 'Before a human recruiter ever sees your resume, software decides whether it is worth their time. Here is exactly how that software works.',
    date: 'May 2025',
    readTime: '7 min read',
  },
  {
    slug: 'resume-keywords-missing',
    title: 'Why Your Resume Gets Rejected Before Anyone Reads It',
    description: 'You are qualified. You apply. You hear nothing. The problem is not your experience. It is automated filtering. Here is what is happening.',
    date: 'May 2025',
    readTime: '6 min read',
  },
  {
    slug: 'how-to-beat-ats',
    title: 'How to Beat ATS Systems in 2025 (Without Keyword Stuffing)',
    description: 'Most advice on passing ATS filters is counterproductive. Here is the practical approach that actually improves your score.',
    date: 'May 2025',
    readTime: '8 min read',
  },
  {
    slug: 'tailor-resume-job-description',
    title: 'How to Tailor Your Resume to a Job Description (Step-by-Step)',
    description: 'Sending the same resume to every job is the most common mistake in a job search. Here is the 15-minute process that fixes it.',
    date: 'May 2025',
    readTime: '8 min read',
  },
  {
    slug: 'ats-resume-format',
    title: 'ATS Resume Format: The Only Template That Gets Past Screening',
    description: 'Most resume templates fail ATS screening before the recruiter ever sees them. Here is the exact format that parses correctly.',
    date: 'May 2025',
    readTime: '7 min read',
  },
  {
    slug: 'ats-resume-keywords',
    title: 'ATS Resume Keywords: How to Find and Use Them Correctly',
    description: 'ATS systems score your resume on keyword matches. Here is the exact process for finding the right keywords and where to place them.',
    date: 'May 2025',
    readTime: '7 min read',
  },
  {
    slug: 'ats-score-meaning',
    title: 'What Does Your ATS Score Actually Mean?',
    description: 'A number between 0 and 100. Here is what the different score ranges indicate and what to prioritise when your score is too low.',
    date: 'May 2025',
    readTime: '6 min read',
  },
  {
    slug: 'ats-resume-checker-free',
    title: 'Free ATS Resume Checker: What to Look For (And What to Avoid)',
    description: 'Not all ATS checkers give you useful information. Here is what separates a tool that helps from one that just upsells you.',
    date: 'May 2025',
    readTime: '6 min read',
  },
  {
    slug: 'jobscan-alternative',
    title: 'Jobscan Alternatives: 5 Free ATS Checkers That Do Not Require a Subscription',
    description: 'Jobscan charges $50 to $90 per month. Here is an honest comparison of free and pay-once alternatives.',
    date: 'May 2025',
    readTime: '7 min read',
  },
  {
    slug: 'how-ats-systems-work',
    title: 'How ATS Systems Actually Work — And Why Your Resume Keeps Getting Filtered',
    description: 'Most job seekers have no idea that a piece of software rejects their resume before a human ever sees it. Here is how it works.',
    date: 'April 2025',
    readTime: '6 min read',
  },
  {
    slug: 'resume-keywords',
    title: 'The Exact Keywords Your Resume Is Missing (And How to Find Them)',
    description: 'ATS systems reject resumes based on keyword mismatches. Here is the systematic process for finding and adding the right ones.',
    date: 'April 2025',
    readTime: '5 min read',
  },
  {
    slug: 'software-engineer-resume',
    title: 'ATS-Friendly Resume Tips for Software Engineers in 2025',
    description: 'Tech resumes have specific failure modes. Here is what Workday, Greenhouse, and Lever flag in software engineering resumes.',
    date: 'April 2025',
    readTime: '7 min read',
  },
  {
    slug: 'es/como-pasar-el-ats',
    title: 'Cómo Pasar el ATS y Conseguir Más Entrevistas',
    description: 'La guía completa en español para optimizar tu currículum y superar el filtro ATS. Sin relleno, solo lo que funciona.',
    date: 'Mayo 2025',
    readTime: '8 min de lectura',
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
                <span className={styles.postDate}>{post.date}</span>
                <span className={styles.postDot}>·</span>
                <span className={styles.postReadTime}>{post.readTime}</span>
              </div>
              <h2 className={styles.postTitle}>{post.title}</h2>
              <p className={styles.postDescription}>{post.description}</p>
              <span className={styles.postCta}>Read article</span>
            </Link>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <Link to="/" className={styles.footerCta}>Get your free ATS score</Link>
        <div className={styles.footerLinks}>
          <Link to="/privacy" className={styles.footerLink}>Privacy</Link>
          <span>·</span>
          <Link to="/terms" className={styles.footerLink}>Terms</Link>
        </div>
      </footer>
    </div>
  );
}
