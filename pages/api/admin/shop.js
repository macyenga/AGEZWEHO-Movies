import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';

const ALLOWED_FIELDS = [
  'title',
  'description',
  'price',
  'currency',
  'category',
  'image_url',
  'seller_name',
  'seller_whatsapp',
  'status',
];

function pickShopUpdates(body) {
  return Object.fromEntries(
    Object.entries(body || {}).filter(([key]) => ALLOWED_FIELDS.includes(key))
  );
}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === 'POST') {
    const payload = pickShopUpdates(req.body);
    if (!payload.title || !String(payload.title).trim()) {
      return res.status(400).json({ error: 'Product title is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('shop')
      .insert([{
        currency: 'RWF',
        category: 'Electronics',
        seller_name: 'Agasobanuye.rw Store',
        seller_whatsapp: '+250789690247',
        ...payload,
        title: String(payload.title).trim(),
        status: payload.status || 'active',
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ item: data });
  }

  if (req.method === 'PATCH') {
    const { id, ...body } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Item ID required' });

    const updates = pickShopUpdates(body);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    const { data, error } = await supabaseAdmin
      .from('shop')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ item: data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Item ID required' });

    const { error } = await supabaseAdmin.from('shop').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
