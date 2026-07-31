import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { requireAdmin } from '../../../lib/server/admin-auth';

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Item ID required' });
    if (!status) return res.status(400).json({ error: 'Status required' });

    const { data, error } = await supabaseAdmin
      .from('shop')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ item: data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Item ID required' });

    const { error } = await supabaseAdmin.from('shop').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
