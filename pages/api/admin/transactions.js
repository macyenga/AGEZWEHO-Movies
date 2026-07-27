import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';
import { completeTransaction } from '../../../lib/server/transactions';

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === 'GET') {
    const { status, search, limit } = req.query;
    let query = supabaseAdmin.from('transactions').select('*');

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      const term = `%${search}%`;
      query = query.or(
        `tx_ref.ilike.${term},phone.ilike.${term},donor_email.ilike.${term},provider_reference.ilike.${term},user_id.ilike.${term},request_id.ilike.${term}`
      );
    }

    query = query.order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(parseInt(limit, 10) || 200);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const userIds = [...new Set((data || []).filter(t => t.user_id).map(t => t.user_id))];
    let userMap = {};
    if (userIds.length > 0) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      if (users) {
        userMap = Object.fromEntries(
          users.users.filter(u => userIds.includes(u.id)).map(u => [u.id, u.email])
        );
      }
    }

    return res.status(200).json({ transactions: data, userMap });
  }

  if (req.method === 'POST') {
    const { action } = req.query;

    if (action === 'cancel') {
      const { tx_ref } = req.body;
      if (!tx_ref) return res.status(400).json({ error: 'tx_ref required' });

      const { data: tx } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('tx_ref', tx_ref)
        .single();

      if (!tx) return res.status(404).json({ error: 'Transaction not found' });
      if (tx.status !== 'pending') return res.status(400).json({ error: `Cannot cancel a ${tx.status} transaction` });

      await supabaseAdmin.from('transactions').update({ status: 'cancelled' }).eq('id', tx.id);
      return res.status(200).json({ status: 'cancelled' });
    }

    if (action === 'refund') {
      const { tx_ref } = req.body;
      if (!tx_ref) return res.status(400).json({ error: 'tx_ref required' });

      const { data: tx } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('tx_ref', tx_ref)
        .single();

      if (!tx) return res.status(404).json({ error: 'Transaction not found' });
      if (tx.status !== 'completed') return res.status(400).json({ error: `Cannot refund a ${tx.status} transaction` });

      await supabaseAdmin.from('transactions').update({ status: 'refunded', provider_reference: `refunded_${tx.tx_ref}` }).eq('id', tx.id);

      if (tx.request_id) {
        const { data: request } = await supabaseAdmin
          .from('requests')
          .select('votes, donation_total')
          .eq('id', tx.request_id)
          .single();

        if (request) {
          const voteBoost = Math.max(1, Math.floor(Number(tx.amount || 0) / 50));
          await supabaseAdmin
            .from('requests')
            .update({
              votes: Math.max(0, (request.votes || 0) - voteBoost),
              donation_total: Math.max(0, (request.donation_total || 0) - tx.amount),
            })
            .eq('id', tx.request_id);
        }
      }

      if (tx.game_id && tx.user_id) {
        await supabaseAdmin
          .from('premium_access_requests')
          .update({ status: 'refunded' })
          .eq('user_id', tx.user_id)
          .eq('game_id', tx.game_id);
      }

      return res.status(200).json({ status: 'refunded' });
    }

    if (action === 'manual-create') {
      const { amount, phone, donor_email, request_id, game_id, user_id, notes } = req.body;
      if (!amount || amount < 1) return res.status(400).json({ error: 'Valid amount required' });

      const tx_ref = `MANUAL_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const { data: tx, error } = await supabaseAdmin
        .from('transactions')
        .insert([{
          amount: parseInt(amount, 10),
          tx_ref,
          phone: phone || null,
          donor_email: donor_email || null,
          request_id: request_id || null,
          game_id: game_id || null,
          user_id: user_id || null,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });

      const result = await completeTransaction(tx_ref, `manual_${tx_ref}`);
      if (result.error) return res.status(500).json({ error: result.error });

      return res.status(200).json({ transaction: result.transaction, tx_ref });
    }

    return res.status(400).json({ error: 'Invalid action. Use: cancel, refund, manual-create' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}