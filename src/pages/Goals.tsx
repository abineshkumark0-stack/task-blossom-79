import { useState } from 'react';
import { useTasks } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Trash2, CalendarDays } from 'lucide-react';
import { format, parseISO, differenceInCalendarDays, addDays } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Goals = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalDays, setTotalDays] = useState(30);

  const handleAdd = () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    const startDate = format(new Date(), 'yyyy-MM-dd');
    const endDate = format(addDays(new Date(), totalDays), 'yyyy-MM-dd');
    addGoal({ title: title.trim(), description: description.trim(), startDate, endDate, totalDays });
    setTitle(''); setDescription(''); setTotalDays(30);
    setModalOpen(false);
    toast.success('Goal created! 🎯');
  };

  const incrementDay = (goalId: string, currentDays: number) => {
    updateGoal(goalId, { completedDays: currentDays + 1 });
    localStorage.setItem(`goal-${goalId}-last-increment`, new Date().toISOString());
    toast.success('Day completed! Keep going! 💪');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold tracking-tight flex items-center gap-2">
          🎯 Goal Mode
        </motion.h1>
        <Button onClick={() => setModalOpen(true)} className="gradient-primary text-primary-foreground rounded-xl glow-primary border-0 gap-2">
          <Plus className="h-4 w-4" /> New Challenge
        </Button>
      </div>

      {goals.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Target className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No active goals</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Create a 30-day challenge to stay motivated!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal, i) => {
            const pct = Math.round((goal.completedDays / goal.totalDays) * 100);
            const daysLeft = Math.max(0, differenceInCalendarDays(parseISO(goal.endDate), new Date()));
            const expectedPct = Math.round(((goal.totalDays - daysLeft) / goal.totalDays) * 100);

            return (
              <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="glass-card border-0 card-hover-lift overflow-hidden">
                  <div className={cn("h-1.5 w-full", pct >= expectedPct ? "gradient-health" : "gradient-work")} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{goal.title}</CardTitle>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { deleteGoal(goal.id); toast.info('Goal deleted'); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold">{goal.completedDays}/{goal.totalDays} days</span>
                        <span className="font-bold text-primary">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-3" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {daysLeft} days left</div>
                      <div>Expected: {expectedPct}%</div>
                    </div>

                    {goal.completedDays < goal.totalDays && (
                      <Button
                        size="sm"
                        className="w-full gradient-health text-primary-foreground border-0 rounded-xl"
                        onClick={() => incrementDay(goal.id, goal.completedDays)}
                      >
                        ✅ Mark Today Complete
                      </Button>
                    )}
                    {goal.completedDays >= goal.totalDays && (
                      <div className="text-center py-2 text-sm font-bold text-category-health">🎉 Challenge Complete!</div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="glass-card">
          <DialogHeader><DialogTitle>Create New Challenge</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Challenge Title *</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., 30 Days of Coding" /></div>
            <div><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" rows={2} /></div>
            <div><Label>Duration (days)</Label><Input type="number" value={totalDays} onChange={e => setTotalDays(Number(e.target.value))} min={1} max={365} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} className="gradient-primary text-primary-foreground border-0">Create Challenge</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;
