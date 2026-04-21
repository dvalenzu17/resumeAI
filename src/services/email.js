import { Resend } from 'resend';
import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const FROM = 'Shortlisted <reports@getshortlisted.fyi>';

// unsubUrl is required for marketing emails (nudge, follow-ups), omit for transactional (report, failure)
const EMAIL_BASE = (content, unsubUrl = null) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:system-ui,-apple-system,'Segoe UI',sans-serif; color:#0f0f0f; -webkit-font-smoothing:antialiased; }
    .wrapper { padding:40px 16px; }
    .card { max-width:520px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04); }
    .accent-bar { height:4px; background:linear-gradient(90deg,#e85d04 0%,#f97316 50%,#06b6d4 100%); }
    .card-body { padding:40px 40px 32px; }
    .logo { font-size:21px; font-weight:800; letter-spacing:-0.6px; margin:0 0 32px; color:#0f0f0f; }
    .logo span { color:#e85d04; }
    .content h1 { font-size:22px; font-weight:700; letter-spacing:-0.4px; margin:0 0 12px; color:#0f0f0f; line-height:1.3; }
    .content p { font-size:15px; line-height:1.75; color:#374151; margin:0 0 16px; }
    .content p:last-child { margin-bottom:0; }
    .btn-primary { display:inline-block; background:linear-gradient(135deg,#e85d04,#f97316); color:#ffffff !important; text-decoration:none; padding:14px 28px; border-radius:10px; font-weight:700; font-size:15px; letter-spacing:-0.2px; }
    .btn-dark { display:inline-block; background:#0f0f0f; color:#ffffff !important; text-decoration:none; padding:14px 28px; border-radius:10px; font-weight:700; font-size:15px; }
    .btn-ghost { display:inline-block; color:#6b7280 !important; text-decoration:none; padding:13px 16px; font-size:14px; }
    .divider { border:none; border-top:1px solid #f3f4f6; margin:32px 0 24px; }
    .footer { font-size:12px; color:#9ca3af; line-height:1.7; margin:0; }
    .meta { font-size:12px; color:#9ca3af; margin:20px 0 0; line-height:1.6; }
    code.job-id { background:#f3f4f6; padding:2px 6px; border-radius:4px; font-size:12px; }
    @media (max-width:600px) {
      .card-body { padding:28px 24px 24px; }
    }
  </style>
</head>
<body>
  <div class="wrapper" style="padding:40px 16px;background:#f4f4f5;">
    <div class="card" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
      <div class="accent-bar" style="height:4px;background:linear-gradient(90deg,#e85d04 0%,#f97316 50%,#06b6d4 100%);"></div>
      <div class="card-body" style="padding:40px 40px 32px;">
        <p class="logo" style="font-size:21px;font-weight:800;letter-spacing:-0.6px;margin:0 0 32px;color:#0f0f0f;font-family:system-ui,-apple-system,sans-serif;">
          short<span style="color:#e85d04;">listed</span>
        </p>
        <div class="content">
          ${content}
        </div>
        <hr class="divider" style="border:none;border-top:1px solid #f3f4f6;margin:32px 0 24px;">
        <p class="footer" style="font-size:12px;color:#9ca3af;margin:0;line-height:1.7;font-family:system-ui,-apple-system,sans-serif;">
          getshortlisted.fyi &middot; Built for job seekers who are done getting ghosted${unsubUrl ? `<br><a href="${unsubUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe from follow-up emails</a>` : ''}
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

export async function sendReportEmail(to, jobId, downloadUrl, tier, cvUrl = null) {
  if (!resend) {
    logger.warn({ to, jobId }, 'RESEND_API_KEY not set — skipping report email');
    return;
  }

  const tierLabel = tier === 'FULL' ? 'The Glow-Up ($29)' : 'The Audit ($12)';

  const cvButton = cvUrl
    ? `<a href="${cvUrl}"
         style="background:#0f172a;color:#fff;text-decoration:none;
                padding:14px 28px;border-radius:8px;font-weight:700;display:inline-block;font-size:15px;
                letter-spacing:-0.2px;margin-top:12px;">
        Download Your Tailored CV →
      </a>`
    : '';

  const bodyText = tier === 'FULL'
    ? `<p style="line-height:1.75;margin:0 0 12px;color:#374151;">
        Two files are ready for you. The analysis report shows your ATS score, every keyword gap, salary intel, cover letter, and interview prep. The tailored CV is a fully rewritten version of your resume, personalised to this specific role.
      </p>
      <p style="line-height:1.75;margin:0 0 28px;color:#374151;">
        Download the CV, submit it. That's it. You're done.
      </p>`
    : `<p style="line-height:1.75;margin:0 0 12px;color:#374151;">
        Your report is ready. It's got your ATS compatibility score, every keyword gap the bots are penalising you for, and salary intel for this role.
      </p>
      <p style="line-height:1.75;margin:0 0 28px;color:#374151;">
        Download it, fix your resume, send the application. That's the whole game.
      </p>`;

  const content = `
    <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;letter-spacing:-0.3px;">You're shortlisted.</h1>
    <p style="color:#6b7280;font-size:13px;margin:0 0 24px;">Plan: ${tierLabel}</p>
    ${bodyText}
    <a href="${downloadUrl}"
       style="background:linear-gradient(135deg,#e85d04,#06b6d4);color:#fff;text-decoration:none;
              padding:14px 28px;border-radius:8px;font-weight:700;display:inline-block;font-size:15px;
              letter-spacing:-0.2px;">
      Download Analysis Report →
    </a>
    ${cvButton}
    <p style="font-size:12px;color:#9ca3af;margin:20px 0 0;">
      Links expire in 72 hours · Job ID: ${jobId}<br>
      If the links have expired, <a href="${env.APP_URL}/redownload" style="color:#9ca3af;text-decoration:underline;">re-download your report here</a>.
    </p>`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: "You're shortlisted — your report is here",
    html: EMAIL_BASE(content),
  });
}

export async function sendFollowUp1Email(to, jobId, appUrl) {
  if (!resend) {
    logger.warn({ to, jobId }, 'RESEND_API_KEY not set — skipping follow-up 1 email');
    return;
  }

  const yesUrl = `${appUrl}/feedback?jobId=${jobId}&v=yes`;
  const noUrl = `${appUrl}/feedback?jobId=${jobId}&v=no`;
  const unsubUrl = `${appUrl}/api/unsubscribe?jobId=${jobId}`;

  const content = `
    <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;letter-spacing:-0.3px;">Quick question.</h1>
    <p style="line-height:1.75;margin:0 0 24px;color:#374151;">
      Did the Shortlisted report help with your application?
      One click is all we need.
    </p>
    <div style="display:flex;gap:12px;margin-bottom:28px;">
      <a href="${yesUrl}"
         style="background:#0f0f0f;color:#fff;text-decoration:none;padding:13px 24px;
                border-radius:8px;font-weight:700;font-size:15px;display:inline-block;">
        Yes, it helped
      </a>
      <a href="${noUrl}"
         style="color:#6b7280;text-decoration:none;padding:13px 16px;
                font-size:14px;display:inline-block;">
        Not really
      </a>
    </div>
    <p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.6;">
      Your answer helps us improve the reports. Takes one second.
    </p>`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Quick question about your report',
    html: EMAIL_BASE(content, unsubUrl),
  });
}

export async function sendFollowUp2Email(to, jobId, appUrl) {
  if (!resend) {
    logger.warn({ to, jobId }, 'RESEND_API_KEY not set — skipping follow-up 2 email');
    return;
  }

  const unsubUrl = `${appUrl}/api/unsubscribe?jobId=${jobId}`;

  const content = `
    <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;letter-spacing:-0.3px;">One last thing.</h1>
    <p style="line-height:1.75;margin:0 0 12px;color:#374151;">
      If the report saved you hours of guessing which keywords to add, the best thing
      you can do is send someone else here.
    </p>
    <p style="line-height:1.75;margin:0 0 28px;color:#374151;">
      Job hunting is brutal. Most people don't even know their resume is getting
      filtered before a human ever sees it.
    </p>
    <a href="${appUrl}"
       style="background:#e85d04;color:#fff;text-decoration:none;
              padding:14px 28px;border-radius:8px;font-weight:700;display:inline-block;font-size:15px;">
      Share Shortlisted
    </a>
    <p style="font-size:13px;color:#9ca3af;margin:20px 0 0;line-height:1.6;">
      ${appUrl}
    </p>`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Know anyone else job hunting?',
    html: EMAIL_BASE(content, unsubUrl),
  });
}

export async function sendPreviewNudgeEmail(to, jobId, appUrl, atsScore, firstGap) {
  if (!resend) {
    logger.warn({ to, jobId }, 'RESEND_API_KEY not set — skipping preview nudge email');
    return;
  }

  const unsubUrl = `${appUrl}/api/unsubscribe?jobId=${jobId}`;
  const scoreColor = atsScore >= 75 ? '#059669' : atsScore >= 50 ? '#d97706' : '#dc2626';
  const scoreVerdict = atsScore >= 75
    ? 'That is solid, but there are still gaps costing you callbacks.'
    : atsScore >= 50
    ? 'You are close, but keyword gaps are filtering you out before a human reads this.'
    : 'This resume is getting filtered before a recruiter ever sees it.';

  const gapLine = firstGap
    ? `<p style="line-height:1.75;margin:0 0 8px;color:#374151;">One keyword the ATS is looking for that is not in your resume: <strong>"${firstGap}"</strong>. There are more.</p>`
    : '';

  const content = `
    <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;letter-spacing:-0.3px;">Your ATS score came back.</h1>
    <div style="display:inline-block;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 24px;margin:0 0 24px;text-align:center;">
      <div style="font-size:48px;font-weight:800;color:${scoreColor};letter-spacing:-2px;line-height:1;">${atsScore}</div>
      <div style="font-size:12px;color:#9ca3af;margin-top:4px;text-transform:uppercase;letter-spacing:0.06em;">out of 100</div>
    </div>
    <p style="line-height:1.75;margin:0 0 16px;color:#374151;">${scoreVerdict}</p>
    ${gapLine}
    <p style="line-height:1.75;margin:0 0 28px;color:#374151;">
      The full report shows every gap, every match, your experience fit score, salary intel for the role, and a rewritten LinkedIn headline. The Glow-Up tier also rewrites your top bullets and writes your cover letter.
    </p>
    <a href="${appUrl}/preview?jobId=${jobId}"
       style="background:linear-gradient(135deg,#e85d04,#c44d03);color:#fff;text-decoration:none;
              padding:14px 28px;border-radius:8px;font-weight:700;display:inline-block;font-size:15px;
              letter-spacing:-0.2px;">
      See My Full Report →
    </a>
    <p style="font-size:12px;color:#9ca3af;margin:20px 0 0;line-height:1.6;">
      Your free preview is still waiting. Paid plans start at $12, one-time. No subscription.
    </p>`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your ATS score: ${atsScore}/100 — here's what's holding you back`,
    html: EMAIL_BASE(content, unsubUrl),
  });
}

// Internal alert — sent to the admin when the webhook silence detector fires.
// Not customer-facing, no unsubscribe needed.
export async function sendWebhookAlertEmail(adminEmail, stuckJobs) {
  if (!resend) return;
  const rows = stuckJobs.map(j =>
    `<tr><td style="padding:4px 8px;font-family:monospace;font-size:12px;">${j.id}</td><td style="padding:4px 8px;font-size:12px;">${j.email || '—'}</td><td style="padding:4px 8px;font-size:12px;">${new Date(j.createdAt).toISOString()}</td></tr>`
  ).join('');

  const content = `
    <h1 style="font-size:20px;font-weight:700;margin:0 0 12px;color:#dc2626;">Webhook silence alert</h1>
    <p style="line-height:1.75;margin:0 0 16px;color:#374151;">
      ${stuckJobs.length} job${stuckJobs.length !== 1 ? 's' : ''} ha${stuckJobs.length !== 1 ? 've' : 's'} been in
      <strong>PENDING_PAYMENT</strong> for more than 90 minutes. PayPal may not be delivering webhooks,
      or customers abandoned after approval without the capture completing.
    </p>
    <p style="line-height:1.75;margin:0 0 20px;color:#374151;">
      Check PayPal merchant dashboard for completed payments with no matching report.
      If customers paid but received nothing, issue refunds manually.
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;">
      <thead><tr style="background:#f3f4f6;">
        <th style="padding:6px 8px;text-align:left;font-size:12px;">Job ID</th>
        <th style="padding:6px 8px;text-align:left;font-size:12px;">Email</th>
        <th style="padding:6px 8px;text-align:left;font-size:12px;">Created at</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <a href="https://www.paypal.com/merchant" style="background:#dc2626;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;display:inline-block;font-size:14px;">
      Check PayPal →
    </a>`;

  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `[Shortlisted] Webhook alert — ${stuckJobs.length} stuck payment${stuckJobs.length !== 1 ? 's' : ''}`,
    html: EMAIL_BASE(content),
  });
}

export async function sendDailyPulseEmail(adminEmail, stats) {
  if (!resend) return;

  const { date, revenue, basicCount, fullCount, jobsCreated, failedJobs, nudgesSent, fu1Sent, fu2Sent } = stats;
  const totalSales = basicCount + fullCount;

  const revenueColor = revenue > 0 ? '#059669' : '#6b7280';
  const failedSection = failedJobs.length > 0
    ? `<p style="margin:0 0 8px;font-size:14px;color:#dc2626;font-weight:600;">Failed jobs (${failedJobs.length}):</p>
       <ul style="margin:0 0 16px;padding-left:20px;">${failedJobs.map(j => `<li style="font-size:12px;font-family:monospace;color:#374151;">${j.id}${j.email ? ' — ' + j.email : ''}</li>`).join('')}</ul>`
    : `<p style="margin:0 0 16px;font-size:13px;color:#6b7280;">No failed jobs.</p>`;

  const content = `
    <h1 style="font-size:20px;font-weight:700;margin:0 0 4px;letter-spacing:-0.3px;">Daily pulse — ${date}</h1>
    <p style="font-size:12px;color:#9ca3af;margin:0 0 28px;">Shortlisted · 6am summary</p>

    <div style="display:flex;gap:12px;margin-bottom:24px;">
      <div style="flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:32px;font-weight:800;color:${revenueColor};letter-spacing:-1px;">$${revenue}</div>
        <div style="font-size:11px;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:0.06em;">Revenue</div>
      </div>
      <div style="flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:32px;font-weight:800;color:#111827;">${totalSales}</div>
        <div style="font-size:11px;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:0.06em;">Sales</div>
      </div>
      <div style="flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:32px;font-weight:800;color:#111827;">${jobsCreated}</div>
        <div style="font-size:11px;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:0.06em;">Uploads</div>
      </div>
    </div>

    ${totalSales > 0 ? `<p style="margin:0 0 16px;font-size:13px;color:#374151;">${basicCount} Audit × $12 &nbsp;+&nbsp; ${fullCount} Glow-Up × $29</p>` : ''}

    <p style="font-size:13px;font-weight:600;color:#374151;margin:0 0 6px;">Email sequence</p>
    <p style="font-size:13px;color:#6b7280;margin:0 0 20px;">
      Preview nudges: ${nudgesSent} &nbsp;·&nbsp; Day-3 follow-ups: ${fu1Sent} &nbsp;·&nbsp; Day-7 follow-ups: ${fu2Sent}
    </p>

    ${failedSection}

    <a href="${env.APP_URL}/admin" style="background:#0f0f0f;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:700;display:inline-block;font-size:13px;">
      Open admin dashboard →
    </a>`;

  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `[Shortlisted] ${date} — $${revenue} revenue · ${totalSales} sale${totalSales !== 1 ? 's' : ''}`,
    html: EMAIL_BASE(content),
  });
}

export async function sendFailureEmail(to, jobId) {
  if (!resend) {
    logger.warn({ to, jobId }, 'RESEND_API_KEY not set — skipping failure email');
    return;
  }

  const content = `
    <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;letter-spacing:-0.3px;">We dropped the ball. You didn't.</h1>
    <p style="line-height:1.75;margin:0 0 16px;color:#374151;">
      Something went wrong generating your report (Job ID: <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:12px;">${jobId}</code>).
      This is entirely on us — your resume was fine.
    </p>
    <p style="line-height:1.75;margin:0 0 24px;color:#374151;">
      <strong>Reply to this email</strong> and we'll issue a full refund immediately. No forms, no questions, no waiting.
    </p>
    <p style="font-size:13px;color:#6b7280;margin:0;">
      This has been logged automatically. We're already looking into it.
    </p>`;

  await resend.emails.send({
    from: FROM,
    to,
    reply_to: 'hello@getshortlisted.fyi',
    subject: 'Something went wrong — full refund on us',
    html: EMAIL_BASE(content),
  });
}
