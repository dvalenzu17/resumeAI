import '../src/lib/env.js';
import { runAnalysis, runRewrites } from '../src/services/claude.js';

const JOB_DESCRIPTION = `
Senior Software Engineer — Full Stack
We are looking for a Senior Software Engineer to join our growing team.

Requirements:
- 5+ years of experience with React, Node.js, and TypeScript
- Experience with PostgreSQL and Redis
- Familiarity with AWS (EC2, S3, RDS) or GCP
- Strong understanding of REST APIs and GraphQL
- Experience with CI/CD pipelines (GitHub Actions, Jenkins)
- Agile/Scrum methodology experience
- Excellent communication and teamwork skills

Nice to have:
- Experience with Kubernetes and Docker
- Contributions to open source projects
- Experience with Next.js and Tailwind CSS
`;

const RESUMES = {
  junior: `
John Smith
john.smith@email.com | LinkedIn: linkedin.com/in/johnsmith | GitHub: github.com/johnsmith

SUMMARY
Recent Computer Science graduate with 1 year of internship experience in web development. Passionate about building scalable applications and eager to grow as a software engineer.

EXPERIENCE
Junior Web Developer Intern — TechStartup Inc. (June 2023 – May 2024)
- Built React components for the company dashboard reducing load time by 20%
- Helped migrate the team's codebase from JavaScript to TypeScript
- Wrote unit tests using Jest increasing code coverage from 40% to 65%
- Collaborated with a team of 5 developers in bi-weekly sprints

EDUCATION
B.S. Computer Science — State University (2024)
GPA: 3.7/4.0

SKILLS
JavaScript, React, Node.js, TypeScript (beginner), HTML/CSS, Git, Jest, SQL
`,

  senior: `
Sarah Chen
sarah.chen@email.com | LinkedIn: linkedin.com/in/sarahchen

SUMMARY
Staff Software Engineer with 9 years of experience building large-scale distributed systems. Led teams of up to 12 engineers. Expert in React, Node.js, TypeScript, PostgreSQL, and cloud infrastructure.

EXPERIENCE
Staff Software Engineer — MegaCorp (2019 – Present)
- Architected a microservices migration reducing system latency by 45% across 50M daily active users
- Led a team of 8 engineers building a real-time analytics platform using React, Node.js, TypeScript, and Redis
- Designed GraphQL API layer replacing 3 legacy REST services, reducing client payload size by 60%
- Established CI/CD pipeline using GitHub Actions and Kubernetes, reducing deploy time from 45 min to 8 min
- Mentored 6 junior engineers, 3 of whom were promoted to senior roles

Senior Software Engineer — ScaleUp Co. (2016 – 2019)
- Built React frontend and Node.js API for SaaS product used by 500+ enterprise clients
- Implemented PostgreSQL query optimisation reducing p99 latency from 800ms to 120ms
- Migrated infrastructure from on-premise to AWS (EC2, RDS, S3), cutting hosting costs 35%

EDUCATION
M.S. Computer Science — Tech University (2015)

SKILLS
React, Next.js, Node.js, TypeScript, PostgreSQL, Redis, GraphQL, REST APIs, AWS (EC2, S3, RDS), GCP, Kubernetes, Docker, GitHub Actions, Agile/Scrum, Tailwind CSS
`,

  careerChanger: `
Marcus Johnson
marcus.johnson@email.com | LinkedIn: linkedin.com/in/marcusjohnson

SUMMARY
Former high school mathematics teacher transitioning to software engineering after completing a 12-month coding bootcamp. Strong analytical mindset and 8 years of experience in curriculum design and data-driven instruction.

EXPERIENCE
Mathematics Teacher — Lincoln High School (2016 – 2024)
- Designed and delivered data-driven curriculum for 120+ students annually improving standardised test scores by 28%
- Built internal tools using Google Apps Script and basic JavaScript to automate grading workflows saving 5 hours/week
- Led a team of 4 teachers in implementing a new learning management system (LMS)
- Presented at 3 regional education conferences on technology integration in the classroom

Software Engineering Bootcamp Graduate — Code Academy (2024)
- Built a full-stack project tracking app using React, Node.js, Express, and PostgreSQL
- Deployed applications to AWS EC2 with basic CI/CD using GitHub Actions
- Completed 800+ hours of JavaScript, React, Node.js, and SQL coursework

EDUCATION
B.S. Mathematics — City College (2016)
Full-Stack Web Development Certificate — Code Academy (2024)

SKILLS
JavaScript, React, Node.js, Express, PostgreSQL, SQL, HTML/CSS, Git, GitHub Actions, AWS (EC2), Python (basic)
`,
};

async function testResume(name, resumeText) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${name} resume`);
  console.log('='.repeat(60));

  console.log('\n[Call 1] Running analysis...');
  const analysis = await runAnalysis(resumeText, JOB_DESCRIPTION);
  console.log('✓ Analysis result:');
  console.log(`  ATS Score:         ${analysis.ats_score}`);
  console.log(`  Experience Match:  ${analysis.experience_match}`);
  console.log(`  Keyword Matches:   ${analysis.keyword_matches?.length ?? 0} items`);
  console.log(`  Keyword Gaps:      ${analysis.keyword_gaps?.length ?? 0} items`);
  console.log(`  Strengths:         ${analysis.strengths?.length ?? 0} items`);
  console.log(`  Weaknesses:        ${analysis.weaknesses?.length ?? 0} items`);
  console.log(`  LinkedIn Headline: ${analysis.linkedin_headline}`);

  console.log('\n[Call 2] Running rewrites...');
  const rewrites = await runRewrites(resumeText, JOB_DESCRIPTION, analysis);
  console.log('✓ Rewrites result:');
  console.log(`  Bullets:           ${rewrites.rewritten_bullets?.length ?? 0} items`);
  console.log(`  Summary length:    ${rewrites.summary_rewrite?.length ?? 0} chars`);
  console.log(`  Skills length:     ${rewrites.skills_section?.length ?? 0} chars`);

  return { analysis, rewrites };
}

async function main() {
  console.log('ResumeAI — Claude chain smoke test');
  console.log('Model: claude-sonnet-4-5\n');

  const results = {};

  for (const [name, resumeText] of Object.entries(RESUMES)) {
    try {
      results[name] = await testResume(name, resumeText);
    } catch (err) {
      console.error(`\n✗ FAILED for ${name}:`, err.message);
      process.exit(1);
    }
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('All tests passed ✓');
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
