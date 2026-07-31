import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!(await requireAdmin(req, res))) return;

  const [pendingMovies, pendingTxs, completedTxs, contacts, admins, completedDonations, allMovies, allRequests, allGames, allNews, allShop] = await Promise.all([
    supabaseAdmin.from('movies').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(50),
    supabaseAdmin.from('transactions').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(50),
    supabaseAdmin.from('transactions').select('*').eq('status', 'completed').order('created_at', { ascending: false }).limit(50),
    supabaseAdmin.from('contacts').select('*').order('created_at', { ascending: false }).limit(50),
    supabaseAdmin.from('admins').select('id, email, created_at'),
    supabaseAdmin.from('donations').select('*').order('created_at', { ascending: false }).limit(50),
    supabaseAdmin.from('movies').select('*').order('created_at', { ascending: false }).limit(100),
    supabaseAdmin.from('requests').select('*').order('created_at', { ascending: false }).limit(100),
    supabaseAdmin.from('games').select('*').order('created_at', { ascending: false }).limit(100),
    supabaseAdmin.from('news').select('*').order('created_at', { ascending: false }).limit(100),
    supabaseAdmin.from('shop').select('*').order('created_at', { ascending: false }).limit(100),
  ]);

  const userIds = [...new Set([
    ...(pendingTxs.data || []).filter(t => t.user_id).map(t => t.user_id),
    ...(completedTxs.data || []).filter(t => t.user_id).map(t => t.user_id),
  ])];

  let userMap = {};
  if (userIds.length > 0) {
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    if (users) {
      userMap = Object.fromEntries(
        users.users.filter(u => userIds.includes(u.id)).map(u => [u.id, u.email])
      );
    }
  }

  const gameEarnings = {};
  for (const tx of completedTxs.data || []) {
    if (tx.game_id) {
      gameEarnings[tx.game_id] = (gameEarnings[tx.game_id] || 0) + tx.amount;
    }
  }

  const requestDonations = {};
  for (const d of completedDonations.data || []) {
    if (d.request_id) {
      requestDonations[d.request_id] = (requestDonations[d.request_id] || 0) + d.amount;
    }
  }

  const movieDonations = {};
  for (const tx of completedTxs.data || []) {
    if (tx.movie_id) {
      movieDonations[tx.movie_id] = (movieDonations[tx.movie_id] || 0) + tx.amount;
    }
  }

  return res.status(200).json({
    pendingMovies: pendingMovies.data || [],
    pendingTransactions: pendingTxs.data || [],
    completedTransactions: completedTxs.data || [],
    contacts: contacts.data || [],
    admins: admins.data || [],
    completedDonations: completedDonations.data || [],
    allMovies: allMovies.data || [],
    allRequests: allRequests.data || [],
    allGames: allGames.data || [],
    allNews: allNews.data || [],
    allShop: allShop.data || [],
    gameEarnings,
    requestDonations,
    movieDonations,
    userMap,
  });
}
