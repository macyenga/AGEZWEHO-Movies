import test from 'node:test';
import assert from 'node:assert/strict';
import { toPaypackPhone, isValidRwandaPhone, isPaypackConfigured, PAYPACK_MERCHANT_NAME } from './server/paypack.js';
import { buildWhatsAppConfirmationUrl, formatRwf, normalizeRwandaPhone } from './paypack-client.js';

test('toPaypackPhone and normalizeRwandaPhone normalize various Rwandan phone formats', () => {
  for (const fn of [toPaypackPhone, normalizeRwandaPhone]) {
    assert.equal(fn('+250788392120'), '0788392120');
    assert.equal(fn('250788392120'), '0788392120');
    assert.equal(fn('788392120'), '0788392120');
    assert.equal(fn('0788392120'), '0788392120');
    assert.equal(fn('0738392120'), '0738392120');
    assert.equal(fn('0791234567'), '0791234567');
    assert.equal(fn('0721234567'), '0721234567');
    assert.equal(fn(' 078 839 2120 '), '0788392120');
  }
});

test('isValidRwandaPhone validates authentic Rwandan network prefixes', () => {
  assert.equal(isValidRwandaPhone('0788392120'), true);
  assert.equal(isValidRwandaPhone('0791234567'), true);
  assert.equal(isValidRwandaPhone('0738392120'), true);
  assert.equal(isValidRwandaPhone('0721234567'), true);
  assert.equal(isValidRwandaPhone('+250788392120'), true);

  assert.equal(isValidRwandaPhone('0718392120'), false);
  assert.equal(isValidRwandaPhone('0778392120'), false);
  assert.equal(isValidRwandaPhone('12345'), false);
  assert.equal(isValidRwandaPhone(''), false);
});

test('Paypack is properly configured with merchant name Agasobanuye', () => {
  assert.equal(isPaypackConfigured(), true);
  assert.equal(PAYPACK_MERCHANT_NAME, 'Agasobanuye');
});

test('buildWhatsAppConfirmationUrl uses .env whatsappLink and includes merchant Agasobanuye', () => {
  const url = buildWhatsAppConfirmationUrl({
    whatsappLink: 'https://wa.me/250788392120',
    merchantName: 'Agasobanuye',
    amount: 1500,
    phone: '0788392120',
    paypackRef: 'paypack_ref_12345',
    txRef: 'AGZ_999',
    purpose: 'Support Agasobanuye.rw',
  });

  assert.ok(url.startsWith('https://wa.me/250788392120?text='));
  const parsed = new URL(url);
  const text = parsed.searchParams.get('text') || '';
  assert.ok(text.includes('Agasobanuye'));
  assert.ok(text.includes('1,500 RWF') || text.includes('1500'));
  assert.ok(text.includes('0788392120'));
  assert.ok(text.includes('paypack_ref_12345'));
  assert.ok(text.includes('AGZ_999'));
});

test('buildWhatsAppConfirmationUrl preserves existing query params when custom whatsappLink is supplied', () => {
  const url = buildWhatsAppConfirmationUrl({
    whatsappLink: 'https://api.whatsapp.com/send?phone=250788392120',
    merchantName: 'Agasobanuye',
    amount: 2000,
  });

  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get('phone'), '250788392120');
  assert.ok((parsed.searchParams.get('text') || '').includes('Merchant: Agasobanuye'));
});

test('formatRwf formats amounts cleanly', () => {
  assert.equal(formatRwf(1000), '1,000 RWF');
  assert.equal(formatRwf(0), '0 RWF');
});
