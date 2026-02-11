import { useTasks } from '@/contexts/TaskContext';
import { Card, CardContent } from '@/components/ui/card';
import { ListTodo, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const statItems = [
  { key: 'total' as const, label: 'Total Tasks', icon: ListTodo, color: 'text-primary' },
  { key: 'completedToday' as const, label: 'Completed Today', icon: CheckCircle2, color: 'text-category-health' },
  { key: 'upcoming' as const, label: 'Upcoming', icon: Clock, color: 'text-category-study' },
  { key: 'overdue' as const, label: 'Overdue', icon: AlertTriangle, color: 'text-destructive' },
];

export function StatsCards() {
  const { stats } = useTasks();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map(item => (
        <Card key={item.key} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats[item.key]}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
