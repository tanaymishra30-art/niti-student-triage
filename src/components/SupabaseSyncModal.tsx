import React, { useState, useEffect } from 'react';
import { X, Database, CheckCircle2, AlertCircle, RefreshCw, Key, Link as LinkIcon, Code } from 'lucide-react';
import { testSupabaseConnection, getSavedSupabaseConfig, resetSupabaseClient, syncTasksToSupabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const { tasks } = useApp();
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'schema'>('config');

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
      setStatusMessage({ success: false, text: 'Credentials saved, but table sync failed. Did you run the SQL schema?' });
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
                    Connected
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">PostgreSQL Database Integration & Cloud Sync</p>
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
            <span>Connection Config</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'schema' ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow' : 'text-slate-400'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>SQL Schema Script</span>
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
                  placeholder="https://xyzcompany.supabase.co"
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
                  : 'bg-rose-950/30 border-rose-900/50 text-rose-300'
              }`}>
                {statusMessage.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
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
            <p className="text-slate-300 leading-relaxed">
              Copy and execute the official PostgreSQL schema script below in your Supabase project's <strong>SQL Editor</strong>:
            </p>

            <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 max-h-48 overflow-y-auto font-mono text-[10px] text-emerald-300">
              <pre>{`-- NITI SUPABASE DATABASE SCHEMA
CREATE TABLE public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  duration INT NOT NULL DEFAULT 45,
  priority TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  dropped_tonight BOOLEAN DEFAULT FALSE,
  condensed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              The full schema file is available in your workspace at <code>supabase/schema.sql</code>.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
