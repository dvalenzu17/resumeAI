/**
 * Pre-Claude text analysis — deterministic scoring from raw extracted text.
 * Runs before Claude so the LLM never has to do structural detection.
 *
 * Returns two components of the Shortlist Match Rate:
 *   parseabilityScore     (0–15)
 *   sectionCompletenessScore (0–15)
 */

export function analyseTextStructure(text) {
  return {
    parseability: computeParseability(text),
    sectionCompleteness: computeSectionCompleteness(text),
  };
}

function computeParseability(text) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);

  if (lines.length < 5) {
    return { score: 0, detail: { singleColumnScore: 0, headerScore: 0, noTableScore: 0, contactScore: 0, reason: 'too_short' } };
  }

  // ── Single-column detection ───────────────────────────────────────────────
  // Multi-column PDFs linearise into lines that are much shorter than the page
  // width average. A high proportion of suspiciously short non-empty lines
  // (< 25% of the average line length) is a strong column indicator.
  const lengths = lines.map(l => l.trim().length);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const suspiciousShortLines = lengths.filter(l => l > 0 && l < avg * 0.25).length;
  const shortLinePct = suspiciousShortLines / lines.length;
  const singleColumnScore = shortLinePct < 0.12 ? 5 : shortLinePct < 0.25 ? 2 : 0;

  // ── Standard section headers ──────────────────────────────────────────────
  const SECTION_HEADERS = [
    'experience', 'work experience', 'employment history', 'work history',
    'education', 'academic', 'skills', 'technical skills', 'core competencies',
    'summary', 'profile', 'objective', 'professional summary',
    'certifications', 'projects', 'languages', 'awards', 'publications',
  ];
  const lower = text.toLowerCase();
  const foundHeaders = SECTION_HEADERS.filter(h => lower.includes(h));
  const headerScore = foundHeaders.length >= 4 ? 4 : foundHeaders.length >= 2 ? 2 : 0;

  // ── No tables / text boxes ────────────────────────────────────────────────
  // Tab characters and repeated multi-space alignment indicate tables.
  const tabLines = lines.filter(l => l.includes('\t') || (l.match(/[ ]{3,}/g) || []).length >= 3).length;
  const noTableScore = tabLines / lines.length < 0.08 ? 3 : tabLines / lines.length < 0.18 ? 1 : 0;

  // ── Contact info in body (first 400 chars) ────────────────────────────────
  // Header/footer contact info is extracted out-of-order by pdf-parse and
  // ends up deep in the text. If it's within the first 400 chars it's in-body.
  const head = text.slice(0, 400);
  const hasEmailInHead = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(head);
  const hasPhoneInHead = /[\+\d][\d\s\-\(\).]{6,}/.test(head);
  const contactScore = (hasEmailInHead || hasPhoneInHead) ? 3 : 0;

  const score = Math.min(15, singleColumnScore + headerScore + noTableScore + contactScore);
  return { score, detail: { singleColumnScore, headerScore, noTableScore, contactScore } };
}

function computeSectionCompleteness(text) {
  // ── Contact info ──────────────────────────────────────────────────────────
  const hasEmail = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /[\+\d][\d\s\-\(\).]{7,}/.test(text);
  const contactScore = (hasEmail && hasPhone) ? 3 : (hasEmail || hasPhone) ? 2 : 0;

  // ── Professional summary ──────────────────────────────────────────────────
  const summaryScore = /\b(summary|profile|objective|about me|professional summary|career summary)\b/i.test(text) ? 3 : 0;

  // ── Experience section with dates ─────────────────────────────────────────
  const hasExpSection = /\b(experience|work history|employment|work experience)\b/i.test(text);
  const hasYear = /\b(20\d{2}|19\d{2})\b/.test(text);
  const experienceScore = (hasExpSection && hasYear) ? 3 : hasExpSection ? 1 : 0;

  // ── Education with dates ──────────────────────────────────────────────────
  const hasEduSection = /\b(education|degree|university|college|bachelor|master|mba|phd|diploma|b\.s\.|m\.s\.)\b/i.test(text);
  const educationScore = (hasEduSection && hasYear) ? 3 : hasEduSection ? 1 : 0;

  // ── Skills section ────────────────────────────────────────────────────────
  const skillsScore = /\b(skills|technologies|technical skills|competencies|expertise|tools|tech stack)\b/i.test(text) ? 3 : 0;

  const score = Math.min(15, contactScore + summaryScore + experienceScore + educationScore + skillsScore);
  return { score, detail: { contactScore, summaryScore, experienceScore, educationScore, skillsScore } };
}

/**
 * Combines pre-computed and Claude-assessed sub-scores into the final
 * Shortlist Match Rate. Called in JS — never by Claude.
 */
export function computeShortlistMatchRate(preScores, claudeScores) {
  const total =
    claudeScores.hard_skill_score +
    claudeScores.job_title_score +
    preScores.parseability.score +
    preScores.sectionCompleteness.score +
    claudeScores.soft_skill_score +
    claudeScores.experience_score;
  return Math.min(95, Math.round(total));
}
