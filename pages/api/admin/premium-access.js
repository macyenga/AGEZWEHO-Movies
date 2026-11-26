import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('premium_access_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) return res.status(200).json({ accessRequests: [], userMap: {} });

    let userMap = {};
    try {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      if (users?.users) {
        userMap = Object.fromEntries(users.users.map((u) => [u.id, u.email]));
      }
    } catch {
      // ignore user listing failure
    }

    return res.status(200).json({ accessRequests: data || [], userMap });
  }

  if (req.method === 'POST') {
    const { email, user_id, game_id = null, status = 'approved', note = '' } = req.body || {};
    if (!['approved', 'pending', 'revoked', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid access status' });
    }

    let resolvedUserId = user_id || null;
    let resolvedEmail = email ? String(email).trim().toLowerCase() : null;

    if (!resolvedUserId && resolvedEmail) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const matched = users?.users?.find(
        (u) => String(u.email || '').toLowerCase() === resolvedEmail
      );
      if (!matched) {
        return res.status(404).json({ error: 'User with that email was not found' });
      }
      resolvedUserId = matched.id;
      resolvedEmail = matched.email;
    }

    if (!resolvedUserId) {
      return res.status(400).json({ error: 'User email or user_id is required' });
    }

    const row = {
      user_id: resolvedUserId,
      user_email: resolvedEmail,
      game_id: game_id || null,
      scope: game_id ? 'item' : 'global',
      status,
      note: String(note || '').trim().slice(0, 200) || null,
      approved_by: admin.id,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('premium_access_requests')
      .insert([row])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ accessRequest: data });
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    if (!id || !['approved', 'pending', 'revoked', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Valid id and status required' });
    }

    const { data, error } = await supabaseAdmin
      .from('premium_access_requests')
      .update({
        status,
        approved_by: admin.id,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ accessRequest: data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Access record ID required' });

    const { error } = await supabaseAdmin.from('premium_access_requests').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
