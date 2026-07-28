import { supabaseAdmin } from '../../../lib/server/supabase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Request ID required' });

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
