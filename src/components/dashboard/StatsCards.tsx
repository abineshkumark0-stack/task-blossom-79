import { useTasks } from '@/contexts/TaskContext';
import { Card, CardContent } from '@/components/ui/card';
import { ListTodo, CheckCircle2, Clock, AlertTriangle, Flame, Trophy, TrendingUp, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useI18n } from '@/contexts/I18nContext';

export function StatsCards() {
  const { stats, streak, productivityScore, weeklyCompletionPct } = useTasks();
  const { t } = useI18n();

  const statItems = [
    { key: 'total', value: stats.total, label: t('dashboard.totalTasks'), icon: ListTodo, gradient: 'gradient-primary', glow: 'glow-primary' },
    { key: 'completedToday', value: stats.completedToday, label: t('dashboard.completedToday'), icon: CheckCircle2, gradient: 'gradient-health', glow: 'glow-health' },
    { key: 'upcoming', value: stats.upcoming, label: t('dashboard.upcoming'), icon: Clock, gradient: 'gradient-study', glow: 'glow-study' },
    { key: 'overdue', value: stats.overdue, label: t('dashboard.overdue'), icon: AlertTriangle, gradient: 'gradient-work', glow: 'glow-work' },
    { key: 'streak', value: streak.current, label: t('dashboard.currentStreak'), icon: Flame, gradient: 'gradient-fitness', glow: 'glow-fitness' },
    { key: 'longest', value: streak.longest, label: t('dashboard.longestStreak'), icon: Trophy, gradient: 'gradient-exam', glow: 'glow-exam' },
    { key: 'weekly', value: `${weeklyCompletionPct}%`, label: t('dashboard.weeklyCompletion'), icon: TrendingUp, gradient: 'gradient-college', glow: 'glow-college' },
    { key: 'score', value: productivityScore, label: t('dashboard.productivityScore'), icon: Target, gradient: 'gradient-coding', glow: 'glow-coding' },
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
