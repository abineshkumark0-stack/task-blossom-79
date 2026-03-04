export type Category = 'study' | 'work' | 'personal' | 'health' | 'fitness' | 'college' | 'exam' | 'coding';
export type TaskStatus = 'active' | 'completed' | 'overdue';
export type Priority = 'low' | 'medium' | 'high';
export type RepeatOption = 'none' | 'daily' | 'weekly' | 'custom';

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  time: string; // HH:mm
  category: Category;
  priority: Priority;
  repeat: RepeatOption;
  completed: boolean;
  snoozedUntil?: string; // ISO date string
  createdAt: string;
  googleEventId?: string;
}

export const CATEGORY_CONFIG: Record<Category, { label: string; emoji: string; color: string; bgClass: string; textClass: string }> = {
  study: { label: 'Study', emoji: '📚', color: '217 91% 60%', bgClass: 'bg-category-study/15', textClass: 'text-category-study' },
  work: { label: 'Work', emoji: '💼', color: '25 95% 53%', bgClass: 'bg-category-work/15', textClass: 'text-category-work' },
  personal: { label: 'Personal', emoji: '✨', color: '280 85% 60%', bgClass: 'bg-category-personal/15', textClass: 'text-category-personal' },
  health: { label: 'Health', emoji: '💚', color: '160 84% 39%', bgClass: 'bg-category-health/15', textClass: 'text-category-health' },
  fitness: { label: 'Fitness', emoji: '🏋️', color: '340 82% 52%', bgClass: 'bg-category-fitness/15', textClass: 'text-category-fitness' },
  college: { label: 'College', emoji: '🎓', color: '190 80% 42%', bgClass: 'bg-category-college/15', textClass: 'text-category-college' },
  exam: { label: 'Exam', emoji: '📝', color: '45 93% 47%', bgClass: 'bg-category-exam/15', textClass: 'text-category-exam' },
  coding: { label: 'Coding', emoji: '💻', color: '150 80% 44%', bgClass: 'bg-category-coding/15', textClass: 'text-category-coding' },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-category-health' },
  medium: { label: 'Medium', color: 'text-category-work' },
  high: { label: 'High', color: 'text-destructive' },
};

export type ViewMode = 'list' | 'grid';
export type FilterStatus = 'all' | 'active' | 'completed' | 'overdue';

export interface Goal {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  completedDays: number;
  createdAt: string;
}

export interface TimetableEntry {
  id: string;
  day: string;
  subject: string;
  startTime: string;
  endTime: string;
  faculty?: string;
  classroom?: string;
}

export interface StreakData {
  current: number;
  longest: number;
  lastCompletedDate: string;
}
