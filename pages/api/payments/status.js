import { supabaseAdmin } from '../../../lib/server/supabase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { tx_ref } = req.query;
  if (!tx_ref) return res.status(400).json({ error: 'tx_ref required' });

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('tx_ref', tx_ref)
    .single();

  if (error) return res.status(404).json({ error: 'Transaction not found' });

  return res.status(200).json({
    transaction: {
      tx_ref: data.tx_ref,
      status: data.status,
      amount: data.amount,
      request_id: data.request_id,
      game_id: data.game_id,
      created_at: data.created_at,
    },
  });
}
