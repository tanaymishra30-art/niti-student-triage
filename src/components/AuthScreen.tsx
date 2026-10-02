import React, { useState } from 'react';
import { Zap, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthScreen: React.FC = () => {
  const { login, signup, googleLogin } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTabSwitch = (signUp: boolean) => {
    setIsSignUp(signUp);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const emailTrim = email.trim();
    const passTrim = password.trim();

    if (isSignUp) {
      const nameTrim = name.trim();
      if (!nameTrim) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!emailTrim) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (!passTrim || passTrim.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (passTrim !== confirmPassword.trim()) {
        setErrorMsg('Passwords do not match. Please check and try again.');
        return;
      }

      const res = signup(emailTrim, passTrim, nameTrim);
      if (!res.success && res.error) {
        setErrorMsg(res.error);
      }
    } else {
      if (!emailTrim) {
        setErrorMsg('Please enter your email address.');
        return;
      }
      if (!passTrim) {
        setErrorMsg('Please enter your password.');
        return;
      }

      const res = login(emailTrim, passTrim);
      if (!res.success && res.error) {
        setErrorMsg(res.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-emerald-500/30">
      
      {/* Background Accent Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-md w-full space-y-6 relative z-10 animate-fadeIn">
        
        {/* Brand Hero */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 items-center justify-center shadow-xl shadow-emerald-950/50 transform hover:scale-105 transition-all">
            <Zap className="w-8 h-8 text-slate-950 stroke-[2.5]" />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
              N.I.T.I.
            </h1>
            <p className="text-xs text-emerald-400 font-mono tracking-wide uppercase mt-0.5">
              Neural Intelligent Triage Interface
            </p>
          </div>
        </div>

        {/* Auth Card Panel */}
        <div className="bg-[#1E293B]/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
          
          {/* Sign In vs Register Tab Switcher */}
          <div className="space-y-2">
            <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => handleTabSwitch(false)}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                  !isSignUp ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch(true)}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                  isSignUp ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Sub-header description depending on mode */}
            <p className="text-[11px] font-mono text-slate-400 text-center">
              {isSignUp 
                ? '✨ Create your new student account to setup your timetable'
                : '🔑 Sign in with your existing student or admin credentials'}
            </p>
          </div>

          {/* Error Message Feedback */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-mono flex items-start space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            
            {/* Full Name (Create Account Only) */}
            {isSignUp && (
              <div className="animate-fadeIn">
                <label className="block text-slate-300 mb-1 font-mono">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanay Mishra"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-10 pr-3 text-slate-100 placeholder-slate-500 outline-none transition-all font-sans"
                  />
                </div>
              </div>
            )}

            {/* Student Email (Both) */}
            <div>
              <label className="block text-slate-300 mb-1 font-mono">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-10 pr-3 text-slate-100 placeholder-slate-500 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Password (Both) */}
            <div>
              <label className="block text-slate-300 mb-1 font-mono">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-10 pr-3 text-slate-100 placeholder-slate-500 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Confirm Password (Create Account Only) */}
            {isSignUp && (
              <div className="animate-fadeIn">
                <label className="block text-slate-300 mb-1 font-mono">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-10 pr-3 text-slate-100 placeholder-slate-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center space-x-2 transform active:scale-98 mt-2"
            >
              <span>{isSignUp ? 'Create Student Account & Onboard' : 'Sign In to Niti'}</span>
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

          {/* Mock Social Button: Continue with Google */}
          <button
            type="button"
            onClick={googleLogin}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs shadow transition-all flex items-center justify-center space-x-2.5 active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

        </div>

        {/* Footer info banner */}
        <div className="text-center text-[11px] font-mono text-slate-500 space-y-1">
          <div className="flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin DB Connection access granted to Admin accounts</span>
          </div>
        </div>

      </div>

    </div>
  );
};
