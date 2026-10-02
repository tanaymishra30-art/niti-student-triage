import React from 'react';
import { SyllabusShredder } from '../components/SyllabusShredder';
import { TaskBacklog } from '../components/TaskBacklog';

export const TasksView: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* WhatsApp Syllabus Shredder */}
      <SyllabusShredder />

      {/* Main Task Queue */}
      <TaskBacklog />
    </div>
  );
};
