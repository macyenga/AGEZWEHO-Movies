import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';
import { getVoteBoost } from '../../../lib/server/transactions';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!(await requireAdmin(req, res))) return;

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Donation ID required' });

  const { data: donation } = await supabaseAdmin.from('donations').select('*').eq('id', id).single();
  if (!donation) return res.status(404).json({ error: 'Donation not found' });
  if (donation.confirmed) return res.status(400).json({ error: 'Donation already confirmed' });

  await supabaseAdmin.from('donations').update({ confirmed: true }).eq('id', id);

  if (donation.request_id) {
    const { data: request } = await supabaseAdmin
      .from('requests')
      .select('votes, donation_total')
      .eq('id', donation.request_id)
      .single();

    if (request) {
      await supabaseAdmin
        .from('requests')
        .update({
          votes: (request.votes || 0) + getVoteBoost(donation.amount),
          donation_total: (request.donation_total || 0) + donation.amount,
        })
        .eq('id', donation.request_id);
    }
  }

  return res.status(200).json({ status: 'confirmed' });
}
