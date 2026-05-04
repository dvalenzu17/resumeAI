import { Link } from 'react-router-dom';
import BlogLayout from './BlogLayout.jsx';

export default function ResumeKeywordsMissing() {
  return (
    <BlogLayout
      title="Why Your Resume Gets Rejected Before Anyone Reads It"
      description="You are qualified. You apply. You hear nothing. The problem is not your experience. It is that a piece of software filtered you out before a human ever saw your name. Here is what is happening and how to fix it."
      date="May 2025"
      readTime="6 min read"
      slug="resume-keywords-missing"
      publishedDate="2025-05-04"
    >
      <p>
        You know you are a strong candidate for this role. You have done the work. You have the
        experience they are asking for. You spend an hour on the application, tailor your cover
        letter, and hit submit. Then nothing. No rejection email. No interview request.
        Complete silence.
      </p>
      <p>
        This is not a rejection. It is a filter. And the filter is automated.
      </p>

      <h2>The automated screening layer most candidates do not know exists</h2>
      <p>
        Before any recruiter sees your application, software makes the first decision about
        whether you are worth their time. This software is called an Applicant Tracking System,
        or ATS. Workday, Greenhouse, Lever, iCIMS, Taleo. If you have applied to any company
        with more than 50 employees, your resume went through one of these systems.
      </p>
      <p>
        The ATS parses your resume, scores it against the job description using keyword matching,
        and places you in a ranked queue. Recruiters filter this queue by score. If you are
        below the threshold, they never scroll to your application. You are not rejected.
        You simply are not seen.
      </p>
      <p>
        This is why qualified candidates can apply to 50 jobs and hear nothing. It is also
        why less qualified candidates who understand how ATS scoring works get more interviews.
        The system rewards keyword alignment, not experience quality.
      </p>

      <h2>The specific things that cause ATS rejection</h2>

      <h3>Missing keywords</h3>
      <p>
        This is the most common reason. The job description uses specific terms for skills,
        tools, and methodologies. Your resume uses different words to describe the same things.
        The ATS scores keyword overlap, so different words means a lower score even if the
        underlying experience is equivalent.
      </p>
      <p>
        If the job description says "project management" and your resume says "managed multiple
        projects simultaneously," many ATS systems will not count that as a match. They look
        for the specific phrase.
      </p>
      <p>
        If the job says "Salesforce" and you wrote "CRM software," that is a miss. If the
        job says "Agile methodology" and you wrote "fast-paced environment," that is a miss.
        Every one of these misses costs points.
      </p>

      <h3>Formatting that prevents parsing</h3>
      <p>
        The ATS cannot score keywords it cannot read. If your resume uses a two-column layout,
        tables, text boxes, or has text embedded in graphics, large portions of your content
        may be invisible to the parser.
      </p>
      <p>
        You might have all the right keywords. They might be in a table or a sidebar that the
        ATS cannot extract. The parser gets a partial view of your resume and scores you on
        what it can read. The result is a low score that has nothing to do with your qualifications.
      </p>

      <h3>Scanned or image-based PDFs</h3>
      <p>
        If your PDF was created from a scan, or exported from a design tool in a way that
        produces an image rather than selectable text, the ATS receives essentially a blank
        document. No text extraction is possible. Your score is near zero regardless of your
        experience.
      </p>
      <p>
        Test this yourself: open your resume PDF and try to highlight and copy text. If you
        cannot select the text, the ATS cannot read it either.
      </p>

      <h3>Job title gaps</h3>
      <p>
        ATS systems compare your most recent job title against the target role. A significant
        gap in seniority or function can lower your score even if your responsibilities were
        well-aligned. If your title was "Marketing Coordinator" and you are applying for a
        "Marketing Manager" role, the system notes the title gap.
      </p>
      <p>
        The fix is not falsifying your title. It is ensuring that your bullet points explicitly
        describe the scope and responsibilities that bridge that gap. "Managed a team of three,
        oversaw campaign budget of $200k, reported directly to CMO" in your bullets provides
        the context that the title alone does not.
      </p>

      <h3>Non-standard section naming</h3>
      <p>
        ATS systems are trained on standard section names. "Work Experience," "Skills,"
        "Education." If you named your sections "My Journey," "What I Know," or "Professional
        Story," the ATS may fail to categorise the content correctly. The work experience
        content might not be parsed as work experience, and the keyword scoring for those
        sections may not apply.
      </p>

      <h2>How to know if this is happening to you</h2>
      <p>
        If you are applying consistently to roles you are qualified for and hearing nothing,
        ATS scoring is the most likely explanation. The diagnostic is fast.
      </p>
      <p>
        Upload your resume and a job description to <Link to="/">Shortlisted</Link>. Your ATS
        compatibility score will show immediately. More importantly, the keyword gap list will
        show exactly which terms from the job description are missing from your resume.
        This is the specific, actionable information you need.
      </p>
      <p>
        If your score is below 50%, you are likely being filtered out before human review
        on most applications. If your score is above 70%, you are probably reaching recruiters
        but competing on resume quality and interview performance from there.
      </p>

      <h2>The fix is simpler than most candidates assume</h2>
      <p>
        You do not need to rewrite your resume from scratch. You need to:
      </p>
      <ol>
        <li>Fix the formatting so the ATS can actually parse your content (see{' '}
          <Link to="/blog/ats-resume-format">ATS resume format guide</Link>)</li>
        <li>Identify the specific keywords from each job description and add them where you have the experience</li>
        <li>Use the exact phrasing from the job description rather than paraphrasing</li>
        <li>Check your score before you submit</li>
      </ol>
      <p>
        For most candidates, doing this consistently increases their interview rate significantly.
        The candidates who struggle most are those who send the same static resume to every job
        and wonder why the results are inconsistent.
      </p>
      <p>
        See our complete step-by-step guide on{' '}
        <Link to="/blog/tailor-resume-job-description">how to tailor your resume to each job description</Link>,
        and our article on{' '}
        <Link to="/blog/what-is-ats">what an ATS is and how it works</Link> for a deeper
        explanation of the scoring mechanics.
      </p>
      <div className="callout">
        <p>
          <strong>Find out exactly why your resume is being filtered.</strong> Upload your resume
          and any job description to Shortlisted. See your ATS score and the exact keyword gaps
          in 30 seconds. Free, no account needed.{' '}
          <Link to="/">Check your score now.</Link>
        </p>
      </div>
    </BlogLayout>
  );
}
