// Paypack Rwanda Payment Service — https://payments.paypack.rw
// Official Paypack API client for MTN MoMo & Airtel Money direct push payments

const PAYPACK_BASE_URL = (process.env.PAYPACK_BASE_URL || 'https://payments.paypack.rw/api').replace(/\/$/, '');
const DEFAULT_CLIENT_ID = 'af3500e2-de84-11f1-9eea-00163ea80869';
const DEFAULT_CLIENT_SECRET = '4fd86e366a2922386554e7cc1b5aaffdda39a3ee5e6b4b0d3255bfef95601890afd80709';

export const PAYPACK_MERCHANT_NAME =
  process.env.NEXT_PUBLIC_PAYPACK_MERCHANT_NAME || 'Agasobanuye';

let cachedToken = null;
let tokenExpiresAt = 0;

export function getPaypackClientId() {
  return process.env.PAYPACK_CLIENT_ID || DEFAULT_CLIENT_ID;
}

export function getPaypackClientSecret() {
  return process.env.PAYPACK_CLIENT_SECRET || DEFAULT_CLIENT_SECRET;
}

export function isPaypackConfigured() {
  return Boolean(getPaypackClientId() && getPaypackClientSecret());
}

/**
 * Normalizes Rwandan phone numbers to 10-digit format (07XXXXXXXX)
 * Examples:
 *  - "+250788392120" -> "0788392120"
 *  - "250788392120"  -> "0788392120"
 *  - "788392120"     -> "0788392120"
 *  - "0788392120"    -> "0788392120"
 */
export function toPaypackPhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('250')) digits = `0${digits.slice(3)}`;
  if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('8'))) {
    digits = `0${digits}`;
  }
  return digits;
}

export function isValidRwandaPhone(phone) {
  const normalized = toPaypackPhone(phone);
  // Valid Rwandan mobile prefixes: 078, 079 (MTN), 072, 073 (Airtel)
  return /^07[2389]\d{7}$/.test(normalized);
}

/**
 * Obtains or reuses an active JWT access token from Paypack
 * POST https://payments.paypack.rw/api/auth/agents/authorize
 */
export async function getPaypackAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && tokenExpiresAt > now + 60) {
    return cachedToken;
  }

  const clientId = getPaypackClientId();
  const clientSecret = getPaypackClientSecret();

  if (!clientId || !clientSecret) {
    throw new Error('Paypack credentials not configured (PAYPACK_CLIENT_ID / PAYPACK_CLIENT_SECRET)');
  }

  const res = await fetch(`${PAYPACK_BASE_URL}/auth/agents/authorize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.access) {
    const msg = data.message || `Paypack authentication failed (HTTP ${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  cachedToken = data.access;
  tokenExpiresAt = typeof data.expires === 'number' ? data.expires : now + 3600;
  return cachedToken;
}

/**
 * Triggers a Mobile Money push notification on customer's phone
 * POST https://payments.paypack.rw/api/transactions/cashin
 */
export async function initiatePaypackCashin({ amount, phone, tx_ref }) {
  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount < 100) {
    throw new Error('Minimum payment amount is 100 RWF');
  }

  const normalizedPhone = toPaypackPhone(phone);
  if (!isValidRwandaPhone(normalizedPhone)) {
    throw new Error('Please enter a valid Rwandan MTN or Airtel number (e.g. 0788392120 or 0738392120)');
  }

  const token = await getPaypackAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  if (tx_ref) {
    headers['Idempotency-Key'] = String(tx_ref).slice(0, 32);
  }

  const body = {
    amount: Math.round(numAmount),
    number: normalizedPhone,
  };

  const res = await fetch(`${PAYPACK_BASE_URL}/transactions/cashin`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.message || `Paypack transaction initiation failed (HTTP ${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    err.isTestingModeRestriction =
      String(msg).toLowerCase().includes('testing mode') ||
      String(msg).toLowerCase().includes('approved numbers');
    throw err;
  }

  return {
    provider: 'paypack',
    method: 'cashin',
    tx_ref: tx_ref || null,
    reference: data.ref || null,
    amount: data.amount || numAmount,
    phone: data.client || normalizedPhone,
    status: data.status || 'pending',
    kind: data.kind || 'CASHIN',
    created_at: data.created_at || new Date().toISOString(),
    merchant_name: PAYPACK_MERCHANT_NAME,
    message: `Prompt sent to ${normalizedPhone}! Check your phone to enter your PIN to complete payment to ${PAYPACK_MERCHANT_NAME}.`,
  };
}

/**
 * Looks up a Paypack transaction by ref ID
 * GET https://payments.paypack.rw/api/transactions/find/{ref}
 */
export async function getPaypackTransactionStatus(reference) {
  if (!reference) return null;

  try {
    const token = await getPaypackAccessToken();
    const res = await fetch(`${PAYPACK_BASE_URL}/transactions/find/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data) {
      const status = data.status || null;
      return {
        status,
        paid: status === 'successful',
        amount: data.amount,
        client: data.client,
        kind: data.kind,
        created_at: data.created_at,
        raw: data,
      };
    }

    // Fallback: events search
    const eventRes = await fetch(`${PAYPACK_BASE_URL}/events/transactions?ref=${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const eventData = await eventRes.json().catch(() => ({}));
    const item = Array.isArray(eventData?.transactions)
      ? eventData.transactions[0]
      : Array.isArray(eventData)
      ? eventData[0]
      : null;

    if (item) {
      const status = item.data?.status || item.status || null;
      return {
        status,
        paid: status === 'successful',
        amount: item.data?.amount || item.amount,
        client: item.data?.client || item.client,
        raw: item,
      };
    }

    return null;
  } catch (err) {
    console.error('Paypack status check error:', err.message);
    return null;
  }
}
