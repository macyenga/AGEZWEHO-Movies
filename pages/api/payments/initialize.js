import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { generateTxRef, initiatePayment } from '../../../lib/server/payments';

const RATE_LIMIT_MAP = new Map();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 5;

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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Too many requests. Please wait before trying again.' });

  const amount = Number(req.body?.amount);
  const { request_id, game_id, movie_id, phone } = req.body || {};
  if (!Number.isInteger(amount) || amount < 100) return res.status(400).json({ error: 'Minimum amount is 100 RWF' });

  let userId = req.body?.user_id || null;
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (user) userId = user.id;
  }

  const tx_ref = generateTxRef();

  const { error: txError } = await supabaseAdmin.from('transactions').insert([{
    request_id: request_id || null,
    game_id: game_id || null,
    movie_id: movie_id || null,
    user_id: userId,
    amount,
    tx_ref,
    phone: phone || null,
    status: 'pending',
  }]);

  if (txError) return res.status(500).json({ error: txError.message });

  let payment;
  try {
    payment = await initiatePayment({ amount, tx_ref, phone });
  } catch (e) {
    console.error('RwandaPay initiate failed:', e.message, e.data || '');
    // clean up the pending row so it doesn't linger forever
    await supabaseAdmin.from('transactions').delete().eq('tx_ref', tx_ref);
    const msg = e.message || 'Payment provider error';
    const status = e.status === 422 || e.status === 400 ? 400 : 502;
    return res.status(status).json({ error: msg });
  }

  if (payment.provider === 'rwandapay' && payment.reference) {
    await supabaseAdmin
      .from('transactions')
      .update({ provider_reference: String(payment.reference) })
      .eq('tx_ref', tx_ref);
  }

  if (!payment.payment_url) {
    return res.status(502).json({ error: 'Payment provider did not return a payment link' });
  }

  return res.status(200).json({
    tx_ref,
    success: true,
    provider: payment.provider || 'rwandapay',
    payment_url: payment.payment_url,
    message: payment.message || 'Payment started',
  });
}
