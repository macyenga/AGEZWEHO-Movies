import { createHmac, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'buffer';
import { completeTransaction } from '../../../lib/server/transactions';
import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { getRwandaPayCollectionStatus } from '../../../lib/server/payments';

export const config = { api: { bodyParser: false } };

const RWANDA_PAY_WEBHOOK_SECRET = process.env.RWANDA_PAY_WEBHOOK_SECRET;

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString();
}

function verifyHmac(rawBody, signature, secret) {
  if (!secret || !signature) return false;
  try {
    const expected = createHmac('sha256', secret).update(rawBody).digest('base64');
    const a = Buffer.from(expected);
    const b = Buffer.from(String(signature).trim());
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// Find the pending transaction behind a RwandaPay webhook notification.
// The webhook carries the provider-side paypack_reference; our transactions store the
// collection reference (provider_reference). We poll each recent candidate collection
// and confirm the paypack_reference matches before completing it.
async function findTransactionForWebhook({ paypackReference, amount }) {
  if (!paypackReference) return null;

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('status', 'pending')
    .not('provider_reference', 'is', null)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error || !data || data.length === 0) return null;

  const amountCandidates = amount ? data.filter(t => Number(t.amount) === Number(amount)) : [];
  const candidates = amountCandidates.length > 0 ? amountCandidates : data;

  for (const tx of candidates) {
    const status = await getRwandaPayCollectionStatus(tx.provider_reference);
    if (
      status &&
      (status.paypack_reference === paypackReference || status.reference === paypackReference)
    ) {
      return tx;
    }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const rawBody = await parseBody(req);
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  // ── RwandaPay webhook (HMAC-SHA256 signed, X-Webhook-Signature header) ──
  const isRwandaPayHook = body.event_kind === 'transaction:processed' || body.paypack_reference || body.event === 'payment.successful';

  if (!isRwandaPayHook) {
    return res.status(200).json({ status: 'received' });
  }

  if (!verifyHmac(rawBody, req.headers['x-webhook-signature'], RWANDA_PAY_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'invalid signature' });
  }

  const { status } = body;
  const paypackReference = body.paypack_reference;
  const amount = Number(body.amount) || undefined;

  if (status === 'successful') {
    try {
      const tx = await findTransactionForWebhook({ paypackReference, amount });
      if (tx?.tx_ref) await completeTransaction(tx.tx_ref, paypackReference);
    } catch (err) {
      console.error('RwandaPay webhook processing error:', err);
    }
  } else if (status === 'failed' && paypackReference) {
    try {
      const tx = await findTransactionForWebhook({ paypackReference, amount });
      if (tx?.id) {
        await supabaseAdmin
          .from('transactions')
          .update({ status: 'failed', provider_reference: tx.provider_reference })
          .eq('id', tx.id);
      }
    } catch {
      // best-effort housekeeping
    }
  }

  return res.status(200).json({ status: 'success' });
}