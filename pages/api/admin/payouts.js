import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';

async function getAdminUserId(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.slice(7));
  return user?.id || null;
}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === 'GET') {
    const { data: payouts } = await supabaseAdmin
      .from('payouts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    const { data: completedTxs } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('status', 'completed')
      .limit(2000);

    const uploaderEarnings = {};
    for (const tx of completedTxs || []) {
      if (tx.game_id) {
        const gameId = tx.game_id;
        uploaderEarnings[gameId] = (uploaderEarnings[gameId] || 0) + (tx.amount || 0);
      }
    }

    const { data: games } = await supabaseAdmin
      .from('games')
      .select('id, title, uploader_momo_number, status');

    const uploadersMap = {};
    for (const game of games || []) {
      if (game.uploader_momo_number) {
        const key = game.uploader_momo_number;
        uploadersMap[key] = uploadersMap[key] || {
          momo_number: key,
          games: [],
          totalEarnings: 0,
        };
        uploadersMap[key].games.push({
          id: game.id,
          title: game.title,
          earnings: uploaderEarnings[game.id] || 0,
        });
        uploadersMap[key].totalEarnings += uploaderEarnings[game.id] || 0;
      }
    }

    const { data: allMovies } = await supabaseAdmin
      .from('movies')
      .select('id, title, uploaded_by, uploader_earnings, uploader_momo_number');

    const movieUploadersMap = {};
    for (const m of allMovies || []) {
      if (m.uploaded_by && m.uploader_earnings > 0) {
        const key = m.uploaded_by;
        if (!movieUploadersMap[key]) {
          movieUploadersMap[key] = { name: key, momo_number: m.uploader_momo_number || '', movies: [], totalEarnings: 0 };
        }
        movieUploadersMap[key].movies.push({ id: m.id, title: m.title, earnings: m.uploader_earnings });
        movieUploadersMap[key].totalEarnings += m.uploader_earnings;
      }
    }

    const paidPayouts = (payouts || [])
      .filter(p => p.status === 'paid')
      .reduce((s, p) => s + (p.amount || 0), 0);

    return res.status(200).json({
      payouts: payouts || [],
      uploaders: Object.values(uploadersMap),
      movieUploaders: Object.values(movieUploadersMap),
      totalPaidOut: paidPayouts,
    });
  }

  if (req.method === 'POST') {
    const { action } = req.query;

    if (action === 'process') {
      const { uploader_phone, amount, notes } = req.body;
      if (!uploader_phone || !amount) {
        return res.status(400).json({ error: 'uploader_phone and amount required' });
      }

      const { data: payout, error } = await supabaseAdmin
        .from('payouts')
        .insert([{
          uploader_phone,
          amount: parseInt(amount, 10),
          notes: notes || null,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ payout });
    }

    if (action === 'mark-paid') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Payout ID required' });

      const adminId = await getAdminUserId(req);

      const { data: payout, error } = await supabaseAdmin
        .from('payouts')
        .update({ status: 'paid', processed_at: new Date().toISOString(), processed_by: adminId })
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ payout });
    }

    return res.status(400).json({ error: 'Invalid action. Use: process, mark-paid' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}