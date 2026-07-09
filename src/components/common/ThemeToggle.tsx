'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTheme } from '@/store/slices/themeSlice';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const isDark = mode === 'dark';

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200/80 dark:border-violet-700/50 bg-white/80 dark:bg-violet-950/40 text-violet-700 dark:text-violet-200 hover:bg-violet-50 dark:hover:bg-violet-900/50 transition-colors ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-500" />}
      {showLabel && (
        <span className="text-sm font-medium">{isDark ? 'Light' : 'Dark'}</span>
      )}
    </button>
  );
}
