import { Buffer } from 'buffer';
import { completeTransaction } from '../../../lib/server/transactions';

export const config = { api: { bodyParser: false } };

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agezweho.com';

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString();
}

function isValidOrigin(req) {
  const origin = req.headers['origin'] || req.headers['referer'] || '';
  return !origin || origin.startsWith(SITE_URL) || origin.startsWith('http://localhost');
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

  if (body.event === 'payment.completed' || body.status === 'completed') {
    if (!WEBHOOK_SECRET || req.headers['x-webhook-secret'] !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const txRef = body.tx_ref || body.reference || body.transaction_id;
    const providerId = String(body.id || body.transaction_id || txRef);
    if (txRef) await completeTransaction(txRef, providerId);

    return res.status(200).json({ status: 'success' });
  }

  if (body.event === 'local.confirm') {
    if (!WEBHOOK_SECRET || req.headers['x-webhook-secret'] !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    if (!isValidOrigin(req)) return res.status(403).json({ error: 'invalid origin' });

    if (!body.tx_ref) return res.status(400).json({ error: 'tx_ref required' });
    await completeTransaction(body.tx_ref, `local_${body.tx_ref}`);

    return res.status(200).json({ status: 'success' });
  }

  return res.status(200).json({ status: 'received' });
}
