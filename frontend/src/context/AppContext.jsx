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
  const [currentUser, setCurrentUser] = useState(DEMO_USERS[0]); // default Planner
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
  const [demoTourStep, setDemoTourStep] = useState(0);
  const [thresholds, setThresholds] = useState({ high: 0.80, medium: 0.60 });
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
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
