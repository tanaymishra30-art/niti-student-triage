import React, { useState, useEffect, useMemo } from 'react';
import { X, Moon, Clock, AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight, Utensils, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatHours } from '../utils/formatTime';

export const TriageModal: React.FC = () => {
  const {
    isTriageModalOpen,
    setIsTriageModalOpen,
    targetBedtime,
    setTargetBedtime,
    dinnerDurationMinutes,
    setDinnerDurationMinutes,
    calculateTriage,
    applyTriagePlan,
  } = useApp();

  const [inputBedtime, setInputBedtime] = useState(targetBedtime);
  const [inputDinner, setInputDinner] = useState(dinnerDurationMinutes);

  useEffect(() => {
    setInputBedtime(targetBedtime);
    setInputDinner(dinnerDurationMinutes);
  }, [targetBedtime, dinnerDurationMinutes, isTriageModalOpen]);

  // Pure memoized triage result - zero state mutation side effects
  const currentResult = useMemo(() => {
    return calculateTriage(inputBedtime, inputDinner);
  }, [inputBedtime, inputDinner, calculateTriage]);

  if (!isTriageModalOpen) return null;

  const handleBedtimeChange = (newTime: string) => {
    setInputBedtime(newTime);
    setTargetBedtime(newTime);
  };

  const handleDinnerChange = (newMins: number) => {
    setInputDinner(newMins);
    setDinnerDurationMinutes(newMins);
  };

  const addHoursToCurrentTime = (hoursToAdd: number) => {
    const target = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);
    const hrs = target.getHours().toString().padStart(2, '0');
    const mins = target.getMinutes().toString().padStart(2, '0');
    const formatted = `${hrs}:${mins}`;
    handleBedtimeChange(formatted);
  };

  const handleApply = () => {
    applyTriagePlan(currentResult);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
        
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Moon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-sans">
                Homecoming Triage Engine
              </h3>
              <p className="text-xs text-slate-400">Nightly Capacity vs Study Load Automation</p>
            </div>
          </div>

          <button
            onClick={() => setIsTriageModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Bedtime & Usable Hours Calculation */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
          
          {/* Bedtime Selector & Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-medium text-slate-300 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. Target Bedtime:</span>
              </label>
              <input
                type="time"
                value={inputBedtime}
                onChange={(e) => handleBedtimeChange(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs rounded-lg px-3 py-1.5 focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Presets:</span>
              {['23:30', '00:30', '01:30', '02:30'].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleBedtimeChange(time)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                    inputBedtime === time
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {time === '23:30' ? '11:30 PM' : time === '00:30' ? '12:30 AM' : time === '01:30' ? '1:30 AM' : '2:30 AM'}
                </button>
              ))}
              <button
                type="button"
                onClick={() => addHoursToCurrentTime(3)}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 flex items-center space-x-0.5"
              >
                <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                <span>+3 Hours</span>
              </button>
            </div>
          </div>

          {/* Dinner / Wind-down Break Selector */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <label className="text-xs font-mono font-medium text-slate-300 flex items-center space-x-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-400" />
              <span>Dinner / Wind-down Break:</span>
            </label>

            <div className="flex items-center space-x-1">
              {[0, 15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleDinnerChange(mins)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                    inputDinner === mins
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Formula Callout */}
          <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span>Net Usable Study Window:</span>
              <span className="font-bold text-emerald-400 text-xs font-mono">
                {formatHours(currentResult.usableHours)}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Calculated as: ({formatHours(currentResult.availableHoursBeforeDinner)} until bedtime [{inputBedtime}]) - {inputDinner}m Dinner
            </p>
          </div>

          {/* Low/Zero Hours Warning & Recommendation */}
          {currentResult.usableHours <= 0.5 && (
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono flex items-start space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Bedtime is close! Click a preset above (e.g. 1:30 AM or +3 Hours) or decrease dinner break to expand your study window.
              </span>
            </div>
          )}

        </div>

        {/* Step 2: Usable vs Pending Load Comparison */}
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Net Capacity</span>
            <span className="text-lg font-bold text-emerald-400">{formatHours(currentResult.usableHours)}</span>
            <span className="text-[10px] text-slate-500 block">Usable Tonight</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Pending Task Load</span>
            <span className={`text-lg font-bold ${currentResult.hasDeficit ? 'text-rose-400' : 'text-slate-200'}`}>
              {formatHours(currentResult.pendingTaskHours)}
            </span>
            <span className="text-[10px] text-slate-500 block">Active Tasks</span>
          </div>
        </div>

        {/* Step 3: Triage Actions & Deficit Handling */}
        {currentResult.hasDeficit ? (
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 space-y-2.5">
            <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Time Deficit Detected: {formatHours(currentResult.deficitHours)} Over Capacity</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your pending tasks exceed tonight's available hours. Automating triage to protect your bedtime:
            </p>

            <ul className="space-y-1.5 text-xs text-slate-300 font-mono pl-1">
              <li className="flex items-center space-x-2">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Marking <strong>{currentResult.droppedP2Count} P2 Tasks</strong> as "Drop Tonight"</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Condensing <strong>{currentResult.condensedP1Count} P1 Tasks</strong> duration by 30%</span>
              </li>
            </ul>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex items-center space-x-3 text-xs text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p>
              You have sufficient usable hours ({formatHours(currentResult.usableHours)}) to complete all active tasks ({formatHours(currentResult.pendingTaskHours)}) without triage drops!
            </p>
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="pt-2 flex items-center space-x-3">
          <button
            onClick={() => setIsTriageModalOpen(false)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Dismiss
          </button>

          <button
            onClick={handleApply}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center space-x-1.5 active:scale-98"
          >
            <span>Apply Triage Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
