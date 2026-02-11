export type Category = 'study' | 'work' | 'personal' | 'health';
export type TaskStatus = 'active' | 'completed' | 'overdue';

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  time: string; // HH:mm
  category: Category;
  completed: boolean;
  createdAt: string;
  googleEventId?: string;
}

export const CATEGORY_CONFIG: Record<Category, { label: string; color: string; bgClass: string; textClass: string }> = {
  study: { label: 'Study', color: '217 91% 60%', bgClass: 'bg-category-study/15', textClass: 'text-category-study' },
  work: { label: 'Work', color: '25 95% 53%', bgClass: 'bg-category-work/15', textClass: 'text-category-work' },
  personal: { label: 'Personal', color: '271 91% 65%', bgClass: 'bg-category-personal/15', textClass: 'text-category-personal' },
  health: { label: 'Health', color: '142 71% 45%', bgClass: 'bg-category-health/15', textClass: 'text-category-health' },
};

export type ViewMode = 'list' | 'grid';
export type FilterStatus = 'all' | 'active' | 'completed' | 'overdue';
