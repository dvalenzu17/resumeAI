import { Link } from 'react-router-dom';
import BlogLayout from './BlogLayout.jsx';

export default function ResumeKeywords() {
  return (
    <BlogLayout
      title="The Exact Keywords Your Resume Is Missing (And How to Find Them)"
      description="ATS systems score your resume on keyword matches against the job description. Here is the systematic process for finding the right keywords and adding them without stuffing."

    >
      <p>
        The most common reason a qualified candidate's resume gets filtered out is not a weak work history.
        It is a keyword gap — a specific term that appears in the job description but not in the resume.
      </p>
      <p>
        ATS systems do not know you are qualified. They only know whether certain words appear in your document.
        If "cross-functional collaboration" is listed as a requirement and your resume says "worked with multiple teams,"
        you likely scored a zero on that criterion.
      </p>

      <h2>The difference between hard keywords and soft keywords</h2>
      <p>
        Not all keywords carry equal weight in ATS scoring. Understanding the difference helps you prioritize.
      </p>
      <p>
        <strong>Hard keywords</strong> are specific, unambiguous, and often required:
      </p>
      <ul>
        <li>Technical skills: Python, Kubernetes, GraphQL, Salesforce, SAP</li>
        <li>Certifications: PMP, CPA, AWS Certified Solutions Architect, CISSP</li>
        <li>Methodologies: Agile, Scrum, Six Sigma, Kanban</li>
        <li>Software: Figma, Jira, Tableau, HubSpot, Workday</li>
      </ul>
      <p>
        Missing a hard keyword that is listed as required or preferred is an almost certain filter.
        These are the first things to check.
      </p>
      <p>
        <strong>Soft keywords</strong> are phrasing around competencies and functions:
      </p>
      <ul>
        <li>"Stakeholder management" vs. "working with stakeholders"</li>
        <li>"P&L ownership" vs. "managed budget"</li>
        <li>"Hands-on technical leadership" vs. "led engineers"</li>
      </ul>
      <p>
        Soft keywords matter less in pure ATS scoring but significantly affect how a human recruiter
        perceives your resume. Getting both right means passing the machine and impressing the person.
      </p>

      <h2>The systematic keyword extraction process</h2>
      <p>
        Here is the process. It takes about 10 minutes per application and it works.
      </p>
      <h3>Step 1: Copy the full job description into a text document</h3>
      <p>
        Do not skim it. Copy the entire thing, including the parts about culture and benefits.
        Sometimes keywords are buried in sections that look like filler.
      </p>
      <h3>Step 2: Highlight every specific skill, tool, certification, and methodology</h3>
      <p>
        Go line by line. Mark anything that is specific and testable. "Strong communication skills" is too vague
        to optimize for. "Proficiency in SQL" is a keyword. "Experience with Salesforce CRM" is a keyword.
      </p>
      <h3>Step 3: Separate required from preferred</h3>
      <p>
        Most job descriptions split requirements into "required" (or "must have") and "preferred" (or "nice to have").
        Required keywords are critical. Preferred keywords should be added if you genuinely have them.
        Do not lie on your resume — it is not worth it and interviewers will find out.
      </p>
      <h3>Step 4: Check your resume against each keyword</h3>
      <p>
        Open your resume in one window and your keyword list in another.
        Check off each keyword that appears in your resume. The ones without checkmarks are your gaps.
      </p>
      <h3>Step 5: Add gaps — honestly and specifically</h3>
      <p>
        For each gap you can legitimately claim:
      </p>
      <ul>
        <li>If it is a skill you have but never wrote down: add it to your skills section and reference it in a relevant bullet.</li>
        <li>If it is a methodology you have used: name it explicitly. "Led sprint planning and retrospectives" becomes "Led Agile/Scrum sprint planning and retrospectives."</li>
        <li>If it is a tool you have used incidentally: add it to skills. "Familiarity with Tableau" is honest if you have built a dashboard before.</li>
      </ul>
      <p>
        Do not add keywords you cannot discuss in an interview. If you put "Kubernetes" on your resume
        and the interviewer asks you to describe your Kubernetes deployment experience, you need an answer.
      </p>

      <h2>Where to place keywords for maximum ATS impact</h2>
      <p>
        The same keyword placed in different sections of your resume carries different weight in ATS scoring.
      </p>
      <ul>
        <li><strong>Skills section: highest weight.</strong> This is parsed directly and compared against technical requirements. List every relevant skill here explicitly.</li>
        <li><strong>Bullet points in work experience: high weight.</strong> Keywords here get credit AND provide context that helps human reviewers. "Managed Kubernetes clusters serving 50M monthly requests" is better than just listing "Kubernetes" in skills.</li>
        <li><strong>Resume summary (if you have one): medium weight.</strong> A good place to include the job title you are applying for and 2-3 primary keywords.</li>
        <li><strong>Education section: lower weight for most roles.</strong> Unless the role requires specific educational credentials, this section matters less.</li>
      </ul>
      <p>
        The goal is to have each critical keyword appear at least twice: once in the skills section and once in
        context within a work experience bullet. This signals both possession of the skill and demonstrated use.
      </p>

      <h2>The keyword stuffing trap</h2>
      <p>
        Keyword stuffing — adding dozens of keywords in a tiny white font, or listing every possible skill
        regardless of experience level — does not work anymore. Modern ATS systems detect it.
        Recruiters definitely notice it.
      </p>
      <p>
        The goal is signal, not noise. A resume with 20 relevant, evidenced skills is more compelling
        than one with 60 skills where 40 are filler.
      </p>

      <h2>The job description changes over time — your resume should too</h2>
      <p>
        A common mistake is treating keyword optimization as a one-time fix. The job market changes.
        Employers' phrasing changes. A resume optimized for a Software Engineer role in 2022
        may miss keywords that have become standard requirements in 2025 (Kubernetes, GraphQL, LLM integration).
      </p>
      <p>
        Before every application, run your resume against the specific job description.
        Not once when you write it — every time you apply.
      </p>

      <div className="callout">
        <p>
          <strong>Skip the manual process.</strong> Shortlisted runs your resume against the job description
          automatically and shows you every keyword gap, every match, your ATS score, and your experience fit.
          Free preview, no account required.{' '}
          <Link to="/">Get your score now.</Link>
        </p>
      </div>

      <h2>Quick reference: keywords by role type</h2>
      <p>
        Different roles have different high-value keyword categories. Here is where to focus for common roles:
      </p>
      <h3>Software engineering</h3>
      <p>
        Programming languages (be specific: Python 3.x, not just Python), frameworks (React, Django, Spring Boot),
        cloud platforms (AWS, GCP, Azure with specific services), databases (PostgreSQL, MongoDB, Redis),
        infrastructure tools (Docker, Kubernetes, Terraform), methodologies (Agile, CI/CD, TDD).
      </p>
      <h3>Product management</h3>
      <p>
        Roadmap ownership, Agile/Scrum, A/B testing, product analytics tools (Amplitude, Mixpanel),
        stakeholder management, go-to-market, cross-functional leadership, user research, OKRs, KPIs.
      </p>
      <h3>Data and analytics</h3>
      <p>
        SQL (specific dialects matter: BigQuery, Snowflake, Redshift), Python, R, visualization tools
        (Tableau, Looker, Power BI), statistics, machine learning (if applicable), ETL/data pipeline,
        dbt, Airflow, Spark.
      </p>
      <h3>Marketing</h3>
      <p>
        Channel-specific tools (Google Ads, Meta Ads, HubSpot, Marketo), performance metrics
        (CPA, ROAS, LTV, CAC), SEO/SEM, content marketing, email marketing, marketing automation,
        attribution modeling.
      </p>
      <p>
        In every case: use the exact phrasing from the job description, not your own synonym for it.
      </p>
    </BlogLayout>
  );
}
