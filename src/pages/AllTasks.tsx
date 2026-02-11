import { useState } from 'react';
import { TaskDisplay } from '@/components/dashboard/TaskDisplay';
import { TaskModal } from '@/components/tasks/TaskModal';
import { Task } from '@/types/task';

const AllTasks = () => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">All Tasks</h1>
      <TaskDisplay onEditTask={handleEdit} />
      <TaskModal open={editModalOpen} onOpenChange={setEditModalOpen} editingTask={editingTask} />
    </div>
  );
};

export default AllTasks;
