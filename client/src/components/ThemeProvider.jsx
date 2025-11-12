import React from 'react';
import useThemeStore from '../store/useThemeStore';

const ThemeProvider = ({ children }) => {
  const theme = useThemeStore((state) => state.theme);

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return children;
};

export default ThemeProvider;
