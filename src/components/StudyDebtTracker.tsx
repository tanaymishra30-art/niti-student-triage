import React from 'react';
import { AlertCircle, ArrowDownRight, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatHours } from '../utils/formatTime';

export const StudyDebtTracker: React.FC = () => {
  const { studyDebtHours, tasks } = useApp();

  const activeTasks = tasks.filter((t) => !t.completed && !t.droppedTonight);

  const p0Debt = Math.round((activeTasks.filter((t) => t.priority === 'P0').reduce((s, t) => s + t.duration, 0) / 60) * 10) / 10;
  const p1Debt = Math.round((activeTasks.filter((t) => t.priority === 'P1').reduce((s, t) => s + t.duration, 0) / 60) * 10) / 10;
  const p2Debt = Math.round((activeTasks.filter((t) => t.priority === 'P2').reduce((s, t) => s + t.duration, 0) / 60) * 10) / 10;

  return (
    <div className="bg-[#1E293B]/90 rounded-xl p-5 border border-slate-700/60 shadow-lg relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 tracking-wide font-sans">
              Study Debt Tracker
            </h2>
            <p className="text-xs text-slate-400">Total Backlog Study Load</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 font-mono">
          <ArrowDownRight className="w-3.5 h-3.5" />
          <span>Auto-deducts on complete</span>
        </div>
      </div>

      {/* Hero Metric Display */}
      <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-1">
            Current Study Debt
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-400 tracking-tight flex items-baseline space-x-2">
            <span>{formatHours(studyDebtHours)}</span>
            <span className="text-xs font-sans text-slate-400 font-normal">Pending Load</span>
          </div>
        </div>

        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
          <Layers className="w-6 h-6 text-rose-400" />
        </div>
      </div>

      {/* Priority Breakdown Pills */}
      <div className="grid grid-cols-3 gap-2 mt-3 text-xs font-mono">
        <div className="p-2 rounded bg-rose-950/30 border border-rose-900/40 text-center">
          <span className="text-[10px] text-rose-400 block font-semibold">P0 Urgent</span>
          <span className="text-slate-100 font-bold text-xs">{formatHours(p0Debt)}</span>
        </div>

        <div className="p-2 rounded bg-emerald-950/30 border border-emerald-900/40 text-center">
          <span className="text-[10px] text-emerald-400 block font-semibold">P1 Sage</span>
          <span className="text-slate-100 font-bold text-xs">{formatHours(p1Debt)}</span>
        </div>

        <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block font-semibold">P2 Defer</span>
          <span className="text-slate-100 font-bold text-xs">{formatHours(p2Debt)}</span>
        </div>
      </div>

    </div>
  );
};
