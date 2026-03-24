import { Search, Sun, Moon, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/hooks/useTheme';
import { useTasks } from '@/contexts/TaskContext';
import { Category, FilterStatus, CATEGORY_CONFIG } from '@/types/task';
import { useI18n } from '@/contexts/I18nContext';

interface TopBarProps {
  onAddTask: () => void;
}

export function TopBar({ onAddTask }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { searchQuery, setSearchQuery, filterCategory, setFilterCategory, filterStatus, setFilterStatus } = useTasks();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 glass border-b border-border px-4 md:px-6 py-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('task.search')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl border-border/60 bg-muted/50 focus:bg-card transition-colors"
          />
        </div>

        <Select value={filterCategory} onValueChange={v => setFilterCategory(v as Category | 'all')}>
          <SelectTrigger className="w-[130px] rounded-xl">
            <SelectValue placeholder={t('task.category')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('cat.all')}</SelectItem>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.emoji} {t(`cat.${key}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={v => setFilterStatus(v as FilterStatus)}>
          <SelectTrigger className="w-[120px] rounded-xl">
            <SelectValue placeholder={t('status.all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('status.all')}</SelectItem>
            <SelectItem value="active">{t('status.active')}</SelectItem>
            <SelectItem value="completed">{t('status.completed')}</SelectItem>
            <SelectItem value="overdue">{t('status.overdue')}</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="shrink-0 rounded-xl hover:bg-accent">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-category-work" />}
          </Button>
          <Button onClick={onAddTask} size="sm" className="gap-1.5 gradient-primary text-primary-foreground rounded-xl glow-primary border-0 hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('task.addNew')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
