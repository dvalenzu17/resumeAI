import { Link } from 'react-router-dom';
import BlogLayout from './BlogLayout.jsx';

export default function SoftwareEngineerResume() {
  return (
    <BlogLayout
      title="ATS-Friendly Resume Tips for Software Engineers in 2025"
      description="Tech resumes have specific failure modes. Workday, Greenhouse, and Lever flag issues that differ from what hurts non-technical candidates. Here is what to fix."

    >
      <p>
        Software engineering resumes fail ATS systems for different reasons than most other roles.
        The technical nature of the work means there are more specific keywords, more tools to list,
        and more ways for the parser to misread or miss critical information.
      </p>
      <p>
        This guide covers the specific failure modes that show up most often in tech resumes,
        and the fixes that make the biggest difference.
      </p>

      <h2>The skills section is doing most of the work</h2>
      <p>
        For software engineering roles, the skills section has disproportionate ATS weight.
        Recruiters also scan it first. Most tech resumes either under-populate it or structure it poorly.
      </p>
      <p>
        <strong>What works:</strong>
      </p>
      <ul>
        <li>Group by category: Languages, Frameworks, Databases, Cloud/Infrastructure, Tools</li>
        <li>List specific versions or depth qualifiers where relevant: "Python (NumPy, Pandas, FastAPI)" is more useful than just "Python"</li>
        <li>Include the cloud services you have actually used, not just the platform: "AWS (EC2, RDS, S3, Lambda, CloudFront)" beats "AWS"</li>
        <li>Match the terminology in the job description exactly where possible</li>
      </ul>
      <p>
        <strong>What does not work:</strong>
      </p>
      <ul>
        <li>A single paragraph of comma-separated skills with no structure</li>
        <li>Listing programming languages you "know" at a superficial level alongside languages you use professionally — everything gets equal weight</li>
        <li>Skills placed at the bottom of the resume (put them near the top, after your summary or even before work experience)</li>
      </ul>

      <h2>Your bullet points are describing duties, not impact</h2>
      <p>
        This is the most common feedback from engineering hiring managers when they review resumes:
        "It tells me what you did, not what changed because of what you did."
      </p>
      <p>
        Weak bullet: "Developed features for the customer-facing web application using React and Node.js."
      </p>
      <p>
        Strong bullet: "Built the customer onboarding flow in React and Node.js, reducing time-to-first-value from 14 days to 3 and contributing to a 22% increase in 30-day retention."
      </p>
      <p>
        The formula is: Action verb + what you built/did + with what technology + measurable result.
        Not every bullet will have a measurable result. But every bullet should have at least one of: a scale indicator (users affected, data volume, request rate), a change in a metric, or a scope indicator (team size, timeline, complexity).
      </p>
      <p>
        If you do not have metrics on hand, look at your work history and ask:
      </p>
      <ul>
        <li>How many users or customers were affected by this?</li>
        <li>What was the performance before vs. after?</li>
        <li>How large was the team or codebase?</li>
        <li>How long did it take to ship?</li>
        <li>What would have broken or cost more if you had not done this?</li>
      </ul>

      <h2>The keyword gaps most engineering resumes have</h2>
      <p>
        Based on what Shortlisted flags most often across engineering resumes, these are the gaps that appear most frequently — terms that appear in job descriptions but not in the resume:
      </p>
      <ul>
        <li><strong>Kubernetes and container orchestration.</strong> Many engineers have Docker experience but have not explicitly listed Kubernetes even when they have worked with it in managed form (EKS, GKE, AKS).</li>
        <li><strong>CI/CD pipeline specifics.</strong> "Built deployment pipelines" is not the same as "GitHub Actions, Jenkins, CircleCI" to an ATS. Name the tools.</li>
        <li><strong>System design indicators.</strong> Phrases like "distributed systems," "microservices architecture," "event-driven," "high availability," and "horizontal scaling" signal seniority to both the ATS and the recruiter.</li>
        <li><strong>GraphQL.</strong> Many engineers use REST exclusively but GraphQL is now frequently listed as required or preferred. If you have touched it, add it.</li>
        <li><strong>Observability and monitoring.</strong> Datadog, Grafana, Prometheus, OpenTelemetry — these are increasingly part of engineering job descriptions and rarely appear in resumes.</li>
        <li><strong>Agile and Scrum terminology.</strong> "Sprint planning, retrospectives, stand-ups, backlog grooming" — these sound obvious but if they are not on your resume and the job description mentions them, you may miss the match.</li>
      </ul>

      <h2>Job title mismatches kill your score</h2>
      <p>
        ATS systems compare your most recent job title against the role you are applying for.
        The gap matters. "Software Engineer" applying for "Senior Software Engineer" is a small gap.
        "Software Engineer" applying for "Engineering Manager" is a large gap that the ATS will flag.
      </p>
      <p>
        You cannot change your actual job title, but you can add context. If your title was "Engineer"
        but you functioned as a tech lead for 18 months, your resume can say:
        "Software Engineer (Tech Lead, 2023-2024)" — this is accurate and provides the context the ATS lacks.
      </p>
      <p>
        More importantly: apply to roles where your title and years of experience create a plausible match.
        If you have 2 years of experience and are applying for a role that requires 7+,
        the ATS will score you out before a human decides if you are exceptional.
      </p>

      <h2>Formatting mistakes that break ATS parsing</h2>
      <p>
        Technical candidates often use design-heavy resume templates because they want to stand out.
        These templates frequently break ATS parsers:
      </p>
      <ul>
        <li><strong>Multi-column layouts.</strong> Columns are read left-to-right, top-to-bottom as a single stream by many parsers. Your left column text will be interleaved with your right column text, producing garbage.</li>
        <li><strong>Icons in the skills section.</strong> Proficiency indicators shown as filled circles or stars are meaningless to a parser. Use text: "Python (advanced), SQL (intermediate)."</li>
        <li><strong>Text in image/SVG elements.</strong> If you built your resume in Figma or Canva and exported it as a PDF, any text inside shapes or images is invisible to ATS.</li>
        <li><strong>Non-standard section headers.</strong> "My Journey" instead of "Work Experience" or "Technical Arsenal" instead of "Skills" will confuse parsers that look for standard section labels.</li>
        <li><strong>GitHub links without the actual repo names.</strong> "See my work at github.com/username" tells the ATS nothing. List specific projects with their technology stacks inline.</li>
      </ul>
      <p>
        The rule of thumb: your resume should look clean and professional in plain text, without any formatting.
        If pasting it into Notepad destroys the structure, a poorly configured ATS parser will have the same problem.
      </p>

      <h2>The GitHub projects section — do it right or skip it</h2>
      <p>
        Many engineering resumes include GitHub projects. Done poorly, they add bulk without adding keywords.
        Done well, they are an additional keyword source and a proof of initiative.
      </p>
      <p>
        Good project entry format:
      </p>
      <blockquote>
        <p>
          <strong>OpenMetrics Monitor</strong> (github.com/username/openmetrics-monitor) | Python, Prometheus, Grafana, Docker<br />
          Built a lightweight metrics collection agent that ingests OpenTelemetry traces and exposes a Grafana-compatible dashboard. Handles 10K events/sec on a 2-core machine.
        </p>
      </blockquote>
      <p>
        This entry adds Python, Prometheus, Grafana, Docker, OpenTelemetry — all legitimate keywords —
        plus performance context. A project listed only as "Personal portfolio website (HTML/CSS/JavaScript)"
        adds almost nothing.
      </p>

      <h2>Before you submit: the 5-minute ATS audit</h2>
      <p>
        Before hitting submit on any application, spend five minutes on this:
      </p>
      <ol>
        <li>Read the job description top to bottom. Write down every specific technical requirement.</li>
        <li>Ctrl+F your resume for each one. If it is missing, add it if you have the skill.</li>
        <li>Check that your most recent job title roughly matches the seniority level you are applying for.</li>
        <li>Verify your resume has no tables, multi-column layouts, or text in graphics.</li>
        <li>Make sure your skills section appears in the top half of the resume.</li>
      </ol>
      <p>
        This five minutes increases your ATS score meaningfully on almost every application.
        Most candidates skip it because it is tedious. That is your advantage.
      </p>

      <div className="callout">
        <p>
          <strong>Do this in 30 seconds instead of 5 minutes.</strong> Shortlisted runs your resume against the job
          description automatically, identifies every keyword gap, and gives you your ATS score.
          Free for the first scan. No account needed.{' '}
          <Link to="/">Try it free.</Link>
        </p>
      </div>
    </BlogLayout>
  );
}
