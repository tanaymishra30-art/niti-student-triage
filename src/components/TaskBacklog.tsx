import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, ShieldAlert, Sparkles, Clock, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { AddTaskModal } from './AddTaskModal';
import { EditTaskModal } from './EditTaskModal';

export const TaskBacklog: React.FC = () => {
  const { tasks, toggleTaskComplete, deleteTask, totalPendingTaskHours } = useApp();
  const [filter, setFilter] = useState<'active' | 'all' | 'dropped' | 'completed'>('active');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed && !t.droppedTonight;
    if (filter === 'dropped') return t.droppedTonight && !t.completed;
    if (filter === 'completed') return t.completed;
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
              {(Math.round(totalPendingTaskHours * 10) / 10).toFixed(1)}h active
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
