import React from 'react';
import { useApp, DEMO_USERS } from '../context/AppContext';
import { 
  Settings, Sliders, RefreshCw, ShieldAlert, 
  Cpu, Users, Database, Sparkles, CheckCircle2 
} from 'lucide-react';

export function SettingsPage() {
  const { thresholds, setThresholds, resetDemoState, showNotification } = useApp();

  const handleSaveThresholds = (e) => {
    e.preventDefault();
    showNotification('Matching thresholds updated successfully!', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">System Configuration & Governance Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure AI semantic matching confidence tiers, inspect model parameters, and manage demo personas.
        </p>
      </div>

      {/* Synthetic Data Disclaimer (Mandatory SIH Requirement) */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-blue-950 block">
            SIH26122 Project Data & AI Disclaimer
          </span>
          <p className="text-blue-800 leading-relaxed">
            This prototype uses <strong>synthetic and publicly safe sample project data</strong> and does <strong>not</strong> connect to live Oil India systems or confidential enterprise databases. 
            The schedule-linking engine uses open-source embeddings, TF-IDF n-gram vectorization, Levenshtein fuzzy string matching, and deterministic discipline rules to demonstrate the AI-assisted schedule-linking concept without dependency on expensive external paid APIs.
          </p>
        </div>
      </div>

      {/* Thresholds Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-800">
            Configurable Matching Confidence Thresholds
          </h2>
        </div>

        <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="font-bold text-slate-800 block mb-1">
                High Confidence Threshold (Auto-Suggest Match)
              </label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="range"
                  min="0.70"
                  max="0.95"
                  step="0.01"
                  value={thresholds.high}
                  onChange={(e) => setThresholds({ ...thresholds, high: parseFloat(e.target.value) })}
                  className="flex-1"
                />
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-xs">
                  {(thresholds.high * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Matches at or above this score are flagged for immediate auto-suggestion.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="font-bold text-slate-800 block mb-1">
                Medium Confidence Threshold (Planner Review)
              </label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="range"
                  min="0.45"
                  max="0.75"
                  step="0.01"
                  value={thresholds.medium}
                  onChange={(e) => setThresholds({ ...thresholds, medium: parseFloat(e.target.value) })}
                  className="flex-1"
                />
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded text-xs">
                  {(thresholds.medium * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Matches between {Math.round(thresholds.medium * 100)}% and {Math.round(thresholds.high * 100)}% require mandatory planner approval. Below {Math.round(thresholds.medium * 100)}% are flagged as unmatched.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs cursor-pointer transition-colors"
            >
              Save Thresholds
            </button>
          </div>
        </form>
      </div>

      {/* Demo Users Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Users className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-800">
            Configured Demo Roles & Accounts
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Demo Email</th>
                <th className="px-4 py-2.5">Default Password</th>
                <th className="px-4 py-2.5">Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEMO_USERS.map((u) => (
                <tr key={u.email} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">{u.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">progress123</td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">{u.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo Reset Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Reset Demo Environment</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Restores all schedule activities, matches, progress events, and project memory to baseline factory state.
          </p>
        </div>

        <button
          onClick={resetDemoState}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          Reset Baseline Data
        </button>
      </div>
    </div>
  );
}
