import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListTodo, CalendarDays, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: ListTodo, label: 'All Tasks' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar View' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col border-r border-border bg-sidebar h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}>
        <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
          {!collapsed && (
            <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">
              📋 Daily Reminder
            </h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.to
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border flex justify-around py-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              location.pathname === item.to
                ? "text-sidebar-primary"
                : "text-sidebar-foreground/60"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
