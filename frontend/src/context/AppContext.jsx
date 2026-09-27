import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export const DEMO_USERS = [
  {
    name: 'Priyanka Sharma',
    email: 'planner@progressbridge.demo',
    role: 'PLANNER',
    title: 'Lead Planning Engineer',
    department: 'Planning & Scheduling',
    defaultRoute: '/match-review',
    landingName: 'AI Match Review Desk',
    allowedNavs: ['/', '/match-review', '/schedule-updates', '/schedule', '/ingestion', '/events', '/audit'],
    permissions: 'Review AI matches, approve/reject schedule linkages, commit actuals to Primavera, view audit trail',
    roleDescription: 'Planner View: Authorized to review and approve schedule linkages',
    color: 'blue'
  },
  {
    name: 'Ravi Kumar',
    email: 'supervisor@progressbridge.demo',
    role: 'SUPERVISOR',
    title: 'Site Execution In-Charge',
    department: 'Site Execution (Piping & Mechanical)',
    defaultRoute: '/time-agent',
    landingName: 'Field Time Agent Copilot',
    allowedNavs: ['/time-agent', '/ingestion', '/events', '/schedule'],
    permissions: 'Submit activity updates, natural language Time Agent voice/text logging, view site logs',
    roleDescription: 'Supervisor View: Focused on Time Agent & field data capture',
    color: 'emerald'
  },
  {
    name: 'Vikramjit Gogoi',
    email: 'manager@progressbridge.demo',
    role: 'PROJECT_MANAGER',
    title: 'Project Manager',
    department: 'Executive Operations',
    defaultRoute: '/analytics',
    landingName: 'Executive Delay Analytics',
    allowedNavs: ['/', '/analytics', '/project-memory', '/schedule', '/schedule-updates', '/audit'],
    permissions: 'Executive PMIS S-Curves, variance tracking, Delay Analytics & Institutional Memory',
    roleDescription: 'Project Manager View: Focused on KPIs, delays & project memory',
    color: 'purple'
  },
  {
    name: 'Amitabh Sen',
    email: 'admin@progressbridge.demo',
    role: 'ADMIN',
    title: 'PMO Administrator',
    department: 'Project Management Office',
    defaultRoute: '/',
    landingName: 'PMO Command Center',
    allowedNavs: ['/', '/ingestion', '/schedule', '/events', '/match-review', '/time-agent', '/schedule-updates', '/analytics', '/project-memory', '/audit', '/settings'],
    permissions: 'Full system oversight, confidence threshold configuration & user administration',
    roleDescription: 'Admin View: Unrestricted access across all 11 modules',
    color: 'indigo'
  }
];

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('progressbridge_user');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        // Find matching full demo user object
        const matched = DEMO_USERS.find(u => u.email === parsed.email);
        if (matched) return matched;
      } catch (e) { /* ignore */ }
    }
    return DEMO_USERS[0]; // default Planner
  });

  const [token, setToken] = useState(() => localStorage.getItem('progressbridge_token') || null);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
  const [demoTourStep, setDemoTourStep] = useState(0);
  const [thresholds, setThresholds] = useState({ high: 0.80, medium: 0.60 });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('progressbridge_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('progressbridge_token', token);
    } else {
      localStorage.removeItem('progressbridge_token');
    }
  }, [token]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const switchPersona = (user) => {
    setCurrentUser(user);
    showNotification(`Switched active persona to ${user.name} (${user.role})`, 'info');
  };

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res.success) {
        setToken(res.token);
        const matchedUser = DEMO_USERS.find(u => u.email === res.user.email) || {
          ...res.user,
          allowedNavs: ['/', '/ingestion', '/schedule', '/events', '/match-review', '/time-agent', '/schedule-updates', '/analytics', '/project-memory', '/audit', '/settings']
        };
        setCurrentUser(matchedUser);
        showNotification(`Welcome back, ${matchedUser.name}! (${matchedUser.role})`, 'success');
        return { success: true };
      } else {
        showNotification(res.error || 'Login failed', 'error');
        return { success: false, error: res.error };
      }
    } catch (err) {
      showNotification(err.message || 'Login error', 'error');
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('progressbridge_token');
    showNotification('Logged out successfully', 'info');
  };

  const resetDemoState = async () => {
    try {
      const res = await api.resetDemo();
      if (res.success) {
        showNotification('Demo environment reset successfully! Baseline data reloaded.', 'success');
        return true;
      }
    } catch (err) {
      showNotification('Failed to reset demo: ' + err.message, 'error');
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchPersona,
        token,
        login,
        logout,
        isDemoTourOpen,
        setIsDemoTourOpen,
        demoTourStep,
        setDemoTourStep,
        thresholds,
        setThresholds,
        notification,
        showNotification,
        resetDemoState
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
