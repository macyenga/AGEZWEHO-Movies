import { supabaseAdmin } from '../../../lib/server/supabase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, category, version, rating, cover_url, overview, premium, price, uploader_momo_number, links } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const { error } = await supabaseAdmin.from('games').insert([{
      title: title.trim(),
      category,
      version: version || null,
      rating: rating || null,
      cover_url: cover_url || null,
      overview: overview || null,
      premium: premium !== false,
      price: Math.max(50, parseInt(price) || 50),
      uploader_momo_number: uploader_momo_number || null,
      links: (links || []).filter(l => l.url?.trim()),
      status: 'pending',
      created_at: new Date().toISOString(),
    }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
