import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask } = useApp();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('DSP');
  const [duration, setDuration] = useState(45);
  const [priority, setPriority] = useState<'P0' | 'P1' | 'P2'>('P1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      subject,
      duration: Number(duration),
      priority,
      completed: false,
    });

    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center space-x-1.5">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Create New Task</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-mono">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Solve Control Systems Problem Set 3"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-mono">Subject Tag</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500 outline-none"
              >
                <option value="DSP">DSP</option>
                <option value="Networks">Networks</option>
                <option value="Control Systems">Control Systems</option>
                <option value="OS">OS</option>
                <option value="Math">Math</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-mono">Duration (Minutes)</label>
              <input
                type="number"
                min="5"
                max="300"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-mono">Priority Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['P0', 'P1', 'P2'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-2 px-3 rounded-lg border font-mono font-semibold transition-all ${
                    priority === p
                      ? p === 'P0'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                        : p === 'P1'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : 'bg-slate-700 text-slate-200 border-slate-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-slate-400 hover:text-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-all"
            >
              Add Task
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
