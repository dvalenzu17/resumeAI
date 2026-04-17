import { Link } from 'react-router-dom';
import styles from './LegalView.module.css';

export default function RefundView() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          short<span className={styles.logoAccent}>listed</span>
        </Link>
      </nav>

      <main className={styles.main}>
        <p className={styles.eyebrow}>Legal</p>
        <h1 className={styles.title}>Refund Policy</h1>
        <p className={styles.meta}>Last updated: April 14, 2025 · Operator: Daniel Valenzuela, Panama</p>

        <div className={styles.body}>

          <h2>The short version</h2>
          <p>
            If you are not happy with your report for any reason, email us within 7 days of purchase
            and we will refund you in full. No forms, no hoops, no questions asked.
          </p>

          <h2>Who processes your payment</h2>
          <p>
            Payments are processed by Lemon Squeezy, who acts as the Merchant of Record for all
            Shortlisted purchases. Your payment is made to Lemon Squeezy, and refunds are issued by
            Lemon Squeezy back to your original payment method.
          </p>

          <h2>Eligibility</h2>
          <p>You are eligible for a full refund if:</p>
          <ul>
            <li>You request it within <strong>7 days</strong> of your purchase date.</li>
            <li>
              Your report was not delivered to your email within 5 minutes of payment and you did
              not receive it after checking your spam folder.
            </li>
            <li>
              A technical error on our end caused the report to be incomplete, corrupted, or
              missing content.
            </li>
          </ul>

          <h2>How to request a refund</h2>
          <p>
            Email <a href="mailto:hello@getshortlisted.fyi">hello@getshortlisted.fyi</a> with:
          </p>
          <ul>
            <li>The email address you used at checkout.</li>
            <li>Your Job ID (found in your report email, starts with <strong>c</strong>).</li>
            <li>A brief description of the issue, if any.</li>
          </ul>
          <p>
            We aim to respond within 24 hours on business days. Once approved, refunds are
            processed by Lemon Squeezy and typically appear on your statement within <strong>5 to 10
            business days</strong>, depending on your bank or card issuer.
          </p>

          <h2>What we cannot refund</h2>
          <ul>
            <li>
              Requests made more than 7 days after the purchase date.
            </li>
            <li>
              Cases where the report was successfully delivered and downloaded, and the request
              appears to be a pattern of abuse across multiple purchases.
            </li>
            <li>
              Dissatisfaction with the AI output that results from submitting an incomplete resume
              or a job description that did not match the role you intended to apply for. We
              encourage you to review your inputs before purchasing. The free preview score is
              available before any payment is required.
            </li>
          </ul>

          <h2>Automatic refunds for failed reports</h2>
          <p>
            If the system fails to generate your report due to a technical error on our end, you
            will receive an automatic notification email. In this case you do not need to contact
            us — we will initiate the refund proactively within 1 business day.
          </p>

          <h2>Currency</h2>
          <p>
            All purchases are made in USD. If you paid in a different currency, your refund will
            be returned in the currency you were charged, at the exchange rate used at the time of
            the original transaction. Shortlisted is not responsible for any currency conversion
            fees charged by your bank.
          </p>

          <h2>Contact</h2>
          <p>
            Refund requests and questions:{' '}
            <a href="mailto:hello@getshortlisted.fyi">hello@getshortlisted.fyi</a>. We read and
            respond to every email.
          </p>

        </div>
      </main>
    </div>
  );
}
