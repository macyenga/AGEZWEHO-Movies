import { createHmac, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'buffer';
import { completeTransaction } from '../../../lib/server/transactions';
import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { getRwandaPayCollectionStatus, verifyCheckoutPayment } from '../../../lib/server/payments';

export const config = { api: { bodyParser: false } };

const RWANDA_PAY_WEBHOOK_SECRET = process.env.RWANDA_PAY_WEBHOOK_SECRET;

// In-memory dedup for event_id (docs: use event_id to deduplicate, webhooks may retry 3x)
// Bounded to 1000 entries to avoid leak
const seenEventIds = new Set();
function isDuplicateEvent(eventId) {
  if (!eventId) return false;
  if (seenEventIds.has(eventId)) return true;
  seenEventIds.add(eventId);
  if (seenEventIds.size > 1000) {
    const first = seenEventIds.values().next().value;
    seenEventIds.delete(first);
  }
  return false;
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString();
}

// Docs: https://rwandapay.rw/docs#webhook-security
// PHP: base64_encode(hash_hmac('sha256', $rawBody, $secret, true))
// Node: crypto.createHmac('sha256', secret).update(rawBody).digest('base64')
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

// Map webhook -> pending transaction
// Webhook carries paypack_reference (provider id). Our DB stores provider_reference
// (COL-* or AGZ_*). We poll recent pending collections/checkouts to find the one
// whose paypack_reference or reference matches the webhook.
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

  const amountCandidates = amount ? data.filter((t) => Number(t.amount) === Number(amount)) : [];
  const candidates = amountCandidates.length > 0 ? amountCandidates : data;

  for (const tx of candidates) {
    // Try collection status first (most common)
    try {
      const colStatus = await getRwandaPayCollectionStatus(tx.provider_reference);
      if (colStatus && (colStatus.paypack_reference === paypackReference || colStatus.reference === paypackReference)) {
        return tx;
      }
    } catch {}
    // Fallback: checkout verify (for AGZ_* tx_refs via checkout)
    try {
      const chk = await verifyCheckoutPayment(tx.provider_reference);
      // verify payload doesn't expose paypack_reference directly; use reference matching
      if (chk && chk.reference === paypackReference) return tx;
    } catch {}
  }

  // Last resort: if only one candidate with exact amount, assume it's the match
  // (webhook retries may arrive before paypack_reference is queryable)
  if (candidates.length === 1 && Number(candidates[0].amount) === Number(amount)) {
    return candidates[0];
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

  // ── RwandaPay webhook per https://rwandapay.rw/docs#webhooks-overview ──
  // Events: transaction:processed (primary), payment.successful, payment.failed
  const eventKind = body.event_kind || body.event || '';
  const isRwandaPayHook =
    eventKind === 'transaction:processed' ||
    eventKind === 'payment.successful' ||
    eventKind === 'payment.failed' ||
    !!body.paypack_reference;

  if (!isRwandaPayHook) {
    // Not a RwandaPay event — ack to avoid retries
    return res.status(200).json({ status: 'received' });
  }

  // Dedup via event_id (docs: use event_id to deduplicate)
  const eventId = body.event_id || body.id || null;
  if (eventId && isDuplicateEvent(eventId)) {
    return res.status(200).json({ status: 'duplicate' });
  }

  // Verify HMAC if secret is configured (docs: always verify when set)
  const signature = req.headers['x-webhook-signature'] || req.headers['X-Webhook-Signature'] || '';
  if (RWANDA_PAY_WEBHOOK_SECRET) {
    if (!verifyHmac(rawBody, signature, RWANDA_PAY_WEBHOOK_SECRET)) {
      return res.status(401).json({ error: 'invalid signature' });
    }
  }

  const status = body.status;
  const paypackReference = body.paypack_reference || body.reference || null;
  const amount = Number(body.amount) || undefined;
  const network = body.network || body.provider || null;

  // Successful payment — complete the matched transaction
  if (status === 'successful') {
    try {
      const tx = await findTransactionForWebhook({ paypackReference, amount });
      if (tx?.tx_ref) {
        await completeTransaction(tx.tx_ref, paypackReference || tx.provider_reference);
      } else if (amount && network) {
        // Edge: checkout webhook without paypack mapping — try latest pending with same amount
        console.warn('RwandaPay webhook: no matching transaction for', { paypackReference, amount, eventId });
      }
    } catch (err) {
      console.error('RwandaPay webhook processing error:', err);
    }
  } else if (status === 'failed' && paypackReference) {
    try {
      const tx = await findTransactionForWebhook({ paypackReference, amount });
      if (tx?.id) {
        await supabaseAdmin
          .from('transactions')
          .update({ status: 'failed' })
          .eq('id', tx.id)
          .eq('status', 'pending');
      }
    } catch {
      // best-effort
    }
  }

  // Always 2xx — docs: non-2xx triggers 3 retries
  return res.status(200).json({ status: 'success' });
}
