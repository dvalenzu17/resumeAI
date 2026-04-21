import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LayoutDashboard, TrendingDown, Search, Activity,
  Calculator, Globe, RefreshCw, Menu,
} from 'lucide-react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import styles from './AdminView.module.css';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

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

// ── ISO numeric → alpha-2 lookup (world-atlas uses numeric IDs) ───────────────
const NUM_TO_A2 = {
  4:'AF',8:'AL',12:'DZ',24:'AO',32:'AR',36:'AU',40:'AT',50:'BD',56:'BE',64:'BT',
  68:'BO',76:'BR',100:'BG',116:'KH',120:'CM',124:'CA',152:'CL',156:'CN',170:'CO',
  178:'CG',180:'CD',188:'CR',192:'CU',196:'CY',203:'CZ',208:'DK',218:'EC',818:'EG',
  231:'ET',246:'FI',250:'FR',276:'DE',288:'GH',300:'GR',320:'GT',332:'HT',340:'HN',
  348:'HU',356:'IN',360:'ID',364:'IR',368:'IQ',372:'IE',376:'IL',380:'IT',388:'JM',
  392:'JP',400:'JO',398:'KZ',404:'KE',410:'KR',414:'KW',418:'LA',422:'LB',434:'LY',
  458:'MY',484:'MX',504:'MA',508:'MZ',524:'NP',528:'NL',540:'NC',554:'NZ',566:'NG',
  578:'NO',586:'PK',591:'PA',604:'PE',608:'PH',616:'PL',620:'PT',630:'PR',634:'QA',
  642:'RO',643:'RU',682:'SA',686:'SN',694:'SL',703:'SK',706:'SO',710:'ZA',724:'ES',
  144:'LK',729:'SD',752:'SE',756:'CH',760:'SY',764:'TH',788:'TN',792:'TR',800:'UG',
  804:'UA',784:'AE',826:'GB',840:'US',858:'UY',862:'VE',704:'VN',887:'YE',894:'ZM',
  716:'ZW',12:'DZ',51:'AM',31:'AZ',112:'BY',70:'BA',104:'MM',60:'BM',84:'BZ',
  204:'BJ',44:'BS',48:'BH',262:'DJ',214:'DO',231:'ET',266:'GA',270:'GM',324:'GN',
  328:'GY',426:'LS',430:'LR',466:'ML',478:'MR',516:'NA',562:'NE',598:'PG',275:'PS',
  174:'KM',834:'TZ',768:'TG',795:'TM',860:'UZ',548:'VU',887:'YE',
};

// Color scale for completions
function completionColor(completions, maxCompletions) {
  if (!completions) return null;
  const t = maxCompletions > 0 ? completions / maxCompletions : 0;
  // Interpolate from #1d4ed8 (low) to #6366f1 → #a21caf (high)
  if (t < 0.2)  return '#1d4ed8';
  if (t < 0.4)  return '#2563eb';
  if (t < 0.6)  return '#4f46e5';
  if (t < 0.8)  return '#7c3aed';
  return '#a21caf';
}

function ChoroplethMap({ countries }) {
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const wrapRef = useRef(null);

  const dataMap = {};
  let maxCompletions = 0;
  for (const c of countries) {
    dataMap[c.country] = c;
    if (c.completions > maxCompletions) maxCompletions = c.completions;
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', userSelect: 'none' }}>
      <ComposableMap
        projectionConfig={{ scale: 140, center: [10, 10] }}
        style={{ width: '100%', height: 'auto', maxHeight: 420 }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const a2 = NUM_TO_A2[Number(geo.id)];
              const d = a2 ? dataMap[a2] : null;
              const hasCompletions = d && d.completions > 0;
              const hasScans = d && d.scans > 0;
              const fill = hasCompletions
                ? completionColor(d.completions, maxCompletions)
                : hasScans
                  ? '#1e3a5f'
                  : '#1f2937';
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke="#111827"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: 'none' },
                    hover:   { outline: 'none', fill: hasCompletions || hasScans ? '#f59e0b' : '#374151', cursor: hasCompletions || hasScans ? 'pointer' : 'default' },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={(e) => {
                    if (!d) return;
                    const rect = wrapRef.current?.getBoundingClientRect();
                    setTooltipPos({ x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) });
                    setTooltip({ name: geo.properties.name, ...d });
                  }}
                  onMouseMove={(e) => {
                    if (!d) return;
                    const rect = wrapRef.current?.getBoundingClientRect();
                    setTooltipPos({ x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltipPos.x + 12,
          top: tooltipPos.y + 12,
          background: '#1f2937',
          border: '1px solid #374151',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 12,
          color: '#f9fafb',
          pointerEvents: 'none',
          zIndex: 10,
          minWidth: 160,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}>
          <p style={{ fontWeight: 700, marginBottom: 4, color: '#e5e7eb' }}>{tooltip.name}</p>
          <p style={{ color: '#9ca3af', margin: '2px 0' }}>Scans: <span style={{ color: '#f9fafb', fontWeight: 600 }}>{fmtN(tooltip.scans)}</span></p>
          <p style={{ color: '#9ca3af', margin: '2px 0' }}>Completions: <span style={{ color: tooltip.completions > 0 ? '#6366f1' : '#f9fafb', fontWeight: 600 }}>{fmtN(tooltip.completions)}</span></p>
          {tooltip.completions > 0 && (
            <>
              <p style={{ color: '#9ca3af', margin: '2px 0' }}>Revenue: <span style={{ color: '#10b981', fontWeight: 600 }}>{fmt$(tooltip.revenue)}</span></p>
              <p style={{ color: '#9ca3af', margin: '2px 0' }}>Conv. rate: <span style={{ color: '#f9fafb', fontWeight: 600 }}>{tooltip.conversionRate}%</span></p>
            </>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, flexWrap: 'wrap', fontSize: 11, color: '#9ca3af' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 2, background: '#1f2937', border: '1px solid #374151', display: 'inline-block' }} /> No data</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 2, background: '#1e3a5f', display: 'inline-block' }} /> Scans only</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 2, background: '#1d4ed8', display: 'inline-block' }} /><span style={{ width: 12, height: 12, borderRadius: 2, background: '#a21caf', display: 'inline-block' }} /> Completions (low/high)</span>
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
              <Section title={`Choropleth map — ${geoData ? `${geoData.total.completions} paid across ${geoData.countryCount} countries` : 'Loading...'}`}>
                {!geoData ? <p className={styles.empty}>Loading...</p> :
                  geoData.countries.length === 0 ? (
                    <p className={styles.empty}>No country data yet. Country is detected from the browser locale on job submission.</p>
                  ) : (
                    <ChoroplethMap countries={geoData.countries} />
                  )}
              </Section>
              {geoData && geoData.countries.length > 0 && (
                <Section title="Top countries">
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead><tr><th>#</th><th>Country</th><th>Scans</th><th>Paid</th><th>Conv.</th><th>Revenue</th></tr></thead>
                      <tbody>
                        {geoData.countries.slice(0, 30).map((c, i) => (
                          <tr key={c.country} className={i % 2 === 1 ? styles.rowAlt : ''}>
                            <td className={styles.mono}>{i + 1}</td>
                            <td>{c.country}</td>
                            <td className={styles.mono}>{fmtN(c.scans)}</td>
                            <td className={styles.mono} style={{ color: c.completions > 0 ? '#6366f1' : undefined }}>{fmtN(c.completions)}</td>
                            <td className={styles.mono}>{c.conversionRate}%</td>
                            <td className={styles.mono} style={{ color: c.revenue > 0 ? '#10b981' : undefined }}>{c.revenue > 0 ? fmt$(c.revenue) : '-'}</td>
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
