import { Link } from 'react-router-dom';
import styles from './LegalView.module.css';

export default function PrivacyView() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          short<span className={styles.logoAccent}>listed</span>
        </Link>
      </nav>

      <main className={styles.main}>
        <p className={styles.eyebrow}>Legal</p>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.meta}>Last updated: April 13, 2025 · Operator: Daniel Valenzuela, Panama</p>

        <div className={styles.body}>

          <h2>Who we are</h2>
          <p>
            Shortlisted (<strong>getshortlisted.fyi</strong>) is operated by Daniel Valenzuela, an individual based
            in the Republic of Panama. When this policy says "we", "us", or "our", it means Daniel Valenzuela
            personally. There is no company. Questions about this policy can be sent to{' '}
            <a href="mailto:hello@getshortlisted.fyi">hello@getshortlisted.fyi</a>.
          </p>

          <h2>What we collect and why</h2>
          <p>We collect the minimum needed to provide the service.</p>
          <ul>
            <li>
              <strong>Your resume (PDF).</strong> Uploaded by you. We extract the text to run the
              analysis. The raw file is not stored. The extracted text is stored temporarily in our
              database and deleted after 30 days.
            </li>
            <li>
              <strong>The job description.</strong> Pasted by you. Stored alongside your resume text
              and deleted after 30 days.
            </li>
            <li>
              <strong>Your email address.</strong> Collected at checkout via Lemon Squeezy. Used only
              to send you your report PDF. We do not send marketing email unless you explicitly
              opt in (which we currently do not offer).
            </li>
            <li>
              <strong>Payment information.</strong> Handled entirely by Lemon Squeezy. We never
              see your card number, billing address, or any payment details. Lemon Squeezy's privacy
              policy governs payment data.
            </li>
            <li>
              <strong>IP address and basic request metadata.</strong> Logged automatically by our
              server for rate limiting and abuse prevention. Not linked to your identity. Retained
              for up to 7 days in server logs.
            </li>
          </ul>

          <h2>What we do not do</h2>
          <ul>
            <li>We do not sell your data. Ever. To anyone.</li>
            <li>We do not use your resume or job description to train AI models.</li>
            <li>We do not share your data with third parties except as described in this policy.</li>
            <li>We do not send marketing emails.</li>
            <li>We do not use tracking cookies or third-party advertising pixels.</li>
          </ul>

          <h2>Third-party services we use</h2>
          <p>
            Running the service requires us to share certain data with the following third parties.
            Each is bound by their own privacy policy.
          </p>
          <ul>
            <li>
              <strong>Anthropic</strong> — your resume text and job description are sent to
              Anthropic's Claude API to generate the analysis. Anthropic does not use API-submitted
              data to train models. See{' '}
              <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">
                anthropic.com/privacy
              </a>.
            </li>
            <li>
              <strong>Lemon Squeezy</strong> — payment processor. Handles checkout, billing, and
              receipt delivery. Receives your email address and payment details. See{' '}
              <a href="https://www.lemonsqueezy.com/privacy" target="_blank" rel="noopener noreferrer">
                lemonsqueezy.com/privacy
              </a>.
            </li>
            <li>
              <strong>Resend</strong> — email delivery service. Your email address and report PDF
              link are sent through Resend to deliver your report. See{' '}
              <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer">
                resend.com/privacy
              </a>.
            </li>
            <li>
              <strong>Cloudflare R2</strong> — cloud storage. Your generated PDF report is stored
              here temporarily. The download link expires after 72 hours. See{' '}
              <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">
                cloudflare.com/privacypolicy
              </a>.
            </li>
            <li>
              <strong>Railway</strong> — hosting provider for our server and database. Your data
              passes through and is stored on Railway infrastructure. See{' '}
              <a href="https://railway.app/privacy" target="_blank" rel="noopener noreferrer">
                railway.app/privacy
              </a>.
            </li>
          </ul>

          <h2>Data retention</h2>
          <ul>
            <li>Resume text and job description: deleted after 30 days.</li>
            <li>Generated PDF: accessible for 72 hours via a signed link, then inaccessible.</li>
            <li>Email address: retained as long as the job record exists (30 days), then deleted.</li>
            <li>Server logs: up to 7 days.</li>
          </ul>

          <h2>Your rights</h2>
          <p>
            Regardless of where you are located, you can email us at{' '}
            <a href="mailto:hello@getshortlisted.fyi">hello@getshortlisted.fyi</a> to:
          </p>
          <ul>
            <li>Request deletion of your data before the 30-day automatic deletion.</li>
            <li>Ask what data we hold about you.</li>
            <li>Ask us to correct inaccurate data.</li>
          </ul>
          <p>
            If you are located in the European Economic Area, you have additional rights under the
            General Data Protection Regulation (GDPR), including the right to lodge a complaint with
            your local supervisory authority. If you are a California resident, you have rights under
            the California Consumer Privacy Act (CCPA). We honour requests from all users regardless
            of location.
          </p>

          <h2>Cookies</h2>
          <p>
            We do not use tracking cookies or advertising cookies. The service may use session storage
            in your browser to remember your job ID between page loads. This data stays in your browser
            and is not sent to any third party.
          </p>

          <h2>Children</h2>
          <p>
            This service is not directed at children under 16. We do not knowingly collect data from
            children. If you believe a child has submitted data to us, contact us and we will delete it.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            If we make material changes, we will update the "Last updated" date at the top of this page.
            Continued use of the service after changes constitutes acceptance of the updated policy.
          </p>

          <h2>Contact</h2>
          <p>
            Questions, requests, or concerns:{' '}
            <a href="mailto:hello@getshortlisted.fyi">hello@getshortlisted.fyi</a>.
            We aim to respond within 5 business days.
          </p>

        </div>
      </main>
    </div>
  );
}
