/**
 * Compliance Overview — Presentation Dashboard
 * Consolidated view of HIPAA, GDPR, SOC 2 controls, vendor BAAs,
 * policies, risks, incidents, and live system checks.
 * Optimized for screen-sharing and stakeholder presentations.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Shield, FileText, AlertTriangle, Users2, Building2,
  RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle, Minus,
  ChevronDown, ChevronUp, Printer, Activity, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';

const API = '/.netlify/functions/compliance-state';
const CHECKS_URL = '/.netlify/functions/compliance-checks';

/* ── Helpers ─────────────────────────────────────────── */

function pct(n, total) {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

const STATUS_ORDER = { implemented: 0, 'in-progress': 1, 'not-started': 2 };

const FRAMEWORK_META = {
  hipaa: { label: 'HIPAA', color: '#2563eb', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  gdpr:  { label: 'GDPR',  color: '#7c3aed', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  soc2:  { label: 'SOC 2', color: '#0891b2', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
};

const BAA_COLORS = {
  signed:  { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
  'n/a':   { bg: 'bg-gray-100', text: 'text-gray-600', icon: Minus },
};

const POLICY_COLORS = {
  approved:      { bg: 'bg-green-100', text: 'text-green-800' },
  draft:         { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'not-started': { bg: 'bg-gray-100', text: 'text-gray-600' },
};

const RISK_SEVERITY = {
  high:   { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  low:    { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
};

const CHECK_STATUS = {
  pass: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
  fail: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
  warn: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
};

/* ── Progress Ring ───────────────────────────────────── */

function ProgressRing({ value, size = 96, stroke = 8, color = '#006838' }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle" dominantBaseline="central"
        className="fill-gray-900 font-bold"
        style={{ fontSize: size * 0.26, transform: 'rotate(90deg)', transformOrigin: 'center' }}
      >
        {value}%
      </text>
    </svg>
  );
}

/* ── Section wrapper ─────────────────────────────────── */

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden print:break-inside-avoid">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-gray-50 transition-colors print:hover:bg-white"
      >
        <Icon className="h-5 w-5 text-[#006838] shrink-0" />
        <h2 className="text-base font-semibold text-gray-900 flex-1">{title}</h2>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400 print:hidden" /> : <ChevronDown className="h-4 w-4 text-gray-400 print:hidden" />}
      </button>
      {open && <div className="px-6 pb-5 border-t border-gray-100">{children}</div>}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────── */

export default function ComplianceOverview() {
  const { getToken, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [controls, setControls] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [risks, setRisks] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [checks, setChecks] = useState([]);
  const [checksRunning, setChecksRunning] = useState(false);

  const fetchTable = useCallback(async (table) => {
    const token = getToken();
    const res = await fetch(`${API}?table=${table}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to load ${table}`);
    return res.json();
  }, [getToken]);

  const safeFetch = useCallback(async (table, fallback = []) => {
    try { return await fetchTable(table); }
    catch (_) { return fallback; }
  }, [fetchTable]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, v, p, r, i, ak] = await Promise.all([
        safeFetch('controls'),
        safeFetch('vendors'),
        safeFetch('policies'),
        safeFetch('risks'),
        safeFetch('incidents'),
        safeFetch('auto_checks'),
      ]);
      setControls(Array.isArray(c) ? c : []);
      setVendors(Array.isArray(v) ? v : []);
      setPolicies(Array.isArray(p) ? p : []);
      setRisks(Array.isArray(r) ? r : []);
      setIncidents(Array.isArray(i) ? i : []);
      setChecks(Array.isArray(ak) ? ak : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [safeFetch]);

  useEffect(() => {
    if (isAdmin) loadAll();
    else { setLoading(false); setError('Admin access required.'); }
  }, [isAdmin, loadAll]);

  const runChecks = async () => {
    setChecksRunning(true);
    try {
      const token = getToken();
      const res = await fetch(CHECKS_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const fresh = await fetchTable('auto_checks');
        setChecks(fresh);
      }
    } catch (_) { /* best effort */ }
    finally { setChecksRunning(false); }
  };

  /* ── Derived stats ─────────────────────────────────── */

  const frameworks = ['hipaa', 'gdpr', 'soc2'].map(fw => {
    const items = controls.filter(c => c.framework === fw);
    const impl = items.filter(c => c.status === 'implemented').length;
    const inProg = items.filter(c => c.status === 'in-progress').length;
    return { key: fw, ...FRAMEWORK_META[fw], total: items.length, implemented: impl, inProgress: inProg, notStarted: items.length - impl - inProg, pct: pct(impl, items.length) };
  });

  const totalControls = controls.length;
  const totalImpl = controls.filter(c => c.status === 'implemented').length;
  const overallPct = pct(totalImpl, totalControls);

  const openRisks = risks.filter(r => r.status === 'open').length;
  const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'investigating').length;
  const signedBAAs = vendors.filter(v => v.baa_status === 'signed').length;
  const requiredBAAs = vendors.filter(v => v.baa_status !== 'n/a').length;
  const approvedPolicies = policies.filter(p => p.status === 'approved').length;

  const checksPass = checks.filter(c => c.status === 'pass').length;
  const checksFail = checks.filter(c => c.status === 'fail').length;
  const checksWarn = checks.filter(c => c.status === 'warn').length;

  /* ── Render ────────────────────────────────────────── */

  if (loading) {
    return (
      <AdminLayout title="Compliance Overview">
        <div className="flex items-center justify-center py-20" role="status">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006838]" />
          <span className="sr-only">Loading compliance data...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Compliance Overview">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Compliance Overview"
      subtitle="Presentation-ready compliance posture across all frameworks"
      actions={
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Print / Export PDF"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={loadAll}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            title="Refresh all data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      }
    >
      {/* ── Executive Summary Cards ────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <SummaryCard label="Overall Compliance" value={overallPct + '%'} sub={totalImpl + '/' + totalControls + ' controls'} color={overallPct >= 80 ? 'text-green-600' : overallPct >= 50 ? 'text-yellow-600' : 'text-red-600'} />
        <SummaryCard label="BAAs Signed" value={signedBAAs + '/' + requiredBAAs} sub="vendor agreements" color={signedBAAs === requiredBAAs ? 'text-green-600' : 'text-yellow-600'} />
        <SummaryCard label="Policies" value={approvedPolicies + '/' + policies.length} sub="approved" color={approvedPolicies === policies.length ? 'text-green-600' : 'text-yellow-600'} />
        <SummaryCard label="Open Risks" value={openRisks} sub={'of ' + risks.length + ' total'} color={openRisks === 0 ? 'text-green-600' : 'text-orange-600'} />
        <SummaryCard label="Incidents" value={openIncidents} sub={openIncidents === 0 ? 'none open' : 'open / investigating'} color={openIncidents === 0 ? 'text-green-600' : 'text-red-600'} />
        <SummaryCard label="System Checks" value={checksPass + '/' + checks.length} sub={checksFail > 0 ? checksFail + ' failing' : checksWarn > 0 ? checksWarn + ' warnings' : 'all passing'} color={checksFail > 0 ? 'text-red-600' : checksWarn > 0 ? 'text-yellow-600' : 'text-green-600'} />
      </div>

      <div className="space-y-5">
        {/* ── Framework Progress ──────────────────────── */}
        <Section title="Framework Compliance" icon={ShieldCheck}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {frameworks.map(fw => (
              <div key={fw.key} className={'rounded-xl border p-5 ' + fw.bg + ' ' + fw.border}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={'text-lg font-bold ' + fw.text}>{fw.label}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{fw.total} controls</p>
                  </div>
                  <ProgressRing value={fw.pct} size={80} stroke={7} color={fw.color} />
                </div>
                <div className="space-y-2">
                  <BarRow label="Implemented" count={fw.implemented} total={fw.total} color="bg-green-500" />
                  <BarRow label="In Progress" count={fw.inProgress} total={fw.total} color="bg-yellow-400" />
                  <BarRow label="Not Started" count={fw.notStarted} total={fw.total} color="bg-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Controls Detail ────────────────────────── */}
        <Section title="Control Details" icon={Shield} defaultOpen={false}>
          <div className="pt-4 space-y-6">
            {frameworks.map(fw => {
              const items = controls.filter(c => c.framework === fw.key).sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));
              return (
                <div key={fw.key}>
                  <h3 className={'text-sm font-bold mb-3 ' + fw.text}>{fw.label} Controls</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 pr-3 font-medium text-gray-500 w-24">ID</th>
                          <th className="text-left py-2 pr-3 font-medium text-gray-500">Control</th>
                          <th className="text-left py-2 pr-3 font-medium text-gray-500 w-32">Category</th>
                          <th className="text-left py-2 pr-3 font-medium text-gray-500 w-28">Status</th>
                          <th className="text-left py-2 font-medium text-gray-500 w-28">Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(c => (
                          <tr key={c.id} className="border-b border-gray-100">
                            <td className="py-2 pr-3 text-gray-400 font-mono text-xs">{c.id}</td>
                            <td className="py-2 pr-3 text-gray-900">{c.name}</td>
                            <td className="py-2 pr-3 text-gray-500 text-xs">{c.category}</td>
                            <td className="py-2 pr-3">
                              <StatusPill status={c.status} />
                            </td>
                            <td className="py-2 text-gray-500 text-xs">{c.owner || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── Vendor BAA Status ──────────────────────── */}
        <Section title="Vendor BAA Status" icon={Building2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
            {vendors.map(v => {
              const style = BAA_COLORS[v.baa_status] || BAA_COLORS.pending;
              const Icon = style.icon;
              return (
                <div key={v.id} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className={'p-2 rounded-lg ' + style.bg}>
                    <Icon className={'h-4 w-4 ' + style.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{v.name}</p>
                    <p className="text-xs text-gray-500">{v.type}</p>
                  </div>
                  <span className={'text-xs font-medium px-2 py-0.5 rounded-full ' + style.bg + ' ' + style.text}>
                    {v.baa_status === 'n/a' ? 'N/A' : v.baa_status.charAt(0).toUpperCase() + v.baa_status.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── Policies ───────────────────────────────── */}
        <Section title="Policy Status" icon={FileText}>
          <div className="pt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-3 font-medium text-gray-500">Policy</th>
                  <th className="text-left py-2 pr-3 font-medium text-gray-500 w-32">Framework</th>
                  <th className="text-left py-2 pr-3 font-medium text-gray-500 w-28">Status</th>
                  <th className="text-left py-2 pr-3 font-medium text-gray-500 w-28">Last Reviewed</th>
                  <th className="text-left py-2 font-medium text-gray-500 w-28">Next Review</th>
                </tr>
              </thead>
              <tbody>
                {policies.map(p => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="py-2 pr-3 text-gray-900">{p.name}</td>
                    <td className="py-2 pr-3 text-gray-500 text-xs">{p.framework || '—'}</td>
                    <td className="py-2 pr-3">
                      <StatusPill status={p.status} />
                    </td>
                    <td className="py-2 pr-3 text-gray-500 text-xs">
                      {p.last_reviewed ? new Date(p.last_reviewed).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2 text-gray-500 text-xs">
                      {p.next_review ? new Date(p.next_review).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Risk Register ──────────────────────────── */}
        <Section title="Risk Register" icon={AlertTriangle}>
          <div className="pt-4 space-y-3">
            {risks.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No risks documented.</p>
            ) : (
              risks.map(r => {
                const sev = RISK_SEVERITY[r.impact] || RISK_SEVERITY.medium;
                return (
                  <div key={r.id} className="flex items-start gap-3 p-4 rounded-lg border border-gray-200">
                    <span className={'mt-1 h-2.5 w-2.5 rounded-full shrink-0 ' + sev.dot} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{r.description}</p>
                      {r.mitigation && <p className="text-xs text-gray-500 mt-1">Mitigation: {r.mitigation}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + sev.bg + ' ' + sev.text}>
                        {r.impact}
                      </span>
                      <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (r.status === 'open' ? 'bg-red-100 text-red-700' : r.status === 'mitigated' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Section>

        {/* ── Incidents ──────────────────────────────── */}
        <Section title="Incident Log" icon={AlertCircle} defaultOpen={incidents.length > 0}>
          <div className="pt-4">
            {incidents.length === 0 ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <p className="text-sm text-green-800 font-medium">No incidents recorded</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-3 font-medium text-gray-500 w-28">Date</th>
                      <th className="text-left py-2 pr-3 font-medium text-gray-500">Description</th>
                      <th className="text-left py-2 pr-3 font-medium text-gray-500 w-24">Severity</th>
                      <th className="text-left py-2 pr-3 font-medium text-gray-500 w-28">Status</th>
                      <th className="text-left py-2 font-medium text-gray-500 w-24">HHS Notified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map(inc => (
                      <tr key={inc.id} className="border-b border-gray-100">
                        <td className="py-2 pr-3 text-gray-500 text-xs">
                          {new Date(inc.incident_date).toLocaleDateString()}
                        </td>
                        <td className="py-2 pr-3 text-gray-900">{inc.description}</td>
                        <td className="py-2 pr-3">
                          <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (RISK_SEVERITY[inc.severity]?.bg || 'bg-gray-100') + ' ' + (RISK_SEVERITY[inc.severity]?.text || 'text-gray-600')}>
                            {inc.severity}
                          </span>
                        </td>
                        <td className="py-2 pr-3">
                          <StatusPill status={inc.status} />
                        </td>
                        <td className="py-2 text-xs text-gray-500">
                          {inc.hhs_notified ? 'Yes' : 'No'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Section>

        {/* ── Live System Checks ─────────────────────── */}
        <Section title="Live System Checks" icon={Activity}>
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500">
                {checks.length > 0
                  ? checksPass + ' passing, ' + checksFail + ' failing, ' + checksWarn + ' warnings'
                  : 'No checks run yet'}
              </p>
              <button
                onClick={runChecks}
                disabled={checksRunning}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#006838] text-white rounded-lg hover:bg-[#005530] disabled:opacity-50 transition-colors print:hidden"
              >
                <RefreshCw className={'h-3.5 w-3.5 ' + (checksRunning ? 'animate-spin' : '')} />
                {checksRunning ? 'Running...' : 'Run Checks'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {checks.map(c => {
                const style = CHECK_STATUS[c.status] || CHECK_STATUS.warn;
                const Icon = style.icon;
                return (
                  <div key={c.check_name} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200">
                    <div className={'p-1.5 rounded-md mt-0.5 ' + style.bg}>
                      <Icon className={'h-3.5 w-3.5 ' + style.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{c.check_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 break-words">{c.detail || 'No details'}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {c.checked_at ? new Date(c.checked_at).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                );
              })}
              {checks.length === 0 && (
                <p className="text-sm text-gray-400 italic col-span-2">Click "Run Checks" to scan systems.</p>
              )}
            </div>
          </div>
        </Section>
      </div>

      {/* ── Print footer ─────────────────────────────── */}
      <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        Transplant Medication Navigator — Compliance Overview — Generated {new Date().toLocaleDateString()}
      </div>
    </AdminLayout>
  );
}

/* ── Shared sub-components ───────────────────────────── */

function SummaryCard({ label, value, sub, color = 'text-gray-900' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={'text-2xl font-bold ' + color}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function BarRow({ label, count, total, color }) {
  const w = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
        <div className={color + ' h-full rounded-full'} style={{ width: w + '%', transition: 'width 0.4s ease' }} />
      </div>
      <span className="text-xs font-medium text-gray-700 w-8 text-right">{count}</span>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    implemented:   'bg-green-100 text-green-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    'not-started': 'bg-gray-100 text-gray-600',
    approved:      'bg-green-100 text-green-800',
    draft:         'bg-yellow-100 text-yellow-800',
    open:          'bg-red-100 text-red-700',
    investigating: 'bg-orange-100 text-orange-700',
    mitigated:     'bg-green-100 text-green-700',
    resolved:      'bg-green-100 text-green-700',
    closed:        'bg-gray-100 text-gray-600',
  };
  const cls = map[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + cls}>
      {status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
    </span>
  );
}
