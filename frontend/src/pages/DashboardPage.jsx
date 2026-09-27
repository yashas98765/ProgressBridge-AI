import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, Clock, AlertTriangle, HelpCircle, 
  TrendingUp, Activity, ArrowUpRight, ArrowDownRight, 
  Layers, UploadCloud, GitCompare, MessageSquare, RefreshCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useApp();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
      showNotification('Could not load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        <span>Loading Executive PMIS Dashboard...</span>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const project = data?.project || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-blue-950/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">
              SIH26122 Planning-to-Execution Bridge
            </span>
            <span className="text-xs text-slate-300">Live Project Representation</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {project.name || 'Integrated Infrastructure Construction Project'}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
            Real-time schedule intelligence connecting unstructured site diaries and spreadsheets to baseline L5/L6 Primavera/MS Project schedule nodes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/ingestion"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            Ingest Site Data
          </Link>
          <Link
            to="/match-review"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 border border-white/20 transition-all"
          >
            <GitCompare className="w-4 h-4 text-yellow-300" />
            Match Review ({metrics.pendingReviewEvents || 0})
          </Link>
        </div>
      </div>

      {/* Progress Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Overall S-Curve Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Overall S-Curve Progress</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700">L6 Actuals</span>
          </div>
          <div className="flex items-baseline gap-3 my-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.overallProgress || 68}%</span>
            <span className="text-xs text-slate-400">vs Planned {metrics.plannedProgress || 72}%</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${metrics.overallProgress || 68}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Variance:</span>
            <span className="font-bold text-rose-600 flex items-center">
              <ArrowDownRight className="w-3.5 h-3.5" />
              {metrics.variance || -4}% (Critical Path Delay)
            </span>
          </div>
        </div>

        {/* Total Activities & Completion */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Schedule Activity Status</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="grid grid-cols-3 gap-2 my-2 text-center">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400">Total</p>
              <p className="text-xl font-bold text-slate-800">{metrics.totalActivities || 24}</p>
            </div>
            <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
              <p className="text-xs text-emerald-600">Done</p>
              <p className="text-xl font-bold text-emerald-700">{metrics.completedActivities || 8}</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600">Active</p>
              <p className="text-xl font-bold text-blue-700">{metrics.inProgressActivities || 6}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Delayed Execution Nodes:</span>
            <span className="font-bold text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {metrics.delayedActivities || 5} Activities
            </span>
          </div>
        </div>

        {/* AI Schedule-Linking Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>AI Schedule Linking Engine</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700">Semantic Hybrid</span>
          </div>
          <div className="flex items-baseline gap-3 my-2">
            <span className="text-3xl font-extrabold text-emerald-600">{metrics.avgConfidence || '86%'}</span>
            <span className="text-xs text-slate-400">Avg Matching Confidence</span>
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            Combining character n-grams, engineering token stemming & discipline verification.
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
            <span>Unmatched / Review Queue:</span>
            <span className="font-bold text-blue-600">
              {metrics.unmatchedEvents || 2} unlinked site events
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Planned vs Actual Trend S-Curve (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Cumulative Progress Trend (Planned vs Actual S-Curve)</h2>
              <p className="text-xs text-slate-400">Weekly progress velocity tracking physical site milestone completion</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-600">Aug - Sep 2026</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.completionTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="planned" name="Planned Schedule %" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPlanned)" />
                <Area type="monotone" dataKey="actual" name="Actual Linked Progress %" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Matching Confidence Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-slate-800">Match Confidence Tiers</h2>
            <p className="text-xs text-slate-400">Distribution across governance thresholds</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.confidenceDist || []}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  paddingAngle={4}
                >
                  {(data?.confidenceDist || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                High (≥ 80% Auto-suggest)
              </span>
              <span className="font-bold text-slate-800">{data?.confidenceDist?.[0]?.count || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                Medium (60-79% Review)
              </span>
              <span className="font-bold text-slate-800">{data?.confidenceDist?.[1]?.count || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Low (&lt; 60% Flagged)
              </span>
              <span className="font-bold text-slate-800">{data?.confidenceDist?.[2]?.count || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Discipline-wise Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discipline Progress BarChart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Discipline-wise Execution Progress</h2>
              <p className="text-xs text-slate-400">Civil, Piping, Electrical, Instrumentation, HSE & Mechanical</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.disciplineBreakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="discipline" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="progress" name="Execution Progress %" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delay Root Causes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-slate-800">Identified Delay Drivers</h2>
            <p className="text-xs text-slate-400">Extracted from site notes & actuals</p>
          </div>

          <div className="space-y-3 py-2">
            {(data?.delayCauses || [
              { cause: 'Material Delay', count: 2 },
              { cause: 'Weather', count: 1 },
              { cause: 'Manpower Shortage', count: 1 },
              { cause: 'Equipment Delay', count: 1 }
            ]).map((c, i) => (
              <div key={c.cause} className="flex items-center justify-between text-xs">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {c.cause}
                </span>
                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded">
                  {c.count} {c.count === 1 ? 'event' : 'events'}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/analytics"
            className="w-full mt-3 py-2 text-center text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors block"
          >
            Open Delay & Risk Analytics →
          </Link>
        </div>
      </div>
    </div>
  );
}
