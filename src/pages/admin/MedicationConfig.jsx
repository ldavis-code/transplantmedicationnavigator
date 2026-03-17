/**
 * Medication Configuration Page
 * Allows admins to customize medication display for their organization
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Star, EyeOff, Eye, Save, Pill } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';

export default function MedicationConfig() {
  const { getToken, isAdmin } = useAuth();
  const { org } = useTenant();
  const [medications, setMedications] = useState([]);
  const [configs, setConfigs] = useState({});
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    async function load() {
      try {
        const [medsRes, configsRes] = await Promise.all([
          fetch('/.netlify/functions/medications'),
          fetch('/.netlify/functions/admin-medications', {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
        ]);
        if (medsRes.ok) setMedications(await medsRes.json());
        if (configsRes.ok) {
          const data = await configsRes.json();
          const map = {};
          (data.configs || []).forEach(c => { map[c.medication_id] = c; });
          setConfigs(map);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAdmin, getToken]);

  const categories = [...new Set(medications.map(m => m.category).filter(Boolean))].sort();

  const filtered = medications.filter(m => {
    const matchSearch = !search ||
      m.brand_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.generic_name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || m.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const toggleConfig = async (medId, field) => {
    const current = configs[medId] || {};
    const newValue = !current[field];
    const updated = { ...current, medication_id: medId, [field]: newValue };

    setConfigs(prev => ({ ...prev, [medId]: updated }));
    setSaving(medId);

    try {
      await fetch('/.netlify/functions/admin-medications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ medicationId: medId, orgId: org?.id, [field]: newValue }),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
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
              <div>
                <h1 className="text-xl font-bold text-gray-900">Medication Configuration</h1>
                <p className="text-sm text-gray-500">{medications.length} medications</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medications..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-sm text-blue-800">
          <Star className="inline h-4 w-4 mr-1" /> <strong>Featured</strong> medications are highlighted for your patients.
          <EyeOff className="inline h-4 w-4 mx-1 ml-3" /> <strong>Hidden</strong> medications won't appear in search results.
        </div>

        {/* Medications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(med => {
            const config = configs[med.id] || {};
            return (
              <div
                key={med.id}
                className={`bg-white rounded-lg shadow-sm border p-4 ${config.is_hidden ? 'opacity-60' : ''} ${config.is_featured ? 'ring-2 ring-yellow-400' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{med.brand_name}</h3>
                    <p className="text-xs text-gray-500">{med.generic_name}</p>
                  </div>
                  {saving === med.id && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  )}
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 mb-3">
                  {med.category}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleConfig(med.id, 'is_featured')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition ${
                      config.is_featured
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Star className="h-3 w-3" />
                    {config.is_featured ? 'Featured' : 'Feature'}
                  </button>
                  <button
                    onClick={() => toggleConfig(med.id, 'is_hidden')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition ${
                      config.is_hidden
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {config.is_hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {config.is_hidden ? 'Hidden' : 'Hide'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Pill className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No medications match your search.</p>
          </div>
        )}
      </main>
    </div>
  );
}
