import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { completeTransaction } from '../../../lib/server/transactions';
import { getRwandaPayCollectionStatus, isRwandaPayPaid } from '../../../lib/server/payments';

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

  let status = data.status;
  let provider_status = null;

  // Auto-confirm pending RwandaPay transactions by polling the gateway.
  if (status === 'pending' && data.provider_reference) {
    const gateway = await getRwandaPayCollectionStatus(data.provider_reference);
    if (gateway) {
      provider_status = gateway.collection_status || gateway.status || null;
      if (isRwandaPayPaid(gateway)) {
        const { transaction } = await completeTransaction(
          data.tx_ref,
          gateway.paypack_reference || data.provider_reference
        );
        status = transaction?.status || 'completed';
      }
    }
  }

  return res.status(200).json({
    transaction: {
      tx_ref: data.tx_ref,
      status,
      amount: data.amount,
      request_id: data.request_id,
      game_id: data.game_id,
      movie_id: data.movie_id,
      provider_reference: data.provider_reference || null,
      provider_status,
      created_at: data.created_at,
    },
  });
}