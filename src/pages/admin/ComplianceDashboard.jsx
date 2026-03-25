/**
 * Compliance Dashboard
 * Medication adherence monitoring, risk stratification, and audit logging
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, AlertTriangle, Users, Pill, TrendingUp,
  ChevronDown, ChevronUp, Clock, FileText, Activity,
  Download, RefreshCw, Settings, MessageSquare, Phone,
  UserCheck, Send, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import AdminLayout from './AdminLayout';

const API = '/.netlify/functions/admin-compliance';

const RISK_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', border: 'border-red-200' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500', border: 'border-orange-200' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', border: 'border-yellow-200' },
  low: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', border: 'border-green-200' },
};

function RiskBadge({ level }) {
  const colors = RISK_COLORS[level] || RISK_COLORS.low;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, subtitle, color = 'text-[#006838]' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function AdherenceBar({ rate }) {
  const pct = Math.max(0, Math.min(100, rate));
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : pct >= 40 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: pct + '%' }} />
      </div>
      <span className="text-sm font-medium text-gray-700 w-12 text-right">{pct}%</span>
    </div>
  );
}

export default function ComplianceDashboard() {
  const { getToken, isAdmin } = useAuth();
  const { org } = useTenant();
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [patients, setPatients] = useState(null);
  const [trends, setTrends] = useState(null);
  const [auditLog, setAuditLog] = useState(null);
  const [riskFilter, setRiskFilter] = useState('');
  const [patientPage, setPatientPage] = useState(1);
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [settings, setSettings] = useState(null);
  const [editingSettings, setEditingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ criticalThreshold: 50, highThreshold: 70, mediumThreshold: 85 });
  const [interventionModal, setInterventionModal] = useState(null);
  const [interventionForm, setInterventionForm] = useState({ interventionType: 'phone_call', notes: '', outcome: '' });
  const [patientInterventions, setPatientInterventions] = useState({});
  const [savingIntervention, setSavingIntervention] = useState(false);

  const fetchData = useCallback(async (endpoint, extraParams) => {
    const token = getToken();
    if (!token) throw new Error('No auth token');
    const url = API + '/' + endpoint + '?days=' + days + (extraParams || '');
    const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Server returned ' + res.status);
    }
    return res.json();
  }, [days, getToken]);

  const postData = useCallback(async (endpoint, data) => {
    const token = getToken();
    if (!token) throw new Error('No auth token');
    const res = await fetch(API + '/' + endpoint, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Server returned ' + res.status);
    }
    return res.json();
  }, [getToken]);

  // Load summary data
  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      setError('You must be logged in as an admin.');
      return;
    }
    setLoading(true);
    setError(null);
    fetchData('summary')
      .then(setSummary)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [isAdmin, days, fetchData]);

  // Load patients when tab is active
  useEffect(() => {
    if (activeTab !== 'patients' || !isAdmin) return;
    const params = '&page=' + patientPage + (riskFilter ? '&risk=' + riskFilter : '');
    fetchData('patients', params).then(setPatients).catch(console.error);
  }, [activeTab, isAdmin, patientPage, riskFilter, fetchData]);

  // Load trends when tab is active
  useEffect(() => {
    if (activeTab !== 'trends' || !isAdmin) return;
    fetchData('trends').then(setTrends).catch(console.error);
  }, [activeTab, isAdmin, fetchData]);

  // Load audit log when tab is active
  useEffect(() => {
    if (activeTab !== 'audit' || !isAdmin) return;
    fetchData('audit-log').then(setAuditLog).catch(console.error);
  }, [activeTab, isAdmin, fetchData]);

  // Load settings when tab is active
  useEffect(() => {
    if (activeTab !== 'settings' || !isAdmin) return;
    fetchData('settings')
      .then(s => {
        setSettings(s);
        setSettingsForm({
          criticalThreshold: s.critical_threshold,
          highThreshold: s.high_threshold,
          mediumThreshold: s.medium_threshold,
        });
      })
      .catch(console.error);
  }, [activeTab, isAdmin, fetchData]);

  // Load interventions for expanded patient
  useEffect(() => {
    if (!expandedPatient || !isAdmin) return;
    fetchData('interventions', '&patient_id=' + expandedPatient)
      .then(data => setPatientInterventions(prev => ({ ...prev, [expandedPatient]: data.interventions || [] })))
      .catch(console.error);
  }, [expandedPatient, isAdmin, fetchData]);

  const handleSaveSettings = async () => {
    try {
      const result = await postData('settings', settingsForm);
      setSettings(result);
      setEditingSettings(false);
    } catch (e) {
      alert('Failed to save settings: ' + e.message);
    }
  };

  const handleSubmitIntervention = async () => {
    if (!interventionModal || !interventionForm.notes.trim()) return;
    setSavingIntervention(true);
    try {
      await postData('interventions', {
        patientId: interventionModal,
        interventionType: interventionForm.interventionType,
        notes: interventionForm.notes,
        outcome: interventionForm.outcome || null,
      });
      // Reload interventions for this patient
      const data = await fetchData('interventions', '&patient_id=' + interventionModal);
      setPatientInterventions(prev => ({ ...prev, [interventionModal]: data.interventions || [] }));
      setInterventionModal(null);
      setInterventionForm({ interventionType: 'phone_call', notes: '', outcome: '' });
    } catch (e) {
      alert('Failed to save intervention: ' + e.message);
    } finally {
      setSavingIntervention(false);
    }
  };

  const handleRefresh = () => {
    setSummary(null);
    setPatients(null);
    setTrends(null);
    setAuditLog(null);
    setLoading(true);
    setError(null);
    fetchData('summary')
      .then(setSummary)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  const handleExportAudit = async () => {
    try {
      const token = getToken();
      await fetch(API + '/audit-log', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export', details: { type: 'compliance_dashboard', days } }),
      });
    } catch (e) {
      // audit logging is best-effort
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Compliance Dashboard">
        <div className="flex items-center justify-center py-20" role="status">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006838]" />
          <span className="sr-only">Loading compliance data...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Compliance Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-red-800 font-medium">{error}</p>
          {error.includes('Unauthorized') ? (
            <p className="text-red-600 text-sm mt-2">
              Please log in with an admin account to access the compliance dashboard.
            </p>
          ) : (
            <p className="text-red-600 text-sm mt-2">
              If this error persists, please contact support or check that the database is properly configured.
            </p>
          )}
        </div>
      </AdminLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'audit', label: 'Audit Log', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <AdminLayout
      title="Compliance Dashboard"
      subtitle="Medication adherence monitoring and risk stratification"
      actions={
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={e => setDays(parseInt(e.target.value))}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#006838]"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      }
    >
      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Users}
            label="Total Patients"
            value={summary.totalPatients.toLocaleString()}
            subtitle={'Tracked in last ' + days + ' days'}
          />
          <StatCard
            icon={ShieldCheck}
            label="Avg Adherence Rate"
            value={summary.avgAdherenceRate + '%'}
            subtitle={summary.totalTaken.toLocaleString() + ' of ' + summary.totalScheduled.toLocaleString() + ' doses taken'}
            color={summary.avgAdherenceRate >= 80 ? 'text-green-600' : summary.avgAdherenceRate >= 60 ? 'text-yellow-600' : 'text-red-600'}
          />
          <StatCard
            icon={AlertTriangle}
            label="High/Critical Risk"
            value={summary.criticalCount + summary.highRiskCount}
            subtitle={summary.criticalCount + ' critical, ' + summary.highRiskCount + ' high'}
            color="text-red-600"
          />
          <StatCard
            icon={Pill}
            label="Doses Missed"
            value={summary.totalMissed.toLocaleString()}
            subtitle={summary.totalLate.toLocaleString() + ' taken late'}
            color="text-orange-600"
          />
        </div>
      )}

      {/* Immunosuppressant Alert */}
      {summary && summary.immunosuppressants && summary.immunosuppressants.patientsTracked > 0 && (
        <div className={'rounded-xl border p-5 mb-6 ' + (summary.immunosuppressants.highRiskCount > 0 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200')}>
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className={'h-5 w-5 ' + (summary.immunosuppressants.highRiskCount > 0 ? 'text-red-600' : 'text-blue-600')} />
            <h3 className="text-sm font-semibold text-gray-900">Immunosuppressant Adherence</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">High Priority</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Patients Tracked</p>
              <p className="text-lg font-bold text-gray-900">{summary.immunosuppressants.patientsTracked}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg Adherence</p>
              <p className={'text-lg font-bold ' + (summary.immunosuppressants.avgAdherence >= 80 ? 'text-green-600' : summary.immunosuppressants.avgAdherence >= 60 ? 'text-yellow-600' : 'text-red-600')}>
                {summary.immunosuppressants.avgAdherence}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Doses Missed</p>
              <p className="text-lg font-bold text-red-600">{summary.immunosuppressants.dosesMissed.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">High/Critical Risk</p>
              <p className={'text-lg font-bold ' + (summary.immunosuppressants.highRiskCount > 0 ? 'text-red-600' : 'text-gray-900')}>
                {summary.immunosuppressants.highRiskCount}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Risk Distribution Bar */}
      {summary && summary.totalPatients > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Risk Distribution</h3>
          <div className="flex h-4 rounded-full overflow-hidden">
            {['critical', 'high', 'medium', 'low'].map(level => {
              const count = level === 'critical' ? summary.criticalCount
                : level === 'high' ? summary.highRiskCount
                : level === 'medium' ? summary.mediumRiskCount
                : summary.lowRiskCount;
              const pct = summary.totalPatients > 0 ? (count / summary.totalPatients * 100) : 0;
              if (pct === 0) return null;
              const bgColor = level === 'critical' ? 'bg-red-500'
                : level === 'high' ? 'bg-orange-500'
                : level === 'medium' ? 'bg-yellow-400'
                : 'bg-green-500';
              return <div key={level} className={bgColor} style={{ width: pct + '%' }} title={level + ': ' + count + ' patients'} />;
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {['critical', 'high', 'medium', 'low'].map(level => {
              const count = level === 'critical' ? summary.criticalCount
                : level === 'high' ? summary.highRiskCount
                : level === 'medium' ? summary.mediumRiskCount
                : summary.lowRiskCount;
              return (
                <div key={level} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className={'h-2.5 w-2.5 rounded-full ' + RISK_COLORS[level].dot} />
                  {level.charAt(0).toUpperCase() + level.slice(1)}: {count}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#006838] text-[#006838]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && summary && (
        <div className="space-y-6">
          {/* Event Breakdown */}
          {summary.eventBreakdown && summary.eventBreakdown.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Event Breakdown</h3>
              <div className="space-y-3">
                {summary.eventBreakdown.map(evt => {
                  const total = summary.eventBreakdown.reduce((s, e) => s + e.count, 0);
                  const pct = total > 0 ? (evt.count / total * 100).toFixed(1) : 0;
                  const color = evt.type === 'taken' ? 'bg-green-500'
                    : evt.type === 'missed' ? 'bg-red-500'
                    : evt.type === 'late' ? 'bg-yellow-500'
                    : evt.type === 'refill' ? 'bg-blue-500'
                    : 'bg-gray-400';
                  return (
                    <div key={evt.type} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-20 capitalize">{evt.type}</span>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={color + ' h-full rounded-full'} style={{ width: pct + '%' }} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-16 text-right">{evt.count.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {summary.totalPatients === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <ShieldCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">No Compliance Data Yet</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Compliance data will appear here once patient adherence events are recorded
                through the app, EHR integration, or manual import.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={riskFilter}
              onChange={e => { setRiskFilter(e.target.value); setPatientPage(1); }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
            >
              <option value="">All Risk Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Patient Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Patient</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Adherence</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden sm:table-cell">Medications</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden md:table-cell">Doses</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Risk</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden lg:table-cell">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {patients && patients.patients && patients.patients.length > 0 ? (
                  patients.patients.flatMap(p => {
                    const isExpanded = expandedPatient === p.patientId;
                    const interventions = patientInterventions[p.patientId] || [];
                    return [
                    <tr
                      key={p.patientId}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setExpandedPatient(isExpanded ? null : p.patientId)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                          <span className="text-sm font-medium text-gray-900">{p.patientId}</span>
                          {p.hasHighPriorityMeds && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700" title="Taking immunosuppressants or other high-priority transplant medications">
                              <Pill className="h-3 w-3" />
                              IMM
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 w-48">
                        <AdherenceBar rate={p.avgAdherence} />
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-600">{p.medicationCount}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">
                        {p.totalTaken}/{p.totalScheduled}
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge level={p.riskLevel} />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-500">
                        {p.lastScoreDate ? new Date(p.lastScoreDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>,
                    isExpanded && (
                      <tr key={p.patientId + '-detail'} className="bg-gray-50 border-b border-gray-200">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700">Intervention Notes</h4>
                            <button
                              onClick={e => { e.stopPropagation(); setInterventionModal(p.patientId); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#006838] text-white rounded-lg hover:bg-[#005530] transition-colors"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              Add Intervention
                            </button>
                          </div>
                          {interventions.length > 0 ? (
                            <div className="space-y-2">
                              {interventions.slice(0, 5).map(iv => (
                                <div key={iv.id} className="bg-white rounded-lg border border-gray-200 p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-gray-500 capitalize">
                                      {iv.interventionType.replace('_', ' ')}
                                    </span>
                                    {iv.outcome && (
                                      <span className={'text-xs px-1.5 py-0.5 rounded ' + (iv.outcome === 'resolved' ? 'bg-green-100 text-green-700' : iv.outcome === 'escalated' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')}>
                                        {iv.outcome}
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-400 ml-auto">
                                      {iv.createdByName || iv.createdByEmail || 'Admin'} · {new Date(iv.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">{iv.notes}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">No interventions recorded for this patient.</p>
                          )}
                        </td>
                      </tr>
                    ),
                    ];
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                      No patient compliance data found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {patients && patients.total > patients.limit && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  Showing {(patients.page - 1) * patients.limit + 1}–{Math.min(patients.page * patients.limit, patients.total)} of {patients.total}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPatientPage(p => Math.max(1, p - 1))}
                    disabled={patientPage === 1}
                    className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPatientPage(p => p + 1)}
                    disabled={patients.page * patients.limit >= patients.total}
                    className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-4">
          {trends && trends.trends && trends.trends.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Weekly Adherence Trends</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Week</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Adherence</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden sm:table-cell">Patients</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden md:table-cell">Taken</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden md:table-cell">Missed</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden lg:table-cell">High Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.trends.map((t, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(t.week).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 w-40">
                        <AdherenceBar rate={t.avgAdherence} />
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-600">{t.patientCount}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-green-600">{t.dosesTaken.toLocaleString()}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-red-600">{t.dosesMissed.toLocaleString()}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {t.highRiskCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
                            {t.highRiskCount}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">No Trend Data</h3>
              <p className="text-sm text-gray-500">Trend data will appear once compliance scores are recorded over multiple weeks.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Compliance Review Log</h3>
            <button
              onClick={handleExportAudit}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>

          {auditLog && auditLog.logs && auditLog.logs.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Action</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden sm:table-cell">Admin</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 hidden md:table-cell">Patient</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.logs.map(log => (
                    <tr key={log.id} className="border-b border-gray-100">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-sm capitalize">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-600">
                        {log.adminName || log.adminEmail || '—'}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">
                        {log.targetPatientId || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">No Audit Entries</h3>
              <p className="text-sm text-gray-500">Audit log entries will appear as compliance reviews and actions are recorded.</p>
            </div>
          )}
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Alert Thresholds</h3>
                <p className="text-xs text-gray-500 mt-1">Configure when patients are flagged at each risk level based on adherence percentage.</p>
              </div>
              {!editingSettings && (
                <button
                  onClick={() => setEditingSettings(true)}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {editingSettings ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-red-700 mb-1">Critical (below %)</label>
                    <input
                      type="number" min="0" max="100" step="1"
                      value={settingsForm.criticalThreshold}
                      onChange={e => setSettingsForm(f => ({ ...f, criticalThreshold: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-orange-700 mb-1">High Risk (below %)</label>
                    <input
                      type="number" min="0" max="100" step="1"
                      value={settingsForm.highThreshold}
                      onChange={e => setSettingsForm(f => ({ ...f, highThreshold: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-yellow-700 mb-1">Medium Risk (below %)</label>
                    <input
                      type="number" min="0" max="100" step="1"
                      value={settingsForm.mediumThreshold}
                      onChange={e => setSettingsForm(f => ({ ...f, mediumThreshold: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-300"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Patients at or above the medium threshold are classified as low risk.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveSettings}
                    className="px-4 py-2 text-sm bg-[#006838] text-white rounded-lg hover:bg-[#005530] transition-colors"
                  >
                    Save Thresholds
                  </button>
                  <button
                    onClick={() => { setEditingSettings(false); if (settings) setSettingsForm({ criticalThreshold: settings.critical_threshold, highThreshold: settings.high_threshold, mediumThreshold: settings.medium_threshold }); }}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <div>
                    <p className="text-xs text-gray-500">Critical</p>
                    <p className="text-sm font-semibold text-gray-900">Below {settingsForm.criticalThreshold}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
                  <span className="h-3 w-3 rounded-full bg-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500">High Risk</p>
                    <p className="text-sm font-semibold text-gray-900">Below {settingsForm.highThreshold}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                  <span className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-500">Medium Risk</p>
                    <p className="text-sm font-semibold text-gray-900">Below {settingsForm.mediumThreshold}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Intervention Modal */}
      {interventionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setInterventionModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Record Intervention</h3>
              <button onClick={() => setInterventionModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <p className="text-sm text-gray-900 font-mono bg-gray-50 rounded px-3 py-2">{interventionModal}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={interventionForm.interventionType}
                  onChange={e => setInterventionForm(f => ({ ...f, interventionType: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="phone_call">Phone Call</option>
                  <option value="message">Message</option>
                  <option value="in_person">In Person</option>
                  <option value="care_plan_update">Care Plan Update</option>
                  <option value="referral">Referral</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={interventionForm.notes}
                  onChange={e => setInterventionForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Describe the intervention and discussion..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-[#006838]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
                <select
                  value={interventionForm.outcome}
                  onChange={e => setInterventionForm(f => ({ ...f, outcome: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="pending">Follow-up Needed</option>
                  <option value="escalated">Escalated</option>
                  <option value="no_response">No Response</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-gray-200">
              <button
                onClick={() => setInterventionModal(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitIntervention}
                disabled={savingIntervention || !interventionForm.notes.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-[#006838] text-white rounded-lg hover:bg-[#005530] transition-colors disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {savingIntervention ? 'Saving...' : 'Save Intervention'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
