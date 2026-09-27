import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, Search, Filter, RefreshCw, Clock, 
  FileText, CheckCircle2, XCircle, ArrowRight, User 
} from 'lucide-react';

const ACTION_COLORS = {
  'UPLOAD': 'bg-blue-50 text-blue-700 border-blue-200',
  'EXTRACTION': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'MATCH_SUGGESTED': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'MATCH_APPROVED': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'MATCH_REJECTED': 'bg-rose-50 text-rose-700 border-rose-200',
  'SCHEDULE_UPDATED': 'bg-purple-50 text-purple-700 border-purple-200',
  'ACTIVITY_CREATED': 'bg-teal-50 text-teal-700 border-teal-200'
};

export function AuditTrailPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const { showNotification } = useApp();

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditLogs({
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
        search: search.trim() || undefined
      });
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      showNotification('Failed to fetch audit trail: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAuditLogs();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Immutable Audit Trail & Governance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 13: Complete audit ledger tracking every ingestion, extraction, proposal, approval, and schedule update.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit details or activity ID..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden w-64"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            'ALL', 
            'UPLOAD', 
            'EXTRACTION', 
            'MATCH_SUGGESTED', 
            'MATCH_APPROVED', 
            'MATCH_REJECTED', 
            'SCHEDULE_UPDATED'
          ].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                actionFilter === act ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {act.replace('_', ' ')}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400">
          Showing <strong className="text-slate-700">{logs.length}</strong> logged events
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User & Role</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Activity ID</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading Audit Ledger...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                    No audit records found matching query.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">{log.user}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block pl-5">{log.user_role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">
                      {log.activity_id || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-600">
                      {log.confidence ? `${Math.round(log.confidence * 100)}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-md">
                      {log.details}
                      {log.old_value && (
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">
                          Prev: {log.old_value}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
