import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, XCircle, RefreshCw, GitCompare, 
  ArrowRight, ShieldCheck, AlertTriangle, Search, 
  Check, X, Sparkles, Filter, ChevronRight, Layers, SlidersHorizontal 
} from 'lucide-react';

export function MatchReviewPage() {
  const [matches, setMatches] = useState([]);
  const [scheduleActivities, setScheduleActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [disciplineFilter, setDisciplineFilter] = useState('ALL');
  const [changeModalMatch, setChangeModalMatch] = useState(null);
  const [selectedNewActivityId, setSelectedNewActivityId] = useState('');

  // Interactive Live Matching Sandbox
  const [sandboxText, setSandboxText] = useState('Spool erected on Line 24');
  const [sandboxDiscipline, setSandboxDiscipline] = useState('Piping');
  const [sandboxResult, setSandboxResult] = useState(null);
  const [testingMatch, setTestingMatch] = useState(false);

  const { showNotification, currentUser } = useApp();

  const fetchMatchesAndSchedule = async () => {
    try {
      setLoading(true);
      const [mRes, sRes] = await Promise.all([
        api.getMatches({ review_status: filterStatus !== 'ALL' ? filterStatus : undefined, discipline: disciplineFilter !== 'ALL' ? disciplineFilter : undefined }),
        api.getSchedule()
      ]);
      if (mRes.success) setMatches(mRes.matches || []);
      if (sRes.success) setScheduleActivities(sRes.activities || []);
    } catch (err) {
      console.error(err);
      showNotification('Failed to fetch match review queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchesAndSchedule();
  }, [filterStatus, disciplineFilter]);

  const handleApprove = async (matchId) => {
    try {
      const res = await api.approveMatch(matchId, {
        user: currentUser.name,
        comments: `Approved by ${currentUser.name} (${currentUser.role})`
      });
      if (res.success) {
        showNotification(`Match approved! Schedule node ${res.scheduleActivity?.activity_id} updated.`, 'success');
        fetchMatchesAndSchedule();
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleReject = async (matchId) => {
    const reason = prompt('Please provide reason for rejecting this match:', 'Description does not correspond to this schedule package');
    if (!reason) return;
    try {
      const res = await api.rejectMatch(matchId, {
        user: currentUser.name,
        reason
      });
      if (res.success) {
        showNotification('Match marked as rejected.', 'success');
        fetchMatchesAndSchedule();
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleChangeMatchSubmit = async () => {
    if (!changeModalMatch || !selectedNewActivityId) return;
    try {
      const res = await api.changeMatch(changeModalMatch._id, {
        newActivityId: selectedNewActivityId,
        user: currentUser.name,
        comments: `Planner redirected link to ${selectedNewActivityId}`
      });
      if (res.success) {
        showNotification(`Match changed to ${selectedNewActivityId}`, 'success');
        setChangeModalMatch(null);
        setSelectedNewActivityId('');
        fetchMatchesAndSchedule();
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const runSandboxMatch = async () => {
    if (!sandboxText) return;
    setTestingMatch(true);
    try {
      const res = await api.testAIMatch(sandboxText, sandboxDiscipline);
      setSandboxResult(res);
    } catch (err) {
      showNotification('Error testing AI match: ' + err.message, 'error');
    } finally {
      setTestingMatch(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Semantic Activity Matching & Planner Review</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 6 & 7: Bridge actual field descriptions to Primavera/MS Project L5/L6 schedule activities with explainable confidence scoring.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === st ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All Reviews' : st}
              </button>
            ))}
          </div>

          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Disciplines</option>
            <option value="Piping">Piping</option>
            <option value="Civil">Civil</option>
            <option value="Electrical">Electrical</option>
            <option value="Instrumentation">Instrumentation</option>
            <option value="HSE">HSE</option>
          </select>
        </div>
      </div>

      {/* Interactive Match Testing Sandbox */}
      <div className="bg-linear-to-r from-blue-50 via-indigo-50/50 to-white p-5 rounded-2xl border border-blue-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Live AI Matching Engine Sandbox
            </span>
          </div>
          <span className="text-[11px] text-blue-700 font-semibold bg-blue-100/70 px-2 py-0.5 rounded">
            Interactive Test
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-6">
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Field Site Description (Unstructured)
            </label>
            <input
              type="text"
              value={sandboxText}
              onChange={(e) => setSandboxText(e.target.value)}
              placeholder="e.g. Spool erected on Line 24"
              className="w-full text-xs font-medium px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Discipline
            </label>
            <select
              value={sandboxDiscipline}
              onChange={(e) => setSandboxDiscipline(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
            >
              <option value="Piping">Piping</option>
              <option value="Civil">Civil</option>
              <option value="Electrical">Electrical</option>
              <option value="Instrumentation">Instrumentation</option>
              <option value="HSE">HSE</option>
            </select>
          </div>

          <div className="md:col-span-3 pt-4">
            <button
              onClick={runSandboxMatch}
              disabled={testingMatch}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              {testingMatch ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitCompare className="w-3.5 h-3.5" />}
              Calculate Match
            </button>
          </div>
        </div>

        {/* Sandbox Output Banner */}
        {sandboxResult && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-blue-200 shadow-xs animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">Suggested Match:</span>
                <span className="font-mono text-xs font-bold text-blue-700 px-2 py-0.5 bg-blue-50 rounded">
                  {sandboxResult.suggestedActivityId || 'None'} — {sandboxResult.activityName}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  sandboxResult.finalConfidence >= 0.80 ? 'bg-emerald-100 text-emerald-700' :
                  sandboxResult.finalConfidence >= 0.60 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {Math.round((sandboxResult.finalConfidence || 0) * 100)}% Confidence
                </span>
              </div>
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Reasoning:</span> {sandboxResult.reason}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs shrink-0 font-mono text-slate-500">
              <span>Semantic: {sandboxResult.semanticScore}</span>
              <span>•</span>
              <span>Keyword: {sandboxResult.keywordScore}</span>
              <span>•</span>
              <span>Discipline: {sandboxResult.disciplineScore}</span>
            </div>
          </div>
        )}
      </div>

      {/* Review Queue Cards & Table */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span>Loading match candidates...</span>
          </div>
        ) : matches.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
            No matches found in review queue for current filters.
          </div>
        ) : (
          matches.map((item) => {
            const confPercent = Math.round((item.final_confidence || 0) * 100);
            const isHigh = item.final_confidence >= 0.80;
            const isMed = item.final_confidence >= 0.60 && item.final_confidence < 0.80;
            const isLow = item.final_confidence < 0.60;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left: Comparison Block */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                      {item.discipline || 'General'}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isHigh ? 'bg-emerald-100 text-emerald-800' :
                        isMed ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {confPercent}% Match Confidence
                    </span>

                    <span className="text-xs text-slate-400">•</span>

                    <span className={`text-xs font-bold ${
                      item.review_status === 'APPROVED' ? 'text-emerald-600' :
                      item.review_status === 'REJECTED' ? 'text-rose-600' : 'text-amber-600'
                    }`}>
                      {item.review_status}
                    </span>
                  </div>

                  {/* Actual vs Planned side-by-side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Actual Site Input
                      </span>
                      <p className="font-semibold text-slate-900 text-sm">
                        "{item.actual_description}"
                      </p>
                      {item.event_id && (
                        <div className="text-[11px] text-slate-500 mt-1 font-mono">
                          Dates: {item.event_id.actual_start || 'Unspecified'} → {item.event_id.actual_end || 'In Progress'}
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/60">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                        Suggested L5/L6 Schedule Node
                      </span>
                      <p className="font-semibold text-blue-950 text-sm flex items-center gap-1.5">
                        <span className="font-mono bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded text-xs font-bold">
                          {item.activity_id}
                        </span>
                        {item.planned_activity_name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Discipline: {item.discipline} • WBS: L6 Executable Activity
                      </p>
                    </div>
                  </div>

                  {/* Explanation breakdown */}
                  <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700 shrink-0">AI Match Rationale:</span>
                    <span className="leading-snug">{item.reason || 'Semantic and token similarity match.'}</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-row lg:flex-col gap-2 shrink-0 justify-end">
                  {item.review_status === 'PENDING' ? (
                    currentUser?.role === 'SUPERVISOR' ? (
                      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-center text-xs text-amber-900 max-w-[200px]">
                        <span className="font-bold text-[11px] block">Field Supervisor Persona</span>
                        <span className="text-[10px] text-amber-700 block mt-0.5">
                          Read-only: Planner approval required to link to baseline schedule
                        </span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleApprove(item._id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve Match
                        </button>

                        <button
                          onClick={() => handleReject(item._id)}
                          className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>

                        <button
                          onClick={() => {
                            setChangeModalMatch(item);
                            setSelectedNewActivityId(item.activity_id);
                          }}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          Change Match
                        </button>
                      </>
                    )
                  ) : (
                    <div className="text-right">
                      <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 inline-block">
                        Resolved ({item.review_status})
                      </span>
                      {item.reviewed_by && (
                        <p className="text-[10px] text-slate-400 mt-1">by {item.reviewed_by}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Change Match Modal */}
      {changeModalMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Redirect Activity Link
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select another baseline L5/L6 schedule node for "{changeModalMatch.actual_description}".
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Target Schedule Activity
                </label>
                <select
                  value={selectedNewActivityId}
                  onChange={(e) => setSelectedNewActivityId(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {scheduleActivities.map((act) => (
                    <option key={act.activity_id} value={act.activity_id}>
                      [{act.activity_id}] ({act.discipline}) {act.activity_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setChangeModalMatch(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangeMatchSubmit}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Save & Reassign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
