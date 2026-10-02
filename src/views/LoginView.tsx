import React, { useState } from 'react';
import { Zap, Lock, Mail, User as UserIcon, Building, ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginView: React.FC = () => {
  const { login, guestLogin } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('IIT / NIT Engineering Dept');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const studentName = name.trim() || email.split('@')[0] || 'Student User';
    login(email.trim(), studentName, college.trim());
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-emerald-500/30">
      
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-md w-full space-y-6 relative z-10 animate-fadeIn">
        
        {/* Brand Top Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 items-center justify-center shadow-xl shadow-emerald-950/50 transform hover:scale-105 transition-all">
            <Zap className="w-7 h-7 text-slate-900 stroke-[2.5]" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight font-sans">
              Niti: Student Triage Engine
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Distraction-Free Transit & Homework Capacity System
            </p>
          </div>
        </div>

        {/* Card Panel */}
        <div className="bg-[#1E293B]/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
          
          {/* Sign In vs Register Tab Switcher */}
          <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                !isSignUp ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                isSignUp ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isSignUp && (
              <div>
                <label className="block text-slate-300 mb-1 font-mono">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanay Mishra"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-9 pr-3 text-slate-100 placeholder-slate-500 outline-none transition-all font-sans"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 mb-1 font-mono">Student Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-9 pr-3 text-slate-100 placeholder-slate-500 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-slate-300 mb-1 font-mono">College / University</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. IIT Delhi / Engineering Institute"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-9 pr-3 text-slate-100 placeholder-slate-500 outline-none transition-all font-sans"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 mb-1 font-mono">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-9 pr-3 text-slate-100 placeholder-slate-500 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center space-x-1.5 transform active:scale-98"
            >
              <span>{isSignUp ? 'Create Student Account' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#1E293B] px-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider relative">
              OR
            </span>
          </div>

          {/* Instant 1-Click Demo Login */}
          <button
            type="button"
            onClick={guestLogin}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/50 font-bold text-xs shadow transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>⚡ Instant Demo Mode (No Sign-Up)</span>
          </button>

        </div>

        {/* Feature Pills Footer */}
        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 text-center">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Transit Engine</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-indigo-400" />
            <span>WhatsApp Shredder</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center space-x-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Guilt Meter</span>
          </div>
        </div>

      </div>

    </div>
  );
};
