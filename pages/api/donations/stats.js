import { supabaseAdmin } from '../../../lib/server/supabase-admin';

const MONTHLY_GOAL = parseInt(process.env.MONTHLY_DONATION_GOAL || '100000', 10);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: monthDonations } = await supabaseAdmin
    .from('donations')
    .select('amount')
    .gte('created_at', startOfMonth)
    .eq('confirmed', true);

  const { data: allDonations } = await supabaseAdmin
    .from('donations')
    .select('amount, donor_name, request_id')
    .eq('confirmed', true)
    .order('amount', { ascending: false })
    .limit(20);

  const monthlyTotal = (monthDonations || []).reduce((sum, d) => sum + (d.amount || 0), 0);

  const topDonors = (allDonations || [])
    .filter(d => d.donor_name && d.donor_name !== 'Anonymous (Auto-confirmed)')
    .reduce((acc, d) => {
      const existing = acc.find(a => a.name === d.donor_name);
      if (existing) existing.total += d.amount || 0;
      else acc.push({ name: d.donor_name, total: d.amount || 0 });
      return acc;
    }, [])
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const { count: donorCount } = await supabaseAdmin
    .from('donations')
    .select('*', { count: 'exact', head: true })
    .eq('confirmed', true);

  return res.status(200).json({
    monthlyTotal,
    monthlyGoal: MONTHLY_GOAL,
    totalDonors: donorCount || 0,
    topDonors,
  });
}
