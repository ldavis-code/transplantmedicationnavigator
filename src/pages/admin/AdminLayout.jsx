/**
 * Admin Layout
 * Shared TMN-branded layout with sidebar navigation for all admin pages
 */

import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Pill, BarChart3, FileText,
  Heart, Settings, ExternalLink, LogOut, Zap, ShieldCheck, Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Impact Report', href: '/admin/impact', icon: Heart },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Medications', href: '/admin/medications', icon: Pill },
  { label: 'Surveys', href: '/admin/surveys', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Building2 },
  { label: 'Compliance', href: '/admin/compliance', icon: ShieldCheck },
  { label: 'Compliance Overview', href: '/admin/compliance-overview', icon: Shield },
  { label: 'Features', href: '/admin/features', icon: Settings },
];

export default function AdminLayout({ children, title, subtitle, actions }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { org } = useTenant();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.href;
    return location.pathname === item.href || location.pathname.startsWith(item.href + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 print:hidden">
        <div className="flex flex-col flex-1 bg-[#006838] text-white">
          {/* TMN Brand */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-white/20">
            <img src="/logo.svg" alt="" className="h-9 w-9 rounded-lg bg-white p-1" />
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight">TMN Admin</p>
              <p className="text-xs text-white/70 truncate">{org?.name || 'Transplant Med Nav'}</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(item => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="px-3 py-4 border-t border-white/20 space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/75 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              View Patient Site
            </Link>

            {/* Epic status indicator */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60">
              <Zap className="h-4 w-4 shrink-0" />
              <span className="truncate">Epic EHR Ready</span>
              <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400 shrink-0" title="Epic integration active" />
            </div>

            {/* User & logout */}
            <div className="flex items-center justify-between px-3 py-2 mt-2">
              <span className="text-xs text-white/60 truncate max-w-[140px]">
                {user?.name || user?.email}
              </span>
              <button
                onClick={logout}
                className="text-white/60 hover:text-white transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:pl-64">
        {/* Mobile header */}
        <header className="md:hidden bg-[#006838] text-white px-4 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="h-7 w-7 rounded bg-white p-0.5" />
            <span className="font-bold text-sm">TMN Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white/70 hover:text-white">
              <ExternalLink className="h-4 w-4" />
            </Link>
            <button onClick={logout} className="text-white/70 hover:text-white">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Mobile nav (horizontal scroll) */}
        <nav className="md:hidden bg-white border-b overflow-x-auto print:hidden">
          <div className="flex px-2 py-2 gap-1">
            {NAV_ITEMS.map(item => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[#006838] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Page header */}
        {title && (
          <header className="bg-white border-b print:border-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-5">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                  {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
              </div>
            </div>
          </header>
        )}

        {/* Page content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
