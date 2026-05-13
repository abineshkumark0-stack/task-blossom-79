import { useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const ACCENT_COLORS = [
  { id: 'violet',  label: 'Violet',  primary: '250 84% 64%', accent: '250 40% 18%' },
  { id: 'cyan',    label: 'Cyan',    primary: '190 90% 55%', accent: '190 50% 18%' },
  { id: 'emerald', label: 'Emerald', primary: '160 84% 48%', accent: '160 50% 16%' },
  { id: 'rose',    label: 'Rose',    primary: '340 82% 60%', accent: '340 50% 18%' },
  { id: 'amber',   label: 'Amber',   primary: '38 95% 58%',  accent: '38 50% 18%' },
  { id: 'sky',     label: 'Sky',     primary: '210 90% 60%', accent: '210 50% 18%' },
] as const;

export type AccentId = typeof ACCENT_COLORS[number]['id'];

export function useAccentColor() {
  const [accent, setAccent] = useLocalStorage<AccentId>('reminder-accent', 'violet');

  useEffect(() => {
    const cfg = ACCENT_COLORS.find(a => a.id === accent) || ACCENT_COLORS[0];
    const root = document.documentElement;
    root.style.setProperty('--primary', cfg.primary);
    root.style.setProperty('--ring', cfg.primary);
    root.style.setProperty('--sidebar-primary', cfg.primary);
    root.style.setProperty('--sidebar-ring', cfg.primary);
    root.style.setProperty('--accent', cfg.accent);
  }, [accent]);

  return { accent, setAccent };
}
