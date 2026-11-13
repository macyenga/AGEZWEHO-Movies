export const MOVIE_CATEGORIES = [
  'Action',
  'Comedy',
  'Drama',
  'Thriller',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Fantasy',
  'Animation',
  'Adventure',
  'Crime',
  'Mystery',
];

/**
 * Splits a comma-separated genre string into normalized, trimmed category tokens.
 */
export function parseMovieGenres(genreStr) {
  if (!genreStr || typeof genreStr !== 'string') return [];
  return genreStr
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);
}

/**
 * Checks whether a movie belongs to a given category/genre (case-insensitive).
 */
export function movieMatchesCategory(movie, category) {
  if (!category || category === 'All') return true;
  const target = category.trim().toLowerCase();
  const genres = parseMovieGenres(movie?.genre);
  return genres.some((g) => g.toLowerCase() === target || g.toLowerCase().includes(target));
}

/**
 * Filters movies and series by search query, content type, and category/genre.
 */
export function filterMovies(movies = [], { query = '', type = 'All', category = 'All' } = {}) {
  if (!Array.isArray(movies)) return [];
  const q = String(query || '').trim().toLowerCase();
  const activeType = type || 'All';
  const activeCategory = category || 'All';

  return movies.filter((m) => {
    const matchesQuery =
      !q ||
      String(m.title || '').toLowerCase().includes(q) ||
      String(m.genre || '').toLowerCase().includes(q) ||
      String(m.language || '').toLowerCase().includes(q);
    const matchesType = activeType === 'All' || m.type === activeType;
    const matchesCat = movieMatchesCategory(m, activeCategory);
    return matchesQuery && matchesType && matchesCat;
  });
}

/**
 * Computes item counts per category respecting active query and type filters.
 */
export function getCategoryCounts(movies = [], categories = MOVIE_CATEGORIES, { query = '', type = 'All' } = {}) {
  const base = filterMovies(movies, { query, type, category: 'All' });
  const counts = { All: base.length };
  for (const cat of categories) {
    counts[cat] = base.filter((m) => movieMatchesCategory(m, cat)).length;
  }
  return counts;
}

/**
 * Ranks movies and series by title match relevance for global search.
 * Prefix title matches rank highest, followed by substring title matches, then genre/overview matches.
 */
export function searchTitles(items = [], query = '', limit = 8) {
  if (!Array.isArray(items)) return [];
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];

  const scored = [];
  for (const item of items) {
    const title = String(item?.title || '').toLowerCase();
    const genre = String(item?.genre || '').toLowerCase();
    const overview = String(item?.overview || '').toLowerCase();

    let score = 0;
    if (title === q) score = 100;
    else if (title.startsWith(q)) score = 80;
    else if (title.includes(q)) score = 60;
    else if (genre.includes(q)) score = 30;
    else if (overview.includes(q)) score = 10;

    if (score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score || String(a.item.title || '').localeCompare(String(b.item.title || '')));
  return scored.slice(0, limit).map((entry) => entry.item);
}
