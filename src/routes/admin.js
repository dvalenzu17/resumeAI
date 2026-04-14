import { Router } from 'express';
import { db } from '../lib/db.js';
import { requireAdminSecret } from '../middleware/adminAuth.js';
import { logger } from '../lib/logger.js';

export const adminRouter = Router();

const BASIC_PRICE = 12;
const FULL_PRICE = 29;
const CLAUDE_INPUT_PRICE  = 3 / 1_000_000;   // $3 per million input tokens
const CLAUDE_OUTPUT_PRICE = 15 / 1_000_000;  // $15 per million output tokens
const RAILWAY_MONTHLY     = 10;              // approximate fixed monthly cost
const RESEND_FREE_TIER    = 3000;            // emails/month included free
const RESEND_OVERAGE_COST = 1 / 1000;        // $1 per 1000 emails over free tier

function r4(n) { return Math.round(n * 10000) / 10000; }
function r2(n) { return Math.round(n * 100) / 100; }
function pct(n) { return Math.round(n * 10000) / 100; } // e.g. 0.4234 → 42.34

function claudeCostForJob(j) {
  const totalIn  = (j.tokensInCall1 || 0) + (j.tokensInCall2 || 0);
  const totalOut = (j.tokensOutCall1 || 0) + (j.tokensOutCall2 || 0);
  return totalIn * CLAUDE_INPUT_PRICE + totalOut * CLAUDE_OUTPUT_PRICE;
}

function revenueForJob(j) {
  return j.tier === 'FULL' ? FULL_PRICE : BASIC_PRICE;
}

function toDateStr(date) {
  return date.toISOString().slice(0, 10);
}

function startOfDay(daysAgo = 0) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d;
}

// GET /api/admin/dashboard
adminRouter.get('/dashboard', requireAdminSecret, async (req, res) => {
  try {
    const now = new Date();
    const today = startOfDay(0);
    const ago7  = startOfDay(7);
    const ago30 = startOfDay(30);

    // All queries in parallel
    const [completeJobs, statusGroups, allJobs] = await Promise.all([
      db.job.findMany({
        where: { status: 'COMPLETE' },
        select: {
          id: true, tier: true, email: true, createdAt: true,
          tokensInCall1: true, tokensOutCall1: true,
          tokensInCall2: true, tokensOutCall2: true,
          feedbackResult: true,
        },
      }),
      db.job.groupBy({ by: ['status'], _count: { id: true } }),
      db.job.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true, email: true, tier: true, status: true, createdAt: true,
          tokensInCall1: true, tokensOutCall1: true,
          tokensInCall2: true, tokensOutCall2: true,
          feedbackResult: true,
        },
      }),
    ]);

    // ── Status breakdown ──────────────────────────────────────────────────
    const statusMap = {};
    for (const g of statusGroups) statusMap[g.status] = g._count.id;
    const totalJobs = Object.values(statusMap).reduce((s, n) => s + n, 0);

    // ── Funnel ────────────────────────────────────────────────────────────
    const uploads       = totalJobs;
    const previewReady  = (statusMap.PREVIEW_READY || 0) + (statusMap.PENDING_PAYMENT || 0) + (statusMap.PROCESSING || 0) + (statusMap.COMPLETE || 0);
    const checkoutStart = (statusMap.PENDING_PAYMENT || 0) + (statusMap.PROCESSING || 0) + (statusMap.COMPLETE || 0);
    const purchases     = statusMap.COMPLETE || 0;

    const funnel = {
      uploads,
      previewReady,
      checkoutStarted: checkoutStart,
      purchases,
      rates: {
        uploadToPreview:    uploads       > 0 ? pct(previewReady  / uploads)       : 0,
        previewToCheckout:  previewReady  > 0 ? pct(checkoutStart / previewReady)  : 0,
        checkoutToPurchase: checkoutStart > 0 ? pct(purchases     / checkoutStart) : 0,
        overallConversion:  uploads       > 0 ? pct(purchases     / uploads)       : 0,
      },
      statusBreakdown: {
        ANALYZING:      statusMap.ANALYZING      || 0,
        PREVIEW_READY:  statusMap.PREVIEW_READY  || 0,
        PENDING_PAYMENT:statusMap.PENDING_PAYMENT|| 0,
        PROCESSING:     statusMap.PROCESSING     || 0,
        COMPLETE:       statusMap.COMPLETE       || 0,
        FAILED:         statusMap.FAILED         || 0,
      },
    };

    // ── Revenue ───────────────────────────────────────────────────────────
    function revenueFor(jobs) {
      const basic = jobs.filter(j => j.tier === 'BASIC');
      const full  = jobs.filter(j => j.tier === 'FULL');
      return {
        revenue:     r2(basic.length * BASIC_PRICE + full.length * FULL_PRICE),
        jobCount:    jobs.length,
        basicCount:  basic.length,
        fullCount:   full.length,
      };
    }

    const revenue = {
      today:     revenueFor(completeJobs.filter(j => j.createdAt >= today)),
      last7days: revenueFor(completeJobs.filter(j => j.createdAt >= ago7)),
      last30days:revenueFor(completeJobs.filter(j => j.createdAt >= ago30)),
      allTime:   revenueFor(completeJobs),
      byTier: {
        BASIC: { count: completeJobs.filter(j => j.tier === 'BASIC').length, revenue: r2(completeJobs.filter(j => j.tier === 'BASIC').length * BASIC_PRICE), price: BASIC_PRICE },
        FULL:  { count: completeJobs.filter(j => j.tier === 'FULL').length,  revenue: r2(completeJobs.filter(j => j.tier === 'FULL').length  * FULL_PRICE),  price: FULL_PRICE  },
      },
    };

    // ── Costs ─────────────────────────────────────────────────────────────
    const totalIn  = completeJobs.reduce((s, j) => s + (j.tokensInCall1 || 0)  + (j.tokensInCall2 || 0),  0);
    const totalOut = completeJobs.reduce((s, j) => s + (j.tokensOutCall1 || 0) + (j.tokensOutCall2 || 0), 0);
    const totalClaudeCost = r4(totalIn * CLAUDE_INPUT_PRICE + totalOut * CLAUDE_OUTPUT_PRICE);

    const jobsWithEmail = completeJobs.filter(j => j.email && j.email !== '').length;
    const estimatedEmails = jobsWithEmail; // 1 report email per job; follow-ups sent separately
    const overageEmails = Math.max(0, estimatedEmails - RESEND_FREE_TIER);
    const totalEmailCost = r4(overageEmails * RESEND_OVERAGE_COST);

    const firstJob = completeJobs.reduce((min, j) => (!min || j.createdAt < min ? j.createdAt : min), null);
    const daysRunning = firstJob ? Math.max(1, Math.ceil((now - new Date(firstJob)) / (1000 * 60 * 60 * 24))) : 1;
    const totalRailwayCost = r2((RAILWAY_MONTHLY / 30) * daysRunning);

    const totalCost = r4(totalClaudeCost + totalEmailCost + totalRailwayCost);
    const avgCostPerJob = completeJobs.length > 0 ? r4(totalCost / completeJobs.length) : 0;

    const costs = {
      claude: {
        totalInputTokens: totalIn,
        totalOutputTokens: totalOut,
        totalCost: totalClaudeCost,
        avgCostPerJob: completeJobs.length > 0 ? r4(totalClaudeCost / completeJobs.length) : 0,
      },
      email: {
        estimatedEmailsSent: estimatedEmails,
        freeEmailsRemaining: Math.max(0, RESEND_FREE_TIER - estimatedEmails),
        overageEmails,
        totalCost: totalEmailCost,
      },
      railway: {
        daysRunning,
        totalCost: totalRailwayCost,
        monthlyFixed: RAILWAY_MONTHLY,
      },
      total: totalCost,
      avgCostPerJob,
    };

    // ── Profit ────────────────────────────────────────────────────────────
    const totalRevenue    = revenue.allTime.revenue;
    const grossProfit     = r4(totalRevenue - totalClaudeCost - totalEmailCost);
    const netProfit       = r4(totalRevenue - totalCost);
    const grossMarginPct  = totalRevenue > 0 ? pct((totalRevenue - totalClaudeCost - totalEmailCost) / totalRevenue) : 0;
    const avgRevPerJob    = completeJobs.length > 0 ? r2(totalRevenue / completeJobs.length) : 0;
    const avgProfitPerJob = completeJobs.length > 0 ? r4(netProfit / completeJobs.length) : 0;

    const profit = {
      totalRevenue,
      totalCost,
      grossProfit,
      netProfit,
      grossMarginPct,
      avgRevenuePerJob: avgRevPerJob,
      avgCostPerJob,
      avgProfitPerJob,
    };

    // ── Daily revenue (last 30 days) ──────────────────────────────────────
    const dailyMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = startOfDay(i);
      dailyMap[toDateStr(d)] = { date: toDateStr(d), revenue: 0, jobCount: 0, basicCount: 0, fullCount: 0 };
    }
    for (const j of completeJobs) {
      const d = toDateStr(new Date(j.createdAt));
      if (dailyMap[d]) {
        dailyMap[d].revenue += revenueForJob(j);
        dailyMap[d].jobCount++;
        if (j.tier === 'BASIC') dailyMap[d].basicCount++;
        else dailyMap[d].fullCount++;
      }
    }
    const dailyRevenue = Object.values(dailyMap).map(d => ({ ...d, revenue: r2(d.revenue) }));

    // ── Feedback ──────────────────────────────────────────────────────────
    const fbYes   = completeJobs.filter(j => j.feedbackResult === 'yes').length;
    const fbNo    = completeJobs.filter(j => j.feedbackResult === 'no').length;
    const fbTotal = fbYes + fbNo;
    const feedback = {
      yes: fbYes,
      no: fbNo,
      noResponse: completeJobs.length - fbTotal,
      totalComplete: completeJobs.length,
      responseRate: completeJobs.length > 0 ? pct(fbTotal / completeJobs.length) : 0,
      satisfactionRate: fbTotal > 0 ? pct(fbYes / fbTotal) : 0,
    };

    // ── Projections (based on last 30 days) ───────────────────────────────
    const rev30 = revenue.last30days.revenue;
    const dailyRunRate = r2(rev30 / 30);
    const monthlyRunRate = r2(dailyRunRate * 30);
    const annualRunRate = r2(dailyRunRate * 365);

    // Estimate monthly variable cost from last 30 days
    const claudeCost30 = r4(completeJobs.filter(j => j.createdAt >= ago30).reduce((s, j) => s + claudeCostForJob(j), 0));
    const projectedMonthlyProfit = r2(monthlyRunRate - claudeCost30 - RAILWAY_MONTHLY);

    const projections = {
      dailyRevenueRunRate: dailyRunRate,
      monthlyRevenueRunRate: monthlyRunRate,
      annualRevenueRunRate: annualRunRate,
      monthlyProfitProjection: projectedMonthlyProfit,
      basedOnDays: 30,
    };

    // ── Recent jobs ───────────────────────────────────────────────────────
    const recentJobs = allJobs.map(j => ({
      id: j.id,
      email: j.email || null,
      tier: j.tier,
      status: j.status,
      createdAt: j.createdAt,
      tokensIn:  (j.tokensInCall1  || 0) + (j.tokensInCall2  || 0),
      tokensOut: (j.tokensOutCall1 || 0) + (j.tokensOutCall2 || 0),
      claudeCost: r4(claudeCostForJob(j)),
      feedbackResult: j.feedbackResult || null,
    }));

    res.json({
      generatedAt: now,
      revenue,
      funnel,
      costs,
      profit,
      dailyRevenue,
      feedback,
      projections,
      recentJobs,
    });
  } catch (err) {
    logger.error({ err }, 'Admin dashboard query failed');
    res.status(500).json({ error: 'Dashboard query failed' });
  }
});

// GET /api/admin/funnel
adminRouter.get('/funnel', requireAdminSecret, async (req, res) => {
  try {
    const [pageViews, uploadStarts, scrollPaywall, checkoutClicks, jobGroups] = await Promise.all([
      db.analyticsEvent.count({ where: { event: 'page_view' } }),
      db.analyticsEvent.count({ where: { event: 'upload_started' } }),
      db.analyticsEvent.count({ where: { event: 'scroll_to_paywall' } }),
      db.analyticsEvent.count({ where: { event: 'checkout_clicked' } }),
      db.job.groupBy({ by: ['status'], _count: { id: true } }),
    ]);

    const sm = {};
    for (const g of jobGroups) sm[g.status] = g._count.id;
    const uploaded        = Object.values(sm).reduce((s, n) => s + n, 0);
    const previewed       = (sm.PREVIEW_READY || 0) + (sm.PENDING_PAYMENT || 0) + (sm.PROCESSING || 0) + (sm.COMPLETE || 0);
    const checkoutStarted = (sm.PENDING_PAYMENT || 0) + (sm.PROCESSING || 0) + (sm.COMPLETE || 0);
    const paid            = sm.COMPLETE || 0;

    const steps = [
      { step: 'Page views',          count: pageViews,                                      source: 'analytics' },
      { step: 'Upload intent',       count: uploadStarts,                                   source: 'analytics' },
      { step: 'Resume uploaded',     count: uploaded,                                       source: 'jobs' },
      { step: 'Preview seen',        count: previewed,                                      source: 'jobs' },
      { step: 'Scrolled to paywall', count: scrollPaywall,                                  source: 'analytics' },
      { step: 'Checkout clicked',    count: Math.max(checkoutClicks, checkoutStarted),      source: 'both' },
      { step: 'Paid',                count: paid,                                           source: 'jobs' },
    ];

    const funnel = steps.map((s, i) => ({
      ...s,
      dropRate: i === 0 || steps[i - 1].count === 0 ? null
        : Math.round((1 - s.count / steps[i - 1].count) * 10000) / 100,
    }));

    const [devices, browsers] = await Promise.all([
      db.analyticsEvent.groupBy({ by: ['device'], _count: { id: true }, where: { event: 'page_view', device: { not: null } } }),
      db.analyticsEvent.groupBy({ by: ['browser'], _count: { id: true }, where: { event: 'page_view', browser: { not: null } } }),
    ]);

    res.json({
      funnel,
      devices: devices.map(d => ({ device: d.device, count: d._count.id })),
      browsers: browsers.map(b => ({ browser: b.browser, count: b._count.id })),
    });
  } catch (err) {
    logger.error({ err }, 'Admin funnel query failed');
    res.status(500).json({ error: 'Funnel query failed' });
  }
});

// GET /api/admin/niche
adminRouter.get('/niche', requireAdminSecret, async (req, res) => {
  try {
    const jobs = await db.job.findMany({
      where: { analysisResult: { not: null } },
      select: { analysisResult: true, tier: true, status: true, createdAt: true },
      take: 500,
      orderBy: { createdAt: 'desc' },
    });

    const gapCounts = {};
    const matchCounts = {};

    for (const job of jobs) {
      const a = job.analysisResult;
      if (!a || typeof a !== 'object') continue;
      for (const gap of (Array.isArray(a.keyword_gaps) ? a.keyword_gaps : [])) {
        if (typeof gap === 'string' && gap.trim()) {
          const k = gap.toLowerCase().trim();
          gapCounts[k] = (gapCounts[k] || 0) + 1;
        }
      }
      for (const match of (Array.isArray(a.keyword_matches) ? a.keyword_matches : [])) {
        if (typeof match === 'string' && match.trim()) {
          const k = match.toLowerCase().trim();
          matchCounts[k] = (matchCounts[k] || 0) + 1;
        }
      }
    }

    const topGaps = Object.entries(gapCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 50)
      .map(([keyword, count]) => ({ keyword, count }));

    const topMatches = Object.entries(matchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 30)
      .map(([keyword, count]) => ({ keyword, count }));

    const scoreBuckets = { '0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 };
    for (const job of jobs) {
      const score = job.analysisResult?.ats_score;
      if (typeof score !== 'number') continue;
      if (score <= 25) scoreBuckets['0-25']++;
      else if (score <= 50) scoreBuckets['26-50']++;
      else if (score <= 75) scoreBuckets['51-75']++;
      else scoreBuckets['76-100']++;
    }

    res.json({ topGaps, topMatches, scoreBuckets, jobsAnalyzed: jobs.length });
  } catch (err) {
    logger.error({ err }, 'Admin niche query failed');
    res.status(500).json({ error: 'Niche query failed' });
  }
});
