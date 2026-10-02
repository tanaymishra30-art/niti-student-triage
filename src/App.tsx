import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { OverviewView } from './views/OverviewView';
import { TransitView } from './views/TransitView';
import { TasksView } from './views/TasksView';
import { TriageView } from './views/TriageView';
import { TriageModal } from './components/TriageModal';

const DashboardContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      
      {/* Top Header */}
      <Header />

      {/* Categorized Tab Bar Navigation */}
      <Navigation />

      {/* Main Dynamic View Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'overview' && <OverviewView />}
        {activeView === 'transit' && <TransitView />}
        {activeView === 'tasks' && <TasksView />}
        {activeView === 'triage' && <TriageView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 font-mono">
        Niti: The Student Triage Engine • Categorized Productivity Architecture
      </footer>

      {/* Global Homecoming Triage Modal */}
      <TriageModal />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
};
