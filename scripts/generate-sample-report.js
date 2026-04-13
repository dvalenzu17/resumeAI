// Generates client/public/sample-report.pdf using the existing report template.
// Run with: node scripts/generate-sample-report.js

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateReport } from '../src/services/report.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Generate a BASIC-tier sample so the free preview shows what The Audit delivers
// without giving away The Glow-Up content (rewrites, cover letter, interview questions).
const job = {
  tier: 'BASIC',
  email: 'sample@example.com',
};

const analysis = {
  ats_score: 62,
  human_score: 55,
  human_score_notes: 'Bullet points describe responsibilities rather than achievements. Recruiters want to see measurable impact, not a list of duties.',
  experience_match: 70,
  experience_match_notes: 'Strong core experience, but the role requires Kubernetes and GraphQL expertise not evidenced in the resume.',
  keyword_gaps: ['Kubernetes', 'GraphQL', 'Redis', 'CI/CD pipelines', 'Agile methodology', 'Docker', 'System design'],
  keyword_matches: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs', 'Git', 'AWS'],
  strengths: [
    'Strong React and Node.js experience aligns directly with the core stack',
    'PostgreSQL expertise is directly relevant and evidenced with production use',
    'TypeScript proficiency matches the team language preference',
    'AWS exposure covers the infrastructure requirements at a base level',
  ],
  weaknesses: [
    'No Kubernetes or container orchestration experience listed despite being a key requirement',
    'GraphQL absent from the resume but listed as required in the job description',
    'Bullet points describe duties rather than outcomes. No quantified results anywhere',
    'CI/CD pipeline experience not evidenced despite being listed in requirements',
  ],
  linkedin_headline: 'Full Stack Engineer | React, Node.js, TypeScript, PostgreSQL | Building scalable web applications that ship',
  jd_red_flags: [
    'No salary range listed',
    'Uses "rockstar" language, which may signal a culture that normalises overwork',
    'Entry-level title listed but description requires 5+ years of experience',
  ],
  salary_range: {
    low: 95000,
    mid: 118000,
    high: 142000,
    notes: 'Mid-level full stack role at a likely Series B/C company. Range reflects current market for Node.js and React engineers in the US. Remote or hybrid arrangements typically compress the top end by 5 to 10 percent.',
  },
  negotiation_tips: [
    'The JD lists no salary range. Open the conversation by anchoring at $128k and let them respond first. Silence after your number is not a bad sign.',
    'They emphasise "fast-paced environment" throughout. Use this to negotiate a 90-day performance review with a raise tied to specific, agreed goals rather than manager discretion.',
    'If base salary is fixed, ask for a $6,000 signing bonus and an additional week of PTO. These are lower-friction concessions for employers and cost them less than a permanent salary increase.',
  ],
};

const rewrites = {
  summary_rewrite: 'Full Stack Engineer with 5 years shipping production React and Node.js applications at scale. Cut API response times by 85 percent by redesigning the query layer and built the deployment pipeline that reduced release cycles from two days to under two hours. Deep expertise in TypeScript and PostgreSQL, with a track record of owning complex systems end to end and making them reliable.',
  rewritten_bullets: [
    'Architected and deployed a React and Node.js SaaS platform serving 50,000 monthly active users, reducing average page load time by 40 percent through code splitting and query optimisation',
    'Redesigned PostgreSQL schemas and query execution plans, cutting p99 API latency from 600ms to 95ms without a service rewrite',
    'Built a RESTful API layer integrating 5 third-party services, reducing average feature delivery time by 3x through shared client abstractions',
    'Established a GitHub Actions CI/CD pipeline with parallelised test suites and zero-downtime deployments, reducing release time from 2 days to under 2 hours',
    'Led Agile sprint ceremonies for a cross-functional team of 6, consistently delivering sprint commitments on schedule across 18 consecutive sprints',
  ],
  skills_section: 'React, Next.js, Node.js, TypeScript, PostgreSQL, Redis, GraphQL, REST APIs, AWS (EC2, S3, RDS), Kubernetes, Docker, GitHub Actions, CI/CD, Agile/Scrum',
  cover_letter: `Dear Hiring Manager,

When I saw the GraphQL and Kubernetes requirements in this posting, I recognised exactly the kind of infrastructure challenges I want to be solving. At my current company, I rebuilt the query layer that reduced API latency from 600ms to 95ms, without touching the application logic. That kind of constraint-driven optimisation is where I do my best work.

I am a full stack engineer with five years of production experience in the stack you are hiring for: React, Node.js, TypeScript, and PostgreSQL. Beyond the technical match, I have owned the deployment pipeline that took our release cycle from two days to under two hours, and I have led sprint delivery for a team of six across a year and a half without a missed commitment.

What drew me specifically to this role was the emphasis on developer velocity alongside product quality. Most teams claim to prioritise both. Few actually do. I would bring the technical depth to contribute immediately and the process discipline to help the team stay there.

I would welcome a conversation about how my background maps to what you are building. Are you available for 30 minutes this week?`,
  interview_questions: [
    {
      question: 'Walk me through a time you optimised a slow database query or API endpoint.',
      why_likely: 'The JD emphasises performance and scale. This is a near-universal probe for backend engineers at this level.',
      star_framework: 'Situation: p99 API latency was 600ms and degrading under load. Task: Diagnose and reduce without a full rewrite. Action: Profiled slow queries, added composite indexes on hot paths, moved frequent lookups to Redis. Result: Latency dropped to 95ms within one week, holding under load.',
    },
    {
      question: 'Describe your experience with Kubernetes or container orchestration.',
      why_likely: 'Kubernetes is listed as a key requirement and is not evidenced in the resume. Expect direct probing here.',
      star_framework: 'Situation: EC2 deployments were manual, inconsistent, and caused two outages in one quarter. Task: Move to container orchestration. Action: Led Kubernetes migration, wrote Helm charts, configured autoscaling and health checks. Result: Zero-downtime deploys and a 40 percent reduction in infrastructure cost.',
    },
    {
      question: 'Tell me about a GraphQL API you have built or maintained.',
      why_likely: 'GraphQL is a specific requirement not evidenced in the resume. This will come up.',
      star_framework: 'Situation: Five REST endpoints with overlapping data were causing over-fetching on mobile clients. Task: Consolidate under a single query interface. Action: Designed schema, built resolvers, implemented DataLoader to eliminate N+1 queries. Result: One endpoint replaced five, mobile page load improved by 200ms.',
    },
    {
      question: 'How have you handled a situation where a feature was poorly scoped and the deadline was at risk?',
      why_likely: 'The JD mentions fast-paced environment repeatedly. They want evidence you can manage ambiguity without escalating.',
      star_framework: 'Situation: Requirements changed three days before sprint end. Task: Deliver something useful without blowing the deadline. Action: Negotiated scope with the PM, shipped a functional MVP with documented gaps, delivered the full version two weeks later. Result: Feature shipped on time and the PM relationship stayed strong.',
    },
    {
      question: 'What does your ideal CI/CD pipeline look like, and what have you built previously?',
      why_likely: 'CI/CD is listed as a gap in the resume. Expect them to probe whether you can own this.',
      star_framework: 'Ideal: lint and test on every PR, auto-deploy to staging on merge, one-click production release with instant rollback. Built: GitHub Actions pipeline with parallelised tests and Docker layer caching that cut build time from 8 minutes to 90 seconds.',
    },
    {
      question: 'How do you approach code reviews? What do you look for and what do you flag?',
      why_likely: 'Behavioural question common at teams that care about engineering culture and code quality.',
      star_framework: 'Review for correctness first, then readability, then performance. Flag security issues immediately and block the PR. Look for missing edge case tests. Give specific, actionable suggestions rather than vague criticism.',
    },
    {
      question: 'Describe a time you disagreed with a technical decision and how you handled it.',
      why_likely: 'Culture probe. The JD language suggests a collaborative but opinionated team that values direct communication.',
      star_framework: 'Situation: Team wanted NoSQL for data with clear relational structure. Task: Make the case without damaging the relationship. Action: Wrote a short technical brief with explicit tradeoffs, proposed a two-hour spike to test both options. Result: Team chose PostgreSQL after the spike confirmed the relational model was cleaner and faster to query.',
    },
    {
      question: 'Why this company and this role specifically?',
      why_likely: 'Standard closing question. Unprepared or generic answers cost otherwise-strong candidates the offer.',
      star_framework: 'Reference something specific from the JD or the company public work. Connect it to a genuine technical interest. Tie it back to what you want to build next in your career. Never say "growth opportunities" or "excited to contribute."',
    },
  ],
};

// Pass null for rewrites — BASIC tier sample only shows analysis sections
const pdfBuffer = await generateReport(job, analysis, null);

const outPath = join(__dirname, '..', 'client', 'public', 'sample-report.pdf');
writeFileSync(outPath, pdfBuffer);

console.log(`Sample report written to ${outPath}`);
