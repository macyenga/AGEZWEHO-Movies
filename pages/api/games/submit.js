import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { isValidRwandaPhone, normalizeRwandaPhone } from '../../../lib/paypack-client';

async function getOptionalUser(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return null;
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user?.id) return null;
    return data.user;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, category, version, rating, cover_url, overview, premium, price, uploader_momo_number, links } = req.body || {};

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const rawMomo = typeof uploader_momo_number === 'string' ? uploader_momo_number.trim() : '';
    let normalizedMomo = null;
    if (rawMomo) {
      normalizedMomo = normalizeRwandaPhone(rawMomo);
      if (!isValidRwandaPhone(normalizedMomo)) {
        return res.status(400).json({ error: 'Invalid Rwandan MoMo number (e.g. 0788123456)' });
      }
    }

    const user = await getOptionalUser(req);

    const { error } = await supabaseAdmin.from('games').insert([{
      title: title.trim(),
      category,
      version: version || null,
      rating: rating || null,
      cover_url: cover_url || null,
      overview: overview || null,
      premium: premium !== false,
      price: Math.max(50, parseInt(price, 10) || 50),
      uploader_momo_number: normalizedMomo,
      uploader_id: user?.id || null,
      uploader_email: user?.email || null,
      uploader_earnings: 0,
      links: Array.isArray(links) ? links.filter((l) => l && l.url?.trim()) : [],
      status: 'pending',
      created_at: new Date().toISOString(),
    }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
