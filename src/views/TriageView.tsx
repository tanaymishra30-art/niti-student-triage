import React, { useState } from 'react';
import { Moon, Clock, Utensils, AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight, Sparkles, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatHours } from '../utils/formatTime';

export const TriageView: React.FC = () => {
  const {
    targetBedtime,
    setTargetBedtime,
    dinnerDurationMinutes,
    setDinnerDurationMinutes,
    calculateTriage,
    applyTriagePlan,
    resetDemoData,
    studyDebtHours,
    activeTasksCount,
  } = useApp();

  const [inputBedtime, setInputBedtime] = useState(targetBedtime);
  const [inputDinner, setInputDinner] = useState(dinnerDurationMinutes);
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  const currentResult = calculateTriage(inputBedtime, inputDinner);

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
    setAppliedMessage('Triage Plan Applied! Backlog tasks condensed/dropped according to capacity.');
    setTimeout(() => setAppliedMessage(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      
      {/* Title Header */}
      <div className="bg-[#1E293B]/90 rounded-2xl p-6 border border-slate-700/60 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Moon className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-sans">
              Homecoming Triage Control Engine
            </h2>
            <p className="text-xs text-slate-400">Nightly capacity calculator & deficit automated triage</p>
          </div>
        </div>

        <button
          onClick={resetDemoData}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono border border-slate-700 transition-colors flex items-center space-x-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>
      </div>

      {/* Simulator Card */}
      <div className="bg-[#1E293B]/90 rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-6">
        
        {/* Target Bedtime & Dinner Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Target Bedtime */}
          <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-medium text-slate-300 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Target Bedtime:</span>
              </label>
              <input
                type="time"
                value={inputBedtime}
                onChange={(e) => handleBedtimeChange(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs rounded-lg px-3 py-1.5 focus:border-emerald-500 outline-none"
              />
            </div>

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
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40"
              >
                +3h
              </button>
            </div>
          </div>

          {/* Dinner Break */}
          <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <label className="text-xs font-mono font-medium text-slate-300 flex items-center space-x-1.5">
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>Dinner / Wind-down Break:</span>
            </label>

            <div className="flex items-center space-x-2">
              {[0, 15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleDinnerChange(mins)}
                  className={`flex-1 py-2 rounded-lg text-xs font-mono transition-all ${
                    inputDinner === mins
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Live Capacity Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Net Capacity</span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-400">{formatHours(currentResult.usableHours)}</span>
            <span className="text-[10px] text-slate-500 block">Usable Window</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Active Task Load</span>
            <span className="text-xl sm:text-2xl font-bold text-indigo-400">{formatHours(currentResult.pendingTaskHours)}</span>
            <span className="text-[10px] text-slate-500 block">{activeTasksCount} Pending Tasks</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Time Deficit</span>
            <span className={`text-xl sm:text-2xl font-bold ${currentResult.hasDeficit ? 'text-rose-400' : 'text-slate-400'}`}>
              {formatHours(currentResult.deficitHours)}
            </span>
            <span className="text-[10px] text-slate-500 block">{currentResult.hasDeficit ? 'Deficit Over Capacity' : 'No Deficit'}</span>
          </div>
        </div>

        {/* Triage Automation Callout */}
        {currentResult.hasDeficit ? (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/50 space-y-3">
            <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Time Deficit Detected: {formatHours(currentResult.deficitHours)} Over Available Hours</span>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-300 font-mono pl-1">
              <li className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Marking <strong>{currentResult.droppedP2Count} P2 Tasks</strong> as "Drop Tonight"</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Condensing <strong>{currentResult.condensedP1Count} P1 Tasks</strong> duration by 30%</span>
              </li>
            </ul>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex items-center space-x-3 text-xs text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p>
              Your capacity ({currentResult.usableHours}h) is sufficient to complete active tasks ({currentResult.pendingTaskHours}h) without dropping tasks tonight!
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between">
          {appliedMessage ? (
            <div className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{appliedMessage}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-mono">
              Ready to synchronize backlog
            </div>
          )}

          <button
            onClick={handleApply}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center space-x-2 active:scale-95"
          >
            <span>Apply Triage Automation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
