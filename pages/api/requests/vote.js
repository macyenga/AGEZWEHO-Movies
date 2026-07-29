import { supabaseAdmin } from '../../../lib/server/supabase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('id, expires_at')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  const isPro = sub && new Date(sub.expires_at) > new Date();

  const { id, skipPayment } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Request ID required' });

  if (!skipPayment && !isPro) {
    return res.status(403).json({ error: 'Payment or Pro membership required' });
  }

  const { data: current, error: fetchError } = await supabaseAdmin
    .from('requests')
    .select('votes')
    .eq('id', id)
    .single();

  if (fetchError) return res.status(500).json({ error: fetchError.message });
  if (!current) return res.status(404).json({ error: 'Request not found' });

  const { data, error } = await supabaseAdmin
    .from('requests')
    .update({ votes: (current.votes || 0) + 1 })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ request: data });
}
