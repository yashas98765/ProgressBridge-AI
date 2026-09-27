import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useApp, DEMO_USERS } from '../context/AppContext';
import { DemoTourModal } from '../components/DemoTourModal';
import {
  LayoutDashboard,
  UploadCloud,
  Network,
  ListTodo,
  GitCompare,
  MessageSquare,
  CalendarCheck2,
  AlertTriangle,
  Brain,
  ShieldCheck,
  Settings,
  Sparkles,
  ChevronDown,
  User,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';

const ALL_NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/ingestion', label: 'Data Ingestion', icon: UploadCloud, badge: 'Heterogeneous' },
  { path: '/schedule', label: 'Schedule (L1-L6)', icon: Network },
  { path: '/events', label: 'Progress Events', icon: ListTodo },
  { path: '/match-review', label: 'Match Review', icon: GitCompare, badge: 'AI Engine' },
  { path: '/time-agent', label: 'Time Agent', icon: MessageSquare, badge: 'Copilot' },
  { path: '/schedule-updates', label: 'Schedule Updates', icon: CalendarCheck2 },
  { path: '/analytics', label: 'Delay Analytics', icon: AlertTriangle },
  { path: '/project-memory', label: 'Project Memory', icon: Brain, badge: 'Knowledge' },
  { path: '/audit', label: 'Audit Trail', icon: ShieldCheck },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function MainLayout() {
  const { currentUser, switchPersona, setIsDemoTourOpen, setDemoTourStep, notification } = useApp();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [enforceRbac, setEnforceRbac] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLaunchDemo = () => {
    setDemoTourStep(0);
    setIsDemoTourOpen(true);
  };

  const handlePersonaSwitch = (u) => {
    switchPersona(u);
    setUserDropdownOpen(false);
    if (u.defaultRoute) {
      navigate(u.defaultRoute);
    }
  };

  // If user is currently on an unauthorized path, redirect to their default allowed route
  React.useEffect(() => {
    if (enforceRbac && currentUser?.allowedNavs && !currentUser.allowedNavs.includes(location.pathname)) {
      navigate(currentUser.defaultRoute || '/');
    }
  }, [currentUser, location.pathname, enforceRbac, navigate]);

  // Filter navigation items by active user role permissions if enforceRbac is true
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => {
    if (!enforceRbac || !currentUser?.allowedNavs) return true;
    return currentUser.allowedNavs.includes(item.path);
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'PLANNER': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SUPERVISOR': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PROJECT_MANAGER': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      <DemoTourModal />

      {/* Global Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border border-slate-200 bg-white text-slate-800">
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-500" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none">
        {/* Brand header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">ProgressBridge</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">Planning-to-Execution Bridge</p>
          </div>
        </div>

        {/* Demo Project info badge */}
        <div className="px-4 py-2.5 bg-blue-50/60 border-b border-blue-100/60 text-xs">
          <div className="flex items-center justify-between text-blue-800 font-semibold mb-0.5">
            <span className="truncate">PRJ-OIL-2026</span>
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded text-[10px]">Active</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">Integrated Infrastructure Hub</p>
        </div>

        {/* Active Role Permissions Indicator */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold">Active Role:</span>
            <span className={`px-2 py-0.2 rounded font-bold text-[10px] border ${getRoleBadgeColor(currentUser?.role)}`}>
              {currentUser?.role || 'PLANNER'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 leading-snug">
            {currentUser?.roleDescription || 'Role-based access applied'}
          </p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Role Filter Toggle */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">Filter menu by Role:</span>
          <button
            onClick={() => setEnforceRbac(!enforceRbac)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
              enforceRbac ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {enforceRbac ? 'Enforced' : 'Show All'}
          </button>
        </div>

        {/* Quick Launch Demo button */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLaunchDemo}
            className="w-full py-2.5 px-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/30 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Launch Demo Tour
          </button>
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.name || 'Demo User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.role || 'User'}</p>
              </div>
            </div>

            <Link
              to="/login"
              title="Go to Login / Seed Credentials"
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
            >
              <KeyRound className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">SIH26122 Prototype</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-medium text-slate-600">From Site Execution to Schedule Intelligence</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Engine status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-medium text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AI Matching Engine Active
            </div>

            {/* Launch Demo Top Button */}
            <button
              onClick={handleLaunchDemo}
              className="px-3.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Interactive Demo
            </button>

            {/* Login / Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${getRoleBadgeColor(currentUser?.role)}`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{currentUser?.name?.split(' ')[0]} ({currentUser?.role || 'PLANNER'})</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 animate-fade-in">
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Demo Persona (RBAC)
                  </div>
                  {DEMO_USERS.map((u) => (
                    <button
                      key={u.email}
                      onClick={() => handlePersonaSwitch(u)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex flex-col transition-colors cursor-pointer border mb-1.5 ${
                        currentUser?.email === u.email 
                          ? 'bg-blue-50/80 border-blue-300 text-blue-900 font-bold shadow-2xs' 
                          : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{u.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeColor(u.role)}`}>
                          {u.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal mt-0.5">{u.department}</span>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="text-slate-400 font-mono">{u.email}</span>
                        <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                          Goes to: {u.landingName}
                        </span>
                      </div>
                    </button>
                  ))}

                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <Link
                      to="/login"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 flex items-center justify-between"
                    >
                      <span>Seed Credentials on Login Page</span>
                      <KeyRound className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Role Context Notification Bar */}
        <div className={`px-6 py-2 border-b flex items-center justify-between text-xs transition-colors ${getRoleBadgeColor(currentUser?.role)}`}>
          <div className="flex items-center gap-2">
            <span className="font-bold">Active Role Persona:</span>
            <span>{currentUser?.name} — <strong>{currentUser?.title}</strong> ({currentUser?.department})</span>
          </div>
          <span className="text-[11px] font-medium hidden md:inline">
            Scope: {currentUser?.permissions}
          </span>
        </div>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
