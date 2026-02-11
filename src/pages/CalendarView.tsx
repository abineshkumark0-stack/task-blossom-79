import { useTasks } from '@/contexts/TaskContext';
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isToday, getDay, addMonths, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_CONFIG, Task } from '@/types/task';
import { TaskModal } from '@/components/tasks/TaskModal';

const CalendarView = () => {
  const { tasks } = useTasks();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const tasksForDay = (day: Date) => tasks.filter(t => isSameDay(parseISO(t.date), day));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Calendar View</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium min-w-[140px] text-center">{format(currentMonth, 'MMMM yyyy')}</span>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-muted">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[80px] border-t border-r bg-muted/30" />
          ))}
          {days.map(day => {
            const dayTasks = tasksForDay(day);
            return (
              <div key={day.toISOString()} className={cn(
                "min-h-[80px] border-t border-r p-1.5",
                isToday(day) && "bg-accent/50"
              )}>
                <span className={cn(
                  "text-xs font-medium",
                  isToday(day) && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                )}>
                  {format(day, 'd')}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayTasks.slice(0, 3).map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setEditingTask(t); setModalOpen(true); }}
                      className={cn(
                        "block w-full text-left text-[10px] px-1 py-0.5 rounded truncate",
                        CATEGORY_CONFIG[t.category].bgClass,
                        CATEGORY_CONFIG[t.category].textClass,
                        t.completed && "line-through opacity-60"
                      )}
                    >
                      {t.title}
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] text-muted-foreground px-1">+{dayTasks.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TaskModal open={modalOpen} onOpenChange={setModalOpen} editingTask={editingTask} />
    </div>
  );
};

export default CalendarView;
