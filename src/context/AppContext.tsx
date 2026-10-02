import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Task, Lecture, TransitState, User, UserProfile, DayOfWeek, AuthSession } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_LECTURES, INITIAL_TASKS, INITIAL_TRANSIT_STATE } from '../utils/demoData';
import { fetchAllSupabaseUsers, registerSupabaseUser, syncUserProfileToSupabase, fetchSupabaseUserByEmail, fetchUserProfileFromSupabase } from '../lib/supabase';

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

interface RegisteredAccount {
  password: string;
  name: string;
  college: string;
  role: 'admin' | 'student';
}

const DEFAULT_ACCOUNTS: Record<string, RegisteredAccount> = {
  'tanaymishra30@gmail.com': {
    password: 'admin123',
    name: 'Tanay Mishra (Admin)',
    college: 'Engineering Institute',
    role: 'admin',
  },
  'admin@niti.edu': {
    password: 'admin123',
    name: 'System Admin',
    college: 'Niti Admin Dept',
    role: 'admin',
  },
  'demo.student@niti.edu': {
    password: 'student123',
    name: 'Demo Student',
    college: 'IIT / NIT Engineering Dept',
    role: 'student',
  },
};

interface AppContextType {
  user: User | null;
  authSession: AuthSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userProfile: UserProfile | null;
  hasOnboarded: boolean;
  completeOnboarding: (profile: UserProfile) => void;
  resetOnboarding: () => void;
  isHoliday: boolean;
  isHolidayMode: boolean;
  toggleHolidayMode: () => void;
  currentDay: DayOfWeek;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  signup: (email: string, password: string, name?: string) => { success: boolean; error?: string };
  googleLogin: () => void;
  guestLogin: () => void;
  convertGuestToAccount: (email: string, password: string, name: string) => { success: boolean; error?: string };
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
  const [authSession, setAuthSession] = useLocalStorage<AuthSession | null>('niti_auth_session', null);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('niti_user_profile', null);
  const [user, setUser] = useLocalStorage<User | null>('niti_user_session', null);
  const [isHolidayMode, setIsHolidayMode] = useLocalStorage<boolean>('niti_is_holiday_mode', false);

  const [registeredAccounts, setRegisteredAccounts] = useLocalStorage<Record<string, RegisteredAccount>>('niti_registered_accounts', {});
  const [activeView, setActiveView] = useLocalStorage<ViewType>('niti_active_view', 'overview');
  const [transitState, setTransitState] = useLocalStorage<TransitState>('niti_transit_state', INITIAL_TRANSIT_STATE);
  const [tasks, setTasks] = useLocalStorage<Task[]>('niti_tasks', []);
  const [studyDebt, setStudyDebt] = useLocalStorage<number>('niti_study_debt', 0);
  const [lectures, setLectures] = useLocalStorage<Lecture[]>('niti_lectures', []);
  const [targetBedtime, setTargetBedtime] = useLocalStorage<string>('niti_bedtime', '23:30');
  const [dinnerDurationMinutes, setDinnerDurationMinutes] = useLocalStorage<number>('niti_dinner_mins', 30);
  const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);

  // Sync registered users from Supabase DB on mount
  useEffect(() => {
    fetchAllSupabaseUsers().then((remoteMap) => {
      if (remoteMap && Object.keys(remoteMap).length > 0) {
        setRegisteredAccounts((prev) => ({
          ...remoteMap,
          ...prev, // Local registered accounts take precedence
        }));
      }
    });
  }, []);

  const currentDay = useMemo<DayOfWeek>(() => {
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }, []);

  const isWeekend = currentDay === 'Saturday' || currentDay === 'Sunday';
  const isHoliday = isHolidayMode || isWeekend;
  const isAuthenticated = Boolean(authSession?.isLoggedIn);
  const hasOnboarded = Boolean(userProfile?.hasOnboarded);

  const isAdmin = useMemo(() => {
    const emailLower = (authSession?.email || user?.email || '').toLowerCase();
    return Boolean(
      user?.role === 'admin' ||
      user?.isAdmin ||
      emailLower === 'tanaymishra30@gmail.com' ||
      emailLower.includes('admin')
    );
  }, [authSession, user]);

  const toggleHolidayMode = () => {
    setIsHolidayMode((prev) => !prev);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const emailLower = email.trim().toLowerCase();
    const passTrim = password.trim();

    if (!emailLower) return { success: false, error: 'Please enter a valid email address.' };
    if (!passTrim) return { success: false, error: 'Please enter your password.' };

    const defaultAcc = DEFAULT_ACCOUNTS[emailLower];
    let existingAcc = defaultAcc || registeredAccounts[emailLower];

    // Fast remote lookup to Supabase users table if not in local cache
    if (!existingAcc) {
      const remoteUser = await fetchSupabaseUserByEmail(emailLower);
      if (remoteUser) {
        existingAcc = {
          password: remoteUser.password,
          name: remoteUser.name,
          college: 'Engineering Institute',
          role: remoteUser.role,
        };
        setRegisteredAccounts((prev) => ({ ...prev, [emailLower]: existingAcc! }));
      }
    }

    if (!existingAcc) {
      return { success: false, error: 'No account found with this email address. Please Create an Account first.' };
    }

    const isPasswordValid =
      existingAcc.password === passTrim ||
      (emailLower === 'tanaymishra30@gmail.com' && (passTrim === 'admin' || passTrim === 'admin123')) ||
      (emailLower.endsWith('@niti.edu') && (passTrim === 'student' || passTrim === 'student123'));

    if (!isPasswordValid) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const session: AuthSession = {
      email: emailLower,
      isLoggedIn: true,
      token: `token-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      loggedInAt: Date.now(),
    };

    setAuthSession(session);

    // Sync remote profile if logging in on new device
    const remoteProfile = await fetchUserProfileFromSupabase(emailLower);
    if (remoteProfile) {
      setUserProfile(remoteProfile);
    }

    setUser({
      id: `user-${Date.now()}`,
      name: remoteProfile?.name || userProfile?.name || existingAcc?.name || emailLower.split('@')[0],
      email: emailLower,
      college: existingAcc?.college || 'Engineering Institute',
      role: existingAcc?.role || (emailLower.includes('admin') ? 'admin' : 'student'),
      isAdmin: emailLower.includes('admin') || existingAcc?.role === 'admin',
      loggedInAt: Date.now(),
      hasOnboarded: remoteProfile ? remoteProfile.hasOnboarded : hasOnboarded,
    });

    setActiveView('overview');
    return { success: true };
  };

  const signup = (email: string, password: string, name?: string): { success: boolean; error?: string } => {
    const emailLower = email.trim().toLowerCase();
    const passTrim = password.trim();

    if (!emailLower) return { success: false, error: 'Please enter a valid email address.' };
    if (!passTrim || passTrim.length < 4) return { success: false, error: 'Password must be at least 4 characters long.' };

    if (registeredAccounts[emailLower] || DEFAULT_ACCOUNTS[emailLower]) {
      return { success: false, error: 'An account with this email address already exists. Please Sign In instead.' };
    }

    const displayName = name?.trim() || emailLower.split('@')[0];
    const role: 'admin' | 'student' = emailLower.includes('admin') || emailLower === 'tanaymishra30@gmail.com' ? 'admin' : 'student';

    const newAcc: RegisteredAccount = {
      password: passTrim,
      name: displayName,
      college: 'Engineering Institute',
      role,
    };

    setRegisteredAccounts((prev) => ({ ...prev, [emailLower]: newAcc }));

    // Async save to Supabase users table
    registerSupabaseUser({
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: emailLower,
      name: displayName,
      password: passTrim,
      role,
    });

    const session: AuthSession = {
      email: emailLower,
      isLoggedIn: true,
      token: `token-${Date.now()}`,
      loggedInAt: Date.now(),
    };

    setAuthSession(session);
    setUserProfile({
      name: displayName,
      targetBedtime: '23:30',
      commuteTimeMins: 45,
      decompressionBufferMins: 30,
      weeklyTimetable: [
        { day: 'Monday', isRestDay: false, subjects: ['DSP', 'CN'] },
        { day: 'Tuesday', isRestDay: false, subjects: ['OS', 'DBMS'] },
        { day: 'Wednesday', isRestDay: false, subjects: ['DSP', 'AI'] },
        { day: 'Thursday', isRestDay: false, subjects: ['CN', 'OS'] },
        { day: 'Friday', isRestDay: false, subjects: ['DBMS', 'AI'] },
        { day: 'Saturday', isRestDay: true, subjects: [] },
        { day: 'Sunday', isRestDay: true, subjects: [] },
      ],
      hasOnboarded: false,
      onboardedAt: Date.now(),
    });
    setTasks([]);
    setStudyDebt(0);

    setUser({
      id: `user-${Date.now()}`,
      name: displayName,
      email: emailLower,
      college: 'Engineering Institute',
      role: newAcc.role,
      isAdmin: newAcc.role === 'admin',
      loggedInAt: Date.now(),
      hasOnboarded: false,
    });

    return { success: true };
  };

  const googleLogin = () => {
    const mockEmail = 'tanay.student@niti.edu';
    const session: AuthSession = {
      email: mockEmail,
      isLoggedIn: true,
      token: `google-token-${Date.now()}`,
      loggedInAt: Date.now(),
    };

    setAuthSession(session);
    setUser({
      id: 'google-student-user',
      name: userProfile?.name || 'Tanay Student',
      email: mockEmail,
      college: 'IIT / NIT Engineering Dept',
      role: 'student',
      isAdmin: false,
      loggedInAt: Date.now(),
      hasOnboarded: Boolean(userProfile?.hasOnboarded),
    });
    setActiveView('overview');
  };

  const guestLogin = () => {
    const guestId = Date.now();
    const guestEmail = `guest.${guestId}@niti.edu`;

    const session: AuthSession = {
      email: guestEmail,
      isLoggedIn: true,
      token: `guest-token-${guestId}`,
      loggedInAt: Date.now(),
    };

    setAuthSession(session);
    setUserProfile(null);
    setTasks([]);
    setLectures([]);
    setStudyDebt(0);
    setIsHolidayMode(false);
    setTransitState(INITIAL_TRANSIT_STATE);

    setUser({
      id: `guest-user-${guestId}`,
      name: 'Guest Student',
      email: guestEmail,
      college: 'Guest Academy',
      role: 'student',
      isAdmin: false,
      loggedInAt: Date.now(),
      hasOnboarded: false,
    });

    setActiveView('overview');
  };

  const convertGuestToAccount = (email: string, password: string, name: string): { success: boolean; error?: string } => {
    const emailLower = email.trim().toLowerCase();
    const passTrim = password.trim();

    if (!emailLower) return { success: false, error: 'Please enter a valid email address.' };
    if (!passTrim || passTrim.length < 6) return { success: false, error: 'Password must be at least 6 characters long.' };
    if (!name.trim()) return { success: false, error: 'Please enter your full name.' };

    if (registeredAccounts[emailLower] || DEFAULT_ACCOUNTS[emailLower]) {
      return { success: false, error: 'An account with this email address already exists. Please use a different email.' };
    }

    const displayName = name.trim();
    const role: 'admin' | 'student' = emailLower.includes('admin') || emailLower === 'tanaymishra30@gmail.com' ? 'admin' : 'student';

    const newAcc: RegisteredAccount = {
      password: passTrim,
      name: displayName,
      college: 'Engineering Institute',
      role,
    };

    setRegisteredAccounts((prev) => ({ ...prev, [emailLower]: newAcc }));

    registerSupabaseUser({
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: emailLower,
      name: displayName,
      password: passTrim,
      role,
    });

    const session: AuthSession = {
      email: emailLower,
      isLoggedIn: true,
      token: `token-${Date.now()}`,
      loggedInAt: Date.now(),
    };

    setAuthSession(session);

    const updatedProfile: UserProfile = {
      name: displayName,
      targetBedtime: userProfile?.targetBedtime || '23:30',
      commuteTimeMins: userProfile?.commuteTimeMins || 45,
      decompressionBufferMins: userProfile?.decompressionBufferMins || 30,
      weeklyTimetable: userProfile?.weeklyTimetable || [],
      hasOnboarded: true,
      onboardedAt: Date.now(),
    };

    setUserProfile(updatedProfile);
    syncUserProfileToSupabase(emailLower, updatedProfile);

    setUser({
      id: `user-${Date.now()}`,
      name: displayName,
      email: emailLower,
      college: 'Engineering Institute',
      role: newAcc.role,
      isAdmin: newAcc.role === 'admin',
      loggedInAt: Date.now(),
      hasOnboarded: true,
    });

    return { success: true };
  };

  const logout = () => {
    setAuthSession(null);
    setUser(null);
  };

  const completeOnboarding = (profile: UserProfile) => {
    setUserProfile(profile);
    setTargetBedtime(profile.targetBedtime);
    
    // Zero out initial tasks and debt for fresh accounts
    setTasks([]);
    setStudyDebt(0);

    if (authSession?.email) {
      syncUserProfileToSupabase(authSession.email, profile);
    }

    // Populate today's lectures from weeklyTimetable for currentDay
    const todaySched = profile.weeklyTimetable.find((d) => d.day === currentDay);
    if (todaySched && !todaySched.isRestDay && todaySched.subjects.length > 0) {
      const newLectures: Lecture[] = todaySched.subjects.map((sub, idx) => ({
        id: `lec-${Date.now()}-${idx}`,
        name: sub,
        code: `${sub.substring(0, 3).toUpperCase()}-10${idx + 1}`,
        time: `${9 + idx * 2}:00 AM`,
        durationMinutes: 90,
        status: 'attended',
        focusRating: 4,
      }));
      setLectures(newLectures);
    } else {
      setLectures([]);
    }

    setUser({
      id: `user-${Date.now()}`,
      name: profile.name,
      email: authSession?.email || `${profile.name.toLowerCase().replace(/\s+/g, '.')}@student.edu`,
      college: 'Engineering Institute',
      role: 'student',
      isAdmin: false,
      loggedInAt: Date.now(),
      hasOnboarded: true,
    });

    setActiveView('overview');
  };

  const resetOnboarding = () => {
    setUserProfile(null);
    setIsHolidayMode(false);
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
    const startTime = transitState.leftCollegeTime || (now - 45 * 60 * 1000);
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

    if (bedtimeDate.getTime() <= now.getTime() + 10 * 60 * 1000) {
      bedtimeDate.setDate(bedtimeDate.getDate() + 1);
    }

    const availableMs = bedtimeDate.getTime() - now.getTime();
    let availableHoursBeforeDinner = Math.max(0, Math.round((availableMs / (1000 * 60 * 60)) * 10) / 10);
    
    // Net Usable Hours: On Holidays/Weekends, full day of study with mandatory breaks (6-8 hours max usable capacity)
    let usableHours: number;
    if (isHoliday) {
      availableHoursBeforeDinner = 8;
      usableHours = Math.max(0, Math.round((8 - dinnerMins / 60) * 10) / 10);
    } else {
      usableHours = Math.max(0, Math.round((availableHoursBeforeDinner - dinnerMins / 60) * 10) / 10);
    }

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
            const newDuration = Math.max(15, Math.round(task.duration * 0.7));
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
    setTasks([]);
    setLectures([]);
    setStudyDebt(0);
    setIsHolidayMode(false);
    setTargetBedtime('23:30');
    setDinnerDurationMinutes(30);
    setActiveView('overview');
    setIsTriageModalOpen(false);
  };

  // Computed Metrics
  const totalCollegeHours = useMemo(() => {
    if (isHoliday) return 0;
    return Math.round((lectures
      .filter((l) => l.status === 'attended')
      .reduce((sum, l) => sum + l.durationMinutes, 0) / 60) * 10) / 10;
  }, [lectures, isHoliday]);

  const totalTransitHours = useMemo(() => {
    if (isHoliday) return 0;
    return Math.round(((transitState.commuteDurationMinutes || 0) / 60) * 10) / 10;
  }, [transitState.commuteDurationMinutes, isHoliday]);

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
    if (totalActiveHours === 0 && tasks.length === 0) return 100;
    return totalActiveHours > 0
      ? Math.min(100, Math.round((totalCompletedStudyHours / totalActiveHours) * 100))
      : 100;
  }, [totalCollegeHours, totalTransitHours, totalCompletedStudyHours, tasks]);

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const activeTasksCount = tasks.filter((t) => !t.completed && !t.droppedTonight).length;

  const taskCompletionRate = totalTasksCount > 0
    ? Math.round((completedTasksCount / totalTasksCount) * 100)
    : 100;

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
        authSession,
        isAuthenticated,
        isAdmin,
        userProfile,
        hasOnboarded,
        completeOnboarding,
        resetOnboarding,
        isHoliday,
        isHolidayMode,
        toggleHolidayMode,
        currentDay,
        login,
        signup,
        googleLogin,
        guestLogin,
        convertGuestToAccount,
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
