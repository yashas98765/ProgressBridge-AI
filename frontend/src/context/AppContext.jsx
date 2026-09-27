import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export const DEMO_USERS = [
  {
    name: 'Priyanka Sharma',
    email: 'planner@progressbridge.demo',
    role: 'PLANNER',
    title: 'Lead Planning Engineer',
    department: 'Planning & Scheduling'
  },
  {
    name: 'Ravi Kumar',
    email: 'supervisor@progressbridge.demo',
    role: 'SUPERVISOR',
    title: 'Site Execution In-Charge',
    department: 'Site Execution (Piping & Mechanical)'
  },
  {
    name: 'Vikramjit Gogoi',
    email: 'manager@progressbridge.demo',
    role: 'PROJECT_MANAGER',
    title: 'Project Manager',
    department: 'Executive Operations'
  },
  {
    name: 'Amitabh Sen',
    email: 'admin@progressbridge.demo',
    role: 'ADMIN',
    title: 'PMO Administrator',
    department: 'Project Management Office'
  }
];

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('progressbridge_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
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

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res.success) {
        setToken(res.token);
        setCurrentUser(res.user);
        showNotification(`Welcome back, ${res.user.name}! (${res.user.role})`, 'success');
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
