/**
 * Impact Report Page
 * Funder-ready metrics: Netlify traffic, conversion funnel, program connections, medication insights
 */

import { useState, useEffect } from 'react';
import {
  ArrowLeft, Download, TrendingUp, Users, Heart, Pill,
  BarChart3, FileText, DollarSign, Mail, Globe, Eye,
  ExternalLink, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import AdminLayout from './AdminLayout';

const API = '/.netlify/functions/admin-impact';

export default function ImpactReport() {
  const { getToken, isAdmin } = useAuth();
  const { org } = useTenant();
  const [data, setData] = useState(null);
  const [days, setDays] = useState(90);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      setError('You must be logged in as an admin to view the Impact Report.');
      return;
    }
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) {
      setLoading(false);
      setError('No auth token found. Please log in at /admin/login first.');
      return;
    }
    fetch(`${API}?days=${days}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error || `Server returned ${r.status}`);
        }
        return r.json();
      })
      .then(setData)
      .catch(e => setError(e.message || 'Failed to load impact data'))
      .finally(() => setLoading(false));
  }, [isAdmin, days, getToken]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <AdminLayout title="Impact Report">
        <div className="flex items-center justify-center py-20" role="status">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006838]" />
          <span className="sr-only">Loading impact report...</span>
        </div>
      </AdminLayout>
    );
  }

  const traffic = data?.traffic || {};
  const conn = data?.programConnections || {};
  const funnel = data?.funnel || {};
  const period = data?.period || {};
  const sources = data?.dataSources || {};
  const hasNetlify = sources.netlify;
  const hasDb = sources.database;
  const noData = data?.dataSource === 'none';

  return (
    <AdminLayout
      title="Impact Report"
      subtitle={`${org?.name || 'TMN'} — ${period.start} to ${period.end}`}
    >
      {/* Controls */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 6 months</option>
            <option value={365}>Last year</option>
          </select>
          <div className="flex items-center gap-2 flex-wrap">
            {hasNetlify && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full">
                <Globe className="h-3 w-3" /> Netlify Analytics
              </span>
            )}
            {hasDb && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                <BarChart3 className="h-3 w-3" /> Database Events
              </span>
            )}
            {!hasNetlify && !noData && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full">
                Add NETLIFY_API_TOKEN for traffic data
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-[#006838] text-white rounded-lg text-sm hover:bg-[#005530]"
        >
          <Download className="h-4 w-4" />
          Print / PDF
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">{error}</div>
      )}

      {/* Hero Stats — Site Traffic */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Site Traffic</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Eye}
            label="Page Views"
            value={traffic.pageviews}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={Users}
            label="Unique Visitors"
            value={traffic.uniqueVisitors}
            color="bg-green-50 text-green-600"
          />
          <StatCard
            icon={Pill}
            label="Medication Searches"
            value={conn.medSearches}
            color="bg-purple-50 text-purple-600"
          />
          <StatCard
            icon={Heart}
            label="Program Connections"
            value={conn.total}
            sublabel="Patients linked to assistance"
            color="bg-orange-50 text-orange-600"
          />
        </div>
      </section>

      {/* Conversion Funnel */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h2>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="space-y-3">
            <FunnelStep label="Page Views" value={funnel.pageViews} maxValue={funnel.pageViews} color="bg-blue-500" />
            <FunnelStep label="Quiz Starts" value={funnel.quizStarts} maxValue={funnel.pageViews} color="bg-indigo-500"
              rate={funnel.pageViews > 0 ? Math.round((funnel.quizStarts / funnel.pageViews) * 100) : 0} />
            <FunnelStep label="Quiz Completions" value={funnel.quizCompletes} maxValue={funnel.pageViews} color="bg-purple-500"
              rate={funnel.quizStarts > 0 ? Math.round((funnel.quizCompletes / funnel.quizStarts) * 100) : 0} />
            <FunnelStep label="Medication Searches" value={funnel.medSearches} maxValue={funnel.pageViews} color="bg-green-500"
              rate={funnel.quizCompletes > 0 ? Math.round((funnel.medSearches / funnel.quizCompletes) * 100) : 0} />
            <FunnelStep label="Application Clicks" value={funnel.applicationClicks} maxValue={funnel.pageViews} color="bg-orange-500"
              rate={funnel.medSearches > 0 ? Math.round((funnel.applicationClicks / funnel.medSearches) * 100) : 0} />
          </div>
        </div>
      </section>

      {/* Top Pages & Sources (Netlify data) */}
      {hasNetlify && (traffic.topPages?.length > 0 || traffic.topSources?.length > 0) && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Traffic Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Pages */}
            {traffic.topPages?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" /> Top Pages
                </h3>
                <div className="space-y-2">
                  {traffic.topPages.slice(0, 10).map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 truncate flex-1 mr-3">{p.path}</span>
                      <span className="text-gray-500 font-medium whitespace-nowrap">{p.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Sources */}
            {traffic.topSources?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-gray-400" /> Top Referral Sources
                </h3>
                <div className="space-y-2">
                  {traffic.topSources.slice(0, 10).map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 truncate flex-1 mr-3">{s.source}</span>
                      <span className="text-gray-500 font-medium whitespace-nowrap">{s.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Program Connection Breakdown */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assistance Program Connections</h2>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm text-gray-600 mb-4">
            Patients connected to financial assistance programs in the last {days} days:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProgramCard
              label="Copay Card Programs"
              value={conn.copay}
              total={conn.total}
              description="Manufacturer copay assistance for commercially insured patients"
              color="bg-blue-500"
            />
            <ProgramCard
              label="Foundation Grants"
              value={conn.foundation}
              total={conn.total}
              description="Non-profit grants covering copays, premiums, and travel costs"
              color="bg-green-500"
            />
            <ProgramCard
              label="Patient Assistance (PAP)"
              value={conn.pap}
              total={conn.total}
              description="Free medication programs for uninsured or underinsured patients"
              color="bg-purple-500"
            />
          </div>
        </div>
      </section>

      {/* Connections by Company */}
      {data?.connectionsByCompany?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Program Connections by Company</h2>
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Copay Cards</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">PAP</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Foundations</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.connectionsByCompany.map((c, i) => (
                  <tr key={`${c.company}-${i}`} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{c.company}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-600">{c.copay.toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-600">{c.pap.toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-600">{c.foundation.toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-900 font-bold">{c.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Top Programs */}
      {data?.topPrograms?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Accessed Programs</h2>
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Patient Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.topPrograms.map((p, i) => (
                  <tr key={`${p.programId}-${i}`} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{p.programId}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{p.manufacturer || '—'}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.programType === 'copay' ? 'bg-blue-100 text-blue-800' :
                        p.programType === 'foundation' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {p.programType}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-right text-gray-900 font-medium">
                      {p.clicks.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Medication Insights */}
      {data?.medicationInsights?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Medications by Patient Interest</h2>
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medication</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Searches</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Views</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Program Clicks</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Saved to List</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.medicationInsights.map(med => (
                  <tr key={med.name} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{med.name}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-600">{med.searches.toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-600">{med.views.toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-600">{med.clicks.toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-600">{med.adds.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Weekly Growth Trend */}
      {data?.weeklyTrend?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Growth Trend</h2>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="space-y-2">
              {data.weeklyTrend.map((w, i) => {
                const maxSessions = Math.max(...data.weeklyTrend.map(t => t.uniqueSessions), 1);
                const pct = Math.round((w.uniqueSessions / maxSessions) * 100);
                const weekLabel = new Date(w.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                  <div key={i} className="flex items-center gap-4 text-sm">
                    <span className="w-20 text-gray-500 text-right">{weekLabel}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div
                          className="bg-[#006838] h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-gray-700 font-medium">{w.uniqueSessions}</span>
                    </div>
                    <span className="w-20 text-right text-green-600 text-xs">
                      {w.programConnections} conn.
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-4 pt-3 border-t text-xs text-gray-400">
              <span>Sessions per week</span>
              <span>Green = program connections</span>
            </div>
          </div>
        </section>
      )}

      {/* Additional Metrics */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Impact Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-5">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <h3 className="font-medium text-gray-900">Community Price Reports</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{(data?.communityPricing?.totalReports || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">
              Across {data?.communityPricing?.uniqueMedications || 0} medications
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-5">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium text-gray-900">Email Leads Captured</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{(data?.emailLeads || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">From quiz completions</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-5">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <h3 className="font-medium text-gray-900">Partner Organizations</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{(data?.patientReach?.partnerOrgs || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Active in this period</p>
          </div>
        </div>
      </section>

      {/* Print footer */}
      <div className="hidden print:block text-center text-xs text-gray-400 mt-8 pt-4 border-t">
        Generated by Transplant Medication Navigator — {new Date().toLocaleDateString()}
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value, sublabel, color }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-5">
      <div className={`inline-flex p-2 rounded-lg mb-3 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{(value || 0).toLocaleString()}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}

function FunnelStep({ label, value, maxValue, color, rate }) {
  const pct = maxValue > 0 ? Math.max(Math.round((value / maxValue) * 100), 2) : 2;
  return (
    <div className="flex items-center gap-4">
      <span className="w-40 text-sm text-gray-700 text-right">{label}</span>
      <div className="flex-1">
        <div className="bg-gray-100 rounded-full h-7 overflow-hidden">
          <div className={`${color} h-full rounded-full flex items-center justify-end pr-2 transition-all`} style={{ width: `${pct}%` }}>
            <span className="text-xs text-white font-medium">{(value || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
      {rate !== undefined && (
        <span className="w-16 text-xs text-gray-500 flex items-center gap-1">
          <ArrowRight className="h-3 w-3" /> {rate}%
        </span>
      )}
    </div>
  );
}

function ProgramCard({ label, value, total, description, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-medium text-gray-900 text-sm">{label}</h3>
        <span className="text-lg font-bold text-gray-900">{(value || 0).toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
        <div className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}
