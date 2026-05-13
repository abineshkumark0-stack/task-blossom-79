import { useEffect, useRef, useCallback } from 'react';
import { Task } from '@/types/task';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface NotificationPrefs {
  enabled: boolean;
  beforeMinutes: number;
  dailySummary: boolean;
  streakAlerts: boolean;
  goalReminders: boolean;
  vibration: boolean;
  vibrationPattern: 'short' | 'medium' | 'long' | 'double';
}

const VIBRATION_PATTERNS: Record<NotificationPrefs['vibrationPattern'], number[]> = {
  short: [100],
  medium: [200, 100, 200],
  long: [500, 200, 500],
  double: [100, 50, 100],
};

const DEFAULT_PREFS: NotificationPrefs = {
  enabled: true,
  beforeMinutes: 5,
  dailySummary: true,
  streakAlerts: true,
  goalReminders: true,
  vibration: true,
  vibrationPattern: 'medium',
};

const supportsVibration = () => 'vibrate' in navigator;

export function useNotifications(tasks: Task[]) {
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [prefs, setPrefs] = useLocalStorage<NotificationPrefs>('reminder-notif-prefs', DEFAULT_PREFS);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        toast.success('🔔 Notifications enabled! You\'ll get reminders for your tasks.');
      }
    }
  }, []);

  const vibrate = useCallback((pattern?: NotificationPrefs['vibrationPattern']) => {
    if (prefs.vibration && supportsVibration()) {
      navigator.vibrate(VIBRATION_PATTERNS[pattern || prefs.vibrationPattern]);
    }
  }, [prefs.vibration, prefs.vibrationPattern]);

  const sendNotification = useCallback((title: string, body: string, tag?: string) => {
    if ('Notification' in window && Notification.permission === 'granted' && prefs.enabled) {
      new Notification(title, { body, icon: '/placeholder.svg', tag, badge: '/placeholder.svg' });
    } else {
      toast.info(title, { description: body });
    }
    vibrate();
  }, [prefs.enabled, vibrate]);

  useEffect(() => {
    if (prefs.enabled) requestPermission();
  }, [prefs.enabled, requestPermission]);

  // Schedule individual task reminders
  useEffect(() => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current.clear();

    if (!prefs.enabled) return;

    const now = Date.now();
    const reminderOffset = prefs.beforeMinutes * 60000;

    const FUNNY_LINES = [
      'Your task is still waiting 👀',
      'Future you will thank you 😎',
      "Let's crush this one 🔥",
      "Don't ghost your goals 👻",
      'Tiny step, big win 🚀',
      'Procrastination has entered the chat… block it 🛑',
    ];
    const pickLine = (i: number) => FUNNY_LINES[i % FUNNY_LINES.length];

    tasks.filter(t => !t.completed).forEach((task, idx) => {
      const taskTime = new Date(`${task.date}T${task.time}`).getTime();
      const reminderTime = taskTime - reminderOffset;
      const delay = reminderTime - now;

      if (delay > 0 && delay < 86400000) {
        const timeout = setTimeout(() => {
          sendNotification(
            `⏰ ${task.title}`,
            task.description || `Due in ${prefs.beforeMinutes} min — ${pickLine(idx)}`,
            `task-${task.id}`
          );
        }, delay);
        timeoutsRef.current.set(task.id, timeout);
      }

      // Also schedule an exact-time reminder
      const exactDelay = taskTime - now;
      if (exactDelay > 0 && exactDelay < 86400000 && reminderOffset > 0) {
        const exactTimeout = setTimeout(() => {
          sendNotification(
            `🚨 ${task.title} — NOW!`,
            task.description || pickLine(idx + 1),
            `task-now-${task.id}`
          );
        }, exactDelay);
        timeoutsRef.current.set(`exact-${task.id}`, exactTimeout);
      }

      // Overdue nudge: if already overdue, ping after a short delay
      if (exactDelay < 0 && exactDelay > -86400000) {
        const overdueTimeout = setTimeout(() => {
          sendNotification(
            `⚠️ Overdue: ${task.title}`,
            pickLine(idx + 2),
            `task-overdue-${task.id}`
          );
        }, 5000);
        timeoutsRef.current.set(`overdue-${task.id}`, overdueTimeout);
      }
    });

    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, [tasks, prefs.enabled, prefs.beforeMinutes, sendNotification]);

  // Daily summary notification at 8 AM
  useEffect(() => {
    if (!prefs.enabled || !prefs.dailySummary) return;

    const now = new Date();
    const eightAm = new Date(now);
    eightAm.setHours(8, 0, 0, 0);
    if (eightAm.getTime() <= now.getTime()) {
      eightAm.setDate(eightAm.getDate() + 1);
    }

    const delay = eightAm.getTime() - now.getTime();
    const timeout = setTimeout(() => {
      const todayStr = now.toISOString().split('T')[0];
      const todayTasks = tasks.filter(t => t.date === todayStr && !t.completed);
      if (todayTasks.length > 0) {
        sendNotification(
          '🌅 Good Morning!',
          `You have ${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} today. Let's crush it!`,
          'daily-summary'
        );
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [tasks, prefs.enabled, prefs.dailySummary, sendNotification]);

  return { requestPermission, prefs, setPrefs, sendNotification };
}
