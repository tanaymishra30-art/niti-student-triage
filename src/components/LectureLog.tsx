import React, { useState } from 'react';
import { BookOpen, Star, CheckCircle, XCircle, Clock, Plus, X, Sun, Trash2, Calendar, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatHours } from '../utils/formatTime';

export const LectureLog: React.FC = () => {
  const { lectures, toggleLectureStatus, updateLectureFocus, addLecture, deleteLecture, totalCollegeHours, isHoliday, toggleHolidayMode, currentDay } = useApp();
  
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [time, setTime] = useState('04:00 PM - 05:30 PM');
  const [durationMinutes, setDurationMinutes] = useState(90);

  // Scope Prompt Modal State
  const [pendingAction, setPendingAction] = useState<{
    type: 'add' | 'delete';
    lectureData?: { name: string; code: string; time: string; durationMinutes: number; status: 'attended' | 'skipped'; focusRating: number };
    deleteId?: string;
    lectureName?: string;
  } | null>(null);

  const handleAddInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const lectureData = {
      name: name.trim(),
      code: code.trim() || 'CLASS',
      time,
      durationMinutes: Number(durationMinutes),
      status: 'attended' as const,
      focusRating: 3,
    };

    setPendingAction({
      type: 'add',
      lectureData,
    });
  };

  const handleDeleteInitiate = (id: string, lectureName: string) => {
    setPendingAction({
      type: 'delete',
      deleteId: id,
      lectureName,
    });
  };

  const executePendingAction = (scope: 'today' | 'all') => {
    if (!pendingAction) return;

    if (pendingAction.type === 'add' && pendingAction.lectureData) {
      addLecture(pendingAction.lectureData, scope);
      setName('');
      setCode('');
      setIsAdding(false);
    } else if (pendingAction.type === 'delete' && pendingAction.deleteId) {
      deleteLecture(pendingAction.deleteId, scope);
    }

    setPendingAction(null);
  };

  return (
    <div className="bg-[#1E293B]/90 rounded-xl p-5 border border-slate-700/60 shadow-lg space-y-4 relative">
      
      {/* Scope Confirmation Modal */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                  <RefreshCw className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-sans">
                    {pendingAction.type === 'add' ? 'Add Lecture Schedule' : 'Remove Lecture'}
                  </h3>
                  <p className="text-xs text-slate-400">Choose scope for this modification</p>
                </div>
              </div>
              <button onClick={() => setPendingAction(null)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Do you want to {pendingAction.type === 'add' ? `add "${pendingAction.lectureData?.name}"` : `remove "${pendingAction.lectureName}"`} for <strong>today only</strong>, or repeat this change for <strong>every {currentDay}</strong> in your master weekly timetable?
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => executePendingAction('today')}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-xs transition-all flex flex-col items-center justify-center text-center space-y-1"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>🗓️ Today Only</span>
              </button>

              <button
                type="button"
                onClick={() => executePendingAction('all')}
                className="py-2.5 px-3 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex flex-col items-center justify-center text-center space-y-1"
              >
                <RefreshCw className="w-4 h-4 text-slate-950" />
                <span>🔄 Every {currentDay}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Header & Holiday Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 tracking-wide font-sans">
              Daily Context & College Lectures
            </h2>
            <p className="text-xs text-slate-400">Opt-out Attendance & Schedule ({currentDay})</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {!isHoliday && (
            <button
              type="button"
              onClick={() => setIsAdding((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Class</span>
            </button>
          )}

          {/* Prominent Holiday Toggle Button */}
          <button
            type="button"
            onClick={toggleHolidayMode}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all flex items-center space-x-1.5 shadow-sm active:scale-95 ${
              isHoliday
                ? 'bg-amber-500 text-slate-950 border border-amber-400 font-extrabold'
                : 'bg-slate-900 text-amber-300 border border-amber-500/30 hover:bg-slate-800 hover:border-amber-500/50'
            }`}
          >
            <span>🌴</span>
            <span>{isHoliday ? 'Holiday Active' : 'Declare Holiday'}</span>
          </button>

          {!isHoliday && (
            <div className="flex items-center space-x-1.5 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800 text-xs font-mono">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span className="text-slate-300">{formatHours(totalCollegeHours)} logged</span>
            </div>
          )}
        </div>
      </div>

      {/* Holiday / Debt Recovery Mode UI */}
      {isHoliday ? (
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-900/40 space-y-3 text-center animate-fadeIn">
          <div className="inline-flex p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Sun className="w-6 h-6 text-amber-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-amber-300 font-sans">
              🌴 It's a free day! Time to wipe out your Study Debt.
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              College lectures and transit dead-time are paused today. Full 8h study capacity allocated for debt recovery.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold">
              ⚡ Debt Recovery Mode Active • Max Capacity 8h
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* Inline Add Form */}
          {isAdding && (
            <form onSubmit={handleAddInitiate} className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg space-y-2 text-xs animate-fadeIn">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Lecture Name (e.g. Physics)"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded p-1.5 text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Code (e.g. PHY-101)"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded p-1.5 text-slate-100 font-mono placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Time slot (04:00 PM - 05:30 PM)"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded p-1.5 text-slate-100 font-mono text-[11px] outline-none focus:border-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Duration mins"
                  min="15"
                  max="240"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded p-1.5 text-slate-100 font-mono outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-2 py-1 text-slate-400 hover:text-slate-200 text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold rounded text-[11px]"
                >
                  Add Class
                </button>
              </div>
            </form>
          )}

          {/* Lecture List */}
          <div className="space-y-2.5">
            {lectures.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center text-xs text-slate-500 font-mono">
                No classes scheduled for today. Click "+ Add Class" to add a lecture.
              </div>
            ) : (
              lectures.map((lecture) => {
                const isAttended = lecture.status === 'attended';

                return (
                  <div
                    key={lecture.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isAttended
                        ? 'bg-slate-900/40 border-slate-700/50 hover:border-slate-600/60'
                        : 'bg-rose-950/20 border-rose-900/40 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-slate-200">
                            {lecture.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {lecture.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 font-mono">
                          {lecture.time} • ({lecture.durationMinutes} mins)
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Opt-out Toggle Button */}
                        <button
                          onClick={() => toggleLectureStatus(lecture.id)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center space-x-1 ${
                            isAttended
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                          }`}
                          title="Click to toggle attendance status (Opt-out)"
                        >
                          {isAttended ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>Attended</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Skipped</span>
                            </>
                          )}
                        </button>

                        {/* Delete Class Button */}
                        <button
                          onClick={() => handleDeleteInitiate(lecture.id, lecture.name)}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
                          title="Delete class from schedule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Focus Rating Bar (Only if attended) */}
                    {isAttended && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400 font-mono">Focus Rating:</span>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => updateLectureFocus(lecture.id, star)}
                              className={`p-0.5 transition-all transform hover:scale-125 ${
                                star <= lecture.focusRating ? 'text-amber-400' : 'text-slate-700 hover:text-slate-500'
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${star <= lecture.focusRating ? 'fill-amber-400' : ''}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

    </div>
  );
};
