import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  normalizeTheme,
  getNextTheme,
  getThemeMeta,
} from './theme.js';

test('normalizeTheme defaults cleanly to dark and accepts light aliases', () => {
  assert.equal(DEFAULT_THEME, 'dark');
  assert.equal(THEME_STORAGE_KEY, 'agasobanuye_theme');
  assert.equal(normalizeTheme(undefined), 'dark');
  assert.equal(normalizeTheme('unknown'), 'dark');
  assert.equal(normalizeTheme('DARK'), 'dark');
  assert.equal(normalizeTheme('light'), 'light');
  assert.equal(normalizeTheme('  Daylight '), 'light');
});

test('getNextTheme toggles between dark and light deterministically', () => {
  assert.equal(getNextTheme('dark'), 'light');
  assert.equal(getNextTheme('light'), 'dark');
  assert.equal(getNextTheme(null), 'light');
});

test('getThemeMeta returns high-contrast metadata for both modes', () => {
  const darkMeta = getThemeMeta('dark');
  const lightMeta = getThemeMeta('light');

  assert.equal(darkMeta.id, 'dark');
  assert.equal(darkMeta.label, 'Dark');
  assert.match(darkMeta.nextLabel, /Light/i);

  assert.equal(lightMeta.id, 'light');
  assert.equal(lightMeta.label, 'Light');
  assert.match(lightMeta.nextLabel, /Dark/i);
});
