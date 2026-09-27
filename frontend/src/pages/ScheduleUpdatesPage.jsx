import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  CalendarCheck2, Clock, AlertTriangle, CheckCircle2, 
  RefreshCw, ArrowRight, ArrowUpRight, ArrowDownRight, Layers, SlidersHorizontal 
} from 'lucide-react';

export function ScheduleUpdatesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState('ALL'); // 'ALL' | 'DELAYED' | 'ON_TIME' | 'EARLY'

  const { showNotification } = useApp();

  const fetchUpdatedSchedule = async () => {
    try {
      setLoading(true);
      const res = await api.getSchedule();
      if (res.success) {
        // Filter to activities that have actual start recorded
        const activeOrCompleted = (res.activities || []).filter(a => a.actual_start || a.status === 'DELAYED');
        setActivities(activeOrCompleted);
      }
    } catch (err) {
      showNotification('Failed to fetch schedule updates: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdatedSchedule();
  }, []);

  const filtered = activities.filter(a => {
    if (filterState === 'ALL') return true;
    if (filterState === 'DELAYED') return a.status === 'DELAYED' || a.delay_days > 0;
    if (filterState === 'ON_TIME') return a.status === 'ON_TIME' || (a.delay_days === 0 && a.status === 'COMPLETED');
    if (filterState === 'EARLY') return a.status === 'EARLY';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Real-Time Schedule Update Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 9: Dynamic variance, actual duration, and delay calculations following match approvals from site reports.
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {['ALL', 'DELAYED', 'ON_TIME', 'EARLY'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterState(st)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterState === st ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 font-semibold block mb-1">Total Linked Actuals</span>
          <span className="text-2xl font-extrabold text-slate-900">{activities.length}</span>
          <p className="text-slate-500 mt-1">Activities with verified field timestamps</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs bg-rose-50/20">
          <span className="text-rose-600 font-semibold block mb-1">Delayed Milestones</span>
          <span className="text-2xl font-extrabold text-rose-700">
            {activities.filter(a => a.status === 'DELAYED' || a.delay_days > 0).length}
          </span>
          <p className="text-slate-500 mt-1">Exceeding baseline planned finish window</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
          <span className="text-emerald-600 font-semibold block mb-1">On-Time / Early Milestones</span>
          <span className="text-2xl font-extrabold text-emerald-700">
            {activities.filter(a => a.status === 'ON_TIME' || a.status === 'EARLY').length}
          </span>
          <p className="text-slate-500 mt-1">Completed within baseline planned duration</p>
        </div>
      </div>

      {/* Updates Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
            Calculating Schedule Variances...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
            No schedule updates match current filter.
          </div>
        ) : (
          filtered.map((item) => {
            const isDelayed = item.status === 'DELAYED' || item.delay_days > 0;
            const isEarly = item.status === 'EARLY';
            const isOnTime = item.status === 'ON_TIME';

            return (
              <div
                key={item.activity_id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                      {item.activity_id}
                    </span>
                    <span className="font-bold text-sm text-slate-900">
                      {item.activity_name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {item.discipline}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        isDelayed
                          ? 'bg-rose-100 text-rose-800'
                          : isEarly
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isDelayed && <AlertTriangle className="w-3.5 h-3.5" />}
                      {isOnTime && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {item.status.replace('_', ' ')}
                      {item.delay_days > 0 && ` (+${item.delay_days} days)`}
                    </span>
                  </div>
                </div>

                {/* Timeline Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                      Planned Window
                    </span>
                    <p className="font-mono font-semibold text-slate-800">
                      {item.planned_start} → {item.planned_end}
                    </p>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Duration: {item.planned_duration} days
                    </span>
                  </div>

                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block mb-1">
                      Actual Execution Window
                    </span>
                    <p className="font-mono font-semibold text-blue-950">
                      {item.actual_start || 'Pending'} → {item.actual_end || 'In Progress'}
                    </p>
                    <span className="text-[11px] text-blue-600 mt-1 block">
                      Duration: {item.actual_duration ? `${item.actual_duration} days` : 'Active'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                      Variance & Delay
                    </span>
                    <p className={`font-mono text-base font-bold ${
                      item.delay_days > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {item.delay_days > 0 ? `+${item.delay_days} days delay` : '0 days variance'}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Compared to baseline
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                        Physical Progress
                      </span>
                      <p className="font-mono text-base font-bold text-slate-800">
                        {item.progress_percentage || 0}%
                      </p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${item.progress_percentage || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
