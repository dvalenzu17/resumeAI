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
const PROCESSOR_FEE_PCT   = 0.05;            // Lemon Squeezy 5% per transaction
const PROCESSOR_FEE_FLAT  = 0.50;            // Lemon Squeezy $0.50 flat per transaction

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

function processorFeeForJob(j) {
  return revenueForJob(j) * PROCESSOR_FEE_PCT + PROCESSOR_FEE_FLAT;
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
    const ago14 = startOfDay(14);
    const ago30 = startOfDay(30);
    const ago60 = startOfDay(60);

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

    const totalProcessorFee = r4(completeJobs.reduce((s, j) => s + processorFeeForJob(j), 0));

    const totalCost = r4(totalClaudeCost + totalEmailCost + totalRailwayCost + totalProcessorFee);
    const avgCostPerJob = completeJobs.length > 0 ? r4(totalCost / completeJobs.length) : 0;

    const costs = {
      claude: {
        totalInputTokens: totalIn,
        totalOutputTokens: totalOut,
        totalCost: totalClaudeCost,
        avgCostPerJob: completeJobs.length > 0 ? r4(totalClaudeCost / completeJobs.length) : 0,
      },
      processor: {
        totalCost: totalProcessorFee,
        avgCostPerJob: completeJobs.length > 0 ? r4(totalProcessorFee / completeJobs.length) : 0,
        feeStructure: `${PROCESSOR_FEE_PCT * 100}% + $${PROCESSOR_FEE_FLAT.toFixed(2)} per transaction`,
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
    const grossProfit     = r4(totalRevenue - totalClaudeCost - totalEmailCost - totalProcessorFee);
    const netProfit       = r4(totalRevenue - totalCost);
    const grossMarginPct  = totalRevenue > 0 ? pct((totalRevenue - totalClaudeCost - totalEmailCost - totalProcessorFee) / totalRevenue) : 0;
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

    // ── Unit economics (per tier) ─────────────────────────────────────────
    const basicJobs = completeJobs.filter(j => j.tier === 'BASIC');
    const fullJobs  = completeJobs.filter(j => j.tier === 'FULL');

    // Estimated Claude cost per tier when no real job data exists yet
    const CLAUDE_ESTIMATE = { BASIC: 0.024, FULL: 0.095 };

    function tierUnitEcon(jobs, price, tier) {
      const processorFee = r4(price * PROCESSOR_FEE_PCT + PROCESSOR_FEE_FLAT);
      const avgClaude    = jobs.length > 0
        ? r4(jobs.reduce((s, j) => s + claudeCostForJob(j), 0) / jobs.length)
        : CLAUDE_ESTIMATE[tier];
      const netPerJob    = r4(price - processorFee - avgClaude);
      return {
        price,
        processorFee,
        avgClaudeCost: avgClaude,
        netPerJob,
        marginPct: pct(netPerJob / price),
        jobCount: jobs.length,
      };
    }

    const unitEconomics = {
      BASIC: tierUnitEcon(basicJobs, BASIC_PRICE, 'BASIC'),
      FULL:  tierUnitEcon(fullJobs,  FULL_PRICE,  'FULL'),
    };

    // ── Business metrics ──────────────────────────────────────────────────

    // COGS (variable costs only — costs that scale with each sale)
    const avgProcessorFeeAll = completeJobs.length > 0 ? r4(totalProcessorFee / completeJobs.length) : 0;
    const avgClaudeAll       = completeJobs.length > 0 ? r4(totalClaudeCost   / completeJobs.length) : 0;
    const avgEmailAll        = completeJobs.length > 0 ? r4(totalEmailCost    / completeJobs.length) : 0;
    const avgCOGS            = r4(avgProcessorFeeAll + avgClaudeAll + avgEmailAll);

    // Contribution margin: what's left from each sale after variable costs
    const avgContribMargin  = r4(avgRevPerJob - avgCOGS);
    const contribMarginPct  = avgRevPerJob > 0 ? pct(avgContribMargin / avgRevPerJob) : 0;

    // Break-even: minimum sales/month to cover fixed costs (Railway)
    const breakEvenJobs = avgContribMargin > 0 ? Math.ceil(RAILWAY_MONTHLY / avgContribMargin) : null;

    // Burn rate: total monthly spend (fixed + variable at current sales pace)
    const dailyJobRate    = daysRunning > 0 ? completeJobs.length / daysRunning : 0;
    const burnRateMonthly = r2(RAILWAY_MONTHLY + avgCOGS * dailyJobRate * 30);

    // Revenue velocity: week-over-week and month-over-month
    const rev7        = revenue.last7days.revenue;
    const rev30val    = revenue.last30days.revenue;
    const revPrior7   = r2(completeJobs.filter(j => j.createdAt >= ago14 && j.createdAt < ago7).reduce((s, j) => s + revenueForJob(j), 0));
    const revPrior30  = r2(completeJobs.filter(j => j.createdAt >= ago60 && j.createdAt < ago30).reduce((s, j) => s + revenueForJob(j), 0));
    const velocityWoW = revPrior7  > 0 ? pct((rev7     - revPrior7)  / revPrior7)  : null;
    const velocityMoM = revPrior30 > 0 ? pct((rev30val - revPrior30) / revPrior30) : null;

    // LTV: average total revenue per unique customer (email)
    const emailRevMap = {};
    for (const j of completeJobs) {
      const e = j.email?.toLowerCase().trim();
      if (!e) continue;
      if (!emailRevMap[e]) emailRevMap[e] = { count: 0, revenue: 0 };
      emailRevMap[e].count++;
      emailRevMap[e].revenue += revenueForJob(j);
    }
    const uniqueCustomers        = Object.keys(emailRevMap).length;
    const emailRevValues         = Object.values(emailRevMap);
    const ltv                    = uniqueCustomers > 0 ? r2(emailRevValues.reduce((s, c) => s + c.revenue, 0) / uniqueCustomers) : avgRevPerJob;
    const avgPurchasesPerCustomer = uniqueCustomers > 0 ? r4(emailRevValues.reduce((s, c) => s + c.count, 0) / uniqueCustomers) : 1;

    // Operating leverage: fixed costs as % of total — higher = more scalable
    const operatingLeveragePct = totalCost > 0 ? pct(totalRailwayCost / totalCost) : 0;

    // Rule of 40: annualised growth % + net profit margin % (>40 = world-class)
    const annualizedGrowthPct = velocityMoM !== null ? r2(velocityMoM * 12) : null;
    const netMarginPct        = totalRevenue > 0 ? pct(netProfit / totalRevenue) : 0;
    const rule40Score         = annualizedGrowthPct !== null ? r2(annualizedGrowthPct + netMarginPct) : null;

    const businessMetrics = {
      cogs: {
        label: 'Cost of Goods Sold — variable costs per sale',
        avgProcessorFee: avgProcessorFeeAll,
        avgClaudeCost:   avgClaudeAll,
        avgEmailCost:    avgEmailAll,
        avgTotalPerJob:  avgCOGS,
      },
      contributionMargin: {
        label: 'Revenue left after COGS — funds fixed costs and profit',
        avgPerJob:  avgContribMargin,
        marginPct:  contribMarginPct,
      },
      breakEven: {
        label: 'Minimum sales per month to cover fixed costs',
        jobsPerMonth:      breakEvenJobs,
        fixedCostsMonthly: RAILWAY_MONTHLY,
      },
      burnRate: {
        label: 'Total monthly spend at current sales pace',
        monthly: burnRateMonthly,
      },
      ltv: {
        label: 'Average total revenue per unique customer',
        avgRevenuePerCustomer:    ltv,
        avgPurchasesPerCustomer:  avgPurchasesPerCustomer,
        uniqueCustomers,
      },
      revenueVelocity: {
        label: 'Sales growth rate week-over-week and month-over-month',
        weekOverWeekPct:   velocityWoW,
        monthOverMonthPct: velocityMoM,
        last7dRevenue:     rev7,
        prior7dRevenue:    revPrior7,
        last30dRevenue:    rev30val,
        prior30dRevenue:   revPrior30,
      },
      operatingLeverage: {
        label: 'Fixed cost share of total costs — higher means more scalable',
        fixedCostPct: operatingLeveragePct,
      },
      rule40: {
        label: 'Annualised growth % + net margin % — score above 40 is world-class',
        score:                rule40Score,
        annualizedGrowthPct,
        netMarginPct,
        healthy:              rule40Score !== null ? rule40Score >= 40 : null,
      },
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
    const jobs30 = completeJobs.filter(j => j.createdAt >= ago30);
    const claudeCost30    = r4(jobs30.reduce((s, j) => s + claudeCostForJob(j), 0));
    const processorCost30 = r4(jobs30.reduce((s, j) => s + processorFeeForJob(j), 0));
    const projectedMonthlyProfit = r2(monthlyRunRate - claudeCost30 - processorCost30 - RAILWAY_MONTHLY);

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
      unitEconomics,
      businessMetrics,
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

// GET /api/admin/performance
// Processing time percentiles, Claude retry rate, PDF rejection rate
adminRouter.get('/performance', requireAdminSecret, async (req, res) => {
  try {
    const [teaserEvents, fullEvents, retryCount, pdfRejected, totalUploads] = await Promise.all([
      db.analyticsEvent.findMany({
        where: { event: 'teaser_complete' },
        select: { properties: true },
        take: 500,
        orderBy: { createdAt: 'desc' },
      }),
      db.analyticsEvent.findMany({
        where: { event: 'full_report_complete' },
        select: { properties: true },
        take: 500,
        orderBy: { createdAt: 'desc' },
      }),
      db.analyticsEvent.count({ where: { event: 'claude_retry' } }),
      db.analyticsEvent.count({ where: { event: 'pdf_rejected' } }),
      db.analyticsEvent.count({ where: { event: 'job_created' } }),
    ]);

    function percentiles(durations) {
      if (!durations.length) return { p50: 0, p75: 0, p95: 0, p99: 0, avg: 0, count: 0 };
      const s = [...durations].sort((a, b) => a - b);
      const p = (pct) => s[Math.floor(s.length * pct / 100)] || 0;
      return {
        p50: p(50), p75: p(75), p95: p(95), p99: p(99),
        avg: Math.round(s.reduce((a, b) => a + b, 0) / s.length),
        count: s.length,
      };
    }

    const teaserDur = teaserEvents.map(e => e.properties?.durationMs).filter(n => typeof n === 'number');
    const fullDur = fullEvents.map(e => e.properties?.durationMs).filter(n => typeof n === 'number');
    const totalJobs = teaserDur.length + fullDur.length;

    res.json({
      teaserAnalysis: percentiles(teaserDur),
      fullReport: percentiles(fullDur),
      claudeRetryRate: {
        retries: retryCount,
        totalJobs,
        rate: totalJobs > 0 ? Math.round(retryCount / totalJobs * 10000) / 100 : 0,
      },
      pdfRejectionRate: {
        rejected: pdfRejected,
        totalUploads,
        rate: totalUploads > 0 ? Math.round(pdfRejected / totalUploads * 10000) / 100 : 0,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Admin performance query failed');
    res.status(500).json({ error: 'Performance query failed' });
  }
});

// GET /api/admin/simulate?basic=10&full=5
// P&L simulator: plug in a number of sales, see exactly where every dollar goes.
adminRouter.get('/simulate', requireAdminSecret, async (req, res) => {
  try {
    const basicCount = Math.max(0, parseInt(req.query.basic) || 0);
    const fullCount  = Math.max(0, parseInt(req.query.full)  || 0);
    const totalJobs  = basicCount + fullCount;

    // Pull real average Claude costs per tier from completed jobs
    const completedJobs = await db.job.findMany({
      where: { status: 'COMPLETE' },
      select: { tier: true, tokensInCall1: true, tokensOutCall1: true, tokensInCall2: true, tokensOutCall2: true },
    });

    function avgClaudeForTier(tier) {
      const jobs = completedJobs.filter(j => j.tier === tier);
      if (!jobs.length) return tier === 'FULL' ? 0.055 : 0.024; // fallback estimates
      const total = jobs.reduce((s, j) => {
        const tin  = (j.tokensInCall1  || 0) + (j.tokensInCall2  || 0);
        const tout = (j.tokensOutCall1 || 0) + (j.tokensOutCall2 || 0);
        return s + tin * CLAUDE_INPUT_PRICE + tout * CLAUDE_OUTPUT_PRICE;
      }, 0);
      return r4(total / jobs.length);
    }

    const claudePerBasic = avgClaudeForTier('BASIC');
    const claudePerFull  = avgClaudeForTier('FULL');

    // Per-job breakdown (variable costs only — same regardless of volume)
    function jobBreakdown(price, claudeCost) {
      const processorFee = r4(price * PROCESSOR_FEE_PCT + PROCESSOR_FEE_FLAT);
      const resendCost   = 0; // within free tier at typical volumes
      const totalCOGS    = r4(processorFee + claudeCost + resendCost);
      const contribution = r4(price - totalCOGS);
      return {
        revenue:       price,
        costs: {
          processorFee,
          claude:      claudeCost,
          resend:      resendCost,
          totalCOGS,
        },
        contributionMargin: contribution,
        contributionMarginPct: pct(contribution / price),
      };
    }

    const perJob = {
      BASIC: jobBreakdown(BASIC_PRICE, claudePerBasic),
      FULL:  jobBreakdown(FULL_PRICE,  claudePerFull),
    };

    // Simulation totals for the requested volume
    const grossRevenue     = r2(basicCount * BASIC_PRICE + fullCount * FULL_PRICE);
    const totalProcessor   = r4(basicCount * perJob.BASIC.costs.processorFee + fullCount * perJob.FULL.costs.processorFee);
    const totalClaude      = r4(basicCount * claudePerBasic + fullCount * claudePerFull);
    const totalResend      = 0;
    const totalVariable    = r4(totalProcessor + totalClaude + totalResend);
    const totalFixed       = RAILWAY_MONTHLY; // always $10/month regardless of volume
    const totalCosts       = r4(totalVariable + totalFixed);
    const netProfit        = r4(grossRevenue - totalCosts);
    const netMarginPct     = grossRevenue > 0 ? pct(netProfit / grossRevenue) : 0;
    const railwayPerJob    = totalJobs > 0 ? r4(RAILWAY_MONTHLY / totalJobs) : RAILWAY_MONTHLY;

    // Dollar destination: where does each dollar go?
    const destinations = grossRevenue > 0 ? {
      toProcessor:  { amount: totalProcessor, pct: pct(totalProcessor / grossRevenue) },
      toClaude:     { amount: totalClaude,    pct: pct(totalClaude    / grossRevenue) },
      toResend:     { amount: totalResend,    pct: pct(totalResend    / grossRevenue) },
      toRailway:    { amount: totalFixed,     pct: pct(totalFixed     / grossRevenue) },
      toYou:        { amount: netProfit,      pct: pct(netProfit      / grossRevenue) },
    } : null;

    // Scale table: what does profit look like at different volumes?
    const scaleSteps = [1, 5, 10, 25, 50, 100].map(n => {
      const ratio   = totalJobs > 0 ? n / totalJobs : 0;
      const rev     = r2(grossRevenue * ratio);
      const varCost = r4(totalVariable * ratio);
      const net     = r4(rev - varCost - RAILWAY_MONTHLY);
      return { jobs: n, revenue: rev, variableCosts: varCost, railway: RAILWAY_MONTHLY, netProfit: net };
    });

    res.json({
      inputs: { basicCount, fullCount, totalJobs },
      perJob,
      railwayNote: `Railway is a fixed $${RAILWAY_MONTHLY}/month regardless of volume. At ${totalJobs} jobs it costs $${railwayPerJob} per job.`,
      totals: {
        grossRevenue,
        costs: {
          processor: totalProcessor,
          claude:    totalClaude,
          resend:    totalResend,
          railway:   totalFixed,
          total:     totalCosts,
        },
        netProfit,
        netMarginPct,
      },
      destinations,
      scaleTable: scaleSteps,
    });
  } catch (err) {
    logger.error({ err }, 'Admin simulate query failed');
    res.status(500).json({ error: 'Simulate query failed' });
  }
});

// GET /api/admin/attribution
// Channel LTV by UTM source, blog conversion attribution
adminRouter.get('/attribution', requireAdminSecret, async (req, res) => {
  try {
    const [jobEvents, completeJobs] = await Promise.all([
      db.analyticsEvent.findMany({
        where: { event: 'job_created', jobId: { not: null } },
        select: { jobId: true, utmSource: true, referrer: true },
      }),
      db.job.findMany({
        where: { status: 'COMPLETE' },
        select: { id: true, tier: true },
      }),
    ]);

    const metaByJob = {};
    for (const e of jobEvents) {
      if (e.jobId) metaByJob[e.jobId] = { utmSource: e.utmSource, referrer: e.referrer };
    }

    const channelMap = {};
    for (const job of completeJobs) {
      const meta = metaByJob[job.id];
      const channel = meta?.utmSource || (meta?.referrer?.includes('/blog/') ? 'blog' : 'direct');
      if (!channelMap[channel]) channelMap[channel] = { count: 0, revenue: 0 };
      channelMap[channel].count++;
      channelMap[channel].revenue += job.tier === 'FULL' ? 29 : 12;
    }

    const attribution = Object.entries(channelMap)
      .map(([channel, d]) => ({
        channel,
        count: d.count,
        revenue: d.revenue,
        avgRevenue: Math.round(d.revenue / d.count * 100) / 100,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    res.json({ attribution });
  } catch (err) {
    logger.error({ err }, 'Admin attribution query failed');
    res.status(500).json({ error: 'Attribution query failed' });
  }
});
