import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTasks } from '@/contexts/TaskContext';
import { Task, Category, CATEGORY_CONFIG, Priority, RepeatOption } from '@/types/task';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceInput, parseVoiceTask } from '@/hooks/useVoiceInput';
import { cn } from '@/lib/utils';

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask?: Task | null;
}

export function TaskModal({ open, onOpenChange, editingTask }: TaskModalProps) {
  const { addTask, updateTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [category, setCategory] = useState<Category>('personal');
  const [priority, setPriority] = useState<Priority>('medium');
  const [repeat, setRepeat] = useState<RepeatOption>('none');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setDate(editingTask.date);
      setTime(editingTask.time);
      setCategory(editingTask.category);
      setPriority(editingTask.priority || 'medium');
      setRepeat(editingTask.repeat || 'none');
    } else {
      setTitle(''); setDescription('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setTime(format(new Date(), 'HH:mm'));
      setCategory('personal'); setPriority('medium'); setRepeat('none');
    }
    setErrors({});
  }, [editingTask, open]);

  const handleVoice = useCallback((text: string) => {
    const parsed = parseVoiceTask(text);
    setTitle(parsed.title);
    if (parsed.date) setDate(parsed.date);
    if (parsed.time) setTime(parsed.time);
    toast.success(`🎙️ "${parsed.title}"${parsed.date ? ' • ' + parsed.date : ''}${parsed.time ? ' ' + parsed.time : ''}`);
  }, []);
  const { listening, supported, start, stop } = useVoiceInput(handleVoice);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!date) errs.date = 'Date is required';
    if (!time) errs.time = 'Time is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingTask) {
      updateTask(editingTask.id, { title: title.trim(), description: description.trim(), date, time, category, priority, repeat });
      toast.success('Task updated!');
    } else {
      addTask({ title: title.trim(), description: description.trim(), date, time, category, priority, repeat });
      toast.success('Task added!');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="flex items-center justify-between">
              <span>Title *</span>
              {supported && (
                <button
                  type="button"
                  onClick={listening ? stop : start}
                  className={cn(
                    'inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full transition-all',
                    listening
                      ? 'bg-destructive/15 text-destructive animate-pulse'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  )}
                  title={listening ? 'Stop' : 'Speak: e.g. "Tomorrow 6 PM study DBMS"'}
                >
                  {listening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                  {listening ? 'Listening…' : 'Voice'}
                </button>
              )}
            </Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder='Task title (or tap "Voice")' />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>
          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
              {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
            </div>
            <div>
              <Label htmlFor="time">Time *</Label>
              <Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} />
              {errors.time && <p className="text-xs text-destructive mt-1">{errors.time}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={v => setCategory(v as Category)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.emoji} {cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={v => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Repeat</Label>
              <Select value={repeat} onValueChange={v => setRepeat(v as RepeatOption)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="gradient-primary text-primary-foreground border-0">{editingTask ? 'Save Changes' : 'Add Task'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
