import { Link } from 'react-router-dom';
import styles from './LegalView.module.css';

export default function TermsView() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          short<span className={styles.logoAccent}>listed</span>
        </Link>
      </nav>

      <main className={styles.main}>
        <p className={styles.eyebrow}>Legal</p>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.meta}>Last updated: April 13, 2025 · Operator: Daniel Valenzuela, Panama</p>

        <div className={styles.body}>

          <h2>Who you are contracting with</h2>
          <p>
            By using Shortlisted (<strong>getshortlisted.fyi</strong>) you are entering into an agreement
            with Daniel Valenzuela, an individual operating in the Republic of Panama. Contact:{' '}
            <a href="mailto:hello@getshortlisted.fyi">hello@getshortlisted.fyi</a>.
          </p>

          <h2>What the service does</h2>
          <p>
            Shortlisted analyses a resume against a job description using AI, produces an ATS compatibility
            score, identifies keyword gaps, and optionally generates rewritten resume content. The output
            is delivered as a PDF report sent to your email address.
          </p>
          <p>
            The free tier provides a partial preview (ATS score and up to two keyword gaps) at no charge,
            before any payment is required.
          </p>

          <h2>What the service does not do</h2>
          <p>
            Shortlisted is an AI-powered analysis tool, not a career counsellor, recruiter, or employment
            agency. Using this service does not guarantee:
          </p>
          <ul>
            <li>That your resume will pass any specific employer's ATS system.</li>
            <li>That you will receive a job interview or offer.</li>
            <li>That the analysis is error-free or complete.</li>
            <li>That the keyword suggestions are appropriate for every employer or context.</li>
          </ul>
          <p>
            Scores and recommendations are estimates produced by a large language model. Use them as
            a guide, not as definitive fact.
          </p>

          <h2>Your responsibilities</h2>
          <ul>
            <li>You must own the resume you upload or have permission to submit it for analysis.</li>
            <li>You must not upload documents containing malicious code or content.</li>
            <li>You must not attempt to reverse-engineer, scrape, or abuse the service.</li>
            <li>You must be at least 16 years old to use the service.</li>
            <li>You are responsible for how you use the output of the service.</li>
          </ul>

          <h2>Payment and pricing</h2>
          <p>
            Payments are processed by Lemon Squeezy. By completing a purchase you also agree to
            Lemon Squeezy's terms of service. Prices are listed in USD and are charged as a one-time
            fee per report. There are no subscriptions.
          </p>
          <p>
            You will receive the report PDF via email within approximately 60 seconds of payment. The
            download link is valid for 72 hours. If you do not receive the email, check your spam
            folder and contact us at{' '}
            <a href="mailto:hello@getshortlisted.fyi">hello@getshortlisted.fyi</a>.
          </p>

          <h2>Refunds</h2>
          <p>
            If you are not satisfied with your report, email us at{' '}
            <a href="mailto:hello@getshortlisted.fyi">hello@getshortlisted.fyi</a> within 7 days of
            purchase and we will refund you in full. No questions asked. Refunds are issued to the
            original payment method via Lemon Squeezy and may take 5-10 business days to appear.
          </p>
          <p>
            We reserve the right to decline refund requests where there is evidence of abuse (for
            example, requesting a refund after downloading and using the report, then requesting again
            on a second purchase).
          </p>

          <h2>Intellectual property</h2>
          <p>
            You retain ownership of your resume and any content you submit. By submitting, you grant
            us a limited, temporary licence to process your content for the sole purpose of generating
            your report.
          </p>
          <p>
            The Shortlisted name, logo, and website design are owned by Daniel Valenzuela. You may
            not copy or reproduce them without permission.
          </p>
          <p>
            The PDF report delivered to you is yours to use however you wish, including sharing it
            with employers, coaches, or career advisors.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the maximum extent permitted by applicable law, Daniel Valenzuela shall not be liable
            for any indirect, incidental, special, or consequential damages arising from your use of
            Shortlisted, including but not limited to lost employment opportunities, lost income, or
            decisions made based on the report output.
          </p>
          <p>
            Our total liability to you for any claim arising from use of the service shall not exceed
            the amount you paid for the report in question.
          </p>

          <h2>Disclaimer of warranties</h2>
          <p>
            The service is provided "as is" without warranties of any kind, express or implied. We do
            not warrant that the service will be uninterrupted, error-free, or that the AI-generated
            output will be accurate or suitable for your specific situation.
          </p>

          <h2>Governing law</h2>
          <p>
            These terms are governed by the laws of the Republic of Panama. Any disputes shall be
            resolved in the courts of Panama City, Panama, unless applicable consumer protection law
            in your country of residence requires otherwise.
          </p>

          <h2>Changes to these terms</h2>
          <p>
            We may update these terms from time to time. The "Last updated" date at the top of this
            page will reflect any changes. Continued use of the service after changes constitutes
            acceptance of the revised terms.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms:{' '}
            <a href="mailto:hello@getshortlisted.fyi">hello@getshortlisted.fyi</a>.
          </p>

        </div>
      </main>
    </div>
  );
}
