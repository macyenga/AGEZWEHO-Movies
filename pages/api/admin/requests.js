import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';

const ALLOWED_FIELDS = [
  'title',
  'type',
  'requested_by',
  'note',
  'year',
  'language',
  'poster_url',
  'imdb_id',
  'donation_goal',
  'votes',
  'fulfilled',
];

function pickRequestUpdates(body) {
  return Object.fromEntries(
    Object.entries(body || {}).filter(([key]) => ALLOWED_FIELDS.includes(key))
  );
}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === 'POST') {
    const payload = pickRequestUpdates(req.body);
    if (!payload.title || !String(payload.title).trim()) {
      return res.status(400).json({ error: 'Request title is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('requests')
      .insert([{
        title: String(payload.title).trim(),
        requested_by: payload.requested_by || 'Admin',
        note: payload.note || '',
        year: payload.year || null,
        language: payload.language || null,
        donation_goal: Math.max(0, parseInt(payload.donation_goal ?? 5000, 10) || 5000),
        votes: Math.max(0, parseInt(payload.votes ?? 1, 10) || 0),
        donation_total: 0,
        fulfilled: Boolean(payload.fulfilled),
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ request: data });
  }

  if (req.method === 'PATCH') {
    const { id, ...body } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Request ID required' });

    const updates = pickRequestUpdates(body);
    if (updates.fulfilled !== undefined && typeof updates.fulfilled !== 'boolean') {
      return res.status(400).json({ error: 'fulfilled must be true or false' });
    }
    if (updates.donation_goal !== undefined) {
      updates.donation_goal = Math.max(0, parseInt(updates.donation_goal, 10) || 0);
    }
    if (updates.votes !== undefined) {
      updates.votes = Math.max(0, parseInt(updates.votes, 10) || 0);
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    const { data, error } = await supabaseAdmin
      .from('requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ request: data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Request ID required' });

    const { error } = await supabaseAdmin.from('requests').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
