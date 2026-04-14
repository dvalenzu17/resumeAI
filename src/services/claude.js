import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../lib/logger.js';
import { env } from '../lib/env.js';
import { logEvent } from './analytics.js';

const MOCK = env.MOCK_CLAUDE;
const client = MOCK ? null : new Anthropic({ maxRetries: 0 }); // We handle retries ourselves
const MODEL = 'claude-sonnet-4-5';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function buildAnalysisPrompt(resumeText, jobDescription) {
  return `You are an expert ATS analyst, resume coach, and career strategist.

Analyse the resume against the job description and return ONLY a JSON object — no markdown, no explanation, no preamble:

{
  "ats_score": <integer 0-100, overall ATS keyword and formatting compatibility>,
  "human_score": <integer 0-100, how compelling this resume is to a human recruiter with 7 seconds — considers narrative clarity, achievement specificity, absence of filler language, career story coherence>,
  "human_score_notes": <string, 1-2 sentences on what most hurts human appeal>,
  "experience_match": <integer 0-100, how well the candidate's experience level matches role requirements>,
  "experience_match_notes": <string, 1-2 sentences explaining the experience match rating>,
  "keyword_gaps": <string array, important keywords/skills in JD missing from resume>,
  "keyword_matches": <string array, JD keywords already present in resume>,
  "strengths": <string array, 3-5 specific strengths of this resume for this role>,
  "weaknesses": <string array, 3-5 specific weaknesses of this resume for this role>,
  "linkedin_headline": <string, a strong LinkedIn headline for this candidate targeting this role, max 220 chars>,
  "jd_red_flags": <string array, 0-5 warning signals in the job description itself — e.g. "No salary range listed", "Uses 'rockstar' or 'ninja' language", "Entry-level title but requires 5+ years", "Vague or excessively long requirements list", "No company name visible". Return empty array if none found.>,
  "salary_range": {
    "low": <integer, lower market rate for this role in USD>,
    "mid": <integer, midpoint market rate in USD>,
    "high": <integer, upper market rate in USD>,
    "notes": <string, 1-2 sentences on key factors affecting this range — seniority, industry, location signals from JD>
  },
  "negotiation_tips": <string array of exactly 3 specific, actionable salary negotiation tips tailored to this role and JD — reference actual signals from the posting where possible>
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY the JSON object. No markdown code fences. No explanation.`;
}

function buildRewritePrompt(resumeText, jobDescription, analysisResult, coverLetterContext) {
  const coverLetterGuidance = coverLetterContext
    ? `
COVER LETTER PERSONALISATION (use these to make the letter sound human and specific):
- Why this company/role: ${coverLetterContext.companyWhy || 'not provided'}
- Most relevant achievement: ${coverLetterContext.topAchievement || 'not provided'}
- Non-obvious background angle: ${coverLetterContext.uniqueAngle || 'not provided'}
`
    : '';

  return `You are an expert resume writer, career coach, and hiring strategist.

Given the resume, job description, analysis, and personalisation context below, produce rewritten content and return ONLY a JSON object — no markdown, no explanation, no preamble:

{
  "rewritten_bullets": <string array of exactly 5 rewritten bullet points — each starts with a strong action verb, is quantified where possible, and is optimised for both ATS and human readers>,
  "summary_rewrite": <string, a powerful 3-4 sentence professional summary targeting this specific role — specific, confident, no filler phrases like "results-driven" or "passionate about">,
  "skills_section": <string, comma-separated skills list optimised for this role's ATS keywords>,
  "cover_letter": <string, a complete 3-4 paragraph cover letter. Rules: (1) sounds like a specific human wrote it — not AI-generated, (2) references at least one concrete achievement from the resume with a real number or outcome, (3) includes one sentence that shows genuine knowledge of or interest in this company or role based on the JD, (4) never uses filler phrases like "I am writing to express my interest" or "I believe I would be a great fit", (5) closes with a specific ask, not "I look forward to hearing from you">,
  "interview_questions": [
    {
      "question": <string, the likely interview question>,
      "why_likely": <string, one sentence — why this question is likely based on the JD requirements or resume gaps>,
      "star_framework": <string, a 2-3 sentence STAR answer outline using the candidate's actual background from the resume — Situation/Task/Action/Result>
    }
  ]
}

For interview_questions: provide exactly 8 questions. Mix: 3 role-specific technical/skills questions derived from JD requirements, 2 questions probing the resume gaps identified in the analysis, 2 behavioural questions based on culture signals in the JD, 1 "why this company/role" question.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

ANALYSIS:
${JSON.stringify({
  ats_score: analysisResult.ats_score,
  experience_match: analysisResult.experience_match,
  keyword_gaps: analysisResult.keyword_gaps,
  keyword_matches: analysisResult.keyword_matches,
  weaknesses: analysisResult.weaknesses,
  experience_match_notes: analysisResult.experience_match_notes,
}, null, 2)}
${coverLetterGuidance}
Return ONLY the JSON object. No markdown code fences. No explanation.`;
}

async function callClaude(prompt, maxTokens = 2048, retryWithStricter = false) {
  const finalPrompt = retryWithStricter
    ? prompt + '\n\nCRITICAL: Your previous response was not valid JSON. Return ONLY raw JSON. No text before or after the opening { and closing }.'
    : prompt;

  const RATE_LIMIT_DELAYS = [15000, 30000, 60000]; // 15s, 30s, 60s

  let lastErr;
  for (let attempt = 0; attempt <= RATE_LIMIT_DELAYS.length; attempt++) {
    try {
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: finalPrompt }],
      });
      const text = message.content[0]?.text?.trim() ?? '';
      const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      return {
        result: JSON.parse(cleaned),
        inputTokens: message.usage?.input_tokens ?? 0,
        outputTokens: message.usage?.output_tokens ?? 0,
      };
    } catch (err) {
      lastErr = err;
      const isRateLimit = err?.status === 429 || err?.message?.toLowerCase().includes('too many requests');
      if (isRateLimit && attempt < RATE_LIMIT_DELAYS.length) {
        const delay = RATE_LIMIT_DELAYS[attempt];
        logger.warn({ attempt: attempt + 1, delayMs: delay }, 'Claude rate limited, retrying after delay');
        logEvent('claude_retry', { properties: { reason: 'rate_limit', attempt: attempt + 1 } });
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

export async function runAnalysis(resumeText, jobDescription) {
  if (MOCK) {
    logger.warn('MOCK_CLAUDE=true — returning mock analysis');
    return { inputTokens: 0, outputTokens: 0, result: {
      ats_score: 72,
      human_score: 61,
      human_score_notes: 'Bullet points list responsibilities rather than achievements. Recruiters want to see impact, not a job description.',
      experience_match: 65,
      experience_match_notes: 'Candidate has relevant experience but lacks some senior-level requirements listed in the job description.',
      keyword_gaps: ['Kubernetes', 'GraphQL', 'Redis', 'CI/CD', 'Agile'],
      keyword_matches: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs'],
      strengths: [
        'Strong React and Node.js experience aligns well with core stack',
        'PostgreSQL expertise directly relevant to the role',
        'TypeScript proficiency matches the team\'s preferred language',
      ],
      weaknesses: [
        'No mention of Kubernetes or container orchestration',
        'GraphQL not listed despite being a key requirement',
        'Missing CI/CD pipeline experience',
        'Bullets describe duties, not outcomes — no quantified results',
      ],
      linkedin_headline: 'Full Stack Engineer | React · Node.js · TypeScript · PostgreSQL | Building scalable web applications',
      jd_red_flags: [
        'No salary range listed',
        'Uses "rockstar" language — may signal poor culture fit for boundary-setters',
      ],
      salary_range: {
        low: 95000,
        mid: 120000,
        high: 145000,
        notes: 'Mid-level full stack role at a likely Series B/C tech company. Range based on skills required and typical market for Node.js/React engineers.',
      },
      negotiation_tips: [
        'The JD lists no salary range — open the conversation by anchoring at $130k and let them respond first.',
        'They emphasise "fast-paced environment" — use this to negotiate a 90-day performance review with a raise tied to clear goals.',
        'If base salary is fixed, ask for a $5-10k signing bonus and an extra week of PTO — these are lower-friction concessions for employers.',
      ],
    } };
  }

  const prompt = buildAnalysisPrompt(resumeText, jobDescription);
  try {
    const { result, inputTokens, outputTokens } = await callClaude(prompt, 3000);
    validateAnalysis(result);
    return { result, inputTokens, outputTokens };
  } catch (err) {
    logger.warn({ err }, 'Claude analysis call 1 failed, retrying with stricter instruction');
    const { result, inputTokens, outputTokens } = await callClaude(prompt, 3000, true);
    logEvent('claude_retry', { properties: { call: 1, reason: 'json_parse_error' } });
    validateAnalysis(result);
    return { result, inputTokens, outputTokens };
  }
}

export async function runRewrites(resumeText, jobDescription, analysisResult, coverLetterContext = null) {
  if (MOCK) {
    logger.warn('MOCK_CLAUDE=true — returning mock rewrites');
    return { inputTokens: 0, outputTokens: 0, result: {
      rewritten_bullets: [
        'Architected and deployed a React/Node.js/TypeScript SaaS platform serving 50,000+ monthly active users, reducing page load time by 40%',
        'Designed and optimised PostgreSQL schemas and query plans, cutting p99 API latency from 600ms to 95ms',
        'Built RESTful and GraphQL API layer integrating 5 third-party services, enabling 3x faster feature delivery',
        'Established GitHub Actions CI/CD pipeline with automated testing and zero-downtime deployments, reducing release time by 60%',
        'Led Agile sprint ceremonies for a cross-functional team of 6, consistently delivering features on schedule',
      ],
      summary_rewrite: 'Full Stack Engineer with 5+ years shipping production React and Node.js applications at scale. Cut API latency by 85% and built the CI/CD pipeline that reduced release cycles from days to hours. Deep expertise in TypeScript, PostgreSQL, and cloud infrastructure — and a track record of making complex systems reliable.',
      skills_section: 'React, Next.js, Node.js, TypeScript, PostgreSQL, Redis, GraphQL, REST APIs, AWS (EC2, S3, RDS), Kubernetes, Docker, GitHub Actions, CI/CD, Agile/Scrum, Tailwind CSS',
      cover_letter: `Dear Hiring Manager,

When I saw the GraphQL and Kubernetes requirements in this posting, I knew this was the role I'd been looking for. At my current company, I built the GraphQL layer that replaced five separate REST endpoints — reducing client-side data fetching complexity by 70% and shaving 200ms off average page load times.

I'm a full stack engineer with five years of production experience in exactly the stack you're hiring for: React, Node.js, TypeScript, and PostgreSQL. Beyond the technical match, I've led the Kubernetes migration that took our deployment from a fragile EC2 setup to a scalable, self-healing cluster — the kind of infrastructure work that lets the rest of the team ship without fear.

What drew me specifically to this role was the emphasis on developer experience alongside product delivery. That's a balance most teams claim to prioritise but few actually do. I'd bring both the technical depth and the sprint discipline to help you maintain that standard.

I'd welcome a conversation about how my background maps to what you're building. Would 30 minutes this week work?`,
      interview_questions: [
        {
          question: 'Walk me through a time you optimised a slow database query or API endpoint.',
          why_likely: 'The JD emphasises performance and scale — this is a near-universal probe for backend engineers.',
          star_framework: 'Situation: p99 API latency was 600ms and degrading. Task: Diagnose and fix without a rewrite. Action: Profiled queries, added composite indexes, moved hot lookups to Redis. Result: Latency dropped to 95ms within a week.',
        },
        {
          question: 'How have you handled a situation where a feature was poorly scoped and the timeline was at risk?',
          why_likely: 'The JD mentions "fast-paced environment" — they want evidence you can manage ambiguity without escalating problems.',
          star_framework: 'Situation: Requirements changed three days before sprint end. Task: Deliver something useful without blowing the deadline. Action: Negotiated scope with the PM, shipped a functional MVP, documented remaining work clearly. Result: Feature shipped on time, full version two weeks later.',
        },
        {
          question: 'Describe your experience with Kubernetes or container orchestration.',
          why_likely: 'Kubernetes is listed as a key requirement and is absent from the resume — expect direct probing here.',
          star_framework: 'Situation: EC2 deployments were manual and error-prone. Task: Move to container orchestration. Action: Led Kubernetes migration, wrote Helm charts, set up autoscaling. Result: Zero-downtime deploys, 40% infra cost reduction.',
        },
        {
          question: 'Tell me about a GraphQL implementation you\'ve built or maintained.',
          why_likely: 'GraphQL is a specific JD requirement not present in the resume — this will come up.',
          star_framework: 'Situation: Five REST endpoints with overlapping data were slowing clients. Task: Unify under a single query interface. Action: Designed schema, built resolvers, implemented DataLoader to avoid N+1. Result: Single endpoint replaced five, page load improved by 200ms.',
        },
        {
          question: 'How do you approach code reviews — what do you look for and what do you flag?',
          why_likely: 'Behavioural question common at teams that emphasise engineering culture and quality.',
          star_framework: 'Focus on correctness first, then readability, then performance. Flag security issues immediately. Look for missing tests on edge cases. Give specific suggestions, never just "this is wrong."',
        },
        {
          question: 'Describe a time you disagreed with a technical decision and how you handled it.',
          why_likely: 'Culture signal question — the JD language suggests a collaborative but opinionated team.',
          star_framework: 'Situation: Team wanted to use a NoSQL store for data with clear relational structure. Task: Make the case without damaging the relationship. Action: Wrote a short technical brief with tradeoffs, proposed a 2-hour spike to validate both options. Result: Team chose PostgreSQL after the spike confirmed the relational model was cleaner.',
        },
        {
          question: 'What does your ideal CI/CD pipeline look like and what have you built previously?',
          why_likely: 'CI/CD is listed as a gap — expect them to probe whether you can own this.',
          star_framework: 'Ideal: fast lint + test on every PR, auto-deploy to staging on merge, one-click production release with rollback. Built: GitHub Actions pipeline with test parallelisation, Dockerfile caching to cut build time from 8 min to 90 seconds.',
        },
        {
          question: 'Why this company and this role specifically?',
          why_likely: 'Standard closing question — unprepared answers cost otherwise-strong candidates the offer.',
          star_framework: 'Reference something specific from the JD or the company\'s public work. Connect it to a genuine technical interest. Tie it back to what you want to build next in your career. Avoid generic answers about "growth opportunities."',
        },
      ],
    } };
  }

  const prompt = buildRewritePrompt(resumeText, jobDescription, analysisResult, coverLetterContext);
  try {
    const { result, inputTokens, outputTokens } = await callClaude(prompt, 5000);
    validateRewrites(result);
    return { result, inputTokens, outputTokens };
  } catch (err) {
    logger.warn({ err }, 'Claude rewrite call failed, retrying with stricter instruction');
    const { result, inputTokens, outputTokens } = await callClaude(prompt, 5000, true);
    logEvent('claude_retry', { properties: { call: 2, reason: 'json_parse_error' } });
    validateRewrites(result);
    return { result, inputTokens, outputTokens };
  }
}

function validateAnalysis(obj) {
  const required = ['ats_score', 'human_score', 'keyword_gaps', 'keyword_matches', 'weaknesses', 'strengths', 'linkedin_headline', 'experience_match', 'experience_match_notes', 'jd_red_flags', 'salary_range', 'negotiation_tips'];
  for (const key of required) {
    if (obj[key] === undefined) throw new Error(`Missing field: ${key}`);
  }
  if (typeof obj.ats_score !== 'number') throw new Error('ats_score must be a number');
  if (!Array.isArray(obj.keyword_gaps)) throw new Error('keyword_gaps must be an array');
  if (!Array.isArray(obj.keyword_matches)) throw new Error('keyword_matches must be an array');
  if (!Array.isArray(obj.weaknesses)) throw new Error('weaknesses must be an array');
  if (!Array.isArray(obj.strengths)) throw new Error('strengths must be an array');
  if (!Array.isArray(obj.jd_red_flags)) throw new Error('jd_red_flags must be an array');
  if (!Array.isArray(obj.negotiation_tips)) throw new Error('negotiation_tips must be an array');
  if (obj.negotiation_tips.length !== 3) throw new Error(`negotiation_tips must have 3 items, got ${obj.negotiation_tips.length}`);
  if (typeof obj.salary_range !== 'object' || obj.salary_range === null) throw new Error('salary_range must be an object');
  if (typeof obj.salary_range.low !== 'number') throw new Error('salary_range.low must be a number');
  if (typeof obj.salary_range.mid !== 'number') throw new Error('salary_range.mid must be a number');
  if (typeof obj.salary_range.high !== 'number') throw new Error('salary_range.high must be a number');
}

function validateRewrites(obj) {
  const required = ['rewritten_bullets', 'summary_rewrite', 'skills_section', 'cover_letter', 'interview_questions'];
  for (const key of required) {
    if (obj[key] === undefined) throw new Error(`Missing field: ${key}`);
  }
  if (!Array.isArray(obj.rewritten_bullets)) throw new Error('rewritten_bullets must be an array');
  if (obj.rewritten_bullets.length !== 5) throw new Error(`rewritten_bullets must have 5 items, got ${obj.rewritten_bullets.length}`);
  if (!Array.isArray(obj.interview_questions)) throw new Error('interview_questions must be an array');
  if (obj.interview_questions.length !== 8) throw new Error(`interview_questions must have 8 items, got ${obj.interview_questions.length}`);
  for (const q of obj.interview_questions) {
    if (!q.question || !q.why_likely || !q.star_framework) {
      throw new Error('Each interview_question must have question, why_likely, and star_framework fields');
    }
  }
}
