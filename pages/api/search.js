import { supabaseAdmin } from '../../lib/server/supabase-admin';
import {
  getRequestUser,
  resolvePremiumAccessForUser,
  checkUserGameAccess,
} from '../../lib/server/premium-access';
import { sanitizeGameForGate } from '../../lib/premium-content';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Query required' });

  const like = `%${q}%`;

  const user = await getRequestUser(req);
  const accessContext = user ? await resolvePremiumAccessForUser(user) : null;

  const [movies, games, news, shop] = await Promise.all([
    supabaseAdmin
      .from('movies')
      .select('id, title, year, poster_url, genre, rating, language, overview, status, type')
      .eq('status', 'approved')
      .or(`title.ilike.${like},genre.ilike.${like},overview.ilike.${like}`)
      .limit(12),
    accessContext
      ? supabaseAdmin
          .from('games')
          .select('id, title, type, category, cover_url, status, premium, price, uploader_id, video_url')
          .eq('status', 'approved')
          .or(`title.ilike.${like},overview.ilike.${like}`)
          .limit(10)
      : Promise.resolve({ data: [] }),
    supabaseAdmin
      .from('news')
      .select('id, title, content, category, image_url, author_name, status')
      .or(`title.ilike.${like},content.ilike.${like}`)
      .limit(10),
    supabaseAdmin
      .from('shop')
      .select('id, title, price, image_url, category, seller_name, status')
      .or(`title.ilike.${like},description.ilike.${like}`)
      .limit(10),
  ]);

  const visibleGames = accessContext
    ? (games.data || [])
        .filter((item) => checkUserGameAccess(accessContext, item).unlocked)
        .map((item) => sanitizeGameForGate(item, { includePrivateMedia: false }))
    : [];

  return res.status(200).json({
    movies: movies.data || [],
    games: visibleGames,
    news: news.data || [],
    shop: shop.data || [],
  });
}
