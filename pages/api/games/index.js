import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import {
  getRequestUser,
  resolvePremiumAccessForUser,
  checkUserGameAccess,
} from '../../../lib/server/premium-access';
import { sanitizeGameForGate, sanitizeGamePreviewForGate } from '../../../lib/premium-content';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Cache-Control', 'private, no-store, max-age=0');

  const { data, error } = await supabaseAdmin
    .from('games')
    .select('id,title,type,category,version,rating,cover_url,overview,premium,price,links,video_url,uploader_id,status,created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const allApproved = Array.isArray(data) ? data : [];
  const stats = {
    totalCount: allApproved.length,
    videoCount: allApproved.filter((item) => Boolean(item.video_url)).length,
  };
  const previews = allApproved
    .map((item) => sanitizeGamePreviewForGate(item))
    .filter(Boolean);

  const user = await getRequestUser(req);
  if (!user) {
    return res.status(200).json({
      authorized: false,
      accessState: 'unauthenticated',
      games: [],
      previews,
      stats,
    });
  }

  const accessContext = await resolvePremiumAccessForUser(user);

  if (accessContext.hasGlobalAccess) {
    const games = allApproved.map((item) =>
      sanitizeGameForGate(item, { includePrivateMedia: false })
    );
    return res.status(200).json({
      authorized: true,
      accessState: accessContext.isAdmin
        ? 'admin'
        : accessContext.isPro
        ? 'pro'
        : 'approved',
      games,
      previews: [],
      stats,
    });
  }

  // Per-item unlocks or creator's own approved uploads
  const unlockedIds = new Set();
  const unlockedItems = allApproved.filter((item) => {
    const ok = checkUserGameAccess(accessContext, item).unlocked;
    if (ok) unlockedIds.add(item.id);
    return ok;
  });

  if (unlockedItems.length > 0) {
    return res.status(200).json({
      authorized: true,
      accessState: 'partial',
      lockedCount: Math.max(0, allApproved.length - unlockedItems.length),
      hasPendingPayment: accessContext.hasPendingPayment,
      games: unlockedItems.map((item) =>
        sanitizeGameForGate(item, { includePrivateMedia: false })
      ),
      previews: previews.filter((item) => !unlockedIds.has(item.id)),
      stats,
    });
  }

  return res.status(200).json({
    authorized: false,
    accessState: accessContext.hasPendingPayment ? 'pending_approval' : 'payment_required',
    games: [],
    previews,
    stats,
  });
}
