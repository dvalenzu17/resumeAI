import { Link } from 'react-router-dom';
import BlogLayout from './BlogLayout.jsx';

export default function TailorResumeJobDescription() {
  return (
    <BlogLayout
      title="How to Tailor Your Resume to a Job Description (Step-by-Step)"
      description="Sending the same resume to every job is the most common mistake in a job search. Here is the exact process for customising your resume for each role to maximise both ATS score and recruiter interest."
      date="May 2025"
      readTime="8 min read"
      slug="tailor-resume-job-description"
      publishedDate="2025-05-04"
    >
      <p>
        The most common job search mistake is sending the same resume to every application.
        It is understandable. Tailoring takes time. But a generic resume is penalised twice:
        it scores lower in the ATS because the keyword match is poor, and it is less compelling
        to the recruiter because it does not speak specifically to their role.
      </p>
      <p>
        The good news is that tailoring does not require rewriting your resume from scratch.
        It requires a 15 to 20 minute editing process applied to a solid base resume.
        Here is exactly how to do it.
      </p>

      <h2>Step 1: Check your ATS score before you do anything else</h2>
      <p>
        Before editing, know where you stand. Upload your current resume and the job description
        to <Link to="/">Shortlisted</Link> and get your baseline ATS score. This takes about
        30 seconds and tells you two critical things:
      </p>
      <ul>
        <li>Your current match percentage for this specific role</li>
        <li>The exact keywords from the job description that are missing from your resume</li>
      </ul>
      <p>
        Starting with a diagnostic prevents you from editing blind. You might spend 20 minutes
        rewriting bullets and still miss the specific terms the ATS is looking for. The keyword
        gap list tells you exactly what to add.
      </p>

      <h2>Step 2: Analyse the job description thoroughly</h2>
      <p>
        Read the full job description, not just the title and the first paragraph. Job descriptions
        contain the information you need to customise effectively:
      </p>
      <ul>
        <li>
          <strong>Required qualifications vs. preferred.</strong> Required means the ATS will
          weight these heavily. If you have them, they must appear in your resume.
          Preferred qualifications are lower priority but worth including if you have them.
        </li>
        <li>
          <strong>Specific tools and technologies.</strong> "Tableau" is not the same as
          "data visualisation experience" in ATS scoring. List the specific tools.
        </li>
        <li>
          <strong>Recurring phrases.</strong> If "stakeholder alignment" appears three times,
          it is a priority keyword. Frequency indicates importance.
        </li>
        <li>
          <strong>The seniority signals.</strong> Does the description say "drive," "architect,"
          "own," or "support," "assist," "contribute"? Match the seniority level in your language.
        </li>
      </ul>

      <h2>Step 3: Update your skills section</h2>
      <p>
        The skills section is the highest-weight area for ATS keyword matching. This is the
        first place to add keywords you identified in step 2.
      </p>
      <p>
        If the job description lists "Salesforce CRM" and you have Salesforce experience,
        add "Salesforce CRM" to your skills section explicitly. Do not assume the ATS will
        infer it from a bullet point about "managing customer relationships."
      </p>
      <p>
        Add methodologies as well. If the job requires Agile and you have used it but never
        listed it in your skills, add it.
      </p>

      <h2>Step 4: Rewrite your most recent experience bullets</h2>
      <p>
        Your most recent role carries the most weight. This is where the editing effort pays
        off the most. For each bullet, ask two questions:
      </p>
      <ol>
        <li>Does this bullet contain any of the keywords I identified from the job description?</li>
        <li>Can I accurately rewrite it to include those keywords without fabricating anything?</li>
      </ol>
      <p>
        Example: you have a bullet that reads "Managed vendor relationships and coordinated
        quarterly business reviews." If the job description mentions "vendor management" and
        "executive communication," you can rewrite this as "Managed vendor relationships
        and led executive-facing quarterly business reviews" without changing what you did.
        You are translating your experience into the employer's language.
      </p>
      <p>
        Important constraint: only rewrite bullets to add keywords that accurately reflect
        the scope of the work. Do not add keywords for skills you cannot speak to in an interview.
      </p>

      <h2>Step 5: Update your resume summary</h2>
      <p>
        If your resume has a two to three sentence summary at the top, this is a high-visibility
        area for both ATS scoring and human review. Rewrite it to mirror the target role:
      </p>
      <ul>
        <li>Use the job title they are hiring for (or a close equivalent)</li>
        <li>Include one or two of the most important keywords from the job description</li>
        <li>Reference the type of company or industry they operate in if relevant</li>
      </ul>
      <p>
        Example for a Marketing Manager role at a B2B SaaS company: "Marketing Manager with 6 years
        of experience driving demand generation and pipeline growth for B2B SaaS companies.
        Specialised in content strategy, SEO, and paid acquisition with a track record of
        reducing CAC while scaling MQL volume."
      </p>

      <h2>Step 6: Check your score again</h2>
      <p>
        After making changes, run your updated resume through the ATS checker again.
        Your score should have improved. If specific keywords are still missing that you know
        you have experience with, find the right place to add them.
      </p>
      <p>
        The goal is not a perfect score. Most roles do not require every keyword to match.
        Getting from 40% to 70% is a significant improvement that substantially increases
        your chances of reaching human review. Getting from 70% to 95% often requires adding
        keywords for skills you genuinely do not have, which is counterproductive.
      </p>

      <h2>Step 7: Review the format for ATS compatibility</h2>
      <p>
        Keyword optimisation is wasted if the ATS cannot parse your resume correctly.
        Before submitting, confirm:
      </p>
      <ul>
        <li>Single-column layout (no two-column templates)</li>
        <li>No tables, text boxes, or images containing text</li>
        <li>Contact information in the body, not the header/footer</li>
        <li>Standard section names: Work Experience, Skills, Education</li>
        <li>Saved as a text-based PDF (not a scanned image)</li>
      </ul>
      <p>
        For the full formatting guide, see{' '}
        <Link to="/blog/ats-resume-format">the ATS resume format that gets past screening</Link>.
      </p>

      <h2>How long should this process take?</h2>
      <p>
        For each application: 15 to 25 minutes if you have a solid base resume and have done
        this process a few times. The first time takes longer because you are learning the pattern.
        By your fifth application, the process is efficient.
      </p>
      <p>
        The time investment pays off. A tailored resume typically scores 20 to 40 percentage
        points higher in ATS scoring than a generic version. More importantly, when the tailored
        resume reaches a recruiter, it speaks specifically to their role rather than being
        a generic document they have to work to connect to the posting.
      </p>

      <h2>What to keep consistent across applications</h2>
      <p>
        Not everything should change with each application. Keep consistent:
      </p>
      <ul>
        <li>Your contact information and header</li>
        <li>Your education section</li>
        <li>Bullet points that describe quantifiable achievements (numbers do not need to change)</li>
        <li>The overall format and length</li>
      </ul>
      <p>
        What changes with each application: the skills section (keywords added for this specific role),
        the summary (rewritten for this specific role), and select bullet points in your most recent
        experience (reworded to mirror the job description language).
      </p>
      <p>
        For more on keywords and how to identify them, see our guide on{' '}
        <Link to="/blog/ats-resume-keywords">ATS resume keywords and where to use them</Link>.
      </p>
      <div className="callout">
        <p>
          <strong>Start with your ATS score.</strong> Upload your resume and the job description
          to Shortlisted. See exactly which keywords are missing before you start editing.
          Free, no account needed.{' '}
          <Link to="/">Get your free score.</Link>
        </p>
      </div>
    </BlogLayout>
  );
}
