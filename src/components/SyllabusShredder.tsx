import React, { useState } from 'react';
import { Scissors, Sparkles, Send, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parseWhatsAppTextToTasks } from '../utils/aiShredder';

const SAMPLE_PASTES = [
  "DSP Lab Report 4 submit by 10 PM tonight, 60 min",
  "Networks Problem Set 3 (P0 urgent) 45 mins",
  "Read Control Systems Chapter 5 slides P2",
];

export const SyllabusShredder: React.FC = () => {
  const { addTasks } = useApp();
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleShred = (textToProcess: string = inputText) => {
    if (!textToProcess.trim()) return;

    setIsProcessing(true);
    setSuccessMessage(null);

    // Simulate AI parsing delay for realistic user feel
    setTimeout(() => {
      const parsedTasks = parseWhatsAppTextToTasks(textToProcess);
      if (parsedTasks.length > 0) {
        addTasks(parsedTasks);
        setSuccessMessage(`Shredded ${parsedTasks.length} task${parsedTasks.length > 1 ? 's' : ''} into backlog!`);
        setInputText('');
      } else {
        setSuccessMessage('No clear tasks parsed. Try adding subject or time keywords.');
      }
      setIsProcessing(false);

      setTimeout(() => setSuccessMessage(null), 3000);
    }, 400);
  };

  return (
    <div className="bg-[#1E293B]/90 rounded-xl p-5 border border-slate-700/60 shadow-lg relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Scissors className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 tracking-wide font-sans flex items-center space-x-1.5">
              <span>WhatsApp Syllabus Shredder</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400">Paste unformatted messages to extract structured tasks</p>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste WhatsApp assignment text..."
            rows={2}
            className="w-full bg-slate-900/80 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 resize-none outline-none font-mono transition-all"
          />
          
          <button
            onClick={() => handleShred(inputText)}
            disabled={!inputText.trim() || isProcessing}
            className="absolute bottom-3 right-3 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-md shadow transition-all flex items-center space-x-1"
          >
            {isProcessing ? (
              <span className="inline-block animate-spin">⚡</span>
            ) : (
              <>
                <span>Shred</span>
                <Send className="w-3 h-3" />
              </>
            )}
          </button>
        </div>

        {/* Quick Demo Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono whitespace-nowrap">
            Try Sample:
          </span>
          {SAMPLE_PASTES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(sample);
                handleShred(sample);
              }}
              className="text-[11px] px-2 py-0.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 rounded whitespace-nowrap transition-colors"
            >
              "{sample.slice(0, 20)}..."
            </button>
          ))}
        </div>

        {/* Success Feedback Banner */}
        {successMessage && (
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-fadeIn">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

    </div>
  );
};
