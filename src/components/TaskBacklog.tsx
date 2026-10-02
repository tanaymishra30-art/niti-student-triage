import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, ShieldAlert, Sparkles, Clock, Edit3, Search, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { AddTaskModal } from './AddTaskModal';
import { EditTaskModal } from './EditTaskModal';
import { formatHours, formatMinutes } from '../utils/formatTime';

export const TaskBacklog: React.FC = () => {
  const { tasks, toggleTaskComplete, deleteTask, totalPendingTaskHours } = useApp();
  const [filter, setFilter] = useState<'active' | 'all' | 'dropped' | 'completed'>('active');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter((t) => {
    // Status filter
    if (filter === 'active' && (t.completed || t.droppedTonight)) return false;
    if (filter === 'dropped' && (!t.droppedTonight || t.completed)) return false;
    if (filter === 'completed' && !t.completed) return false;

    // Tag filter
    if (tagFilter !== 'all' && (!t.tags || !t.tags.includes(tagFilter))) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const titleMatch = t.title.toLowerCase().includes(q);
      const subjectMatch = t.subject.toLowerCase().includes(q);
      const tagMatch = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      if (!titleMatch && !subjectMatch && !tagMatch) return false;
    }

    return true;
  });

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'P0':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            P0 • Urgent
          </span>
        );
      case 'P1':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            P1 • Sage
          </span>
        );
      case 'P2':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-700/60 text-slate-400 border border-slate-600/50">
            P2 • Deferrable
          </span>
        );
    }
  };

  return (
    <div className="bg-[#1E293B]/90 rounded-xl p-5 border border-slate-700/60 shadow-lg flex flex-col h-full">
      
      {/* Header & Filter Row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-semibold text-slate-100 tracking-wide font-sans">
              Task Backlog & Triage Queue
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
              {formatHours(totalPendingTaskHours)} active
            </span>
          </div>
          <p className="text-xs text-slate-400">Completing tasks deducts directly from Study Debt</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Search Bar & Tag Filter Chips */}
      <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
        <div className="relative w-full sm:w-1/2">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tasks or subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-100 placeholder-slate-500 font-mono outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {['all', 'Assignment', 'Lab', 'Exam', 'Project', 'Revision'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setTagFilter(tag)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono capitalize transition-all whitespace-nowrap ${
                tagFilter === tag
                  ? 'bg-indigo-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tag === 'all' ? 'All Tags' : `#${tag}`}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-800 pb-2 mb-3">
        {(['active', 'all', 'dropped', 'completed'] as const).map((tab) => {
          const count = tasks.filter((t) => {
            if (tab === 'active') return !t.completed && !t.droppedTonight;
            if (tab === 'dropped') return t.droppedTonight && !t.completed;
            if (tab === 'completed') return t.completed;
            return true;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-md text-xs font-mono capitalize transition-all ${
                filter === tab
                  ? 'bg-slate-800 text-slate-100 border border-slate-700 font-semibold'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-900/40'
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Task List */}
      <div className="space-y-2 flex-1 overflow-y-auto max-h-[480px] pr-1">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 text-slate-500 space-y-2">
            <Sparkles className="w-6 h-6 mx-auto text-slate-600" />
            <p className="text-xs">No tasks in this view.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-lg border transition-all flex items-start justify-between group ${
                task.completed
                  ? 'bg-slate-950/40 border-slate-800/80 opacity-60'
                  : task.droppedTonight
                  ? 'bg-rose-950/20 border-rose-900/40'
                  : 'bg-slate-900/50 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              {/* Left: Checkbox & Info */}
              <div className="flex items-start space-x-3 flex-1 min-w-0 pr-2">
                <button
                  onClick={() => toggleTaskComplete(task.id)}
                  className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Toggle Completion (Deducts Study Debt)"
                >
                  {task.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span
                      className={`font-medium text-xs break-words ${
                        task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {task.title}
                    </span>

                    {getPriorityBadge(task.priority)}

                    {task.tags && task.tags.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        #{t}
                      </span>
                    ))}

                    {task.droppedTonight && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center">
                        <ShieldAlert className="w-2.5 h-2.5 mr-0.5" /> Drop Tonight
                      </span>
                    )}

                    {task.condensed && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Condensed ({task.originalDuration}m → {task.duration}m)
                      </span>
                    )}

                    {(() => {
                      const ageDays = Math.floor((Date.now() - (task.createdAt || Date.now())) / (1000 * 60 * 60 * 24));
                      if (ageDays > 0 && !task.completed) {
                        return (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            ⏳ Debt Age: {ageDays}d
                          </span>
                        );
                      }
                      return null;
                    })()}

                    {task.dueDate && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        📅 Due: {task.dueDate}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1 font-mono">
                    <span className="text-slate-300 font-semibold">{task.subject}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{task.duration} mins</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions (Edit & Delete) */}
              <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => setEditingTask(task)}
                  className="p-1 text-slate-400 hover:text-emerald-400 transition-colors rounded hover:bg-slate-800"
                  title="Edit task details"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors rounded hover:bg-slate-800"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
      />

    </div>
  );
};
