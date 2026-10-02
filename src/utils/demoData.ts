import { Task, Lecture, TransitState } from '../types';

export const INITIAL_LECTURES: Lecture[] = [
  {
    id: 'lec-1',
    name: 'Digital Signal Processing (DSP)',
    code: 'ECE-301',
    time: '09:00 AM - 10:30 AM',
    durationMinutes: 90,
    status: 'attended',
    focusRating: 3,
  },
  {
    id: 'lec-2',
    name: 'Computer Networks',
    code: 'CSE-304',
    time: '10:45 AM - 12:15 PM',
    durationMinutes: 90,
    status: 'attended',
    focusRating: 3,
  },
  {
    id: 'lec-3',
    name: 'Control Systems',
    code: 'EEE-302',
    time: '01:30 PM - 03:00 PM',
    durationMinutes: 90,
    status: 'attended',
    focusRating: 3,
  },
  {
    id: 'lec-4',
    name: 'Operating Systems Lab',
    code: 'CSE-305L',
    time: '03:15 PM - 04:45 PM',
    durationMinutes: 90,
    status: 'attended',
    focusRating: 4,
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Complete DSP Filter Design Lab Report',
    subject: 'DSP',
    duration: 60,
    priority: 'P0',
    completed: false,
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'task-2',
    title: 'Solve Computer Networks TCP/UDP Problem Set 3',
    subject: 'Networks',
    duration: 45,
    priority: 'P1',
    completed: false,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'task-3',
    title: 'Read Control Systems State-Space Analysis Ch 5',
    subject: 'Control Systems',
    duration: 50,
    priority: 'P1',
    completed: false,
    createdAt: Date.now() - 1800000,
  },
  {
    id: 'task-4',
    title: 'Review OS Semaphore Synchronization Slides',
    subject: 'OS',
    duration: 35,
    priority: 'P2',
    completed: false,
    createdAt: Date.now() - 900000,
  },
  {
    id: 'task-5',
    title: 'Submit Engineering Mathematics Quiz 2 Corrections',
    subject: 'Math',
    duration: 30,
    priority: 'P0',
    completed: true,
    createdAt: Date.now() - 7200000,
  }
];

export const INITIAL_TRANSIT_STATE: TransitState = {
  status: 'idle',
  leftCollegeTime: null,
  homeTime: null,
  commuteDurationMinutes: 0,
};
