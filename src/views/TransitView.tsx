import React from 'react';
import { TransitTracker } from '../components/TransitTracker';
import { LectureLog } from '../components/LectureLog';

export const TransitView: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-fadeIn">
      {/* Transit Tracker Widget */}
      <TransitTracker />

      {/* Smart-Default Lecture Log */}
      <LectureLog />
    </div>
  );
};
