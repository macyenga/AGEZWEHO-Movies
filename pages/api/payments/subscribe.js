import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { generateTxRef, initiatePayment } from '../../../lib/server/payments';

const SUBSCRIPTION_PRICE = process.env.SUBSCRIPTION_PRICE ? parseInt(process.env.SUBSCRIPTION_PRICE) : 2000;
const MOMO_NUMBER = process.env.MOMO_NUMBER || '0789690247';
const USSD_CODE = process.env.USSD_CODE || '*182*8*1*156833#';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  const amount = SUBSCRIPTION_PRICE;
  const tx_ref = generateTxRef();

  const { error: txError } = await supabaseAdmin.from('transactions').insert([{
    user_id: user.id,
    amount,
    tx_ref,
    phone: req.body?.phone || null,
    status: 'pending',
  }]);

  if (txError) return res.status(500).json({ error: txError.message });

  const { error: subError } = await supabaseAdmin.from('subscriptions').insert([{
    user_id: user.id,
    plan_type: 'pro',
    status: 'pending',
    tx_ref,
    phone: req.body?.phone || null,
    payment_method: req.body?.phone ? 'mtn-momo' : null,
    amount,
    months: 1,
  }]);

  if (subError) return res.status(500).json({ error: subError.message });

  const payment = await initiatePayment({ amount, tx_ref, phone: req.body?.phone });

  return res.status(200).json({
    tx_ref,
    phone: req.body?.phone || null,
    success: true,
    provider: payment.provider || 'local',
    message: payment.message || 'Payment started',
    payment_instructions: payment.payment_instructions || {
      momo_number: MOMO_NUMBER,
      ussd_code: USSD_CODE,
      amount,
      note: `Send ${amount} RWF to ${MOMO_NUMBER} via MTN MoMo for Pro subscription. Admin will approve after verification.`,
    },
  });
}
