import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useState } from 'react';
import { TaskModal } from '@/components/tasks/TaskModal';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar onAddTask={() => setModalOpen(true)} />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <TaskModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
