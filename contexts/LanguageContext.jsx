import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  getOppositeLanguage,
  getTranslations,
  normalizeLanguage,
  translate,
} from '../lib/i18n';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate persisted language preference from localStorage on client mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved) {
        const normalized = normalizeLanguage(saved);
        setLanguageState(normalized);
        document.documentElement.lang = normalized;
      }
    } catch {
      // ignore storage errors in restricted environments
    } finally {
      setHydrated(true);
    }
  }, []);

  // Keep <html lang> and localStorage synchronized on language change
  useEffect(() => {
    if (!hydrated) return;
    try {
      document.documentElement.lang = language;
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore storage errors
    }
  }, [language, hydrated]);

  // Cross-tab synchronization
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LANGUAGE_STORAGE_KEY && e.newValue) {
        setLanguageState(normalizeLanguage(e.newValue));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setLanguage = useCallback((nextLang) => {
    setLanguageState(normalizeLanguage(nextLang));
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => getOppositeLanguage(prev));
  }, []);

  const t = useMemo(() => getTranslations(language), [language]);

  const tr = useCallback(
    (keyPath, vars) => translate(language, keyPath, vars),
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      isKinyarwanda: language === 'rw',
      setLanguage,
      toggleLanguage,
      t,
      tr,
    }),
    [language, setLanguage, toggleLanguage, t, tr]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (ctx) return ctx;

  return {
    language: DEFAULT_LANGUAGE,
    isKinyarwanda: false,
    setLanguage: () => {},
    toggleLanguage: () => {},
    t: getTranslations(DEFAULT_LANGUAGE),
    tr: (keyPath, vars) => translate(DEFAULT_LANGUAGE, keyPath, vars),
  };
}
