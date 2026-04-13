import puppeteer from 'puppeteer';

function scoreColor(score) {
  if (score >= 75) return '#16a34a';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

function buildHtml(job, analysis, rewrites) {
  const tier = job.tier;
  const score = analysis.ats_score;
  const expMatch = analysis.experience_match;

  const keywordGaps = (analysis.keyword_gaps || []).map((k) => `<li>${k}</li>`).join('');
  const keywordMatches = (analysis.keyword_matches || []).map((k) => `<li>${k}</li>`).join('');
  const strengths = (analysis.strengths || []).map((s) => `<li>${s}</li>`).join('');
  const weaknesses = (analysis.weaknesses || []).map((w) => `<li>${w}</li>`).join('');

  const rewriteSection =
    tier === 'FULL' && rewrites
      ? `
      <section>
        <h2>Professional Summary Rewrite</h2>
        <p>${rewrites.summary_rewrite}</p>
      </section>

      <section>
        <h2>Rewritten Bullet Points</h2>
        <ul>
          ${(rewrites.rewritten_bullets || []).map((b) => `<li>${b}</li>`).join('')}
        </ul>
      </section>

      <section>
        <h2>Optimised Skills Section</h2>
        <p>${rewrites.skills_section}</p>
      </section>
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
  h2 { font-size: 15px; font-weight: 600; margin: 24px 0 10px; color: #333; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
  .subtitle { color: #6b7280; font-size: 12px; margin-bottom: 32px; }
  .scores { display: flex; gap: 24px; margin-bottom: 32px; }
  .score-card {
    flex: 1;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
  }
  .score-number { font-size: 42px; font-weight: 700; }
  .score-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
  .score-notes { font-size: 12px; color: #374151; margin-top: 8px; text-align: left; }
  ul { padding-left: 20px; }
  li { margin-bottom: 5px; }
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
  section { margin-bottom: 8px; }
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
</style>
</head>
<body>
  <h1>Resume Analysis Report <span class="badge">${tier === 'FULL' ? 'The Glow-Up' : 'The Audit'}</span></h1>
  <p class="subtitle">Generated for ${job.email} &middot; getshortlisted.fyi</p>

  <div class="scores">
    <div class="score-card">
      <div class="score-number" style="color:${scoreColor(score)}">${score}</div>
      <div class="score-label">ATS Compatibility Score</div>
    </div>
    <div class="score-card">
      <div class="score-number" style="color:${scoreColor(expMatch)}">${expMatch}</div>
      <div class="score-label">Experience Match Score</div>
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
