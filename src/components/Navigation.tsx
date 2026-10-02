import React from 'react';
import { LayoutDashboard, Compass, CheckSquare, Settings, Zap } from 'lucide-react';
import { useApp, ViewType } from '../context/AppContext';

export const Navigation: React.FC = () => {
  const { activeView, setActiveView, studyDebtHours, activeTasksCount, transitState } = useApp();

  const navItems: { id: ViewType; label: string; icon: React.FC<{ className?: string }>; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'overview',
      label: 'Executive Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'transit',
      label: 'Transit & Schedule',
      icon: Compass,
      badge: transitState.status === 'in_transit' ? 'Commuting' : transitState.status === 'triaged' ? 'Triaged' : undefined,
      badgeColor: transitState.status === 'in_transit' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'tasks',
      label: 'Tasks & Shredder',
      icon: CheckSquare,
      badge: `${activeTasksCount} Active`,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'triage',
      label: 'Triage Engine',
      icon: Settings,
      badge: `${studyDebtHours}h Debt`,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
  ];

  return (
    <div className="bg-[#0F172A]/80 border-b border-slate-800 sticky top-16 z-20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-md shadow-emerald-950/20 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>

                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
