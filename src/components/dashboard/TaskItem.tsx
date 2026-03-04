import { Task, CATEGORY_CONFIG, PRIORITY_CONFIG } from '@/types/task';
import { useTasks } from '@/contexts/TaskContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Clock, BookOpen, Briefcase, Heart, User, Dumbbell, GraduationCap, FileText, Code2, AlarmClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isBefore } from 'date-fns';
import { motion } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  variant?: 'list' | 'card';
}

const categoryGlow: Record<string, string> = {
  study: 'glow-study', work: 'glow-work', personal: 'glow-personal', health: 'glow-health',
  fitness: 'glow-fitness', college: 'glow-college', exam: 'glow-exam', coding: 'glow-coding',
};

const categoryGradient: Record<string, string> = {
  study: 'gradient-study', work: 'gradient-work', personal: 'gradient-personal', health: 'gradient-health',
  fitness: 'gradient-fitness', college: 'gradient-college', exam: 'gradient-exam', coding: 'gradient-coding',
};

const categoryIcons: Record<string, React.ElementType> = {
  study: BookOpen, work: Briefcase, personal: User, health: Heart,
  fitness: Dumbbell, college: GraduationCap, exam: FileText, coding: Code2,
};

function CategoryBadge({ category }: { category: string }) {
  const cat = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
  const Icon = categoryIcons[category] || BookOpen;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide", `badge-${category}`)}>
      <Icon className="h-3 w-3" />
      {cat?.label || category}
    </span>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high: 'bg-destructive', medium: 'bg-category-work', low: 'bg-category-health',
  };
  return <span className={cn("w-2 h-2 rounded-full shrink-0", colors[priority] || 'bg-muted-foreground')} title={`${priority} priority`} />;
}

export function TaskItem({ task, onEdit, variant = 'list' }: TaskItemProps) {
  const { toggleComplete, deleteTask, snoozeTask } = useTasks();
  const isOverdue = !task.completed && isBefore(new Date(`${task.date}T${task.time}`), new Date());

  const handleToggle = () => {
    const updated = { ...task, completed: !task.completed };
    localStorage.setItem(`task-${task.id}`, JSON.stringify(updated));
    toggleComplete(task.id);
  };

  if (variant === 'card') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "rounded-2xl glass-card p-4 flex flex-col gap-3 card-hover-lift relative overflow-hidden group",
          task.completed ? "opacity-70" : categoryGlow[task.category]
        )}
      >
        <div className={cn("absolute top-0 left-0 w-full h-1.5 rounded-t-2xl", categoryGradient[task.category])} />
        <div className="flex items-start justify-between gap-2 pt-2">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <Checkbox checked={task.completed} onCheckedChange={handleToggle} className="mt-0.5 shrink-0" />
            <div className={cn("min-w-0", task.completed && "task-completed")}>
              <div className="flex items-center gap-2">
                <PriorityDot priority={task.priority || 'medium'} />
                <p className={cn("font-semibold truncate task-strikethrough transition-colors duration-300", task.completed && "text-muted-foreground")}>
                  {task.title}
                </p>
              </div>
              {task.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{task.description}</p>}
            </div>
          </div>
          <CategoryBadge category={task.category} />
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className={cn("flex items-center gap-1.5 text-xs font-bold", isOverdue ? "text-destructive" : "text-foreground/70")}>
            <Clock className="h-3 w-3 shrink-0" />
            <span className="font-bold">{format(new Date(`${task.date}T${task.time}`), 'MMM d, h:mm a')}</span>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent"><AlarmClock className="h-3.5 w-3.5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => snoozeTask(task.id, 15)}>15 min</DropdownMenuItem>
                <DropdownMenuItem onClick={() => snoozeTask(task.id, 30)}>30 min</DropdownMenuItem>
                <DropdownMenuItem onClick={() => snoozeTask(task.id, 60)}>1 hour</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent" onClick={() => onEdit(task)}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => deleteTask(task.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={cn("flex items-center gap-3 p-3 rounded-2xl glass-card card-hover-lift relative overflow-hidden group", task.completed ? "opacity-70" : "")}
    >
      <div className={cn("absolute left-0 top-0 w-1.5 h-full rounded-l-2xl", categoryGradient[task.category])} />
      <div className="pl-2 shrink-0"><Checkbox checked={task.completed} onCheckedChange={handleToggle} /></div>
      <PriorityDot priority={task.priority || 'medium'} />
      <div className={cn("flex-1 min-w-0", task.completed && "task-completed")}>
        <p className={cn("font-semibold truncate task-strikethrough transition-colors duration-300", task.completed && "text-muted-foreground")}>{task.title}</p>
        {task.description && <p className="text-sm text-muted-foreground truncate">{task.description}</p>}
      </div>
      <CategoryBadge category={task.category} />
      <div className={cn("flex items-center gap-1 text-xs shrink-0 font-bold", isOverdue ? "text-destructive" : "text-foreground/70")}>
        <Clock className="h-3 w-3 shrink-0" />
        <span className="hidden sm:inline font-bold">{format(new Date(`${task.date}T${task.time}`), 'MMM d,')}</span>
        <span className="font-bold">{format(new Date(`${task.date}T${task.time}`), 'h:mm a')}</span>
      </div>
      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent"><AlarmClock className="h-3.5 w-3.5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => snoozeTask(task.id, 15)}>Snooze 15 min</DropdownMenuItem>
            <DropdownMenuItem onClick={() => snoozeTask(task.id, 30)}>Snooze 30 min</DropdownMenuItem>
            <DropdownMenuItem onClick={() => snoozeTask(task.id, 60)}>Snooze 1 hour</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent" onClick={() => onEdit(task)}><Pencil className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteTask(task.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    </motion.div>
  );
}
