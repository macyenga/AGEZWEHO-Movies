import { supabaseAdmin } from '../../../lib/server/supabase-admin';
import { UPCOMING_MOVIES } from '../../../lib/coming-soon';
import { mergeTitleSuggestions, normalizeMediaType, extractYear } from '../../../lib/requests-helpers';

const OMDB_API_KEY = process.env.OMDB_API_KEY;

async function fetchOmdbJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3200);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const query = String(req.query.q || '').trim();
  const typeFilter = String(req.query.type || 'All').trim();
  const imdbId = String(req.query.imdbId || '').trim();

  // Optional detail hydration when a user selects an OMDb item
  if (imdbId && OMDB_API_KEY) {
    const detail = await fetchOmdbJson(
      `https://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&apikey=${encodeURIComponent(OMDB_API_KEY)}`
    );
    if (detail && detail.Response !== 'False') {
      return res.status(200).json({
        detail: {
          imdb_id: detail.imdbID || imdbId,
          title: detail.Title || '',
          year: extractYear(detail.Year),
          type: normalizeMediaType(detail.Type),
          language: detail.Language && detail.Language !== 'N/A' ? detail.Language.split(',')[0].trim() : '',
          genre: detail.Genre && detail.Genre !== 'N/A' ? detail.Genre : '',
          poster_url: detail.Poster && detail.Poster !== 'N/A' ? detail.Poster : '',
          overview: detail.Plot && detail.Plot !== 'N/A' ? detail.Plot : '',
        },
      });
    }
    return res.status(200).json({ detail: null });
  }

  if (query.length < 2) {
    return res.status(200).json({ suggestions: [], query, source: 'idle' });
  }

  try {
    const omdbTypeParam =
      typeFilter === 'Movie' ? '&type=movie' : typeFilter === 'Series' ? '&type=series' : '';

    const [moviesRes, comingSoonRes, requestsRes, omdbData] = await Promise.all([
      supabaseAdmin
        .from('movies')
        .select('id, title, year, type, language, genre, poster_url, overview')
        .eq('status', 'approved'),
      supabaseAdmin
        .from('coming_soon')
        .select('id, title, releaseDate, type, language, genre, poster_url, overview'),
      supabaseAdmin
        .from('requests')
        .select('id, title, year, type, language, votes, fulfilled, poster_url'),
      OMDB_API_KEY
        ? fetchOmdbJson(
            `https://www.omdbapi.com/?s=${encodeURIComponent(query)}${omdbTypeParam}&apikey=${encodeURIComponent(OMDB_API_KEY)}`
          )
        : Promise.resolve(null),
    ]);

    const omdbResults = Array.isArray(omdbData?.Search) ? omdbData.Search.slice(0, 8) : [];
    const comingSoonList =
      Array.isArray(comingSoonRes.data) && comingSoonRes.data.length > 0
        ? comingSoonRes.data
        : UPCOMING_MOVIES;

    const suggestions = mergeTitleSuggestions({
      query,
      typeFilter,
      catalogMovies: moviesRes.data || [],
      comingSoonMovies: comingSoonList,
      existingRequests: requestsRes.data || [],
      omdbResults,
      limit: 8,
    });

    return res.status(200).json({
      query,
      suggestions,
      source: omdbResults.length > 0 ? 'omdb+catalog' : 'catalog',
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Title lookup failed' });
  }
}
