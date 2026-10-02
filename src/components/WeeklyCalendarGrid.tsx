import React, { useState } from 'react';
import { Calendar, Plus, X, Sparkles, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DayOfWeek } from '../types';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const WeeklyCalendarGrid: React.FC = () => {
  const { userProfile, completeOnboarding } = useApp();
  const [inputs, setInputs] = useState<Record<string, string>>({});

  if (!userProfile) return null;

  const timetable = userProfile.weeklyTimetable || [];

  const handleAddSubject = (day: DayOfWeek) => {
    const val = (inputs[day] || '').trim();
    if (!val) return;

    const updated = timetable.map((d) => {
      if (d.day === day) {
        if (d.subjects.includes(val)) return d;
        return { ...d, subjects: [...d.subjects, val] };
      }
      return d;
    });

    completeOnboarding({ ...userProfile, weeklyTimetable: updated });
    setInputs((prev) => ({ ...prev, [day]: '' }));
  };

  const handleRemoveSubject = (day: DayOfWeek, subject: string) => {
    const updated = timetable.map((d) => {
      if (d.day === day) {
        return { ...d, subjects: d.subjects.filter((s) => s !== subject) };
      }
      return d;
    });

    completeOnboarding({ ...userProfile, weeklyTimetable: updated });
  };

  return (
    <div className="bg-[#1E293B]/90 rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 font-sans">
              Master Weekly Timetable Matrix
            </h3>
            <p className="text-xs text-slate-400">7-Day college schedule view & subject management</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 text-indigo-300 border border-slate-800">
          Weekly Matrix
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 pt-1">
        {DAYS.map((dayName) => {
          const dayItem = timetable.find((d) => d.day === dayName) || { day: dayName, isRestDay: dayName === 'Saturday' || dayName === 'Sunday', subjects: [] };
          const isRest = dayItem.isRestDay;
          const isCurrentDay = dayName === (['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]);

          return (
            <div
              key={dayName}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                isCurrentDay
                  ? 'bg-slate-900 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                  : isRest
                  ? 'bg-emerald-950/20 border-emerald-900/40'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-200 font-sans">{dayName.slice(0, 3)}</span>
                  {isCurrentDay && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500 text-slate-950 font-bold">
                      Today
                    </span>
                  )}
                </div>

                {isRest ? (
                  <div className="py-2 text-[10px] font-mono text-emerald-400 text-center bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    🌴 Rest & Debt Day
                  </div>
                ) : (
                  <div className="space-y-1.5 min-h-[60px]">
                    <div className="flex flex-wrap gap-1">
                      {dayItem.subjects.length === 0 ? (
                        <span className="text-[10px] font-mono text-slate-500 italic">No classes</span>
                      ) : (
                        dayItem.subjects.map((sub) => (
                          <span
                            key={sub}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-mono flex items-center space-x-1"
                          >
                            <span className="truncate max-w-[70px]">{sub}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSubject(dayName, sub)}
                              className="text-slate-400 hover:text-rose-400"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {!isRest && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-1 mt-2">
                  <input
                    type="text"
                    placeholder="+ Class..."
                    value={inputs[dayName] || ''}
                    onChange={(e) => setInputs((prev) => ({ ...prev, [dayName]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubject(dayName);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-100 font-mono text-[10px] outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSubject(dayName)}
                    className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px]"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
