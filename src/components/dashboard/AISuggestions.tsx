import { useMemo } from 'react';
import { useTasks } from '@/contexts/TaskContext';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Target, Flame, TrendingUp, Lightbulb, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const UNIQUE_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Unknown" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Don't watch the clock; do what it does — keep going.", author: "Sam Levenson" },
  { text: "Productivity is never an accident. It's the result of commitment to excellence.", author: "Paul J. Meyer" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "A river cuts through rock not because of its power, but because of its persistence.", author: "Jim Watkins" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
  { text: "Motivation gets you started. Habit keeps you going.", author: "Jim Rohn" },
  { text: "Consistency is what transforms average into excellence.", author: "Unknown" },
];

type Suggestion = {
  icon: typeof Sparkles;
  text: string;
  type: 'goal' | 'streak' | 'motivation' | 'insight' | 'quote';
  gradient: string;
};

export function AISuggestions() {
  const { tasks, stats, streak, goals, productivityScore, weeklyCompletionPct } = useTasks();

  const suggestions = useMemo((): Suggestion[] => {
    const items: Suggestion[] = [];
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === today);
    const todayCompleted = todayTasks.filter(t => t.completed).length;
    const todayTotal = todayTasks.length;

    // Goal-related suggestions
    if (goals.length > 0) {
      const now = new Date();
      const activeGoals = goals.filter(g => new Date(g.endDate) >= now);
      activeGoals.forEach(goal => {
        const pct = Math.round((goal.completedDays / goal.totalDays) * 100);
        if (pct === 0) {
          items.push({ icon: Target, text: `🎯 Your goal "${goal.title}" is set! Good to go — start today and build momentum!`, type: 'goal', gradient: 'gradient-health' });
        } else if (pct >= 80) {
          items.push({ icon: Target, text: `🏆 Almost there! "${goal.title}" is ${pct}% complete. Don't stop now — the finish line is in sight!`, type: 'goal', gradient: 'gradient-health' });
        } else if (pct >= 50) {
          items.push({ icon: Target, text: `💪 Halfway through "${goal.title}"! ${pct}% done. Keep the rhythm going!`, type: 'goal', gradient: 'gradient-study' });
        }
      });
    }

    // Streak suggestions
    if (streak.current === 0) {
      items.push({ icon: Flame, text: "🔥 Start a new streak today! Complete just one task to ignite your momentum.", type: 'streak', gradient: 'gradient-fitness' });
    } else if (streak.current >= 7 && streak.current < 30) {
      items.push({ icon: Flame, text: `🔥 ${streak.current}-day streak! You're on fire! Come back tomorrow to keep it alive!`, type: 'streak', gradient: 'gradient-fitness' });
    } else if (streak.current >= 30) {
      items.push({ icon: Flame, text: `🏅 Legendary ${streak.current}-day streak! You're building an unstoppable habit!`, type: 'streak', gradient: 'gradient-exam' });
    } else if (streak.current >= 3) {
      items.push({ icon: Flame, text: `🔥 ${streak.current} days strong! Add more tasks to break through the momentum barrier!`, type: 'streak', gradient: 'gradient-fitness' });
    }

    // Productivity insights
    if (todayTotal > 0 && todayCompleted === todayTotal) {
      items.push({ icon: TrendingUp, text: "🌟 All tasks done for today! You're a productivity champion. See you tomorrow!", type: 'motivation', gradient: 'gradient-health' });
    } else if (todayTotal > 5 && todayCompleted < 2) {
      items.push({ icon: Lightbulb, text: "📊 Heavy day ahead! Consider breaking big tasks into smaller steps for easier wins.", type: 'insight', gradient: 'gradient-work' });
    } else if (stats.overdue > 3) {
      items.push({ icon: Lightbulb, text: `⚡ ${stats.overdue} overdue tasks detected. Tackle the easiest one first to build momentum!`, type: 'insight', gradient: 'gradient-work' });
    }

    if (productivityScore >= 80) {
      items.push({ icon: TrendingUp, text: `🚀 Productivity score: ${productivityScore}/100 — you're performing at elite level!`, type: 'motivation', gradient: 'gradient-coding' });
    } else if (productivityScore < 40 && tasks.length > 0) {
      items.push({ icon: Lightbulb, text: "💡 Tip: Start with your hardest task when your energy is highest. Your future self will thank you!", type: 'insight', gradient: 'gradient-study' });
    }

    if (weeklyCompletionPct < 50 && tasks.length > 3) {
      items.push({ icon: Lightbulb, text: "📉 Weekly completion is below 50%. Try reducing your task load — quality over quantity!", type: 'insight', gradient: 'gradient-personal' });
    }

    // Daily quote (deterministic based on day)
    const dayIndex = Math.floor(Date.now() / 86400000) % UNIQUE_QUOTES.length;
    const quote = UNIQUE_QUOTES[dayIndex];
    items.push({ icon: Quote, text: `"${quote.text}" — ${quote.author}`, type: 'quote', gradient: 'gradient-primary' });

    // Ensure at least 2 items shown
    if (items.length < 2) {
      items.push({ icon: Sparkles, text: "✨ Every expert was once a beginner. Keep showing up, and the results will follow!", type: 'motivation', gradient: 'gradient-college' });
    }

    return items.slice(0, 4); // max 4 suggestions
  }, [tasks, stats, streak, goals, productivityScore, weeklyCompletionPct]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="space-y-3"
    >
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        AI Suggestions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {suggestions.map((s, i) => (
            <motion.div
              key={`${s.type}-${i}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
            >
              <Card className={cn("glass-card card-hover-lift border-0 overflow-hidden group cursor-default")}>
                <CardContent className="p-0">
                  <div className="flex items-start gap-3 p-4">
                    <div className={cn("p-2 rounded-xl text-primary-foreground shrink-0 transition-transform group-hover:scale-110", s.gradient)}>
                      <s.icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-relaxed">{s.text}</p>
                  </div>
                  <div className={cn("h-0.5 w-full opacity-40", s.gradient)} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
