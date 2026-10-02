import React, { useState, useEffect } from 'react';
import { X, Database, CheckCircle2, AlertCircle, RefreshCw, Key, Link as LinkIcon, Code, Copy, Check } from 'lucide-react';
import { testSupabaseConnection, getSavedSupabaseConfig, resetSupabaseClient, syncTasksToSupabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_SQL_SCRIPT = `-- NITI: QUICK SUPABASE TABLE CREATION SCRIPT
-- Paste in Supabase SQL Editor & click RUN!

CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  duration INT NOT NULL DEFAULT 45,
  priority TEXT NOT NULL DEFAULT 'P1',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  dropped_tonight BOOLEAN DEFAULT FALSE,
  condensed BOOLEAN DEFAULT FALSE,
  original_duration INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lectures (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 90,
  status TEXT NOT NULL DEFAULT 'attended',
  focus_rating INT NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  status TEXT NOT NULL DEFAULT 'idle',
  left_college_time BIGINT,
  home_time BIGINT,
  commute_duration_minutes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transit_logs DISABLE ROW LEVEL SECURITY;`;

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const { tasks } = useApp();
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'schema'>('config');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const config = getSavedSupabaseConfig();
    if (config) {
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setIsConnected(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!url.trim() || !anonKey.trim()) return;
    setIsTesting(true);
    setStatusMessage(null);

    const result = await testSupabaseConnection(url.trim(), anonKey.trim());
    setIsTesting(false);
    setStatusMessage({ success: result.success, text: result.message });
    if (result.success) setIsConnected(true);
  };

  const handleSaveAndSync = async () => {
    if (!url.trim() || !anonKey.trim()) return;

    setIsSyncing(true);
    const config = { url: url.trim(), anonKey: anonKey.trim() };
    localStorage.setItem('niti_supabase_config', JSON.stringify(config));
    resetSupabaseClient();

    const success = await syncTasksToSupabase(tasks);
    setIsSyncing(false);

    if (success) {
      setStatusMessage({ success: true, text: 'Supabase credentials saved & tasks synchronized!' });
      setIsConnected(true);
      setTimeout(() => onClose(), 1500);
    } else {
      setStatusMessage({ success: false, text: 'Credentials saved! If table sync fails, copy the SQL Script from tab 2 and run it in Supabase SQL Editor.' });
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('niti_supabase_config');
    resetSupabaseClient();
    setUrl('');
    setAnonKey('');
    setIsConnected(false);
    setStatusMessage({ success: true, text: 'Disconnected Supabase credentials. Reverted to Local Storage mode.' });
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(QUICK_SQL_SCRIPT);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-sans flex items-center space-x-2">
                <span>Supabase Database Sync</span>
                {isConnected && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Connected 🟢
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">PostgreSQL Database Integration & Table Creator</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'config' ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow' : 'text-slate-400'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>1. Connection Config</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'schema' ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow' : 'text-slate-400'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>2. Create Tables SQL</span>
          </button>
        </div>

        {activeTab === 'config' ? (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-mono">Supabase Project URL</label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-slate-100 font-mono focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-mono">Supabase Anon API Key</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-slate-100 font-mono focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Status Feedback */}
            {statusMessage && (
              <div className={`p-3 rounded-xl border text-xs font-mono flex items-start space-x-2 ${
                statusMessage.success
                  ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-900/50 text-amber-300'
              }`}>
                {statusMessage.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center space-x-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !url || !anonKey}
                className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-1"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Test Connection</span>}
              </button>

              <button
                type="button"
                onClick={handleSaveAndSync}
                disabled={isSyncing || !url || !anonKey}
                className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-1"
              >
                {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Save & Sync Data</span>}
              </button>
            </div>

            {isConnected && (
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-[11px] font-mono text-rose-400 hover:text-rose-300"
                >
                  Disconnect Credentials
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <p className="text-slate-300 leading-relaxed font-sans">
                Paste this script in your Supabase project's <strong>SQL Editor</strong> & click <strong>RUN</strong>:
              </p>

              <button
                onClick={handleCopySQL}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs font-mono transition-all flex items-center space-x-1 shrink-0"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied!' : 'Copy SQL Script'}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 max-h-56 overflow-y-auto font-mono text-[10px] text-emerald-300 selection:bg-emerald-500/30">
              <pre>{QUICK_SQL_SCRIPT}</pre>
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              Creates <code>tasks</code>, <code>lectures</code>, and <code>transit_logs</code> tables with zero friction.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
