import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';
import { getVoteBoost } from '../../../lib/server/transactions';

async function syncRequestFromDonation(requestId, amount, direction) {
  if (!requestId || !amount) return;
  const { data: request } = await supabaseAdmin
    .from('requests')
    .select('votes, donation_total')
    .eq('id', requestId)
    .single();
  if (!request) return;

  const boost = getVoteBoost(amount);
  const delta = direction === 'add' ? 1 : -1;
  await supabaseAdmin
    .from('requests')
    .update({
      votes: Math.max(0, (request.votes || 0) + delta * boost),
      donation_total: Math.max(0, (request.donation_total || 0) + delta * amount),
    })
    .eq('id', requestId);
}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === 'POST') {
    const { donor_name, amount, phone_last4, request_id, movie_id, confirmed = true } = req.body || {};
    const parsedAmount = parseInt(amount, 10);
    if (!parsedAmount || parsedAmount < 1) {
      return res.status(400).json({ error: 'Valid donation amount (RWF) is required' });
    }

    const isConfirmed = Boolean(confirmed);
    const { data, error } = await supabaseAdmin
      .from('donations')
      .insert([{
        donor_name: donor_name || 'Anonymous',
        amount: parsedAmount,
        phone_last4: phone_last4 || null,
        request_id: request_id || null,
        movie_id: movie_id || null,
        confirmed: isConfirmed,
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    if (isConfirmed && request_id) {
      await syncRequestFromDonation(request_id, parsedAmount, 'add');
    }

    return res.status(201).json({ donation: data });
  }

  if (req.method === 'PATCH') {
    const { id, confirmed } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Donation ID required' });
    if (typeof confirmed !== 'boolean') {
      return res.status(400).json({ error: 'confirmed must be true or false' });
    }

    const { data: existing } = await supabaseAdmin.from('donations').select('*').eq('id', id).single();
    if (!existing) return res.status(404).json({ error: 'Donation not found' });

    const { data, error } = await supabaseAdmin
      .from('donations')
      .update({ confirmed })
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });

    if (existing.confirmed !== confirmed && existing.request_id) {
      await syncRequestFromDonation(existing.request_id, existing.amount, confirmed ? 'add' : 'subtract');
    }

    return res.status(200).json({ donation: data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Donation ID required' });

    const { data: existing } = await supabaseAdmin.from('donations').select('*').eq('id', id).single();
    if (!existing) return res.status(404).json({ error: 'Donation not found' });

    const { error } = await supabaseAdmin.from('donations').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });

    if (existing.confirmed && existing.request_id) {
      await syncRequestFromDonation(existing.request_id, existing.amount, 'subtract');
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
