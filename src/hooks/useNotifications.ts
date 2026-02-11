import { useEffect, useRef, useCallback } from 'react';
import { Task } from '@/types/task';
import { toast } from 'sonner';

export function useNotifications(tasks: Task[]) {
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    // Clear old timeouts
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current.clear();

    const now = Date.now();
    tasks.filter(t => !t.completed).forEach(task => {
      const taskTime = new Date(`${task.date}T${task.time}`).getTime();
      const delay = taskTime - now;
      if (delay > 0 && delay < 86400000) { // within 24h
        const timeout = setTimeout(() => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Reminder: ${task.title}`, { body: task.description || 'Time for your task!' });
          } else {
            toast.info(`Reminder: ${task.title}`, { description: task.description });
          }
        }, delay);
        timeoutsRef.current.set(task.id, timeout);
      }
    });

    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, [tasks]);

  return { requestPermission };
}
