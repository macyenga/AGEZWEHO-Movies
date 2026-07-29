import { supabaseAdmin } from '../../../../lib/server/supabase-admin';

async function getUser(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return null;

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  return user || null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in required' });

  const { data: game, error: gameError } = await supabaseAdmin
    .from('games')
    .select('id,links,premium')
    .eq('id', id)
    .single();

  if (gameError || !game) return res.status(404).json({ error: 'Game not found' });

  if (!game.premium) return res.status(200).json({ links: game.links || [] });

  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('id, expires_at')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (sub) {
    const expiresAt = new Date(sub.expires_at);
    if (expiresAt > new Date()) {
      return res.status(200).json({ links: game.links || [] });
    }
  }

  const { data: access } = await supabaseAdmin
    .from('transactions')
    .select('id')
    .eq('game_id', id)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .limit(1);

  if (!access?.length) {
    return res.status(403).json({ error: 'Payment confirmation required' });
  }

  return res.status(200).json({ links: game.links || [] });
}
