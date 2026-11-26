export const THEME_STORAGE_KEY = 'agasobanuye_theme';
export const DEFAULT_THEME = 'dark';
export const SUPPORTED_THEMES = ['dark', 'light'];

export function normalizeTheme(value) {
  if (typeof value !== 'string') return DEFAULT_THEME;
  const cleaned = value.trim().toLowerCase();
  if (cleaned === 'light' || cleaned === 'day' || cleaned === 'daylight') {
    return 'light';
  }
  if (cleaned === 'dark' || cleaned === 'night') {
    return 'dark';
  }
  return DEFAULT_THEME;
}

export function getNextTheme(currentTheme) {
  return normalizeTheme(currentTheme) === 'dark' ? 'light' : 'dark';
}

export function getThemeMeta(theme) {
  const normalized = normalizeTheme(theme);
  if (normalized === 'light') {
    return {
      id: 'light',
      label: 'Light',
      longLabel: 'High-Contrast Light',
      nextLabel: 'Switch to High-Contrast Dark Mode',
      description: 'Matte daylight ledger contrast for bright warehouses',
      themeColor: '#eef1f6',
    };
  }
  return {
    id: 'dark',
    label: 'Dark',
    longLabel: 'High-Contrast Dark',
    nextLabel: 'Switch to High-Contrast Light Mode',
    description: 'Low-glare obsidian slate contrast for prolonged viewing',
    themeColor: '#07090f',
  };
}
