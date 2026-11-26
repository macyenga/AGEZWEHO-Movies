import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  getNextTheme,
  getThemeMeta,
  normalizeTheme,
} from '../lib/theme';

const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  isDark: true,
  isLight: false,
  themeMeta: getThemeMeta(DEFAULT_THEME),
  setTheme: () => {},
  toggleTheme: () => {},
});

function applyThemeToDocument(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(theme);
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', getThemeMeta(theme).themeColor);
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(DEFAULT_THEME);

  useEffect(() => {
    let initial = DEFAULT_THEME;
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        initial = normalizeTheme(stored);
      } else if (document.documentElement.getAttribute('data-theme')) {
        initial = normalizeTheme(document.documentElement.getAttribute('data-theme'));
      }
    } catch {
      // ignore storage errors
    }
    setThemeState(initial);
    applyThemeToDocument(initial);
  }, []);

  const setTheme = useCallback((nextValue) => {
    const normalized = normalizeTheme(nextValue);
    setThemeState(normalized);
    applyThemeToDocument(normalized);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, normalized);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = getNextTheme(prev);
      applyThemeToDocument(next);
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const themeMeta = getThemeMeta(theme);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        themeMeta,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
