import { useTasks } from '@/contexts/TaskContext';
import { cn } from '@/lib/utils';

export function CompletionBar() {
  const { stats } = useTasks();
  const pct = stats.total === 0 ? 0 : Math.round((stats.completedToday / stats.total) * 100);

  // Store in localStorage explicitly
  localStorage.setItem('completion-pct', String(pct));

  const barColor =
    pct >= 80 ? 'gradient-health' :
    pct >= 50 ? 'gradient-study' :
    pct >= 20 ? 'gradient-work' :
    'gradient-primary';

  return (
    <div className="rounded-2xl border bg-card px-5 py-4 space-y-2 card-hover-lift glow-primary">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Overall Completion</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {stats.completedToday} of {stats.total} tasks done today
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-3xl font-extrabold tabular-nums leading-none",
              pct >= 80 ? 'text-category-health' :
              pct >= 50 ? 'text-category-study' :
              pct >= 20 ? 'text-category-work' :
              'text-primary'
            )}
          >
            {pct}
          </span>
          <span className="text-lg font-bold text-muted-foreground">%</span>
        </div>
      </div>

      {/* Track */}
      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full completion-bar-fill", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Milestones */}
      <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
