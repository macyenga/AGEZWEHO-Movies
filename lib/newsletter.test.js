import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeNewsletterEmail,
  isValidNewsletterEmail,
  sanitizeNewsletterSource,
  validateNewsletterPayload,
} from './newsletter.js';

test('normalizeNewsletterEmail trims and lowercases strings safely', () => {
  assert.equal(normalizeNewsletterEmail('  User.Name@Example.COM '), 'user.name@example.com');
  assert.equal(normalizeNewsletterEmail(null), '');
  assert.equal(normalizeNewsletterEmail(12345), '');
});

test('isValidNewsletterEmail accepts standard emails and rejects malformed values', () => {
  assert.equal(isValidNewsletterEmail('kigali.viewer@agasobanuye.rw'), true);
  assert.equal(isValidNewsletterEmail('fan+2026@gmail.com'), true);

  assert.equal(isValidNewsletterEmail(''), false);
  assert.equal(isValidNewsletterEmail('not-an-email'), false);
  assert.equal(isValidNewsletterEmail('user@localhost'), false);
  assert.equal(isValidNewsletterEmail('bad space@example.com'), false);
  assert.equal(isValidNewsletterEmail('user@example.c'), false);
  assert.equal(isValidNewsletterEmail(`${'a'.repeat(250)}@example.com`), false);
});

test('sanitizeNewsletterSource cleans untrusted source tags', () => {
  assert.equal(sanitizeNewsletterSource('homepage'), 'homepage');
  assert.equal(sanitizeNewsletterSource('  Footer_Banner!@# '), 'footer_banner');
  assert.equal(sanitizeNewsletterSource(''), 'homepage');
});

test('validateNewsletterPayload returns normalized payload or descriptive error', () => {
  const missing = validateNewsletterPayload({ email: '   ' });
  assert.equal(missing.ok, false);
  assert.equal(missing.code, 'EMAIL_REQUIRED');

  const invalid = validateNewsletterPayload({ email: '<script>@bad' });
  assert.equal(invalid.ok, false);
  assert.equal(invalid.code, 'EMAIL_INVALID');

  const valid = validateNewsletterPayload({
    email: '  Viewer@Agasobanuye.RW ',
    source: 'Homepage-Hero',
    language: 'rw',
  });
  assert.deepEqual(valid, {
    ok: true,
    email: 'viewer@agasobanuye.rw',
    source: 'homepage-hero',
    language: 'rw',
  });
});
