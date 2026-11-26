import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import {
  validateRequestPayload,
  normalizeRequestPayload,
  attachMatchedMoviesToRequests,
  findDuplicatePendingRequest,
} from '../../../lib/requests-helpers';

export async function loadLiveRequests() {
  const [{ data: reqRows, error: reqError }, { data: movieRows }] = await Promise.all([
    supabaseAdmin
      .from('requests')
      .select('*')
      .order('votes', { ascending: false })
      .order('donation_total', { ascending: false })
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('movies')
      .select('id, title')
      .eq('status', 'approved'),
  ]);

  if (reqError) throw reqError;

  const requests = attachMatchedMoviesToRequests(reqRows || [], movieRows || []);
  const pendingCount = requests.filter((r) => !r.fulfilled).length;
  const fulfilledCount = requests.filter((r) => r.fulfilled).length;
  const totalVotes = requests.reduce((sum, r) => sum + (Number(r.votes) || 0), 0);

  return {
    requests,
    stats: {
      pendingCount,
      fulfilledCount,
      totalVotes,
    },
    updatedAt: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'GET') {
    try {
      const payload = await loadLiveRequests();
      return res.status(200).json(payload);
    } catch (err) {
      return res.status(500).json({ error: err?.message || 'Failed to load requests' });
    }
  }

  if (req.method === 'POST') {
    const validation = validateRequestPayload(req.body || {});
    if (!validation.valid) {
      return res.status(400).json({
        error: Object.values(validation.errors)[0] || 'Invalid request details',
        errors: validation.errors,
      });
    }

    const normalized = normalizeRequestPayload(req.body || {});

    try {
      const { data: existingRows } = await supabaseAdmin.from('requests').select('*');
      const duplicate = findDuplicatePendingRequest(
        existingRows || [],
        normalized.title,
        normalized.type
      );

      if (duplicate) {
        return res.status(409).json({
          error: `"${duplicate.title}" is already in the live queue — boost its vote below instead.`,
          duplicate,
        });
      }

      const fullRow = {
        title: normalized.title,
        type: normalized.type,
        year: normalized.year,
        language: normalized.language,
        source: normalized.source,
        requested_by: normalized.requested_by,
        note: normalized.note,
        poster_url: normalized.poster_url,
        imdb_id: normalized.imdb_id,
        votes: 1,
        donation_goal: 5000,
        donation_total: 0,
        fulfilled: false,
      };

      let result = await supabaseAdmin.from('requests').insert([fullRow]).select().single();

      // Graceful fallback if external Supabase table omits newer optional columns
      if (result.error && /column|schema|does not exist/i.test(result.error.message || '')) {
        const coreRow = {
          title: normalized.title,
          year: normalized.year,
          language: normalized.language,
          source: normalized.source,
          requested_by: normalized.requested_by,
          note: normalized.note,
          votes: 1,
          donation_goal: 5000,
          donation_total: 0,
          fulfilled: false,
        };
        result = await supabaseAdmin.from('requests').insert([coreRow]).select().single();
      }

      if (result.error) {
        return res.status(500).json({ error: result.error.message || 'Could not save request' });
      }

      const { data: movieRows } = await supabaseAdmin
        .from('movies')
        .select('id, title')
        .eq('status', 'approved');

      const [enriched] = attachMatchedMoviesToRequests(
        [{ ...result.data, type: result.data?.type || normalized.type }],
        movieRows || []
      );

      return res.status(201).json({ request: enriched });
    } catch (err) {
      return res.status(500).json({ error: err?.message || 'Failed to submit request' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
