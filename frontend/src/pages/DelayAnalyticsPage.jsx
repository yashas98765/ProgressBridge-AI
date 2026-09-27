import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, Clock, RefreshCw, Layers, 
  HelpCircle, ChevronRight, Filter, ShieldAlert 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend 
} from 'recharts';

const CAUSE_COLORS = {
  'Material Delay': '#ef4444',
  'Weather': '#3b82f6',
  'Manpower Shortage': '#f59e0b',
  'Equipment Delay': '#8b5cf6',
  'Access Constraint': '#ec4899',
  'Approval Delay': '#10b981',
  'Design Change': '#6366f1'
};

const DEFAULT_PALETTE = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899'];

export function DelayAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDiscipline, setSelectedDiscipline] = useState('ALL');
  const [selectedCause, setSelectedCause] = useState('ALL');

  const { showNotification } = useApp();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getDelayAnalytics({
        discipline: selectedDiscipline !== 'ALL' ? selectedDiscipline : undefined,
        cause: selectedCause !== 'ALL' ? selectedCause : undefined
      });
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      showNotification('Failed to load delay analytics: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedDiscipline, selectedCause]);

  const summary = data?.summary || {};
  const records = data?.records || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Delay & Risk Analytics Engine</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 11: Quantitative bottleneck analysis correlating actual site duration overruns with empirical causes.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="ALL">All Disciplines</option>
            <option value="Civil">Civil</option>
            <option value="Piping">Piping</option>
            <option value="Electrical">Electrical</option>
            <option value="Static Equipment">Static Equipment</option>
          </select>

          <select
            value={selectedCause}
            onChange={(e) => setSelectedCause(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="ALL">All Root Causes</option>
            <option value="Material Delay">Material Delay</option>
            <option value="Weather">Weather</option>
            <option value="Manpower Shortage">Manpower Shortage</option>
            <option value="Equipment Delay">Equipment Delay</option>
            <option value="Access Constraint">Access Constraint</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
            Delayed Activities
          </span>
          <span className="text-2xl font-extrabold text-rose-600">{summary.totalDelayed || 5}</span>
          <p className="text-slate-500 mt-1">Activities behind planned baseline</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
            Total Overrun Days
          </span>
          <span className="text-2xl font-extrabold text-amber-600">{summary.totalDelayDays || 15} days</span>
          <p className="text-slate-500 mt-1">Cumulative project schedule drift</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
            Average Delay per Node
          </span>
          <span className="text-2xl font-extrabold text-slate-800">{summary.avgDelayDays || 3.0} days</span>
          <p className="text-slate-500 mt-1">Mean duration variance</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
            Primary Delay Driver
          </span>
          <span className="text-lg font-extrabold text-indigo-700 truncate block">
            {summary.primaryCause || 'Material Delay'}
          </span>
          <p className="text-slate-500 mt-1">Highest frequency root cause</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cause Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-800">Delay Cause Breakdown</h2>
            <p className="text-xs text-slate-400">Classified root cause categorization</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.causesData || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {(data?.causesData || []).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CAUSE_COLORS[entry.name] || DEFAULT_PALETTE[index % DEFAULT_PALETTE.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delay by Discipline Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-800">Cumulative Delay Days by Discipline</h2>
            <p className="text-xs text-slate-400">Piping, Civil, Static Equipment, Electrical</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.disciplineDelayData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="discipline" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="d" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="days" name="Total Delay Days" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Delay Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Delayed Activities Ledger</h2>
          <span className="text-xs text-slate-400">{records.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Activity ID</th>
                <th className="px-4 py-3">Activity Name</th>
                <th className="px-4 py-3">Discipline</th>
                <th className="px-4 py-3">Planned Dur.</th>
                <th className="px-4 py-3">Actual Dur.</th>
                <th className="px-4 py-3">Delay</th>
                <th className="px-4 py-3">Possible Cause</th>
                <th className="px-4 py-3 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading Delays...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-400">
                    No delay records found for current criteria.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">
                      {rec.activity_id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {rec.activity_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {rec.discipline}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {rec.planned_duration}d
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-800 font-bold">
                      {rec.actual_duration}d
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-rose-600">
                      +{rec.delay_days} days
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {rec.possible_cause}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-600">
                      {Math.round((rec.confidence || 0.85) * 100)}%
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
