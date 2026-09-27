import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  Brain, Search, Sparkles, BookOpen, Clock, 
  AlertTriangle, CheckCircle2, TrendingUp, RefreshCw, Lightbulb 
} from 'lucide-react';

export function ProjectMemoryPage() {
  const [memoryRecords, setMemoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('ALL');

  const { showNotification } = useApp();

  const fetchMemory = async (q = '') => {
    try {
      setLoading(true);
      const res = await api.getProjectMemory({
        q: q.trim() || undefined,
        discipline: selectedDiscipline !== 'ALL' ? selectedDiscipline : undefined
      });
      if (res.success) {
        setMemoryRecords(res.records || []);
      }
    } catch (err) {
      showNotification('Failed to fetch institutional memory: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemory(searchQuery);
  }, [selectedDiscipline]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMemory(searchQuery);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Institutional Project Memory Layer</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 12: Empirical historical execution patterns, actual vs planned durations, recurring bottlenecks, and pre-emptive mitigations.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search e.g. 'spool erection'..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden w-64"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Suggested Quick Searches */}
      <div className="flex items-center gap-2 text-xs flex-wrap">
        <span className="text-slate-400 font-semibold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Common queries:
        </span>
        {['Spool Erection', 'Cable Tray', 'Concrete Pouring', 'Hydrostatic', 'Alignment'].map((q) => (
          <button
            key={q}
            onClick={() => {
              setSearchQuery(q);
              fetchMemory(q);
            }}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Memory Pattern Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
          Querying Institutional Project Memory...
        </div>
      ) : memoryRecords.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          No historical patterns found matching "{searchQuery}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memoryRecords.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                      {item.discipline}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-1">
                      {item.activity_keyword}
                    </h2>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      {item.historical_record_count} Historical Records
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      Productivity: <strong className="text-slate-700">{item.productivity_rating}</strong>
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Avg Actual</span>
                    <span className="font-extrabold text-slate-800 text-sm">{item.average_actual_duration} days</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Planned Baseline</span>
                    <span className="font-extrabold text-slate-800 text-sm">{item.planned_duration} days</span>
                  </div>
                  <div className="p-2 bg-rose-50/50 rounded-xl border border-rose-100">
                    <span className="text-[10px] text-rose-500 block">Avg Delay</span>
                    <span className="font-extrabold text-rose-700 text-sm">+{item.average_delay} days</span>
                  </div>
                </div>

                {/* Root Cause & Bottleneck */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Most Common Delay Cause:</strong> {item.most_common_delay_cause}
                    </span>
                  </div>

                  {item.recurring_bottleneck && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-600">
                      <span className="font-semibold text-slate-700 block mb-0.5 text-[11px]">
                        Recurring Site Bottleneck:
                      </span>
                      {item.recurring_bottleneck}
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Mitigation */}
              {item.recommended_mitigation && (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-xs text-emerald-950 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-800 block text-[11px]">
                      Recommended Execution Mitigation:
                    </span>
                    {item.recommended_mitigation}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
