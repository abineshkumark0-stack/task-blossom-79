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
  enabled: true,
  beforeMinutes: 5,
  dailySummary: true,
  streakAlerts: true,
  goalReminders: true,
};

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

  const sendNotification = useCallback((title: string, body: string, tag?: string) => {
    if ('Notification' in window && Notification.permission === 'granted' && prefs.enabled) {
      new Notification(title, { body, icon: '/placeholder.svg', tag, badge: '/placeholder.svg' });
    } else {
      toast.info(title, { description: body });
    }
  }, [prefs.enabled]);

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

    tasks.filter(t => !t.completed).forEach(task => {
      const taskTime = new Date(`${task.date}T${task.time}`).getTime();
      const reminderTime = taskTime - reminderOffset;
      const delay = reminderTime - now;

      if (delay > 0 && delay < 86400000) {
        const timeout = setTimeout(() => {
          sendNotification(
            `⏰ ${task.title}`,
            task.description || `Due in ${prefs.beforeMinutes} minutes — time to get it done!`,
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
            task.description || 'This task is due right now!',
            `task-now-${task.id}`
          );
        }, exactDelay);
        timeoutsRef.current.set(`exact-${task.id}`, exactTimeout);
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
