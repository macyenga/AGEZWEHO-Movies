import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { generateTxRef, initiatePayment } from '../../../lib/server/payments';

const MOMO_NUMBER = process.env.MOMO_NUMBER || '0789690247';
const USSD_CODE = process.env.USSD_CODE || '*182*8*1*156833#';

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
  if (!Number.isInteger(amount) || amount < 50) return res.status(400).json({ error: 'Minimum amount is 50 RWF' });

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

  const payment = await initiatePayment({ amount, tx_ref, phone });

  return res.status(200).json({
    tx_ref,
    success: true,
    provider: payment.provider || 'local',
    message: payment.message || 'Payment started',
    payment_instructions: payment.payment_instructions || {
      momo_number: MOMO_NUMBER,
      ussd_code: USSD_CODE,
      amount,
      note: `Send ${amount} RWF to ${MOMO_NUMBER} via MTN MoMo. Admin will confirm your vote after verifying payment.`,
    },
  });
}
