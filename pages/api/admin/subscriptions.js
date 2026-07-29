import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!(await requireAdmin(req, res))) return;

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
