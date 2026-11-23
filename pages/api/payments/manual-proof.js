import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { generateTxRef } from '../../../lib/server/payments';
import {
  MOMO_MERCHANT_CONFIG,
  validateManualProofInput,
  buildWhatsAppManualProofUrl,
} from '../../../lib/momo-manual';

const RATE_LIMIT_MAP = new Map();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 12;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(ip);
  if (!entry || now - entry.resetAt > RATE_LIMIT_WINDOW) {
    RATE_LIMIT_MAP.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '3mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many submissions. Please wait a minute before trying again.' });
  }

  const {
    amount,
    manual_tx_id,
    screenshot_data,
    phone,
    payer_name,
    donor_email,
    purpose,
    request_id,
    movie_id,
    game_id,
    subscription_plan,
    months,
  } = req.body || {};

  let userId = null;
  let userEmail = null;
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(token);
    if (user) {
      userId = user.id;
      userEmail = user.email || null;
    }
  }

  if (subscription_plan === 'pro' && !userId) {
    return res.status(401).json({ error: 'Please sign in first to submit a Pro subscription payment.' });
  }

  const minAmount =
    subscription_plan === 'pro'
      ? 2000
      : request_id
      ? 50
      : 100;

  const validation = validateManualProofInput({
    amount,
    minAmount,
    manualTxId: manual_tx_id || '',
    screenshotData: screenshot_data || '',
    phone: phone || '',
    payerName: payer_name || '',
    email: donor_email || '',
  });

  if (!validation.valid) {
    const firstError = Object.values(validation.errors)[0] || 'Invalid payment proof details.';
    return res.status(400).json({ error: firstError, errors: validation.errors });
  }

  const { normalized } = validation;
  const tx_ref = `MOMO_${generateTxRef()}`;
  const effectivePurpose =
    purpose ||
    (subscription_plan === 'pro'
      ? 'Pro Membership (1 Month)'
      : game_id
      ? 'Game Unlock'
      : request_id
      ? 'Request Vote Boost'
      : 'Support Agasobanuye.rw');

  const { error: txError } = await supabaseAdmin.from('transactions').insert([
    {
      request_id: request_id || null,
      game_id: game_id || null,
      movie_id: movie_id || null,
      user_id: userId,
      amount: normalized.amount,
      tx_ref,
      phone: normalized.phone || null,
      donor_email: normalized.email || userEmail || null,
      payer_name: normalized.payerName || null,
      payment_method: 'momo_manual',
      merchant_code: MOMO_MERCHANT_CONFIG.merchantCode,
      manual_tx_id: normalized.manualTxId || null,
      provider_reference: normalized.manualTxId || `MOMO_${MOMO_MERCHANT_CONFIG.merchantCode}`,
      screenshot_data: normalized.screenshotData || null,
      purpose: effectivePurpose,
      status: 'pending',
    },
  ]);

  if (txError) {
    console.error('Failed to store manual MoMo proof:', txError.message);
    return res.status(500).json({ error: 'Could not save your payment proof. Please try again.' });
  }

  if (subscription_plan === 'pro' && userId) {
    const subMonths = Math.max(1, Math.min(12, Number(months) || 1));
    await supabaseAdmin.from('subscriptions').insert([
      {
        user_id: userId,
        months: subMonths,
        amount: normalized.amount,
        phone: normalized.phone || null,
        tx_ref,
        payment_method: 'momo_manual',
        manual_tx_id: normalized.manualTxId || null,
        status: 'pending',
      },
    ]);
  }

  const whatsapp_url = buildWhatsAppManualProofUrl({
    amount: normalized.amount,
    manualTxId: normalized.manualTxId,
    txRef: tx_ref,
    phone: normalized.phone,
    payerName: normalized.payerName,
    purpose: effectivePurpose,
  });

  return res.status(200).json({
    success: true,
    tx_ref,
    status: 'pending',
    payment_method: 'momo_manual',
    merchant_code: MOMO_MERCHANT_CONFIG.merchantCode,
    merchant_name: MOMO_MERCHANT_CONFIG.merchantName,
    manual_tx_id: normalized.manualTxId || null,
    amount: normalized.amount,
    whatsapp_url,
  });
}
