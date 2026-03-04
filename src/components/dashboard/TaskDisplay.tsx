import { useTasks } from '@/contexts/TaskContext';
import { TaskItem } from './TaskItem';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { LayoutList, LayoutGrid } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskDisplayProps {
  onEditTask: (task: Task) => void;
}

export function TaskDisplay({ onEditTask }: TaskDisplayProps) {
  const { filteredTasks, viewMode, setViewMode } = useTasks();

  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    const sorted = [...filteredTasks].sort((a, b) => {
      const da = new Date(`${a.date}T${a.time}`).getTime();
      const db = new Date(`${b.date}T${b.time}`).getTime();
      return da - db;
    });
    sorted.forEach(task => {
      const key = task.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });
    return groups;
  }, [filteredTasks]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <div className="flex items-center border rounded-lg overflow-hidden">
          <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="rounded-none h-8" onClick={() => setViewMode('list')}>
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="rounded-none h-8" onClick={() => setViewMode('grid')}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No tasks found</p>
          <p className="text-sm mt-1">Add a new task to get started!</p>
        </motion.div>
      ) : viewMode === 'list' ? (
        <div className="space-y-6">
          <AnimatePresence>
            {Object.entries(groupedTasks).map(([date, tasks]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                </h3>
                <div className="space-y-2">
                  {tasks.map(task => (
                    <TaskItem key={task.id} task={task} onEdit={onEditTask} variant="list" />
                  ))}
                </div>
              </div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredTasks
              .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
              .map(task => (
                <TaskItem key={task.id} task={task} onEdit={onEditTask} variant="card" />
              ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
