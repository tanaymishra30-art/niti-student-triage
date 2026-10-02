import React, { createContext, useContext, useState, useMemo } from 'react';
import { Task, Lecture, TransitState, User } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_LECTURES, INITIAL_TASKS, INITIAL_TRANSIT_STATE } from '../utils/demoData';

export interface SubjectDebt {
  subject: string;
  debtHours: number;
  count: number;
  color: string;
}

export interface TriageResult {
  usableHours: number;
  pendingTaskHours: number;
  deficitHours: number;
  hasDeficit: boolean;
  droppedP2Count: number;
  condensedP1Count: number;
  bedtimeFormatted: string;
  dinnerMins: number;
  availableHoursBeforeDinner: number;
}

export type ViewType = 'overview' | 'transit' | 'tasks' | 'triage';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name: string, college?: string) => void;
  guestLogin: () => void;
  logout: () => void;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  transitState: TransitState;
  tasks: Task[];
  lectures: Lecture[];
  targetBedtime: string;
  dinnerDurationMinutes: number;
  isTriageModalOpen: boolean;
  setTargetBedtime: (time: string) => void;
  setDinnerDurationMinutes: (mins: number) => void;
  setIsTriageModalOpen: (open: boolean) => void;
  startTransit: () => void;
  reachHome: () => void;
  resetTransit: () => void;
  calculateTriage: (bedtimeStr?: string, dinnerMins?: number) => TriageResult;
  applyTriagePlan: (planResult?: TriageResult) => void;
  toggleLectureStatus: (id: string) => void;
  updateLectureFocus: (id: string, rating: number) => void;
  editLecture: (lecture: Lecture) => void;
  addLecture: (lecture: Omit<Lecture, 'id'>) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  addTasks: (newTasks: Task[]) => void;
  editTask: (task: Task) => void;
  toggleTaskComplete: (id: string) => void;
  deleteTask: (id: string) => void;
  resetDemoData: () => void;
  // Computed metrics & Analytics
  totalCollegeHours: number;
  totalTransitHours: number;
  totalCompletedStudyHours: number;
  totalPendingTaskHours: number;
  studyDebtHours: number;
  focusConversionRate: number;
  taskCompletionRate: number;
  totalTasksCount: number;
  completedTasksCount: number;
  activeTasksCount: number;
  subjectDebtBreakdown: SubjectDebt[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>('niti_user_session', {
    id: 'user-demo-1',
    name: 'Tanay Mishra',
    email: 'student@college.edu',
    college: 'Engineering Institute',
    loggedInAt: Date.now(),
  });

  const [activeView, setActiveView] = useLocalStorage<ViewType>('niti_active_view', 'overview');
  const [transitState, setTransitState] = useLocalStorage<TransitState>('niti_transit_state', INITIAL_TRANSIT_STATE);
  const [tasks, setTasks] = useLocalStorage<Task[]>('niti_tasks', INITIAL_TASKS);
  const [lectures, setLectures] = useLocalStorage<Lecture[]>('niti_lectures', INITIAL_LECTURES);
  const [targetBedtime, setTargetBedtime] = useLocalStorage<string>('niti_bedtime', '23:30');
  const [dinnerDurationMinutes, setDinnerDurationMinutes] = useLocalStorage<number>('niti_dinner_mins', 30);
  const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);

  const isAuthenticated = Boolean(user);

  const login = (email: string, name: string, college: string = 'Engineering Department') => {
    setUser({
      id: `user-${Date.now()}`,
      name,
      email,
      college,
      loggedInAt: Date.now(),
    });
    setActiveView('overview');
  };

  const guestLogin = () => {
    setUser({
      id: 'guest-demo-user',
      name: 'Demo Student',
      email: 'demo.student@niti.edu',
      college: 'IIT / NIT Engineering Dept',
      loggedInAt: Date.now(),
    });
    setActiveView('overview');
  };

  const logout = () => {
    setUser(null);
  };

  // Transit state machine triggers
  const startTransit = () => {
    const now = Date.now();
    setTransitState({
      status: 'in_transit',
      leftCollegeTime: now,
      homeTime: null,
      commuteDurationMinutes: 0,
    });
  };

  const reachHome = () => {
    const now = Date.now();
    const startTime = transitState.leftCollegeTime || (now - 45 * 60 * 1000); // fallback 45m
    const diffMinutes = Math.max(1, Math.round((now - startTime) / (1000 * 60)));

    setTransitState({
      status: 'triaged',
      leftCollegeTime: startTime,
      homeTime: now,
      commuteDurationMinutes: diffMinutes,
    });

    setIsTriageModalOpen(true);
  };

  const resetTransit = () => {
    setTransitState(INITIAL_TRANSIT_STATE);
  };

  // Pure Helper for Homecoming Triage Logic (Zero State Mutation)
  const calculateTriage = (
    bedtimeStr: string = targetBedtime,
    dinnerMins: number = dinnerDurationMinutes
  ): TriageResult => {
    const now = new Date();
    const [bedHours, bedMins] = bedtimeStr.split(':').map(Number);
    
    const bedtimeDate = new Date();
    bedtimeDate.setHours(bedHours, bedMins, 0, 0);

    // If bedtime is earlier than current time today or within 10 minutes, assume late night / next morning shift
    if (bedtimeDate.getTime() <= now.getTime() + 10 * 60 * 1000) {
      bedtimeDate.setDate(bedtimeDate.getDate() + 1);
    }

    const availableMs = bedtimeDate.getTime() - now.getTime();
    const availableHoursBeforeDinner = Math.max(0, Math.round((availableMs / (1000 * 60 * 60)) * 10) / 10);
    
    // Net Usable Hours = (Bedtime - Current Time) - dinner break
    const usableHours = Math.max(0, Math.round((availableHoursBeforeDinner - dinnerMins / 60) * 10) / 10);

    // Calculate pending non-completed tasks duration in hours
    const pendingMinutes = tasks
      .filter((t) => !t.completed && !t.droppedTonight)
      .reduce((sum, t) => sum + t.duration, 0);
    const pendingTaskHours = Math.round((pendingMinutes / 60) * 10) / 10;

    const deficitHours = Math.round(Math.max(0, pendingTaskHours - usableHours) * 10) / 10;
    const hasDeficit = deficitHours > 0;

    const p2Tasks = tasks.filter((t) => !t.completed && t.priority === 'P2');
    const p1Tasks = tasks.filter((t) => !t.completed && t.priority === 'P1');

    return {
      usableHours,
      pendingTaskHours,
      deficitHours,
      hasDeficit,
      droppedP2Count: p2Tasks.length,
      condensedP1Count: p1Tasks.length,
      bedtimeFormatted: bedtimeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dinnerMins,
      availableHoursBeforeDinner,
    };
  };

  const applyTriagePlan = (planResult?: TriageResult) => {
    const currentResult = planResult || calculateTriage(targetBedtime, dinnerDurationMinutes);

    setTasks((prev) =>
      prev.map((task) => {
        if (task.completed) return task;

        if (currentResult.hasDeficit) {
          if (task.priority === 'P2') {
            return { ...task, droppedTonight: true };
          }
          if (task.priority === 'P1' && !task.condensed) {
            const newDuration = Math.max(15, Math.round(task.duration * 0.7)); // Condense by 30%
            return {
              ...task,
              originalDuration: task.duration,
              duration: newDuration,
              condensed: true,
            };
          }
        }
        return task;
      })
    );

    setIsTriageModalOpen(false);
  };

  // Lecture handlers
  const toggleLectureStatus = (id: string) => {
    setLectures((prev) =>
      prev.map((lec) =>
        lec.id === id
          ? { ...lec, status: lec.status === 'attended' ? 'skipped' : 'attended' }
          : lec
      )
    );
  };

  const updateLectureFocus = (id: string, rating: number) => {
    setLectures((prev) =>
      prev.map((lec) => (lec.id === id ? { ...lec, focusRating: rating } : lec))
    );
  };

  const editLecture = (updatedLecture: Lecture) => {
    setLectures((prev) =>
      prev.map((l) => (l.id === updatedLecture.id ? updatedLecture : l))
    );
  };

  const addLecture = (lectureData: Omit<Lecture, 'id'>) => {
    const newLecture: Lecture = {
      ...lectureData,
      id: `lec-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };
    setLectures((prev) => [...prev, newLecture]);
  };

  // Task handlers
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const addTasks = (newTasks: Task[]) => {
    setTasks((prev) => [...newTasks, ...prev]);
  };

  const editTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const resetDemoData = () => {
    setTransitState(INITIAL_TRANSIT_STATE);
    setTasks(INITIAL_TASKS);
    setLectures(INITIAL_LECTURES);
    setTargetBedtime('23:30');
    setDinnerDurationMinutes(30);
    setActiveView('overview');
    setIsTriageModalOpen(false);
  };

  // Memoized Computed Metrics for zero unnecessary re-render overhead
  const totalCollegeHours = useMemo(() => {
    return Math.round((lectures
      .filter((l) => l.status === 'attended')
      .reduce((sum, l) => sum + l.durationMinutes, 0) / 60) * 10) / 10;
  }, [lectures]);

  const totalTransitHours = useMemo(() => {
    return Math.round(((transitState.commuteDurationMinutes || 0) / 60) * 10) / 10;
  }, [transitState.commuteDurationMinutes]);

  const totalCompletedStudyHours = useMemo(() => {
    return Math.round((tasks
      .filter((t) => t.completed)
      .reduce((sum, t) => sum + t.duration, 0) / 60) * 10) / 10;
  }, [tasks]);

  const totalPendingTaskHours = useMemo(() => {
    return Math.round((tasks
      .filter((t) => !t.completed && !t.droppedTonight)
      .reduce((sum, t) => sum + t.duration, 0) / 60) * 10) / 10;
  }, [tasks]);

  const studyDebtHours = useMemo(() => {
    return Math.round(totalPendingTaskHours * 10) / 10;
  }, [totalPendingTaskHours]);

  const focusConversionRate = useMemo(() => {
    const totalActiveHours = totalCollegeHours + totalTransitHours + totalCompletedStudyHours;
    return totalActiveHours > 0
      ? Math.min(100, Math.round((totalCompletedStudyHours / totalActiveHours) * 100))
      : 0;
  }, [totalCollegeHours, totalTransitHours, totalCompletedStudyHours]);

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const activeTasksCount = tasks.filter((t) => !t.completed && !t.droppedTonight).length;

  const taskCompletionRate = totalTasksCount > 0
    ? Math.round((completedTasksCount / totalTasksCount) * 100)
    : 0;

  // Subject Debt Breakdown for Overview graphs
  const subjectDebtBreakdown = useMemo(() => {
    const colors = ['#6366F1', '#4E876C', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];
    const map: Record<string, { debtMins: number; count: number }> = {};

    tasks
      .filter((t) => !t.completed && !t.droppedTonight)
      .forEach((t) => {
        const sub = t.subject || 'General';
        if (!map[sub]) map[sub] = { debtMins: 0, count: 0 };
        map[sub].debtMins += t.duration;
        map[sub].count += 1;
      });

    return Object.keys(map).map((sub, idx) => ({
      subject: sub,
      debtHours: Math.round((map[sub].debtMins / 60) * 10) / 10,
      count: map[sub].count,
      color: colors[idx % colors.length],
    }));
  }, [tasks]);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        guestLogin,
        logout,
        activeView,
        setActiveView,
        transitState,
        tasks,
        lectures,
        targetBedtime,
        dinnerDurationMinutes,
        isTriageModalOpen,
        setTargetBedtime,
        setDinnerDurationMinutes,
        setIsTriageModalOpen,
        startTransit,
        reachHome,
        resetTransit,
        calculateTriage,
        applyTriagePlan,
        toggleLectureStatus,
        updateLectureFocus,
        editLecture,
        addLecture,
        addTask,
        addTasks,
        editTask,
        toggleTaskComplete,
        deleteTask,
        resetDemoData,
        totalCollegeHours,
        totalTransitHours,
        totalCompletedStudyHours,
        totalPendingTaskHours,
        studyDebtHours,
        focusConversionRate,
        taskCompletionRate,
        totalTasksCount,
        completedTasksCount,
        activeTasksCount,
        subjectDebtBreakdown,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
