export const WATCHLIST_STORAGE_KEY = 'agasobanuye_watchlist';
export const LEGACY_COLLECTION_KEY = 'agezweho_collection';

export function normalizeWatchlistMovie(movie, now = Date.now()) {
  if (!movie || !movie.id) return null;
  return {
    id: movie.id,
    title: movie.title || 'Untitled',
    poster_url: movie.poster_url || null,
    type: movie.type || 'Movie',
    year: movie.year || null,
    rating: movie.rating ?? null,
    genre: movie.genre || null,
    language: movie.language || null,
    savedAt: typeof movie.savedAt === 'number' ? movie.savedAt : now,
  };
}

export function parseStoredWatchlist(raw) {
  if (!raw || typeof raw !== 'string') return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set();
    const result = [];
    for (const item of parsed) {
      const normalized = normalizeWatchlistMovie(item);
      if (!normalized || seen.has(normalized.id)) continue;
      seen.add(normalized.id);
      result.push(normalized);
    }
    return result;
  } catch {
    return [];
  }
}

export function isMovieInWatchlist(list, id) {
  if (!Array.isArray(list) || !id) return false;
  return list.some((m) => m && m.id === id);
}

export function addMovieToWatchlist(list, movie, now = Date.now()) {
  const safeList = Array.isArray(list) ? list : [];
  const normalized = normalizeWatchlistMovie(movie, now);
  if (!normalized) return safeList;
  if (isMovieInWatchlist(safeList, normalized.id)) return safeList;
  return [normalized, ...safeList];
}

export function removeMovieFromWatchlist(list, id) {
  const safeList = Array.isArray(list) ? list : [];
  if (!id) return safeList;
  return safeList.filter((m) => m && m.id !== id);
}

export function toggleWatchlistItem(list, movie, now = Date.now()) {
  const safeList = Array.isArray(list) ? list : [];
  if (!movie || !movie.id) return safeList;
  if (isMovieInWatchlist(safeList, movie.id)) {
    return removeMovieFromWatchlist(safeList, movie.id);
  }
  return addMovieToWatchlist(safeList, movie, now);
}

export function readWatchlistFromStorage(storage) {
  if (!storage || typeof storage.getItem !== 'function') return [];
  try {
    const primary = parseStoredWatchlist(storage.getItem(WATCHLIST_STORAGE_KEY));
    if (primary.length > 0) return primary;
    const legacy = parseStoredWatchlist(storage.getItem(LEGACY_COLLECTION_KEY));
    return legacy;
  } catch {
    return [];
  }
}

export function writeWatchlistToStorage(storage, list) {
  if (!storage || typeof storage.setItem !== 'function') return;
  const payload = JSON.stringify(Array.isArray(list) ? list : []);
  try {
    storage.setItem(WATCHLIST_STORAGE_KEY, payload);
    storage.setItem(LEGACY_COLLECTION_KEY, payload);
  } catch {
    // Ignore storage quota or private mode errors
  }
}
