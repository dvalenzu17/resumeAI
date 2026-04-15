import { Router } from 'express';
import multer from 'multer';
import { db } from '../lib/db.js';
import { AppError } from '../lib/errors.js';
import { extractText } from '../services/pdf.js';
import { createCheckoutSession } from '../services/payments.js';
import { runTeaserAnalysis, runFullReport } from '../services/analyser.js';
import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';
import { logEvent, parseUA, extractCountry } from '../services/analytics.js';
import { generateFreshSignedUrl } from '../services/storage.js';

export const jobsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(AppError.badRequest('Only PDF files are accepted', 'INVALID_FILE_TYPE'));
    } else {
      cb(null, true);
    }
  },
});

// POST /api/jobs
// Creates the job and fires the free teaser analysis. No payment at this stage.
jobsRouter.post('/', upload.single('resume'), async (req, res, next) => {
  try {
    const { jobDescription, tier, email: rawEmail } = req.body;

    if (!jobDescription || !tier) {
      throw AppError.badRequest('jobDescription and tier are required');
    }
    if (!['BASIC', 'FULL'].includes(tier)) {
      throw AppError.badRequest('tier must be BASIC or FULL');
    }
    if (jobDescription.length < 100) {
      throw AppError.badRequest('Job description must be at least 100 characters');
    }
    if (!req.file) {
      throw AppError.badRequest('Resume PDF is required');
    }

    const email = typeof rawEmail === 'string' ? rawEmail.trim() : '';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw AppError.badRequest('Invalid email address', 'INVALID_EMAIL');
    }

    let resumeText;
    try {
      resumeText = await extractText(req.file.buffer);
    } catch (err) {
      if (err.code === 'PDF_EMPTY') {
        logEvent('pdf_rejected', {
          ...parseUA(req.headers['user-agent'] || ''),
          country: extractCountry(req),
          properties: { reason: 'PDF_EMPTY', fileSize: req.file.size },
        });
      }
      throw err;
    }

    const job = await db.job.create({
      data: { tier, jobDescription, resumeText, status: 'ANALYZING', email },
    });

    // Parse analytics metadata from form submission
    let clientMeta = {};
    try { clientMeta = req.body.analytics ? JSON.parse(req.body.analytics) : {}; } catch { /* skip */ }
    const { device, browser, os } = parseUA(req.headers['user-agent'] || '');
    logEvent('job_created', {
      jobId: job.id,
      sessionId: clientMeta.sessionId || null,
      device, browser, os,
      country: extractCountry(req),
      utmSource:   clientMeta.utm?.utm_source   || null,
      utmMedium:   clientMeta.utm?.utm_medium   || null,
      utmCampaign: clientMeta.utm?.utm_campaign || null,
      utmTerm:     clientMeta.utm?.utm_term     || null,
      utmContent:  clientMeta.utm?.utm_content  || null,
      referrer:    clientMeta.referrer || null,
      properties: { tier, hasEmail: !!email, jdLength: jobDescription.length },
    });

    // Fire teaser analysis — always runs before payment
    runTeaserAnalysis(job.id).catch((err) => {
      logger.error({ jobId: job.id, err }, 'runTeaserAnalysis uncaught error');
    });

    logger.info({ jobId: job.id, tier }, 'Job created, teaser analysis started');
    res.status(201).json({ jobId: job.id });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/checkout
// Called from the preview page when the user clicks "Unlock". Creates a Lemon Squeezy
// checkout session for an existing PREVIEW_READY job.
jobsRouter.post('/:id/checkout', async (req, res, next) => {
  try {
    const job = await db.job.findUnique({ where: { id: req.params.id } });

    if (!job) throw AppError.notFound('Job not found');

    if (job.status !== 'PREVIEW_READY') {
      throw AppError.badRequest(
        `Job is not in a payable state (current status: ${job.status})`,
        'INVALID_JOB_STATE'
      );
    }

    // Accept tier override from preview page (user may switch tiers before paying)
    const chosenTier = ['BASIC', 'FULL'].includes(req.body?.tier) ? req.body.tier : job.tier;
    const coverLetterContext = req.body?.coverLetterContext ?? null;
    const userEmail = typeof req.body?.email === 'string' ? req.body.email.trim() : '';

    if (userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      throw AppError.badRequest('Invalid email address', 'INVALID_EMAIL');
    }

    if (env.SKIP_PAYMENT) {
      logger.info({ jobId: job.id }, 'SKIP_PAYMENT=true, skipping checkout');
      await db.job.update({
        where: { id: job.id },
        data: { status: 'PENDING_PAYMENT', tier: chosenTier, email: env.DEV_EMAIL, ...(coverLetterContext ? { coverLetterContext } : {}) },
      });
      runFullReport(job.id).catch((err) => {
        logger.error({ jobId: job.id, err }, 'runFullReport uncaught error');
      });
      return res.json({ jobId: job.id, checkoutUrl: null });
    }

    // Save email before checkout so abandonment can be tracked even if user doesn't complete payment
    if (userEmail) {
      await db.job.update({ where: { id: job.id }, data: { email: userEmail } });
    }

    const session = await createCheckoutSession({ jobId: job.id, tier: chosenTier, email: userEmail || job.email });

    logEvent('checkout_initiated', {
      jobId: job.id,
      properties: { tier: chosenTier, price: chosenTier === 'FULL' ? 29 : 12 },
    });

    await db.job.update({
      where: { id: job.id },
      data: { checkoutSessionId: session.id, status: 'PENDING_PAYMENT', tier: chosenTier, ...(coverLetterContext ? { coverLetterContext } : {}) },
    });

    logger.info({ jobId: job.id }, 'Checkout session created');
    res.json({ jobId: job.id, checkoutUrl: session.url });
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/:id/status
// Returns job status. When PREVIEW_READY, includes sanitised preview data
// (real score + 2 gap teasers — enough to hook, not enough to spoil).
jobsRouter.get('/:id/status', async (req, res, next) => {
  try {
    const job = await db.job.findUnique({
      where: { id: req.params.id },
      select: { id: true, status: true, tier: true, analysisResult: true, createdAt: true, reportUrl: true, cvUrl: true, email: true },
    });

    if (!job) throw AppError.notFound('Job not found');

    const response = { id: job.id, status: job.status, tier: job.tier, createdAt: job.createdAt };
    if (job.email) response.email = job.email;

    if (job.status === 'COMPLETE') {
      response.reportUrl = job.reportUrl || null;
      response.cvUrl = job.cvUrl || null;
    }

    if (job.status === 'PREVIEW_READY' && job.analysisResult) {
      const a = job.analysisResult;
      const gaps = Array.isArray(a.keyword_gaps) ? a.keyword_gaps : [];
      const matches = Array.isArray(a.keyword_matches) ? a.keyword_matches : [];
      const strengths = Array.isArray(a.strengths) ? a.strengths : [];
      const weaknesses = Array.isArray(a.weaknesses) ? a.weaknesses : [];

      response.preview = {
        ats_score: a.ats_score,
        human_score: a.human_score,
        experience_match: a.experience_match,
        gap_count: gaps.length,
        match_count: matches.length,
        strengths_count: strengths.length,
        weaknesses_count: weaknesses.length,
        jd_red_flag_count: Array.isArray(a.jd_red_flags) ? a.jd_red_flags.length : 0,
        keyword_gaps_teaser: gaps.slice(0, 2),
        // Actual weak bullet from resume for the teaser (optional — absent on older jobs)
        sample_weak_bullet: typeof a.sample_weak_bullet === 'string' && a.sample_weak_bullet ? a.sample_weak_bullet : null,
        // Personalise questions derived from the analysis
        personalise_prompts: {
          q1: gaps.length > 0
            ? `The JD requires "${gaps[0]}"${gaps[1] ? ` and "${gaps[1]}"` : ''} — skills not clearly in your resume. Tell us about any experience you have with these, even if indirect.`
            : 'Why do you want this specific role?',
          q2: weaknesses.length > 0
            ? `Your resume was flagged for: "${weaknesses[0]}". Tell us about a real achievement that addresses this directly.`
            : 'What\'s the most relevant achievement from your background for this role?',
          q3: 'What makes you a non-obvious choice for this role — something that doesn\'t show up clearly on your resume?',
        },
      };
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/:id/download?email=xxx
// Re-generates a fresh 72h signed URL. Requires email to match job record.
jobsRouter.get('/:id/download', async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) throw AppError.badRequest('email query parameter is required');

    const job = await db.job.findUnique({
      where: { id: req.params.id },
      select: { id: true, status: true, email: true, tier: true, reportUrl: true, cvUrl: true },
    });

    if (!job) throw AppError.notFound('Job not found');
    if (job.status !== 'COMPLETE') throw AppError.badRequest('Report is not ready yet');
    if (!job.email || job.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
      throw AppError.badRequest('Email does not match this job', 'EMAIL_MISMATCH');
    }

    const reportUrl = await generateFreshSignedUrl(job.id, 'report');
    const cvUrl = job.tier === 'FULL' ? await generateFreshSignedUrl(job.id, 'cv') : null;

    res.json({ reportUrl, cvUrl });
  } catch (err) {
    next(err);
  }
});
