import { db } from '../lib/db.js';
import { logger } from '../lib/logger.js';
import { runAnalysis, runRewrites } from './claude.js';
import { generateReport } from './report.js';
import { uploadReport } from './storage.js';
import { sendReportEmail, sendFailureEmail } from './email.js';

const MAX_RESUME_CHARS = 6000;
const MAX_JD_CHARS = 4000;

// Phase 1 — free teaser. Runs Claude Call 1, stores result, marks PREVIEW_READY.
// Called immediately on job creation, before any payment.
export async function runTeaserAnalysis(jobId) {
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

    const { result: analysis, inputTokens, outputTokens } = await runAnalysis(resumeText, jobDescription);
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
  } catch (err) {
    logger.error({ jobId, err }, 'runTeaserAnalysis failed');
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

  if (job.status === 'PROCESSING' || job.status === 'COMPLETE') {
    logger.info({ jobId, status: job.status }, 'runFullReport: skipping duplicate run');
    return;
  }

  await db.job.update({ where: { id: jobId }, data: { status: 'PROCESSING' } });

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
    if (job.tier === 'FULL') {
      const { result: rewriteResult, inputTokens: in2, outputTokens: out2 } = await runRewrites(resumeText, jobDescription, analysis, job.coverLetterContext ?? null);
      rewrites = rewriteResult;
      tokensIn2 = in2;
      tokensOut2 = out2;
      logger.info({ jobId }, 'Rewrites complete');
    }

    const pdfBuffer = await generateReport(job, analysis, rewrites);
    logger.info({ jobId }, 'PDF generated');

    const reportUrl = await uploadReport(jobId, pdfBuffer);
    logger.info({ jobId }, 'PDF uploaded to R2');

    await sendReportEmail(job.email, jobId, reportUrl, job.tier);
    logger.info({ jobId }, 'Email sent');

    await db.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETE',
        reportUrl,
        tokensInCall2: { increment: tokensIn2 },
        tokensOutCall2: { increment: tokensOut2 },
      },
    });

    logger.info({ jobId }, 'Full report complete');
  } catch (err) {
    logger.error({ jobId, err }, 'runFullReport failed');

    await db.job.update({
      where: { id: jobId },
      data: { status: 'FAILED', errorMessage: err.message ?? 'Unknown error' },
    });

    try {
      await sendFailureEmail(job.email, jobId);
    } catch (emailErr) {
      logger.error({ jobId, emailErr }, 'Failed to send failure notification email');
    }
  }
}
