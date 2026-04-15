import { useState, useEffect, useCallback } from 'react';
import styles from './AdminView.module.css';

const SECRET_KEY = 'adminSecret';

function fmt$(n) { return n == null ? '$0' : `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmt$4(n) { return n == null ? '$0.0000' : `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`; }
function fmtN(n) { return n == null ? '0' : Number(n).toLocaleString(); }
function fmtPct(n) { return n == null ? '0%' : `${n}%`; }

const STATUS_COLOR = {
  COMPLETE: '#059669',
  FAILED: '#dc2626',
  ANALYZING: '#d97706',
  PREVIEW_READY: '#2563eb',
  PENDING_PAYMENT: '#7c3aed',
  PROCESSING: '#0891b2',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Card({ label, value, sub, accent }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardValue} style={accent ? { color: 'var(--accent)' } : {}}>{value}</div>
      <div className={styles.cardLabel}>{label}</div>
      {sub && <div className={styles.cardSub}>{sub}</div>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </div>
  );
}

function Department({ label, icon, children }) {
  return (
    <div className={styles.dept}>
      <div className={styles.deptHeader}>
        <span className={styles.deptIcon}>{icon}</span>
        <span className={styles.deptLabel}>{label}</span>
      </div>
      <div className={styles.deptBody}>{children}</div>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className={styles.chartWrap}>
      <div className={styles.chart}>
        {data.map((d, i) => (
          <div key={d.date} className={styles.barCol} title={`${d.date}: ${fmt$(d.revenue)} (${d.jobCount} jobs)`}>
            <div
              className={styles.bar}
              style={{ height: `${Math.max(2, (d.revenue / max) * 100)}%` }}
            />
            {(i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) && (
              <div className={styles.barLabel}>{d.date.slice(5)}</div>
            )}
          </div>
        ))}
      </div>
      <div className={styles.chartAxisMax}>{fmt$(max)}</div>
    </div>
  );
}

function FunnelStep({ label, count, rate, last }) {
  return (
    <div className={styles.funnelWrap}>
      <div className={styles.funnelStep}>
        <div className={styles.funnelCount}>{fmtN(count)}</div>
        <div className={styles.funnelLabel}>{label}</div>
      </div>
      {!last && (
        <div className={styles.funnelArrow}>
          <span className={styles.funnelRate}>{fmtPct(rate)}</span>
          <span className={styles.funnelChevron}>→</span>
        </div>
      )}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export default function AdminView() {
  const [secret, setSecret] = useState(() => sessionStorage.getItem(SECRET_KEY) || '');
  const [input, setInput] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [funnelData, setFunnelData] = useState(null);
  const [nicheData, setNicheData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [attrData, setAttrData] = useState(null);
  const [simBasic, setSimBasic] = useState(10);
  const [simFull, setSimFull] = useState(5);

  const fetchDashboard = useCallback(async (s) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { 'X-Admin-Secret': s },
      });
      if (res.status === 401) {
        sessionStorage.removeItem(SECRET_KEY);
        setSecret('');
        setError('Incorrect password.');
        return;
      }
      if (res.status === 503) {
        setError('Admin not configured. Set ADMIN_SECRET env var.');
        return;
      }
      if (!res.ok) {
        setError('Dashboard failed to load.');
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFunnel = useCallback(async (s) => {
    try {
      const res = await fetch('/api/admin/funnel', { headers: { 'X-Admin-Secret': s } });
      if (res.ok) setFunnelData(await res.json());
    } catch {}
  }, []);

  const fetchNiche = useCallback(async (s) => {
    try {
      const res = await fetch('/api/admin/niche', { headers: { 'X-Admin-Secret': s } });
      if (res.ok) setNicheData(await res.json());
    } catch {}
  }, []);

  const fetchHealth = useCallback(async (s) => {
    try {
      const [perfRes, attrRes] = await Promise.all([
        fetch('/api/admin/performance', { headers: { 'X-Admin-Secret': s } }),
        fetch('/api/admin/attribution', { headers: { 'X-Admin-Secret': s } }),
      ]);
      if (perfRes.ok) setHealthData(await perfRes.json());
      if (attrRes.ok) setAttrData(await attrRes.json());
    } catch {}
  }, []);

  useEffect(() => {
    if (secret) {
      fetchDashboard(secret);
      fetchFunnel(secret);
      fetchNiche(secret);
      fetchHealth(secret);
    }
  }, [secret, fetchDashboard, fetchFunnel, fetchNiche, fetchHealth]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sessionStorage.setItem(SECRET_KEY, input.trim());
    setSecret(input.trim());
  };

  // ── Password gate ──────────────────────────────────────────────────────
  if (!secret || (!data && !loading)) {
    return (
      <div className={styles.gate}>
        <div className={styles.gateCard}>
          <p className={styles.gateLogo}>short<span className={styles.logoAccent}>listed</span> <span className={styles.gateAdmin}>admin</span></p>
          <form onSubmit={handleLogin} className={styles.gateForm}>
            <input
              type="password"
              className={styles.gateInput}
              placeholder="Admin password"
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
            />
            <button className={styles.gateBtn} type="submit">Enter</button>
          </form>
          {error && <p className={styles.gateError}>{error}</p>}
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className={styles.loading}>Loading dashboard...</div>;
  }

  if (!data) return null;

  const { revenue, funnel, costs, profit, unitEconomics, dailyRevenue, feedback, projections, recentJobs, generatedAt } = data;

  // ── P&L simulator (client-side, instant) ──────────────────────────────────
  const RAILWAY_MONTHLY = 10;
  function r2(n) { return Math.round(n * 100) / 100; }
  function r4(n) { return Math.round(n * 10000) / 10000; }
  function simCalc(basic, full) {
    if (!unitEconomics) return null;
    const b = unitEconomics.BASIC;
    const f = unitEconomics.FULL;
    const totalJobs    = basic + full;
    const gross        = basic * 12 + full * 29;
    const toProcessor  = r4(basic * b.processorFee + full * f.processorFee);
    const toClaude     = r4(basic * b.avgClaudeCost + full * f.avgClaudeCost);
    const toRailway    = RAILWAY_MONTHLY;
    const toResend     = 0;
    const totalCosts   = r4(toProcessor + toClaude + toRailway + toResend);
    const netProfit    = r4(gross - totalCosts);
    const pct = (n) => gross > 0 ? r2(n / gross * 100) : 0;
    const scaleSteps = [1, 5, 10, 25, 50, 100].map(n => {
      const ratio = totalJobs > 0 ? n / totalJobs : n / 15;
      const rev   = r2(gross * ratio);
      const vc    = r4((toProcessor + toClaude) * ratio);
      return { jobs: n, revenue: rev, variableCosts: vc, railway: RAILWAY_MONTHLY, net: r4(rev - vc - RAILWAY_MONTHLY) };
    });
    return {
      totalJobs, gross,
      toProcessor, toClaude, toRailway, toResend, totalCosts, netProfit,
      netMarginPct: pct(netProfit),
      railwayPerJob: totalJobs > 0 ? r4(RAILWAY_MONTHLY / totalJobs) : RAILWAY_MONTHLY,
      destinations: gross > 0 ? [
        { label: 'Lemon Squeezy', amount: toProcessor, pct: pct(toProcessor), color: '#f59e0b' },
        { label: 'Claude API',    amount: toClaude,    pct: pct(toClaude),    color: '#8b5cf6' },
        { label: 'Railway',       amount: toRailway,   pct: pct(toRailway),   color: '#6b7280' },
        { label: 'You keep',      amount: netProfit,   pct: pct(netProfit),   color: '#059669' },
      ] : [],
      scaleSteps,
    };
  }
  const sim = simCalc(simBasic, simFull);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.logo}>short<span className={styles.logoAccent}>listed</span></span>
          <span className={styles.adminBadge}>admin</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.tabs}>
            {['dashboard', 'funnel', 'niche', 'health', 'simulator'].map(tab => (
              <button
                key={tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'dashboard' ? 'Dashboard' : tab === 'funnel' ? 'Leakage Funnel' : tab === 'niche' ? 'Niche Finder' : tab === 'health' ? 'Health' : 'P&L Sim'}
              </button>
            ))}
          </div>
          <span className={styles.genAt}>Updated {new Date(generatedAt).toLocaleTimeString()}</span>
          <button className={styles.refreshBtn} onClick={() => { fetchDashboard(secret); fetchFunnel(secret); fetchNiche(secret); fetchHealth(secret); }}>Refresh</button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className={styles.body}>

          {/* ── FINANCE ─────────────────────────────────────────────────── */}
          <Department label="Finance" icon="$">

            <Section title="Key numbers">
              <div className={styles.cardGrid}>
                <Card label="All-time revenue" value={fmt$(revenue.allTime.revenue)} sub={`${fmtN(revenue.allTime.jobCount)} paid jobs`} accent />
                <Card label="Net profit (all-time)" value={fmt$(profit.netProfit)} sub="after all costs" />
                <Card label="Gross margin" value={fmtPct(profit.grossMarginPct)} sub="excl. Railway" />
                <Card label="Avg profit / job" value={fmt$(profit.avgProfitPerJob)} sub={`avg cost ${fmt$4(profit.avgCostPerJob)}`} />
                <Card label="Today" value={fmt$(revenue.today.revenue)} sub={`${fmtN(revenue.today.jobCount)} jobs`} />
                <Card label="Last 7 days" value={fmt$(revenue.last7days.revenue)} sub={`${fmtN(revenue.last7days.jobCount)} jobs`} />
              </div>
            </Section>

            <Section title="Revenue by period">
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>Period</th><th>Revenue</th><th>Jobs</th><th>Audit</th><th>Glow-Up</th><th>Avg/job</th></tr>
                  </thead>
                  <tbody>
                    {[
                      ['Today', revenue.today],
                      ['Last 7 days', revenue.last7days],
                      ['Last 30 days', revenue.last30days],
                      ['All time', revenue.allTime],
                    ].map(([label, r]) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td className={styles.mono}>{fmt$(r.revenue)}</td>
                        <td className={styles.mono}>{fmtN(r.jobCount)}</td>
                        <td className={styles.mono}>{fmtN(r.basicCount)}</td>
                        <td className={styles.mono}>{fmtN(r.fullCount)}</td>
                        <td className={styles.mono}>{r.jobCount > 0 ? fmt$(r.revenue / r.jobCount) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="Daily revenue — last 30 days">
              <BarChart data={dailyRevenue} />
            </Section>

            <Section title="Cost breakdown">
              <div className={styles.costGrid}>
                <div className={styles.costCard}>
                  <div className={styles.costTitle}>Lemon Squeezy</div>
                  <div className={styles.costAmount}>{fmt$(costs.processor.totalCost)}</div>
                  <div className={styles.costMeta}>{costs.processor.feeStructure}</div>
                  <div className={styles.costMeta}>{fmt$(costs.processor.avgCostPerJob)} per job</div>
                </div>
                <div className={styles.costCard}>
                  <div className={styles.costTitle}>Claude API</div>
                  <div className={styles.costAmount}>{fmt$4(costs.claude.totalCost)}</div>
                  <div className={styles.costMeta}>{fmtN(costs.claude.totalInputTokens)} in / {fmtN(costs.claude.totalOutputTokens)} out (all jobs)</div>
                  <div className={styles.costMeta}>Teaser: {fmtN(costs.claude.teaserTokensIn)}↑ {fmtN(costs.claude.teaserTokensOut)}↓</div>
                  <div className={styles.costMeta}>Paid: {fmtN(costs.claude.paidTokensIn)}↑ {fmtN(costs.claude.paidTokensOut)}↓</div>
                  <div className={styles.costMeta}>{fmt$4(costs.claude.avgCostPerJob)} avg per completed job</div>
                </div>
                <div className={styles.costCard}>
                  <div className={styles.costTitle}>Resend email</div>
                  <div className={styles.costAmount}>{fmt$4(costs.email.totalCost)}</div>
                  <div className={styles.costMeta}>{fmtN(costs.email.estimatedEmailsSent)} sent</div>
                  <div className={styles.costMeta}>{fmtN(costs.email.freeEmailsRemaining)} free remaining</div>
                </div>
                <div className={styles.costCard}>
                  <div className={styles.costTitle}>Railway (hosting)</div>
                  <div className={styles.costAmount}>{fmt$(costs.railway.totalCost)}</div>
                  <div className={styles.costMeta}>{fmtN(costs.railway.daysRunning)} days running</div>
                  <div className={styles.costMeta}>${costs.railway.monthlyFixed}/mo fixed</div>
                </div>
              </div>
              <div className={styles.costSummary}>
                Total cost: <strong>{fmt$(costs.total)}</strong>
                {' · '}
                Gross profit: <strong style={{ color: profit.grossProfit >= 0 ? '#059669' : '#dc2626' }}>{fmt$(profit.grossProfit)}</strong>
                {' · '}
                Net profit: <strong style={{ color: profit.netProfit >= 0 ? '#059669' : '#dc2626' }}>{fmt$(profit.netProfit)}</strong>
              </div>
            </Section>

            <Section title="Projections (based on last 30 days)">
              <div className={styles.cardGrid}>
                <Card label="Daily run rate" value={fmt$(projections.dailyRevenueRunRate)} />
                <Card label="Monthly revenue" value={fmt$(projections.monthlyRevenueRunRate)} />
                <Card label="Annual revenue" value={fmt$(projections.annualRevenueRunRate)} />
                <Card label="Monthly profit" value={fmt$(projections.monthlyProfitProjection)} accent />
              </div>
            </Section>

          </Department>

          {/* ── MARKETING ───────────────────────────────────────────────── */}
          <Department label="Marketing" icon="~">

            <Section title="Conversion performance">
              <div className={styles.cardGrid}>
                <Card label="Overall conversion" value={fmtPct(funnel.rates.overallConversion)} sub="upload → purchase" accent />
                <Card label="Upload to preview" value={fmtPct(funnel.rates.uploadToPreview)} sub="file processed" />
                <Card label="Preview to checkout" value={fmtPct(funnel.rates.previewToCheckout)} sub="saw paywall" />
                <Card label="Checkout to paid" value={fmtPct(funnel.rates.checkoutToPurchase)} sub="completed purchase" />
              </div>
            </Section>

            <Section title="Conversion funnel">
              <div className={styles.funnel}>
                <FunnelStep label="Uploads" count={funnel.uploads} rate={funnel.rates.uploadToPreview} />
                <FunnelStep label="Preview ready" count={funnel.previewReady} rate={funnel.rates.previewToCheckout} />
                <FunnelStep label="Checkout started" count={funnel.checkoutStarted} rate={funnel.rates.checkoutToPurchase} />
                <FunnelStep label="Purchased" count={funnel.purchases} last />
              </div>
              <div className={styles.statusGrid}>
                {Object.entries(funnel.statusBreakdown).map(([s, n]) => (
                  <div key={s} className={styles.statusChip}>
                    <span className={styles.statusDot} style={{ background: STATUS_COLOR[s] || '#6b7280' }} />
                    <span className={styles.statusName}>{s.replace(/_/g, ' ')}</span>
                    <span className={styles.statusCount}>{fmtN(n)}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Customer satisfaction">
              <div className={styles.cardGrid}>
                <Card label="Satisfied (yes)" value={fmtN(feedback.yes)} sub={`${fmtPct(feedback.satisfactionRate)} satisfaction rate`} accent />
                <Card label="Unsatisfied (no)" value={fmtN(feedback.no)} />
                <Card label="No response" value={fmtN(feedback.noResponse)} sub={`${fmtPct(feedback.responseRate)} response rate`} />
              </div>
            </Section>

            {attrData && attrData.attribution.length > 0 && (
              <Section title="Channel attribution">
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr><th>Channel</th><th>Conversions</th><th>Revenue</th><th>Avg/conversion</th></tr>
                    </thead>
                    <tbody>
                      {attrData.attribution.map(row => (
                        <tr key={row.channel}>
                          <td>{row.channel || 'direct'}</td>
                          <td className={styles.mono}>{fmtN(row.count)}</td>
                          <td className={styles.mono}>{fmt$(row.revenue)}</td>
                          <td className={styles.mono}>{fmt$(row.avgRevenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

          </Department>

          {/* ── TECH SYSTEMS ────────────────────────────────────────────── */}
          <Department label="Tech Systems" icon="#">

            {healthData && (
              <Section title="System status">
                <div className={styles.cardGrid}>
                  <Card
                    label="System"
                    value={healthData.claudeRetryRate.rate < 10 && healthData.pdfRejectionRate.rate < 20 ? 'Operational' : 'Degraded'}
                    sub="Claude + PDF pipeline"
                    accent={healthData.claudeRetryRate.rate >= 10 || healthData.pdfRejectionRate.rate >= 20}
                  />
                  <Card
                    label="Claude retry rate"
                    value={`${healthData.claudeRetryRate.rate}%`}
                    sub={`${fmtN(healthData.claudeRetryRate.retries)} retries / ${fmtN(healthData.claudeRetryRate.totalJobs)} jobs`}
                    accent={healthData.claudeRetryRate.rate > 5}
                  />
                  <Card
                    label="PDF rejection rate"
                    value={`${healthData.pdfRejectionRate.rate}%`}
                    sub={`${fmtN(healthData.pdfRejectionRate.rejected)} rejected / ${fmtN(healthData.pdfRejectionRate.totalUploads)} uploads`}
                    accent={healthData.pdfRejectionRate.rate > 10}
                  />
                </div>
              </Section>
            )}

            {healthData && (
              <Section title="Processing time (p50 / p95)">
                <div className={styles.cardGrid}>
                  <Card
                    label="Teaser analysis"
                    value={healthData.teaserAnalysis.p50 ? `${(healthData.teaserAnalysis.p50 / 1000).toFixed(1)}s` : '-'}
                    sub={`p95: ${healthData.teaserAnalysis.p95 ? `${(healthData.teaserAnalysis.p95 / 1000).toFixed(1)}s` : '-'} · ${fmtN(healthData.teaserAnalysis.count)} samples`}
                  />
                  <Card
                    label="Full report"
                    value={healthData.fullReport.p50 ? `${(healthData.fullReport.p50 / 1000).toFixed(1)}s` : '-'}
                    sub={`p95: ${healthData.fullReport.p95 ? `${(healthData.fullReport.p95 / 1000).toFixed(1)}s` : '-'} · ${fmtN(healthData.fullReport.count)} samples`}
                  />
                </div>
              </Section>
            )}

            <Section title="Recent jobs">
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th><th>Email</th><th>Tier</th><th>Status</th><th>Date</th>
                      <th>Tokens in</th><th>Tokens out</th><th>Claude cost</th><th>Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentJobs.map(j => (
                      <tr key={j.id}>
                        <td className={styles.mono} title={j.id}>{j.id.slice(0, 8)}</td>
                        <td className={styles.emailCell}>{j.email || '-'}</td>
                        <td>{j.tier}</td>
                        <td>
                          <span className={styles.statusTag} style={{ color: STATUS_COLOR[j.status] || '#6b7280' }}>
                            {j.status}
                          </span>
                        </td>
                        <td className={styles.mono}>{new Date(j.createdAt).toLocaleDateString()}</td>
                        <td className={styles.mono}>{fmtN(j.tokensIn)}</td>
                        <td className={styles.mono}>{fmtN(j.tokensOut)}</td>
                        <td className={styles.mono}>{fmt$4(j.claudeCost)}</td>
                        <td>{j.feedbackResult || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

          </Department>

        </div>
      )}

      {activeTab === 'funnel' && (
        <div className={styles.body}>
          <Section title="Leakage Funnel">
            {!funnelData ? <p>Loading...</p> : (
              <div className={styles.funnelTable}>
                {funnelData.funnel.map((step, i) => (
                  <div key={step.step} className={styles.funnelRow}>
                    <div className={styles.funnelStep2}>
                      <span className={styles.funnelStepNum}>{i + 1}</span>
                      <span className={styles.funnelStepName}>{step.step}</span>
                      <span className={styles.funnelSource}>{step.source}</span>
                    </div>
                    <div className={styles.funnelBar2Wrap}>
                      <div
                        className={styles.funnelBar2}
                        style={{ width: `${funnelData.funnel[0].count > 0 ? Math.round(step.count / funnelData.funnel[0].count * 100) : 0}%` }}
                      />
                    </div>
                    <span className={styles.funnelCount2}>{fmtN(step.count)}</span>
                    {step.dropRate !== null && (
                      <span
                        className={styles.funnelDrop}
                        style={{ color: step.dropRate > 50 ? '#dc2626' : step.dropRate > 25 ? '#d97706' : '#059669' }}
                      >
                        -{step.dropRate}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>
          <Section title="Devices and Browsers">
            {funnelData && (
              <div className={styles.cardGrid}>
                {funnelData.devices.map(d => <Card key={d.device} label={d.device || 'unknown'} value={fmtN(d.count)} />)}
                {funnelData.browsers.map(b => <Card key={b.browser} label={b.browser || 'unknown'} value={fmtN(b.count)} />)}
              </div>
            )}
          </Section>
        </div>
      )}

      {activeTab === 'niche' && (
        <div className={styles.body}>
          <Section title={`Top 50 Keyword Gaps (${nicheData ? fmtN(nicheData.jobsAnalyzed) : '...'} jobs analyzed)`}>
            {!nicheData ? <p>Loading...</p> : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>#</th><th>Keyword</th><th>Times missing</th><th>Frequency</th></tr></thead>
                  <tbody>
                    {nicheData.topGaps.map((g, i) => (
                      <tr key={g.keyword}>
                        <td className={styles.mono}>{i + 1}</td>
                        <td>{g.keyword}</td>
                        <td className={styles.mono}>{fmtN(g.count)}</td>
                        <td className={styles.mono}>{nicheData.jobsAnalyzed > 0 ? Math.round(g.count / nicheData.jobsAnalyzed * 100) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
          <Section title="ATS Score Distribution">
            {nicheData && (
              <div className={styles.cardGrid}>
                {Object.entries(nicheData.scoreBuckets).map(([range, count]) => (
                  <Card
                    key={range}
                    label={`Score ${range}`}
                    value={fmtN(count)}
                    sub={nicheData.jobsAnalyzed > 0 ? `${Math.round(count / nicheData.jobsAnalyzed * 100)}%` : '0%'}
                  />
                ))}
              </div>
            )}
          </Section>
        </div>
      )}

      {activeTab === 'simulator' && (
        <div className={styles.body}>

          {/* Inputs */}
          <Section title="P&L Simulator — try any combination">
            <div className={styles.simInputRow}>
              <div className={styles.simInputCard}>
                <div className={styles.simInputLabel}>The Audit <span className={styles.simPrice}>$12 each</span></div>
                <div className={styles.simInputControls}>
                  <button className={styles.simBtn} onClick={() => setSimBasic(Math.max(0, simBasic - 1))}>-</button>
                  <input
                    type="number"
                    className={styles.simInput}
                    value={simBasic}
                    min={0}
                    onChange={e => setSimBasic(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <button className={styles.simBtn} onClick={() => setSimBasic(simBasic + 1)}>+</button>
                </div>
                <div className={styles.simSubtotal}>{fmt$(simBasic * 12)} gross</div>
              </div>
              <div className={styles.simInputCard}>
                <div className={styles.simInputLabel}>The Glow-Up <span className={styles.simPrice}>$29 each</span></div>
                <div className={styles.simInputControls}>
                  <button className={styles.simBtn} onClick={() => setSimFull(Math.max(0, simFull - 1))}>-</button>
                  <input
                    type="number"
                    className={styles.simInput}
                    value={simFull}
                    min={0}
                    onChange={e => setSimFull(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <button className={styles.simBtn} onClick={() => setSimFull(simFull + 1)}>+</button>
                </div>
                <div className={styles.simSubtotal}>{fmt$(simFull * 29)} gross</div>
              </div>
              <div className={styles.simTotalCard}>
                <div className={styles.simTotalLabel}>Total gross</div>
                <div className={styles.simTotalAmount}>{fmt$(sim?.gross ?? 0)}</div>
                <div className={styles.simTotalJobs}>{sim?.totalJobs ?? 0} jobs</div>
              </div>
            </div>
          </Section>

          {/* Per-job breakdown */}
          {unitEconomics && (
            <Section title="Per-job cost breakdown (based on your real averages)">
              <div className={styles.simJobGrid}>
                {[
                  { tier: 'The Audit', price: 12, u: unitEconomics.BASIC },
                  { tier: 'The Glow-Up', price: 29, u: unitEconomics.FULL },
                ].map(({ tier, price, u }) => (
                  <div key={tier} className={styles.simJobCard}>
                    <div className={styles.simJobTitle}>{tier} <span className={styles.simPrice}>{fmt$(price)}</span></div>
                    <div className={styles.simJobRows}>
                      <div className={styles.simJobRow}>
                        <span className={styles.simJobLabel}>Gross revenue</span>
                        <span className={styles.simJobVal} style={{ color: 'var(--text)' }}>{fmt$(price)}</span>
                      </div>
                      <div className={styles.simJobRow}>
                        <span className={styles.simJobLabel}>Lemon Squeezy (5% + $0.50)</span>
                        <span className={styles.simJobVal} style={{ color: '#f59e0b' }}>-{fmt$(u.processorFee)}</span>
                      </div>
                      <div className={styles.simJobRow}>
                        <span className={styles.simJobLabel}>Claude API</span>
                        <span className={styles.simJobVal} style={{ color: '#8b5cf6' }}>-{fmt$4(u.avgClaudeCost)}</span>
                      </div>
                      <div className={styles.simJobRow}>
                        <span className={styles.simJobLabel}>Resend email</span>
                        <span className={styles.simJobVal} style={{ color: 'var(--text-subtle)' }}>$0.00</span>
                      </div>
                      <div className={`${styles.simJobRow} ${styles.simJobRowTotal}`}>
                        <span className={styles.simJobLabel}>You keep (before Railway)</span>
                        <span className={styles.simJobVal} style={{ color: '#059669' }}>{fmt$(u.netPerJob)}</span>
                      </div>
                      <div className={styles.simJobMargin}>{u.marginPct}% margin</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className={styles.simNote}>Railway is a fixed $10/month — it does not appear per-job above. It is included in the batch totals below.</p>
            </Section>
          )}

          {/* Where the money goes */}
          {sim && sim.gross > 0 && (
            <Section title={`Where your ${fmt$(sim.gross)} goes`}>
              <div className={styles.simDestStack}>
                {sim.destinations.map(d => (
                  <div key={d.label} className={styles.simDestRow}>
                    <div className={styles.simDestLabel}>
                      <span className={styles.simDestDot} style={{ background: d.color }} />
                      {d.label}
                    </div>
                    <div className={styles.simDestBarWrap}>
                      <div className={styles.simDestBar} style={{ width: `${Math.max(0.5, d.pct)}%`, background: d.color }} />
                    </div>
                    <div className={styles.simDestAmt}>
                      <span style={{ color: d.color }}>{fmt$(d.amount)}</span>
                      <span className={styles.simDestPct}>{d.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.simNetBanner} style={{ borderColor: sim.netProfit >= 0 ? '#059669' : '#dc2626' }}>
                <span className={styles.simNetLabel}>Net profit after all costs</span>
                <span className={styles.simNetAmt} style={{ color: sim.netProfit >= 0 ? '#059669' : '#dc2626' }}>
                  {fmt$(sim.netProfit)} <span className={styles.simNetPct}>({sim.netMarginPct}% margin)</span>
                </span>
              </div>
              <p className={styles.simNote}>Railway at {sim.totalJobs} jobs = {fmt$(sim.railwayPerJob)} per job amortized.</p>
            </Section>
          )}

          {/* Scale table */}
          {sim && sim.totalJobs > 0 && (
            <Section title="How profit scales at this Audit/Glow-Up mix">
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Jobs</th>
                      <th>Gross revenue</th>
                      <th>Variable costs</th>
                      <th>Railway (fixed)</th>
                      <th>Net profit</th>
                      <th>Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sim.scaleSteps.map(row => (
                      <tr key={row.jobs} style={row.jobs === sim.totalJobs ? { background: 'color-mix(in srgb, var(--accent) 8%, transparent)' } : {}}>
                        <td className={styles.mono}>{row.jobs}{row.jobs === sim.totalJobs ? ' ← you' : ''}</td>
                        <td className={styles.mono}>{fmt$(row.revenue)}</td>
                        <td className={styles.mono}>{fmt$(row.variableCosts)}</td>
                        <td className={styles.mono}>{fmt$(row.railway)}</td>
                        <td className={styles.mono} style={{ color: row.net >= 0 ? '#059669' : '#dc2626', fontWeight: 700 }}>{fmt$(row.net)}</td>
                        <td className={styles.mono}>{row.revenue > 0 ? `${Math.round(row.net / row.revenue * 100)}%` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

        </div>
      )}

      {activeTab === 'health' && (
        <div className={styles.body}>
          <Section title="Processing Time Percentiles">
            {!healthData ? <p>Loading...</p> : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>Pipeline</th><th>Count</th><th>Avg</th><th>p50</th><th>p75</th><th>p95</th><th>p99</th></tr>
                  </thead>
                  <tbody>
                    {[
                      ['Teaser analysis', healthData.teaserAnalysis],
                      ['Full report', healthData.fullReport],
                    ].map(([label, p]) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td className={styles.mono}>{fmtN(p.count)}</td>
                        <td className={styles.mono}>{p.avg ? `${(p.avg / 1000).toFixed(1)}s` : '-'}</td>
                        <td className={styles.mono}>{p.p50 ? `${(p.p50 / 1000).toFixed(1)}s` : '-'}</td>
                        <td className={styles.mono}>{p.p75 ? `${(p.p75 / 1000).toFixed(1)}s` : '-'}</td>
                        <td className={styles.mono}>{p.p95 ? `${(p.p95 / 1000).toFixed(1)}s` : '-'}</td>
                        <td className={styles.mono}>{p.p99 ? `${(p.p99 / 1000).toFixed(1)}s` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {healthData && (
            <Section title="Error Rates">
              <div className={styles.cardGrid}>
                <Card
                  label="Claude retry rate"
                  value={`${healthData.claudeRetryRate.rate}%`}
                  sub={`${fmtN(healthData.claudeRetryRate.retries)} retries / ${fmtN(healthData.claudeRetryRate.totalJobs)} jobs`}
                  accent={healthData.claudeRetryRate.rate > 5}
                />
                <Card
                  label="PDF rejection rate"
                  value={`${healthData.pdfRejectionRate.rate}%`}
                  sub={`${fmtN(healthData.pdfRejectionRate.rejected)} rejected / ${fmtN(healthData.pdfRejectionRate.totalUploads)} uploads`}
                  accent={healthData.pdfRejectionRate.rate > 10}
                />
              </div>
            </Section>
          )}

          <Section title="Channel Attribution (LTV)">
            {!attrData ? <p>Loading...</p> : attrData.attribution.length === 0 ? <p className={styles.empty}>No paid conversions yet.</p> : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>Channel</th><th>Conversions</th><th>Revenue</th><th>Avg/conversion</th></tr>
                  </thead>
                  <tbody>
                    {attrData.attribution.map(row => (
                      <tr key={row.channel}>
                        <td>{row.channel || 'direct'}</td>
                        <td className={styles.mono}>{fmtN(row.count)}</td>
                        <td className={styles.mono}>{fmt$(row.revenue)}</td>
                        <td className={styles.mono}>{fmt$(row.avgRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>
      )}

    </div>
  );
}
