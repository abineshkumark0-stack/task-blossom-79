import { useTasks } from '@/contexts/TaskContext';
import { Card, CardContent } from '@/components/ui/card';
import { ListTodo, CheckCircle2, Clock, AlertTriangle, Flame, Trophy, TrendingUp, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function StatsCards() {
  const { stats, streak, productivityScore, weeklyCompletionPct } = useTasks();

  const statItems = [
    { key: 'total', value: stats.total, label: 'Total Tasks', icon: ListTodo, gradient: 'gradient-primary', glow: 'glow-primary' },
    { key: 'completedToday', value: stats.completedToday, label: 'Completed Today', icon: CheckCircle2, gradient: 'gradient-health', glow: 'glow-health' },
    { key: 'upcoming', value: stats.upcoming, label: 'Upcoming', icon: Clock, gradient: 'gradient-study', glow: 'glow-study' },
    { key: 'overdue', value: stats.overdue, label: 'Overdue', icon: AlertTriangle, gradient: 'gradient-work', glow: 'glow-work' },
    { key: 'streak', value: streak.current, label: 'Current Streak 🔥', icon: Flame, gradient: 'gradient-fitness', glow: 'glow-fitness' },
    { key: 'longest', value: streak.longest, label: 'Longest Streak', icon: Trophy, gradient: 'gradient-exam', glow: 'glow-exam' },
    { key: 'weekly', value: `${weeklyCompletionPct}%`, label: 'Weekly Completion', icon: TrendingUp, gradient: 'gradient-college', glow: 'glow-college' },
    { key: 'score', value: productivityScore, label: 'Productivity Score', icon: Target, gradient: 'gradient-coding', glow: 'glow-coding' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, i) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
        >
          <Card className={cn("glass-card card-hover-lift overflow-hidden border-0", item.glow)}>
            <CardContent className="p-0">
              <div className="flex items-center gap-3 p-4">
                <div className={cn("p-2.5 rounded-xl text-primary-foreground", item.gradient)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold tracking-tight">{item.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                </div>
              </div>
              <div className={cn("h-1 w-full opacity-60", item.gradient)} />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
