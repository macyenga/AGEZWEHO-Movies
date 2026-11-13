import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  normalizeLanguage,
  getOppositeLanguage,
  getTranslations,
  translate,
  getCategoryLabel,
  getMediaTypeLabel,
  getComingSoonCountdownLabel,
  formatViewCountLocalized,
} from './i18n.js';

function collectLeafKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectLeafKeys(v, path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
}

test('normalizeLanguage resolves English, Kinyarwanda, regional tags, and invalid fallbacks', () => {
  assert.equal(DEFAULT_LANGUAGE, 'en');
  assert.deepEqual(SUPPORTED_LANGUAGES, ['en', 'rw']);
  assert.equal(normalizeLanguage('rw'), 'rw');
  assert.equal(normalizeLanguage('rw-RW'), 'rw');
  assert.equal(normalizeLanguage('Kinyarwanda'), 'rw');
  assert.equal(normalizeLanguage('en-US'), 'en');
  assert.equal(normalizeLanguage('fr'), 'en');
  assert.equal(normalizeLanguage(null), 'en');
});

test('getOppositeLanguage toggles cleanly between en and rw', () => {
  assert.equal(getOppositeLanguage('en'), 'rw');
  assert.equal(getOppositeLanguage('rw'), 'en');
  assert.equal(getOppositeLanguage('rw-RW'), 'en');
});

test('TRANSLATIONS maintains identical key parity between English and Kinyarwanda', () => {
  const enKeys = collectLeafKeys(TRANSLATIONS.en);
  const rwKeys = collectLeafKeys(TRANSLATIONS.rw);
  assert.deepEqual(rwKeys, enKeys);
  assert.ok(enKeys.length > 80);
});

test('translate resolves nested keys and interpolates template variables', () => {
  assert.equal(translate('en', 'nav.requests'), 'Requests');
  assert.equal(translate('rw', 'nav.requests'), 'Saba Filime');
  assert.equal(translate('rw', 'trending.subtitle', { count: 5 }), '5 zirebwa cyane');
  assert.equal(translate('en', 'donateModal.proceedWith', { amount: '1,000 RWF' }), 'Proceed with 1,000 RWF');
  assert.equal(translate('rw', 'donateModal.proceedWith', { amount: '1,000 RWF' }), 'Komeza na 1,000 RWF');
  assert.equal(getTranslations('rw').footer.browseHeading, 'Shakisha');
});

test('getCategoryLabel, getMediaTypeLabel, countdowns, and view counts localize accurately', () => {
  assert.equal(getCategoryLabel('Action', 'en'), 'Action');
  assert.equal(getCategoryLabel('Action', 'rw'), 'Ibikorwa');
  assert.equal(getCategoryLabel('Comedy', 'rw'), 'Urwenya');
  assert.equal(getMediaTypeLabel('Series', 'rw'), 'Seri');
  assert.equal(getMediaTypeLabel('All', 'rw'), 'Byose');
  assert.equal(getComingSoonCountdownLabel(0, 'rw'), 'Isoka Uyu Munsi');
  assert.equal(getComingSoonCountdownLabel(1, 'rw'), 'Ejo');
  assert.equal(getComingSoonCountdownLabel(12, 'rw'), 'Mu minsi 12');
  assert.equal(formatViewCountLocalized(15200, 'en'), '15.2K views');
  assert.equal(formatViewCountLocalized(15200, 'rw'), 'Zarebwe 15.2K');
});
