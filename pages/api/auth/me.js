import { supabaseAdmin } from '../../../lib/server/supabase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) return res.status(401).json({ error: 'Invalid token' });

  return res.status(200).json({ user: { id: data.user.id, email: data.user.email } });
}
