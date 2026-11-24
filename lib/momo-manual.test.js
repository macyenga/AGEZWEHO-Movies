import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MOMO_MERCHANT_CONFIG,
  formatRwandaPhoneDisplay,
  buildMomoUssdCode,
  buildMomoTelUri,
  buildMomoQrPayload,
  isValidImageDataUrl,
  isValidManualTxId,
  validateManualProofInput,
  buildWhatsAppManualProofUrl,
} from './momo-manual.js';

const TINY_PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

test('MOMO_MERCHANT_CONFIG defaults to merchant ID 156833 and support phone 0789690247', () => {
  assert.equal(MOMO_MERCHANT_CONFIG.merchantCode, '156833');
  assert.equal(MOMO_MERCHANT_CONFIG.merchantName, 'Iradukunda Didier');
  assert.equal(MOMO_MERCHANT_CONFIG.supportPhone, '0789690247');
  assert.equal(formatRwandaPhoneDisplay('0789690247'), '0789 690 247');
});

test('buildMomoUssdCode and URIs embed merchant code 156833 and amount', () => {
  assert.equal(buildMomoUssdCode({ amount: 1000 }), '*182*8*1*156833*1000#');
  assert.equal(buildMomoUssdCode({ amount: null }), '*182*8*1*156833#');
  assert.equal(buildMomoUssdCode({ amount: 0 }), '*182*8*1*156833#');
  assert.equal(buildMomoTelUri({ amount: 2000 }), 'tel:*182*8*1*156833*2000%23');
  assert.equal(buildMomoQrPayload({ amount: 2000 }), 'tel:*182*8*1*156833*2000#');
});

test('validateManualProofInput rejects missing transaction ID and missing screenshot', () => {
  const result = validateManualProofInput({
    amount: 1000,
    manualTxId: '   ',
    screenshotData: '',
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.proof);
});

test('validateManualProofInput rejects invalid short tx ID and non-image data URL', () => {
  const shortTx = validateManualProofInput({
    amount: 1000,
    manualTxId: '12',
  });
  assert.equal(shortTx.valid, false);
  assert.ok(shortTx.errors.manualTxId);

  const svgAttempt = validateManualProofInput({
    amount: 1000,
    screenshotData: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
  });
  assert.equal(svgAttempt.valid, false);
  assert.ok(svgAttempt.errors.screenshotData);
  assert.equal(isValidImageDataUrl('data:text/html;base64,SGVsbG8='), false);
});

test('validateManualProofInput accepts valid MoMo TX ID or valid screenshot image', () => {
  const withTx = validateManualProofInput({
    amount: 2000,
    manualTxId: 'MP241118.1234.A56789',
    phone: '+250788392120',
    payerName: 'Jean Paul',
  });
  assert.equal(withTx.valid, true);
  assert.equal(withTx.normalized.amount, 2000);
  assert.equal(withTx.normalized.phone, '0788392120');
  assert.equal(withTx.normalized.manualTxId, 'MP241118.1234.A56789');

  const withShot = validateManualProofInput({
    amount: 500,
    screenshotData: TINY_PNG_DATA_URL,
  });
  assert.equal(withShot.valid, true);
  assert.equal(withShot.normalized.screenshotData, TINY_PNG_DATA_URL);
});

test('validateManualProofInput enforces minAmount and optional phone/email format', () => {
  const tooLow = validateManualProofInput({
    amount: 50,
    minAmount: 100,
    manualTxId: 'MP24111801',
  });
  assert.equal(tooLow.valid, false);
  assert.ok(tooLow.errors.amount);

  const voteBoostOk = validateManualProofInput({
    amount: 50,
    minAmount: 50,
    manualTxId: 'MP24111801',
  });
  assert.equal(voteBoostOk.valid, true);

  const badPhone = validateManualProofInput({
    amount: 1000,
    manualTxId: 'MP24111801',
    phone: '12345',
  });
  assert.equal(badPhone.valid, false);
  assert.ok(badPhone.errors.phone);
});

test('isValidManualTxId validates lengths and characters strictly', () => {
  assert.equal(isValidManualTxId('MP241118.1234.A56789'), true);
  assert.equal(isValidManualTxId('1234567890'), true);
  assert.equal(isValidManualTxId('abc'), false);
  assert.equal(isValidManualTxId('<script>alert(1)</script>'), false);
});

test('buildWhatsAppManualProofUrl encodes merchant 156833 and TX ID', () => {
  const url = buildWhatsAppManualProofUrl({
    amount: 2000,
    manualTxId: 'MP241118.1234.A56789',
    txRef: 'MOMO_12345',
    purpose: 'Pro Membership',
  });
  assert.ok(url.startsWith('https://wa.me/'));
  const decoded = decodeURIComponent(url);
  assert.ok(decoded.includes('156833'));
  assert.ok(decoded.includes('MP241118.1234.A56789'));
  assert.ok(decoded.includes('MOMO_12345'));
});
