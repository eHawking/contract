import React from 'react';
import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../store/useThemeStore';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${theme}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <Sun size={16} className="theme-toggle-icon sun" />
      <Moon size={16} className="theme-toggle-icon moon" />
    </button>
  );
};

export default ThemeToggle;
