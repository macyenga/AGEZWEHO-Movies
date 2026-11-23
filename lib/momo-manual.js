import {
  PAYPACK_CLIENT_CONFIG,
  formatRwf,
  normalizeRwandaPhone,
  isValidRwandaPhone,
} from './paypack-client.js';

export const MOMO_MERCHANT_CONFIG = {
  merchantCode: (process.env.NEXT_PUBLIC_MOMO_MERCHANT_CODE || '156833').replace(/\D/g, '') || '156833',
  merchantName: PAYPACK_CLIENT_CONFIG.merchantName || 'Agasobanuye',
  supportPhone: normalizeRwandaPhone(process.env.NEXT_PUBLIC_MOMO_PHONE || '0789690247') || '0789690247',
  whatsappLink: PAYPACK_CLIENT_CONFIG.whatsappLink || '',
  whatsappNumber: PAYPACK_CLIENT_CONFIG.whatsappNumber || '250789690247',
};

export const MAX_SCREENSHOT_DATA_URL_LENGTH = 2_200_000;

export function formatRwandaPhoneDisplay(phone = MOMO_MERCHANT_CONFIG.supportPhone) {
  const normalized = normalizeRwandaPhone(phone);
  if (normalized.length === 10) {
    return `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7)}`;
  }
  return normalized || String(phone || '');
}

export function buildMomoUssdCode({
  merchantCode = MOMO_MERCHANT_CONFIG.merchantCode,
  amount = null,
} = {}) {
  const cleanCode = String(merchantCode || '156833').replace(/\D/g, '') || '156833';
  const numericAmount = Number(amount);
  if (Number.isFinite(numericAmount) && Math.round(numericAmount) >= 50) {
    return `*182*8*1*${cleanCode}*${Math.round(numericAmount)}#`;
  }
  return `*182*8*1*${cleanCode}#`;
}

export function buildMomoTelUri({
  merchantCode = MOMO_MERCHANT_CONFIG.merchantCode,
  amount = null,
} = {}) {
  const ussd = buildMomoUssdCode({ merchantCode, amount });
  return `tel:${ussd.replace('#', '%23')}`;
}

export function buildMomoQrPayload({
  merchantCode = MOMO_MERCHANT_CONFIG.merchantCode,
  amount = null,
} = {}) {
  const ussd = buildMomoUssdCode({ merchantCode, amount });
  return `tel:${ussd}`;
}

export function isValidImageDataUrl(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_SCREENSHOT_DATA_URL_LENGTH) return false;
  return /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed);
}

export function isValidManualTxId(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length < 4 || trimmed.length > 80) return false;
  return /^[A-Za-z0-9._\-\/\s]+$/.test(trimmed);
}

export function validateManualProofInput({
  amount,
  minAmount = 100,
  manualTxId = '',
  screenshotData = '',
  phone = '',
  payerName = '',
  email = '',
} = {}) {
  const errors = {};
  const numericAmount = Math.round(Number(amount));
  const minRequired = Number.isFinite(Number(minAmount)) && Number(minAmount) > 0 ? Math.round(Number(minAmount)) : 100;

  if (!Number.isFinite(numericAmount) || numericAmount < minRequired) {
    errors.amount = `Minimum amount is ${formatRwf(minRequired)}.`;
  }

  const trimmedTxId = typeof manualTxId === 'string' ? manualTxId.trim() : '';
  const trimmedScreenshot = typeof screenshotData === 'string' ? screenshotData.trim() : '';

  const hasTxId = trimmedTxId.length > 0;
  const hasScreenshot = trimmedScreenshot.length > 0;

  if (!hasTxId && !hasScreenshot) {
    errors.proof = 'Please enter your MoMo Transaction ID or upload a payment screenshot.';
  } else {
    if (hasTxId && !isValidManualTxId(trimmedTxId)) {
      errors.manualTxId = 'Transaction ID must be 4-80 valid characters (letters, numbers, dots, dashes).';
    }
    if (hasScreenshot && !isValidImageDataUrl(trimmedScreenshot)) {
      errors.screenshotData = 'Screenshot must be a PNG, JPG, WEBP, or GIF image under 1.5 MB.';
    }
  }

  const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';
  const normalizedPhone = trimmedPhone ? normalizeRwandaPhone(trimmedPhone) : '';
  if (trimmedPhone && !isValidRwandaPhone(trimmedPhone)) {
    errors.phone = 'Enter a valid Rwandan MTN/Airtel number (e.g. 0789690247) or leave blank.';
  }

  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address or leave blank.';
  }

  const cleanedPayerName = typeof payerName === 'string' ? payerName.trim().slice(0, 80) : '';

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalized: {
      amount: Number.isFinite(numericAmount) ? numericAmount : 0,
      manualTxId: trimmedTxId,
      screenshotData: trimmedScreenshot,
      phone: normalizedPhone,
      payerName: cleanedPayerName,
      email: trimmedEmail,
    },
  };
}

export function buildWhatsAppManualProofUrl({
  whatsappLink = MOMO_MERCHANT_CONFIG.whatsappLink,
  whatsappNumber = MOMO_MERCHANT_CONFIG.whatsappNumber,
  merchantCode = MOMO_MERCHANT_CONFIG.merchantCode,
  merchantName = MOMO_MERCHANT_CONFIG.merchantName,
  amount = 0,
  manualTxId = '',
  txRef = '',
  phone = '',
  payerName = '',
  purpose = 'Support Agasobanuye.rw',
} = {}) {
  const rawNumber = String(whatsappNumber || '250789690247').replace(/\D/g, '');
  const cleanNumber = rawNumber.startsWith('250')
    ? rawNumber
    : rawNumber.startsWith('0')
    ? `250${rawNumber.slice(1)}`
    : `250${rawNumber}`;

  const baseUrl =
    whatsappLink && /^https?:\/\//i.test(whatsappLink.trim())
      ? whatsappLink.trim()
      : `https://wa.me/${cleanNumber}`;

  const lines = [
    `Muraho! Confirming manual MTN MoMo Pay transfer:`,
    `Merchant ID: ${merchantCode} (${merchantName})`,
    `Purpose: ${purpose}`,
  ];

  const numericAmount = Number(amount);
  if (Number.isFinite(numericAmount) && numericAmount > 0) {
    lines.push(`Amount: ${formatRwf(numericAmount)}`);
  }
  if (manualTxId) lines.push(`MoMo TX ID: ${manualTxId}`);
  if (txRef) lines.push(`Site Ref: ${txRef}`);
  if (phone) lines.push(`Sender Phone: ${phone}`);
  if (payerName) lines.push(`Name: ${payerName}`);

  const message = lines.join('\n');

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('text', message);
    return url.toString();
  } catch {
    const sep = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${sep}text=${encodeURIComponent(message)}`;
  }
}
