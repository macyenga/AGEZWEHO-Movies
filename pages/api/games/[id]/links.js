import { supabaseAdmin } from '../../../../lib/server/supabase-admin';
import {
  getRequestUser,
  resolvePremiumAccessForUser,
  checkUserGameAccess,
} from '../../../../lib/server/premium-access';
import {
  normalizePremiumLinks,
  sanitizeHttpUrl,
} from '../../../../lib/premium-content';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Cache-Control', 'private, no-store, max-age=0');

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid item ID' });
  }

  const user = await getRequestUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in required' });

  const { data: game, error: gameError } = await supabaseAdmin
    .from('games')
    .select('id,title,type,links,video_url,premium,price,uploader_id,status')
    .eq('id', id)
    .single();

  if (gameError || !game) return res.status(404).json({ error: 'Content not found' });

  const accessContext = await resolvePremiumAccessForUser(user);

  if (
    game.status &&
    game.status !== 'approved' &&
    !accessContext.isAdmin &&
    String(game.uploader_id || '') !== String(user.id)
  ) {
    return res.status(404).json({ error: 'Content not found' });
  }

  const access = checkUserGameAccess(accessContext, game);
  if (!access.unlocked) {
    return res.status(403).json({
      error: accessContext.hasPendingPayment
        ? 'Your payment is pending admin approval.'
        : 'Paid and approved membership or unlock required.',
      accessState: accessContext.hasPendingPayment ? 'pending_approval' : 'payment_required',
    });
  }

  return res.status(200).json({
    unlocked: true,
    accessSource: access.reason,
    video_url: sanitizeHttpUrl(game.video_url),
    links: normalizePremiumLinks(game.links),
  });
}
