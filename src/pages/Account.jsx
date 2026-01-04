/**
 * Account Page
 * User account management with subscription status and billing portal access
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  CreditCard,
  Settings,
  LogOut,
  Crown,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { useMetaTags } from '../hooks/useMetaTags';
import { seoMetadata } from '../data/seo-metadata';

// Storage keys (matching AuthContext)
const AUTH_USER_KEY = 'tmn_auth_user';
const AUTH_TOKEN_KEY = 'tmn_auth_token';

const Account = () => {
  useMetaTags(seoMetadata.account);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
  }, []);

  const { subscription, loading, isPro, isPastDue, hasSubscription, refresh, openPortal } =
    useSubscription(user?.email);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    navigate('/');
  };

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    setPortalError(null);
    try {
      await openPortal();
    } catch (err) {
      setPortalError(err.message);
      setPortalLoading(false);
    }
  };

  // If no user is logged in, show login prompt
  if (!user) {
    return (
      <article className="max-w-2xl mx-auto space-y-8 pb-12">
        <header className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
            <User size={32} className="text-slate-500" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Account</h1>
          <p className="text-slate-600">Please log in to view your account</p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <p className="text-slate-600 mb-6">
            You need to be logged in to view your account and manage your subscription.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/admin/login"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
            >
              Log In
            </Link>
            <Link
              to="/subscribe"
              className="px-6 py-3 bg-white hover:bg-slate-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition"
            >
              Subscribe to Pro
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="max-w-2xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <header className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <User size={32} className="text-emerald-700" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">My Account</h1>
        <p className="text-slate-600">{user.email}</p>
      </header>

      {/* Subscription Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Crown size={24} className={isPro ? 'text-amber-500' : 'text-slate-500'} aria-hidden="true" />
              Subscription
            </h2>
            <button
              onClick={refresh}
              className="p-2 text-slate-500 hover:text-emerald-600 transition"
              title="Refresh subscription status"
              aria-label="Refresh subscription status"
            >
              <RefreshCw size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Plan Badge */}
              <div className="flex items-center gap-4">
                <div
                  className={`px-4 py-2 rounded-full font-bold ${
                    isPro
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isPro ? 'Pro Plan' : 'Free Plan'}
                </div>
                {isPastDue && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">Payment Past Due</span>
                  </div>
                )}
                {isPro && !isPastDue && (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle size={18} />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                )}
              </div>

              {/* Subscription Details */}
              {hasSubscription && subscription && (
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  {subscription.subscription_plan && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <CreditCard size={18} className="text-slate-500" aria-hidden="true" />
                      <span>
                        {subscription.subscription_plan === 'yearly'
                          ? 'Yearly Plan ($79.99/year)'
                          : 'Monthly Plan ($8.99/month)'}
                      </span>
                    </div>
                  )}
                  {subscription.subscription_expires_at && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <Calendar size={18} className="text-slate-500" aria-hidden="true" />
                      <span>
                        {subscription.subscription_status === 'cancelled'
                          ? 'Access until: '
                          : 'Next billing: '}
                        {new Date(subscription.subscription_expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Portal Error */}
              {portalError && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={18} className="text-red-600" />
                  <span className="text-red-700">{portalError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {hasSubscription ? (
                  <button
                    onClick={handleOpenPortal}
                    disabled={portalLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                  >
                    {portalLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Opening...
                      </>
                    ) : (
                      <>
                        <Settings size={18} />
                        Manage Subscription
                        <ExternalLink size={14} />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    to="/subscribe"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                  >
                    <Crown size={18} />
                    Upgrade to Pro
                  </Link>
                )}
              </div>

              {/* Subscription Info */}
              {!hasSubscription && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h3 className="font-bold text-emerald-900 mb-2">Upgrade to Pro</h3>
                  <p className="text-emerald-800 text-sm mb-3">
                    Get unlimited access to all features including My Path Quiz, medication savings tracker, and more.
                  </p>
                  <ul className="text-sm text-emerald-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle size={14} />
                      Unlimited My Path Quiz
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={14} />
                      Save and share medications
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={14} />
                      Medication savings tracker
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Account Actions</h2>
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut size={20} />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="text-center text-slate-500 text-sm">
        <p>
          Need help?{' '}
          <Link to="/faq" className="text-emerald-600 hover:underline">
            View FAQ
          </Link>
          {' or '}
          <a
            href="mailto:info@transplantmedicationnavigator.com"
            className="text-emerald-600 hover:underline"
          >
            Contact Support
          </a>
        </p>
      </div>
    </article>
  );
};

export default Account;
