import { supabaseAdmin } from '../../lib/server/supabase-admin';
import {
  sanitizeWatchlistItems,
  mergeWatchlists,
  addMovieToWatchlist,
  removeMovieFromWatchlist,
  toggleWatchlistItem,
} from '../../lib/watchlist';

async function authenticateRequest(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  const user = data?.user;

  if (error || !user || !user.id) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return null;
  }

  return user;
}

async function fetchProfileWatchlist(userId) {
  const { data, error } = await supabaseAdmin
    .from('user_watchlists')
    .select('items, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    items: sanitizeWatchlistItems(data?.items || []),
    updatedAt: data?.updated_at || null,
  };
}

async function saveProfileWatchlist(userId, items) {
  const sanitized = sanitizeWatchlistItems(items);
  const updatedAt = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('user_watchlists')
    .upsert(
      {
        user_id: userId,
        items: sanitized,
        updated_at: updatedAt,
      },
      { onConflict: 'user_id' }
    )
    .select('items, updated_at')
    .single();

  if (error) {
    throw error;
  }

  return {
    items: sanitizeWatchlistItems(data?.items || sanitized),
    updatedAt: data?.updated_at || updatedAt,
  };
}

export default async function handler(req, res) {
  const user = await authenticateRequest(req, res);
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const current = await fetchProfileWatchlist(user.id);
      return res.status(200).json({
        items: current.items,
        updatedAt: current.updatedAt,
        synced: true,
      });
    }

    if (req.method === 'PUT') {
      const { items, mode = 'replace' } = req.body || {};
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Watchlist items must be an array' });
      }

      let nextItems = sanitizeWatchlistItems(items);
      if (mode === 'merge') {
        const current = await fetchProfileWatchlist(user.id);
        nextItems = mergeWatchlists(nextItems, current.items);
      }

      const saved = await saveProfileWatchlist(user.id, nextItems);
      return res.status(200).json({
        items: saved.items,
        updatedAt: saved.updatedAt,
        synced: true,
      });
    }

    if (req.method === 'POST') {
      const { movie, action = 'toggle', items } = req.body || {};

      if (Array.isArray(items)) {
        const current = await fetchProfileWatchlist(user.id);
        const merged = mergeWatchlists(items, current.items);
        const saved = await saveProfileWatchlist(user.id, merged);
        return res.status(200).json({
          items: saved.items,
          updatedAt: saved.updatedAt,
          synced: true,
        });
      }

      if (!movie || !movie.id) {
        return res.status(400).json({ error: 'Movie object with id is required' });
      }

      const current = await fetchProfileWatchlist(user.id);
      let nextItems;
      if (action === 'add') {
        nextItems = addMovieToWatchlist(current.items, movie);
      } else if (action === 'remove') {
        nextItems = removeMovieFromWatchlist(current.items, movie.id);
      } else {
        nextItems = toggleWatchlistItem(current.items, movie);
      }

      const saved = await saveProfileWatchlist(user.id, nextItems);
      return res.status(200).json({
        items: saved.items,
        updatedAt: saved.updatedAt,
        synced: true,
      });
    }

    if (req.method === 'DELETE') {
      const movieId = typeof req.query?.movieId === 'string' ? req.query.movieId.trim() : '';
      let nextItems = [];
      if (movieId) {
        const current = await fetchProfileWatchlist(user.id);
        nextItems = removeMovieFromWatchlist(current.items, movieId);
      }

      const saved = await saveProfileWatchlist(user.id, nextItems);
      return res.status(200).json({
        items: saved.items,
        updatedAt: saved.updatedAt,
        synced: true,
      });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'POST', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[Watchlist API] Error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to sync watchlist' });
  }
}
