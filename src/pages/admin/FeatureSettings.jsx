/**
 * Feature Settings Page
 * Enable/disable features for the organization
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, CheckCircle, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';

const FEATURES = [
  {
    key: 'price_reports',
    label: 'Community Price Reports',
    description: 'Allow patients to submit and view medication prices from their community.',
  },
  {
    key: 'surveys',
    label: 'Patient Surveys',
    description: 'Enable transplant medication and general surveys for patients.',
  },
  {
    key: 'wizard',
    label: 'Savings Wizard (My Path Quiz)',
    description: 'Interactive quiz to help patients find the best savings programs for their medications.',
  },
  {
    key: 'education',
    label: 'Education Center',
    description: 'Medication education resources, appeals guides, and learning materials.',
  },
  {
    key: 'custom_medications',
    label: 'Custom Medication Config',
    description: 'Allow your team to feature, hide, or customize medications displayed to patients.',
  },
  {
    key: 'analytics_dashboard',
    label: 'Analytics Dashboard',
    description: 'Access to detailed analytics, funnel metrics, and CSV exports.',
  },
];

export default function FeatureSettings() {
  const { getToken, isAdmin } = useAuth();
  const { org } = useTenant();
  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (org?.features) {
      setFeatures(org.features);
    }
    setLoading(false);
  }, [org]);

  const toggleFeature = (key) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/admin-features', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ orgId: org?.id, features }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Feature Settings</h1>
                <p className="text-sm text-gray-500">Enable or disable features for your organization</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">{error}</div>
        )}

        <div className="space-y-4">
          {FEATURES.map(feat => (
            <div
              key={feat.key}
              className="bg-white rounded-lg shadow-sm border p-6 flex items-center justify-between"
            >
              <div className="flex-1 mr-4">
                <h3 className="font-medium text-gray-900">{feat.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{feat.description}</p>
              </div>
              <button
                onClick={() => toggleFeature(feat.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  features[feat.key] ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={!!features[feat.key]}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    features[feat.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-gray-50 rounded-lg p-4 border text-sm text-gray-600">
          <Settings className="inline h-4 w-4 mr-1" />
          Feature availability may also depend on your organization's plan ({org?.plan || 'free'}).
          Contact support to upgrade your plan.
        </div>
      </main>
    </div>
  );
}
