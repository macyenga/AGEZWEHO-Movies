import { requireAdmin } from '../../../lib/server/admin-auth';
import { completeTransaction } from '../../../lib/server/transactions';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!(await requireAdmin(req, res))) return;

  const { tx_ref } = req.body;
  if (!tx_ref) return res.status(400).json({ error: 'tx_ref required' });

  const result = await completeTransaction(tx_ref, `admin_${tx_ref}`);
  if (result.error) return res.status(result.status || 500).json({ error: result.error });

  return res.status(200).json({ status: 'confirmed' });
}
