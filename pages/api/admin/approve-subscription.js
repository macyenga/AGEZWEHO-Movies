import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { subscription_id, action, tx_ref } = req.body;
  if (!subscription_id || !action) return res.status(400).json({ error: 'subscription_id and action required' });
  if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'action must be approve or reject' });

  const { data: sub, error: fetchError } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('id', subscription_id)
    .single();

  if (fetchError || !sub) return res.status(404).json({ error: 'Subscription not found' });
  if (sub.status !== 'pending') return res.status(400).json({ error: `Subscription already ${sub.status}` });

  const txRef = tx_ref || sub.tx_ref;

  if (action === 'approve') {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + (sub.months || 1));

    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'active',
        approved_by: admin.id,
        approved_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq('id', subscription_id);

    if (updateError) return res.status(500).json({ error: updateError.message });

    if (txRef) {
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'completed', provider_reference: `sub_approved_${subscription_id}` })
        .eq('tx_ref', txRef);
    } else {
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'completed', provider_reference: `sub_approved_${subscription_id}` })
        .eq('user_id', sub.user_id)
        .eq('status', 'pending');
    }

    return res.status(200).json({ status: 'approved' });
  }

  if (action === 'reject') {
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'cancelled', approved_by: admin.id, approved_at: new Date().toISOString() })
      .eq('id', subscription_id);

    if (updateError) return res.status(500).json({ error: updateError.message });

    if (txRef) {
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'cancelled' })
        .eq('tx_ref', txRef);
    }

    return res.status(200).json({ status: 'cancelled' });
  }
}
