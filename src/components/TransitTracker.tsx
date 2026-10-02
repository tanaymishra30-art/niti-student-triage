import React, { useState, useEffect } from 'react';
import { Navigation, Home, Clock, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TransitTracker: React.FC = () => {
  const { transitState, startTransit, reachHome, resetTransit, setIsTriageModalOpen } = useApp();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live timer tick when in transit
  useEffect(() => {
    let interval: any = null;
    if (transitState.status === 'in_transit' && transitState.leftCollegeTime) {
      const updateTimer = () => {
        const diff = Math.floor((Date.now() - (transitState.leftCollegeTime || Date.now())) / 1000);
        setElapsedSeconds(Math.max(0, diff));
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [transitState.status, transitState.leftCollegeTime]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const formatTimeStr = (timestamp: number | null) => {
    if (!timestamp) return '--:--';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-[#1E293B]/90 rounded-xl p-5 border border-slate-700/60 shadow-lg relative overflow-hidden">
      
      {/* Top Badge & Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Navigation className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 tracking-wide font-sans">
              Transit & Triage Engine
            </h2>
            <p className="text-xs text-slate-400">Commute & Homecoming Dead-Time Automation</p>
          </div>
        </div>
        
        {transitState.status === 'triaged' && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Logged
          </span>
        )}
      </div>

      {/* State Machine Action Area */}
      <div className="mt-2">
        {/* State 1: Morning / Idle */}
        {transitState.status === 'idle' && (
          <div className="space-y-3">
            <button
              onClick={startTransit}
              className="w-full group relative py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-900 font-bold text-base shadow-lg shadow-emerald-950/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
            >
              <span className="text-xl">🚶‍♂️</span>
              <span>Left College</span>
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-center text-xs text-slate-400">
              Click when leaving campus to initiate commute dead-time tracking.
            </p>
          </div>
        )}

        {/* State 2: In Transit */}
        {transitState.status === 'in_transit' && (
          <div className="space-y-4 text-center">
            {/* Live Counter Display */}
            <div className="bg-slate-900/80 rounded-lg p-3.5 border border-slate-700/80 inline-block w-full">
              <div className="flex items-center justify-center space-x-2 text-slate-400 text-xs font-mono uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Commute Dead-Time</span>
              </div>
              <div className="text-3xl font-bold font-mono text-amber-400 tracking-tight">
                {formatTimer(elapsedSeconds)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Departed at {formatTimeStr(transitState.leftCollegeTime)}
              </div>
            </div>

            {/* Pulsing I'm Home Button */}
            <button
              onClick={reachHome}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-xl shadow-amber-950/60 transition-all flex items-center justify-center space-x-2 border border-amber-300/30 active:scale-98"
            >
              <Home className="w-5 h-5 text-slate-950" />
              <span>🏠 I'm Home</span>
            </button>
          </div>
        )}

        {/* State 3: Triaged */}
        {transitState.status === 'triaged' && (
          <div className="bg-slate-900/60 rounded-lg p-3.5 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Left College:</span>
              <span className="text-slate-200 font-semibold">{formatTimeStr(transitState.leftCollegeTime)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Arrived Home:</span>
              <span className="text-slate-200 font-semibold">{formatTimeStr(transitState.homeTime)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800">
              <span className="text-slate-400">Commute Duration:</span>
              <span className="text-emerald-400 font-bold text-sm">
                {transitState.commuteDurationMinutes || 0} mins
              </span>
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <button
                onClick={() => setIsTriageModalOpen(true)}
                className="flex-1 py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
              >
                <span>Review Triage Plan</span>
              </button>
              <button
                onClick={resetTransit}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-xs transition-colors"
                title="Restart Transit Tracker"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
