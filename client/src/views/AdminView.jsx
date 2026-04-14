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

  const { revenue, funnel, costs, profit, dailyRevenue, feedback, projections, recentJobs, generatedAt } = data;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.logo}>short<span className={styles.logoAccent}>listed</span></span>
          <span className={styles.adminBadge}>admin</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.tabs}>
            {['dashboard', 'funnel', 'niche', 'health'].map(tab => (
              <button
                key={tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'dashboard' ? 'Dashboard' : tab === 'funnel' ? 'Leakage Funnel' : tab === 'niche' ? 'Niche Finder' : 'Health'}
              </button>
            ))}
          </div>
          <span className={styles.genAt}>Updated {new Date(generatedAt).toLocaleTimeString()}</span>
          <button className={styles.refreshBtn} onClick={() => { fetchDashboard(secret); fetchFunnel(secret); fetchNiche(secret); fetchHealth(secret); }}>Refresh</button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className={styles.body}>

          {/* Top metric cards */}
          <div className={styles.cardGrid}>
            <Card label="All-time revenue" value={fmt$(revenue.allTime.revenue)} sub={`${fmtN(revenue.allTime.jobCount)} paid jobs`} accent />
            <Card label="Today" value={fmt$(revenue.today.revenue)} sub={`${fmtN(revenue.today.jobCount)} jobs`} />
            <Card label="Gross margin" value={fmtPct(profit.grossMarginPct)} sub="excl. Railway" />
            <Card label="Overall conversion" value={fmtPct(funnel.rates.overallConversion)} sub="upload → purchase" />
            <Card label="Net profit (all-time)" value={fmt$(profit.netProfit)} sub="incl. Railway" />
            <Card label="Avg profit / job" value={fmt$(profit.avgProfitPerJob)} sub={`avg cost ${fmt$4(profit.avgCostPerJob)}`} />
          </div>

          {/* Revenue by period */}
          <Section title="Revenue by period">
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Period</th><th>Revenue</th><th>Jobs</th><th>Basic</th><th>Full</th><th>Avg/job</th>
                  </tr>
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

          {/* Daily revenue chart */}
          <Section title="Daily revenue — last 30 days">
            <BarChart data={dailyRevenue} />
          </Section>

          {/* Funnel */}
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
                  <span className={styles.statusName}>{s.replace('_', ' ')}</span>
                  <span className={styles.statusCount}>{fmtN(n)}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Costs */}
          <Section title="Cost breakdown">
            <div className={styles.costGrid}>
              <div className={styles.costCard}>
                <div className={styles.costTitle}>Claude API</div>
                <div className={styles.costAmount}>{fmt$4(costs.claude.totalCost)}</div>
                <div className={styles.costMeta}>{fmtN(costs.claude.totalInputTokens)} in / {fmtN(costs.claude.totalOutputTokens)} out</div>
                <div className={styles.costMeta}>{fmt$4(costs.claude.avgCostPerJob)} per job</div>
              </div>
              <div className={styles.costCard}>
                <div className={styles.costTitle}>Resend email</div>
                <div className={styles.costAmount}>{fmt$4(costs.email.totalCost)}</div>
                <div className={styles.costMeta}>{fmtN(costs.email.estimatedEmailsSent)} emails sent</div>
                <div className={styles.costMeta}>{fmtN(costs.email.freeEmailsRemaining)} free remaining</div>
              </div>
              <div className={styles.costCard}>
                <div className={styles.costTitle}>Railway</div>
                <div className={styles.costAmount}>{fmt$(costs.railway.totalCost)}</div>
                <div className={styles.costMeta}>{fmtN(costs.railway.daysRunning)} days running</div>
                <div className={styles.costMeta}>${costs.railway.monthlyFixed}/mo fixed</div>
              </div>
            </div>
            <div className={styles.costSummary}>
              Total cost: <strong>{fmt$4(costs.total)}</strong>
              {' · '}
              Gross profit: <strong style={{ color: profit.grossProfit >= 0 ? '#059669' : '#dc2626' }}>{fmt$(profit.grossProfit)}</strong>
              {' · '}
              Net profit: <strong style={{ color: profit.netProfit >= 0 ? '#059669' : '#dc2626' }}>{fmt$(profit.netProfit)}</strong>
            </div>
          </Section>

          {/* Projections */}
          <Section title="Projections (based on last 30 days)">
            <div className={styles.cardGrid}>
              <Card label="Daily run rate" value={fmt$(projections.dailyRevenueRunRate)} />
              <Card label="Monthly projection" value={fmt$(projections.monthlyRevenueRunRate)} />
              <Card label="Annual projection" value={fmt$(projections.annualRevenueRunRate)} />
              <Card label="Projected monthly profit" value={fmt$(projections.monthlyProfitProjection)} accent />
            </div>
          </Section>

          {/* Feedback */}
          <Section title="User feedback">
            <div className={styles.cardGrid}>
              <Card label="Positive (yes)" value={fmtN(feedback.yes)} sub={`${fmtPct(feedback.satisfactionRate)} satisfaction`} />
              <Card label="Negative (no)" value={fmtN(feedback.no)} />
              <Card label="No response" value={fmtN(feedback.noResponse)} sub={`${fmtPct(feedback.responseRate)} responded`} />
            </div>
          </Section>

          {/* Recent jobs */}
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
