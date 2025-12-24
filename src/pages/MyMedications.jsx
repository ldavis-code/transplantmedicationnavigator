import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Trash2, Plus, LogOut, Mail, Lock, Loader2 } from 'lucide-react';

const SUPABASE_URL = 'https://lhvemrazkwlmdaljrcln.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxodmVtcmF6a3dsbWRhbGpyY2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MDMyOTIsImV4cCI6MjA4MjE3OTI5Mn0.20dRGKemeN3-5J30cEJhMshkB0nBWSs92GfIylJW7QU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function MyMedications() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState({ text: '', type: '' });
  const [authLoading, setAuthLoading] = useState(false);

  const [medications, setMedications] = useState([]);
  const [medLoading, setMedLoading] = useState(false);
  const [medMessage, setMedMessage] = useState({ text: '', type: '' });
  const [newMed, setNewMed] = useState({
    name: '',
    brand: '',
    dosage: '',
    cost: '',
    renewal: '',
    renewalType: ''
  });

  const renewalTypeLabels = {
    'calendar_year': 'Calendar year',
    'enrollment_anniversary': 'Enrollment anniversary',
    'after_max_reached': 'After max reached'
  };

  // Check for existing session on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load medications when user logs in
  useEffect(() => {
    if (user) {
      loadMedications();
    }
  }, [user]);

  async function loadMedications() {
    setMedLoading(true);
    const { data, error } = await supabase
      .from('user_medications')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error.message);
      setMedications([]);
    } else {
      setMedications(data || []);
    }
    setMedLoading(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage({ text: '', type: '' });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setAuthMessage({ text: error.message, type: 'error' });
    } else {
      setUser(data.user);
      setEmail('');
      setPassword('');
    }
    setAuthLoading(false);
  }

  async function handleSignup(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage({ text: '', type: '' });

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      setAuthMessage({ text: error.message, type: 'error' });
    } else {
      // Create user profile
      if (data.user) {
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          email: email,
          plan: 'free'
        });
      }
      setAuthMessage({ text: 'Check your email for confirmation link', type: 'success' });
      setEmail('');
      setPassword('');
    }
    setAuthLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setMedications([]);
  }

  async function handleAddMedication(e) {
    e.preventDefault();
    if (!newMed.name.trim()) {
      setMedMessage({ text: 'Please enter a medication name', type: 'error' });
      return;
    }

    setMedLoading(true);
    const { error } = await supabase
      .from('user_medications')
      .insert({
        user_id: user.id,
        medication_name: newMed.name,
        brand_name: newMed.brand || null,
        dosage: newMed.dosage || null,
        monthly_cost: newMed.cost ? parseFloat(newMed.cost) : null,
        renewal_date: newMed.renewal || null,
        renewal_type: newMed.renewalType || null
      });

    if (error) {
      setMedMessage({ text: error.message, type: 'error' });
    } else {
      setMedMessage({ text: 'Medication saved!', type: 'success' });
      setNewMed({ name: '', brand: '', dosage: '', cost: '', renewal: '', renewalType: '' });
      loadMedications();
    }
    setMedLoading(false);
  }

  async function handleDeleteMedication(id) {
    if (!confirm('Delete this medication?')) return;

    const { error } = await supabase
      .from('user_medications')
      .delete()
      .eq('id', id);

    if (!error) {
      loadMedications();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Not logged in - show auth forms
  if (!user) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
            My Medications
          </h1>
          <p className="text-slate-600 text-center mb-6">
            Sign in to save and track your medications
          </p>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Your password"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Login
              </button>
              <p className="text-center text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setAuthMessage({ text: '', type: '' }); }}
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  Sign up
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Min 6 characters"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Create Account
              </button>
              <p className="text-center text-slate-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthMessage({ text: '', type: '' }); }}
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  Login
                </button>
              </p>
            </form>
          )}

          {authMessage.text && (
            <p className={`mt-4 text-center ${authMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {authMessage.text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Logged in - show dashboard
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Medications</h1>
            <p className="text-slate-600">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Add Medication Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-600" />
          Add a Medication
        </h2>
        <form onSubmit={handleAddMedication} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={newMed.name}
              onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
              placeholder="Medication name (e.g., Tacrolimus)"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <input
              type="text"
              value={newMed.brand}
              onChange={(e) => setNewMed({ ...newMed, brand: e.target.value })}
              placeholder="Brand name (e.g., Prograf)"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <input
              type="text"
              value={newMed.dosage}
              onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
              placeholder="Dosage (e.g., 1mg twice daily)"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <input
              type="number"
              step="0.01"
              value={newMed.cost}
              onChange={(e) => setNewMed({ ...newMed, cost: e.target.value })}
              placeholder="Monthly cost ($)"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <div>
              <label className="block text-sm text-slate-600 mb-1">Renewal date (optional)</label>
              <input
                type="date"
                value={newMed.renewal}
                onChange={(e) => setNewMed({ ...newMed, renewal: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Renewal type (optional)</label>
              <select
                value={newMed.renewalType}
                onChange={(e) => setNewMed({ ...newMed, renewalType: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">-- Select --</option>
                <option value="calendar_year">Calendar year (Jan 1)</option>
                <option value="enrollment_anniversary">Enrollment anniversary</option>
                <option value="after_max_reached">After max benefit reached</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={medLoading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {medLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Save Medication
          </button>
        </form>
        {medMessage.text && (
          <p className={`mt-4 text-center ${medMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {medMessage.text}
          </p>
        )}
      </div>

      {/* Medications List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Saved Medications</h2>
        {medLoading && medications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : medications.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No medications saved yet.</p>
        ) : (
          <div className="space-y-4">
            {medications.map((med) => (
              <div key={med.id} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{med.medication_name}</h3>
                    {med.brand_name && <p className="text-slate-600">Brand: {med.brand_name}</p>}
                    {med.dosage && <p className="text-slate-600">Dosage: {med.dosage}</p>}
                    {med.monthly_cost && <p className="text-slate-600">Monthly cost: ${med.monthly_cost}</p>}
                    {med.renewal_date && <p className="text-slate-600">Renewal: {new Date(med.renewal_date).toLocaleDateString()}</p>}
                    {med.renewal_type && <p className="text-slate-600">Type: {renewalTypeLabels[med.renewal_type] || med.renewal_type}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteMedication(med.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    aria-label="Delete medication"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
