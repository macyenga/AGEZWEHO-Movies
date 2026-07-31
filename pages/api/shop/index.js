import { supabaseAdmin } from '../../../lib/server/supabase-admin';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { category } = req.query;
      let query = supabaseAdmin
        .from('shop')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ items: data || [] });
    }

    if (req.method === 'POST') {
      const { title, description, price, image_url, category, seller_name, seller_whatsapp } = req.body;

      if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
      if (!seller_whatsapp?.trim()) return res.status(400).json({ error: 'WhatsApp number is required' });

      const { data, error } = await supabaseAdmin.from('shop').insert([{
        title: title.trim(),
        description: description || null,
        price: price?.trim() || null,
        image_url: image_url || null,
        category: category || 'Other',
        seller_name: seller_name?.trim() || 'Anonymous',
        seller_whatsapp: seller_whatsapp.trim(),
        status: 'active',
        created_at: new Date().toISOString(),
      }]).select().single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ item: data });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
