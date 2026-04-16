import * as Sentry from '@sentry/node';
import { db } from '../lib/db.js';
import { logger } from '../lib/logger.js';
import { runAnalysis, runRewrites, runCvRewrite } from './claude.js';
import { generateReport, generateCv } from './report.js';
import { uploadReport, uploadCv } from './storage.js';
import { sendReportEmail, sendFailureEmail } from './email.js';
import { logEvent } from './analytics.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Retries the email once after 5s before giving up.
// Throws on second failure so the outer catch can mark the job FAILED.
async function sendEmailWithRetry(emailFn, jobId, label) {
  try {
    await emailFn();
  } catch (firstErr) {
    logger.warn({ jobId, err: firstErr }, `${label} failed on first attempt — retrying in 5s`);
    await sleep(5000);
    await emailFn(); // throws if it fails again
  }
}

const MAX_RESUME_CHARS = 6000;
const MAX_JD_CHARS = 4000;

// Phase 1 — free teaser. Runs Claude Call 1, stores result, marks PREVIEW_READY.
// Called immediately on job creation, before any payment.
export async function runTeaserAnalysis(jobId, userLocation = null) {
  const job = await db.job.findUnique({ where: { id: jobId } });

  if (!job) {
    logger.error({ jobId }, 'runTeaserAnalysis: job not found');
    return;
  }

  if (job.status !== 'ANALYZING') {
    logger.info({ jobId, status: job.status }, 'runTeaserAnalysis: skipping, not in ANALYZING state');
    return;
  }

  try {
    const resumeText = (job.resumeText ?? '').slice(0, MAX_RESUME_CHARS);
    const jobDescription = job.jobDescription.slice(0, MAX_JD_CHARS);

    const t0 = Date.now();
    const { result: analysis, inputTokens, outputTokens } = await runAnalysis(resumeText, jobDescription, userLocation);
    logger.info({ jobId, ats_score: analysis.ats_score }, 'Teaser analysis complete');

    await db.job.update({
      where: { id: jobId },
      data: {
        status: 'PREVIEW_READY',
        analysisResult: analysis,
        tokensInCall1: { increment: inputTokens },
        tokensOutCall1: { increment: outputTokens },
      },
    });

    logEvent('teaser_complete', {
      jobId,
      properties: { ats_score: analysis.ats_score, durationMs: Date.now() - t0, tokensIn: inputTokens, tokensOut: outputTokens, gapCount: Array.isArray(analysis.keyword_gaps) ? analysis.keyword_gaps.length : 0 },
    });
  } catch (err) {
    logger.error({ jobId, err }, 'runTeaserAnalysis failed');
    Sentry.captureException(err, { extra: { jobId, phase: 'teaser' } });
    // No failure email here — user hasn't paid yet
    await db.job.update({
      where: { id: jobId },
      data: { status: 'FAILED', errorMessage: err.message ?? 'Unknown error' },
    });
  }
}

// Phase 2 — paid report. Reads stored analysis, runs rewrites (FULL only),
// generates PDF, uploads to R2, emails user. Called from payment webhook.
export async function runFullReport(jobId) {
  const job = await db.job.findUnique({ where: { id: jobId } });

  if (!job) {
    logger.error({ jobId }, 'runFullReport: job not found');
    return;
  }

  const claimed = await db.job.updateMany({
    where: { id: jobId, status: { in: ['PENDING_PAYMENT', 'PREVIEW_READY'] } },
    data: { status: 'PROCESSING' },
  });

  if (claimed.count === 0) {
    logger.info({ jobId, status: job.status }, 'runFullReport: skipping duplicate run');
    return;
  }

  try {
    const resumeText = (job.resumeText ?? '').slice(0, MAX_RESUME_CHARS);
    const jobDescription = job.jobDescription.slice(0, MAX_JD_CHARS);

    // Reuse stored analysis from teaser — no second Claude Call 1
    const analysis = job.analysisResult;

    if (!analysis) {
      throw new Error('No stored analysis result — teaser may have failed');
    }

    let rewrites = null;
    let tokensIn2 = 0;
    let tokensOut2 = 0;
    let tokensIn3 = 0;
    let tokensOut3 = 0;
    const t0 = Date.now();
    if (job.tier === 'FULL') {
      const { result: rewriteResult, inputTokens: in2, outputTokens: out2 } = await runRewrites(resumeText, jobDescription, analysis, job.coverLetterContext ?? null);
      rewrites = rewriteResult;
      tokensIn2 = in2;
      tokensOut2 = out2;
      logger.info({ jobId }, 'Rewrites complete');
    }

    const pdfBuffer = await generateReport(job, analysis, rewrites);
    logger.info({ jobId }, 'Report PDF generated');

    const reportUrl = await uploadReport(jobId, pdfBuffer);
    logger.info({ jobId }, 'Report PDF uploaded to R2');

    let cvUrl = null;
    if (job.tier === 'FULL' && rewrites) {
      const { result: cvData, inputTokens: in3, outputTokens: out3 } = await runCvRewrite(resumeText, jobDescription, analysis, rewrites);
      tokensIn3 = in3;
      tokensOut3 = out3;
      logger.info({ jobId }, 'CV rewrite complete');

      const cvBuffer = await generateCv(cvData, analysis.detected_language || 'en');
      logger.info({ jobId }, 'CV PDF generated');

      cvUrl = await uploadCv(jobId, cvBuffer);
      logger.info({ jobId }, 'CV PDF uploaded to R2');
    }

    await sendEmailWithRetry(
      () => sendReportEmail(job.email, jobId, reportUrl, job.tier, cvUrl),
      jobId,
      'Report email'
    );
    logger.info({ jobId }, 'Email sent');

    await db.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETE',
        reportUrl,
        cvUrl,
        tokensInCall2: { increment: tokensIn2 },
        tokensOutCall2: { increment: tokensOut2 },
        tokensInCall3: { increment: tokensIn3 },
        tokensOutCall3: { increment: tokensOut3 },
      },
    });

    logger.info({ jobId }, 'Full report complete');

    logEvent('full_report_complete', {
      jobId,
      properties: { tier: job.tier, durationMs: Date.now() - t0, tokensIn2, tokensOut2 },
    });
  } catch (err) {
    logger.error({ jobId, err }, 'runFullReport failed');
    Sentry.captureException(err, { extra: { jobId, phase: 'full_report', tier: job.tier } });

    logEvent('full_report_failed', {
      jobId,
      properties: { errorCode: err.code || null, message: err.message?.slice(0, 100) || 'unknown' },
    });

    await db.job.update({
      where: { id: jobId },
      data: { status: 'FAILED', errorMessage: err.message ?? 'Unknown error' },
    });

    try {
      await sendFailureEmail(job.email, jobId);
    } catch (emailErr) {
      logger.error({ jobId, emailErr }, 'Failed to send failure notification email');
      Sentry.captureException(emailErr, { extra: { jobId, phase: 'failure_email' } });
    }
  }
}
