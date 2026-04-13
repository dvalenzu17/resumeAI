import { Resend } from 'resend';
import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const FROM = 'Shortlisted <reports@getshortlisted.fyi>';

const LOGO_HTML = `<p style="font-size:20px;font-weight:800;letter-spacing:-0.5px;margin:0 0 32px;">
    short<span style="color:#e85d04;">listed</span>
  </p>`;

const EMAIL_BASE = (content) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;color:#0f0f0f;background:#f9fafb;margin:0;padding:40px 16px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:40px 36px;border:1px solid #e5e7eb;">
    ${LOGO_HTML}
    ${content}
    <hr style="border:none;border-top:1px solid #f3f4f6;margin:32px 0 24px;">
    <p style="font-size:12px;color:#9ca3af;margin:0;line-height:1.6;">
      getshortlisted.fyi · Built for job seekers who are done getting ghosted<br>
      Questions? Reply to this email — we actually read them.
    </p>
  </div>
</body>
</html>`;

export async function sendReportEmail(to, jobId, downloadUrl, tier) {
  if (!resend) {
    logger.warn({ to, jobId }, 'RESEND_API_KEY not set — skipping report email');
    return;
  }

  const tierLabel = tier === 'FULL' ? 'The Glow-Up ($29)' : 'The Audit ($12)';

  const content = `
    <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;letter-spacing:-0.3px;">You're shortlisted.</h1>
    <p style="color:#6b7280;font-size:13px;margin:0 0 24px;">Plan: ${tierLabel}</p>
    <p style="line-height:1.75;margin:0 0 12px;color:#374151;">
      Your report is ready. It's got your ATS compatibility score, every keyword gap the bots are
      penalising you for, and — if you got the Glow-Up — rewritten bullets that actually land.
    </p>
    <p style="line-height:1.75;margin:0 0 28px;color:#374151;">
      Download it, fix your resume, send the application. That's the whole game.
    </p>
    <a href="${downloadUrl}"
       style="background:linear-gradient(135deg,#e85d04,#06b6d4);color:#fff;text-decoration:none;
              padding:14px 28px;border-radius:8px;font-weight:700;display:inline-block;font-size:15px;
              letter-spacing:-0.2px;">
      Download Your Report →
    </a>
    <p style="font-size:12px;color:#9ca3af;margin:20px 0 0;">
      Link expires in 72 hours · Job ID: ${jobId}
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
    html: EMAIL_BASE(content),
  });
}

export async function sendFollowUp2Email(to, appUrl) {
  if (!resend) {
    logger.warn({ to }, 'RESEND_API_KEY not set — skipping follow-up 2 email');
    return;
  }

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
    subject: 'Something went wrong — full refund on us',
    html: EMAIL_BASE(content),
  });
}
