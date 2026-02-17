import { useState } from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { TaskDisplay } from '@/components/dashboard/TaskDisplay';
import { TaskModal } from '@/components/tasks/TaskModal';
import { Task } from '@/types/task';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Dashboard
            <Sparkles className="h-5 w-5 text-primary" />
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your daily reminders</p>
        </div>
      </div>
      <StatsCards />
      <TaskDisplay onEditTask={handleEdit} />
      <TaskModal open={editModalOpen} onOpenChange={setEditModalOpen} editingTask={editingTask} />
    </div>
  );
};

export default Index;
