import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListTodo, CalendarDays, Settings, ChevronLeft, ChevronRight, Sparkles, BarChart3, Target, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useTasks } from '@/contexts/TaskContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: ListTodo, label: 'All Tasks' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/timetable', icon: Clock, label: 'Timetable' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { streak } = useTasks();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}>
        <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="gradient-primary p-1.5 rounded-lg">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">Productivity</h1>
            </div>
          )}
          {collapsed && (
            <div className="gradient-primary p-1.5 rounded-lg mx-auto">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn("p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors", collapsed ? "mx-auto mt-2" : "ml-auto")}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Streak badge */}
        {!collapsed && streak.current > 0 && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-xl streak-badge text-sm font-bold flex items-center gap-2">
            🔥 {streak.current} Day Streak
            {streak.current >= 7 && <span className="text-xs opacity-80">🏆</span>}
            {streak.current >= 30 && <span className="text-xs opacity-80">⭐</span>}
            {streak.current >= 100 && <span className="text-xs opacity-80">💎</span>}
          </div>
        )}

        <nav className="flex-1 p-2 space-y-1 mt-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "gradient-primary text-primary-foreground glow-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border flex justify-around py-2">
        {navItems.slice(0, 5).map(item => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium transition-all duration-200",
                isActive ? "text-primary-foreground" : "text-sidebar-foreground/60"
              )}
            >
              <div className={cn("p-1.5 rounded-lg transition-all", isActive ? "gradient-primary glow-primary" : "")}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
