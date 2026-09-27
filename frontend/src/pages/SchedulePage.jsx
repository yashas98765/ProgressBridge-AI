import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  Network, Search, Filter, RefreshCw, Calendar, 
  Clock, ArrowUpRight, ArrowDownRight, Layers, Edit, CheckCircle2, AlertTriangle 
} from 'lucide-react';

export function SchedulePage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discipline, setDiscipline] = useState('ALL');
  const [wbsLevel, setWbsLevel] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [editActivity, setEditActivity] = useState(null);

  const { showNotification, currentUser } = useApp();

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await api.getSchedule({
        discipline: discipline !== 'ALL' ? discipline : undefined,
        wbs_level: wbsLevel !== 'ALL' ? wbsLevel : undefined,
        status: status !== 'ALL' ? status : undefined,
        search: search.trim() || undefined
      });
      if (res.success) {
        setActivities(res.activities || []);
      }
    } catch (err) {
      showNotification('Failed to fetch schedule: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [discipline, wbsLevel, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSchedule();
  };

  const handleSaveActivityEdit = async (e) => {
    e.preventDefault();
    if (!editActivity) return;
    try {
      const res = await api.updateSchedule(editActivity.activity_id, {
        actual_start: editActivity.actual_start,
        actual_end: editActivity.actual_end,
        progress_percentage: editActivity.progress_percentage,
        user: currentUser.name,
        comments: `Manual update by ${currentUser.name}`
      });
      if (res.success) {
        showNotification(`Activity ${editActivity.activity_id} updated successfully`, 'success');
        setEditActivity(null);
        fetchSchedule();
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Baseline Schedule & WBS Hierarchy (L1 – L6)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 5: Structured Primavera/MS Project schedule model tracking planned baselines and actual site linkages.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity ID or name..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          <select
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
          >
            <option value="ALL">All Disciplines</option>
            <option value="Piping">Piping</option>
            <option value="Civil">Civil</option>
            <option value="Electrical">Electrical</option>
            <option value="Instrumentation">Instrumentation</option>
            <option value="Mechanical">Mechanical</option>
            <option value="HSE">HSE</option>
          </select>

          <select
            value={wbsLevel}
            onChange={(e) => setWbsLevel(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
          >
            <option value="ALL">All WBS Levels</option>
            <option value="L1">L1 - Project</option>
            <option value="L2">L2 - Discipline Package</option>
            <option value="L4">L4 - System</option>
            <option value="L6">L6 - Executable Micro Activity</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="DELAYED">Delayed</option>
            <option value="ON_TIME">On Time</option>
            <option value="EARLY">Early</option>
          </select>
        </div>

        <div className="text-slate-400 text-xs">
          Showing <span className="font-bold text-slate-700">{activities.length}</span> schedule activities
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Activity ID</th>
                <th className="px-4 py-3">WBS</th>
                <th className="px-4 py-3">Discipline</th>
                <th className="px-4 py-3">Activity Name</th>
                <th className="px-4 py-3">Planned Window</th>
                <th className="px-4 py-3">Actual Window</th>
                <th className="px-4 py-3">Variance</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading Schedule...
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-slate-400">
                    No activities match current criteria.
                  </td>
                </tr>
              ) : (
                activities.map((act) => {
                  const isDelayed = act.status === 'DELAYED' || act.delay_days > 0;
                  const isCompleted = act.progress_percentage === 100 || act.status === 'COMPLETED';

                  return (
                    <tr key={act.activity_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">
                        {act.activity_id}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                          act.wbs_level === 'L6' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {act.wbs_level}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {act.discipline}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {act.activity_name}
                        {act.unit_or_line && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Tag: {act.unit_or_line}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {act.planned_start} → {act.planned_end}
                        <span className="text-[10px] text-slate-400 block">({act.planned_duration}d)</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                        {act.actual_start ? (
                          <>
                            {act.actual_start} → {act.actual_end || 'In Progress'}
                            {act.actual_duration && (
                              <span className="text-[10px] text-slate-400 block">({act.actual_duration}d)</span>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-400 italic">Not recorded</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        {act.variance > 0 ? (
                          <span className="text-rose-600 font-bold">+{act.variance}d</span>
                        ) : act.variance < 0 ? (
                          <span className="text-emerald-600 font-bold">{act.variance}d</span>
                        ) : (
                          <span className="text-slate-400">0d</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${act.progress_percentage || 0}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-slate-600 font-semibold">
                            {act.progress_percentage || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isDelayed
                              ? 'bg-rose-100 text-rose-700'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-700'
                              : act.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {act.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setEditActivity(act)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Activity Actuals"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Activity Modal */}
      {editActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Update Activity Actuals
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              [{editActivity.activity_id}] {editActivity.activity_name}
            </p>

            <form onSubmit={handleSaveActivityEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Actual Start Date</label>
                <input
                  type="date"
                  value={editActivity.actual_start || ''}
                  onChange={(e) => setEditActivity({ ...editActivity, actual_start: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Actual End Date</label>
                <input
                  type="date"
                  value={editActivity.actual_end || ''}
                  onChange={(e) => setEditActivity({ ...editActivity, actual_end: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Progress Percentage ({editActivity.progress_percentage || 0}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editActivity.progress_percentage || 0}
                  onChange={(e) => setEditActivity({ ...editActivity, progress_percentage: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditActivity(null)}
                  className="px-3 py-1.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs"
                >
                  Save & Update Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
