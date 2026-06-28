/**
 * Center Logins Dashboard
 * Per-center patient login counts from the Epic EHR-launch flow.
 * Data comes from admin-login-stats (patient_login_tracking + fhir_endpoint_directory).
 */

import { useState, useEffect, useCallback } from 'react';
import { Stethoscope, Users, MapPin, AlertTriangle, Building2, Download, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';

const API = '/.netlify/functions/admin-login-stats';

const RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last 12 months' },
  { value: 'all', label: 'All time' },
];

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

export default function CenterLogins() {
  const { getToken, isAdmin } = useAuth();
  const [days, setDays] = useState('30');
  const [period, setPeriod] = useState(null);
  const [summary, setSummary] = useState(null);
  const [centers, setCenters] = useState([]);
  const [unmatched, setUnmatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API}?days=${days}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        if (cancelled) return;
        setPeriod(data.period || null);
        setSummary(data.summary || null);
        setCenters(data.centers || []);
        setUnmatched(data.unmatched || []);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, days, getToken]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const res = await fetch(`${API}?days=${days}&format=csv`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `center-logins-${days}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  }, [days, getToken]);

  const periodLabel = period?.label || 'Selected period';

  const actions = (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <select
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          aria-label="Date range"
        >
          {RANGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <button
        onClick={handleExport}
        disabled={exporting || (centers.length === 0 && unmatched.length === 0)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="h-4 w-4" />
        {exporting ? 'Exporting…' : 'Export CSV'}
      </button>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout title="Center Logins" subtitle="Patient logins by transplant center (Epic EHR launch)" actions={actions}>
        <div className="flex items-center justify-center py-20" role="status">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006838]" />
          <span className="sr-only">Loading center logins...</span>
        </div>
      </AdminLayout>
    );
  }

  const summaryCards = summary
    ? [
        { label: `Logins (${periodLabel.toLowerCase()})`, value: summary.periodLogins, hint: 'Completed EHR logins' },
        { label: 'Logins (all time)', value: summary.allTimeLogins, hint: 'Since tracking began' },
        { label: 'Active centers (period)', value: summary.periodCenters, hint: 'With logins in range' },
        { label: 'Centers (all time)', value: summary.allTimeCenters, hint: 'Recognized endpoints' },
      ]
    : [];

  return (
    <AdminLayout title="Center Logins" subtitle="Patient logins by transplant center (Epic EHR launch)" actions={actions}>
      <div className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
        )}

        {/* Summary cards */}
        {summary && (
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {summaryCards.map((card) => (
                <div key={card.label} className="bg-white rounded-lg shadow-sm border p-4">
                  <p className="text-sm text-gray-500 capitalize">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">{card.hint}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Per-center table */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-blue-500" />
            Logins by Center
          </h2>
          {centers.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Center</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{periodLabel}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">All Time</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {centers.map((row) => (
                    <tr key={row.endpointId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          {row.brandName}
                          {row.isTransplantCenter && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                              Transplant
                            </span>
                          )}
                        </div>
                        {row.epicOrgId && (
                          <span className="text-xs text-gray-400">{row.epicOrgId}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {row.city || row.state ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            {[row.city, row.state].filter(Boolean).join(', ')}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">{row.periodCount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.allTime.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">{formatDate(row.lastLogin)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500 bg-white rounded-lg border">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No center logins yet</p>
              <p className="text-sm mt-1">Logins appear here after patients launch the app from an Epic EHR.</p>
            </div>
          )}
        </section>

        {/* Unmatched iss URLs — centers not yet in the directory */}
        {unmatched.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Unrecognized Endpoints
            </h2>
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
              <Building2 className="h-4 w-4 text-gray-400" />
              These FHIR endpoints had logins but aren&apos;t in the directory. Add them to{' '}
              <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">fhir_endpoint_directory</code> to see them named above.
            </p>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">iss URL</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{periodLabel}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">All Time</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {unmatched.map((row) => (
                    <tr key={row.issUrl} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-700 break-all">{row.issUrl}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">{row.periodCount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.allTime.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">{formatDate(row.lastLogin)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  );
}
