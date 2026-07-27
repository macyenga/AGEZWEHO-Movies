import { randomUUID } from 'crypto';

// Rwanda payment abstraction.
// PAYMENT_PROVIDER: 'mtn-momo' | 'rwandapay' | 'local'
const PROVIDER = process.env.PAYMENT_PROVIDER || 'local';

const RWANDAPAY_API_KEY = process.env.RWANDAPAY_API_KEY;
const RWANDAPAY_SECRET = process.env.RWANDAPAY_SECRET;
const RWANDA_PAY_BASE = process.env.RWANDAPAY_BASE_URL || 'https://api.rwandapay.rw/v1';

const MTN_MOMO_SUBSCRIPTION_KEY = process.env.MTN_MOMO_SUBSCRIPTION_KEY || process.env.MTN_MOMO_API_KEY;
const MTN_MOMO_API_USER = process.env.MTN_MOMO_API_USER || process.env.MTN_MOMO_API_KEY;
const MTN_MOMO_API_KEY = process.env.MTN_MOMO_API_KEY || process.env.MTN_MOMO_API_SECRET;
const MTN_MOMO_TARGET_ENV = process.env.MTN_MOMO_TARGET_ENV || 'production';
const MTN_MOMO_BASE = process.env.MTN_MOMO_BASE_URL || 'https://momoapi.mtn.co.rw';

const MOMO_NUMBER = process.env.MOMO_NUMBER || '0789690247';
const USSD_CODE = process.env.USSD_CODE || '*182*8*1*156833#';

export function generateTxRef() {
  return `AGZ_${Date.now()}_${randomUUID()}`;
}

export async function initiatePayment({ amount, tx_ref, phone }) {
  switch (PROVIDER) {
    case 'mtn-momo':
      return initiateMtnMoMo({ amount, tx_ref, phone });
    case 'rwandapay':
      return initiateRwandaPay({ amount, tx_ref, phone });
    default:
      return initiateLocal({ amount, tx_ref });
  }
}

async function initiateRwandaPay({ amount, tx_ref, phone }) {
  if (!RWANDAPAY_API_KEY) throw new Error('RwandaPay API key not configured');

  try {
    const resp = await fetch(`${RWANDA_PAY_BASE}/payments/momo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': RWANDAPAY_API_KEY,
        'X-API-Secret': RWANDAPAY_SECRET || '',
      },
      body: JSON.stringify({
        amount,
        currency: 'RWF',
        tx_ref,
        phone: phone || null,
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://agezweho.com'}/api/payments/webhook`,
        description: 'Agezweho Movies Support',
      }),
    });

    const data = await resp.json().catch(() => ({}));
    if (resp.ok && data.status === 'success') {
      return {
        provider: 'rwandapay',
        tx_ref,
        success: true,
        reference: data.reference || data.transaction_id,
        message: data.message || 'Check your phone for the MoMo prompt',
      };
    }

    throw new Error(data.message || 'RwandaPay payment initiation failed');
  } catch (err) {
    if (err.message.includes('not configured')) throw err;
    return initiateLocal({ amount, tx_ref });
  }
}

async function initiateMtnMoMo({ amount, tx_ref, phone }) {
  if (!MTN_MOMO_SUBSCRIPTION_KEY || !MTN_MOMO_API_USER || !MTN_MOMO_API_KEY) {
    throw new Error('MTN MoMo API credentials not configured');
  }

  try {
    const tokenResp = await fetch(`${MTN_MOMO_BASE}/collection/token/`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': MTN_MOMO_SUBSCRIPTION_KEY,
        Authorization: `Basic ${Buffer.from(`${MTN_MOMO_API_USER}:${MTN_MOMO_API_KEY}`).toString('base64')}`,
      },
    });

    const tokenData = await tokenResp.json().catch(() => ({}));
    if (!tokenResp.ok || !tokenData.access_token) {
      throw new Error('MTN MoMo token request failed');
    }

    const resp = await fetch(`${MTN_MOMO_BASE}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        'X-Reference-Id': tx_ref,
        'X-Target-Environment': MTN_MOMO_TARGET_ENV,
        'Ocp-Apim-Subscription-Key': MTN_MOMO_SUBSCRIPTION_KEY,
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: String(amount),
        currency: 'RWF',
        externalId: tx_ref,
        payer: { partyIdType: 'MSISDN', partyId: normalizeRwandaPhone(phone) || normalizeRwandaPhone(MOMO_NUMBER) },
        payerMessage: 'Agezweho Movies Support',
        payeeNote: tx_ref,
      }),
    });

    if (resp.ok || resp.status === 202) {
      return {
        provider: 'mtn-momo',
        tx_ref,
        success: true,
        message: 'Payment request sent to your phone. Enter your PIN to confirm.',
      };
    }

    throw new Error('MTN MoMo request failed');
  } catch (err) {
    if (err.message.includes('not configured')) throw err;
    return initiateLocal({ amount, tx_ref });
  }
}

function normalizeRwandaPhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('250')) return digits;
  if (digits.startsWith('0')) return `250${digits.slice(1)}`;
  return digits;
}

async function initiateLocal({ amount, tx_ref }) {
  return {
    provider: 'local',
    tx_ref,
    success: true,
    test_mode: true,
    message: 'Send payment via MTN Mobile Money',
    payment_instructions: {
      momo_number: MOMO_NUMBER,
      ussd_code: USSD_CODE,
      amount,
      note: 'Send the exact amount. Access or vote power is applied after payment confirmation.',
    },
  };
}
