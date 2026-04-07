/**
 * Analytics Dashboard
 * Shows funnel metrics, events by partner/program, and CSV export
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, TrendingUp, Users, MousePointerClick, Filter, ClipboardList, Mail, Pill } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = '/.netlify/functions/admin-api';

export default function Analytics() {
  const { getToken, isAdmin } = useAuth();
  const [funnel, setFunnel] = useState(null);
  const [byPartner, setByPartner] = useState([]);
  const [byProgram, setByProgram] = useState([]);
  const [partners, setPartners] = useState([]);
  const [quizAnalytics, setQuizAnalytics] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authHeaders = { Authorization: `Bearer ${getToken()}` };

  useEffect(() => {
    if (!isAdmin) return;
    async function load() {
      try {
        const [funnelRes, partnerRes, programRes, partnersRes, quizRes] = await Promise.all([
          fetch(`${API}/funnel${selectedPartner ? `?partner=${selectedPartner}` : ''}`, { headers: authHeaders }),
          fetch(`${API}/events/by-partner`, { headers: authHeaders }),
          fetch(`${API}/events/by-program`, { headers: authHeaders }),
          fetch(`${API}/partners`, { headers: authHeaders }),
          fetch(`${API}/quiz-analytics`, { headers: authHeaders }),
        ]);

        if (funnelRes.ok) setFunnel(await funnelRes.json());
        if (partnerRes.ok) setByPartner(await partnerRes.json());
        if (programRes.ok) setByProgram(await programRes.json());
        if (partnersRes.ok) setPartners(await partnersRes.json());
        if (quizRes.ok) setQuizAnalytics(await quizRes.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAdmin, selectedPartner]);

  const handleExport = () => {
    const url = `${API}/export/csv${selectedPartner ? `?partner=${selectedPartner}` : ''}`;
    const a = document.createElement('a');
    a.href = url;
    // We need auth header so use fetch
    fetch(url, { headers: authHeaders })
      .then(r => r.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `events_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={selectedPartner}
                  onChange={(e) => setSelectedPartner(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
                >
                  <option value="">All Partners</option>
                  {partners.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
        )}

        {/* Funnel Metrics */}
        {funnel && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Conversion Funnel
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Page Views', value: funnel.pageViews },
                { label: 'Quiz Starts', value: funnel.quizStarts, rate: `${funnel.quizStartRate}%` },
                { label: 'Quiz Completes', value: funnel.quizCompletes, rate: `${funnel.quizCompleteRate}%` },
                { label: 'Med Searches', value: funnel.medSearches, rate: `${funnel.medSearchRate}%` },
                { label: 'App Clicks', value: funnel.applicationClicks, rate: `${funnel.applicationClickRate}%` },
              ].map(step => (
                <div key={step.label} className="bg-white rounded-lg shadow-sm border p-4">
                  <p className="text-sm text-gray-500">{step.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{step.value.toLocaleString()}</p>
                  {step.rate && (
                    <p className="text-xs text-green-600 mt-1">{step.rate} conversion</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quiz Results (from Supabase) */}
        {quizAnalytics?.available && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-teal-500" />
              Quiz Results
              <span className="text-xs font-normal text-gray-400 ml-1">(Supabase)</span>
            </h2>

            {/* Quiz summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <p className="text-sm text-gray-500">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{quizAnalytics.totalLeads.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">All time</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <p className="text-sm text-gray-500">This Week / Month</p>
                <p className="text-2xl font-bold text-gray-900">{quizAnalytics.leadsThisWeek}</p>
                <p className="text-xs text-gray-400 mt-1">{quizAnalytics.leadsThisMonth} this month</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <p className="text-sm text-gray-500">Converted to User</p>
                <p className="text-2xl font-bold text-gray-900">{quizAnalytics.convertedLeads}</p>
                <p className="text-xs text-green-600 mt-1">{quizAnalytics.conversionRate}% conversion</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <p className="text-sm text-gray-500">Marketing Opt-ins</p>
                <p className="text-2xl font-bold text-gray-900">{quizAnalytics.marketingOptIns}</p>
                <p className="text-xs text-blue-600 mt-1">{quizAnalytics.optInRate}% opt-in rate</p>
              </div>
            </div>

            {/* Top Medications */}
            {quizAnalytics.topMedications?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                  <Pill className="h-4 w-4 text-teal-400" />
                  Top Medications Selected
                </h3>
                <div className="flex flex-wrap gap-2">
                  {quizAnalytics.topMedications.map(med => (
                    <span
                      key={med.name}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm border border-teal-200"
                    >
                      {med.name}
                      <span className="text-xs text-teal-500 font-medium">({med.count})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Quiz Leads */}
            {quizAnalytics.recentLeads?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Recent Quiz Leads</span>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medications</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Opt-in</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Converted</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {quizAnalytics.recentLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{lead.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {lead.medications.length > 0
                            ? lead.medications.slice(0, 3).join(', ') + (lead.medications.length > 3 ? ` +${lead.medications.length - 3}` : '')
                            : '—'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            lead.marketingOptIn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {lead.marketingOptIn ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            lead.converted ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {lead.converted ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-right">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Events by Partner */}
        {byPartner.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Events by Partner
            </h2>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">This Week</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">This Month</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">All Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Top Program</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {byPartner.map(row => (
                    <tr key={row.partner} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.partner}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.thisWeek.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.thisMonth.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.allTime.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{row.topProgram || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Events by Program */}
        {byProgram.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MousePointerClick className="h-5 w-5 text-purple-500" />
              Events by Program
            </h2>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">This Week</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">This Month</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">All Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {byProgram.map(row => (
                    <tr key={`${row.programId}-${row.programType}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.programId}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          row.programType === 'copay' ? 'bg-blue-100 text-blue-800' :
                          row.programType === 'foundation' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {row.programType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.thisWeek.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.thisMonth.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.allTime.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {!funnel && byPartner.length === 0 && byProgram.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No analytics data yet</p>
            <p className="text-sm mt-1">Events will appear here as users interact with your site.</p>
          </div>
        )}
      </main>
    </div>
  );
}
