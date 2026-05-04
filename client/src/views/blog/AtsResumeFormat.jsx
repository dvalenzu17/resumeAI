import { Link } from 'react-router-dom';
import BlogLayout from './BlogLayout.jsx';

export default function AtsResumeFormat() {
  return (
    <BlogLayout
      title="ATS Resume Format: The Only Template That Gets Past Screening"
      description="Most resume templates fail ATS screening before the recruiter ever sees them. Here is the exact format that parses correctly, what to avoid, and why the rules are stricter than most candidates realise."
      date="May 2025"
      readTime="7 min read"
      slug="ats-resume-format"
      publishedDate="2025-05-04"
    >
      <p>
        The resume template you downloaded from Canva or Etsy is probably hurting your ATS score.
        Not because the design is bad, but because design-heavy templates use elements that ATS
        parsers cannot read: tables, text boxes, columns, and graphics. The result is a resume
        that looks polished to a human but reads as garbled or empty to the software that
        scores it first.
      </p>
      <p>
        The format that works for ATS is not the most visually interesting format. It is plain,
        structured, and consistent. Here is exactly what it looks like and why every rule exists.
      </p>

      <h2>The non-negotiable formatting rules</h2>

      <h3>Single-column layout only</h3>
      <p>
        Two-column resume layouts are the most common formatting failure. They look clean to a
        human reader but destroy ATS parsing. The parser reads text left to right across the
        full width of the page. In a two-column layout, it reads the left column's content
        mixed with the right column's content, producing garbled output where skills get
        mixed into job titles and dates appear in the wrong fields.
      </p>
      <p>
        Use a single-column layout. All content flows from top to bottom in one column.
        No sidebars. No skill bars on the left with experience on the right.
      </p>

      <h3>No tables</h3>
      <p>
        Tables are commonly used in resume templates to align skills side by side or to
        create neat columns of information. ATS parsers often skip table content entirely
        or extract it in the wrong order. Any skills or experience you put inside a table
        may be invisible to the ATS.
      </p>
      <p>
        If you want to list multiple skills in a row, use comma-separated text or a simple
        unordered list, not a table.
      </p>

      <h3>No text boxes</h3>
      <p>
        Text boxes in Word or Google Docs behave similarly to tables for ATS purposes.
        Content inside a text box is often not extracted at all during parsing. If you have
        contact information, a summary, or key achievements in a text box, the ATS will
        not see them.
      </p>

      <h3>No graphics, icons, or images</h3>
      <p>
        Design elements like icons next to section headers, profile photos, skill bars,
        progress indicators, and any other graphical elements add zero value for ATS parsing.
        Any text that is part of an image (logos, infographic-style skill lists) is completely
        invisible to the parser.
      </p>
      <p>
        This includes the common practice of showing language proficiency or skill level with
        a visual bar or stars. Those visual ratings are meaningless to the ATS.
      </p>

      <h3>Standard section headers</h3>
      <p>
        ATS systems are trained to recognise standard resume sections. "Work Experience,"
        "Professional Experience," "Skills," "Education," "Certifications" are all recognised.
        Creative alternatives are not.
      </p>
      <p>
        Do not use: "My Story," "What I Bring," "Career Highlights," "Skills I Have," or any
        other non-standard phrasing. The ATS may fail to categorise the content in that section
        correctly, and the content may not score in the right context.
      </p>

      <h3>Contact information in the body, not the header/footer</h3>
      <p>
        Many Word and Google Docs templates place contact information in the document header.
        This looks neat and keeps the header consistent across pages, but ATS systems frequently
        skip document headers and footers during parsing. Your name, phone number, and email
        may not be extracted at all.
      </p>
      <p>
        Put your contact information at the top of the main body text, not in a document
        header or footer.
      </p>

      <h3>Save as a text-based PDF</h3>
      <p>
        A PDF created from a Word or Google Docs export is text-based. The ATS can extract
        the text directly. A PDF created from a scanned physical document or a photo is
        image-based. There is no extractable text. The ATS receives essentially a blank document.
      </p>
      <p>
        Always export your resume as PDF from the original document, never from a scan.
        If you received your resume as a scanned PDF (for example, an older version you scanned),
        reformat it in a text editor before submitting.
      </p>

      <h3>Standard fonts</h3>
      <p>
        Specialty or decorative fonts can cause rendering issues in some ATS systems, particularly
        if the font is not embedded in the PDF correctly. Use standard fonts: Calibri, Arial,
        Times New Roman, Georgia, Garamond, or Helvetica. These render correctly across all systems.
      </p>
      <p>
        Font size for body text should be 10 to 12 points. Headers can be larger. Smaller than
        10 points creates readability issues for human reviewers even if the ATS can parse it.
      </p>

      <h2>The correct section order</h2>
      <p>
        ATS systems generally expect to find sections in a certain order. The standard structure
        that performs best:
      </p>
      <ol>
        <li>Contact information (name, phone, email, LinkedIn, location)</li>
        <li>Professional summary (2 to 3 sentences targeting the specific role)</li>
        <li>Skills (explicitly listed hard skills, tools, methodologies)</li>
        <li>Work experience (reverse chronological, most recent first)</li>
        <li>Education</li>
        <li>Certifications (if applicable)</li>
        <li>Volunteer work or publications (if directly relevant)</li>
      </ol>
      <p>
        Placing the skills section above work experience is strategically important. The ATS
        typically weights the skills section highly for keyword matching. Having it near the top
        ensures the parser encounters your key skills early in the document.
      </p>

      <h2>What about work experience bullets?</h2>
      <p>
        Bullet points should be concise, specific, and achievement-oriented where possible.
        For ATS purposes, they also need to contain the specific keywords from the job description.
        A bullet that reads well to a human but uses none of the job description's terminology
        is a missed keyword opportunity.
      </p>
      <p>
        Each bullet should ideally follow the format: action verb + specific scope + quantified result.
        "Increased email open rates by 34% by redesigning the A/B testing framework for a 400k subscriber list."
        This contains a keyword (A/B testing), a metric (34%), and scope (400k subscribers) that are
        all useful for both ATS scoring and human review.
      </p>

      <h2>Resume length</h2>
      <p>
        For ATS purposes, length matters less than formatting and keyword density. One page is standard
        for candidates with under 7 years of experience. Two pages is acceptable for senior candidates
        with substantial relevant experience to include. Beyond two pages, the additional content
        typically adds marginal ATS value while increasing the cognitive load on the human reviewer.
      </p>

      <h2>Templates that work and templates that do not</h2>
      <p>
        Templates from Canva, Etsy, Creative Market, and most design-focused platforms fail ATS
        requirements. They use columns, graphics, and design elements for visual appeal at the
        expense of parseability.
      </p>
      <p>
        Templates that work: Microsoft Word's built-in resume templates (the simple, single-column ones),
        Google Docs' basic resume templates, and resume builders that explicitly advertise ATS compatibility.
        When in doubt, start from a blank document and build the structure yourself.
      </p>
      <p>
        After formatting correctly, the next step is keyword optimisation. See our guide on{' '}
        <Link to="/blog/ats-resume-keywords">how to find and use ATS resume keywords</Link> and
        the step-by-step process for{' '}
        <Link to="/blog/tailor-resume-job-description">tailoring your resume to a job description</Link>.
      </p>
      <div className="callout">
        <p>
          <strong>Check if your resume is parsing correctly.</strong> Upload it to Shortlisted with
          any job description. Your score will indicate whether the ATS is reading your content
          or hitting formatting failures. Free, no account required.{' '}
          <Link to="/">Run your free check.</Link>
        </p>
      </div>
    </BlogLayout>
  );
}
