import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { Task, Category, FilterStatus, ViewMode } from '@/types/task';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useNotifications } from '@/hooks/useNotifications';
import { isAfter, isBefore, isToday, parseISO, startOfDay } from 'date-fns';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
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
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useLocalStorage<Task[]>('reminder-tasks', []);
  const [searchQuery, setSearchQuery] = useLocalStorage('reminder-search', '');
  const [filterCategory, setFilterCategory] = useLocalStorage<Category | 'all'>('reminder-filter-cat', 'all');
  const [filterStatus, setFilterStatus] = useLocalStorage<FilterStatus>('reminder-filter-status', 'all');
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('reminder-view', 'list');

  useNotifications(tasks);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completed: false,
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, [setTasks]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, [setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, [setTasks]);

  const toggleComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, [setTasks]);

  const now = new Date();
  const todayStart = startOfDay(now);

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

  return (
    <TaskContext.Provider value={{
      tasks, addTask, updateTask, deleteTask, toggleComplete,
      searchQuery, setSearchQuery, filterCategory, setFilterCategory,
      filterStatus, setFilterStatus, viewMode, setViewMode, filteredTasks, stats,
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
