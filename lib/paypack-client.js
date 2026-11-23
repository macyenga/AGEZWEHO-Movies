// Client & server-safe pure helpers for Paypack Rwanda payments and WhatsApp confirmation

export const PAYPACK_CLIENT_CONFIG = {
  merchantCode: (process.env.NEXT_PUBLIC_MOMO_MERCHANT_CODE || '156833').replace(/\D/g, '') || '156833',
  merchantName: process.env.NEXT_PUBLIC_PAYPACK_MERCHANT_NAME || 'Agasobanuye',
  momoPhone: (process.env.NEXT_PUBLIC_MOMO_PHONE || '0789690247').replace(/\D/g, ''),
  whatsappLink: (process.env.NEXT_PUBLIC_WHATSAPP_LINK || '').trim(),
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '250789690247').replace(/\D/g, ''),
};

export const MOMO_VIRTUAL_CARD_CONFIG = {
  ussdCode: '*182*2*6#',
  network: 'Mastercard',
};

export function formatRwf(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) return '0 RWF';
  return `${Math.round(num).toLocaleString()} RWF`;
}

export function normalizeRwandaPhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('250')) digits = `0${digits.slice(3)}`;
  if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('8'))) {
    digits = `0${digits}`;
  }
  return digits;
}

export function isValidRwandaPhone(phone) {
  const normalized = normalizeRwandaPhone(phone);
  return /^07[2389]\d{7}$/.test(normalized);
}

/**
 * Resolves the configured WhatsApp base link from .env (`NEXT_PUBLIC_WHATSAPP_LINK`
 * or `NEXT_PUBLIC_WHATSAPP_NUMBER`) and appends pre-filled confirmation details
 * including the merchant name ('Agasobanuye'), amount, phone, and reference.
 */
export function buildWhatsAppConfirmationUrl({
  whatsappLink = PAYPACK_CLIENT_CONFIG.whatsappLink,
  whatsappNumber = PAYPACK_CLIENT_CONFIG.whatsappNumber,
  merchantName = PAYPACK_CLIENT_CONFIG.merchantName || 'Agasobanuye',
  amount = '',
  phone = '',
  email = '',
  txRef = '',
  paypackRef = '',
  purpose = 'Support Agasobanuye.rw',
  customMessage = '',
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
    customMessage || `Muraho! Confirming Paypack payment to merchant: ${merchantName}`,
    `Merchant: ${merchantName}`,
    `Purpose: ${purpose}`,
  ];

  const numericAmount = Number(amount);
  if (Number.isFinite(numericAmount) && numericAmount > 0) {
    lines.push(`Amount: ${Math.round(numericAmount).toLocaleString()} RWF`);
  }
  if (phone) {
    lines.push(`Phone: ${phone}`);
  }
  if (email) {
    lines.push(`Account Email: ${email}`);
  }
  if (paypackRef) {
    lines.push(`Paypack Ref: ${paypackRef}`);
  }
  if (txRef) {
    lines.push(`Transaction Ref: ${txRef}`);
  }

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

export function resolveMinimumPaymentAmount({
  subscriptionPlan = null,
  requestId = null,
  subscriptionPrice = 2000,
  fallbackMin = 100,
} = {}) {
  if (subscriptionPlan === 'pro') {
    const subMin = Number(subscriptionPrice);
    return Number.isFinite(subMin) && subMin >= 100 ? Math.round(subMin) : 2000;
  }
  if (requestId) return 50;
  const fallback = Number(fallbackMin);
  return Number.isFinite(fallback) && fallback > 0 ? Math.round(fallback) : 100;
}

export function resolvePaymentPurpose({
  purpose = '',
  subscriptionPlan = null,
  gameId = null,
  requestId = null,
} = {}) {
  const custom = typeof purpose === 'string' ? purpose.trim() : '';
  if (custom) return custom;
  if (subscriptionPlan === 'pro') return 'Pro Membership (1 Month)';
  if (gameId) return 'Game Unlock';
  if (requestId) return 'Request Vote Boost';
  return 'Support Agasobanuye.rw';
}
