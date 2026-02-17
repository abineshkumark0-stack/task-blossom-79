import { useTasks } from '@/contexts/TaskContext';
import { Card, CardContent } from '@/components/ui/card';
import { ListTodo, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const statItems = [
  { key: 'total' as const, label: 'Total Tasks', icon: ListTodo, gradient: 'gradient-primary', glow: 'glow-primary' },
  { key: 'completedToday' as const, label: 'Completed Today', icon: CheckCircle2, gradient: 'gradient-health', glow: 'glow-health' },
  { key: 'upcoming' as const, label: 'Upcoming', icon: Clock, gradient: 'gradient-study', glow: 'glow-study' },
  { key: 'overdue' as const, label: 'Overdue', icon: AlertTriangle, gradient: 'gradient-work', glow: 'glow-work' },
];

export function StatsCards() {
  const { stats } = useTasks();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, i) => (
        <Card
          key={item.key}
          className={cn(
            "card-hover-lift overflow-hidden border-0",
            item.glow
          )}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <CardContent className="p-0">
            <div className="flex items-center gap-3 p-4">
              <div className={cn("p-2.5 rounded-xl text-white", item.gradient)}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-3xl font-extrabold tracking-tight">{stats[item.key]}</p>
                <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
              </div>
            </div>
            <div className={cn("h-1 w-full opacity-60", item.gradient)} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
