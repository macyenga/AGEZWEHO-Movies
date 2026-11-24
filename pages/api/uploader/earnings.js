import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import {
  UPLOADER_MONETIZATION_CONFIG,
  summarizeUploaderEarnings,
  validatePayoutRequest,
} from '../../../lib/uploader-earnings';

async function authenticateUser(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  const user = data?.user;
  if (error || !user?.id) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return null;
  }
  return user;
}

function belongsToUser(record, user) {
  if (!record || !user) return false;
  if (record.uploader_id && String(record.uploader_id) === String(user.id)) return true;
  if (record.uploader_email && user.email && String(record.uploader_email).toLowerCase() === String(user.email).toLowerCase()) {
    return true;
  }
  return false;
}

async function loadUploaderData(user) {
  const [{ data: allMovies }, { data: allGames }, { data: completedTxs }, { data: allPayouts }] = await Promise.all([
    supabaseAdmin.from('movies').select('id, title, type, status, views, uploader_earnings, uploader_momo_number, uploader_id, uploader_email, created_at'),
    supabaseAdmin.from('games').select('id, title, category, status, price, uploader_earnings, uploader_momo_number, uploader_id, uploader_email, created_at'),
    supabaseAdmin.from('transactions').select('id, game_id, amount, status').eq('status', 'completed').limit(2000),
    supabaseAdmin.from('payouts').select('*').order('created_at', { ascending: false }).limit(500),
  ]);

  const movies = (allMovies || []).filter((m) => belongsToUser(m, user));
  const games = (allGames || []).filter((g) => belongsToUser(g, user));
  const gameIds = new Set(games.map((g) => String(g.id)));
  const completedGameTxs = (completedTxs || []).filter((tx) => tx.game_id && gameIds.has(String(tx.game_id)));
  const payouts = (allPayouts || []).filter((p) => belongsToUser(p, user));

  const summary = summarizeUploaderEarnings({
    movies,
    games,
    completedGameTxs,
    payouts,
  });

  return {
    summary,
    payouts,
    rules: UPLOADER_MONETIZATION_CONFIG,
  };
}

export default async function handler(req, res) {
  const user = await authenticateUser(req, res);
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const payload = await loadUploaderData(user);
      return res.status(200).json(payload);
    }

    if (req.method === 'POST') {
      const { amount, momoNumber, notes } = req.body || {};
      const current = await loadUploaderData(user);
      const check = validatePayoutRequest({
        amount,
        momoNumber,
        availableBalance: current.summary.availableBalance,
      });

      if (!check.ok) {
        return res.status(400).json({ error: check.error });
      }

      const { data: payout, error: insertError } = await supabaseAdmin
        .from('payouts')
        .insert([
          {
            uploader_id: user.id,
            uploader_email: user.email || null,
            uploader_phone: check.momoNumber,
            amount: check.amount,
            notes: typeof notes === 'string' && notes.trim() ? notes.trim().slice(0, 140) : 'Uploader MoMo payout request',
            status: 'pending',
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        return res.status(500).json({ error: insertError.message });
      }

      const refreshed = await loadUploaderData(user);
      return res.status(201).json({
        payout,
        ...refreshed,
      });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[Uploader Earnings API] Error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to load uploader earnings' });
  }
}
