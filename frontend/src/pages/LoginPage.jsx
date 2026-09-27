import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, DEMO_USERS } from '../context/AppContext';
import {
  Activity, Lock, Mail, ArrowRight, Sparkles,
  ShieldCheck, RefreshCw, CheckCircle2, User, KeyRound
} from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('planner@progressbridge.demo');
  const [password, setPassword] = useState('progress123');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const { login, resetDemoState, showNotification } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      showNotification('Please enter email and password', 'error');
      return;
    }
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      const userObj = DEMO_USERS.find(u => u.email === email);
      navigate(userObj?.defaultRoute || '/');
    }
  };

  const handleQuickSeedAndLogin = async (user) => {
    setEmail(user.email);
    setPassword('progress123');
    setLoading(true);
    const res = await login(user.email, 'progress123');
    setLoading(false);
    if (res.success) {
      navigate(user.defaultRoute || '/');
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    await resetDemoState();
    setSeeding(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white relative overflow-hidden font-sans">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center relative z-10 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/20 mb-3">
          <Activity className="w-8 h-8" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">
          ProgressBridge <span className="text-blue-400">AI</span>
        </h1>
        
        <p className="text-sm sm:text-base font-semibold text-blue-200 tracking-wide uppercase mb-2">
          "From Site Execution to Schedule Intelligence."
        </p>

        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          AI-powered planning-to-execution bridge for infrastructure project progress tracking.
        </p>

        <div className="mt-3 flex items-center justify-center gap-3">
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300">
            SIH 2026 Problem Statement: <strong className="text-blue-400">SIH26122</strong>
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-400/30 text-emerald-300">
            Oil India Limited
          </span>
        </div>

        {/* Primary Launch Demo CTA */}
        <div className="mt-5 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => handleQuickSeedAndLogin(DEMO_USERS[0])}
            className="w-full py-3.5 px-6 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            Launch Demo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Mandatory Feature Cards: Capture, Link, Learn */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 text-left">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-1">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[11px]">1</span>
              <span>Capture</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Convert reports, spreadsheets and site updates into structured progress events.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-1">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[11px]">2</span>
              <span>Link</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              AI-assisted matching connects field descriptions to L5/L6 schedule activities.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">3</span>
              <span>Learn</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Build institutional memory from real execution patterns.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4 sm:px-0">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl border border-slate-200/80 sm:px-10">

          {/* Quick Seed Credentials Card Banner */}
          <div className="mb-6 p-4 bg-linear-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-2xl border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Choose Demo Persona (Distinct Role & Workspace)</span>
              </div>
              <span className="text-[10px] text-blue-600 font-semibold bg-blue-100/80 px-2 py-0.5 rounded-full">
                SIH Jury RBAC Demo
              </span>
            </div>

            <p className="text-[11px] text-slate-600 mb-3">
              Each persona opens a distinct workspace tailored to their role in the planning-to-execution workflow:
            </p>

            {/* Persona Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => handleQuickSeedAndLogin(user)}
                  className="p-3 bg-white hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-blue-600 rounded-xl text-left transition-all group flex flex-col justify-between shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-white">
                      {user.name}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded border bg-slate-50 text-slate-700 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-400">
                      {user.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 group-hover:text-blue-100 mt-0.5 truncate">
                    {user.department}
                  </span>
                  <div className="mt-2 pt-1.5 border-t border-slate-100 group-hover:border-blue-500 flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-blue-600 group-hover:text-amber-200">
                      ➜ {user.landingName}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Regular Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Demo User Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. planner@progressbridge.demo"
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Demo password: progress123"
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Universal demo credentials password: <code className="text-blue-600 font-bold">progress123</code>
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Authenticating Session...
                  </>
                ) : (
                  <>
                    Sign In to ProgressBridge PMIS
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer controls */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-blue-600' : ''}`} />
              {seeding ? 'Reseeding database...' : 'Reseed Baseline DB'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              Skip to Dashboard →
            </button>
          </div>
        </div>

        {/* Synthetic Data Disclaimer */}
        <p className="text-center text-[11px] text-slate-500 mt-4 max-w-md mx-auto">
          This prototype operates exclusively on synthetic, simulated project data for SIH evaluation and does not connect to live Oil India systems.
        </p>
      </div>
    </div>
  );
}
