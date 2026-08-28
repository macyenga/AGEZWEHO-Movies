import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { generateTxRef, initiatePayment } from '../../../lib/server/payments';

const SUBSCRIPTION_PRICE = process.env.SUBSCRIPTION_PRICE ? parseInt(process.env.SUBSCRIPTION_PRICE) : 2000;

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
    payment_method: 'rwandapay',
    amount,
    months: 1,
  }]);

  if (subError) return res.status(500).json({ error: subError.message });

  const payment = await initiatePayment({ amount, tx_ref, phone: req.body?.phone });

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
    phone: req.body?.phone || null,
    success: true,
    provider: 'rwandapay',
    payment_url: payment.payment_url,
    message: payment.message || 'Payment started',
  });
}
