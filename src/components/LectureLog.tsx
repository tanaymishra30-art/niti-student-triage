import React, { useState } from 'react';
import { BookOpen, Star, CheckCircle, XCircle, Clock, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LectureLog: React.FC = () => {
  const { lectures, toggleLectureStatus, updateLectureFocus, addLecture, totalCollegeHours } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [time, setTime] = useState('04:00 PM - 05:30 PM');
  const [durationMinutes, setDurationMinutes] = useState(90);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addLecture({
      name: name.trim(),
      code: code.trim() || 'CLASS',
      time,
      durationMinutes: Number(durationMinutes),
      status: 'attended',
      focusRating: 3,
    });

    setName('');
    setCode('');
    setIsAdding(false);
  };

  return (
    <div className="bg-[#1E293B]/90 rounded-xl p-5 border border-slate-700/60 shadow-lg space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 tracking-wide font-sans">
              Smart-Default Lecture Log
            </h2>
            <p className="text-xs text-slate-400">Opt-out Attendance & Focus Tracking</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800 text-xs font-mono">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span className="text-slate-300">{totalCollegeHours}h logged</span>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition-colors"
            title="Add Custom Lecture"
          >
            {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-indigo-400" />}
          </button>
        </div>
      </div>

      {/* Inline Add Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Lecture Name (e.g. Physics)"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded p-1.5 text-slate-100 placeholder-slate-500"
            />
            <input
              type="text"
              placeholder="Code (e.g. PHY-101)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded p-1.5 text-slate-100 font-mono placeholder-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Time slot (04:00 PM - 05:30 PM)"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded p-1.5 text-slate-100 font-mono text-[11px]"
            />
            <input
              type="number"
              placeholder="Duration mins"
              min="15"
              max="240"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded p-1.5 text-slate-100 font-mono"
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
              Add Lecture
            </button>
          </div>
        </form>
      )}

      {/* Lecture List */}
      <div className="space-y-2.5">
        {lectures.map((lecture) => {
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
        })}
      </div>

    </div>
  );
};
