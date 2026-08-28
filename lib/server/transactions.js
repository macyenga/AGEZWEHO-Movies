import { supabaseAdmin } from './supabase-admin';

export function getVoteBoost(amount) {
  return Math.max(1, Math.floor(Number(amount || 0) / 50));
}

export async function completeTransaction(txRef, providerReference) {
  const { data: tx, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('tx_ref', txRef)
    .single();

  if (error || !tx) {
    return { error: 'Transaction not found', status: 404 };
  }

  if (tx.status === 'completed') {
    return { transaction: tx, alreadyCompleted: true };
  }

  if (tx.status !== 'pending') {
    return { error: `Transaction already ${tx.status}`, status: 400 };
  }

  const { data: completed, error: updateError } = await supabaseAdmin
    .from('transactions')
    .update({ status: 'completed', provider_reference: providerReference || `completed_${txRef}` })
    .eq('id', tx.id)
    .eq('status', 'pending')
    .select()
    .single();

  if (updateError) {
    // Webhook and polling may have raced to complete it - re-read current state.
    const { data: current } = await supabaseAdmin
      .from('transactions')
      .select('status')
      .eq('id', tx.id)
      .single();
    if (current?.status === 'completed') {
      return { transaction: { ...tx, status: 'completed' }, alreadyCompleted: true };
    }
    return { error: updateError.message, status: 500 };
  }

  if (tx.request_id) {
    const { data: request } = await supabaseAdmin
      .from('requests')
      .select('votes, donation_total')
      .eq('id', tx.request_id)
      .single();

    if (request) {
      await supabaseAdmin
        .from('requests')
        .update({
          votes: (request.votes || 0) + getVoteBoost(tx.amount),
          donation_total: (request.donation_total || 0) + tx.amount,
        })
        .eq('id', tx.request_id);

      await supabaseAdmin.from('donations').insert([{
        request_id: tx.request_id,
        donor_name: 'Payment Confirmed',
        amount: tx.amount,
        phone_last4: tx.phone ? String(tx.phone).slice(-4) : null,
        confirmed: true,
      }]);
    }
  }

  if (tx.game_id && tx.user_id) {
    await supabaseAdmin
      .from('premium_access_requests')
      .upsert([{
        user_id: tx.user_id,
        game_id: tx.game_id,
        status: 'approved',
      }], { onConflict: 'user_id,game_id' });
  }

  if (tx.movie_id) {
    const uploaderShare = Math.floor((tx.amount || 0) / 2);
    const { data: movie } = await supabaseAdmin
      .from('movies')
      .select('uploader_earnings')
      .eq('id', tx.movie_id)
      .single();
    if (movie) {
      await supabaseAdmin
        .from('movies')
        .update({ uploader_earnings: (movie.uploader_earnings || 0) + uploaderShare })
        .eq('id', tx.movie_id);
    }
    await supabaseAdmin.from('donations').insert([{
      movie_id: tx.movie_id,
      donor_name: 'Payment Confirmed',
      amount: tx.amount,
      phone_last4: tx.phone ? String(tx.phone).slice(-4) : null,
      confirmed: true,
    }]);
  }

  if (!tx.request_id && !tx.game_id && !tx.movie_id) {
    await supabaseAdmin.from('donations').insert([{
      donor_name: 'Payment Confirmed',
      amount: tx.amount,
      phone_last4: tx.phone ? String(tx.phone).slice(-4) : null,
      confirmed: true,
    }]);
  }

  if (tx.user_id) {
    const { data: subs, error: subsError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('tx_ref', txRef)
      .eq('status', 'pending');
    if (!subsError && subs) {
      for (const sub of subs) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + (sub.months || 1));
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'active',
            approved_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
          })
          .eq('id', sub.id)
          .eq('status', 'pending');
      }
    }
  }

  return { transaction: completed };
}
