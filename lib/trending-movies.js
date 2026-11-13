/**
 * Pure helpers for selecting and formatting the top most-viewed trending movies.
 */

export function getMovieViews(movie) {
  if (!movie || typeof movie !== 'object') return 0;
  const raw = movie.views ?? movie.view_count ?? 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

export function getTopTrendingMovies(movies, limit = 5) {
  if (!Array.isArray(movies) || movies.length === 0 || limit <= 0) {
    return [];
  }

  return movies
    .filter((movie) => movie && typeof movie === 'object' && movie.id && movie.title)
    .slice()
    .sort((a, b) => {
      const viewsDiff = getMovieViews(b) - getMovieViews(a);
      if (viewsDiff !== 0) return viewsDiff;

      const ratingA = Number.parseFloat(a.rating) || 0;
      const ratingB = Number.parseFloat(b.rating) || 0;
      if (ratingB !== ratingA) return ratingB - ratingA;

      const timeA = Date.parse(a.created_at || '') || 0;
      const timeB = Date.parse(b.created_at || '') || 0;
      return timeB - timeA;
    })
    .slice(0, limit);
}

export function formatViewCount(views) {
  const count = Number.isFinite(Number(views)) ? Math.max(0, Math.floor(Number(views))) : 0;
  if (count >= 1_000_000) {
    const val = (count / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${val}M views`;
  }
  if (count >= 1_000) {
    const val = (count / 1_000).toFixed(1).replace(/\.0$/, '');
    return `${val}K views`;
  }
  return `${count} ${count === 1 ? 'view' : 'views'}`;
}

export function getHighQualityThumbnailUrl(url, minWidth = 900) {
  if (typeof url !== 'string' || !url.trim()) return '';
  const trimmed = url.trim();
  if (!trimmed.includes('images.unsplash.com')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const currentWidth = Number.parseInt(parsed.searchParams.get('w') || '0', 10);
    if (!Number.isFinite(currentWidth) || currentWidth < minWidth) {
      parsed.searchParams.set('w', String(minWidth));
    }
    parsed.searchParams.set('q', '85');
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    return parsed.toString();
  } catch {
    return trimmed;
  }
}
