import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Coffee, Brain, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Mode = 'focus' | 'short' | 'long';
interface FocusStats {
  totalSessions: number;
  totalMinutes: number;
  todayDate: string;
  todaySessions: number;
}
interface FocusSettings {
  focus: number;   // minutes
  short: number;
  long: number;
  longEvery: number;
}

const DEFAULT_SETTINGS: FocusSettings = { focus: 25, short: 5, long: 15, longEvery: 4 };
const DEFAULT_STATS: FocusStats = { totalSessions: 0, totalMinutes: 0, todayDate: '', todaySessions: 0 };

const MODE_META: Record<Mode, { label: string; icon: typeof Brain; gradient: string; glow: string }> = {
  focus: { label: 'Deep Focus', icon: Brain, gradient: 'gradient-primary', glow: 'glow-primary' },
  short: { label: 'Short Break', icon: Coffee, gradient: 'gradient-health', glow: 'glow-health' },
  long: { label: 'Long Break', icon: Coffee, gradient: 'gradient-personal', glow: 'glow-personal' },
};

function vibrate(pattern: number[]) {
  if ('vibrate' in navigator) navigator.vibrate(pattern);
}

const Focus = () => {
  const [settings] = useLocalStorage<FocusSettings>('reminder-focus-settings', DEFAULT_SETTINGS);
  const [stats, setStats] = useLocalStorage<FocusStats>('reminder-focus-stats', DEFAULT_STATS);
  const [mode, setMode] = useState<Mode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(settings.focus * 60);
  const [running, setRunning] = useState(false);
  const [completedFocus, setCompletedFocus] = useState(0);
  const tickRef = useRef<NodeJS.Timeout>();

  const total = settings[mode] * 60;
  const progress = useMemo(() => 1 - secondsLeft / total, [secondsLeft, total]);
  const meta = MODE_META[mode];

  // Reset today's stats if new day
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (stats.todayDate !== today) {
      setStats(s => ({ ...s, todayDate: today, todaySessions: 0 }));
    }
  }, [stats.todayDate, setStats]);

  // Switch mode resets timer
  useEffect(() => {
    setSecondsLeft(settings[mode] * 60);
    setRunning(false);
  }, [mode, settings]);

  // Tick
  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          handleSessionEnd();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const handleSessionEnd = () => {
    clearInterval(tickRef.current);
    setRunning(false);
    vibrate([200, 100, 200, 100, 400]);
    if (mode === 'focus') {
      const newCount = completedFocus + 1;
      setCompletedFocus(newCount);
      setStats(s => ({
        ...s,
        totalSessions: s.totalSessions + 1,
        totalMinutes: s.totalMinutes + settings.focus,
        todaySessions: s.todaySessions + 1,
      }));
      const nextMode: Mode = newCount % settings.longEvery === 0 ? 'long' : 'short';
      toast.success('🎉 Focus session complete! Time for a break.', { duration: 4000 });
      setMode(nextMode);
    } else {
      toast.success('☕ Break over! Ready for another focus round?', { duration: 4000 });
      setMode('focus');
    }
  };

  const toggle = () => {
    setRunning(r => !r);
    vibrate([50]);
  };
  const reset = () => {
    setRunning(false);
    setSecondsLeft(settings[mode] * 60);
    vibrate([30]);
  };
  const skip = () => {
    handleSessionEnd();
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  // Ring geometry
  const R = 120;
  const C = 2 * Math.PI * R;
  const Icon = meta.icon;

  return (
    <div className="space-y-6 pb-24 md:pb-0 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          Focus Mode <Brain className="h-5 w-5 text-primary" />
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Pomodoro timer to crush deep work sessions.</p>
      </motion.div>

      {/* Mode tabs */}
      <div className="flex gap-2 p-1 rounded-2xl glass-card">
        {(['focus', 'short', 'long'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all',
              mode === m ? `${MODE_META[m].gradient} text-primary-foreground ${MODE_META[m].glow}` : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {MODE_META[m].label}
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <Card className="glass-card border-0 p-8 flex flex-col items-center">
        <div className="relative w-[280px] h-[280px] flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" width="280" height="280" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r={R} stroke="hsl(var(--muted))" strokeWidth="10" fill="none" opacity="0.4" />
            <motion.circle
              cx="140" cy="140" r={R} fill="none"
              stroke="url(#focusGrad)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={C}
              animate={{ strokeDashoffset: C * (1 - progress) }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="focusGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--category-personal))" />
              </linearGradient>
            </defs>
          </svg>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <Icon className="h-7 w-7 text-primary mb-1" />
              <div className="text-6xl font-bold tabular-nums tracking-tight">
                {mm}:{ss}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{meta.label}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" size="lg" onClick={reset} className="rounded-full w-12 h-12 p-0">
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button
            size="lg"
            onClick={toggle}
            className={cn('rounded-full w-16 h-16 p-0 text-primary-foreground border-0', meta.gradient, meta.glow)}
          >
            {running ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-0.5" />}
          </Button>
          <Button variant="outline" size="lg" onClick={skip} className="rounded-full w-12 h-12 p-0">
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground mt-4">
          Round {completedFocus % settings.longEvery + (mode === 'focus' ? 1 : 0)} / {settings.longEvery}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Today" value={stats.todaySessions} suffix="sessions" />
        <StatCard label="Total" value={stats.totalSessions} suffix="sessions" />
        <StatCard label="Minutes" value={stats.totalMinutes} suffix="focused" />
      </div>
    </div>
  );
};

function StatCard({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <Card className="glass-card border-0 p-4 text-center card-hover-lift">
      <Trophy className="h-4 w-4 mx-auto text-primary mb-1" />
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-[10px] text-muted-foreground/70">{suffix}</div>
    </Card>
  );
}

export default Focus;
