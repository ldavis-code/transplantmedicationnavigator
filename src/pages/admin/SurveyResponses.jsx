/**
 * Survey Responses Page
 * View and manage patient survey data
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SurveyResponses() {
  const { getToken, isAdmin } = useAuth();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    async function load() {
      try {
        const res = await fetch('/.netlify/functions/admin-surveys', {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const data = await res.json();
          setResponses(data.responses || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAdmin, getToken]);

  const filtered = responses.filter(r => !typeFilter || r.survey_type === typeFilter);
  const types = [...new Set(responses.map(r => r.survey_type).filter(Boolean))];

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Survey Responses</h1>
                <p className="text-sm text-gray-500">{filtered.length} response{filtered.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            {types.length > 0 && (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
              >
                <option value="">All Types</option>
                {types.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">{error}</div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No survey responses yet</p>
            <p className="text-sm mt-1">Responses will appear here as patients complete surveys.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((resp) => (
              <div key={resp.id} className="bg-white rounded-lg shadow-sm border">
                <button
                  onClick={() => setExpandedId(expandedId === resp.id ? null : resp.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      resp.survey_type === 'transplant' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {resp.survey_type || 'general'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Response #{resp.id}
                        {resp.session_id && <span className="text-gray-400 ml-2">Session: {resp.session_id.substring(0, 8)}...</span>}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(resp.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {expandedId === resp.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {expandedId === resp.id && resp.responses && (
                  <div className="px-6 pb-4 border-t">
                    <div className="mt-4 space-y-3">
                      {Object.entries(typeof resp.responses === 'string' ? JSON.parse(resp.responses) : resp.responses).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-3 gap-4 text-sm">
                          <dt className="text-gray-500 font-medium">{key.replace(/_/g, ' ')}</dt>
                          <dd className="col-span-2 text-gray-900">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </dd>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
