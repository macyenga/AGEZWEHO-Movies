import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    const { data: subscriptions, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return res.status(500).json({ error: error.message });

    const userIds = [...new Set((subscriptions || []).filter(s => s.user_id).map(s => s.user_id))];
    let userMap = {};
    if (userIds.length > 0) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      if (users) {
        userMap = Object.fromEntries(
          users.users.filter(u => userIds.includes(u.id)).map(u => [u.id, u.email])
        );
      }
    }

    return res.status(200).json({ subscriptions: subscriptions || [], userMap });
  }

  if (req.method === 'POST') {
    const { email, user_id, months = 1, phone, amount } = req.body || {};
    let resolvedUserId = user_id || null;

    if (!resolvedUserId && email) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const matched = users?.users?.find((u) => String(u.email || '').toLowerCase() === String(email).trim().toLowerCase());
      if (!matched) {
        return res.status(404).json({ error: 'User with that email was not found' });
      }
      resolvedUserId = matched.id;
    }

    if (!resolvedUserId) {
      return res.status(400).json({ error: 'User email or user_id is required' });
    }

    const parsedMonths = Math.max(1, parseInt(months, 10) || 1);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + parsedMonths);

    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .insert([{
        user_id: resolvedUserId,
        months: parsedMonths,
        phone: phone || null,
        amount: parseInt(amount, 10) || parsedMonths * 1000,
        tx_ref: `PRO_ADMIN_${Date.now()}`,
        status: 'active',
        approved_by: admin.id,
        approved_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ subscription: data });
  }

  if (req.method === 'PATCH') {
    const { id, extend_days, status } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Subscription ID required' });

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) return res.status(404).json({ error: 'Subscription not found' });

    const updates = {};
    if (extend_days) {
      const days = parseInt(extend_days, 10);
      if (!days || days < 1) return res.status(400).json({ error: 'extend_days must be positive' });
      const baseDate = existing.expires_at && new Date(existing.expires_at) > new Date()
        ? new Date(existing.expires_at)
        : new Date();
      baseDate.setDate(baseDate.getDate() + days);
      updates.expires_at = baseDate.toISOString();
      updates.status = 'active';
      updates.approved_by = admin.id;
      updates.approved_at = updates.approved_at || new Date().toISOString();
    }

    if (status) {
      if (!['active', 'pending', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid subscription status' });
      }
      updates.status = status;
      if (status === 'active' && !updates.expires_at) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + (existing.months || 1));
        if (!existing.expires_at || new Date(existing.expires_at) <= new Date()) {
          updates.expires_at = nextMonth.toISOString();
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid subscription updates provided' });
    }

    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ subscription: data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Subscription ID required' });

    const { error } = await supabaseAdmin.from('subscriptions').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
