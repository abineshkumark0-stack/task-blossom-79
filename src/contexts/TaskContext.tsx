import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { Task, Category, FilterStatus, ViewMode, Priority, RepeatOption, StreakData, Goal, TimetableEntry } from '@/types/task';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useNotifications } from '@/hooks/useNotifications';
import { isAfter, isBefore, isToday, parseISO, startOfDay, format, differenceInCalendarDays, subDays } from 'date-fns';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  snoozeTask: (id: string, minutes: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterCategory: Category | 'all';
  setFilterCategory: (c: Category | 'all') => void;
  filterStatus: FilterStatus;
  setFilterStatus: (s: FilterStatus) => void;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  filteredTasks: Task[];
  stats: { total: number; completedToday: number; upcoming: number; overdue: number };
  streak: StreakData;
  productivityScore: number;
  weeklyCompletionPct: number;
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completedDays'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  timetable: TimetableEntry[];
  addTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => void;
  updateTimetableEntry: (id: string, updates: Partial<TimetableEntry>) => void;
  deleteTimetableEntry: (id: string) => void;
  completionHistory: Record<string, number>; // date -> completed count
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useLocalStorage<Task[]>('reminder-tasks', []);
  const [searchQuery, setSearchQuery] = useLocalStorage('reminder-search', '');
  const [filterCategory, setFilterCategory] = useLocalStorage<Category | 'all'>('reminder-filter-cat', 'all');
  const [filterStatus, setFilterStatus] = useLocalStorage<FilterStatus>('reminder-filter-status', 'all');
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('reminder-view', 'list');
  const [goals, setGoals] = useLocalStorage<Goal[]>('reminder-goals', []);
  const [timetable, setTimetable] = useLocalStorage<TimetableEntry[]>('reminder-timetable', []);
  const [completionHistory, setCompletionHistory] = useLocalStorage<Record<string, number>>('reminder-completion-history', {});

  useNotifications(tasks);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completed: false,
    };
    setTasks(prev => [...prev, newTask]);
    localStorage.setItem('reminder-tasks-last-modified', new Date().toISOString());
    return newTask;
  }, [setTasks]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, [setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, [setTasks]);

  const toggleComplete = useCallback((id: string) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id !== id) return t;
        const nowCompleted = !t.completed;
        return { ...t, completed: nowCompleted };
      });
      // Update completion history
      const today = format(new Date(), 'yyyy-MM-dd');
      const completedToday = updated.filter(t => t.completed && isToday(parseISO(t.createdAt))).length;
      setCompletionHistory(prev => ({ ...prev, [today]: completedToday }));
      localStorage.setItem('reminder-last-completion', new Date().toISOString());
      return updated;
    });
  }, [setTasks, setCompletionHistory]);

  const snoozeTask = useCallback((id: string, minutes: number) => {
    const snoozeDate = new Date(Date.now() + minutes * 60000);
    setTasks(prev => prev.map(t => t.id === id ? {
      ...t,
      date: format(snoozeDate, 'yyyy-MM-dd'),
      time: format(snoozeDate, 'HH:mm'),
      snoozedUntil: snoozeDate.toISOString()
    } : t));
  }, [setTasks]);

  // Goal management
  const addGoal = useCallback((goalData: Omit<Goal, 'id' | 'createdAt' | 'completedDays'>) => {
    const newGoal: Goal = { ...goalData, id: crypto.randomUUID(), createdAt: new Date().toISOString(), completedDays: 0 };
    setGoals(prev => [...prev, newGoal]);
  }, [setGoals]);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, [setGoals]);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, [setGoals]);

  // Timetable management
  const addTimetableEntry = useCallback((entry: Omit<TimetableEntry, 'id'>) => {
    setTimetable(prev => [...prev, { ...entry, id: crypto.randomUUID() }]);
  }, [setTimetable]);

  const updateTimetableEntry = useCallback((id: string, updates: Partial<TimetableEntry>) => {
    setTimetable(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, [setTimetable]);

  const deleteTimetableEntry = useCallback((id: string) => {
    setTimetable(prev => prev.filter(e => e.id !== id));
  }, [setTimetable]);

  const now = new Date();

  const getTaskStatus = useCallback((task: Task): 'active' | 'completed' | 'overdue' => {
    if (task.completed) return 'completed';
    const taskDate = new Date(`${task.date}T${task.time}`);
    if (isBefore(taskDate, now)) return 'overdue';
    return 'active';
  }, [now]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!task.title.toLowerCase().includes(q) && !task.description.toLowerCase().includes(q)) return false;
      }
      if (filterCategory !== 'all' && task.category !== filterCategory) return false;
      if (filterStatus !== 'all') {
        const status = getTaskStatus(task);
        if (filterStatus !== status) return false;
      }
      return true;
    });
  }, [tasks, searchQuery, filterCategory, filterStatus, getTaskStatus]);

  const stats = useMemo(() => ({
    total: tasks.length,
    completedToday: tasks.filter(t => t.completed && isToday(parseISO(t.createdAt))).length,
    upcoming: tasks.filter(t => !t.completed && isAfter(new Date(`${t.date}T${t.time}`), now)).length,
    overdue: tasks.filter(t => !t.completed && isBefore(new Date(`${t.date}T${t.time}`), now)).length,
  }), [tasks, now]);

  // Streak calculation
  const streak = useMemo((): StreakData => {
    const stored = localStorage.getItem('reminder-streak');
    const defaultStreak: StreakData = { current: 0, longest: 0, lastCompletedDate: '' };
    const prev: StreakData = stored ? JSON.parse(stored) : defaultStreak;

    const today = format(now, 'yyyy-MM-dd');
    const todayCompleted = tasks.some(t => t.completed && t.date === today);
    const yesterday = format(subDays(now, 1), 'yyyy-MM-dd');

    let current = prev.current;
    let longest = prev.longest;
    let lastDate = prev.lastCompletedDate;

    if (todayCompleted && lastDate !== today) {
      if (lastDate === yesterday || lastDate === '') {
        current += 1;
      } else {
        current = 1;
      }
      lastDate = today;
    } else if (!todayCompleted && lastDate !== today && lastDate !== yesterday && lastDate !== '') {
      current = 0;
    }

    longest = Math.max(longest, current);
    const result = { current, longest, lastCompletedDate: lastDate };
    localStorage.setItem('reminder-streak', JSON.stringify(result));
    return result;
  }, [tasks, now]);

  // Productivity score (0-100)
  const productivityScore = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    const overdueCount = stats.overdue;
    const baseScore = (completed / tasks.length) * 100;
    const penalty = (overdueCount / tasks.length) * 20;
    const streakBonus = Math.min(streak.current * 2, 15);
    return Math.max(0, Math.min(100, Math.round(baseScore - penalty + streakBonus)));
  }, [tasks, stats.overdue, streak.current]);

  // Weekly completion percentage
  const weeklyCompletionPct = useMemo(() => {
    const weekAgo = subDays(now, 7);
    const weekTasks = tasks.filter(t => {
      const d = parseISO(t.date);
      return isAfter(d, weekAgo);
    });
    if (weekTasks.length === 0) return 0;
    const completed = weekTasks.filter(t => t.completed).length;
    return Math.round((completed / weekTasks.length) * 100);
  }, [tasks, now]);

  return (
    <TaskContext.Provider value={{
      tasks, addTask, updateTask, deleteTask, toggleComplete, snoozeTask,
      searchQuery, setSearchQuery, filterCategory, setFilterCategory,
      filterStatus, setFilterStatus, viewMode, setViewMode, filteredTasks, stats,
      streak, productivityScore, weeklyCompletionPct,
      goals, addGoal, updateGoal, deleteGoal,
      timetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry,
      completionHistory,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}
