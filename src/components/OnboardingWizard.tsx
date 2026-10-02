import React, { useState } from 'react';
import { Zap, User as UserIcon, Clock, Compass, Calendar, ArrowRight, ArrowLeft, Plus, X, Shield, Sparkles, CheckCircle2, Coffee } from 'lucide-react';
import { UserProfile, WeeklyScheduleDay, DayOfWeek } from '../types';
import { useApp } from '../context/AppContext';

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile) => void;
}

const DEFAULT_TIMETABLE: WeeklyScheduleDay[] = [
  { day: 'Monday', isRestDay: false, subjects: ['Data Structures', 'Computer Networks'] },
  { day: 'Tuesday', isRestDay: false, subjects: ['Digital Logic Design', 'Engineering Mathematics'] },
  { day: 'Wednesday', isRestDay: false, subjects: ['Control Systems', 'Microprocessors'] },
  { day: 'Thursday', isRestDay: false, subjects: ['Database Management', 'Software Engineering'] },
  { day: 'Friday', isRestDay: false, subjects: ['Algorithms & Complexity', 'Operating Systems'] },
  { day: 'Saturday', isRestDay: true, subjects: [] },
  { day: 'Sunday', isRestDay: true, subjects: [] },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { userProfile, user, logout } = useApp();

  const initialName = userProfile?.name || user?.name || '';
  const [name, setName] = useState(initialName);
  const [step, setStep] = useState<1 | 2 | 3>(initialName.trim() ? 2 : 1);
  
  // Step 2: Bio-Constraints
  const [targetBedtime, setTargetBedtime] = useState('23:30');
  const [commuteTimeMins, setCommuteTimeMins] = useState(45);
  const [decompressionBufferMins, setDecompressionBufferMins] = useState(30);

  // Step 3: Timetable Matrix
  const [weekendPair, setWeekendPair] = useState<'Sat-Sun' | 'Fri-Sat' | 'Thu-Fri' | 'Sun-Mon'>('Sat-Sun');
  const [timetable, setTimetable] = useState<WeeklyScheduleDay[]>(DEFAULT_TIMETABLE);
  const [subjectInputs, setSubjectInputs] = useState<Record<string, string>>({
    Monday: '',
    Tuesday: '',
    Wednesday: '',
    Thursday: '',
    Friday: '',
    Saturday: '',
    Sunday: '',
  });

  const handleWeekendPairChange = (pair: 'Sat-Sun' | 'Fri-Sat' | 'Thu-Fri' | 'Sun-Mon') => {
    setWeekendPair(pair);
    let restDays: DayOfWeek[] = ['Saturday', 'Sunday'];
    if (pair === 'Fri-Sat') restDays = ['Friday', 'Saturday'];
    if (pair === 'Thu-Fri') restDays = ['Thursday', 'Friday'];
    if (pair === 'Sun-Mon') restDays = ['Sunday', 'Monday'];

    setTimetable((prev) =>
      prev.map((d) => {
        const isRest = restDays.includes(d.day);
        return {
          ...d,
          isRestDay: isRest,
          subjects: isRest ? [] : (d.subjects.length > 0 ? d.subjects : ['DSP', 'CN']),
        };
      })
    );
  };

  const handleAddSubject = (day: DayOfWeek) => {
    const inputVal = (subjectInputs[day] || '').trim();
    if (!inputVal) return;

    setTimetable((prev) =>
      prev.map((d) => {
        if (d.day === day) {
          if (d.subjects.includes(inputVal)) return d;
          return { ...d, subjects: [...d.subjects, inputVal] };
        }
        return d;
      })
    );

    setSubjectInputs((prev) => ({ ...prev, [day]: '' }));
  };

  const handleRemoveSubject = (day: DayOfWeek, subjectToRemove: string) => {
    setTimetable((prev) =>
      prev.map((d) => {
        if (d.day === day) {
          return { ...d, subjects: d.subjects.filter((s) => s !== subjectToRemove) };
        }
        return d;
      })
    );
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const studentName = name.trim() || 'Student';

    // Auto-commit any typed subject inputs before launching engine
    let finalTimetable = [...timetable];
    Object.entries(subjectInputs).forEach(([day, text]) => {
      const val = text.trim();
      if (val) {
        finalTimetable = finalTimetable.map((d) => {
          if (d.day === day && !d.isRestDay && !d.subjects.includes(val)) {
            return { ...d, subjects: [...d.subjects, val] };
          }
          return d;
        });
      }
    });

    const profile: UserProfile = {
      name: studentName,
      targetBedtime,
      commuteTimeMins,
      decompressionBufferMins,
      weeklyTimetable: finalTimetable,
      hasOnboarded: true,
      onboardedAt: Date.now(),
    };

    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-emerald-500/30">
      
      {/* Background Accent Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Wizard Card */}
      <div className="max-w-2xl w-full bg-[#1E293B]/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 backdrop-blur-xl animate-fadeIn">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <Zap className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 font-sans tracking-tight">
                Niti Setup Engine
              </h1>
              <p className="text-xs text-slate-400 font-mono">First-Time Student Onboarding</p>
            </div>
          </div>

          {/* Step Indicator Pills */}
          <div className="flex items-center space-x-2 font-mono text-xs">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold transition-all ${
                  step === i
                    ? 'bg-emerald-500 text-slate-950 border border-emerald-400 shadow'
                    : step > i
                    ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/60'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                {step > i ? <CheckCircle2 className="w-4 h-4" /> : i}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-medium inline-block">
                Step 1 of 3 • Personal Identity
              </span>
              <h2 className="text-2xl font-extrabold text-slate-100 font-sans">
                Welcome to Niti! What should we call you?
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Niti configures your daily commute dead-time and homework triage around your actual biological limits.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">Your Full Name</label>
                <div className="relative">
                  <UserIcon className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Tanay Mishra"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && name.trim()) {
                        e.preventDefault();
                        setStep(2);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl py-3 pl-11 pr-4 text-slate-100 text-sm placeholder-slate-500 outline-none transition-all font-sans"
                  />
                </div>
              </div>

              {/* Quick Preview Badge */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center space-x-3 text-xs text-slate-300">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                <p>
                  Zero bloat architecture: Your data stays encrypted locally in your browser storage.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={logout}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={!name.trim()}
                onClick={() => setStep(2)}
                className="py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center space-x-2"
              >
                <span>Continue to Bio-Constraints</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BIO-CONSTRAINTS */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-medium inline-block">
                Step 2 of 3 • Biological & Transit Constraints
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-sans">
                Set your daily bedtime & commute boundaries
              </h2>
              <p className="text-xs text-slate-400">
                These settings protect your sleep and automate nightly homework capacity calculation.
              </p>
            </div>

            <div className="space-y-5 text-xs">
              
              {/* Target Bedtime */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-mono font-medium text-slate-200 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Target Bedtime:</span>
                  </label>
                  <input
                    type="time"
                    value={targetBedtime}
                    onChange={(e) => setTargetBedtime(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs rounded-xl px-3 py-1.5 focus:border-emerald-500 outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Triage will automatically drop low priority (P2) tasks if pending study load exceeds bedtime.
                </p>
              </div>

              {/* Commute Duration Slider */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-mono font-medium text-slate-200 flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>Daily One-Way Commute Time:</span>
                  </label>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {commuteTimeMins} mins
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="180"
                  step="5"
                  value={commuteTimeMins}
                  onChange={(e) => setCommuteTimeMins(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />

                <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                  <span className="text-slate-500">Presets:</span>
                  {[0, 15, 30, 45, 60, 90].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCommuteTimeMins(m)}
                      className={`px-2 py-0.5 rounded-lg border ${
                        commuteTimeMins === m
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Post-Commute Decompression Buffer */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-mono font-medium text-slate-200 flex items-center space-x-2">
                    <Coffee className="w-4 h-4 text-teal-400" />
                    <span>Post-Commute Decompression Buffer:</span>
                  </label>
                  <span className="font-mono font-bold text-teal-400 text-sm">
                    {decompressionBufferMins} mins
                  </span>
                </div>

                <input
                  type="range"
                  min="30"
                  max="120"
                  step="5"
                  value={decompressionBufferMins}
                  onChange={(e) => setDecompressionBufferMins(Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />

                <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                  <span className="text-slate-500">Presets:</span>
                  {[30, 45, 60, 90, 120].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDecompressionBufferMins(m)}
                      className={`px-2 py-0.5 rounded-lg border ${
                        decompressionBufferMins === m
                          ? 'bg-teal-500 text-slate-950 font-bold border-teal-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center space-x-2"
              >
                <span>Configure Weekly Timetable</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TIMETABLE MATRIX */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-5 animate-fadeIn">
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-medium inline-block">
                Step 3 of 3 • Weekly Timetable Matrix
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-sans">
                Set your weekly college schedule
              </h2>
              <p className="text-xs text-slate-400">
                Add your engineering subjects per day. Weekends are locked for Debt Recovery & Rest.
              </p>
            </div>

            {/* Weekend Pair Selector */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-bold font-sans">Select 2 Consecutive Rest / Weekend Days:</span>
                <span className="text-emerald-400 font-mono text-[11px] font-bold">{weekendPair}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Sat-Sun', label: 'Sat & Sun 🌴' },
                  { id: 'Fri-Sat', label: 'Fri & Sat 🌴' },
                  { id: 'Thu-Fri', label: 'Thu & Fri 🌴' },
                  { id: 'Sun-Mon', label: 'Sun & Mon 🌴' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleWeekendPairChange(opt.id as any)}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-semibold transition-all ${
                      weekendPair === opt.id
                        ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timetable List Grid */}
            <div className="space-y-3 max-h-[250px] sm:max-h-[320px] overflow-y-auto pr-1 text-xs font-mono scrollbar-thin">
              {timetable.map((dayItem) => {
                const isRest = dayItem.isRestDay;

                return (
                  <div
                    key={dayItem.day}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isRest
                        ? 'bg-emerald-950/20 border-emerald-900/40'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className={`w-4 h-4 ${isRest ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span className="font-bold text-slate-100 text-sm font-sans">{dayItem.day}</span>
                      </div>

                      {isRest ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                          🌴 Rest & Debt Recovery Day
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          {dayItem.subjects.length} subject{dayItem.subjects.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {!isRest && (
                      <div className="space-y-2">
                        {/* Subject Chips */}
                        <div className="flex flex-wrap gap-1.5">
                          {dayItem.subjects.map((sub) => (
                            <span
                              key={sub}
                              className="px-2 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs flex items-center space-x-1"
                            >
                              <span>{sub}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSubject(dayItem.day, sub)}
                                className="text-slate-400 hover:text-rose-400 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Add Subject Input */}
                        <div className="flex items-center space-x-2 pt-1">
                          <input
                            type="text"
                            placeholder={`+ Add subject for ${dayItem.day}...`}
                            value={subjectInputs[dayItem.day] || ''}
                            onChange={(e) =>
                              setSubjectInputs((prev) => ({ ...prev, [dayItem.day]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSubject(dayItem.day);
                              }
                            }}
                            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-slate-100 text-xs focus:border-emerald-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddSubject(dayItem.day)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs border border-slate-700 flex items-center space-x-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-950/60 transition-all flex items-center space-x-2 transform active:scale-98"
              >
                <span>Launch Niti Engine ⚡</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
};
