import { Link } from 'react-router-dom';
import BlogLayout from './BlogLayout.jsx';

export default function HowAtsSystemsWork() {
  return (
    <BlogLayout
      title="How ATS Systems Actually Work — And Why Your Resume Keeps Getting Filtered"
      description="Most job seekers have no idea that a piece of software rejects their resume before a human ever sees it. Here is exactly how it works, and what you can do about it."
      date="April 2025"
    >
      <p>
        You spend two hours tailoring your resume. You hit submit. You get nothing back. Not even a rejection email.
        The job was posted three days ago and you were qualified. What happened?
      </p>
      <p>
        A piece of software called an Applicant Tracking System (ATS) parsed your resume,
        scored it against the job description, and ranked it below the cutoff threshold. A human never saw it.
      </p>

      <h2>What an ATS actually does</h2>
      <p>
        An ATS is a database and workflow system that companies use to manage job applications.
        Workday, Greenhouse, Lever, iCIMS, Taleo — these are the major players. When you click "Apply,"
        your resume goes directly into one of these systems.
      </p>
      <p>
        The ATS does three things to your resume immediately:
      </p>
      <ol>
        <li><strong>Parse it.</strong> It extracts text from your PDF or Word document and breaks it into structured fields: job titles, company names, dates, skills, education.</li>
        <li><strong>Score it.</strong> It compares the extracted text against the job description using keyword matching. How many required skills appear in your resume? How closely does your job title match? Do your years of experience align with what the posting requires?</li>
        <li><strong>Rank it.</strong> It assigns a score and places your application in a queue. Recruiters typically filter this queue by score and only review applications above a threshold.</li>
      </ol>
      <p>
        At large companies, a recruiter might receive 500 applications for a single role. They will review the top 50.
        If your ATS score puts you at position 200, your resume is never seen.
      </p>

      <h2>How keyword matching actually works</h2>
      <p>
        The most common misconception is that ATS systems are sophisticated AI that understand context.
        Most are not. They do string matching.
      </p>
      <p>
        If the job description says "project management" and your resume says "managing projects,"
        many ATS systems will not count that as a match. They are looking for the exact phrase or very close variants.
      </p>
      <p>
        This is why resume advice like "show don't tell" and "use strong action verbs" can actually hurt you
        in ATS scoring. "Led cross-functional teams to deliver on-time results" is compelling to a human reader.
        But if the job description says "Agile methodology, Scrum, sprint planning" and none of those words
        appear in your resume, you will score poorly regardless of how well-written your bullets are.
      </p>

      <h2>The sections that matter most to ATS</h2>
      <p>
        ATS systems weight different sections differently. Here is roughly how they prioritize:
      </p>
      <ul>
        <li><strong>Skills section.</strong> This is parsed first and weighted heavily. If the job requires Python and you have Python listed here, that is a direct match.</li>
        <li><strong>Job titles.</strong> Your job titles are compared against the role you are applying for. "Senior Software Engineer" applying for a "Staff Engineer" role has a smaller gap than "Junior Developer" applying for the same role.</li>
        <li><strong>Work experience bullet points.</strong> Keywords here count, but they are weighted less than the skills section.</li>
        <li><strong>Education.</strong> Degree level and field of study are parsed. This matters more for roles with specific educational requirements.</li>
        <li><strong>Resume header.</strong> Your name, location, and contact information. Some systems filter by location before anything else if the role is not remote.</li>
      </ul>

      <h2>What ATS systems cannot read</h2>
      <p>
        This is where many resumes die before scoring even begins. ATS parsers are not perfect.
        They struggle with certain formatting patterns that look fine to a human but break machine parsing:
      </p>
      <ul>
        <li><strong>Tables and columns.</strong> Content inside a table is often misread or skipped entirely. Two-column resume layouts are common in templates but are a parsing nightmare.</li>
        <li><strong>Text inside graphics or images.</strong> If you used Canva or a design-heavy template, any text embedded in graphics is invisible to the ATS.</li>
        <li><strong>Headers and footers.</strong> Contact information placed in the document header/footer is frequently missed.</li>
        <li><strong>Unusual fonts and special characters.</strong> Bullet points using non-standard characters (arrows, symbols) sometimes parse as garbage text.</li>
        <li><strong>PDFs with poor text extraction.</strong> If your PDF was created from a scan or image, the text may not be extractable at all. Always save your resume as a text-based PDF.</li>
      </ul>

      <h2>The scoring threshold problem</h2>
      <p>
        Different companies set different thresholds. A company with high application volume might only review
        applications that score above 80%. A smaller company might review everything above 50%.
        You do not know the threshold, and you cannot ask.
      </p>
      <p>
        What you can control is maximizing your score for every application you submit. That means
        your resume cannot be static. A resume optimized for a Product Manager role at a fintech company
        is not optimized for the same role at a healthcare startup. The job descriptions are different.
        The required keywords are different.
      </p>

      <h2>The human layer comes after</h2>
      <p>
        Passing the ATS does not mean you get an interview. It means a human recruiter now looks at your resume.
        The recruiter typically spends 6-10 seconds on the first pass. If the resume is hard to scan,
        if there are no measurable achievements, if the layout is cluttered, it goes in the no pile.
      </p>
      <p>
        This is the dual optimization problem: your resume needs to pass the machine first,
        then impress the human. Most resumes fail the machine entirely, so the human never gets a chance to care.
      </p>

      <div className="callout">
        <p>
          <strong>Want to know exactly how your resume scores?</strong> Shortlisted runs your resume against
          the job description you are applying for and tells you your ATS score, every keyword gap,
          and what to fix. The first score is free, takes 30 seconds, and requires no account.{' '}
          <Link to="/">Try it here.</Link>
        </p>
      </div>

      <h2>What to do right now</h2>
      <p>
        The fix is not complicated, but it requires effort for each application:
      </p>
      <ol>
        <li><strong>Read the job description word for word.</strong> Note the specific skills, tools, methodologies, and qualifications listed. These are your target keywords.</li>
        <li><strong>Check your resume against each one.</strong> If a required skill appears in the job description but not in your resume, add it — if you actually have that skill.</li>
        <li><strong>Use the exact phrasing from the job description where possible.</strong> If they say "stakeholder management," use that phrase, not "working with stakeholders."</li>
        <li><strong>Fix your resume format.</strong> Single-column, clean formatting, no tables, no graphics, standard section headers (Work Experience, Skills, Education).</li>
        <li><strong>Run it through an ATS checker</strong> before you submit. You should know your score before the system scores you.</li>
      </ol>
      <p>
        The job market is competitive. Most candidates skip this work.
        Doing it consistently is a significant advantage.
      </p>
    </BlogLayout>
  );
}
