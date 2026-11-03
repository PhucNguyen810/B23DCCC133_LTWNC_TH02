import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from './ThemeContexts';
import type { Theme } from './ThemeContexts';

function getInitialTheme(): Theme {
  const storedTheme = localStorage.getItem('workout-theme');
  return storedTheme === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const toggleTheme = () => setTheme((currentTheme) => currentTheme === 'light' ? 'dark' : 'light');
  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('workout-theme', theme);
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
