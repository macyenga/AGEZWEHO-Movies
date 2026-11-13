import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { generateTxRef } from '../../../lib/server/payments';
import {
  initiatePaypackCashin,
  toPaypackPhone,
  isValidRwandaPhone,
  PAYPACK_MERCHANT_NAME,
} from '../../../lib/server/paypack';
import { buildWhatsAppConfirmationUrl } from '../../../lib/paypack-client';

const RATE_LIMIT_MAP = new Map();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 8;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(ip);
  if (!entry || now - entry.resetAt > RATE_LIMIT_WINDOW) {
    RATE_LIMIT_MAP.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait before trying again.' });
  }

  const { amount, phone, email, purpose, request_id, movie_id, game_id } = req.body || {};
  const numAmount = Number(amount);

  if (!Number.isInteger(numAmount) || numAmount < 100) {
    return res.status(400).json({ error: 'Minimum amount is 100 RWF' });
  }

  const normalizedPhone = toPaypackPhone(phone);
  if (!isValidRwandaPhone(normalizedPhone)) {
    return res.status(400).json({
      error: 'Please enter a valid Rwandan MTN or Airtel number (e.g. 0788392120 or 0738392120)',
    });
  }

  let userId = req.body?.user_id || null;
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(token);
    if (user) userId = user.id;
  }

  const tx_ref = generateTxRef();

  // Insert initial pending transaction
  const { error: txError } = await supabaseAdmin.from('transactions').insert([
    {
      request_id: request_id || null,
      game_id: game_id || null,
      movie_id: movie_id || null,
      user_id: userId,
      amount: numAmount,
      tx_ref,
      phone: normalizedPhone,
      status: 'pending',
    },
  ]);

  if (txError) {
    console.error('Failed to create transaction record:', txError.message);
    return res.status(500).json({ error: 'Failed to record transaction' });
  }

  const effectivePurpose = purpose || 'Support Agasobanuye.rw';

  try {
    const paypackResult = await initiatePaypackCashin({
      amount: numAmount,
      phone: normalizedPhone,
      tx_ref,
    });

    if (paypackResult.reference) {
      await supabaseAdmin
        .from('transactions')
        .update({ provider_reference: String(paypackResult.reference) })
        .eq('tx_ref', tx_ref);
    }

    const whatsappUrl = buildWhatsAppConfirmationUrl({
      amount: numAmount,
      phone: normalizedPhone,
      email: email || '',
      txRef: tx_ref,
      paypackRef: paypackResult.reference || '',
      merchantName: PAYPACK_MERCHANT_NAME,
      purpose: effectivePurpose,
    });

    return res.status(200).json({
      success: true,
      mode: 'prompt',
      provider: 'paypack',
      tx_ref,
      reference: paypackResult.reference,
      amount: numAmount,
      phone: normalizedPhone,
      merchant_name: PAYPACK_MERCHANT_NAME,
      whatsapp_url: whatsappUrl,
      message: `Prompt sent to ${normalizedPhone}! Enter your PIN to approve payment to merchant "${PAYPACK_MERCHANT_NAME}".`,
    });
  } catch (err) {
    console.error('Paypack cashin error:', err.message);

    if (err.isTestingModeRestriction) {
      await supabaseAdmin
        .from('transactions')
        .update({ provider_reference: `TEST_${tx_ref}` })
        .eq('tx_ref', tx_ref);

      const whatsappUrl = buildWhatsAppConfirmationUrl({
        amount: numAmount,
        phone: normalizedPhone,
        email: email || '',
        txRef: tx_ref,
        merchantName: PAYPACK_MERCHANT_NAME,
        purpose: effectivePurpose,
      });

      return res.status(200).json({
        success: true,
        mode: 'manual_fallback',
        testing_mode: true,
        provider: 'paypack',
        tx_ref,
        amount: numAmount,
        phone: normalizedPhone,
        merchant_name: PAYPACK_MERCHANT_NAME,
        whatsapp_url: whatsappUrl,
        message: `Paypack is in sandbox/testing mode for unapproved test numbers. Use the WhatsApp confirmation button below to complete your support for "${PAYPACK_MERCHANT_NAME}".`,
      });
    }

    await supabaseAdmin.from('transactions').delete().eq('tx_ref', tx_ref);
    return res.status(400).json({
      error: err.message || 'Payment initiation failed via Paypack',
    });
  }
}
