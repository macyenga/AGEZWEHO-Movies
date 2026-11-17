import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';

const ALLOWED_FIELDS = [
  'title',
  'year',
  'type',
  'language',
  'genre',
  'rating',
  'poster_url',
  'overview',
  'links',
  'watch_links',
  'subtitle_links',
  'platforms',
  'trailer_url',
  'uploaded_by',
  'uploader_momo_number',
  'uploader_earnings',
  'views',
  'featured',
  'status',
];

function pickMovieUpdates(body) {
  return Object.fromEntries(
    Object.entries(body || {}).filter(([key]) => ALLOWED_FIELDS.includes(key))
  );
}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === 'POST') {
    const body = req.body || {};

    if (body.action === 'bulk' && Array.isArray(body.ids) && body.ids.length > 0) {
      const ids = body.ids.filter(Boolean);
      if (body.bulkAction === 'approve' || body.bulkAction === 'reject') {
        const nextStatus = body.bulkAction === 'approve' ? 'approved' : 'rejected';
        const { error } = await supabaseAdmin
          .from('movies')
          .update({ status: nextStatus })
          .in('id', ids);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true, count: ids.length, status: nextStatus });
      }
      if (body.bulkAction === 'delete') {
        const { error } = await supabaseAdmin.from('movies').delete().in('id', ids);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true, count: ids.length });
      }
      return res.status(400).json({ error: 'Invalid bulkAction' });
    }

    const movie = pickMovieUpdates(body);
    if (!movie.title) return res.status(400).json({ error: 'Title is required' });
    if (!movie.status) movie.status = 'approved';
    if (movie.views === undefined) movie.views = 0;

    const { data, error } = await supabaseAdmin
      .from('movies')
      .insert([movie])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ movie: data });
  }

  if (req.method === 'PATCH') {
    const { id, ...body } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Movie ID required' });

    const updates = pickMovieUpdates(body);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    const { data, error } = await supabaseAdmin
      .from('movies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ movie: data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Movie ID required' });

    const { error } = await supabaseAdmin.from('movies').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
