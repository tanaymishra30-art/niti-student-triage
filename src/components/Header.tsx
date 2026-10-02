import React, { useState } from 'react';
import { Compass, RotateCcw, Clock, Zap, LogOut, User as UserIcon, Database, Shield, UserPlus, Palette } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SupabaseSyncModal } from './SupabaseSyncModal';
import { ConvertGuestModal } from './ConvertGuestModal';
import { BackupModal } from './BackupModal';
import { getSavedSupabaseConfig } from '../lib/supabase';
import { formatHours } from '../utils/formatTime';

export const Header: React.FC = () => {
  const { user, userProfile, authSession, logout, resetDemoData, studyDebtHours, transitState, setIsTriageModalOpen, isAdmin } = useApp();
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const isSupabaseConnected = Boolean(getSavedSupabaseConfig());
  const displayName = userProfile?.name || user?.name || 'Student';
  const isGuest = Boolean(user?.email?.startsWith('guest.') || authSession?.email?.startsWith('guest.'));

  return (
    <header className="border-b border-slate-800 bg-[#0F172A]/90 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <Zap className="w-5 h-5 text-slate-900 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight font-sans">
                Niti
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                v1.0 Triage
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal hidden sm:block">
              Student Transit & Homework Triage Engine
            </p>
          </div>
        </div>

        {/* Quick Metrics & Actions */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          
          {/* Admin-Only Supabase DB Sync Button */}
          {isAdmin && (
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                isSupabaseConnected
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="Admin Database Configuration & Supabase Sync"
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="hidden md:inline">{isSupabaseConnected ? 'DB Synced 🟢' : 'Admin DB Config 🔑'}</span>
            </button>
          )}

          {/* Status Badge */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                transitState.status === 'in_transit' ? 'bg-amber-400' : 'bg-emerald-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                transitState.status === 'in_transit' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}></span>
            </span>
            <span className="text-slate-300 font-mono capitalize">
              {transitState.status === 'in_transit' ? 'Commuting' : transitState.status === 'triaged' ? 'Triaged' : 'On Campus'}
            </span>
          </div>

          {/* Quick Study Debt Indicator */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-slate-800/50 px-2.5 py-1.5 rounded-xl border border-slate-700/50 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Debt:</span>
            <span className="font-bold text-amber-400">{formatHours(studyDebtHours)}</span>
          </div>

          {/* Re-Triage Button */}
          <button
            onClick={() => setIsTriageModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all shadow-sm active:scale-95"
            title="Open Homecoming Triage Modal"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xs:inline">Triage Plan</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={resetDemoData}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-colors"
            title="Reset to default demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Guest Account Conversion Button */}
          {isGuest && (
            <button
              onClick={() => setIsConvertModalOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-medium transition-all"
              title="Save guest profile to a permanent account"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Save Account 💾</span>
            </button>
          )}

          {/* Theme & Backup Controls Button */}
          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-all"
            title="Theme customization & Data Backup"
          >
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Theme & Backup 🎨</span>
          </button>

          {/* User Profile Pill & Logout */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700/80 rounded-xl p-1 pl-2.5 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-200 font-medium font-sans max-w-[140px] sm:max-w-[190px] truncate">
              {isAdmin ? (
                <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              <span className="truncate">Welcome back, {displayName}</span>
            </div>
            <button
              onClick={logout}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Log out of session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Supabase Database Connection Modal (Admin Only) */}
      {isAdmin && (
        <SupabaseSyncModal isOpen={isSupabaseModalOpen} onClose={() => setIsSupabaseModalOpen(false)} />
      )}

      {/* Guest Account Conversion Modal */}
      {isGuest && (
        <ConvertGuestModal isOpen={isConvertModalOpen} onClose={() => setIsConvertModalOpen(false)} />
      )}

      {/* Theme & Data Backup Modal */}
      <BackupModal isOpen={isBackupModalOpen} onClose={() => setIsBackupModalOpen(false)} />
    </header>
  );
};
