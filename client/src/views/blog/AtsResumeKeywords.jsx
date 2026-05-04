import { Link } from 'react-router-dom';
import BlogLayout from './BlogLayout.jsx';

export default function AtsResumeKeywords() {
  return (
    <BlogLayout
      title="ATS Resume Keywords: How to Find and Use Them Correctly"
      description="ATS systems score your resume on keyword matches against the job description. Here is the exact process for finding the right keywords, where to place them, and how to avoid the mistakes that tank your score."
      date="May 2025"
      readTime="7 min read"
      slug="ats-resume-keywords"
      publishedDate="2025-05-04"
    >
      <p>
        Keywords are the currency of ATS scoring. Your resume gets a high score when it contains the
        specific words and phrases the job description uses. It gets a low score when it does not.
        Most candidates fail the keyword test not because they lack the skills, but because they
        describe those skills in the wrong words.
      </p>

      <h2>Why keywords matter so much</h2>
      <p>
        An ATS does not read your resume the way a human does. It parses text and runs matching
        algorithms. The algorithm compares your resume text against the job description text and
        produces a similarity score. The more overlap in specific terminology, the higher your score.
      </p>
      <p>
        This is why two candidates with identical experience can receive wildly different ATS scores.
        One wrote "led agile sprints and managed the product backlog." The other wrote "ensured timely
        delivery of features and coordinated team priorities." Same work. But if the job description
        says "Agile," "sprint planning," and "backlog management," only the first candidate gets
        the keyword credit.
      </p>

      <h2>Types of ATS keywords</h2>
      <p>
        Not all keywords carry equal weight. Understanding the categories helps you prioritise.
      </p>
      <h3>Hard skill keywords</h3>
      <p>
        These are specific, measurable capabilities: programming languages, software tools, platforms,
        certifications, and methodologies. Examples: "Python," "Salesforce," "GAAP," "AWS," "PMP,"
        "AutoCAD," "SEO," "SQL," "Adobe Illustrator," "HIPAA compliance."
      </p>
      <p>
        Hard skill keywords are the most important for ATS scoring. They are exact-match terms.
        The ATS either finds "Salesforce" in your resume or it does not. There is no partial credit
        for "CRM software" if the job description says "Salesforce."
      </p>
      <h3>Soft skill and methodology keywords</h3>
      <p>
        These include: "stakeholder management," "cross-functional collaboration," "data-driven,"
        "Agile," "Scrum," "project management," "strategic planning," "budget management."
        Less definitive than hard skills, but ATS systems check for them and weight them.
      </p>
      <h3>Industry terminology</h3>
      <p>
        Every industry has vocabulary that signals domain expertise. Healthcare: "HIPAA," "EMR,"
        "clinical workflows." Fintech: "AML," "KYC," "ARR," "payment rails." SaaS: "churn,"
        "NPS," "customer success," "MRR." Using the right industry terms signals that you
        understand the context, not just the job function.
      </p>
      <h3>Job title keywords</h3>
      <p>
        ATS systems compare your previous job titles against the target role. If you were a
        "Marketing Coordinator" applying for a "Marketing Manager" role, the title gap is noted.
        If you managed teams as a coordinator, your bullets should make that scope explicit.
      </p>

      <h2>How to find the right keywords</h2>
      <p>
        The source of truth for keywords is the job description itself. Everything else is guesswork.
        Here is the process:
      </p>
      <ol>
        <li>
          <strong>Read the job description three times.</strong> First for overall understanding.
          Second to highlight required skills and qualifications. Third to highlight preferred skills,
          nice-to-haves, and the specific language used for responsibilities.
        </li>
        <li>
          <strong>Extract hard skill terms.</strong> Every specific tool, platform, certification,
          or technology named is a keyword you need. Make a list.
        </li>
        <li>
          <strong>Note recurring phrases.</strong> If "stakeholder communication" appears three times
          in the job description, it is heavily weighted. Frequency signals importance.
        </li>
        <li>
          <strong>Identify the role-specific vocabulary.</strong> Look at the verbs they use in
          the responsibilities section. "Optimise," "architect," "drive adoption," "scale," "mentor."
          Match their verb choices where possible.
        </li>
        <li>
          <strong>Check the "Qualifications" section separately.</strong> Required qualifications
          are higher-weight keywords than preferred qualifications. Address required ones first.
        </li>
      </ol>

      <h2>Where to place keywords</h2>
      <p>
        Placement affects your score. ATS systems weight different sections differently:
      </p>
      <ul>
        <li>
          <strong>Skills section.</strong> This is the highest-weight area for keyword matching.
          List your hard skills here explicitly. "Python, SQL, Tableau, Google Analytics, Agile."
          Do not bury skills only in your bullets.
        </li>
        <li>
          <strong>Recent experience bullets.</strong> Use the job description's language when
          describing your accomplishments. "Led Agile sprint planning" scores better than
          "ran weekly team check-ins" if Agile is in the job description.
        </li>
        <li>
          <strong>Resume summary.</strong> A two to three sentence summary at the top that mirrors
          the target role's key terms can help with ATS systems that weight the top of the document.
        </li>
        <li>
          <strong>Education section.</strong> For certifications and training that are job description
          keywords, list them here in addition to the skills section.
        </li>
      </ul>

      <h2>Keyword mistakes that hurt your score</h2>
      <h3>Synonyms instead of exact terms</h3>
      <p>
        Writing "supervised team members" instead of "people management" when the job description
        says "people management." Most ATS systems will not count these as equivalent.
        Use the job description's exact phrasing wherever possible.
      </p>
      <h3>Abbreviations without the full form</h3>
      <p>
        Some ATS systems match "SEO" but not "Search Engine Optimisation" and vice versa.
        Write both: "Search Engine Optimisation (SEO)" on first use. This covers both matching patterns.
      </p>
      <h3>Skills buried in PDFs with bad formatting</h3>
      <p>
        Your skills could be perfect but invisible if your resume uses tables, text boxes,
        or a two-column layout. The ATS parser cannot extract text from these elements reliably.
        See our guide on{' '}
        <Link to="/blog/ats-resume-format">ATS-compatible resume formatting</Link> to
        make sure your content is actually being read.
      </p>
      <h3>Generic skills instead of specific ones</h3>
      <p>
        "Microsoft Office" instead of "Excel, PowerPoint, Word." "Database experience" instead
        of "PostgreSQL, MySQL." The more specific term usually matches the job description better.
        Include both the category and the specific tools.
      </p>

      <h2>How many keywords do you need?</h2>
      <p>
        There is no magic number. The goal is matching the relevant terms from the job description,
        not hitting a quota. A job description for a data analyst role might contain 15 to 20 specific
        skill terms. If you have 12 of them, include all 12. If you have 8, include all 8.
      </p>
      <p>
        Do not add keywords you cannot speak to in an interview. The ATS score gets you in front
        of a recruiter. The recruiter's questions will quickly reveal whether your keywords reflect
        genuine experience. Fabricated keyword matches create problems at the interview stage.
      </p>

      <h2>Checking if your keywords are working</h2>
      <p>
        The fastest way to know whether your keyword changes improved your ATS score is to check
        against the specific job description before you submit. <Link to="/">Shortlisted</Link> does
        this in about 30 seconds. Upload your resume, paste the job description, and see your score
        plus every keyword gap. The first check is free.
      </p>
      <p>
        For a broader look at how to approach the whole ATS optimisation process, see our guide on{' '}
        <Link to="/blog/how-to-beat-ats">how to beat ATS systems without keyword stuffing</Link> and
        the step-by-step process for{' '}
        <Link to="/blog/tailor-resume-job-description">tailoring your resume to a job description</Link>.
      </p>
      <div className="callout">
        <p>
          <strong>See which keywords your resume is missing.</strong> Shortlisted compares your resume
          against any job description and lists every keyword gap by category. Free, takes 30 seconds,
          no account needed.{' '}
          <Link to="/">Check your keywords now.</Link>
        </p>
      </div>
    </BlogLayout>
  );
}
