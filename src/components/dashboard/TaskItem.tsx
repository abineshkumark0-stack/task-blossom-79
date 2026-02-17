import { Task, CATEGORY_CONFIG } from '@/types/task';
import { useTasks } from '@/contexts/TaskContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isBefore } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  variant?: 'list' | 'card';
}

const categoryGlow: Record<string, string> = {
  study: 'glow-study',
  work: 'glow-work',
  personal: 'glow-personal',
  health: 'glow-health',
};

const categoryGradient: Record<string, string> = {
  study: 'gradient-study',
  work: 'gradient-work',
  personal: 'gradient-personal',
  health: 'gradient-health',
};

export function TaskItem({ task, onEdit, variant = 'list' }: TaskItemProps) {
  const { toggleComplete, deleteTask } = useTasks();
  const cat = CATEGORY_CONFIG[task.category];
  const isOverdue = !task.completed && isBefore(new Date(`${task.date}T${task.time}`), new Date());

  if (variant === 'card') {
    return (
      <div className={cn(
        "rounded-xl border bg-card p-4 flex flex-col gap-3 card-hover-lift relative overflow-hidden",
        task.completed ? "opacity-60" : categoryGlow[task.category]
      )}>
        {/* Category accent stripe */}
        <div className={cn("absolute top-0 left-0 w-full h-1", categoryGradient[task.category])} />
        <div className="flex items-start justify-between gap-2 pt-1">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleComplete(task.id)}
              className="mt-0.5"
            />
            <div className="min-w-0">
              <p className={cn("font-semibold truncate", task.completed && "line-through text-muted-foreground")}>
                {task.title}
              </p>
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{task.description}</p>
              )}
            </div>
          </div>
          <Badge variant="outline" className={cn(cat.bgClass, cat.textClass, "border-0 text-xs shrink-0 font-semibold")}>
            {cat.label}
          </Badge>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className={cn("flex items-center gap-1 text-xs font-medium", isOverdue ? "text-destructive" : "text-muted-foreground")}>
            <Clock className="h-3 w-3" />
            {format(new Date(`${task.date}T${task.time}`), 'MMM d, h:mm a')}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent" onClick={() => onEdit(task)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => deleteTask(task.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl border bg-card card-hover-lift relative overflow-hidden",
      task.completed ? "opacity-60" : ""
    )}>
      {/* Left color accent bar */}
      <div className={cn("absolute left-0 top-0 w-1 h-full rounded-l-xl", categoryGradient[task.category])} />
      <div className="pl-2">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => toggleComplete(task.id)}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-semibold truncate", task.completed && "line-through text-muted-foreground")}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-muted-foreground truncate">{task.description}</p>
        )}
      </div>
      <Badge variant="outline" className={cn(cat.bgClass, cat.textClass, "border-0 text-xs hidden sm:inline-flex font-semibold")}>
        {cat.label}
      </Badge>
      <div className={cn("flex items-center gap-1 text-xs shrink-0 font-medium", isOverdue ? "text-destructive" : "text-muted-foreground")}>
        <Clock className="h-3 w-3" />
        <span className="hidden sm:inline">{format(new Date(`${task.date}T${task.time}`), 'MMM d,')}</span>
        {format(new Date(`${task.date}T${task.time}`), 'h:mm a')}
      </div>
      <div className="flex gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent" onClick={() => onEdit(task)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteTask(task.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
