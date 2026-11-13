import { randomUUID } from 'node:crypto';

// RwandaPay — https://rwandapay.rw/docs
// Supports both Hosted Checkout (POST /checkout/initialize) and Collections API (POST /collections)
// for Pay with MTN MoMo or Airtel Money via RwandaPay
const RWANDA_PAY_BASE = (process.env.RWANDA_PAY_BASE_URL || 'https://pay.rwandapay.rw/api/v1').replace(/\/$/, '');
const RWANDA_PAY_PUBLIC_KEY = process.env.RWANDA_PAY_PUBLIC_KEY;
const RWANDA_PAY_SECRET_KEY = process.env.RWANDA_PAY_SECRET_KEY;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://agasobanuye.rw').replace(/\/$/, '');

export function generateTxRef() {
  return `AGZ_${Date.now()}_${randomUUID().slice(0, 8)}`;
}

export function isRwandaPayConfigured() {
  return !!RWANDA_PAY_PUBLIC_KEY && !!RWANDA_PAY_SECRET_KEY;
}

function isTestMode() {
  return String(RWANDA_PAY_PUBLIC_KEY || '').startsWith('pk_test_');
}

// Normalize to 07XXXXXXXX (10 digits) as required by RwandaPay docs.
function toLocalPhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('250')) digits = `0${digits.slice(3)}`;
  // 9-digit local without leading 0 (e.g. 788123456) -> 0788123456
  if (digits.length === 9 && digits.startsWith('7')) digits = `0${digits}`;
  // already 07... keep as is
  if (digits.length === 10 && digits.startsWith('07')) return digits;
  if (digits.length === 10 && digits.startsWith('0')) return digits;
  // fallback: return as-is digits (let gateway validate)
  return digits;
}

function buildCustomer(phone, customer) {
  const normalizedPhone = toLocalPhone(phone);
  // RwandaPay requires customer.phone 07XXXXXXXX. For donate/support flows phone is optional
  // in UI — the hosted RwandaPay page collects the real payer phone. Provide a valid
  // placeholder so gateway validation passes instead of 422 customer.phone required.
  const isValidRwPhone = /^07\d{8}$/.test(normalizedPhone);
  return {
    name: customer?.name || 'Agasobanuye.rw Member',
    phone: isValidRwPhone ? normalizedPhone : '0788000000',
    email: customer?.email || 'no-reply@agasobanuye.rw',
  };
}

function pickMessage(data, fallback) {
  return data?.error?.message || data?.message || data?.error || fallback;
}

// ── Hosted Checkout: POST /checkout/initialize ──
// Docs: https://rwandapay.rw/docs#initialize-checkout
// Required: amount, tx_ref, customer.name, customer.phone, customer.email
export async function initiateCheckout({ amount, tx_ref, phone, customer }) {
  if (!RWANDA_PAY_PUBLIC_KEY || !RWANDA_PAY_SECRET_KEY) {
    throw new Error('RwandaPay API keys not configured');
  }

  const payload = {
    amount,
    currency: 'RWF',
    tx_ref,
    customer: buildCustomer(phone, customer),
    description: 'Agasobanuye.rw support',
    redirect_url: `${SITE_URL}/payment/return/${encodeURIComponent(tx_ref)}`,
    webhook_url: `${SITE_URL}/api/payments/webhook`,
    meta: { tx_ref },
  };

  // Only include phone in meta if provided raw stays traceable; remove empty email fallback is required by docs
  // so keep email.

  const resp = await fetch(`${RWANDA_PAY_BASE}/checkout/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Public-Key': RWANDA_PAY_PUBLIC_KEY,
      'X-Secret-Key': RWANDA_PAY_SECRET_KEY,
      'Idempotency-Key': tx_ref,
    },
    body: JSON.stringify(payload),
  });

  const data = await resp.json().catch(() => ({}));

  if (resp.status === 201 && data.success && data.data?.payment_url) {
    return {
      provider: 'rwandapay',
      method: 'checkout',
      tx_ref,
      success: true,
      payment_url: data.data.payment_url,
      reference: data.data.reference || tx_ref,
      session_id: data.data.session_id || null,
      expires_at: data.data.expires_at || null,
      message: data.message || 'Proceed on the RwandaPay page — Pay with MTN MoMo or Airtel Money.',
    };
  }

  const msg = pickMessage(data, `RwandaPay checkout failed (HTTP ${resp.status})`);
  const err = new Error(`RwandaPay: ${msg}`);
  err.status = resp.status;
  err.data = data;
  throw err;
}

// ── Collections API: POST /collections ──
// Docs: https://rwandapay.rw/docs#create-collection
export async function createCollection({ amount, tx_ref, phone, customer }) {
  if (!RWANDA_PAY_PUBLIC_KEY || !RWANDA_PAY_SECRET_KEY) {
    throw new Error('RwandaPay API keys not configured');
  }

  const payload = {
    amount,
    currency: 'RWF',
    reference: tx_ref,
    customer: buildCustomer(phone, customer),
    description: 'Agasobanuye.rw support',
    redirect_url: `${SITE_URL}/payment/return/${encodeURIComponent(tx_ref)}`,
    webhook_url: `${SITE_URL}/api/payments/webhook`,
    metadata: { tx_ref },
  };

  const resp = await fetch(`${RWANDA_PAY_BASE}/collections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Public-Key': RWANDA_PAY_PUBLIC_KEY,
      'X-Secret-Key': RWANDA_PAY_SECRET_KEY,
      'Idempotency-Key': tx_ref,
    },
    body: JSON.stringify(payload),
  });

  const data = await resp.json().catch(() => ({}));

  if (resp.status === 201 && data.success && data.data?.payment_url) {
    return {
      provider: 'rwandapay',
      method: 'collection',
      tx_ref,
      success: true,
      payment_url: data.data.payment_url,
      reference: data.data.reference || tx_ref,
      fee: data.data.fee ?? null,
      net_amount: data.data.net_amount ?? null,
      expires_at: data.data.expires_at || null,
      message: data.message || 'Proceed on the RwandaPay page — Pay with MTN MoMo or Airtel Money.',
    };
  }

  if (resp.ok && data.success && data.data?.payment_url) {
    // tolerate 200 as well
    return {
      provider: 'rwandapay',
      method: 'collection',
      tx_ref,
      success: true,
      payment_url: data.data.payment_url,
      reference: data.data.reference || tx_ref,
      message: data.message || 'Proceed on the RwandaPay page — Pay with MTN MoMo or Airtel Money.',
    };
  }

  const msg = pickMessage(data, `RwandaPay request failed (HTTP ${resp.status})`);
  const err = new Error(`RwandaPay: ${msg}`);
  err.status = resp.status;
  err.data = data;
  throw err;
}

// Unified entry — uses Paypack (https://payments.paypack.rw) when selected or RwandaPay is not configured.
export async function initiatePayment({ amount, tx_ref, phone, customer }) {
  const providerPref = String(process.env.PAYMENT_PROVIDER || '').toLowerCase();
  if (providerPref === 'paypack' || !isRwandaPayConfigured()) {
    const { initiatePaypackCashin, isPaypackConfigured } = await import('./paypack.js');
    if (isPaypackConfigured()) {
      const result = await initiatePaypackCashin({ amount, phone, tx_ref });
      return {
        provider: 'paypack',
        method: 'cashin',
        tx_ref,
        success: true,
        reference: result.reference,
        merchant_name: result.merchant_name,
        payment_url: `${SITE_URL}/payment/return/${encodeURIComponent(tx_ref)}?provider=paypack&reference=${encodeURIComponent(result.reference || '')}`,
        message: result.message,
      };
    }
    throw new Error('Paypack credentials are not configured');
  }

  // Prefer checkout (newer, supports network selection on hosted page).
  // If checkout is not available for the merchant scope, fall back to collections.
  try {
    return await initiateCheckout({ amount, tx_ref, phone, customer });
  } catch (e) {
    const status = e.status || 0;
    const code = e.data?.error?.code || '';
    // Fall back for scope/auth issues or missing endpoint; otherwise propagate validation errors
    const shouldFallback =
      status === 404 ||
      status === 403 ||
      code === 'MERCHANT_INACTIVE' ||
      String(e.message || '').includes('checkout');
    // Always attempt collections as fallback for resilience, unless it's a clear validation error (400/422) on checkout payload itself
    if (status === 400 || status === 422) {
      // validation error likely applies to both -> try collections once anyway
    }
    try {
      return await createCollection({ amount, tx_ref, phone, customer });
    } catch (colErr) {
      // If checkout failed due to fallback case, surface collection error; else surface original
      if (shouldFallback || status === 400 || status === 422) throw colErr;
      throw e;
    }
  }
}

// ── Polling helpers ──

// GET /collections/{reference}/status — local DB read, safe to poll (docs)
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

// GET /collections/{reference} — full details
export async function getCollection(reference) {
  if (!reference || !RWANDA_PAY_PUBLIC_KEY || !RWANDA_PAY_SECRET_KEY) return null;
  const resp = await fetch(`${RWANDA_PAY_BASE}/collections/${encodeURIComponent(reference)}`, {
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

// GET /checkout/{reference}/verify — no auth, 30 req/min, local DB read
export async function verifyCheckoutPayment(reference) {
  if (!reference) return null;
  const resp = await fetch(`${RWANDA_PAY_BASE}/checkout/${encodeURIComponent(reference)}/verify`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await resp.json().catch(() => ({}));
  // docs returns { status: 'successful'|'pending'|'failed', completed, success } directly
  if (!resp.ok) return null;
  // Some gateway returns { success, status } or plain { status }
  if (data.status) return data;
  if (data.success !== undefined) return data;
  return null;
}

// Unified status check — tries checkout verify first, then collection status.
// provider_reference may be AGZ_* (checkout tx_ref) or COL-* (collection) or session id
export async function getRwandaPayStatus(provider_reference) {
  if (!provider_reference) return null;
  // Heuristic: AGZ_ / CHK- / test refs are checkout tx_refs
  if (String(provider_reference).startsWith('AGZ_') || String(provider_reference).startsWith('CHK-')) {
    const chk = await verifyCheckoutPayment(provider_reference);
    if (chk) return { kind: 'checkout', raw: chk };
    const col = await getRwandaPayCollectionStatus(provider_reference);
    if (col) return { kind: 'collection', raw: col };
    return null;
  }
  // COL-... collection refs
  const col = await getRwandaPayCollectionStatus(provider_reference);
  if (col) return { kind: 'collection', raw: col };
  const chk = await verifyCheckoutPayment(provider_reference);
  if (chk) return { kind: 'checkout', raw: chk };
  return null;
}

export function isRwandaPayPaid(status) {
  if (!status) return false;
  // checkout verify shape: { status: 'successful', completed: true, success: true }
  if (status.status === 'successful' || status.status === 'completed') return true;
  if (status.success === true && status.completed === true) return true;
  // collection status shape
  if (status.is_paid === true) return true;
  if (status.collection_status === 'completed') return true;
  if (status.paypack_status === 'successful') return true;
  // raw wrapped
  if (status.raw) return isRwandaPayPaid(status.raw);
  return false;
}

export function isCheckoutPaid(verifyData) {
  if (!verifyData) return false;
  return verifyData.status === 'successful' || (verifyData.success === true && verifyData.completed === true);
}

export { isTestMode };
