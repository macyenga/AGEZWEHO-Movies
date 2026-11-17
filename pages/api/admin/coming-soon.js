import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';
import { comingSoonToMoviePayload } from '../../../lib/admin-helpers';

const ALLOWED_FIELDS = [
  'title',
  'releaseDate',
  'type',
  'genre',
  'language',
  'interpreter',
  'poster_url',
  'trailer_url',
  'overview',
];

function pickComingSoonFields(body) {
  return Object.fromEntries(
    Object.entries(body || {}).filter(([key]) => ALLOWED_FIELDS.includes(key))
  );
}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('coming_soon')
      .select('*')
      .order('releaseDate', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ items: data || [] });
  }

  if (req.method === 'POST') {
    const { action } = req.query;

    if (action === 'publish') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Coming Soon ID required' });

      const { data: item, error: fetchErr } = await supabaseAdmin
        .from('coming_soon')
        .select('*')
        .eq('id', id)
        .single();
      if (fetchErr || !item) return res.status(404).json({ error: 'Upcoming release not found' });

      const moviePayload = comingSoonToMoviePayload(item);
      const { data: movie, error: insertErr } = await supabaseAdmin
        .from('movies')
        .insert([moviePayload])
        .select()
        .single();
      if (insertErr) return res.status(500).json({ error: insertErr.message });

      await supabaseAdmin.from('coming_soon').delete().eq('id', id);
      return res.status(200).json({ published: true, movie });
    }

    const payload = pickComingSoonFields(req.body);
    if (!payload.title || !payload.releaseDate) {
      return res.status(400).json({ error: 'Title and releaseDate (YYYY-MM-DD) are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('coming_soon')
      .insert([{
        type: 'Movie',
        genre: 'Action',
        language: 'Kinyarwanda',
        ...payload,
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ item: data });
  }

  if (req.method === 'PATCH') {
    const { id, ...rest } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Coming Soon ID required' });

    const updates = pickComingSoonFields(rest);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    const { data, error } = await supabaseAdmin
      .from('coming_soon')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ item: data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Coming Soon ID required' });

    const { error } = await supabaseAdmin.from('coming_soon').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
