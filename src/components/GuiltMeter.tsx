import React from 'react';
import { Gauge, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GuiltMeter: React.FC = () => {
  const { focusConversionRate, totalCompletedStudyHours, totalCollegeHours, totalTransitHours } = useApp();

  // Rating color gradient logic
  const getEfficiencyColor = (rate: number) => {
    if (rate >= 50) return { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/30', label: 'High Focus' };
    if (rate >= 25) return { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30', label: 'Moderate' };
    return { text: 'text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500/30', label: 'Action Required' };
  };

  const status = getEfficiencyColor(focusConversionRate);

  return (
    <div className="bg-[#1E293B]/90 rounded-xl p-5 border border-slate-700/60 shadow-lg relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Gauge className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 tracking-wide font-sans">
              Guilt Meter & Focus Conversion
            </h2>
            <p className="text-xs text-slate-400">Deep Study vs College & Transit Dead-Time</p>
          </div>
        </div>

        <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${status.text} bg-slate-900 border ${status.border}`}>
          {status.label}
        </span>
      </div>

      {/* Main Gauge Visual */}
      <div className="mt-2 space-y-3">
        
        {/* Large Percentage */}
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-bold font-mono tracking-tight text-slate-100 flex items-baseline space-x-1">
            <span>{focusConversionRate}%</span>
            <span className="text-xs font-sans text-slate-400 font-normal">Conversion</span>
          </div>
          <div className="text-right text-xs font-mono text-slate-400">
            <div>{totalCompletedStudyHours.toFixed(1)}h Study</div>
            <div className="text-[10px] text-slate-500">vs {(totalCollegeHours + totalTransitHours).toFixed(1)}h Campus/Transit</div>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="relative w-full bg-slate-900/90 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${status.bg} shadow-sm`}
            style={{ width: `${Math.max(4, focusConversionRate)}%` }}
          />
        </div>

        {/* Dynamic Insight Banner */}
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs flex items-start space-x-2 text-slate-300">
          {focusConversionRate >= 50 ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <p className="leading-relaxed">
            {focusConversionRate >= 50
              ? "Optimal focus! You've converted over half of your available daylight time into deep study."
              : focusConversionRate >= 25
              ? "Fair conversion. Try knocking out 1-2 P1 tasks to boost study output tonight."
              : "High deficit detected. Transit dead-time is eating into study capacity. Run Triage Plan now."}
          </p>
        </div>

      </div>

    </div>
  );
};
