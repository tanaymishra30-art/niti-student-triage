import React from 'react';
import { PieChart, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatHours } from '../utils/formatTime';

export const TimeAllocationChart: React.FC = () => {
  const { totalCollegeHours, totalTransitHours, totalCompletedStudyHours } = useApp();

  const dayTotalHours = 16; // 16 waking hours in a standard student day
  const usedHours = totalCollegeHours + totalTransitHours + totalCompletedStudyHours;
  const freeHours = Math.max(0, Math.round((dayTotalHours - usedHours) * 10) / 10);

  const collegePct = Math.min(100, Math.round((totalCollegeHours / dayTotalHours) * 100));
  const transitPct = Math.min(100, Math.round((totalTransitHours / dayTotalHours) * 100));
  const studyPct = Math.min(100, Math.round((totalCompletedStudyHours / dayTotalHours) * 100));
  const freePct = Math.max(0, 100 - (collegePct + transitPct + studyPct));

  return (
    <div className="bg-[#1E293B]/90 rounded-xl p-5 border border-slate-700/60 shadow-lg relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <PieChart className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 tracking-wide font-sans">
              Daily Time Allocation Chart
            </h2>
            <p className="text-xs text-slate-400">College vs Transit vs Deep Study</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>16h Daylight Capacity</span>
        </div>
      </div>

      {/* Stacked Bar Visual */}
      <div className="space-y-4">
        
        {/* Progress Bar Container */}
        <div className="w-full bg-slate-900 rounded-xl overflow-hidden h-7 p-1 flex border border-slate-800 space-x-0.5">
          {collegePct > 0 && (
            <div
              style={{ width: `${collegePct}%` }}
              className="bg-indigo-500 hover:bg-indigo-400 h-full rounded-l-lg transition-all duration-500 relative group"
              title={`College Lectures: ${formatHours(totalCollegeHours)} (${collegePct}%)`}
            />
          )}

          {transitPct > 0 && (
            <div
              style={{ width: `${transitPct}%` }}
              className="bg-amber-500 hover:bg-amber-400 h-full transition-all duration-500 relative group"
              title={`Transit Dead-Time: ${formatHours(totalTransitHours)} (${transitPct}%)`}
            />
          )}

          {studyPct > 0 && (
            <div
              style={{ width: `${studyPct}%` }}
              className="bg-emerald-500 hover:bg-emerald-400 h-full transition-all duration-500 relative group"
              title={`Deep Study: ${formatHours(totalCompletedStudyHours)} (${studyPct}%)`}
            />
          )}

          {freePct > 0 && (
            <div
              style={{ width: `${freePct}%` }}
              className="bg-slate-700/60 hover:bg-slate-700 h-full rounded-r-lg transition-all duration-500 relative group"
              title={`Unallocated / Free: ${formatHours(freeHours)} (${freePct}%)`}
            />
          )}
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] text-slate-400 block truncate">College</span>
              <span className="text-slate-100 font-bold">{formatHours(totalCollegeHours)}</span>
            </div>
          </div>

          <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] text-slate-400 block truncate">Transit</span>
              <span className="text-slate-100 font-bold">{formatHours(totalTransitHours)}</span>
            </div>
          </div>

          <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] text-slate-400 block truncate">Deep Study</span>
              <span className="text-slate-100 font-bold">{formatHours(totalCompletedStudyHours)}</span>
            </div>
          </div>

          <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] text-slate-400 block truncate">Unallocated</span>
              <span className="text-slate-100 font-bold">{formatHours(freeHours)}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
