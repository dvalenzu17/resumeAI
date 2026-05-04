import { Link } from 'react-router-dom';
import BlogLayout from './BlogLayout.jsx';

export default function AtsScoreMeaning() {
  return (
    <BlogLayout
      title="What Does Your ATS Score Actually Mean?"
      description="An ATS score is a number between 0 and 100. Here is what the different score ranges actually indicate, which factors drive the score, and what to prioritise when your score is too low."
      date="May 2025"
      readTime="6 min read"
      slug="ats-score-meaning"
      publishedDate="2025-05-04"
    >
      <p>
        You run your resume through an ATS checker and get a score. Now what? A number between
        0 and 100 tells you something, but the question is what it tells you and what you should
        do about it.
      </p>
      <p>
        ATS scores are not standardised across tools. The underlying methodology varies.
        But the core signal is consistent: a higher score means your resume matches the job
        description more closely on the factors that ATS systems actually evaluate.
        Here is how to interpret the ranges and act on the result.
      </p>

      <h2>What an ATS score measures</h2>
      <p>
        An ATS compatibility score is a weighted measure of how well your resume matches a
        specific job description. The primary factors are:
      </p>
      <ul>
        <li><strong>Keyword match rate.</strong> What percentage of the specific terms in the job description appear in your resume. This is typically the highest-weighted factor.</li>
        <li><strong>Skills alignment.</strong> Do your listed skills match the skills the job requires? Hard skills carry more weight than soft skills.</li>
        <li><strong>Job title alignment.</strong> How closely does your most recent job title match the target role?</li>
        <li><strong>Experience level match.</strong> Do your years of experience align with what the job requires?</li>
        <li><strong>Education requirements.</strong> Does your education match what the job specifies (degree level, field of study)?</li>
        <li><strong>Industry terminology.</strong> Does your resume use the vocabulary of this industry and role?</li>
        <li><strong>Formatting parseability.</strong> Can the ATS extract your content correctly, or are there layout issues reducing what gets scored?</li>
      </ul>

      <h2>Score ranges and what they mean</h2>

      <h3>Below 40%: High risk of automatic filtering</h3>
      <p>
        A score below 40% indicates a significant mismatch between your resume and the job
        description. At this score, you are likely being filtered out before any human sees
        your application at companies that use strict ATS filtering.
      </p>
      <p>
        This score range usually indicates one of three problems: keyword mismatch (you are
        describing your experience in different language than the job description uses),
        formatting failures (the ATS cannot parse large sections of your resume), or a genuine
        experience gap where you are missing several of the required qualifications.
      </p>
      <p>
        First step: check your formatting. A low score caused by a parsing failure (text in tables,
        two-column layout, image-based PDF) is the easiest fix. After fixing formatting, check
        the keyword gap list. If you have the experience but your resume uses different terminology,
        adding the specific terms from the job description can move your score significantly.
      </p>

      <h3>40% to 60%: Risky territory</h3>
      <p>
        In this range, your resume is reaching some recruiters but missing others. Companies
        with high application volume and strict filtering may not send your application to
        a human reviewer. Companies with lower volume or more flexible filtering might.
      </p>
      <p>
        The gap between 40% and 60% is usually addressable. Common causes: your skills section
        is missing terms that are in the job description, your work experience bullets use
        paraphrased language instead of the job description's exact phrasing, or you are
        missing a few key industry-specific terms.
      </p>
      <p>
        At this score, the keyword gap list is your priority. Identify the highest-frequency
        missing terms, confirm you have the underlying experience, and add them to your resume.
      </p>

      <h3>60% to 75%: Competitive but not optimal</h3>
      <p>
        Most candidates who reach human review land in this range. Your resume is parsing
        correctly and covering most of the core requirements. In high-volume applications,
        you are getting through. In competitive roles with many applicants, you may be
        losing the ranking to candidates at 80% or above.
      </p>
      <p>
        At this score, the remaining gaps are typically in preferred qualifications, less common
        industry terms, or specific tools and methodologies. Adding these, if you have the
        experience, can move you into the top tier.
      </p>

      <h3>75% to 90%: Strong</h3>
      <p>
        This score range means your resume is well-aligned to the job description. The ATS
        will rank you highly, and you are consistently reaching human reviewers. From here,
        the differentiating factor shifts to the quality of your bullets, your quantified
        achievements, and your performance in the recruiter screen.
      </p>
      <p>
        The marginal gains from keyword optimisation at this score level are smaller. Focus
        more on making your experience bullets compelling and specific rather than chasing
        the remaining keyword gaps.
      </p>

      <h3>Above 90%: Very high, verify authenticity</h3>
      <p>
        A score above 90% is achievable when your background is an excellent fit for the role.
        If your score is this high but you are not getting interviews, the ATS score is no
        longer the bottleneck. The issue is likely at the human review stage: the resume
        quality, the cover letter, or the application volume at that company.
      </p>
      <p>
        Note: Shortlisted caps scores at 95%. No resume is a perfect match because job descriptions
        always include some requirements that even the best-qualified candidates will not check
        every box on. A score above 95% would suggest the matching is not rigorous.
      </p>

      <h2>What to prioritise based on your score</h2>
      <p>
        The action items differ significantly by score range:
      </p>
      <ul>
        <li>
          <strong>Under 40%:</strong> Fix formatting first. Then add the top 5 missing keywords
          from the job description that you actually have experience with. Re-check.
        </li>
        <li>
          <strong>40% to 60%:</strong> Focus on the keyword gap list. Add skills section entries
          and update your most recent bullets to use the job description's language.
          See our guide on <Link to="/blog/tailor-resume-job-description">tailoring your resume to a job description</Link>.
        </li>
        <li>
          <strong>60% to 75%:</strong> Identify the remaining gaps. Add preferred qualifications
          you have. Consider whether the remaining gaps represent skills you genuinely need
          to develop to be competitive in this role type.
        </li>
        <li>
          <strong>Above 75%:</strong> Stop optimising keywords. Focus on the quality of your
          experience bullets, your quantified achievements, and your interview preparation.
        </li>
      </ul>

      <h2>The score is job-specific</h2>
      <p>
        Your ATS score for one job description tells you nothing about how you would score
        against a different posting for the same job title at a different company. The keywords
        differ. The requirements differ. The seniority expectations differ.
      </p>
      <p>
        This is why every application needs a customised resume. A score of 80% for a Product
        Manager role at Company A does not mean your resume will score 80% for the same title
        at Company B. Check each application separately.
      </p>
      <p>
        For more context on how the scoring works, see our guide on{' '}
        <Link to="/blog/what-is-ats">what an ATS is and how it scores your resume</Link>,
        and for a deeper look at keywords specifically, see{' '}
        <Link to="/blog/ats-resume-keywords">ATS resume keywords and how to use them correctly</Link>.
      </p>
      <div className="callout">
        <p>
          <strong>See your actual ATS score right now.</strong> Shortlisted scores your resume
          against any job description across seven weighted factors and tells you exactly what
          to improve. The first check is free with no account required.{' '}
          <Link to="/">Get your free ATS score.</Link>
        </p>
      </div>
    </BlogLayout>
  );
}
