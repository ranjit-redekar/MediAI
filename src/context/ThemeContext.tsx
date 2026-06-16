import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface ThemeDef {
  id: string;
  name: string;
  isDark: boolean;
  /** [background, primary, accent] used for the picker swatch */
  swatch: [string, string, string];
}

export const THEMES: ThemeDef[] = [
  { id: 'dark',     name: 'Indigo',   isDark: true,  swatch: ['#070b16', '#6366f1', '#8b5cf6'] },
  { id: 'midnight', name: 'Midnight', isDark: true,  swatch: ['#03040a', '#3b82f6', '#6366f1'] },
  { id: 'emerald',  name: 'Emerald',  isDark: true,  swatch: ['#04130f', '#10b981', '#14b8a6'] },
  { id: 'royal',    name: 'Royal',    isDark: true,  swatch: ['#0c0718', '#a855f7', '#ec4899'] },
  { id: 'sunset',   name: 'Sunset',   isDark: true,  swatch: ['#140a06', '#f97316', '#f43f5e'] },
  { id: 'light',    name: 'Light',    isDark: false, swatch: ['#e7ebf3', '#6366f1', '#8b5cf6'] },
];

const THEME_IDS = THEMES.map(t => t.id);
const STORAGE_KEY = 'mediai-theme';

interface ThemeContextValue {
  theme: string;
  themes: ThemeDef[];
  isDark: boolean;
  setTheme: (id: string) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(id: string) {
  if (typeof document === 'undefined') return;
  const def = THEMES.find(t => t.id === id) ?? THEMES[0];
  document.documentElement.setAttribute('data-theme', def.id);
  document.body.setAttribute('data-theme', def.id);
  document.body.classList.toggle('is-light', !def.isDark);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<string>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && THEME_IDS.includes(saved) ? saved : 'dark';
  });

  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  const setTheme = (id: string) => {
    if (THEME_IDS.includes(id)) setThemeState(id);
  };

  const isDark = THEMES.find(t => t.id === theme)?.isDark ?? true;

  // Quick toggle: jump between the current dark theme and Light.
  const toggleTheme = () => setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, themes: THEMES, isDark, setTheme, toggleTheme }),
    [theme, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
