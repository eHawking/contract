import React from 'react';
import { Moon, Sun } from 'lucide-react';
import useThemeStore from '../store/useThemeStore';

function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-800 transition-colors"
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {theme === 'dark' ? (
        <Sun size={18} className="text-gray-100" />
      ) : (
        <Moon size={18} className="text-gray-800" />
      )}
    </button>
  );
}

export default ThemeToggle;
