import { useLocalStorage } from './useLocalStorage';
import { useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('reminder-theme', 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return { theme, toggleTheme };
}
