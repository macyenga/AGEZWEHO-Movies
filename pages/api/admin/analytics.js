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

  const totalByStatus = {
    pending: 0, completed: 0, cancelled: 0, refunded: 0,
  };
  const { data: completedCount } = await supabaseAdmin.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'completed');
  const { data: pendingCount } = await supabaseAdmin.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'pending');
  const { data: cancelledCount } = await supabaseAdmin.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'cancelled');
  const { data: refundedCount } = await supabaseAdmin.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'refunded');
  totalByStatus.completed = completedCount?.length || 0;
  totalByStatus.pending = pendingCount?.length || 0;
  totalByStatus.cancelled = cancelledCount?.length || 0;
  totalByStatus.refunded = refundedCount?.length || 0;

  return res.status(200).json({
    totalRevenue,
    gameSalesTotal,
    donationTotal,
    directDonationTotal,
    revenueByPeriod: Object.values(revenueByPeriod).sort((a, b) => a.date.localeCompare(b.date)).slice(-90),
    topRequests,
    topGames,
    totalByStatus,
    totalTransactions: totalByStatus.pending + totalByStatus.completed + totalByStatus.cancelled + totalByStatus.refunded,
  });
}