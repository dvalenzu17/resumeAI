import { Link } from 'react-router-dom';
import BlogLayout from './BlogLayout.jsx';

export default function WhatIsAts() {
  return (
    <BlogLayout
      title="What Is an ATS? How Applicant Tracking Systems Actually Work"
      description="Before a human recruiter ever sees your resume, software decides whether it is worth their time. Here is exactly how that software works and why it matters for every job you apply to."
      date="May 2025"
      readTime="7 min read"
      slug="what-is-ats"
      publishedDate="2025-05-04"
    >
      <p>
        You apply for a job. You have the right experience. You spent an hour customising the resume. Then nothing.
        No rejection, no interview, no response. The application disappears into a void.
      </p>
      <p>
        In most cases, your resume never reached a human. It was filtered out by an Applicant Tracking System,
        commonly shortened to ATS. Understanding what an ATS is and how it works is the single most
        important thing a job seeker can do before sending another application.
      </p>

      <h2>What is an ATS?</h2>
      <p>
        An Applicant Tracking System is software that companies use to receive, organise, and screen job applications
        at scale. It is a database with a workflow layer on top. When you click the apply button on a job posting,
        your resume goes directly into an ATS.
      </p>
      <p>
        The major players are Workday, Greenhouse, Lever, iCIMS, Taleo, BambooHR, and SmartRecruiters.
        If you have ever applied through a company careers page or a job board like LinkedIn or Indeed,
        you have submitted your resume into one of these systems.
      </p>
      <p>
        Companies use ATS software because hiring volume makes manual screening impractical. A single
        corporate job posting can receive 200 to 500 applications within 72 hours. No recruiter team
        can manually review that volume. The ATS filters the pile before a human touches it.
      </p>

      <h2>What an ATS does to your resume</h2>
      <p>
        When your application arrives, the ATS immediately performs three operations:
      </p>
      <ol>
        <li>
          <strong>Parsing.</strong> The ATS extracts text from your PDF or Word document and attempts to
          categorise it into structured fields: name, contact information, job titles, company names, dates,
          education, and skills. This is called resume parsing, and it is imperfect.
        </li>
        <li>
          <strong>Scoring.</strong> The parsed text is compared against the job description using keyword
          matching algorithms. How many required skills appear in your resume? Does your most recent job title
          resemble the role you are applying for? Do your years of experience align with what the posting requires?
          Each match earns points. Missing keywords cost points.
        </li>
        <li>
          <strong>Ranking.</strong> Your application is assigned a score and placed in a sorted queue.
          Recruiters typically filter this queue by score and only open applications above a threshold.
          If your score puts you at position 150 and the recruiter reviews the top 30, your resume
          is never seen regardless of your qualifications.
        </li>
      </ol>

      <h2>How widespread is ATS use?</h2>
      <p>
        According to industry surveys, over 98% of Fortune 500 companies use an ATS. Among mid-sized companies
        with 50 or more employees, ATS adoption is above 75%. Even many small businesses use basic applicant
        tracking through tools like BambooHR or Workable.
      </p>
      <p>
        If you are applying to any company that posts jobs online and receives more than a handful of
        applications, you are almost certainly being screened by an ATS first.
      </p>

      <h2>Why resumes get rejected before a human sees them</h2>
      <p>
        There are two main reasons an ATS rejects a resume: keyword mismatch and formatting failures.
      </p>
      <h3>Keyword mismatch</h3>
      <p>
        The ATS compares your resume against the job description using keyword logic. If the job description
        says "project management" and your resume says "managing projects," most ATS systems will not count
        that as a match. They look for the specific phrase or close variants.
      </p>
      <p>
        This creates a counterintuitive problem. Resume advice that emphasises compelling narrative, strong
        action verbs, and show-don't-tell storytelling can actually lower your ATS score. "Drove operational
        excellence across cross-functional teams" is impressive to a human reader. But if the job description
        says "PMP certification, Agile, JIRA, sprint planning," and none of those terms appear in your resume,
        the ATS will score you poorly on keyword match regardless.
      </p>
      <h3>Formatting failures</h3>
      <p>
        ATS parsers are not perfect. They struggle to extract text from certain resume layouts that look
        fine to a human but confuse the parser. Common formatting failures include:
      </p>
      <ul>
        <li><strong>Two-column layouts.</strong> The parser reads left to right across columns, producing garbled output that misattributes skills and job titles.</li>
        <li><strong>Tables.</strong> Content inside tables is often skipped entirely or extracted in the wrong order.</li>
        <li><strong>Graphics and icons.</strong> Any text embedded in images, Canva designs, or SVG elements is invisible to the parser.</li>
        <li><strong>Headers and footers.</strong> Contact information placed in the document header or footer is frequently missed.</li>
        <li><strong>Non-standard section names.</strong> Naming your work history "My Journey" or "Professional Story" may cause the ATS to not recognise it as work experience at all.</li>
        <li><strong>Scanned PDFs.</strong> If your PDF was created from an image or physical scan rather than digital text, there is no extractable text and the resume receives a near-zero score.</li>
      </ul>

      <h2>Does the ATS read every word?</h2>
      <p>
        The ATS reads every word it can successfully parse, but it weights different sections differently.
        The skills section is typically parsed first and weighted most heavily. Your most recent job title
        is compared against the target role. Work experience bullets are scanned for keywords but weighted
        less than the dedicated skills section.
      </p>
      <p>
        Some ATS systems also weight keyword placement. A skill listed in your skills section scores higher
        than the same skill buried in a bullet point from five years ago. Recency matters.
      </p>

      <h2>What ATS systems cannot do</h2>
      <p>
        It is worth understanding the limits of what ATS systems evaluate. They are not judging the
        quality of your work, the impact of your achievements, or whether you would be a cultural fit.
        They are doing pattern matching on text.
      </p>
      <p>
        This means a mediocre candidate with a keyword-rich, well-formatted resume can score higher
        than an excellent candidate whose resume is poorly matched to the job description. Passing the ATS
        is a necessary condition for getting an interview, not a sufficient one. But failing it means
        the human quality of your resume is irrelevant.
      </p>

      <h2>How to beat an ATS (the short version)</h2>
      <p>
        The strategy is straightforward even if the execution requires work:
      </p>
      <ul>
        <li>Use a single-column layout with standard fonts and no graphics.</li>
        <li>Use standard section headers: Work Experience, Skills, Education.</li>
        <li>Read the job description carefully and identify the specific skills, tools, and qualifications listed.</li>
        <li>Mirror the exact phrasing from the job description in your resume where the experience is real.</li>
        <li>Put your strongest matching skills in a dedicated skills section near the top.</li>
        <li>Check your ATS score before you submit.</li>
      </ul>
      <p>
        For a deeper breakdown of tactics, see our guide on{' '}
        <Link to="/blog/how-to-beat-ats">how to beat ATS systems without keyword stuffing</Link> and
        our article on <Link to="/blog/ats-resume-format">the ATS resume format that gets past screening</Link>.
      </p>

      <h2>The most important thing to understand</h2>
      <p>
        A resume is not a single document you send everywhere. It is a template you customise for each application.
        The keywords that score well for a product manager role at a fintech company are different from those
        that score well for the same role at a healthcare startup. The job descriptions are different.
        The required terminology is different.
      </p>
      <p>
        Every application needs a customised resume. The candidates who get interviews are the ones who
        do this work consistently. Most do not.
      </p>
      <div className="callout">
        <p>
          <strong>Want to know your actual ATS score right now?</strong> Shortlisted compares your resume
          against any job description and shows you your score, every keyword gap, and what to fix.
          The first check is free and takes 30 seconds.{' '}
          <Link to="/">Run your free ATS check.</Link>
        </p>
      </div>
    </BlogLayout>
  );
}
