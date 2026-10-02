import React from 'react';
import { Gauge, Clock, Layers, CheckCircle2, TrendingUp, Sparkles, AlertTriangle, ArrowRight, ShieldCheck, PieChart, BookOpen, Navigation, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatHours } from '../utils/formatTime';

export const OverviewView: React.FC = () => {
  const {
    lectures,
    focusConversionRate,
    taskCompletionRate,
    studyDebtHours,
    totalCollegeHours,
    totalTransitHours,
    totalCompletedStudyHours,
    totalTasksCount,
    completedTasksCount,
    activeTasksCount,
    subjectDebtBreakdown,
    setActiveView,
    setIsTriageModalOpen,
    transitState,
  } = useApp();

  const subjectFocusAnalytics = React.useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    lectures.forEach((lec) => {
      if (lec.status === 'attended') {
        const key = lec.name;
        if (!map[key]) map[key] = { total: 0, count: 0 };
        map[key].total += lec.focusRating;
        map[key].count += 1;
      }
    });

    return Object.entries(map).map(([subject, data]) => ({
      subject,
      avgRating: Math.round((data.total / data.count) * 10) / 10,
      count: data.count,
    }));
  }, [lectures]);

  const getEfficiencyColor = (rate: number) => {
    if (rate >= 50) return { text: 'text-emerald-400', stroke: '#10B981', label: 'High Focus' };
    if (rate >= 25) return { text: 'text-amber-400', stroke: '#F59E0B', label: 'Moderate' };
    return { text: 'text-rose-400', stroke: '#EF4444', label: 'Action Required' };
  };

  const focusStatus = getEfficiencyColor(focusConversionRate);
  const completionStatus = getEfficiencyColor(taskCompletionRate);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Hero Percentages & Circular Gauge Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Ring 1: Focus Conversion Rate */}
        <div className="bg-[#1E293B]/90 rounded-2xl p-6 border border-slate-700/60 shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Gauge className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                Focus Conversion
              </h3>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${focusStatus.text} bg-slate-900 border-slate-700`}>
              {focusStatus.label}
            </span>
          </div>

          <div className="my-4 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-4xl font-extrabold font-mono text-slate-100 tracking-tight">
                {focusConversionRate}%
              </div>
              <p className="text-xs text-slate-400">
                Deep Study vs Campus & Transit
              </p>
            </div>

            {/* SVG Progress Ring */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeDasharray={`${focusConversionRate}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke={focusStatus.stroke}
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-xs font-mono font-bold text-slate-200">
                {focusConversionRate}%
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800 flex justify-between">
            <span>{formatHours(totalCompletedStudyHours)} Study</span>
            <span>{formatHours(totalCollegeHours + totalTransitHours)} College/Transit</span>
          </div>
        </div>

        {/* Ring 2: Task Completion Percentage */}
        <div className="bg-[#1E293B]/90 rounded-2xl p-6 border border-slate-700/60 shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                Task Completion Rate
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md text-indigo-300 bg-slate-900 border border-slate-700">
              {completedTasksCount} / {totalTasksCount} Done
            </span>
          </div>

          <div className="my-4 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-4xl font-extrabold font-mono text-slate-100 tracking-tight">
                {taskCompletionRate}%
              </div>
              <p className="text-xs text-slate-400">
                Backlog Tasks Cleared
              </p>
            </div>

            {/* SVG Progress Ring */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeDasharray={`${taskCompletionRate}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="#6366F1"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-xs font-mono font-bold text-slate-200">
                {taskCompletionRate}%
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800 flex justify-between">
            <span>{activeTasksCount} Pending</span>
            <span>{completedTasksCount} Completed</span>
          </div>
        </div>

        {/* Card 3: Study Debt Load Meter */}
        <div className="bg-[#1E293B]/90 rounded-2xl p-6 border border-slate-700/60 shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <Layers className="w-4 h-4 text-rose-400" />
              </div>
              <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                Study Debt Index
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md text-rose-400 bg-slate-900 border border-slate-700">
              Active Load
            </span>
          </div>

          <div className="my-4 space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-rose-400 tracking-tight flex items-baseline space-x-2">
              <span>{formatHours(studyDebtHours)}</span>
              <span className="text-xs font-sans text-slate-400 font-normal">Accumulated Debt</span>
            </div>
            <p className="text-xs text-slate-400">
              Deducts dynamically as tasks are checked complete
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setIsTriageModalOpen(true)}
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
            >
              <span>Run Homecoming Triage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Main Graphs & Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Graph A: Subject-wise Study Debt Distribution (Visual Bar Graph) */}
        <div className="bg-[#1E293B]/90 rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 font-sans">
                  Subject-wise Study Debt Graph
                </h3>
                <p className="text-xs text-slate-400">Hours owed per engineering subject</p>
              </div>
            </div>
            <button
              onClick={() => setActiveView('tasks')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-mono font-medium flex items-center space-x-1"
            >
              <span>Manage Tasks</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Visual SVG Bar Graph */}
          <div className="space-y-3 pt-2">
            {subjectDebtBreakdown.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">
                No active study debt! All subjects clear.
              </div>
            ) : (
              subjectDebtBreakdown.map((item) => {
                const maxDebt = Math.max(...subjectDebtBreakdown.map((s) => s.debtHours), 1);
                const pct = Math.min(100, Math.round((item.debtHours / maxDebt) * 100));

                return (
                  <div key={item.subject} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-200 font-semibold">{item.subject}</span>
                      <span className="text-slate-400">{formatHours(item.debtHours)} ({item.count} task{item.count > 1 ? 's' : ''})</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3.5 p-0.5 border border-slate-800">
                      <div
                        style={{ width: `${Math.max(6, pct)}%`, backgroundColor: item.color }}
                        className="h-full rounded-full transition-all duration-700 shadow-sm"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Graph B: Daily Time Allocation Breakdown */}
        <div className="bg-[#1E293B]/90 rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <PieChart className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 font-sans">
                  Daily Daylight Allocation
                </h3>
                <p className="text-xs text-slate-400">16-Hour capacity usage breakdown</p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              16h Daylight
            </span>
          </div>

          {/* Stacked Capacity Bar */}
          <div className="space-y-4 pt-2">
            <div className="w-full bg-slate-900 rounded-xl overflow-hidden h-8 p-1 flex border border-slate-800 space-x-0.5">
              {totalCollegeHours > 0 && (
                <div
                  style={{ width: `${Math.min(100, Math.round((totalCollegeHours / 16) * 100))}%` }}
                  className="bg-indigo-500 h-full rounded-l-lg transition-all duration-500"
                  title={`College: ${formatHours(totalCollegeHours)}`}
                />
              )}

              {totalTransitHours > 0 && (
                <div
                  style={{ width: `${Math.min(100, Math.round((totalTransitHours / 16) * 100))}%` }}
                  className="bg-amber-500 h-full transition-all duration-500"
                  title={`Transit: ${formatHours(totalTransitHours)}`}
                />
              )}

              {totalCompletedStudyHours > 0 && (
                <div
                  style={{ width: `${Math.min(100, Math.round((totalCompletedStudyHours / 16) * 100))}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`Study: ${formatHours(totalCompletedStudyHours)}`}
                />
              )}

              <div
                style={{ width: `${Math.max(0, 100 - Math.round(((totalCollegeHours + totalTransitHours + totalCompletedStudyHours) / 16) * 100))}%` }}
                className="bg-slate-700/60 h-full rounded-r-lg transition-all duration-500"
                title="Unallocated Capacity"
              />
            </div>

            {/* Breakdown Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">College</span>
                  <span className="text-slate-100 font-bold">{formatHours(totalCollegeHours)}</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Transit</span>
                  <span className="text-slate-100 font-bold">{formatHours(totalTransitHours)}</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Deep Study</span>
                  <span className="text-slate-100 font-bold">{formatHours(totalCompletedStudyHours)}</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Unallocated</span>
                  <span className="text-slate-100 font-bold">{formatHours(Math.max(0, 16 - (totalCollegeHours + totalTransitHours + totalCompletedStudyHours)))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Card C: Subject Focus Rating Analytics */}
      <div className="bg-[#1E293B]/90 rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 font-sans">
                Subject Focus Rating Analytics
              </h3>
              <p className="text-xs text-slate-400">Average lecture engagement & focus scores</p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('transit')}
            className="text-xs text-amber-400 hover:text-amber-300 font-mono font-medium flex items-center space-x-1"
          >
            <span>Lecture Log</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          {subjectFocusAnalytics.length === 0 ? (
            <div className="col-span-full text-center py-6 text-slate-500 text-xs font-mono">
              No lecture focus ratings recorded for today yet.
            </div>
          ) : (
            subjectFocusAnalytics.map((item) => (
              <div key={item.subject} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-200 font-sans">{item.subject}</span>
                  <span className="text-[10px] font-mono text-slate-400">({item.count} class{item.count > 1 ? 'es' : ''})</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= Math.round(item.avgRating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-400">{item.avgRating} / 5.0</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Navigation Quick Jumps Bar */}
      <div className="bg-[#1E293B]/90 rounded-2xl p-5 border border-slate-700/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 font-sans">Quick Command Shortcuts</h4>
            <p className="text-xs text-slate-400">Jump directly into specialized productivity sub-workspaces</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveView('transit')}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-1.5"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Transit & Schedule</span>
          </button>

          <button
            onClick={() => setActiveView('tasks')}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tasks & Shredder</span>
          </button>
        </div>
      </div>

    </div>
  );
};
