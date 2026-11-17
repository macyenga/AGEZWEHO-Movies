import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!(await requireAdmin(req, res))) return;

  const { period } = req.query; // daily, weekly, monthly

  const { data: completed } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1000);

  const { data: donations } = await supabaseAdmin
    .from('donations')
    .select('*')
    .eq('confirmed', true)
    .order('created_at', { ascending: false })
    .limit(1000);

  const { data: games } = await supabaseAdmin
    .from('games')
    .select('id, title, price');

  const { data: movies } = await supabaseAdmin
    .from('movies')
    .select('id, title, views, genre, status');

  const { data: requests } = await supabaseAdmin
    .from('requests')
    .select('id, title, votes, donation_total, donation_goal');

  const gameMap = Object.fromEntries((games || []).map(g => [g.id, g.title]));

  const gameSalesTotal = (completed || [])
    .filter(t => t.game_id)
    .reduce((s, t) => s + (t.amount || 0), 0);

  const donationTotal = (completed || [])
    .filter(t => t.request_id)
    .reduce((s, t) => s + (t.amount || 0), 0);

  const directDonationTotal = (donations || []).reduce((s, d) => s + (d.amount || 0), 0);

  const totalRevenue = gameSalesTotal + donationTotal + directDonationTotal;

  function getPeriodKey(dateStr, periodType) {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    if (periodType === 'monthly') return `${y}-${m}`;
    if (periodType === 'weekly') {
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay());
      return `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`;
    }
    return `${y}-${m}-${day}`;
  }

  const revenueByPeriod = {};
  for (const tx of completed || []) {
    const key = getPeriodKey(tx.created_at, period || 'daily');
    revenueByPeriod[key] = revenueByPeriod[key] || { date: key, gameSales: 0, donations: 0, total: 0 };
    if (tx.game_id) {
      revenueByPeriod[key].gameSales += tx.amount || 0;
    } else {
      revenueByPeriod[key].donations += tx.amount || 0;
    }
    revenueByPeriod[key].total += tx.amount || 0;
  }

  const topRequests = (requests || [])
    .filter(r => r.votes > 0 || r.donation_total > 0)
    .sort((a, b) => (b.donation_total || 0) - (a.donation_total || 0))
    .slice(0, 20);

  let topGames = [];
  const gameRevenue = {};
  for (const tx of completed || []) {
    if (tx.game_id) {
      gameRevenue[tx.game_id] = (gameRevenue[tx.game_id] || 0) + (tx.amount || 0);
    }
  }
  for (const [id, rev] of Object.entries(gameRevenue)) {
    topGames.push({ id, title: gameMap[id] || 'Unknown', revenue: rev });
  }
  topGames = topGames.sort((a, b) => b.revenue - a.revenue).slice(0, 20);

  const totalViews = (movies || []).reduce((sum, m) => sum + (Number(m.views) || 0), 0);
  const topMovies = [...(movies || [])]
    .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
    .slice(0, 10)
    .map((m) => ({
      id: m.id,
      title: m.title,
      genre: m.genre || 'Other',
      views: Number(m.views) || 0,
    }));

  const genreCounts = {};
  for (const m of movies || []) {
    const g = m.genre || 'Uncategorized';
    genreCounts[g] = (genreCounts[g] || 0) + 1;
  }
  const moviesByGenre = Object.entries(genreCounts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);

  const totalByStatus = {
    pending: 0, completed: 0, cancelled: 0, refunded: 0,
  };
  const { count: completedCount } = await supabaseAdmin.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'completed');
  const { count: pendingCount } = await supabaseAdmin.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'pending');
  const { count: cancelledCount } = await supabaseAdmin.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'cancelled');
  const { count: refundedCount } = await supabaseAdmin.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'refunded');
  totalByStatus.completed = completedCount || 0;
  totalByStatus.pending = pendingCount || 0;
  totalByStatus.cancelled = cancelledCount || 0;
  totalByStatus.refunded = refundedCount || 0;

  return res.status(200).json({
    totalRevenue,
    gameSalesTotal,
    donationTotal,
    directDonationTotal,
    totalViews,
    topMovies,
    moviesByGenre,
    revenueByPeriod: Object.values(revenueByPeriod).sort((a, b) => a.date.localeCompare(b.date)).slice(-90),
    topRequests,
    topGames,
    totalByStatus,
    totalTransactions: totalByStatus.pending + totalByStatus.completed + totalByStatus.cancelled + totalByStatus.refunded,
  });
}