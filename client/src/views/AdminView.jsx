import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, TrendingDown, Search, Activity,
  Calculator, Globe, RefreshCw, Menu,
} from 'lucide-react';
import styles from './AdminView.module.css';

const SECRET_KEY = 'adminSecret';

// ── Formatters ────────────────────────────────────────────────────────────────
function fmt$(n)  { return n == null ? '$0' : `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmt$4(n) { return n == null ? '$0.0000' : `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`; }
function fmtN(n)  { return n == null ? '0' : Number(n).toLocaleString(); }
function fmtPct(n){ return n == null ? '0%' : `${n}%`; }

// ── Status pill styles ────────────────────────────────────────────────────────
const STATUS_PILL = {
  COMPLETE:        { bg: '#dcfce7', color: '#166534' },
  FAILED:          { bg: '#fee2e2', color: '#991b1b' },
  ANALYZING:       { bg: '#fef9c3', color: '#854d0e' },
  PROCESSING:      { bg: '#dbeafe', color: '#1e40af' },
  PREVIEW_READY:   { bg: '#dbeafe', color: '#1e40af' },
  PENDING_PAYMENT: { bg: '#f3f4f6', color: '#6b7280' },
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',      Icon: LayoutDashboard },
  { id: 'funnel',    label: 'Leakage Funnel', Icon: TrendingDown },
  { id: 'niche',     label: 'Niche Finder',   Icon: Search },
  { id: 'health',    label: 'Health',         Icon: Activity },
  { id: 'simulator', label: 'P&L Simulator',  Icon: Calculator },
  { id: 'geo',       label: 'Geography',      Icon: Globe },
];

const PAGE_TITLES = {
  dashboard: 'Dashboard', funnel: 'Leakage Funnel',
  niche: 'Niche Finder',  health: 'Health',
  simulator: 'P&L Simulator', geo: 'Geography',
};

function Sidebar({ activeTab, setActiveTab, generatedAt, onRefresh, open, onClose }) {
  return (
    <>
      {open && <div className={styles.sidebarOverlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.sidebarLogo}>
            <span className={styles.sidebarBrand}>
              short<span className={styles.logoAccent}>listed</span>
            </span>
            <span className={styles.sidebarAdminBadge}>ADMIN</span>
          </div>
          <nav className={styles.sidebarNav}>
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`${styles.navItem} ${activeTab === id ? styles.navItemActive : ''}`}
                onClick={() => { setActiveTab(id); onClose(); }}
              >
                <Icon size={15} className={styles.navIcon} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className={styles.sidebarBottom}>
          {generatedAt && (
            <div className={styles.updatedAt}>
              Updated {new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          <button className={styles.sidebarRefreshBtn} onClick={onRefresh}>
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Page header ───────────────────────────────────────────────────────────────
function PageHeader({ activeTab, onMenuClick }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return (
    <div className={styles.pageHeader}>
      <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open menu">
        <Menu size={18} />
      </button>
      <h1 className={styles.pageTitle}>{PAGE_TITLES[activeTab] || activeTab}</h1>
      <span className={styles.pageDate}>{today}</span>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ label, value, sub, accent }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardLabel}>{label}</div>
      <div className={styles.cardValue} style={accent ? { color: '#E8571A' } : {}}>{value}</div>
      {sub && <div className={styles.cardSub}>{sub}</div>}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

// ── Section group (Finance / Marketing / Tech) ────────────────────────────────
function SectionGroup({ label, children }) {
  return (
    <div className={styles.sectionGroup}>
      <div className={styles.sectionGroupLabel}>{label}</div>
      <div className={styles.sectionGroupBody}>{children}</div>
    </div>
  );
}

// ── Area chart ────────────────────────────────────────────────────────────────
function AreaChart({ data }) {
  if (!data || data.length === 0) return null;
  const W = 600, H = 240;
  const PAD = { t: 16, r: 8, b: 28, l: 8 };
  const max = Math.max(...data.map(d => d.revenue), 1);
  const n = data.length;
  const px = i => PAD.l + (n <= 1 ? (W - PAD.l - PAD.r) / 2 : (i / (n - 1)) * (W - PAD.l - PAD.r));
  const py = v => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);
  const pts = data.map((d, i) => [px(i), py(d.revenue)]);
  const lineStr = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const areaStr = [`${px(0)},${py(0)}`, ...pts.map(([x, y]) => `${x},${y}`), `${px(n - 1)},${py(0)}`].join(' ');
  const labelIs = n > 2 ? [0, Math.floor(n / 2), n - 1] : [...Array(n).keys()];
  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartAxisMax}>{fmt$(max)}</div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={styles.areaSvg}>
        <defs>
          <linearGradient id="adminAreaGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#E8571A" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#E8571A" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(p => (
          <line key={p} x1={PAD.l} y1={py(max * p)} x2={W - PAD.r} y2={py(max * p)}
            stroke="#eeede9" strokeWidth="1" strokeDasharray="4 4" />
        ))}
        <polygon points={areaStr} fill="url(#adminAreaGrad)" />
        <polyline points={lineStr} fill="none" stroke="#E8571A" strokeWidth="1.8"
          strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className={styles.chartXAxis}>
        {data.map((d, i) => labelIs.includes(i) ? (
          <span key={i} className={styles.chartXLabel}
            style={{ left: `${n <= 1 ? 50 : (i / (n - 1)) * 100}%` }}>
            {d.date.slice(5)}
          </span>
        ) : null)}
      </div>
    </div>
  );
}

// ── Cost breakdown (horizontal bars) ─────────────────────────────────────────
function CostBreakdown({ costs, profit }) {
  const items = [
    { label: 'Lemon Squeezy', color: '#f59e0b', amount: Number(costs.processor.totalCost), meta: costs.processor.feeStructure },
    { label: 'Claude API',    color: '#8b5cf6', amount: Number(costs.claude.totalCost),    meta: `${fmtN(costs.claude.totalInputTokens + costs.claude.totalOutputTokens)} tokens` },
    { label: 'Resend email',  color: '#6b7280', amount: Number(costs.email.totalCost),     meta: `${fmtN(costs.email.estimatedEmailsSent)} sent` },
    { label: 'Railway',       color: '#64748b', amount: Number(costs.railway.totalCost),   meta: `${costs.railway.daysRunning}d · $${costs.railway.monthlyFixed}/mo` },
  ];
  const total = items.reduce((s, i) => s + i.amount, 0) || 1;
  return (
    <div className={styles.costBreakdown}>
      {items.map(item => (
        <div key={item.label} className={styles.costRow}>
          <div className={styles.costRowLeft}>
            <span className={styles.costDot} style={{ background: item.color }} />
            <div>
              <div className={styles.costRowLabel}>{item.label}</div>
              <div className={styles.costRowMeta}>{item.meta}</div>
            </div>
          </div>
          <div className={styles.costRowBarWrap}>
            <div className={styles.costRowBarFill}
              style={{ width: `${Math.max(0.5, item.amount / total * 100)}%`, background: item.color }} />
          </div>
          <div className={styles.costRowAmt}>{fmt$(item.amount)}</div>
          <div className={styles.costRowPct}>{Math.round(item.amount / total * 100)}%</div>
        </div>
      ))}
      <div className={styles.costSummaryRow}>
        <span>Total cost: <strong>{fmt$(costs.total)}</strong></span>
        <span>Gross profit: <strong style={{ color: profit.grossProfit >= 0 ? '#059669' : '#dc2626' }}>{fmt$(profit.grossProfit)}</strong></span>
        <span>Net profit: <strong style={{ color: profit.netProfit >= 0 ? '#059669' : '#dc2626' }}>{fmt$(profit.netProfit)}</strong></span>
      </div>
    </div>
  );
}

// ── Funnel step row ───────────────────────────────────────────────────────────
function FunnelStepRow({ num, label, source, count, maxCount, dropRate }) {
  const pct = maxCount > 0 ? Math.round(count / maxCount * 100) : 0;
  return (
    <div className={styles.funnelStepRow}>
      <div className={styles.funnelStepLeft}>
        <span className={styles.funnelStepNum}>{num}</span>
        <span className={styles.funnelStepName}>{label}</span>
        {source && <span className={styles.funnelStepSource}>{source}</span>}
      </div>
      <div className={styles.funnelStepBarWrap}>
        <div className={styles.funnelStepBar} style={{ width: `${pct}%` }} />
      </div>
      <div className={styles.funnelStepRight}>
        <span className={styles.funnelStepCount}>{fmtN(count)}</span>
        {dropRate != null && (
          <span className={styles.funnelStepDrop}
            style={{ color: dropRate > 50 ? '#dc2626' : dropRate > 25 ? '#d97706' : '#059669' }}>
            -{dropRate}%
          </span>
        )}
      </div>
    </div>
  );
}

// ── World tile heatmap (light theme) ──────────────────────────────────────────
const WORLD_TILES = [
  ['CA','Canada',2,2],['US','United States',2,3],['MX','Mexico',2,5],
  ['CU','Cuba',3,5],['PA','Panama',2,6],['CO','Colombia',2,7],
  ['VE','Venezuela',3,7],['EC','Ecuador',2,8],['PE','Peru',2,9],
  ['BR','Brazil',4,8],['BO','Bolivia',3,9],['PY','Paraguay',4,10],
  ['CL','Chile',2,11],['AR','Argentina',3,11],['UY','Uruguay',4,11],
  ['IS','Iceland',7,1],['NO','Norway',8,1],['SE','Sweden',9,1],
  ['FI','Finland',10,1],['EE','Estonia',11,1],
  ['IE','Ireland',7,2],['GB','United Kingdom',8,2],['NL','Netherlands',9,2],
  ['DK','Denmark',10,2],['LV','Latvia',11,2],['LT','Lithuania',12,2],
  ['RU','Russia',14,2],
  ['FR','France',8,3],['BE','Belgium',9,3],['PL','Poland',10,3],
  ['BY','Belarus',11,3],['UA','Ukraine',12,3],
  ['PT','Portugal',7,4],['ES','Spain',8,4],['DE','Germany',9,4],
  ['CZ','Czechia',10,4],['SK','Slovakia',11,4],['RO','Romania',12,4],
  ['MD','Moldova',13,4],['GE','Georgia',14,4],['AZ','Azerbaijan',15,4],['KZ','Kazakhstan',16,4],
  ['CH','Switzerland',8,5],['AT','Austria',9,5],['SI','Slovenia',10,5],
  ['HU','Hungary',11,5],['RS','Serbia',12,5],['BG','Bulgaria',13,5],['TR','Turkey',14,5],
  ['IT','Italy',9,6],['HR','Croatia',10,6],['GR','Greece',11,6],
  ['CY','Cyprus',12,6],['IQ','Iraq',14,6],['IR','Iran',15,5],['AF','Afghanistan',16,5],
  ['MA','Morocco',8,6],['DZ','Algeria',9,7],['TN','Tunisia',10,7],
  ['LY','Libya',11,7],['EG','Egypt',12,7],['IL','Israel',13,7],['JO','Jordan',14,7],
  ['SA','Saudi Arabia',14,8],['AE','UAE',15,8],['YE','Yemen',15,9],
  ['PK','Pakistan',16,7],
  ['NG','Nigeria',10,9],['ET','Ethiopia',13,9],['KE','Kenya',14,10],
  ['TZ','Tanzania',13,11],['ZM','Zambia',12,12],['MZ','Mozambique',13,12],
  ['ZA','South Africa',12,13],
  ['NP','Nepal',17,6],['IN','India',17,7],['BD','Bangladesh',18,7],
  ['CN','China',18,5],['JP','Japan',21,5],['KR','South Korea',20,5],
  ['TH','Thailand',18,8],['VN','Vietnam',19,8],['MY','Malaysia',19,9],
  ['SG','Singapore',19,10],['ID','Indonesia',20,10],['PH','Philippines',20,8],
  ['LK','Sri Lanka',17,9],
  ['AU','Australia',20,12],['NZ','New Zealand',21,13],
];

const HEAT_COLORS = ['#1e3a5f','#1d4ed8','#2563eb','#3b82f6','#60a5fa','#93c5fd','#bfdbfe'];

function getHeatColor(count, max) {
  if (!count || !max) return null;
  const ratio = count / max;
  const idx = Math.min(HEAT_COLORS.length - 1, Math.floor(ratio * HEAT_COLORS.length));
  return HEAT_COLORS[HEAT_COLORS.length - 1 - idx];
}

function WorldHeatmap({ countries }) {
  const countMap = {};
  let maxCount = 0;
  for (const { country, count } of countries) {
    countMap[country] = count;
    if (count > maxCount) maxCount = count;
  }
  return (
    <div>
      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(22, 26px)',
          gridTemplateRows: 'repeat(13, 26px)',
          gap: 3, width: 'fit-content', margin: '0 auto',
        }}>
          {WORLD_TILES.map(([code, name, col, row]) => {
            const count = countMap[code] || 0;
            const bg = count > 0 ? getHeatColor(count, maxCount) : '#e5e7eb';
            const isActive = count > 0;
            return (
              <div key={code} title={`${name}: ${count} event${count !== 1 ? 's' : ''}`}
                style={{
                  gridColumn: col, gridRow: row, background: bg, borderRadius: 3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 7, fontWeight: 700,
                  color: isActive ? '#fff' : '#9ca3af',
                  border: isActive ? `1px solid ${bg}` : '1px solid #d1d5db',
                  letterSpacing: 0, lineHeight: 1, userSelect: 'none',
                }}>
                {code}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>Less</span>
        {[...HEAT_COLORS].reverse().map(c => (
          <div key={c} style={{ width: 14, height: 14, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontSize: 11, color: '#9ca3af' }}>More</span>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function AdminView() {
  const [secret, setSecret]         = useState(() => sessionStorage.getItem(SECRET_KEY) || '');
  const [input, setInput]           = useState('');
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [activeTab, setActiveTab]   = useState('dashboard');
  const [funnelData, setFunnelData] = useState(null);
  const [nicheData, setNicheData]   = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [attrData, setAttrData]     = useState(null);
  const [geoData, setGeoData]       = useState(null);
  const [simBasic, setSimBasic]     = useState(10);
  const [simFull, setSimFull]       = useState(5);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchDashboard = useCallback(async (s) => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/dashboard', { headers: { 'X-Admin-Secret': s } });
      if (res.status === 401) { sessionStorage.removeItem(SECRET_KEY); setSecret(''); setError('Incorrect password.'); return; }
      if (res.status === 503) { setError('Admin not configured. Set ADMIN_SECRET env var.'); return; }
      if (!res.ok) { setError('Dashboard failed to load.'); return; }
      setData(await res.json());
    } catch { setError('Network error. Is the server running?'); }
    finally { setLoading(false); }
  }, []);

  const fetchFunnel = useCallback(async (s) => {
    try { const res = await fetch('/api/admin/funnel', { headers: { 'X-Admin-Secret': s } }); if (res.ok) setFunnelData(await res.json()); } catch {}
  }, []);

  const fetchNiche = useCallback(async (s) => {
    try { const res = await fetch('/api/admin/niche', { headers: { 'X-Admin-Secret': s } }); if (res.ok) setNicheData(await res.json()); } catch {}
  }, []);

  const fetchHealth = useCallback(async (s) => {
    try {
      const [perfRes, attrRes] = await Promise.all([
        fetch('/api/admin/performance', { headers: { 'X-Admin-Secret': s } }),
        fetch('/api/admin/attribution',  { headers: { 'X-Admin-Secret': s } }),
      ]);
      if (perfRes.ok) setHealthData(await perfRes.json());
      if (attrRes.ok) setAttrData(await attrRes.json());
    } catch {}
  }, []);

  const fetchGeo = useCallback(async (s) => {
    try { const res = await fetch('/api/admin/geo', { headers: { 'X-Admin-Secret': s } }); if (res.ok) setGeoData(await res.json()); } catch {}
  }, []);

  const handleRefresh = useCallback(() => {
    fetchDashboard(secret); fetchFunnel(secret); fetchNiche(secret); fetchHealth(secret); fetchGeo(secret);
  }, [secret, fetchDashboard, fetchFunnel, fetchNiche, fetchHealth, fetchGeo]);

  useEffect(() => {
    if (secret) { fetchDashboard(secret); fetchFunnel(secret); fetchNiche(secret); fetchHealth(secret); fetchGeo(secret); }
  }, [secret, fetchDashboard, fetchFunnel, fetchNiche, fetchHealth, fetchGeo]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sessionStorage.setItem(SECRET_KEY, input.trim());
    setSecret(input.trim());
  };

  // ── Gate ───────────────────────────────────────────────────────────────────
  if (!secret || (!data && !loading)) {
    return (
      <div className={styles.gate}>
        <div className={styles.gateCard}>
          <p className={styles.gateLogo}>short<span className={styles.logoAccent}>listed</span> <span className={styles.gateAdmin}>admin</span></p>
          <form onSubmit={handleLogin} className={styles.gateForm}>
            <input type="password" className={styles.gateInput} placeholder="Admin password"
              value={input} onChange={e => setInput(e.target.value)} autoFocus />
            <button className={styles.gateBtn} type="submit">Enter</button>
          </form>
          {error && <p className={styles.gateError}>{error}</p>}
        </div>
      </div>
    );
  }

  if (loading) return <div className={styles.loading}>Loading dashboard...</div>;
  if (!data) return null;

  const { revenue, funnel, costs, profit, unitEconomics, dailyRevenue, feedback, projections, recentJobs, generatedAt } = data;

  // ── P&L simulator ──────────────────────────────────────────────────────────
  const RAILWAY_MONTHLY = 10;
  function r2(n) { return Math.round(n * 100) / 100; }
  function r4(n) { return Math.round(n * 10000) / 10000; }
  function simCalc(basic, full) {
    if (!unitEconomics) return null;
    const b = unitEconomics.BASIC, f = unitEconomics.FULL;
    const totalJobs   = basic + full;
    const gross       = basic * 12 + full * 29;
    const toProcessor = r4(basic * b.processorFee + full * f.processorFee);
    const toClaude    = r4(basic * b.avgClaudeCost + full * f.avgClaudeCost);
    const toRailway   = RAILWAY_MONTHLY;
    const toResend    = 0;
    const totalCosts  = r4(toProcessor + toClaude + toRailway + toResend);
    const netProfit   = r4(gross - totalCosts);
    const pct = (n) => gross > 0 ? r2(n / gross * 100) : 0;
    const scaleSteps = [1, 5, 10, 25, 50, 100].map(n => {
      const ratio = totalJobs > 0 ? n / totalJobs : n / 15;
      const rev   = r2(gross * ratio);
      const vc    = r4((toProcessor + toClaude) * ratio);
      return { jobs: n, revenue: rev, variableCosts: vc, railway: RAILWAY_MONTHLY, net: r4(rev - vc - RAILWAY_MONTHLY) };
    });
    return {
      totalJobs, gross, toProcessor, toClaude, toRailway, toResend, totalCosts, netProfit,
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

  // ── Shell ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.shell}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        generatedAt={generatedAt}
        onRefresh={handleRefresh}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={styles.content}>
        <PageHeader activeTab={activeTab} onMenuClick={() => setSidebarOpen(true)} />

        <div className={styles.pageBody}>

          {/* ── DASHBOARD ─────────────────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <>
              {/* Finance */}
              <SectionGroup label="Finance">
                <Section title="Revenue">
                  <div className={styles.cardGrid5}>
                    <Card label="All-time revenue"   value={fmt$(revenue.allTime.revenue)}   sub={`${fmtN(revenue.allTime.jobCount)} paid jobs`} accent />
                    <Card label="Net profit"         value={fmt$(profit.netProfit)}           sub="after all costs" />
                    <Card label="Gross margin"       value={fmtPct(profit.grossMarginPct)}    sub="excl. Railway" />
                    <Card label="Avg profit / job"   value={fmt$(profit.avgProfitPerJob)}     sub={`avg cost ${fmt$4(profit.avgCostPerJob)}`} />
                    <Card label="Today"              value={fmt$(revenue.today.revenue)}      sub={`${fmtN(revenue.today.jobCount)} jobs`} />
                  </div>
                  <div className={styles.cardGrid3}>
                    <Card label="Last 7 days"        value={fmt$(revenue.last7days.revenue)}  sub={`${fmtN(revenue.last7days.jobCount)} jobs`} />
                    <Card label="Claude spend"       value={fmt$4(costs.claude.totalCost)}    sub={`${fmtN(costs.claude.totalInputTokens + costs.claude.totalOutputTokens)} total tokens`} />
                    <Card label="Claude tokens in"   value={fmtN(costs.claude.totalInputTokens)} sub={`${fmtN(costs.claude.totalOutputTokens)} out`} />
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
                  <AreaChart data={dailyRevenue} />
                </Section>

                <Section title="Cost breakdown">
                  <CostBreakdown costs={costs} profit={profit} />
                </Section>

                <Section title="Projections (based on last 30 days)">
                  <div className={styles.cardGrid4}>
                    <Card label="Daily run rate"   value={fmt$(projections.dailyRevenueRunRate)} />
                    <Card label="Monthly revenue"  value={fmt$(projections.monthlyRevenueRunRate)} />
                    <Card label="Annual revenue"   value={fmt$(projections.annualRevenueRunRate)} />
                    <Card label="Monthly profit"   value={fmt$(projections.monthlyProfitProjection)} accent />
                  </div>
                </Section>
              </SectionGroup>

              {/* Marketing */}
              <SectionGroup label="Marketing">
                <Section title="Conversion performance">
                  <div className={styles.cardGrid4}>
                    <Card label="Overall conversion"    value={fmtPct(funnel.rates.overallConversion)}    sub="upload to purchase" accent />
                    <Card label="Upload to preview"     value={fmtPct(funnel.rates.uploadToPreview)}      sub="file processed" />
                    <Card label="Preview to checkout"   value={fmtPct(funnel.rates.previewToCheckout)}    sub="saw paywall" />
                    <Card label="Checkout to paid"      value={fmtPct(funnel.rates.checkoutToPurchase)}   sub="completed purchase" />
                  </div>
                </Section>

                <Section title="Conversion funnel">
                  <div className={styles.funnelList}>
                    {[
                      { label: 'Uploads',          count: funnel.uploads,         source: 'JOBS',      dropRate: null },
                      { label: 'Preview ready',    count: funnel.previewReady,    source: 'JOBS',      dropRate: funnel.rates.uploadToPreview      != null ? 100 - funnel.rates.uploadToPreview      : null },
                      { label: 'Checkout started', count: funnel.checkoutStarted, source: 'ANALYTICS', dropRate: funnel.rates.previewToCheckout    != null ? 100 - funnel.rates.previewToCheckout    : null },
                      { label: 'Purchased',        count: funnel.purchases,       source: 'JOBS',      dropRate: funnel.rates.checkoutToPurchase   != null ? 100 - funnel.rates.checkoutToPurchase   : null },
                    ].map((s, i) => (
                      <FunnelStepRow key={s.label} num={i + 1} label={s.label} source={s.source}
                        count={s.count} maxCount={funnel.uploads || 1} dropRate={s.dropRate} />
                    ))}
                  </div>
                  <div className={styles.statusGrid}>
                    {Object.entries(funnel.statusBreakdown).map(([s, n]) => {
                      const p = STATUS_PILL[s] || { bg: '#f3f4f6', color: '#6b7280' };
                      return (
                        <div key={s} className={styles.statusChip}>
                          <span className={styles.statusDot} style={{ background: p.color }} />
                          <span className={styles.statusName}>{s.replace(/_/g, ' ')}</span>
                          <span className={styles.statusCount}>{fmtN(n)}</span>
                        </div>
                      );
                    })}
                  </div>
                </Section>

                <Section title="Customer satisfaction">
                  <div className={styles.cardGrid3}>
                    <Card label="Satisfied (yes)"   value={fmtN(feedback.yes)}        sub={`${fmtPct(feedback.satisfactionRate)} satisfaction rate`} accent />
                    <Card label="Unsatisfied (no)"  value={fmtN(feedback.no)} />
                    <Card label="No response"       value={fmtN(feedback.noResponse)}  sub={`${fmtPct(feedback.responseRate)} response rate`} />
                  </div>
                </Section>

                {attrData && attrData.attribution.length > 0 && (
                  <Section title="Channel attribution">
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead><tr><th>Channel</th><th>Conversions</th><th>Revenue</th><th>Avg/conversion</th></tr></thead>
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
              </SectionGroup>

              {/* Tech Systems */}
              <SectionGroup label="Tech Systems">
                {healthData && (
                  <Section title="System status">
                    <div className={styles.cardGrid3}>
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
                    <div className={styles.cardGrid3}>
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
                        {recentJobs.map((j, idx) => {
                          const p = STATUS_PILL[j.status] || { bg: '#f3f4f6', color: '#6b7280' };
                          return (
                            <tr key={j.id} className={idx % 2 === 1 ? styles.rowAlt : ''}>
                              <td className={styles.mono} title={j.id}>{j.id.slice(0, 8)}</td>
                              <td className={styles.emailCell}>{j.email || '-'}</td>
                              <td>{j.tier}</td>
                              <td>
                                <span className={styles.statusPill} style={{ background: p.bg, color: p.color }}>
                                  {j.status.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className={styles.mono}>{new Date(j.createdAt).toLocaleDateString()}</td>
                              <td className={styles.mono}>{fmtN(j.tokensIn)}</td>
                              <td className={styles.mono}>{fmtN(j.tokensOut)}</td>
                              <td className={styles.mono}>{fmt$4(j.claudeCost)}</td>
                              <td>{j.feedbackResult || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Section>
              </SectionGroup>
            </>
          )}

          {/* ── LEAKAGE FUNNEL ────────────────────────────────────────────── */}
          {activeTab === 'funnel' && (
            <>
              <Section title={`Leakage funnel${funnelData ? ` — ${fmtN(funnelData.funnel[0]?.count ?? 0)} sessions` : ''}`}>
                {!funnelData ? <p className={styles.empty}>Loading...</p> : (
                  <div className={styles.funnelList}>
                    {funnelData.funnel.map((step, i) => (
                      <FunnelStepRow
                        key={step.step}
                        num={i + 1}
                        label={step.step}
                        source={step.source}
                        count={step.count}
                        maxCount={funnelData.funnel[0]?.count || 1}
                        dropRate={step.dropRate}
                      />
                    ))}
                  </div>
                )}
              </Section>
              <Section title="Devices and browsers">
                {funnelData && (
                  <div className={styles.cardGrid4}>
                    {funnelData.devices.map(d => <Card key={d.device} label={d.device || 'unknown'} value={fmtN(d.count)} />)}
                    {funnelData.browsers.map(b => <Card key={b.browser} label={b.browser || 'unknown'} value={fmtN(b.count)} />)}
                  </div>
                )}
              </Section>
            </>
          )}

          {/* ── NICHE FINDER ──────────────────────────────────────────────── */}
          {activeTab === 'niche' && (
            <>
              <Section title={`Top 50 keyword gaps — ${nicheData ? fmtN(nicheData.jobsAnalyzed) : '...'} jobs analyzed`}>
                {!nicheData ? <p className={styles.empty}>Loading...</p> : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead><tr><th>#</th><th>Keyword</th><th>Times missing</th><th>Frequency</th></tr></thead>
                      <tbody>
                        {nicheData.topGaps.map((g, i) => (
                          <tr key={g.keyword} className={i % 2 === 1 ? styles.rowAlt : ''}>
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
              <Section title="ATS score distribution">
                {nicheData && (
                  <div className={styles.cardGrid4}>
                    {Object.entries(nicheData.scoreBuckets).map(([range, count]) => (
                      <Card key={range} label={`Score ${range}`} value={fmtN(count)}
                        sub={nicheData.jobsAnalyzed > 0 ? `${Math.round(count / nicheData.jobsAnalyzed * 100)}%` : '0%'} />
                    ))}
                  </div>
                )}
              </Section>
            </>
          )}

          {/* ── HEALTH ────────────────────────────────────────────────────── */}
          {activeTab === 'health' && (
            <>
              <Section title="Processing time percentiles">
                {!healthData ? <p className={styles.empty}>Loading...</p> : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr><th>Pipeline</th><th>Count</th><th>Avg</th><th>p50</th><th>p75</th><th>p95</th><th>p99</th></tr>
                      </thead>
                      <tbody>
                        {[['Teaser analysis', healthData.teaserAnalysis], ['Full report', healthData.fullReport]].map(([label, p]) => (
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
                <Section title="Error rates">
                  <div className={styles.cardGrid3}>
                    <Card label="Claude retry rate" value={`${healthData.claudeRetryRate.rate}%`}
                      sub={`${fmtN(healthData.claudeRetryRate.retries)} retries / ${fmtN(healthData.claudeRetryRate.totalJobs)} jobs`}
                      accent={healthData.claudeRetryRate.rate > 5} />
                    <Card label="PDF rejection rate" value={`${healthData.pdfRejectionRate.rate}%`}
                      sub={`${fmtN(healthData.pdfRejectionRate.rejected)} rejected / ${fmtN(healthData.pdfRejectionRate.totalUploads)} uploads`}
                      accent={healthData.pdfRejectionRate.rate > 10} />
                  </div>
                </Section>
              )}
              <Section title="Channel attribution (LTV)">
                {!attrData ? <p className={styles.empty}>Loading...</p> :
                  attrData.attribution.length === 0 ? <p className={styles.empty}>No paid conversions yet.</p> : (
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead><tr><th>Channel</th><th>Conversions</th><th>Revenue</th><th>Avg/conversion</th></tr></thead>
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
            </>
          )}

          {/* ── P&L SIMULATOR ─────────────────────────────────────────────── */}
          {activeTab === 'simulator' && (
            <>
              <Section title="Try any combination">
                <div className={styles.simInputRow}>
                  <div className={styles.simInputCard}>
                    <div className={styles.simInputLabel}>The Audit <span className={styles.simPrice}>$12 each</span></div>
                    <div className={styles.simInputControls}>
                      <button className={styles.simBtn} onClick={() => setSimBasic(Math.max(0, simBasic - 1))}>-</button>
                      <input type="number" className={styles.simInput} value={simBasic} min={0}
                        onChange={e => setSimBasic(Math.max(0, parseInt(e.target.value) || 0))} />
                      <button className={styles.simBtn} onClick={() => setSimBasic(simBasic + 1)}>+</button>
                    </div>
                    <div className={styles.simSubtotal}>{fmt$(simBasic * 12)} gross</div>
                  </div>
                  <div className={styles.simInputCard}>
                    <div className={styles.simInputLabel}>The Glow-Up <span className={styles.simPrice}>$29 each</span></div>
                    <div className={styles.simInputControls}>
                      <button className={styles.simBtn} onClick={() => setSimFull(Math.max(0, simFull - 1))}>-</button>
                      <input type="number" className={styles.simInput} value={simFull} min={0}
                        onChange={e => setSimFull(Math.max(0, parseInt(e.target.value) || 0))} />
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

              {unitEconomics && (
                <Section title="Per-job cost breakdown (based on your real averages)">
                  <div className={styles.simJobGrid}>
                    {[{ tier: 'The Audit', price: 12, u: unitEconomics.BASIC }, { tier: 'The Glow-Up', price: 29, u: unitEconomics.FULL }].map(({ tier, price, u }) => (
                      <div key={tier} className={styles.simJobCard}>
                        <div className={styles.simJobTitle}>{tier} <span className={styles.simPrice}>{fmt$(price)}</span></div>
                        <div className={styles.simJobRows}>
                          <div className={styles.simJobRow}><span className={styles.simJobLabel}>Gross revenue</span><span className={styles.simJobVal}>{fmt$(price)}</span></div>
                          <div className={styles.simJobRow}><span className={styles.simJobLabel}>Lemon Squeezy (5% + $0.50)</span><span className={styles.simJobVal} style={{ color: '#f59e0b' }}>-{fmt$(u.processorFee)}</span></div>
                          <div className={styles.simJobRow}><span className={styles.simJobLabel}>Claude API</span><span className={styles.simJobVal} style={{ color: '#8b5cf6' }}>-{fmt$4(u.avgClaudeCost)}</span></div>
                          <div className={styles.simJobRow}><span className={styles.simJobLabel}>Resend email</span><span className={styles.simJobVal} style={{ color: '#9ca3af' }}>$0.00</span></div>
                          <div className={`${styles.simJobRow} ${styles.simJobRowTotal}`}><span className={styles.simJobLabel}>You keep (before Railway)</span><span className={styles.simJobVal} style={{ color: '#059669' }}>{fmt$(u.netPerJob)}</span></div>
                          <div className={styles.simJobMargin}>{u.marginPct}% margin</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className={styles.simNote}>Railway is a fixed $10/month — not shown per-job. Included in the batch totals below.</p>
                </Section>
              )}

              {sim && sim.gross > 0 && (
                <Section title={`Where your ${fmt$(sim.gross)} goes`}>
                  <div className={styles.simDestStack}>
                    {sim.destinations.map(d => (
                      <div key={d.label} className={styles.simDestRow}>
                        <div className={styles.simDestLabel}><span className={styles.simDestDot} style={{ background: d.color }} />{d.label}</div>
                        <div className={styles.simDestBarWrap}><div className={styles.simDestBar} style={{ width: `${Math.max(0.5, d.pct)}%`, background: d.color }} /></div>
                        <div className={styles.simDestAmt}><span style={{ color: d.color }}>{fmt$(d.amount)}</span><span className={styles.simDestPct}>{d.pct}%</span></div>
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

              {sim && sim.totalJobs > 0 && (
                <Section title="How profit scales at this Audit/Glow-Up mix">
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr><th>Jobs</th><th>Gross revenue</th><th>Variable costs</th><th>Railway (fixed)</th><th>Net profit</th><th>Margin</th></tr>
                      </thead>
                      <tbody>
                        {sim.scaleSteps.map((row, idx) => (
                          <tr key={row.jobs}
                            className={`${idx % 2 === 1 ? styles.rowAlt : ''} ${row.jobs === sim.totalJobs ? styles.rowHighlight : ''}`}>
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
            </>
          )}

          {/* ── GEOGRAPHY ─────────────────────────────────────────────────── */}
          {activeTab === 'geo' && (
            <>
              <Section title={`World heatmap — ${geoData ? `${geoData.total.toLocaleString()} events across ${geoData.countries.length} countries` : 'Loading...'}`}>
                {!geoData ? <p className={styles.empty}>Loading...</p> :
                  geoData.countries.length === 0 ? (
                    <p className={styles.empty}>No country data yet. Country is detected from visitor browser locale and stored on each analytics event.</p>
                  ) : (
                    <WorldHeatmap countries={geoData.countries} />
                  )}
              </Section>
              {geoData && geoData.countries.length > 0 && (
                <Section title="Top countries">
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead><tr><th>#</th><th>Country</th><th>Events</th><th>Share</th><th></th></tr></thead>
                      <tbody>
                        {geoData.countries.slice(0, 30).map((c, i) => (
                          <tr key={c.country} className={i % 2 === 1 ? styles.rowAlt : ''}>
                            <td className={styles.mono}>{i + 1}</td>
                            <td>{c.country}</td>
                            <td className={styles.mono}>{fmtN(c.count)}</td>
                            <td className={styles.mono}>{geoData.total > 0 ? Math.round(c.count / geoData.total * 100) : 0}%</td>
                            <td style={{ width: 120 }}>
                              <div style={{ height: 6, borderRadius: 3, background: '#e5e7eb', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: '#3b82f6', borderRadius: 3, width: `${geoData.total > 0 ? Math.min(100, Math.round(c.count / geoData.countries[0].count * 100)) : 0}%` }} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
