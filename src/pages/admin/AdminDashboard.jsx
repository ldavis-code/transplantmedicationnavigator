/**
 * Hospital Admin Dashboard
 * Main admin panel for hospital administrators
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  BarChart3,
  FileText,
  ExternalLink,
  ChevronRight,
  Heart,
  Key,
  Zap,
  Building2,
  Pill,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import AdminLayout from './AdminLayout';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, getToken } = useAuth();
  const { org, loading: tenantLoading } = useTenant();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState(null);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin && !tenantLoading) {
      navigate('/');
    }
  }, [isAdmin, tenantLoading, navigate]);

  // Load dashboard stats from admin API
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/.netlify/functions/admin-api/stats', {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats({
            totalEvents: data.totalEvents || 0,
            eventsThisMonth: data.eventsThisMonth || 0,
            quizCompletes: data.quizCompletes || 0,
            uniqueSessions: data.uniqueSessionsThisMonth || 0,
          });
        } else {
          setStats({ totalEvents: 0, eventsThisMonth: 0, quizCompletes: 0, uniqueSessions: 0 });
        }
      } catch (error) {
        console.error('Error loading stats:', error);
        setStats({ totalEvents: 0, eventsThisMonth: 0, quizCompletes: 0, uniqueSessions: 0 });
      } finally {
        setLoadingStats(false);
      }
    }

    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin, getToken]);

  if (tenantLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  const menuItems = [
    {
      title: 'Organization Settings',
      description: 'Branding, colors, contact info',
      icon: Building2,
      href: '/admin/settings',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'User Management',
      description: 'Manage staff accounts & roles',
      icon: Users,
      href: '/admin/users',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Medication Config',
      description: 'Customize medications & resources',
      icon: Pill,
      href: '/admin/medications',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Analytics',
      description: 'Usage statistics & reports',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Survey Responses',
      description: 'View patient survey data',
      icon: FileText,
      href: '/admin/surveys',
      color: 'bg-pink-100 text-pink-600',
    },
    {
      title: 'Impact Report',
      description: 'Funding-ready metrics & growth',
      icon: Heart,
      href: '/admin/impact',
      color: 'bg-red-100 text-red-600',
    },
    {
      title: 'Feature Settings',
      description: 'Enable/disable features',
      icon: Settings,
      href: '/admin/features',
      color: 'bg-gray-100 text-gray-600',
    },
  ];

  const statCards = [
    { label: 'Total Events', value: stats?.totalEvents || 0, icon: BarChart3 },
    { label: 'Events This Month', value: stats?.eventsThisMonth || 0, icon: FileText },
    { label: 'Quiz Completions', value: stats?.quizCompletes || 0, icon: ExternalLink },
    { label: 'Unique Sessions (Mo)', value: stats?.uniqueSessions || 0, icon: Users },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle={org.name}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loadingStats ? '...' : stat.value.toLocaleString()}
                </p>
              </div>
              <stat.icon className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Epic EHR Status */}
      <div className="mb-8 bg-emerald-50 rounded-lg p-5 border border-emerald-200 flex items-start gap-4">
        <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-lg">
          <Zap className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-emerald-900">Epic EHR Integration — Active</h3>
          <p className="text-sm text-emerald-700 mt-1">
            SMART on FHIR EHR launch and patient standalone launch are configured.
            Clinicians can launch TMN directly from Epic MyChart or the EHR sidebar.
          </p>
          <div className="flex gap-4 mt-3 text-xs text-emerald-600">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> EHR Launch
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Patient Standalone
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Medication Import
            </span>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.title}
            to={item.href}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-[#006838] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#006838] transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Getting Started */}
      <div className="mt-8 bg-[#006838]/5 rounded-lg p-6 border border-[#006838]/20">
        <h3 className="font-semibold text-[#006838] mb-2">Getting Started</h3>
        <ul className="text-sm text-[#006838]/80 space-y-2">
          <li>• Upload your hospital logo in Organization Settings</li>
          <li>• Invite staff members in User Management</li>
          <li>• Customize which medications to feature for your patients</li>
          <li>• Add hospital-specific resources and links</li>
        </ul>
      </div>

      {/* Change Password */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Change Password</h3>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setPwMsg(null);
            if (newPassword !== confirmPassword) {
              setPwMsg({ type: 'error', text: 'New passwords do not match' });
              return;
            }
            if (newPassword.length < 8) {
              setPwMsg({ type: 'error', text: 'New password must be at least 8 characters' });
              return;
            }
            setPwSubmitting(true);
            try {
              const res = await fetch('/.netlify/functions/auth/change-password', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
              });
              const data = await res.json();
              if (res.ok) {
                setPwMsg({ type: 'success', text: 'Password changed successfully' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              } else {
                setPwMsg({ type: 'error', text: data.error || 'Failed to change password' });
              }
            } catch {
              setPwMsg({ type: 'error', text: 'Network error — try again' });
            } finally {
              setPwSubmitting(false);
            }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006838] focus:border-[#006838] text-sm"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006838] focus:border-[#006838] text-sm"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006838] focus:border-[#006838] text-sm"
            />
          </div>
          <div className="md:col-span-3 flex items-center gap-4">
            <button
              type="submit"
              disabled={pwSubmitting}
              className="px-4 py-2 bg-[#006838] text-white rounded-lg text-sm font-medium hover:bg-[#005530] disabled:opacity-50"
            >
              {pwSubmitting ? 'Changing...' : 'Change Password'}
            </button>
            {pwMsg && (
              <span className={`text-sm ${pwMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {pwMsg.text}
              </span>
            )}
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
