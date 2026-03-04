import { useTasks } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useMemo } from 'react';
import { format, subDays, parseISO, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import { CATEGORY_CONFIG } from '@/types/task';

const Analytics = () => {
  const { tasks, completionHistory } = useTasks();

  // Weekly data (last 7 days)
  const weeklyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(now, 6 - i);
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(t => t.date === dateStr);
      const completed = dayTasks.filter(t => t.completed).length;
      const total = dayTasks.length;
      return {
        day: format(day, 'EEE'),
        completed,
        total,
        missed: Math.max(0, total - completed),
      };
    });
  }, [tasks]);

  // Category distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: CATEGORY_CONFIG[name as keyof typeof CATEGORY_CONFIG]?.label || name,
      value,
      category: name,
    }));
  }, [tasks]);

  const categoryColors: Record<string, string> = {
    study: '#3B82F6', work: '#F97316', personal: '#A855F7', health: '#22C55E',
    fitness: '#EC4899', college: '#06B6D4', exam: '#EAB308', coding: '#10B981',
  };

  // Calendar heatmap (last 30 days)
  const heatmapData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const day = subDays(now, 29 - i);
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(t => t.date === dateStr);
      const completed = dayTasks.filter(t => t.completed).length;
      const total = dayTasks.length;
      return { date: dateStr, day: format(day, 'd'), completed, total, pct: total > 0 ? completed / total : -1 };
    });
  }, [tasks]);

  // Monthly trend
  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 4 }, (_, i) => {
      const weekStart = subDays(now, (3 - i) * 7 + 6);
      const weekEnd = subDays(now, (3 - i) * 7);
      const label = `Week ${i + 1}`;
      const weekTasks = tasks.filter(t => {
        const d = parseISO(t.date);
        return d >= weekStart && d <= weekEnd;
      });
      const completed = weekTasks.filter(t => t.completed).length;
      return { week: label, completed, total: weekTasks.length };
    });
  }, [tasks]);

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold tracking-tight flex items-center gap-2"
      >
        📊 Analytics & Reports
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-base">Weekly Task Completion</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="completed" fill="hsl(160, 84%, 39%)" radius={[6, 6, 0, 0]} name="Completed" />
                  <Bar dataKey="missed" fill="hsl(0, 84%, 60%)" radius={[6, 6, 0, 0]} name="Missed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-base">Category Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={categoryColors[entry.category] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-base">Monthly Completion Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" stroke="hsl(250, 84%, 54%)" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="total" stroke="hsl(215, 16%, 47%)" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Calendar Heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-base">30-Day Heatmap</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-1.5">
                {heatmapData.map((d, i) => (
                  <div
                    key={i}
                    title={`${d.date}: ${d.completed}/${d.total} completed`}
                    className="aspect-square rounded-md flex items-center justify-center text-[10px] font-bold transition-colors"
                    style={{
                      backgroundColor: d.pct === -1 ? 'hsl(var(--muted))' :
                        d.pct >= 0.8 ? 'hsl(160, 84%, 39%)' :
                        d.pct >= 0.5 ? 'hsl(160, 84%, 60%)' :
                        d.pct >= 0.1 ? 'hsl(45, 93%, 47%)' :
                        'hsl(0, 84%, 60%)',
                      color: d.pct === -1 ? 'hsl(var(--muted-foreground))' : 'white',
                    }}
                  >
                    {d.day}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(160, 84%, 39%)' }} /> 80%+</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(160, 84%, 60%)' }} /> 50%+</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(45, 93%, 47%)' }} /> Some</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(0, 84%, 60%)' }} /> Missed</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-muted" /> No tasks</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
