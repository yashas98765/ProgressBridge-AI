import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, ArrowRight, ArrowLeft, CheckCircle2, 
  Layers, UploadCloud, Cpu, CheckSquare, Calendar, 
  AlertTriangle, BookOpen, ShieldCheck, MessageSquare, X, Play
} from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: 'Executive PMIS Dashboard',
    route: '/',
    icon: Layers,
    description: 'Monitor overall progress, planned vs actual S-curves, variance (-4%), discipline progress, and matching confidence.',
    actionText: 'View Dashboard'
  },
  {
    step: 2,
    title: 'Data Ingestion Layer',
    route: '/ingestion',
    icon: UploadCloud,
    description: 'Ingest heterogeneous execution inputs: Free-text DPR, discipline spreadsheets (XLSX/CSV), or scanned Site Diary (PDF). Click sample data buttons for instant demonstration.',
    actionText: 'Go to Ingestion'
  },
  {
    step: 3,
    title: 'Daily Report Extraction',
    route: '/ingestion',
    icon: Cpu,
    description: 'AI extracts activity description ("Spool erection for Line 24"), discipline (Piping), actual start (23 Sep 09:30), actual end (25 Sep 16:45), and supervisor.',
    actionText: 'Review Extraction'
  },
  {
    step: 4,
    title: 'Semantic Matching Engine',
    route: '/match-review',
    icon: Cpu,
    description: 'Matches site phrasing "Spool erected on Line 24" to schedule item "L6-PIP-024 Erect Line 24-XX" with 86% confidence using semantic, keyword, and discipline similarity.',
    actionText: 'See Match Engine'
  },
  {
    step: 5,
    title: 'Planner Review & Governance',
    route: '/match-review',
    icon: CheckSquare,
    description: 'Planners maintain full oversight: Approve high-confidence matches, reject mismatches, or change matched schedule nodes. Never silently discards data.',
    actionText: 'Review Matches'
  },
  {
    step: 6,
    title: 'Real-Time Schedule Linking',
    route: '/schedule-updates',
    icon: Calendar,
    description: 'Upon approval, the system updates actual start, actual end, duration, and delay days on the schedule activity, marking status as ON TIME, DELAYED, or EARLY.',
    actionText: 'View Schedule Updates'
  },
  {
    step: 7,
    title: 'Dynamic Progress Calculation',
    route: '/',
    icon: Layers,
    description: 'Dashboard recalculates project progress %, discipline progress %, and updates variance automatically.',
    actionText: 'Check Updated Dashboard'
  },
  {
    step: 8,
    title: 'Delay & Risk Analytics',
    route: '/analytics',
    icon: AlertTriangle,
    description: 'Identifies delays, analyzes root causes (Material Delay, Weather, Manpower Shortage), and highlights top bottleneck activities.',
    actionText: 'Explore Delay Analytics'
  },
  {
    step: 9,
    title: 'Institutional Project Memory',
    route: '/project-memory',
    icon: BookOpen,
    description: 'Captures empirical execution patterns: Average actual duration (3.4 days) vs planned (2.5 days) for Spool Erection, recurring bottlenecks, and mitigations.',
    actionText: 'Search Project Memory'
  },
  {
    step: 10,
    title: 'Immutable Audit Trail',
    route: '/audit',
    icon: ShieldCheck,
    description: 'Maintains an enterprise audit log recording every file upload, extraction, proposed match, approval, and schedule update with user attribution.',
    actionText: 'Inspect Audit Trail'
  },
  {
    step: 11,
    title: 'Conversational Time Agent',
    route: '/time-agent',
    icon: MessageSquare,
    description: 'Site supervisors report progress naturally: "Line 24 spool erection started today at 9:30 AM". AI extracts activity, line, time, and suggests schedule linkage.',
    actionText: 'Test Time Agent'
  }
];

export function DemoTourModal() {
  const { isDemoTourOpen, setIsDemoTourOpen, demoTourStep, setDemoTourStep, resetDemoState } = useApp();
  const navigate = useNavigate();

  if (!isDemoTourOpen) return null;

  const current = STEPS[demoTourStep];
  const StepIcon = current.icon;

  const goToStep = (index) => {
    setDemoTourStep(index);
    navigate(STEPS[index].route);
  };

  const nextStep = () => {
    if (demoTourStep < STEPS.length - 1) {
      goToStep(demoTourStep + 1);
    } else {
      setIsDemoTourOpen(false);
    }
  };

  const prevStep = () => {
    if (demoTourStep > 0) {
      goToStep(demoTourStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 relative">
          <button 
            onClick={() => setIsDemoTourOpen(false)}
            className="absolute top-4 right-4 p-1 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
              SIH26122 Guided Flow
            </span>
            <span className="text-xs text-blue-200">
              Step {current.step} of {STEPS.length}
            </span>
          </div>

          <h3 className="text-xl font-bold flex items-center gap-2.5">
            <StepIcon className="w-6 h-6 text-blue-200" />
            {current.title}
          </h3>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-slate-600 leading-relaxed text-sm mb-6">
            {current.description}
          </p>

          {/* Stepper dots */}
          <div className="flex items-center justify-between gap-1.5 py-3 border-y border-slate-100 mb-6">
            {STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => goToStep(idx)}
                title={`Step ${s.step}: ${s.title}`}
                className={`flex-1 h-2 rounded-full transition-all ${
                  idx === demoTourStep 
                    ? 'bg-blue-600 ring-2 ring-blue-300' 
                    : idx < demoTourStep 
                      ? 'bg-emerald-500' 
                      : 'bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={resetDemoState}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Reset Demo Data
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevStep}
                disabled={demoTourStep === 0}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>

              <button
                onClick={nextStep}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
              >
                {demoTourStep === STEPS.length - 1 ? (
                  <>Finish Tour <CheckCircle2 className="w-3.5 h-3.5" /></>
                ) : (
                  <>Next Step <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
