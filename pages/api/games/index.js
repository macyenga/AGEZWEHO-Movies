import { supabaseAdmin } from '../../../lib/server/supabase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { data, error } = await supabaseAdmin
    .from('games')
    .select('id,title,category,version,rating,cover_url,overview,premium,price,links,created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  const games = (data || []).map(({ links, ...game }) => ({
    ...game,
    download_count: Array.isArray(links) ? links.length : 0,
  }));

  return res.status(200).json({ games });
}
