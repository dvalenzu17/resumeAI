import puppeteer from 'puppeteer';

function scoreColor(score) {
  if (score >= 75) return '#16a34a';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

function scoreLabel(score) {
  if (score >= 75) return 'Strong';
  if (score >= 50) return 'Fair';
  return 'Weak';
}

function buildHtml(job, analysis, rewrites) {
  const tier = job.tier;
  const score = analysis.ats_score;
  const humanScore = analysis.human_score ?? null;
  const expMatch = analysis.experience_match;

  const keywordGaps = (analysis.keyword_gaps || []).map((k) => `<li>${k}</li>`).join('');
  const keywordMatches = (analysis.keyword_matches || []).map((k) => `<li>${k}</li>`).join('');
  const strengths = (analysis.strengths || []).map((s) => `<li>${s}</li>`).join('');
  const weaknesses = (analysis.weaknesses || []).map((w) => `<li>${w}</li>`).join('');

  const redFlags = analysis.jd_red_flags || [];
  const redFlagSection = redFlags.length > 0
    ? `<section>
        <h2>⚠ Job Description Red Flags</h2>
        <p class="section-note">These signals in the job posting are worth knowing before you apply or negotiate.</p>
        <ul class="red-flags">${redFlags.map((f) => `<li>${f}</li>`).join('')}</ul>
      </section>`
    : `<section>
        <h2>Job Description Red Flags</h2>
        <p class="section-note good-signal">No significant red flags detected in this job description.</p>
      </section>`;

  const salaryRange = analysis.salary_range;
  const salarySection = salaryRange
    ? `<section>
        <h2>Salary Intelligence</h2>
        <div class="salary-bar-wrap">
          <div class="salary-labels">
            <span>Low<br><strong>$${salaryRange.low?.toLocaleString()}</strong></span>
            <span class="salary-mid">Market Mid<br><strong>$${salaryRange.mid?.toLocaleString()}</strong></span>
            <span style="text-align:right">High<br><strong>$${salaryRange.high?.toLocaleString()}</strong></span>
          </div>
          <div class="salary-bar">
            <div class="salary-bar-fill"></div>
            <div class="salary-bar-dot"></div>
          </div>
        </div>
        <p class="salary-notes">${salaryRange.notes || ''}</p>
        ${(analysis.negotiation_tips || []).length > 0 ? `
        <h3 class="subsection">Negotiation Tips</h3>
        <ul>${(analysis.negotiation_tips || []).map((t) => `<li>${t}</li>`).join('')}</ul>
        ` : ''}
      </section>`
    : '';

  const rewriteSection = tier === 'FULL' && rewrites
    ? `
      <section>
        <h2>Professional Summary Rewrite</h2>
        <p>${rewrites.summary_rewrite}</p>
      </section>

      <section>
        <h2>Rewritten Bullet Points</h2>
        <ul>${(rewrites.rewritten_bullets || []).map((b) => `<li>${b}</li>`).join('')}</ul>
      </section>

      <section>
        <h2>Optimised Skills Section</h2>
        <p>${rewrites.skills_section}</p>
      </section>

      ${rewrites.cover_letter ? `
      <section class="cover-letter-section">
        <h2>Cover Letter</h2>
        <p class="section-note">Personalised to this role. Edit the bracketed placeholders before sending.</p>
        <div class="cover-letter-body">${rewrites.cover_letter.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</div>
      </section>` : ''}

      ${(rewrites.interview_questions || []).length > 0 ? `
      <section>
        <h2>Interview Question Forecaster</h2>
        <p class="section-note">8 likely questions derived from this specific job description and your resume gaps — with STAR answer frameworks built from your background.</p>
        ${rewrites.interview_questions.map((q, i) => `
          <div class="interview-q">
            <div class="q-number">Q${i + 1}</div>
            <div class="q-body">
              <p class="q-text">${q.question}</p>
              <p class="q-why"><em>Why likely:</em> ${q.why_likely}</p>
              <p class="q-star"><em>STAR framework:</em> ${q.star_framework}</p>
            </div>
          </div>
        `).join('')}
      </section>` : ''}
    `
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: system-ui, -apple-system, sans-serif;
    color: #1a1a1a;
    padding: 48px 56px;
    font-size: 14px;
    line-height: 1.6;
  }
  h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  h2 { font-size: 15px; font-weight: 600; margin: 28px 0 10px; color: #333; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
  h3.subsection { font-size: 13px; font-weight: 600; margin: 14px 0 6px; color: #444; }
  .subtitle { color: #6b7280; font-size: 12px; margin-bottom: 32px; }
  .scores { display: flex; gap: 16px; margin-bottom: 8px; }
  .score-card {
    flex: 1;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
  }
  .score-number { font-size: 38px; font-weight: 700; }
  .score-label { font-size: 11px; color: #6b7280; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.04em; }
  .score-sublabel { font-size: 11px; font-weight: 600; margin-top: 2px; }
  .score-notes { font-size: 12px; color: #374151; margin-top: 8px; text-align: left; }
  ul { padding-left: 20px; }
  li { margin-bottom: 6px; }
  .two-col { display: flex; gap: 24px; }
  .two-col section { flex: 1; }
  .headline-box {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 12px 16px;
    font-style: italic;
    color: #374151;
  }
  section { margin-bottom: 4px; }
  .badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 9999px;
    background: #fff3ed;
    color: #e85d04;
    margin-left: 8px;
    vertical-align: middle;
  }
  .section-note { font-size: 12px; color: #6b7280; margin-bottom: 8px; }
  .good-signal { color: #16a34a; }
  ul.red-flags li { color: #b91c1c; }
  /* Salary */
  .salary-bar-wrap { margin: 12px 0; }
  .salary-labels { display: flex; justify-content: space-between; font-size: 12px; color: #374151; margin-bottom: 6px; }
  .salary-mid { text-align: center; }
  .salary-bar { height: 8px; background: #e5e7eb; border-radius: 9999px; position: relative; }
  .salary-bar-fill { position: absolute; left: 0; top: 0; height: 100%; width: 100%; background: linear-gradient(to right, #fde68a, #16a34a); border-radius: 9999px; }
  .salary-bar-dot { position: absolute; top: -4px; left: 50%; transform: translateX(-50%); width: 16px; height: 16px; background: #1a1a1a; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
  .salary-notes { font-size: 12px; color: #6b7280; margin-top: 10px; }
  /* Cover letter */
  .cover-letter-section { page-break-before: always; }
  .cover-letter-body {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 20px 24px;
    line-height: 1.8;
    color: #1a1a1a;
  }
  .cover-letter-body p { margin-bottom: 14px; }
  /* Interview questions */
  .interview-q {
    display: flex;
    gap: 12px;
    margin-bottom: 18px;
    padding-bottom: 18px;
    border-bottom: 1px solid #f3f4f6;
  }
  .interview-q:last-child { border-bottom: none; }
  .q-number {
    min-width: 28px;
    height: 28px;
    background: #1a1a1a;
    color: #fff;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
  }
  .q-body { flex: 1; }
  .q-text { font-weight: 600; margin-bottom: 6px; }
  .q-why { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
  .q-star { font-size: 12px; color: #374151; }
</style>
</head>
<body>
  <h1>Resume Analysis Report <span class="badge">${tier === 'FULL' ? 'The Glow-Up' : 'The Audit'}</span></h1>
  <p class="subtitle">Generated for ${job.email} &middot; getshortlisted.fyi</p>

  <div class="scores">
    <div class="score-card">
      <div class="score-number" style="color:${scoreColor(score)}">${score}</div>
      <div class="score-label">ATS Compatibility</div>
      <div class="score-sublabel" style="color:${scoreColor(score)}">${scoreLabel(score)}</div>
    </div>
    ${humanScore !== null ? `
    <div class="score-card">
      <div class="score-number" style="color:${scoreColor(humanScore)}">${humanScore}</div>
      <div class="score-label">Human Readability</div>
      <div class="score-sublabel" style="color:${scoreColor(humanScore)}">${scoreLabel(humanScore)}</div>
      <div class="score-notes">${analysis.human_score_notes || ''}</div>
    </div>` : ''}
    <div class="score-card">
      <div class="score-number" style="color:${scoreColor(expMatch)}">${expMatch}</div>
      <div class="score-label">Experience Match</div>
      <div class="score-sublabel" style="color:${scoreColor(expMatch)}">${scoreLabel(expMatch)}</div>
      <div class="score-notes">${analysis.experience_match_notes || ''}</div>
    </div>
  </div>

  <section>
    <h2>LinkedIn Headline Suggestion</h2>
    <div class="headline-box">${analysis.linkedin_headline}</div>
  </section>

  <div class="two-col">
    <section>
      <h2>Strengths</h2>
      <ul>${strengths}</ul>
    </section>
    <section>
      <h2>Weaknesses</h2>
      <ul>${weaknesses}</ul>
    </section>
  </div>

  <div class="two-col">
    <section>
      <h2>Keyword Matches</h2>
      <ul>${keywordMatches}</ul>
    </section>
    <section>
      <h2>Keyword Gaps</h2>
      <ul>${keywordGaps}</ul>
    </section>
  </div>

  ${redFlagSection}
  ${salarySection}
  ${rewriteSection}
</body>
</html>`;
}

export async function generateReport(job, analysis, rewrites) {
  const html = buildHtml(job, analysis, rewrites);

  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      printBackground: true,
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
