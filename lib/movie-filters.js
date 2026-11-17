import { normalizeBaseRatingToFiveScale } from './ratings.js';

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

export const RATING_FILTER_OPTIONS = [
  { value: '4.5', minStars: 4.5, label: '4.5+' },
  { value: '4.0', minStars: 4.0, label: '4.0+' },
  { value: '3.5', minStars: 3.5, label: '3.5+' },
  { value: '3.0', minStars: 3.0, label: '3.0+' },
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
 * Extracts unique 4-digit release years from a movie list, sorted newest first.
 */
export function getMovieFilterYears(movies = []) {
  if (!Array.isArray(movies)) return [];
  const years = new Set();
  for (const m of movies) {
    const raw = m?.year !== null && m?.year !== undefined ? String(m.year).trim() : '';
    const match = raw.match(/\b(19\d{2}|20\d{2})\b/);
    if (match) {
      years.add(match[1]);
    }
  }
  return Array.from(years).sort((a, b) => Number(b) - Number(a));
}

/**
 * Checks whether a movie matches a selected release year ('All' or empty matches everything).
 */
export function movieMatchesYear(movie, year) {
  if (!year || year === 'All') return true;
  const targetYear = String(year).trim();
  const raw = movie?.year !== null && movie?.year !== undefined ? String(movie.year).trim() : '';
  return raw === targetYear || raw.includes(targetYear);
}

/**
 * Checks whether a movie's rating meets or exceeds the minimum 5-star threshold.
 * Accepts either 5-point or 10-point ratings (10-point ratings > 5 are converted to 5-star scale).
 */
export function movieMatchesMinRating(movie, minRating) {
  if (!minRating || minRating === 'All') return true;
  const threshold = Number.parseFloat(minRating);
  if (!Number.isFinite(threshold) || threshold <= 0) return true;
  const fiveStar = normalizeBaseRatingToFiveScale(movie?.rating);
  if (fiveStar === null) return false;
  return fiveStar >= threshold;
}

/**
 * Filters movies and series by search query, content type, category/genre, year, and minimum rating.
 */
export function filterMovies(
  movies = [],
  { query = '', type = 'All', category = 'All', year = 'All', minRating = 'All' } = {}
) {
  if (!Array.isArray(movies)) return [];
  const q = String(query || '').trim().toLowerCase();
  const activeType = type || 'All';
  const activeCategory = category || 'All';
  const activeYear = year || 'All';
  const activeMinRating = minRating || 'All';

  return movies.filter((m) => {
    const matchesQuery =
      !q ||
      String(m.title || '').toLowerCase().includes(q) ||
      String(m.genre || '').toLowerCase().includes(q) ||
      String(m.language || '').toLowerCase().includes(q) ||
      String(m.year || '').toLowerCase().includes(q);
    const matchesType = activeType === 'All' || m.type === activeType;
    const matchesCat = movieMatchesCategory(m, activeCategory);
    const matchesYear = movieMatchesYear(m, activeYear);
    const matchesRating = movieMatchesMinRating(m, activeMinRating);
    return matchesQuery && matchesType && matchesCat && matchesYear && matchesRating;
  });
}

/**
 * Computes item counts per category respecting active query, type, year, and rating filters.
 */
export function getCategoryCounts(
  movies = [],
  categories = MOVIE_CATEGORIES,
  { query = '', type = 'All', year = 'All', minRating = 'All' } = {}
) {
  const base = filterMovies(movies, { query, type, category: 'All', year, minRating });
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
