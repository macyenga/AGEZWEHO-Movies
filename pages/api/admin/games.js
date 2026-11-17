import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';

const ALLOWED_FIELDS = [
  'title',
  'type',
  'category',
  'version',
  'rating',
  'cover_url',
  'overview',
  'links',
  'premium',
  'price',
  'uploader_momo_number',
  'status',
];

function pickGameUpdates(body) {
  return Object.fromEntries(
    Object.entries(body || {}).filter(([key]) => ALLOWED_FIELDS.includes(key))
  );
}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === 'POST') {
    const payload = pickGameUpdates(req.body);
    if (!payload.title || !String(payload.title).trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const isPremium = Boolean(payload.premium);
    const parsedPrice = isPremium ? Math.max(0, parseInt(payload.price || 500, 10) || 0) : 0;

    const { data, error } = await supabaseAdmin
      .from('games')
      .insert([{
        type: 'Game',
        category: 'Action',
        rating: '4.8',
        links: [],
        ...payload,
        title: String(payload.title).trim(),
        premium: isPremium,
        price: parsedPrice,
        status: payload.status || 'approved',
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ game: data });
  }

  if (req.method === 'PATCH') {
    const { id, ...body } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Game ID required' });

    const updates = pickGameUpdates(body);
    if (updates.price !== undefined) {
      updates.price = Math.max(0, parseInt(updates.price, 10) || 0);
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    const { data, error } = await supabaseAdmin
      .from('games')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ game: data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Game ID required' });

    const { error } = await supabaseAdmin.from('games').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
