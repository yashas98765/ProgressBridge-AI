import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  ListTodo, Search, Filter, RefreshCw, Clock, 
  FileText, ArrowRight, UserCheck, Layers 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProgressEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disciplineFilter, setDisciplineFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');

  const { showNotification } = useApp();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.getProgressEvents({
        discipline: disciplineFilter !== 'ALL' ? disciplineFilter : undefined,
        match_status: statusFilter !== 'ALL' ? statusFilter : undefined,
        source_type: sourceFilter !== 'ALL' ? sourceFilter : undefined
      });
      if (res.success) {
        setEvents(res.events || []);
      }
    } catch (err) {
      showNotification('Failed to fetch progress events: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [disciplineFilter, statusFilter, sourceFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Actual Site Progress Events Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 10: Normalized actual progress event stream parsed from daily site reports, Excel trackers, and Time Agent voice logs.
          </p>
        </div>

        <Link
          to="/match-review"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          Review Match Proposals <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-400">Filters:</span>

          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
          >
            <option value="ALL">All Disciplines</option>
            <option value="Piping">Piping</option>
            <option value="Civil">Civil</option>
            <option value="Electrical">Electrical</option>
            <option value="Instrumentation">Instrumentation</option>
            <option value="HSE">HSE</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
          >
            <option value="ALL">All Linking Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="UNMATCHED">Unmatched</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
          >
            <option value="ALL">All Ingestion Sources</option>
            <option value="DAILY_REPORT">Daily Progress Report (TXT)</option>
            <option value="SPREADSHEET">Spreadsheet (XLSX/CSV)</option>
            <option value="PDF_SITE_DIARY">PDF Site Diary</option>
            <option value="TIME_AGENT">Time Agent Voice/Chat</option>
          </select>
        </div>

        <span className="text-slate-400">
          Showing <strong className="text-slate-700">{events.length}</strong> progress events
        </span>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Source Type</th>
                <th className="px-4 py-3">Discipline</th>
                <th className="px-4 py-3">Site Activity Description</th>
                <th className="px-4 py-3">Extracted Start</th>
                <th className="px-4 py-3">Extracted End</th>
                <th className="px-4 py-3">Supervisor</th>
                <th className="px-4 py-3">Schedule Match</th>
                <th className="px-4 py-3 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading Progress Events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-400">
                    No progress events found matching criteria.
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-600">
                        {evt.source_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">
                        {evt.discipline}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 max-w-sm">
                      {evt.activity_description}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {evt.actual_start || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {evt.actual_end || 'In Progress'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {evt.supervisor}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold">
                      {evt.suggested_activity_id ? (
                        <span className="text-blue-700">{evt.suggested_activity_id}</span>
                      ) : (
                        <span className="text-amber-600 font-normal italic">Unmatched</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      {evt.confidence ? `${Math.round(evt.confidence * 100)}%` : '—'}
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
