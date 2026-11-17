import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';

export default async function handler(req, res) {
  const user = await requireAdmin(req, res);
  if (!user) return;

  if (req.method === 'POST') {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) return res.status(500).json({ error: 'Failed to list users' });
    const targetUser = users?.users?.find(u => u.email === email);
    if (!targetUser) return res.status(404).json({ error: 'User not found. They must sign up first.' });

    const { data: existing } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('user_id', targetUser.id)
      .maybeSingle();

    if (existing) return res.status(400).json({ error: 'User is already an admin' });

    const { data, error } = await supabaseAdmin
      .from('admins')
      .insert([{ user_id: targetUser.id, email, created_by: user.id }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ admin: data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Admin ID required' });

    const { data: adminsList, error: fetchErr } = await supabaseAdmin
      .from('admins')
      .select('id, user_id, email');
    if (fetchErr) return res.status(500).json({ error: fetchErr.message });

    const target = (adminsList || []).find((a) => a.id === id);
    if (!target) return res.status(404).json({ error: 'Admin record not found' });
    if (target.user_id === user.id || target.email === user.email) {
      return res.status(400).json({ error: 'Cannot remove your own active admin account' });
    }
    if ((adminsList || []).length <= 1) {
      return res.status(400).json({ error: 'At least one admin must remain' });
    }

    const { error } = await supabaseAdmin.from('admins').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
