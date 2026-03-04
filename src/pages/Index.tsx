import { useState } from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { TaskDisplay } from '@/components/dashboard/TaskDisplay';
import { TaskModal } from '@/components/tasks/TaskModal';
import { CompletionBar } from '@/components/dashboard/CompletionBar';
import { Task } from '@/types/task';
import { Sparkles, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTasks } from '@/contexts/TaskContext';

const Index = () => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { streak } = useTasks();

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Dashboard
            <Sparkles className="h-5 w-5 text-primary" />
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your daily reminders
            {streak.current > 0 && <span className="ml-2 text-category-work font-bold">🔥 {streak.current} day streak!</span>}
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className={cn(
            "add-btn-ring w-14 h-14 rounded-full text-primary-foreground flex items-center justify-center",
            "gradient-health shadow-lg hover:scale-110 active:scale-95",
            "transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-category-health/30"
          )}
          aria-label="Add new task"
          title="Add new task"
        >
          <Plus className="h-7 w-7 stroke-[2.5]" />
        </button>
      </motion.div>

      <StatsCards />
      <CompletionBar />
      <TaskDisplay onEditTask={handleEdit} />

      <TaskModal open={addModalOpen} onOpenChange={setAddModalOpen} editingTask={null} />
      <TaskModal open={editModalOpen} onOpenChange={setEditModalOpen} editingTask={editingTask} />
    </div>
  );
};

export default Index;
