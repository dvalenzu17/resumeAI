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

  useEffect(() => {
    if (secret) fetchDashboard(secret);
  }, [secret, fetchDashboard]);

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
          <span className={styles.genAt}>Updated {new Date(generatedAt).toLocaleTimeString()}</span>
          <button className={styles.refreshBtn} onClick={() => fetchDashboard(secret)}>Refresh</button>
        </div>
      </div>

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
    </div>
  );
}
