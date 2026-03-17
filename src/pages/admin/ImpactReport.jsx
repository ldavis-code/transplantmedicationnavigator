/**
 * Impact Report Page
 * Funder-ready metrics: patient reach, program connections, medication insights, growth trends
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Download, TrendingUp, Users, Heart, Pill,
  BarChart3, FileText, DollarSign, Mail,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';

const API = '/.netlify/functions/admin-impact';

export default function ImpactReport() {
  const { getToken, isAdmin } = useAuth();
  const { org } = useTenant();
  const [data, setData] = useState(null);
  const [days, setDays] = useState(90);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    fetch(`${API}?days=${days}`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.ok ? r.json() : Promise.reject('Failed to load'))
      .then(setData)
      .catch(e => setError(typeof e === 'string' ? e : e.message))
      .finally(() => setLoading(false));
  }, [isAdmin, days, getToken]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  const reach = data?.patientReach || {};
  const conn = data?.programConnections || {};
  const period = data?.period || {};

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b print:shadow-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-gray-500 hover:text-gray-700 print:hidden">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Impact Report</h1>
                <p className="text-sm text-gray-500">
                  {org?.name || 'Transplant Medication Navigator'} — {period.start} to {period.end}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 print:hidden">
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
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Print / PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
        )}

        {/* Hero Stats — The Funding Story */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Impact Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Patients Reached"
              value={reach.uniqueSessions}
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              icon={Heart}
              label="Program Connections"
              value={conn.total}
              sublabel="Patients linked to assistance"
              color="bg-green-50 text-green-600"
            />
            <StatCard
              icon={Pill}
              label="Medication Searches"
              value={conn.medSearches}
              color="bg-purple-50 text-purple-600"
            />
            <StatCard
              icon={BarChart3}
              label="Quiz Completions"
              value={conn.quizCompletions}
              sublabel={conn.quizStarts ? `${Math.round((conn.quizCompletions / conn.quizStarts) * 100)}% completion rate` : ''}
              color="bg-orange-50 text-orange-600"
            />
          </div>
        </section>

        {/* Program Connection Breakdown */}
        <section>
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

        {/* Top Programs */}
        {data?.topPrograms?.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Accessed Programs</h2>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Patient Clicks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.topPrograms.map((p, i) => (
                    <tr key={`${p.programId}-${i}`} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{p.programId}</td>
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
          <section>
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

        {/* Growth Trend */}
        {data?.weeklyTrend?.length > 0 && (
          <section>
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
                            className="bg-blue-500 h-full rounded-full transition-all"
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
        <section>
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
                <FileText className="h-5 w-5 text-purple-500" />
                <h3 className="font-medium text-gray-900">Partner Organizations</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{(reach.partnerOrgs || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Active in this period</p>
            </div>
          </div>
        </section>

        {/* Print footer */}
        <div className="hidden print:block text-center text-xs text-gray-400 mt-8 pt-4 border-t">
          Generated by Transplant Medication Navigator — {new Date().toLocaleDateString()}
        </div>
      </main>
    </div>
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
