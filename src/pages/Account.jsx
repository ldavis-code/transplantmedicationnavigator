/**
 * Account Page
 * User account management with subscription status, data sync, and billing portal access
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
  Cloud,
  CloudOff,
  Upload,
  Gift,
  Trash2,
} from 'lucide-react';
import { useSubscriberAuth } from '../context/SubscriberAuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { useDataSync } from '../hooks/useDataSync';
import { useMetaTags } from '../hooks/useMetaTags';
import { seoMetadata } from '../data/seo-metadata';

const Account = () => {
  useMetaTags(seoMetadata.account);
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, logout, refreshUser } = useSubscriberAuth();
  const { subscription, loading: subLoading, isPro, isPastDue, hasSubscription, refresh: refreshSubscription, openPortal } =
    useSubscription(user?.email);
  const { migrationNeeded, migrateLocalData, syncing } = useDataSync();

  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState(null);
  const [migrationStatus, setMigrationStatus] = useState(null);

  // Patient code state
  const [patientCode, setPatientCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState(null);
  const [codeSuccess, setCodeSuccess] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleLogout = () => {
    logout();
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

  const handleMigrate = async () => {
    setMigrationStatus('migrating');
    const result = await migrateLocalData();
    if (result.success) {
      setMigrationStatus('success');
      // Refresh user data after migration
      refreshUser();
    } else {
      setMigrationStatus('error');
    }
  };

  const handleRedeemCode = async (e) => {
    e.preventDefault();
    if (!patientCode.trim()) return;

    setCodeLoading(true);
    setCodeError(null);
    setCodeSuccess(false);

    try {
      const response = await fetch('/.netlify/functions/redeem-patient-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: patientCode.trim(),
          email: user?.email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to redeem code');
      }

      setCodeSuccess(true);
      setPatientCode('');
      // Refresh subscription and user data
      refreshUser();
      refreshSubscription();
    } catch (err) {
      setCodeError(err.message);
    } finally {
      setCodeLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const token = localStorage.getItem('tmn_subscriber_token');
      const response = await fetch('/api/subscriber-data/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      // Clear all local data
      localStorage.removeItem('tmn_subscriber_token');
      localStorage.removeItem('tmn_my_medications');
      localStorage.removeItem('tmn_savings_user_id');
      localStorage.removeItem('medication_navigator_progress');
      localStorage.removeItem('tmn_subscription');
      sessionStorage.clear();

      // Log out and redirect
      logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.message);
      setDeleteLoading(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  // If no user is logged in, show login prompt
  if (!isAuthenticated) {
    return (
      <article className="max-w-2xl mx-auto space-y-8 pb-12">
        <header className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
            <User size={32} className="text-slate-500" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Account</h1>
          <p className="text-slate-600">Sign in to access your account and sync your data across devices</p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center gap-3 text-slate-600">
              <Cloud size={20} className="text-emerald-600" />
              <span>Sync your medications and quiz results</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-slate-600">
              <CheckCircle size={20} className="text-emerald-600" />
              <span>Access your data on any device</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              to="/login/register"
              className="px-6 py-3 bg-white hover:bg-slate-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Subscribe CTA */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-6 text-center">
          <Crown size={24} className="text-amber-500 mx-auto mb-2" />
          <h3 className="font-bold text-slate-900 mb-2">Get Pro for Unlimited Access</h3>
          <p className="text-slate-600 text-sm mb-4">
            Unlock unlimited quizzes, medication tracking, and more.
          </p>
          <Link
            to="/subscribe"
            className="inline-block px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
          >
            View Plans
          </Link>
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
        <p className="text-slate-600">{user.name || user.email}</p>
        {user.name && <p className="text-slate-500 text-sm">{user.email}</p>}
      </header>

      {/* Data Migration Notice */}
      {migrationNeeded && migrationStatus !== 'success' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Upload size={24} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-1">Sync Your Local Data</h3>
              <p className="text-blue-800 text-sm mb-4">
                We found saved data on this device. Would you like to sync it to your account so you can access it anywhere?
              </p>
              {migrationStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
                  <AlertCircle size={16} />
                  <span>Sync failed. Please try again.</span>
                </div>
              )}
              <button
                onClick={handleMigrate}
                disabled={syncing || migrationStatus === 'migrating'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                {migrationStatus === 'migrating' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Cloud size={16} />
                    Sync Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Success Message */}
      {migrationStatus === 'success' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
          <p className="text-emerald-800">Your data has been synced successfully!</p>
        </div>
      )}

      {/* Subscription Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Crown size={24} className={isPro ? 'text-amber-500' : 'text-slate-500'} aria-hidden="true" />
              Subscription
            </h2>
            <button
              onClick={refreshSubscription}
              className="p-2 text-slate-500 hover:text-emerald-600 transition"
              title="Refresh subscription status"
              aria-label="Refresh subscription status"
            >
              <RefreshCw size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {subLoading ? (
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

              {/* Sync Status */}
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 rounded-lg p-3">
                <Cloud size={18} className="text-emerald-600" />
                <span className="text-sm">Your data is synced across all your devices</span>
              </div>

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
              {!hasSubscription && !isPro && (
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

              {/* Patient Code Redemption */}
              {!isPro && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Gift size={20} className="text-emerald-600" />
                    <div>
                      <h3 className="font-bold text-slate-900">Have a Patient Code?</h3>
                      <p className="text-slate-600 text-sm">
                        Enter a code from your healthcare provider for free access.
                      </p>
                    </div>
                  </div>

                  {codeSuccess ? (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <CheckCircle size={18} className="text-emerald-600" />
                      <p className="text-emerald-800 font-medium">Code redeemed! You now have Pro access.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleRedeemCode} className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={patientCode}
                          onChange={(e) => setPatientCode(e.target.value)}
                          placeholder="Enter patient code"
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                          disabled={codeLoading}
                        />
                        <button
                          type="submit"
                          disabled={codeLoading || !patientCode.trim()}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                        >
                          {codeLoading ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Redeeming...
                            </>
                          ) : (
                            'Redeem'
                          )}
                        </button>
                      </div>
                      {codeError && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle size={14} />
                          <span>{codeError}</span>
                        </div>
                      )}
                    </form>
                  )}
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
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Delete Account */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Trash2 size={20} className="text-red-500" />
          Delete Account
        </h2>
        <p className="text-slate-600 text-sm mb-4">
          Permanently delete your account and all associated data, including saved medications, quiz progress, and savings history. This action cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg font-medium transition text-sm"
          >
            Delete My Account
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <p className="text-red-800 text-sm font-medium">
              This will permanently delete all your data. Type <strong>DELETE</strong> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              disabled={deleteLoading}
            />
            {deleteError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={14} />
                <span>{deleteError}</span>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Permanently Delete Account'
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                  setDeleteError(null);
                }}
                disabled={deleteLoading}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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
