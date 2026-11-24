import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { isValidRwandaPhone, normalizeRwandaPhone } from '../../../lib/paypack-client';
import { normalizeSubtitles } from '../../../lib/media-preview';

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
    const body = req.body || {};
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const year = typeof body.year === 'string' || typeof body.year === 'number' ? String(body.year).trim() : '';

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!year) {
      return res.status(400).json({ error: 'Year is required' });
    }

    const rawMomo = typeof body.uploader_momo_number === 'string' ? body.uploader_momo_number.trim() : '';
    let normalizedMomo = null;
    if (rawMomo) {
      normalizedMomo = normalizeRwandaPhone(rawMomo);
      if (!isValidRwandaPhone(normalizedMomo)) {
        return res.status(400).json({ error: 'Invalid Rwandan MoMo number (e.g. 0788123456)' });
      }
    }

    const user = await getOptionalUser(req);

    const safeLinks = Array.isArray(body.links)
      ? body.links.filter((l) => l && typeof l.url === 'string' && l.url.trim())
      : [];
    const safeWatchLinks = Array.isArray(body.watch_links)
      ? body.watch_links.filter((l) => l && typeof l.url === 'string' && l.url.trim())
      : [];
    const safeSubtitles = normalizeSubtitles(body.subtitles, body.subtitle_url, body.language || 'Kinyarwanda');

    const payload = {
      title,
      year,
      type: body.type || 'Movie',
      language: body.language || null,
      genre: body.genre || null,
      rating: body.rating || null,
      poster_url: body.poster_url || null,
      overview: body.overview || null,
      trailer_url: body.trailer_url || null,
      subtitles: safeSubtitles,
      uploaded_by: (typeof body.uploaded_by === 'string' && body.uploaded_by.trim()) || user?.email?.split('@')[0] || null,
      uploader_momo_number: normalizedMomo,
      uploader_id: user?.id || null,
      uploader_email: user?.email || null,
      uploader_earnings: 0,
      views: 0,
      links: safeLinks,
      watch_links: safeWatchLinks,
      featured: false,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('movies')
      .insert([payload])
      .select('id, title, status')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ success: true, movie: data });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
