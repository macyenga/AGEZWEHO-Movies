import { randomUUID } from 'node:crypto';

// Rwanda payment abstraction — RwandaPay only.
// RwandaPay Collections API - https://rwandapay.rw/docs
const RWANDA_PAY_BASE = process.env.RWANDA_PAY_BASE_URL || 'https://pay.rwandapay.rw/api/v1';
const RWANDA_PAY_PUBLIC_KEY = process.env.RWANDA_PAY_PUBLIC_KEY;
const RWANDA_PAY_SECRET_KEY = process.env.RWANDA_PAY_SECRET_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agezweho.com';

export function generateTxRef() {
  return `AGZ_${Date.now()}_${randomUUID()}`;
}

export function isRwandaPayConfigured() {
  return !!RWANDA_PAY_PUBLIC_KEY && !!RWANDA_PAY_SECRET_KEY;
}

// Create a RwandaPay payment request (hosted payment link).
// Returns a payment_url the customer is redirected to. Confirmation arrives via
// webhook (HMAC-signed) and/or status polling through getRwandaPayCollectionStatus.
export async function initiatePayment({ amount, tx_ref, phone, customer }) {
  if (!RWANDA_PAY_PUBLIC_KEY || !RWANDA_PAY_SECRET_KEY) {
    throw new Error('RwandaPay API keys not configured');
  }

  const resp = await fetch(`${RWANDA_PAY_BASE}/collections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Public-Key': RWANDA_PAY_PUBLIC_KEY,
      'X-Secret-Key': RWANDA_PAY_SECRET_KEY,
      'Idempotency-Key': tx_ref,
    },
    body: JSON.stringify({
      amount,
      currency: 'RWF',
      reference: tx_ref,
      customer: {
        name: customer?.name || 'Agezweho Movies Member',
        phone: toLocalPhone(phone),
        email: customer?.email || '',
      },
      description: 'Agezweho Movies support',
      redirect_url: `${SITE_URL}/payment/return/${encodeURIComponent(tx_ref)}`,
      webhook_url: `${SITE_URL}/api/payments/webhook`,
      metadata: { tx_ref },
    }),
  });

  const data = await resp.json().catch(() => ({}));

  if (resp.ok && data.success && data.data?.payment_url) {
    return {
      provider: 'rwandapay',
      tx_ref,
      success: true,
      payment_url: data.data.payment_url,
      reference: data.data.reference || tx_ref,
      message: data.message || 'Proceed on the RwandaPay page to complete your payment.',
    };
  }

  const message = data.error?.message || data.message || `RwandaPay request failed (HTTP ${resp.status})`;
  throw new Error(`RwandaPay: ${message}`);
}

// Poll RwandaPay for the real-time status of a previously created collection.
export async function getRwandaPayCollectionStatus(reference) {
  if (!reference || !RWANDA_PAY_PUBLIC_KEY || !RWANDA_PAY_SECRET_KEY) return null;

  const resp = await fetch(`${RWANDA_PAY_BASE}/collections/${encodeURIComponent(reference)}/status`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Public-Key': RWANDA_PAY_PUBLIC_KEY,
      'X-Secret-Key': RWANDA_PAY_SECRET_KEY,
    },
  });
  const data = await resp.json().catch(() => ({}));

  if (!resp.ok || !data.success) return null;
  return data.data || null;
}

// True when a RwandaPay collection status payload reflects a completed payment.
export function isRwandaPayPaid(status) {
  if (!status) return false;
  return (
    status.is_paid === true ||
    status.collection_status === 'completed' ||
    status.paypack_status === 'successful' ||
    status.status === 'successful'
  );
}

// Normalize a phone number for use in the RwandaPay customer object.
function toLocalPhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('250')) digits = `0${digits.slice(3)}`;
  if (!digits.startsWith('0')) return digits;
  return digits;
}