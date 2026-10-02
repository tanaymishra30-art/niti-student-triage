import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Upload, Palette, Database, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { themeColor, setThemeColor, exportNitiData, importNitiData } = useApp();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importNitiData(content);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Data backup imported successfully!' });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to import backup file.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
        
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Palette className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-sans">Theme & Data Backup</h3>
              <p className="text-xs text-slate-400">Customize appearance & backup local engine state</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div className={`p-3 rounded-xl border text-xs font-mono flex items-start space-x-2 animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Section 1: Custom Color Theme Switcher */}
        <div className="space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Accent Color Theme:</span>
            </span>
            <span className="text-[11px] font-mono capitalize text-emerald-400 font-bold">{themeColor}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'emerald', label: 'Sage Emerald', colorBg: 'bg-emerald-500', text: 'text-emerald-400' },
              { id: 'indigo', label: 'Neon Violet', colorBg: 'bg-indigo-500', text: 'text-indigo-400' },
              { id: 'amber', label: 'Cyber Amber', colorBg: 'bg-amber-500', text: 'text-amber-400' },
              { id: 'rose', label: 'Crimson Pulse', colorBg: 'bg-rose-500', text: 'text-rose-400' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setThemeColor(t.id as any);
                  setFeedback({ type: 'success', message: `Theme updated to ${t.label}` });
                }}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center space-x-2 ${
                  themeColor === t.id
                    ? 'bg-slate-800 border-slate-600 shadow ring-1 ring-emerald-500/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${t.colorBg}`} />
                <span className="text-slate-200 text-[11px] font-mono">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Export & Import JSON Data */}
        <div className="space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <span className="text-xs font-mono font-bold text-slate-200 flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Data Backup & Restoration:</span>
          </span>
          <p className="text-[11px] text-slate-400">
            Export your timetable, task queue, and settings as a JSON file, or restore from a previous backup.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={exportNitiData}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export JSON Backup</span>
            </button>

            <button
              type="button"
              onClick={handleImportClick}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-2"
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Restore JSON Backup</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex justify-end border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
