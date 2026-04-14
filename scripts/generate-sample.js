/**
 * Generates sample-report.pdf and sample-cv.pdf using Daniel's real CV
 * and a realistic Data Analyst job description.
 *
 * Usage: node --env-file=.env scripts/generate-sample.js
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateReport, generateCv } from '../src/services/report.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Daniel's actual resume text ───────────────────────────────────────────────
const RESUME_TEXT = `Daniel Valenzuela
Data Analyst
+507 6519-1593 | Daniel.valenz@icloud.com | Panama, Panama | in/itsdanny17

PROFILE
Data-driven professional with experience in call center operations, KPI performance monitoring, and process automation. Skilled in analyzing service metrics (SLA compliance, turnaround time, utilization) and building dashboards in Power BI to support operational decision-making. Experience implementing automation solutions (Excel, SAP scripting, Power Automate) to reduce manual workload and improve reporting efficiency. Strong stakeholder communication skills and exposure to continuous improvement environments.

EXPERIENCE

State Farm Insurance Customer Service | Foundever | Panama | January 2026 - present
- Manage approximately 40-50 daily inbound insurance claims and policy inquiries in a structured, high-volume call center environment.
- Ensure compliance with service-level expectations (SLA) and maintain accurate case documentation.
- Monitor case progress and resolution timelines to support operational efficiency.

Freelance Data Analyst | Kimberly-Clark | Panama | December 2025 - January 2026
- Collected and analyzed labor market data to identify hiring trends and skill demand.
- Built Power BI dashboards to visualize workforce insights and support data-driven decision-making.
- Structured datasets and presented analytical findings in clear, business-oriented summaries.

CAPEX Continuous Improvement Development Intern | Estee Lauder | Panama | November 2024 - November 2025
- Designed and deployed Excel-based automation tools and SAP scripts, reducing manual reporting turnaround time from 48-72 hours to under 5 minutes.
- Built standardized reporting processes across global shared service centers to improve consistency and efficiency.
- Implemented Power Automate flows to reduce repetitive manual tasks and improve operational turnaround time.
- Conducted quality assurance testing and maintained process documentation to ensure data accuracy and governance compliance.
- Developed performance dashboards in Power BI to monitor operational KPIs and provide real-time visibility to stakeholders.

Technical Support Representative for Geek Squad | Best Buy | Panama | September 2023 - October 2024
- Provided technical troubleshooting support in a high-volume service environment.
- Ensured adherence to service procedures and resolution standards.
- Applied structured diagnostic methodologies to identify root causes and reduce repeat incidents.

EDUCATION
Computer Science | Universidad Interamericana de Panama | Fall 2027 (Estimate)
Colegio Anglo Mexicano | 2022

SKILLS
Excel Automation | SAP Scripting | Python | Power BI | Stakeholder Communication | Process Optimization | Data Visualization | KPI Monitoring

LANGUAGES
English - Native | Spanish - Native

COURSES AND CERTIFICATIONS
Microsoft Excel - Excel from Beginner to Advanced | Udemy | 2023
Excel Power Query Tips and Techniques | LinkedIn Learning | 2025
Development of AI, IoT, coding and programming skills | Samsung Innovation Campus | 2022-2023
Microsoft Power Automate: Advanced Business Automation | LinkedIn Learning | 2025`;

// ── Realistic Data Analyst job description ────────────────────────────────────
const JOB_DESCRIPTION = `Data Analyst - Operations & Business Intelligence
Seniority: Mid-level
Location: Panama City, Panama (Hybrid)
Company: Regional Financial Services Firm (Series B)

About the role:
We are looking for a Data Analyst to join our Operations & BI team. You will work closely with operations managers, finance, and product to build reporting infrastructure, automate manual processes, and surface actionable insights from our data.

Responsibilities:
- Build and maintain dashboards in Power BI and Tableau to track operational KPIs (SLA compliance, throughput, cost per transaction).
- Write SQL queries to extract, transform, and validate data from our PostgreSQL and Snowflake data warehouse.
- Automate recurring reports and data pipelines using Python (pandas, numpy) and Excel.
- Collaborate with operations teams to understand reporting requirements and translate them into scalable solutions.
- Conduct root cause analysis on operational anomalies and present findings to senior stakeholders.
- Maintain data quality standards and documentation for all reporting assets.
- Support A/B testing and experiment analysis for process improvement initiatives.

Requirements:
- 2+ years of experience in a data analyst or business intelligence role.
- Proficiency in SQL (intermediate to advanced).
- Experience with Power BI or Tableau for dashboard development.
- Python proficiency for data manipulation (pandas, numpy).
- Experience with Excel automation (VBA, Power Query, or similar).
- Strong analytical thinking and ability to communicate findings to non-technical stakeholders.
- Experience in operations, finance, or a process-heavy environment is a plus.
- Familiarity with data warehouse concepts (Snowflake, BigQuery, or similar) is a plus.

Nice to have:
- Experience with SAP or similar ERP systems.
- Exposure to A/B testing or statistical analysis.
- Knowledge of dbt or other data transformation tools.

Compensation: $1,800 - $2,800/month depending on experience.
Benefits: Health insurance, hybrid schedule (3 days office), professional development budget.`;

// ── Hardcoded realistic output (Daniel's CV vs Data Analyst JD) ───────────────

const ANALYSIS = {
  ats_score: 74,
  human_score: 61,
  human_score_notes: 'Bullet points describe responsibilities rather than achievements. Recruiters want to see measurable impact, not a list of duties.',
  experience_match: 78,
  experience_match_notes: 'Strong operational and automation background aligns well. Missing explicit SQL and Python experience could raise concerns at the screening stage.',
  keyword_gaps: ['SQL', 'Snowflake', 'Tableau', 'A/B testing', 'data warehouse'],
  keyword_matches: ['Power BI', 'Excel automation', 'KPI monitoring', 'SLA compliance', 'SAP', 'Power Automate', 'Python', 'process optimization', 'stakeholder communication'],
  strengths: [
    'Power BI dashboard experience directly matches the core requirement — evidenced with a real use case at Estee Lauder.',
    'Process automation track record (Excel, SAP, Power Automate) is exactly the profile they are hiring for.',
    'SLA compliance and operational KPI monitoring align with the day-to-day scope of the role.',
    'Cross-functional stakeholder communication is explicitly listed as a requirement and demonstrated across multiple roles.',
    'The Estee Lauder internship shows enterprise-level exposure — global shared service centers and governance compliance are strong signals.',
  ],
  weaknesses: [
    'SQL is not mentioned anywhere in the resume — it is a core requirement and a likely ATS filter.',
    'Tableau is listed as a nice-to-have but is absent. Adding it or noting familiarity would help.',
    'Bullets read as job descriptions, not outcomes. "Developed dashboards" should be "Built 5 Power BI dashboards tracking 12 KPIs, reducing executive reporting time by 60%."',
    'No mention of data warehouse or Snowflake experience — even conceptual familiarity should be noted.',
    'A/B testing or statistical analysis is listed as a nice-to-have and is completely absent.',
  ],
  linkedin_headline: 'Data Analyst | Power BI · Excel Automation · SAP · Power Automate | Turning messy operational data into decisions that stick',
  jd_red_flags: [
    'Salary range listed in local currency (USD equivalent unconfirmed) — confirm compensation before investing time in the process.',
  ],
  salary_range: {
    low: 1800,
    mid: 2300,
    high: 2800,
    notes: 'Mid-level Data Analyst at a regional financial firm in Panama City. Range reflects the posted compensation band. Hybrid schedule and development budget add non-cash value.',
  },
  negotiation_tips: [
    'The posted range tops at $2,800. Anchor at $2,700 on your first response and let them move — starting below the ceiling signals you have not done your research.',
    'The development budget is a real lever. If they push back on base, ask for a $500 annual training allowance and a 90-day salary review tied to specific deliverables.',
    'They emphasise "process improvement initiatives" — use your Estee Lauder result (48-72 hours to under 5 minutes) in the negotiation. Concrete outcomes justify the top of the range.',
  ],
};

const REWRITES = {
  rewritten_bullets: [
    'Built Power BI dashboards tracking 12 operational KPIs across SLA compliance, throughput, and turnaround time — reducing executive reporting preparation time by 60% at Estee Lauder.',
    'Designed Excel and SAP automation scripts that cut manual reporting turnaround from 48-72 hours to under 5 minutes, freeing 15+ hours per week across the operations team.',
    'Implemented Power Automate workflows across 3 global shared service centers, eliminating repetitive data entry tasks and standardising reporting processes for 200+ users.',
    'Analysed labor market datasets for Kimberly-Clark to identify hiring trends across 5 regional markets, delivering findings in stakeholder-ready Power BI dashboards adopted by the Talent Intelligence team.',
    'Monitored SLA compliance and case resolution metrics across 40-50 daily insurance claims, maintaining documentation accuracy and supporting operational efficiency targets at State Farm.',
  ],
  summary_rewrite: 'Data Analyst with hands-on experience building operational reporting infrastructure and automating manual processes in enterprise environments. At Estee Lauder, reduced reporting turnaround from 48 hours to 5 minutes using Excel automation and SAP scripting. Proficient in Power BI dashboard development, KPI monitoring, and cross-functional stakeholder communication. Looking to bring this operational and analytical background to a BI team that values process rigour and data quality.',
  skills_section: 'Power BI, Excel Automation, Power Query, SAP Scripting, Power Automate, Python, KPI Monitoring, SLA Compliance, Process Optimization, Data Visualization, Stakeholder Communication, SQL (working knowledge), Data Governance',
  cover_letter: `Dear Hiring Manager,

Your posting for a Data Analyst caught my attention because of the specific combination of Power BI dashboard ownership and process automation — this is exactly the work I have been doing for the last two years, not as a side responsibility, but as the core of the role.

At Estee Lauder, I inherited a reporting process that took 48 to 72 hours of manual work every cycle. Within three months, I had built Excel automation tools and SAP scripts that reduced that to under 5 minutes. I then standardised the process across three global shared service centers. That kind of end-to-end ownership, from identifying the inefficiency to deploying the fix to documenting it for compliance, is what I bring to every data problem.

More recently at Kimberly-Clark, I built the Power BI dashboards the Talent Intelligence team now uses to track hiring trends across five regional markets. The work required structuring messy labor datasets, designing visualisations for a non-technical audience, and presenting findings in a way that drove actual decisions, not just reports nobody reads.

I am particularly interested in the operational focus of this role. Financial services data tends to be high-stakes and high-volume, which is the environment where the kind of rigour I have built at Estee Lauder and State Farm matters most. I would welcome a conversation about how my background maps to what your team is building. Would 30 minutes this week work?`,
  interview_questions: [
    {
      question: 'Walk me through a dashboard you built from scratch. What was the business problem, how did you design it, and how was it used?',
      why_likely: 'Power BI dashboard ownership is the core requirement. Expect detailed probing here.',
      star_framework: 'Situation: Estee Lauder operations team had no real-time KPI visibility. Task: Build a reporting layer they could use daily without needing IT. Action: Designed 5 dashboards in Power BI tracking SLA, throughput, and cost metrics. Pulled data from SAP. Result: Executives used them in weekly ops reviews; manual Excel reports were retired.',
    },
    {
      question: 'How comfortable are you with SQL, and can you give me an example of a query you have written?',
      why_likely: 'SQL is a core requirement absent from the resume — expect a direct probe.',
      star_framework: 'Be honest about your level. If working knowledge: "I have written SELECT, JOIN, and GROUP BY queries against operational databases. I am more experienced in Excel and Power Query for transformation, but I am actively building SQL depth." Pair with a specific example even if simple.',
    },
    {
      question: 'Tell me about a time you found a process that could be automated. How did you approach it?',
      why_likely: 'The JD lists automation experience explicitly — your Estee Lauder work is directly relevant.',
      star_framework: 'Situation: 48-72 hour manual reporting cycle at Estee Lauder. Task: Find a repeatable fix. Action: Mapped every manual step, built Excel macros and SAP scripts to automate data extraction and formatting. Documented the process for compliance. Result: Cycle time dropped from 3 days to 5 minutes.',
    },
    {
      question: 'How do you ensure data quality in the reports you build?',
      why_likely: 'The JD explicitly mentions maintaining data quality standards — expect this.',
      star_framework: 'At Estee Lauder: conducted QA testing on every report before deployment, cross-referenced against source systems, maintained documentation of data definitions. Flag discrepancies to the data owner before surfacing results. Prevention over correction.',
    },
    {
      question: 'Describe a situation where you had to present complex data findings to a non-technical audience.',
      why_likely: 'Stakeholder communication is listed as a requirement in the JD.',
      star_framework: 'Situation: Kimberly-Clark Talent Intelligence stakeholders needed labor market findings without a data background. Task: Present trends across 5 markets in a way that drove hiring decisions. Action: Built a narrative-first deck using Power BI visuals, led with the headline insight, used colour coding to flag urgency. Result: Findings were adopted directly into the Q1 hiring plan.',
    },
    {
      question: 'Have you worked with any data warehouse or cloud database tools like Snowflake or BigQuery?',
      why_likely: 'Snowflake/BigQuery listed as nice-to-have and absent from resume — will come up.',
      star_framework: 'Be transparent: "I have not worked directly with Snowflake or BigQuery yet. My data extraction experience has been through SAP and Excel-based pipelines. I understand the concepts of columnar storage and schema design, and I am actively learning SQL to move into warehouse-native querying." Then show the Udemy/LinkedIn track record as evidence of self-directed learning.',
    },
    {
      question: 'Tell me about a time you had multiple competing priorities. How did you manage your workload?',
      why_likely: 'The JD mentions collaboration across operations, finance, and product — they want evidence of prioritisation.',
      star_framework: 'Situation: At Estee Lauder, managing both automation projects and daily reporting requests simultaneously. Task: Deliver both without dropping quality. Action: Blocked morning hours for deep work on automation, batched reporting requests into afternoon. Communicated timelines upfront to stakeholders. Result: Both tracks delivered on schedule.',
    },
    {
      question: 'Why this company and this specific role?',
      why_likely: 'Standard closing question — unprepared answers cost candidates offers.',
      star_framework: 'Reference the operational focus: "Financial services data is high-stakes. SLA compliance and cost-per-transaction metrics at this scale are exactly the kind of problem I find interesting. The hybrid setup also matters — I work better when I can collaborate in person on complex analysis questions." Avoid generic answers about growth opportunities.',
    },
  ],
};

const CV_DATA = {
  name: 'Daniel Valenzuela',
  title: 'Data Analyst',
  contact: {
    email: 'Daniel.valenz@icloud.com',
    phone: '+507 6519-1593',
    location: 'Panama City, Panama',
    linkedin: 'linkedin.com/in/itsdanny17',
  },
  profile: 'Data Analyst with hands-on experience building operational reporting infrastructure and automating manual processes in enterprise environments. At Estee Lauder, reduced reporting turnaround from 48 hours to 5 minutes using Excel automation and SAP scripting. Proficient in Power BI dashboard development, KPI monitoring, and stakeholder communication. SQL proficiency in development. Looking to bring operational and analytical rigour to a BI team that values data quality and process improvement.',
  experience: [
    {
      title: 'Insurance Operations Analyst',
      company: 'Foundever (State Farm)',
      location: 'Panama',
      dates: 'January 2026 - Present',
      bullets: [
        'Track and analyse 40-50 daily insurance claims across SLA compliance, turnaround time, and case resolution metrics, identifying trends and surfacing exceptions to team leads.',
        'Maintain case documentation accuracy to support operational reporting and audit readiness.',
        'Monitor resolution timelines and escalate anomalies, contributing to a 15% improvement in first-call resolution rates.',
      ],
    },
    {
      title: 'Freelance Data Analyst',
      company: 'Kimberly-Clark',
      location: 'Panama',
      dates: 'December 2025 - January 2026',
      bullets: [
        'Analysed labor market datasets across 5 regional markets to identify hiring trends and skill demand shifts, delivering structured findings to the Talent Intelligence team.',
        'Built Power BI dashboards adopted directly by Talent Intelligence for Q1 workforce planning decisions, reducing manual report preparation by 60%.',
        'Structured and validated raw datasets, establishing data quality checks that reduced reporting errors by 40%.',
      ],
    },
    {
      title: 'CAPEX Continuous Improvement Intern',
      company: 'Estee Lauder',
      location: 'Panama',
      dates: 'November 2024 - November 2025',
      bullets: [
        'Built Excel automation tools and SAP scripts that reduced manual reporting turnaround from 48-72 hours to under 5 minutes, saving the operations team 15+ hours per week.',
        'Standardised reporting processes across 3 global shared service centers, improving cross-regional data consistency and reducing ad-hoc reporting requests by 30%.',
        'Implemented Power Automate workflows eliminating repetitive manual data entry tasks, improving operational turnaround time by 25%.',
        'Developed 5 Power BI dashboards tracking operational KPIs in real time, used in weekly executive reviews — retired 8 legacy Excel reports.',
        'Maintained QA documentation and process governance records to ensure data accuracy and compliance with internal audit standards.',
      ],
    },
    {
      title: 'Technical Support Representative',
      company: 'Best Buy (Geek Squad)',
      location: 'Panama',
      dates: 'September 2023 - October 2024',
      bullets: [
        'Resolved 50+ daily technical support cases, maintaining adherence to service procedures and quality resolution standards.',
        'Applied structured diagnostic methodologies to identify root causes, contributing to a 20% reduction in repeat incident rates.',
      ],
    },
  ],
  education: [
    { degree: 'B.S. Computer Science (In Progress)', school: 'Universidad Interamericana de Panama', dates: 'Expected Fall 2027' },
    { degree: 'High School Diploma', school: 'Colegio Anglo Mexicano', dates: '2022' },
  ],
  skills: ['Power BI', 'SQL', 'Python', 'Excel Automation', 'Power Query', 'SAP Scripting', 'Power Automate', 'Data Visualization', 'KPI Monitoring', 'SLA Compliance', 'Process Optimization', 'Data Governance', 'Stakeholder Communication'],
  certifications: [
    { name: 'Microsoft Excel: Beginner to Advanced', issuer: 'Udemy', year: '2023' },
    { name: 'Excel Power Query Tips and Techniques', issuer: 'LinkedIn Learning', year: '2025' },
    { name: 'Microsoft Power Automate: Advanced Business Automation', issuer: 'LinkedIn Learning', year: '2025' },
    { name: 'AI, IoT and Coding Skills Development', issuer: 'Samsung Innovation Campus', year: '2023' },
  ],
  languages: ['English - Native', 'Spanish - Native'],
};

async function main() {
  const mockJob = { id: 'sample', email: 'sample@getshortlisted.fyi', tier: 'FULL' };

  console.log('Generating report PDF...');
  const reportBuffer = await generateReport(mockJob, ANALYSIS, REWRITES);
  const reportPath = join(__dirname, '..', 'client', 'public', 'sample-report.pdf');
  writeFileSync(reportPath, reportBuffer);
  console.log(`Saved: ${reportPath}`);

  console.log('Generating CV PDF...');
  const cvBuffer = await generateCv(CV_DATA);
  const cvPath = join(__dirname, '..', 'client', 'public', 'sample-cv.pdf');
  writeFileSync(cvPath, cvBuffer);
  console.log(`Saved: ${cvPath}`);

  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
