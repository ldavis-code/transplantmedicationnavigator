/**
 * Center Analytics
 * One transplant center's pilot at a glance: goals vs. actuals, the patient
 * journey funnel, program connections, and what the center's patients looked
 * for. Data comes from admin-center-analytics (events tagged with the center's
 * partner slug, plus EHR-launch logins when the pilot is linked to an Epic org).
 * Aggregate counts only, no patient identifiers.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Building2, Users, Target, TrendingUp, TrendingDown, Minus, Download, Filter,
  Pill, Link2, Globe, Stethoscope, Smartphone, ThumbsUp, Calendar, Pencil,
  Plus, X, Save, Trash2, AlertTriangle, ClipboardCheck, Layers, Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';
import ConfirmDialog from '../../components/ConfirmDialog';

const API = '/.netlify/functions/admin-center-analytics';

const RANGE_OPTIONS = [
  { value: 'pilot', label: 'Pilot window' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '180', label: 'Last 6 months' },
  { value: 'all', label: 'All time' },
];

const STATUS_STYLES = {
  planned: 'bg-gray-100 text-gray-700',
  active: 'bg-emerald-100 text-emerald-800',
  paused: 'bg-amber-100 text-amber-800',
  completed: 'bg-blue-100 text-blue-800',
};

const COVERAGE_LABELS = {
  medicare: 'Medicare',
  medicaid: 'Medicaid',
  commercial: 'Commercial / employer',
  employer: 'Commercial / employer',
  marketplace: 'ACA Marketplace',
  uninsured: 'Uninsured',
  va: 'VA / TRICARE',
  tricare: 'VA / TRICARE',
  other: 'Other',
  unsure: 'Not sure',
};

const BURDEN_LABELS = {
  struggling: 'Struggling to afford',
  tight: 'Tight but managing',
  manageable: 'Manageable',
  comfortable: 'Comfortable',
};

const EMPTY_FORM = {
  partnerSlug: '',
  centerName: '',
  epicOrgId: '',
  status: 'active',
  startDate: '',
  endDate: '',
  targetPatients: '',
  targetConnections: '',
  targetQuizCompletes: '',
  coordinatorName: '',
  notes: '',
};

const fmt = (n) => (n == null ? '0' : typeof n === 'string' ? n : Number(n).toLocaleString());
const labelFor = (map, value) => map[String(value || '').toLowerCase()] || value || 'Unknown';

function formatDate(value) {
  if (!value) return 'N/A';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
}

function formatWeek(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function pilotToForm(pilot, slug) {
  if (!pilot) return { ...EMPTY_FORM, partnerSlug: slug || '' };
  return {
    partnerSlug: pilot.partnerSlug || '',
    centerName: pilot.centerName || '',
    epicOrgId: pilot.epicOrgId || '',
    status: pilot.status || 'active',
    startDate: pilot.startDate || '',
    endDate: pilot.endDate || '',
    targetPatients: pilot.targetPatients ?? '',
    targetConnections: pilot.targetConnections ?? '',
    targetQuizCompletes: pilot.targetQuizCompletes ?? '',
    coordinatorName: pilot.coordinatorName || '',
    notes: pilot.notes || '',
  };
}

// ---------------------------------------------------------------------------
// Presentational pieces
// ---------------------------------------------------------------------------

function StatCard({ icon: Icon, label, value, sublabel, tone = 'emerald', delta }) {
  const tones = {
    emerald: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    purple: 'bg-purple-100 text-purple-700',
    teal: 'bg-teal-100 text-teal-700',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-gray-900">{fmt(value)}</div>
        {delta && <DeltaBadge {...delta} />}
      </div>
      {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
    </div>
  );
}

// Change versus the same-length prior window.
function DeltaBadge({ current, previous }) {
  if (previous == null) return null;
  if (previous === 0 && current === 0) return null;
  if (previous === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-700">
        <TrendingUp className="h-3 w-3" /> new
      </span>
    );
  }
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-gray-500">
        <Minus className="h-3 w-3" /> 0%
      </span>
    );
  }
  const up = change > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? 'text-emerald-700' : 'text-rose-600'}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? '+' : ''}{change}%
    </span>
  );
}

function GoalRow({ label, actual, target, hint }) {
  const hasTarget = target != null && target > 0;
  const pct = hasTarget ? Math.min(100, Math.round((actual / target) * 100)) : 0;
  const bar = pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500';
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium text-gray-900">{label}</span>
        <span className="text-gray-600 tabular-nums">
          {fmt(actual)}{hasTarget ? ` / ${fmt(target)}` : ''}
          {hasTarget && <span className={`ml-2 font-semibold ${pct >= 100 ? 'text-emerald-700' : 'text-gray-700'}`}>{pct}%</span>}
        </span>
      </div>
      {hasTarget ? (
        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
        </div>
      ) : (
        <p className="text-xs text-gray-400">No target set. Edit the pilot to add one.</p>
      )}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

// One step of the patient journey. Bars are scaled to page views; the share
// shown is of page views too, so a step that is not strictly downstream of the
// previous one (medication search vs. quiz) still reads sensibly.
function FunnelStep({ label, value, maxValue, color, isBase = false }) {
  const share = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  const width = Math.min(100, Math.max(share, value > 0 ? 2 : 0));
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 text-sm text-gray-700 text-right">{label}</span>
      <div className="flex-1">
        <div className="bg-gray-100 rounded-full h-6 overflow-hidden">
          <div className={`${color} h-full rounded-full`} style={{ width: `${width}%` }} />
        </div>
      </div>
      <span className="w-14 text-sm font-semibold text-gray-900 text-right tabular-nums">{fmt(value)}</span>
      <span className="w-12 text-xs text-gray-500 text-right tabular-nums">{isBase ? '' : `${share}%`}</span>
    </div>
  );
}

function BarRow({ label, count, total, tone = 'emerald' }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const bar = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
    slate: 'bg-slate-400',
  }[tone];
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-500 tabular-nums">{fmt(count)} · {pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children, aside }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-gray-400" />} {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }) {
  return <p className="text-sm text-gray-500">{children}</p>;
}

// Week-by-week column chart, CSS only so it prints.
function WeeklyChart({ weeks }) {
  const max = Math.max(1, ...weeks.map((w) => Math.max(w.sessions, w.connections)));
  const height = (v) => (v > 0 ? Math.max(3, Math.round((v / max) * 100)) : 0);
  return (
    <div>
      <div className="flex items-end gap-2 h-40" role="img" aria-label="Patient sessions and program connections per week">
        {weeks.map((w) => (
          <div
            key={w.week}
            className="flex-1 flex items-end justify-center gap-0.5 h-full"
            title={`Week of ${formatWeek(w.week)}: ${w.sessions} sessions, ${w.connections} connections`}
          >
            <div className="w-1/2 rounded-t bg-emerald-500" style={{ height: `${height(w.sessions)}%` }} />
            <div className="w-1/2 rounded-t bg-blue-600" style={{ height: `${height(w.connections)}%` }} />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-1">
        {weeks.map((w) => (
          <div key={w.week} className="flex-1 text-center text-[10px] text-gray-400 truncate">{formatWeek(w.week)}</div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> Patient sessions</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-600" /> Program connections</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pilot editor
// ---------------------------------------------------------------------------

function PilotForm({ initial, onSave, onCancel, saving, error, lockSlug }) {
  const [form, setForm] = useState(initial);
  useEffect(() => setForm(initial), [initial]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const input = 'w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#006838]/30';
  const label = 'block text-xs font-medium text-gray-600 mb-1';

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      className="bg-white rounded-xl border border-[#006838]/30 p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-[#006838]" />
          {lockSlug ? 'Edit pilot' : 'Set up a pilot'}
        </h2>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="pf-slug">Partner tag (URL slug)</label>
          <input id="pf-slug" className={`${input} font-mono`} value={form.partnerSlug} onChange={set('partnerSlug')} placeholder="methodist" required disabled={lockSlug} />
          <p className="text-xs text-gray-400 mt-1">Patients arrive at <span className="font-mono">/pilot/{form.partnerSlug || 'slug'}</span> or any page with <span className="font-mono">?partner={form.partnerSlug || 'slug'}</span>.</p>
        </div>
        <div>
          <label className={label} htmlFor="pf-name">Center name</label>
          <input id="pf-name" className={input} value={form.centerName} onChange={set('centerName')} placeholder="Methodist Health System" required />
        </div>
        <div>
          <label className={label} htmlFor="pf-status">Status</label>
          <select id="pf-status" className={input} value={form.status} onChange={set('status')}>
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="pf-epic">Epic org ID (optional)</label>
          <input id="pf-epic" className={`${input} font-mono`} value={form.epicOrgId} onChange={set('epicOrgId')} placeholder="matches fhir_endpoint_directory.epic_org_id" />
          <p className="text-xs text-gray-400 mt-1">Links the center's MyChart / EHR-launch logins to this pilot.</p>
        </div>
        <div>
          <label className={label} htmlFor="pf-start">Pilot start</label>
          <input id="pf-start" type="date" className={input} value={form.startDate} onChange={set('startDate')} />
        </div>
        <div>
          <label className={label} htmlFor="pf-end">Pilot end (blank = ongoing)</label>
          <input id="pf-end" type="date" className={input} value={form.endDate} onChange={set('endDate')} />
        </div>
      </div>

      <fieldset className="border-t border-gray-100 pt-4">
        <legend className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-gray-400" /> Pilot goals</legend>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={label} htmlFor="pf-tp">Patients reached</label>
            <input id="pf-tp" type="number" min="0" className={input} value={form.targetPatients} onChange={set('targetPatients')} placeholder="100" />
          </div>
          <div>
            <label className={label} htmlFor="pf-tc">Program connections</label>
            <input id="pf-tc" type="number" min="0" className={input} value={form.targetConnections} onChange={set('targetConnections')} placeholder="40" />
          </div>
          <div>
            <label className={label} htmlFor="pf-tq">Quizzes completed</label>
            <input id="pf-tq" type="number" min="0" className={input} value={form.targetQuizCompletes} onChange={set('targetQuizCompletes')} placeholder="50" />
          </div>
        </div>
      </fieldset>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="pf-coord">Center pilot lead (staff)</label>
          <input id="pf-coord" className={input} value={form.coordinatorName} onChange={set('coordinatorName')} placeholder="Transplant pharmacist or coordinator" />
        </div>
        <div>
          <label className={label} htmlFor="pf-notes">Notes</label>
          <textarea id="pf-notes" className={input} rows={2} value={form.notes} onChange={set('notes')} placeholder="How patients are being introduced to the tool, check-in cadence, etc." />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#006838] text-white rounded-lg text-sm hover:bg-[#005530] disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save pilot'}
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CenterAnalytics() {
  const { getToken, isAdmin } = useAuth();
  const authHeaders = useCallback(() => ({ Authorization: `Bearer ${getToken()}` }), [getToken]);

  const [registry, setRegistry] = useState({ pilots: [], partners: [] });
  const [registryLoading, setRegistryLoading] = useState(true);
  const [selected, setSelected] = useState('');
  const [days, setDays] = useState('90');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Registry: pilots + every partner tag seen in events
  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setRegistryLoading(true);
    fetch(API, { headers: authHeaders() })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Request failed (${r.status})`);
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        setRegistry({ pilots: d.pilots || [], partners: d.partners || [] });
        setSelected((cur) => {
          if (cur) return cur;
          const active = (d.pilots || []).find((p) => p.status === 'active') || (d.pilots || [])[0];
          return active?.partnerSlug || (d.partners || [])[0]?.partner || '';
        });
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setRegistryLoading(false); });
    return () => { cancelled = true; };
  }, [isAdmin, authHeaders, reloadKey]);

  // Analytics for the selected center
  useEffect(() => {
    if (!isAdmin || !selected) { setData(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${API}?partner=${encodeURIComponent(selected)}&days=${days}`, { headers: authHeaders() })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Request failed (${r.status})`);
        return r.json();
      })
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAdmin, selected, days, authHeaders, reloadKey]);

  // Every selectable center: pilots first, then untracked partner tags.
  const options = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const p of registry.pilots) {
      seen.add(p.partnerSlug);
      list.push({ value: p.partnerSlug, label: `${p.centerName} (${p.partnerSlug})`, status: p.status });
    }
    for (const t of registry.partners) {
      if (!seen.has(t.partner)) list.push({ value: t.partner, label: `${t.partner} (no pilot record)`, status: null });
    }
    return list;
  }, [registry]);

  const untracked = useMemo(
    () => registry.partners.filter((t) => !registry.pilots.some((p) => p.partnerSlug === t.partner)),
    [registry]
  );

  const pilot = data?.pilot || registry.pilots.find((p) => p.partnerSlug === selected) || null;

  const handleExport = useCallback(async () => {
    if (!selected) return;
    setExporting(true);
    try {
      const res = await fetch(`${API}?partner=${encodeURIComponent(selected)}&days=${days}&format=csv`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `center-analytics-${selected}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      setError(e.message);
    } finally {
      setExporting(false);
    }
  }, [selected, days, authHeaders]);

  const handleSave = useCallback(async (form) => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Save failed (${res.status})`);
      setEditing(false);
      setSelected(body.pilot.partnerSlug);
      setReloadKey((k) => k + 1);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  }, [authHeaders]);

  const handleDelete = useCallback(async () => {
    setConfirmDelete(false);
    try {
      const res = await fetch(`${API}?partner=${encodeURIComponent(selected)}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setEditing(false);
      setReloadKey((k) => k + 1);
    } catch (e) {
      setError(e.message);
    }
  }, [selected, authHeaders]);

  const actions = (
    <div className="flex items-center gap-3 print:hidden">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-gray-400" />
        <select
          value={selected}
          onChange={(e) => { setSelected(e.target.value); setEditing(false); }}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 max-w-[260px]"
          aria-label="Transplant center"
          disabled={registryLoading}
        >
          {options.length === 0 && <option value="">No centers yet</option>}
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <select
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          aria-label="Date range"
        >
          {RANGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} disabled={o.value === 'pilot' && !pilot?.startDate}>{o.label}</option>
          ))}
        </select>
      </div>
      <button
        onClick={() => { setEditing(true); setSaveError(null); }}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
      >
        {pilot ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {pilot ? 'Edit pilot' : 'New pilot'}
      </button>
      <button
        onClick={handleExport}
        disabled={exporting || !selected || !data}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="h-4 w-4" />
        {exporting ? 'Exporting…' : 'Export CSV'}
      </button>
    </div>
  );

  const subtitle = pilot
    ? `${pilot.centerName}${data?.period ? `, ${data.period.label.toLowerCase()}` : ''}`
    : 'Pilot engagement for one transplant center';

  const s = data?.summary;
  const prev = data?.previous;
  const funnel = data?.funnel;
  const byType = data?.connectionsByType;
  const lang = data?.language;
  const langTotal = lang ? lang.en + lang.es : 0;
  const coverageTotal = (data?.coverage || []).reduce((a, c) => a + c.count, 0);
  const burdenTotal = (data?.costBurden || []).reduce((a, c) => a + c.count, 0);
  const helpfulTotal = s ? s.helpfulYes + s.helpfulNo : 0;

  return (
    <AdminLayout title="Center Analytics" subtitle={subtitle} actions={actions}>
      <div className="space-y-6">
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}

        {/* Editor */}
        {editing && (
          <div className="space-y-3">
            <PilotForm
              initial={pilotToForm(editing && pilot ? pilot : null, pilot ? pilot.partnerSlug : selected)}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
              saving={saving}
              error={saveError}
              lockSlug={!!pilot}
            />
            {pilot && (
              <div className="flex justify-end">
                <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800">
                  <Trash2 className="h-3.5 w-3.5" /> Remove this pilot record (events are kept)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Nothing configured yet */}
        {!registryLoading && options.length === 0 && !editing && (
          <div className="text-center py-16 text-gray-500 bg-white rounded-xl border">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-700">No transplant centers yet</p>
            <p className="text-sm mt-1 max-w-md mx-auto">
              Set up a pilot, then give the center a link to <span className="font-mono">/pilot/&lt;slug&gt;</span>.
              Every patient who arrives that way is counted here.
            </p>
            <button onClick={() => setEditing(true)} className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-[#006838] text-white rounded-lg text-sm hover:bg-[#005530]">
              <Plus className="h-4 w-4" /> Set up a pilot
            </button>
          </div>
        )}

        {/* Partner tags without a pilot record */}
        {untracked.length > 0 && !editing && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-medium">Traffic without a pilot record</p>
              <p className="mt-0.5">
                {untracked.map((t) => `${t.partner} (${fmt(t.events)} events)`).join(', ')}.
                Select one and choose <strong>New pilot</strong> to name the center and set goals.
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20" role="status">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006838]" />
            <span className="sr-only">Loading center analytics...</span>
          </div>
        )}

        {!loading && data && s && (
          <>
            {/* Pilot header */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">{pilot?.centerName || selected}</h2>
                    {pilot && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[pilot.status] || STATUS_STYLES.planned}`}>
                        {pilot.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="inline-flex items-center gap-1"><Link2 className="h-3.5 w-3.5" /> /pilot/{selected}</span>
                    {pilot?.startDate && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {formatDate(pilot.startDate)} to {pilot.endDate ? formatDate(pilot.endDate) : 'ongoing'}
                      </span>
                    )}
                    {pilot?.coordinatorName && <span>Center lead: {pilot.coordinatorName}</span>}
                  </p>
                  {pilot?.notes && <p className="text-sm text-gray-600 mt-2 max-w-2xl">{pilot.notes}</p>}
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>Reporting window: <span className="font-medium text-gray-700">{data.period.start} to {data.period.end}</span></p>
                  <p className="mt-0.5">First activity {formatDate(s.firstEvent)} · last activity {formatDate(s.lastEvent)}</p>
                  <p className="mt-0.5">{fmt(s.activeDays)} active days</p>
                </div>
              </div>
            </section>

            {/* Headline numbers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users} tone="emerald" label="Patient sessions" value={s.sessions}
                sublabel={`${fmt(s.pilotArrivals)} arrived via the pilot page`}
                delta={prev ? { current: s.sessions, previous: prev.sessions } : undefined} />
              <StatCard icon={Link2} tone="blue" label="Program connections" value={s.connections}
                sublabel={`${fmt(byType.copay)} copay · ${fmt(byType.pap)} PAP · ${fmt(byType.foundation)} foundation`}
                delta={prev ? { current: s.connections, previous: prev.connections } : undefined} />
              <StatCard icon={ClipboardCheck} tone="purple" label="Quizzes completed" value={s.quizCompletes}
                sublabel={`${fmt(s.quizStarts)} started · ${funnel.quizCompleteRate}% finish rate`}
                delta={prev ? { current: s.quizCompletes, previous: prev.quizCompletes } : undefined} />
              <StatCard icon={Pill} tone="amber" label="Medication searches" value={s.medSearches}
                sublabel={`${fmt(s.pageViews)} page views`} />
            </div>

            {/* Goals */}
            <Section title="Pilot goals" icon={Target}
              aside={!pilot && <span className="text-xs text-gray-400">Set up the pilot to track goals</span>}>
              <div className="grid md:grid-cols-3 gap-6">
                <GoalRow label="Patients reached" actual={s.sessions} target={pilot?.targetPatients}
                  hint="Distinct browser sessions tagged with this center." />
                <GoalRow label="Program connections" actual={s.connections} target={pilot?.targetConnections}
                  hint="Clicks through to a copay card, PAP, or foundation." />
                <GoalRow label="Quizzes completed" actual={s.quizCompletes} target={pilot?.targetQuizCompletes}
                  hint="Patients who finished the savings quiz." />
              </div>
            </Section>

            {/* Funnel + weekly */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Section title="Patient journey" icon={Layers}>
                <div className="space-y-3">
                  <FunnelStep label="Page views" value={funnel.pageViews} maxValue={funnel.pageViews} color="bg-slate-400" isBase />
                  <FunnelStep label="Medication searched" value={funnel.medSearches} maxValue={funnel.pageViews} color="bg-amber-500" />
                  <FunnelStep label="Quiz started" value={funnel.quizStarts} maxValue={funnel.pageViews} color="bg-blue-500" />
                  <FunnelStep label="Quiz completed" value={funnel.quizCompletes} maxValue={funnel.pageViews} color="bg-purple-500" />
                  <FunnelStep label="Program connection" value={funnel.connections} maxValue={funnel.pageViews} color="bg-emerald-600" />
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Percentages are the share of page views. {funnel.quizCompleteRate}% of started quizzes were finished, and {funnel.sessionsToConnection}% of patient sessions included at least one program connection.
                </p>
              </Section>

              <Section title="Activity by week" icon={TrendingUp}>
                {data.weekly.length > 0 ? <WeeklyChart weeks={data.weekly} /> : <Empty>No activity in this window.</Empty>}
              </Section>
            </div>

            {/* Programs + medications */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Section title="Programs patients connected to" icon={Link2}>
                {data.programs.length > 0 ? (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase">
                        <th className="text-left pb-2 font-medium">Program</th>
                        <th className="text-left pb-2 font-medium">Type</th>
                        <th className="text-right pb-2 font-medium">Clicks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.programs.map((p) => (
                        <tr key={`${p.programId}-${p.programType}`}>
                          <td className="py-2 pr-2">
                            <div className="font-medium text-gray-900">{p.name}</div>
                            {p.manufacturer && <div className="text-xs text-gray-400">{p.manufacturer}</div>}
                          </td>
                          <td className="py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.programType === 'copay' ? 'bg-blue-100 text-blue-800'
                                : p.programType === 'foundation' ? 'bg-green-100 text-green-800'
                                : 'bg-purple-100 text-purple-800'}`}>
                              {p.programType}
                            </span>
                          </td>
                          <td className="py-2 text-right font-semibold text-gray-900 tabular-nums">{fmt(p.clicks)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <Empty>No program connections yet in this window.</Empty>}
              </Section>

              <Section title="Medications behind those connections" icon={Pill}>
                {data.medications.length > 0 ? (
                  <div className="space-y-3">
                    {data.medications.map((m) => (
                      <BarRow key={m.medication} label={m.medication} count={m.clicks}
                        total={data.medications[0].clicks} tone="amber" />
                    ))}
                    <p className="text-xs text-gray-400">Medication card the patient was on when they clicked. Not a patient list.</p>
                  </div>
                ) : <Empty>No medication-level connections yet.</Empty>}
              </Section>
            </div>

            {/* Who the patients are (aggregate, self-reported) */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Section title="Coverage reported" icon={ClipboardCheck}>
                {data.coverage.length > 0 ? (
                  <div className="space-y-3">
                    {data.coverage.map((c) => (
                      <BarRow key={c.value} label={labelFor(COVERAGE_LABELS, c.value)} count={c.count} total={coverageTotal} tone="blue" />
                    ))}
                  </div>
                ) : <Empty>No quiz answers yet.</Empty>}
              </Section>

              <Section title="Cost burden reported" icon={AlertTriangle}>
                {data.costBurden.length > 0 ? (
                  <div className="space-y-3">
                    {data.costBurden.map((c) => (
                      <BarRow key={c.value} label={labelFor(BURDEN_LABELS, c.value)} count={c.count} total={burdenTotal} tone="amber" />
                    ))}
                  </div>
                ) : <Empty>No quiz answers yet.</Empty>}
              </Section>

              <Section title="Language" icon={Globe}>
                {langTotal > 0 ? (
                  <div className="space-y-3">
                    <BarRow label="English" count={lang.en} total={langTotal} tone="emerald" />
                    <BarRow label="Spanish" count={lang.es} total={langTotal} tone="purple" />
                    {lang.unknown > 0 && <p className="text-xs text-gray-400">{fmt(lang.unknown)} events predate language tracking.</p>}
                  </div>
                ) : <Empty>No language data yet.</Empty>}
              </Section>
            </div>

            {/* Integration + satisfaction */}
            <div className="grid md:grid-cols-3 gap-4">
              <StatCard icon={Stethoscope} tone="teal" label="Epic / MyChart logins"
                value={data.ehrLogins ? data.ehrLogins.periodLogins : 0}
                sublabel={data.ehrLogins
                  ? `${fmt(data.ehrLogins.allTime)} all time · last ${formatDate(data.ehrLogins.lastLogin)}`
                  : 'Add the Epic org ID to the pilot to link EHR logins'} />
              <StatCard icon={Smartphone} tone="blue" label="MyChart medication imports" value={s.epicImports}
                sublabel={`${fmt(s.epicMatchedMeds)} medications matched to programs`} />
              <StatCard icon={ThumbsUp} tone="emerald" label="Found it helpful"
                value={helpfulTotal > 0 ? `${Math.round((s.helpfulYes / helpfulTotal) * 100)}%` : '—'}
                sublabel={helpfulTotal > 0 ? `${fmt(s.helpfulYes)} yes · ${fmt(s.helpfulNo)} no` : 'No feedback votes yet'} />
            </div>

            {/* Top pages */}
            <Section title="Where patients spent time" icon={Layers}>
              {data.sources.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                  {data.sources.map((p) => (
                    <BarRow key={p.page} label={p.page} count={p.views} total={data.sources[0].views} tone="slate" />
                  ))}
                </div>
              ) : <Empty>No page views yet.</Empty>}
            </Section>

            {/* How to read this */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-600 flex gap-3">
              <Info className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p><strong className="text-gray-800">How attribution works.</strong> A patient is counted for this center after arriving through <span className="font-mono">/pilot/{selected}</span> or a <span className="font-mono">?partner={selected}</span> link. The tag stays with them for the rest of that browser session.</p>
                <p><strong className="text-gray-800">What is not here.</strong> No names, MRNs, or medication lists. Counts are browser sessions, so one patient on two devices counts twice. Discount-card links (GoodRx, Cost Plus) are logged without the center tag and are not included.</p>
                <p><strong className="text-gray-800">For the pilot review.</strong> Use the pilot window range, export the CSV, and pair it with the center's own outcomes (fills, delays avoided, coordinator time).</p>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        type="confirm"
        title="Remove pilot record?"
        message={`This removes the pilot definition for ${pilot?.centerName || selected}. Patient events keep their center tag and can still be viewed here.`}
        confirmText="Remove"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </AdminLayout>
  );
}
