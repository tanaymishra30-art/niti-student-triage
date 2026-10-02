export interface Task {
  id: string;
  title: string;
  subject: string;
  duration: number; // in minutes
  priority: 'P0' | 'P1' | 'P2';
  completed: boolean;
  droppedTonight?: boolean;
  condensed?: boolean;
  originalDuration?: number;
  createdAt: number;
}

export interface TransitState {
  status: 'idle' | 'in_transit' | 'triaged';
  leftCollegeTime: number | null;
  homeTime: number | null;
  commuteDurationMinutes?: number;
}

export interface Lecture {
  id: string;
  name: string;
  code: string;
  time: string;
  durationMinutes: number;
  status: 'attended' | 'skipped';
  focusRating: number; // 1 to 5 scale
}

export interface TriageSettings {
  targetBedtime: string; // e.g. "23:30"
  dinnerDurationMinutes: number; // e.g. 30
}

export interface DailyMetrics {
  collegeHours: number;
  transitHours: number;
  deepStudyHours: number;
  studyDebtHours: number;
  focusConversionRate: number; // percentage
}
