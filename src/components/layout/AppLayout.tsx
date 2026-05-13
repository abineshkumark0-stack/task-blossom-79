import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useState } from 'react';
import { TaskModal } from '@/components/tasks/TaskModal';
import { ChatBot } from '@/components/chat/ChatBot';
import { useAccentColor } from '@/hooks/useAccentColor';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  useAccentColor();

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
      <ChatBot />
    </div>
  );
}
