import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { completeTransaction } from '../../../lib/server/transactions';
import { getRwandaPayCollectionStatus, verifyCheckoutPayment, isRwandaPayPaid } from '../../../lib/server/payments';
import { getPaypackTransactionStatus } from '../../../lib/server/paypack';

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
  let gatewayRaw = null;

  // Auto-confirm pending RwandaPay transactions by polling the gateway.
  // Supports both Hosted Checkout (GET /checkout/{tx_ref}/verify, no auth) and Collections (GET /collections/{ref}/status)
  // per https://rwandapay.rw/docs
  if (status === 'pending' && data.provider_reference) {
    // 0) Direct Paypack API check (https://payments.paypack.rw)
    const paypackCheck = await getPaypackTransactionStatus(data.provider_reference);
    if (paypackCheck) {
      gatewayRaw = paypackCheck.raw;
      provider_status = paypackCheck.status;
      if (paypackCheck.paid) {
        const { transaction } = await completeTransaction(data.tx_ref, data.provider_reference);
        status = transaction?.status || 'completed';
      }
    }

    // 1) Collection status (authenticated)
    if (status === 'pending') {
      const gateway = await getRwandaPayCollectionStatus(data.provider_reference);
      if (gateway) {
        gatewayRaw = gateway;
        provider_status = gateway.collection_status || gateway.paypack_status || gateway.status || null;
        if (isRwandaPayPaid(gateway)) {
          const { transaction } = await completeTransaction(data.tx_ref, gateway.paypack_reference || data.provider_reference);
          status = transaction?.status || 'completed';
        }
      }
    }

    // 2) Checkout verify (no auth) — fallback / alternative for AGZ_* refs
    if (status === 'pending') {
      // provider_reference may be AGZ_* (tx_ref) or COL-*; tx_ref itself is always checkout-verifyable
      const verifyCandidates = [data.provider_reference, data.tx_ref].filter(Boolean);
      for (const ref of verifyCandidates) {
        const chk = await verifyCheckoutPayment(ref);
        if (!chk) continue;
        const chkStatus = chk.status || chk.data?.status || null;
        provider_status = provider_status || chkStatus;
        gatewayRaw = gatewayRaw || chk;
        if (isRwandaPayPaid(chk) || chk.status === 'successful' || chk.success === true) {
          const payRef = chk.reference || chk.data?.reference || chk.paypack_reference || data.provider_reference;
          const { transaction } = await completeTransaction(data.tx_ref, payRef);
          status = transaction?.status || 'completed';
          break;
        }
        if (chk.status === 'failed') {
          provider_status = 'failed';
          break;
        }
      }
    }
  } else if (status === 'pending' && !data.provider_reference) {
    // No provider_reference yet (edge) — try tx_ref as checkout verify
    const chk = await verifyCheckoutPayment(data.tx_ref);
    if (chk) {
      provider_status = chk.status || null;
      gatewayRaw = chk;
      if (isRwandaPayPaid(chk)) {
        const { transaction } = await completeTransaction(data.tx_ref, chk.reference || data.tx_ref);
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
      gateway: gatewayRaw,
      created_at: data.created_at,
    },
  });
}
