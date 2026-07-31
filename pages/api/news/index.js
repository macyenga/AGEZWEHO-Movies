import { supabaseAdmin } from '../../../lib/server/supabase-admin';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('news')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ news: data || [] });
    }

    if (req.method === 'POST') {
      const { title, content, image_url, category, author_name, author_id, publisher_momo } = req.body;

      if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });

      const { data, error } = await supabaseAdmin.from('news').insert([{
        title: title.trim(),
        content: content || null,
        image_url: image_url || null,
        category: category || 'Amakuru',
        author_name: author_name || 'Anonymous',
        author_id: author_id || null,
        publisher_momo: publisher_momo || null,
        status: 'approved',
        likes: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
      }]).select().single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ news: data });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
