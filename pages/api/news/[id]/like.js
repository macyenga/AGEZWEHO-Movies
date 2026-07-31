import { supabaseAdmin } from '../../../../lib/server/supabase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const { data, error } = await supabaseAdmin.rpc('increment_news_likes', { row_id: id });

  if (error) {
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('news')
      .select('likes')
      .eq('id', id)
      .single();

    if (fetchError || !existing) return res.status(404).json({ error: 'Not found' });

    const { error: updateError } = await supabaseAdmin
      .from('news')
      .update({ likes: (existing.likes || 0) + 1 })
      .eq('id', id);

    if (updateError) return res.status(500).json({ error: updateError.message });
    return res.status(200).json({ likes: (existing.likes || 0) + 1 });
  }

  return res.status(200).json({ likes: data });
}
