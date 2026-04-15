import puppeteer from 'puppeteer';

const PUPPETEER_TIMEOUT_MS = 60_000;

function withTimeout(promise, ms, label) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout: ${label} did not complete within ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

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
  const salaryCurrency = salaryRange?.currency || 'USD';
  const salaryPeriod = salaryRange?.period || 'annual';
  const currencySymbols = { USD: '$', GBP: '£', EUR: '€', CAD: 'CA$', AUD: 'A$', MXN: 'MX$', COP: 'COP ', PEN: 'S/ ', CLP: 'CLP ', BRL: 'R$' };
  const currSym = currencySymbols[salaryCurrency] || (salaryCurrency + ' ');
  const fmt = (n) => (n || 0).toLocaleString();
  // If Claude returned annual, show both annual and monthly. If monthly, show both monthly and annual.
  const buildSalaryAmounts = (val) => {
    if (salaryPeriod === 'annual') {
      return `<strong>${currSym}${fmt(val)}/yr</strong><br><span class="salary-monthly">${currSym}${fmt(Math.round(val / 12))}/mo</span>`;
    }
    return `<strong>${currSym}${fmt(val)}/mo</strong><br><span class="salary-monthly">${currSym}${fmt(Math.round(val * 12))}/yr</span>`;
  };
  const salarySection = salaryRange
    ? `<section>
        <h2>Salary Intelligence</h2>
        <div class="salary-bar-wrap">
          <div class="salary-labels">
            <span>Low<br>${buildSalaryAmounts(salaryRange.low)}</span>
            <span class="salary-mid">Market Mid<br>${buildSalaryAmounts(salaryRange.mid)}</span>
            <span style="text-align:right">High<br>${buildSalaryAmounts(salaryRange.high)}</span>
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
  .salary-monthly { font-size: 11px; color: #9ca3af; font-weight: 400; }
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

function buildCvHtml(cvData) {
  const { name, title, contact, profile, experience, education, skills, certifications, languages } = cvData;

  const contactParts = [
    contact.phone,
    contact.email,
    contact.location,
    contact.linkedin,
  ].filter(Boolean);

  const experienceHtml = (experience || []).map(exp => `
    <div class="cv-role">
      <div class="cv-role-header">
        <div class="cv-role-left">
          <div class="cv-role-title">${exp.title}</div>
          <div class="cv-role-company">${exp.company}${exp.location ? `, ${exp.location}` : ''}</div>
        </div>
        <div class="cv-role-dates">${exp.dates || ''}</div>
      </div>
      <div class="cv-bullets">
        ${(exp.bullets || []).map(b => `<div class="cv-bullet"><span class="cv-bullet-dot">&#8226;</span><span class="cv-bullet-text">${b}</span></div>`).join('')}
      </div>
    </div>
  `).join('');

  const educationHtml = (education || []).map(edu => `
    <div class="cv-edu-row">
      <div>
        <div class="cv-edu-degree">${edu.degree}</div>
        <div class="cv-edu-school">${edu.school}</div>
      </div>
      ${edu.dates ? `<div class="cv-edu-dates">${edu.dates}</div>` : ''}
    </div>
  `).join('');

  const certHtml = (certifications || []).length > 0
    ? `<div class="cv-section">
        <div class="cv-section-title">Certifications</div>
        ${certifications.map(c => `
          <div class="cv-cert-row">
            <div class="cv-cert-name">${c.name}</div>
            ${c.issuer ? `<span class="cv-cert-meta">${c.issuer}${c.year ? `, ${c.year}` : ''}</span>` : ''}
          </div>
        `).join('')}
      </div>`
    : '';

  const langHtml = (languages || []).length > 0
    ? `<div class="cv-section">
        <div class="cv-section-title">Languages</div>
        <p class="cv-lang-text">${languages.join(', ')}</p>
      </div>`
    : '';

  const skillsText = (skills || []).join(', ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: system-ui, -apple-system, Arial, sans-serif;
    color: #111827;
    font-size: 12.5px;
    line-height: 1.55;
    background: #fff;
    padding: 40px 52px 52px;
  }

  /* Header */
  .cv-header {
    border-bottom: 2px solid #111827;
    padding-bottom: 16px;
    margin-bottom: 20px;
  }
  .cv-name {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: #111827;
    margin-bottom: 3px;
  }
  .cv-title {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 8px;
  }
  .cv-contact {
    font-size: 11px;
    color: #6b7280;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
  }
  .cv-contact-sep { margin: 0 8px; color: #d1d5db; }

  /* Sections */
  .cv-section { margin-bottom: 20px; }
  .cv-section-title {
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 3px;
    margin-bottom: 10px;
  }

  /* Profile */
  .cv-profile {
    font-size: 12.5px;
    color: #374151;
    line-height: 1.7;
  }

  /* Experience */
  .cv-role { margin-bottom: 14px; }
  .cv-role-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4px;
  }
  .cv-role-left { flex: 1; min-width: 0; }
  .cv-role-title {
    font-size: 13px;
    font-weight: 700;
    color: #111827;
  }
  .cv-role-company {
    font-size: 11.5px;
    color: #6b7280;
    margin-top: 1px;
  }
  .cv-role-dates {
    font-size: 11px;
    color: #9ca3af;
    white-space: nowrap;
    margin-left: 12px;
    margin-top: 2px;
  }
  .cv-bullets { margin-top: 4px; }
  .cv-bullet {
    display: flex;
    gap: 6px;
    margin-bottom: 3px;
    align-items: flex-start;
  }
  .cv-bullet-dot {
    color: #9ca3af;
    font-size: 10px;
    margin-top: 3px;
    flex-shrink: 0;
  }
  .cv-bullet-text {
    font-size: 12px;
    color: #374151;
    line-height: 1.55;
  }

  /* Education */
  .cv-edu-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
  }
  .cv-edu-degree {
    font-size: 12.5px;
    font-weight: 600;
    color: #111827;
  }
  .cv-edu-school {
    font-size: 11.5px;
    color: #6b7280;
    margin-top: 1px;
  }
  .cv-edu-dates {
    font-size: 11px;
    color: #9ca3af;
    white-space: nowrap;
    margin-left: 10px;
    margin-top: 2px;
  }

  /* Skills */
  .cv-skills-text {
    font-size: 12.5px;
    color: #374151;
    line-height: 1.7;
  }

  /* Certifications */
  .cv-cert-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }
  .cv-cert-name {
    font-size: 12px;
    color: #111827;
  }
  .cv-cert-meta {
    font-size: 11px;
    color: #9ca3af;
    white-space: nowrap;
    margin-left: 10px;
  }

  /* Languages */
  .cv-lang-text {
    font-size: 12.5px;
    color: #374151;
  }
</style>
</head>
<body>
  <div class="cv-header">
    <div class="cv-name">${name}</div>
    ${title ? `<div class="cv-title">${title}</div>` : ''}
    <div class="cv-contact">
      ${contactParts.map((p, i) => `${i > 0 ? '<span class="cv-contact-sep">|</span>' : ''}<span>${p}</span>`).join('')}
    </div>
  </div>

  <div class="cv-section">
    <div class="cv-section-title">Profile</div>
    <p class="cv-profile">${profile}</p>
  </div>

  <div class="cv-section">
    <div class="cv-section-title">Experience</div>
    ${experienceHtml}
  </div>

  <div class="cv-section">
    <div class="cv-section-title">Skills</div>
    <p class="cv-skills-text">${skillsText}</p>
  </div>

  <div class="cv-section">
    <div class="cv-section-title">Education</div>
    ${educationHtml}
  </div>

  ${certHtml}
  ${langHtml}
</body>
</html>`;
}

async function renderPdf(html) {
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const work = async () => {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        printBackground: true,
      });
      return Buffer.from(pdfBuffer);
    };
    return await withTimeout(work(), PUPPETEER_TIMEOUT_MS, 'Puppeteer PDF render');
  } finally {
    await browser.close();
  }
}

export async function generateCv(cvData) {
  return renderPdf(buildCvHtml(cvData));
}

export async function generateReport(job, analysis, rewrites) {
  return renderPdf(buildHtml(job, analysis, rewrites));
}
