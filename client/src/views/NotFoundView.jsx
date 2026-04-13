import { Link } from 'react-router-dom';
import { useT } from '../lib/i18n.jsx';
import styles from './NotFoundView.module.css';

export default function NotFoundView() {
  const { t } = useT();
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>short<span className={styles.logoAccent}>listed</span></Link>
      </nav>
      <main className={styles.main}>
        <div className={styles.card}>
          <p className={styles.code}>404</p>
          <h1 className={styles.heading}>{t('notfound_heading')}</h1>
          <p className={styles.body}>{t('notfound_sub')}</p>
          <Link to="/" className={styles.btn}>{t('notfound_cta')}</Link>
        </div>
      </main>
    </div>
  );
}
