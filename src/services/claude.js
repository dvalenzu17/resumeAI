import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../lib/logger.js';

// ---------------------------------------------------------------------------
// MOCK MODE — set MOCK_CLAUDE=true in .env to bypass the API (no credits needed)
// ---------------------------------------------------------------------------
const MOCK = process.env.MOCK_CLAUDE === 'true';

const client = MOCK ? null : new Anthropic();
const MODEL = 'claude-sonnet-4-5';

const ANALYSIS_SCHEMA = {
  ats_score: 'number 0-100',
  keyword_gaps: 'string[]',
  keyword_matches: 'string[]',
  weaknesses: 'string[]',
  strengths: 'string[]',
  linkedin_headline: 'string',
  experience_match: 'number 0-100',
  experience_match_notes: 'string',
};

const REWRITE_SCHEMA = {
  rewritten_bullets: 'string[] (exactly 5)',
  summary_rewrite: 'string',
  skills_section: 'string',
};

function buildAnalysisPrompt(resumeText, jobDescription) {
  return `You are an expert ATS (Applicant Tracking System) analyst and resume coach.

Analyse the resume below against the job description and return ONLY a JSON object matching this exact schema — no markdown, no explanation, no preamble:

{
  "ats_score": <integer 0-100, overall ATS compatibility>,
  "experience_match": <integer 0-100, how well experience level matches role requirements>,
  "experience_match_notes": <string, 1-2 sentences explaining the experience match rating>,
  "keyword_gaps": <string array, important keywords in JD missing from resume>,
  "keyword_matches": <string array, JD keywords already present in resume>,
  "weaknesses": <string array, 3-5 specific weaknesses of this resume for this role>,
  "strengths": <string array, 3-5 specific strengths of this resume for this role>,
  "linkedin_headline": <string, a strong LinkedIn headline for this candidate targeting this role, max 220 chars>
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY the JSON object. No markdown code fences. No explanation.`;
}

function buildRewritePrompt(resumeText, jobDescription, analysisResult) {
  return `You are an expert resume writer specialising in ATS optimisation.

Given the resume, job description, and analysis below, produce rewritten content and return ONLY a JSON object matching this exact schema — no markdown, no explanation, no preamble:

{
  "rewritten_bullets": <string array of exactly 5 rewritten bullet points, each starting with a strong action verb, quantified where possible, optimised for ATS and the target role>,
  "summary_rewrite": <string, a powerful 3-4 sentence professional summary targeting this specific role>,
  "skills_section": <string, a comma-separated skills list optimised for this role's ATS keywords>
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

ANALYSIS (use keyword_gaps to inform rewrites):
${JSON.stringify(analysisResult, null, 2)}

Return ONLY the JSON object. No markdown code fences. No explanation.`;
}

async function callClaude(prompt, retryWithStricter = false) {
  const finalPrompt = retryWithStricter
    ? prompt +
      '\n\nCRITICAL: Your previous response was not valid JSON. Return ONLY raw JSON. No text before or after the opening { and closing }.'
    : prompt;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: 'user', content: finalPrompt }],
  });

  const text = message.content[0]?.text?.trim() ?? '';

  // Strip markdown code fences if Claude added them despite instructions
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  return JSON.parse(cleaned);
}

export async function runAnalysis(resumeText, jobDescription) {
  if (MOCK) {
    logger.warn('MOCK_CLAUDE=true — returning mock analysis');
    return {
      ats_score: 72,
      experience_match: 65,
      experience_match_notes: 'Candidate has relevant experience but lacks some senior-level requirements listed in the job description.',
      keyword_gaps: ['Kubernetes', 'GraphQL', 'Redis', 'CI/CD', 'Agile'],
      keyword_matches: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs'],
      strengths: [
        'Strong React and Node.js experience aligns well with core stack',
        'PostgreSQL expertise directly relevant to the role',
        "TypeScript proficiency matches the team's preferred language",
      ],
      weaknesses: [
        'No mention of Kubernetes or container orchestration',
        'GraphQL not listed despite being a key requirement',
        'Missing CI/CD pipeline experience (GitHub Actions, Jenkins)',
        'No evidence of Agile/Scrum methodology',
      ],
      linkedin_headline: 'Full Stack Engineer | React · Node.js · TypeScript · PostgreSQL | Building scalable web applications',
    };
  }

  const prompt = buildAnalysisPrompt(resumeText, jobDescription);

  try {
    const result = await callClaude(prompt);
    validateAnalysis(result);
    return result;
  } catch (err) {
    logger.warn({ err }, 'Claude analysis call 1 failed, retrying with stricter instruction');
    const result = await callClaude(prompt, true);
    validateAnalysis(result);
    return result;
  }
}

export async function runRewrites(resumeText, jobDescription, analysisResult) {
  if (MOCK) {
    logger.warn('MOCK_CLAUDE=true — returning mock rewrites');
    return {
      rewritten_bullets: [
        'Architected and deployed a React/Node.js/TypeScript SaaS platform serving 50,000+ monthly active users, reducing page load time by 40%',
        'Designed and optimised PostgreSQL schemas and query plans, cutting p99 API latency from 600ms to 95ms',
        'Built RESTful and GraphQL API layer integrating 5 third-party services, enabling 3x faster feature delivery',
        'Established GitHub Actions CI/CD pipeline with automated testing and zero-downtime Railway deployments',
        'Led Agile sprint ceremonies for a cross-functional team of 6, consistently delivering features on schedule',
      ],
      summary_rewrite: 'Full Stack Engineer with 5+ years building production React and Node.js applications at scale. Deep expertise in TypeScript, PostgreSQL, and cloud infrastructure with a track record of optimising performance and shipping reliable features. Experienced collaborator in Agile teams, passionate about clean architecture and developer experience.',
      skills_section: 'React, Next.js, Node.js, TypeScript, PostgreSQL, Redis, GraphQL, REST APIs, AWS (EC2, S3, RDS), Kubernetes, Docker, GitHub Actions, CI/CD, Agile/Scrum, Tailwind CSS',
    };
  }

  const prompt = buildRewritePrompt(resumeText, jobDescription, analysisResult);

  try {
    const result = await callClaude(prompt);
    validateRewrites(result);
    return result;
  } catch (err) {
    logger.warn({ err }, 'Claude rewrite call 1 failed, retrying with stricter instruction');
    const result = await callClaude(prompt, true);
    validateRewrites(result);
    return result;
  }
}

function validateAnalysis(obj) {
  const required = ['ats_score', 'keyword_gaps', 'keyword_matches', 'weaknesses', 'strengths', 'linkedin_headline', 'experience_match', 'experience_match_notes'];
  for (const key of required) {
    if (obj[key] === undefined) throw new Error(`Missing field: ${key}`);
  }
  if (typeof obj.ats_score !== 'number') throw new Error('ats_score must be a number');
  if (!Array.isArray(obj.keyword_gaps)) throw new Error('keyword_gaps must be an array');
  if (!Array.isArray(obj.keyword_matches)) throw new Error('keyword_matches must be an array');
  if (!Array.isArray(obj.weaknesses)) throw new Error('weaknesses must be an array');
  if (!Array.isArray(obj.strengths)) throw new Error('strengths must be an array');
}

function validateRewrites(obj) {
  const required = ['rewritten_bullets', 'summary_rewrite', 'skills_section'];
  for (const key of required) {
    if (obj[key] === undefined) throw new Error(`Missing field: ${key}`);
  }
  if (!Array.isArray(obj.rewritten_bullets)) throw new Error('rewritten_bullets must be an array');
  if (obj.rewritten_bullets.length !== 5) throw new Error(`rewritten_bullets must have 5 items, got ${obj.rewritten_bullets.length}`);
}
