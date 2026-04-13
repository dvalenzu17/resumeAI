import { Link } from 'react-router-dom';
import styles from './NotFoundView.module.css';

export default function NotFoundView() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>short<span className={styles.logoAccent}>listed</span></Link>
      </nav>
      <main className={styles.main}>
        <div className={styles.card}>
          <p className={styles.code}>404</p>
          <h1 className={styles.heading}>Page not found.</h1>
          <p className={styles.body}>The bots didn't filter you out. This page just doesn't exist.</p>
          <Link to="/" className={styles.btn}>Back to home</Link>
        </div>
      </main>
    </div>
  );
}
