import { supabaseAdmin } from './supabase-admin';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function requireAdmin(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return null;
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }

  const { data: admin } = await supabaseAdmin
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!admin && (!ADMIN_EMAIL || user.email !== ADMIN_EMAIL)) {
    res.status(403).json({ error: 'Not authorized' });
    return null;
  }

  return user;
}
