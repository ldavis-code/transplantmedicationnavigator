/**
 * Insights Page
 *
 * Surfaces data that was being captured but never shown in admin:
 *  - Patient-logged savings totals (user_savings)
 *  - Most-requested medications NOT in the catalog (missing_medications)
 *  - MyChart / Epic import adoption + engagement events (events)
 *  - Patient feedback outcomes (Supabase feedback table)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, DollarSign, PlusCircle, Smartphone, MessageSquare, Pill, TrendingUp,
  HeartHandshake,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = '/.netlify/functions/admin-api';

const money = (n) =>
  (n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const PROGRAM_LABELS = {
  copay_card: 'Copay cards',
  copay: 'Copay cards',
  pap: 'Patient assistance',
  foundation: 'Foundation grants',
  discount_card: 'Discount cards',
  negotiated_price: 'Negotiated price',
  other: 'Other',
};

function StatCard({ icon: Icon, label, value, sublabel, tone = 'emerald' }) {
  const tones = {
    emerald: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
    </div>
  );
}

// Horizontal share bar for a single category (count + % of total).
function BarRow({ label, count, total, tone = 'emerald', emphasize = false }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const bar = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-400',
  }[tone];
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className={emphasize ? 'font-semibold text-gray-900' : 'text-gray-700'}>{label}</span>
        <span className="text-gray-500 tabular-nums">{count} · {pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
        {Icon && <Icon className="h-5 w-5 text-gray-400" />} {title}
      </h2>
      {children}
    </section>
  );
}

export default function Insights() {
  const { getToken, isAdmin } = useAuth();
  const [savings, setSavings] = useState(null);
  const [missing, setMissing] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [stats, setStats] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    const authHeaders = { Authorization: `Bearer ${getToken()}` };
    async function load() {
      try {
        const [s, m, f, st, cov] = await Promise.all([
          fetch(`${API}/savings-summary`, { headers: authHeaders }).then(r => r.json()),
          fetch(`${API}/missing-medications`, { headers: authHeaders }).then(r => r.json()),
          fetch(`${API}/feedback-summary`, { headers: authHeaders }).then(r => r.json()),
          fetch(`${API}/stats`, { headers: authHeaders }).then(r => r.json()),
          fetch(`${API}/coverage-mix`, { headers: authHeaders }).then(r => r.json()),
        ]);
        setSavings(s); setMissing(m); setFeedback(f); setStats(st); setCoverage(cov);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAdmin, getToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  const helpfulTotal = (stats?.helpfulVotesYes || 0) + (stats?.helpfulVotesNo || 0);
  const helpfulRate = helpfulTotal > 0 ? Math.round((stats.helpfulVotesYes / helpfulTotal) * 100) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <Link to="/admin" className="text-gray-500 hover:text-gray-700" aria-label="Back to dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Insights</h1>
              <p className="text-sm text-gray-500">Patient savings, demand signals, feature adoption &amp; feedback</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
        )}

        {/* IOTA-aligned impact: the one-glance story for transplant programs */}
        <section className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
          <div className="flex items-center gap-2 mb-1">
            <HeartHandshake className="h-5 w-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-gray-900">IOTA-Aligned Impact</h2>
          </div>
          <p className="text-sm text-gray-600 mb-5">
            How this tool maps to your Increasing Organ Transplant Access (IOTA) performance. Cost-driven non-adherence is a leading modifiable cause of graft loss, so removing cost barriers supports both the Quality domain and your Health Equity Plan.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Quality domain: cost -> adherence -> graft survival */}
            <div className="rounded-lg bg-white border border-emerald-100 p-5">
              <div className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-3">Quality domain · graft survival</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-700">{helpfulRate !== null ? `${helpfulRate}%` : 'N/A'}</div>
                  <div className="text-[11px] text-gray-500 mt-1 leading-tight">Got their medication</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{savings?.available ? money(savings.totalSaved) : 'N/A'}</div>
                  <div className="text-[11px] text-gray-500 mt-1 leading-tight">Patient cost removed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-rose-600">{coverage?.available ? `${coverage.highBurdenPct}%` : 'N/A'}</div>
                  <div className="text-[11px] text-gray-500 mt-1 leading-tight">Faced unaffordable cost</div>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-3 leading-snug">Affording immunosuppressants is what keeps patients adherent, and adherence is what protects the graft-survival measure that drives the IOTA Quality score.</p>
            </div>
            {/* Health Equity Plan: underserved reach */}
            <div className="rounded-lg bg-white border border-emerald-100 p-5">
              <div className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-3">Health Equity Plan · reach</div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-700">{coverage?.available ? `${coverage.underservedPct}%` : 'N/A'}</div>
                  <div className="text-[11px] text-gray-500 mt-1 leading-tight">Medicaid, IHS/Tribal, or uninsured</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{coverage?.available ? coverage.underservedCount : 'N/A'}</div>
                  <div className="text-[11px] text-gray-500 mt-1 leading-tight">Underserved patients reached</div>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-3 leading-snug">A free, no-PHI cost-barrier tool for low-income and public-payer patients is a concrete intervention you can document in your voluntary IOTA Health Equity Plan.</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-4">Mapping is directional; confirm against your program's IOTA measures. Figures are anonymous aggregates, no identity or PHI.</p>
        </section>

        {/* Headline metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={DollarSign} tone="emerald" label="Total patient savings"
            value={savings?.available ? money(savings.totalSaved) : 'N/A'}
            sublabel={savings?.available ? `${savings.totalEntries} logs · ${savings.uniquePatients} patients` : 'No savings logged yet'}
          />
          <StatCard
            icon={Smartphone} tone="blue" label="MyChart imports"
            value={stats?.epicImports ?? 0}
            sublabel={`${stats?.epicImportsThisMonth ?? 0} this month`}
          />
          <StatCard
            icon={PlusCircle} tone="amber" label="Missing meds requested"
            value={missing?.available ? missing.total : 'N/A'}
            sublabel={missing?.available ? 'Drugs searched but not in catalog' : 'None recorded yet'}
          />
          <StatCard
            icon={TrendingUp} tone="purple" label='"Got my medication"'
            value={helpfulRate !== null ? `${helpfulRate}%` : 'N/A'}
            sublabel={helpfulTotal > 0 ? `${helpfulTotal} responses` : 'No responses yet'}
          />
        </div>

        {/* Patient savings */}
        <Section title="Patient Savings" icon={DollarSign}>
          {savings?.available && savings.totalEntries > 0 ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div><div className="text-2xl font-bold text-emerald-700">{money(savings.totalSaved)}</div><div className="text-xs text-gray-500">Total saved</div></div>
                <div><div className="text-2xl font-bold text-gray-900">{savings.totalEntries}</div><div className="text-xs text-gray-500">Savings logged</div></div>
                <div><div className="text-2xl font-bold text-gray-900">{savings.uniquePatients}</div><div className="text-xs text-gray-500">Patients</div></div>
                <div><div className="text-2xl font-bold text-gray-900">{money(savings.avgSavedPerFill)}</div><div className="text-xs text-gray-500">Avg / fill</div></div>
              </div>
              {savings.byProgram?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Savings by program type</h3>
                  <div className="space-y-1.5">
                    {savings.byProgram.map((p) => (
                      <div key={p.programType} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{PROGRAM_LABELS[p.programType] || p.programType} <span className="text-gray-400">({p.entries})</span></span>
                        <span className="font-semibold text-emerald-700">{money(p.saved)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No patient savings logged yet. Patients log savings from the Savings Tracker.</p>
          )}
        </Section>

        {/* Missing medications */}
        <Section title="Most-Requested Missing Medications" icon={PlusCircle}>
          {missing?.available && missing.medications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-4 font-medium">Medication searched</th>
                    <th className="py-2 pr-4 font-medium text-right">Requests</th>
                    <th className="py-2 font-medium">Last requested</th>
                  </tr>
                </thead>
                <tbody>
                  {missing.medications.map((m) => (
                    <tr key={m.nameNormalized} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-gray-900 font-medium">{m.displayName}</td>
                      <td className="py-2 pr-4 text-right"><span className="inline-block bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 font-semibold">{m.requestCount}</span></td>
                      <td className="py-2 text-gray-500">{m.lastSeen ? new Date(m.lastSeen).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-3">Ranked by how often patients searched for a drug not in the catalog. This is your "what to add next" list.</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No missing-medication requests recorded yet.</p>
          )}
        </Section>

        {/* Engagement events */}
        <Section title="Feature Adoption & Engagement" icon={Smartphone}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div><div className="text-2xl font-bold text-blue-700">{stats?.epicImports ?? 0}</div><div className="text-xs text-gray-500">MyChart imports (all time)</div></div>
            <div><div className="text-2xl font-bold text-gray-900">{stats?.resourceViews ?? 0}</div><div className="text-xs text-gray-500">Resource views</div></div>
            <div><div className="text-2xl font-bold text-emerald-700">{stats?.helpfulVotesYes ?? 0}</div><div className="text-xs text-gray-500">Got medication (yes)</div></div>
            <div><div className="text-2xl font-bold text-gray-900">{stats?.helpfulVotesNo ?? 0}</div><div className="text-xs text-gray-500">Did not (no)</div></div>
          </div>
        </Section>

        {/* Coverage mix & cost burden: the Health Equity story for IOTA */}
        <Section title="Coverage Mix & Cost Burden (Health Equity)" icon={HeartHandshake}>
          {coverage?.available && (coverage.coverageTotal > 0 || coverage.burdenTotal > 0) ? (
            <div className="space-y-6">
              {/* Equity headline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-3xl font-bold text-emerald-700">{coverage.underservedPct}%</div>
                  <div className="text-sm font-medium text-emerald-900 mt-1">On Medicaid, IHS/Tribal, or uninsured</div>
                  <div className="text-xs text-emerald-700 mt-1">{coverage.underservedCount} of {coverage.coverageTotal} patients who shared coverage. Cite this in your IOTA Health Equity Plan.</div>
                </div>
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                  <div className="text-3xl font-bold text-rose-700">{coverage.highBurdenPct}%</div>
                  <div className="text-sm font-medium text-rose-900 mt-1">Report costs unaffordable or in crisis</div>
                  <div className="text-xs text-rose-700 mt-1">{coverage.highBurdenCount} of {coverage.burdenTotal} patients who shared cost burden.</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {coverage.coverage?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Insurance type selected ({coverage.coverageTotal})</h3>
                    <div className="space-y-2.5">
                      {coverage.coverage.map((r) => {
                        const underserved = ['Medicaid (State)', 'Indian Health Service / Tribal', 'Uninsured / Self-pay'].includes(r.insuranceType);
                        return (
                          <BarRow
                            key={r.insuranceType}
                            label={r.insuranceType}
                            count={r.count}
                            total={coverage.coverageTotal}
                            tone={underserved ? 'rose' : 'blue'}
                            emphasize={underserved}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
                {coverage.costBurden?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Reported cost burden ({coverage.burdenTotal})</h3>
                    <div className="space-y-2.5">
                      {coverage.costBurden.map((r) => {
                        const tone = { Manageable: 'emerald', Challenging: 'amber', Unaffordable: 'rose', Crisis: 'rose' }[r.financialStatus] || 'slate';
                        return (
                          <BarRow
                            key={r.financialStatus}
                            label={r.financialStatus}
                            count={r.count}
                            total={coverage.burdenTotal}
                            tone={tone}
                            emphasize={r.financialStatus === 'Unaffordable' || r.financialStatus === 'Crisis'}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400">Anonymous, aggregate quiz selections. No identity or PHI is stored. These counts show who the tool reaches and how heavy their medication cost burden is.</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No coverage or cost-burden selections recorded yet. These populate as patients choose their insurance type and cost situation in the quiz.</p>
          )}
        </Section>

        {/* Patient feedback */}
        <Section title="Patient Feedback" icon={MessageSquare}>
          {feedback?.available && feedback.total > 0 ? (
            <div className="space-y-5">
              <p className="text-sm text-gray-500">{feedback.total} feedback response{feedback.total !== 1 ? 's' : ''}</p>
              {feedback.recentComments?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Recent comments</h3>
                  <div className="space-y-2">
                    {feedback.recentComments.map((c, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                        <p className="text-gray-800">"{c.comment}"</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {c.medication ? `${c.medication} · ` : ''}{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {feedback?.available === false && !feedback?.total
                ? 'Feedback storage is not configured (Supabase), or no feedback has been submitted yet.'
                : 'No patient feedback yet.'}
            </p>
          )}
        </Section>
      </main>
    </div>
  );
}
