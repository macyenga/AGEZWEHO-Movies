export const REQUEST_TYPES = ['Movie', 'Series', 'Anime', 'Documentary'];

export const REQUEST_SOURCES = [
  'Telegram',
  'WhatsApp',
  'Google Search',
  'Instagram',
  'YouTube',
  'Friend',
  'Other',
];

export const CURATED_TITLE_SUGGESTIONS = [
  {
    imdb_id: 'tt10919420',
    title: 'Squid Game',
    year: '2021',
    type: 'Series',
    language: 'Korean / English',
    genre: 'Thriller, Drama',
    poster_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
    overview: 'Hundreds of cash-strapped players accept a strange invitation to compete in deadly children games for a tempting prize.',
  },
  {
    imdb_id: 'tt6468322',
    title: 'Money Heist (La Casa de Papel)',
    year: '2017',
    type: 'Series',
    language: 'Spanish / English',
    genre: 'Crime, Thriller',
    poster_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&auto=format&fit=crop&q=80',
    overview: 'An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history.',
  },
  {
    imdb_id: 'tt10698680',
    title: 'KGF: Chapter 2',
    year: '2022',
    type: 'Movie',
    language: 'Kannada / Hindi',
    genre: 'Action, Crime, Drama',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80',
    overview: 'In the blood-soaked Kolar Gold Fields, Rocky name strikes fear into his foes while allies look up to him as savior.',
  },
  {
    imdb_id: 'tt21209876',
    title: 'KGF Chapter 3',
    year: '2026',
    type: 'Movie',
    language: 'Hindi / Kinyarwanda',
    genre: 'Action, Drama',
    poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&auto=format&fit=crop&q=80',
    overview: 'Rocky Bhai returns in the next chapter of the KGF saga.',
  },
  {
    imdb_id: 'tt13927994',
    title: 'Salaar: Part 1 - Ceasefire',
    year: '2023',
    type: 'Movie',
    language: 'Telugu / Hindi',
    genre: 'Action, Drama',
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
    overview: 'The fate of a violently contested kingdom hangs on the fraught bond between two friends turned foes.',
  },
  {
    imdb_id: 'tt12735488',
    title: 'Kalki 2898 AD',
    year: '2024',
    type: 'Movie',
    language: 'Telugu / Hindi',
    genre: 'Sci-Fi, Action',
    poster_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    overview: 'A modern-day avatar of Vishnu descends to Earth to help protect the world from dark forces.',
  },
  {
    imdb_id: 'tt12004706',
    title: 'Panchayat',
    year: '2020',
    type: 'Series',
    language: 'Hindi',
    genre: 'Comedy, Drama',
    poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&auto=format&fit=crop&q=80',
    overview: 'An engineering graduate takes a reluctant job as secretary of a village panchayat in rural Uttar Pradesh.',
  },
  {
    imdb_id: 'tt4574334',
    title: 'Stranger Things',
    year: '2016',
    type: 'Series',
    language: 'English',
    genre: 'Sci-Fi, Horror, Drama',
    poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and supernatural forces.',
  },
  {
    imdb_id: 'tt21209800',
    title: 'Solo Leveling',
    year: '2024',
    type: 'Anime',
    language: 'Japanese / English',
    genre: 'Action, Fantasy, Anime',
    poster_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80',
    overview: 'A weak hunter gains a mysterious system allowing him to level up without limit.',
  },
  {
    imdb_id: 'tt2560140',
    title: 'Attack on Titan',
    year: '2013',
    type: 'Anime',
    language: 'Japanese / English',
    genre: 'Action, Drama, Anime',
    poster_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80',
    overview: 'Humanity fights for survival inside giant walled cities against towering man-eating Titans.',
  },
  {
    imdb_id: 'tt10366206',
    title: 'John Wick: Chapter 4',
    year: '2023',
    type: 'Movie',
    language: 'English',
    genre: 'Action, Crime, Thriller',
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
    overview: 'John Wick uncovers a path to defeating The High Table across Paris, Berlin, and Osaka.',
  },
  {
    imdb_id: 'tt15239678',
    title: 'Dune: Part Two',
    year: '2024',
    type: 'Movie',
    language: 'English',
    genre: 'Sci-Fi, Adventure, Drama',
    poster_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80',
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
  },
  {
    imdb_id: 'tt6263850',
    title: 'Deadpool & Wolverine',
    year: '2024',
    type: 'Movie',
    language: 'English',
    genre: 'Action, Comedy',
    poster_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80',
    overview: 'Deadpool teams up with a reluctant Wolverine to save his universe from an existential threat.',
  },
  {
    imdb_id: 'tt0903747',
    title: 'Breaking Bad',
    year: '2008',
    type: 'Series',
    language: 'English',
    genre: 'Crime, Drama, Thriller',
    poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&auto=format&fit=crop&q=80',
    overview: 'A chemistry teacher diagnosed with cancer turns to manufacturing meth to secure his family future.',
  },
  {
    imdb_id: 'tt11198330',
    title: 'House of the Dragon',
    year: '2022',
    type: 'Series',
    language: 'English',
    genre: 'Fantasy, Drama, Action',
    poster_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&auto=format&fit=crop&q=80',
    overview: 'The story of House Targaryen set 200 years before the events of Game of Thrones.',
  },
  {
    imdb_id: 'tt1630029',
    title: 'Avatar: The Way of Water',
    year: '2022',
    type: 'Movie',
    language: 'English',
    genre: 'Sci-Fi, Adventure, Action',
    poster_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    overview: 'Jake Sully and Neytiri fight to protect their family across the oceans of Pandora.',
  },
  {
    imdb_id: 'tt15398776',
    title: 'Oppenheimer',
    year: '2023',
    type: 'Movie',
    language: 'English',
    genre: 'Biography, Drama',
    poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&auto=format&fit=crop&q=80',
    overview: 'The story of American scientist J. Robert Oppenheimer and the development of the atomic bomb.',
  },
  {
    imdb_id: 'tt8111088',
    title: 'The Mandalorian',
    year: '2019',
    type: 'Series',
    language: 'English',
    genre: 'Sci-Fi, Action, Adventure',
    poster_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80',
    overview: 'The travels of a lone bounty hunter in the outer reaches of the galaxy.',
  },
  {
    imdb_id: 'rw-rocky-agent-kim-2026',
    title: 'Agasobanuye: Agent Kim Reactivated',
    year: '2026',
    type: 'Movie',
    language: 'Kinyarwanda',
    genre: 'Action, Thriller',
    poster_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&auto=format&fit=crop&q=80',
    overview: 'Rocky Kimomo returns with a high-stakes Kinyarwanda agasobanuye espionage thriller.',
  },
  {
    imdb_id: 'rw-gashya-2026-series',
    title: 'Agasobanuye Gashya 2026: Night Strike',
    year: '2026',
    type: 'Series',
    language: 'Kinyarwanda',
    genre: 'Action, Drama',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80',
    overview: 'New 2026 Kinyarwanda-translated action series packed with weekly episodes.',
  },
  {
    imdb_id: 'tt7366338',
    title: 'Chernobyl',
    year: '2019',
    type: 'Series',
    language: 'English',
    genre: 'Drama, History',
    poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    overview: 'In April 1986, an explosion at the Chernobyl nuclear power plant triggers one of the worst man-made catastrophes.',
  },
  {
    imdb_id: 'tt5491994',
    title: 'Planet Earth II',
    year: '2016',
    type: 'Documentary',
    language: 'English',
    genre: 'Documentary, Nature',
    poster_url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&auto=format&fit=crop&q=80',
    overview: 'Wildlife documentary series showcasing animals across islands, mountains, jungles, and cities.',
  },
];

export function normalizeMediaType(rawType) {
  const val = String(rawType || '').trim().toLowerCase();
  if (!val || val === 'movie' || val === 'film') return 'Movie';
  if (val === 'series' || val === 'tv' || val === 'show' || val === 'episode' || val === 'mini-series') return 'Series';
  if (val === 'anime') return 'Anime';
  if (val === 'documentary' || val === 'doc') return 'Documentary';
  return 'Movie';
}

export function normalizeTitleKey(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function extractYear(rawYear) {
  const match = String(rawYear || '').match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : String(rawYear || '').trim().slice(0, 4);
}

export function validateRequestPayload(input = {}) {
  const errors = {};
  const title = String(input.title || '').trim();
  const year = extractYear(input.year);
  const language = String(input.language || '').trim();
  const source = String(input.source || '').trim();

  if (!title) {
    errors.title = 'Movie or series title is required';
  } else if (title.length < 2) {
    errors.title = 'Title must be at least 2 characters';
  }

  if (!year) {
    errors.year = 'Release year is required';
  } else if (!/^(19|20)\d{2}$/.test(year)) {
    errors.year = 'Enter a valid 4-digit year (e.g. 2026)';
  }

  if (!language) {
    errors.language = 'Language is required';
  }

  if (!source) {
    errors.source = 'Please select where you heard about us';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function normalizeRequestPayload(input = {}) {
  const poster = String(input.poster_url || '').trim();
  const safePoster = /^https?:\/\//i.test(poster) ? poster : '';
  return {
    title: String(input.title || '').trim().slice(0, 160),
    type: normalizeMediaType(input.type),
    year: extractYear(input.year),
    language: String(input.language || '').trim().slice(0, 80),
    source: String(input.source || '').trim().slice(0, 80),
    requested_by: String(input.requested_by || '').trim().slice(0, 60) || 'Community Member',
    note: String(input.note || '').trim().slice(0, 320),
    poster_url: safePoster,
    imdb_id: String(input.imdb_id || '').trim().slice(0, 40),
  };
}

function scoreTitleMatch(queryNorm, candidateTitleNorm, isCatalog = false) {
  if (!queryNorm) return isCatalog ? 10 : 1;
  let score = 0;
  if (candidateTitleNorm === queryNorm) score += 100;
  else if (candidateTitleNorm.startsWith(queryNorm)) score += 60;
  else if (candidateTitleNorm.includes(queryNorm)) score += 35;
  else {
    const tokens = queryNorm.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return -1;
    const candidateWords = candidateTitleNorm.split(/\s+/).filter(Boolean);

    const tokenMatches = tokens.map((tok) => {
      if (tok.length <= 2) {
        return candidateWords.some((w) => w === tok || w.startsWith(tok) && !/^\d+$/.test(tok));
      }
      return candidateTitleNorm.includes(tok);
    });

    const matchedCount = tokenMatches.filter(Boolean).length;
    // Require all tokens to match when there are 2+ tokens so 'Pushpa 2' doesn't match 'KGF Chapter 2'
    if (tokens.length >= 2 && matchedCount < tokens.length) return -1;
    if (matchedCount === 0) return -1;
    score += matchedCount * 14;
  }
  if (isCatalog) score += 8;
  return score;
}

/**
 * Merges live local catalog matches, upcoming releases, existing requests, OMDb results,
 * and curated fallback titles into a deduplicated, ranked autocomplete list.
 */
export function mergeTitleSuggestions({
  query = '',
  typeFilter = 'All',
  catalogMovies = [],
  comingSoonMovies = [],
  existingRequests = [],
  omdbResults = [],
  curatedTitles = CURATED_TITLE_SUGGESTIONS,
  limit = 8,
} = {}) {
  const queryNorm = normalizeTitleKey(query);
  const normalizedTypeFilter = typeFilter && typeFilter !== 'All' ? normalizeMediaType(typeFilter) : null;

  const catalogByKey = new Map();
  for (const m of catalogMovies || []) {
    if (!m?.title) continue;
    catalogByKey.set(normalizeTitleKey(m.title), m);
  }

  const comingSoonByKey = new Map();
  for (const c of comingSoonMovies || []) {
    if (!c?.title) continue;
    comingSoonByKey.set(normalizeTitleKey(c.title), c);
  }

  const requestByKey = new Map();
  for (const r of existingRequests || []) {
    if (!r?.title) continue;
    const key = normalizeTitleKey(r.title);
    const prev = requestByKey.get(key);
    if (!prev || (!r.fulfilled && prev.fulfilled) || (r.votes || 0) > (prev.votes || 0)) {
      requestByKey.set(key, r);
    }
  }

  const deduped = new Map();

  const registerCandidate = (raw, origin) => {
    const title = String(raw.title || raw.Title || '').trim();
    if (!title) return;
    const key = normalizeTitleKey(title);
    if (!key) return;

    const normalizedType = normalizeMediaType(raw.type || raw.Type);
    if (normalizedTypeFilter && normalizedType !== normalizedTypeFilter) return;

    const catalogMatchRow = catalogByKey.get(key) || null;
    const comingSoonRow = comingSoonByKey.get(key) || null;
    const existingReqRow = requestByKey.get(key) || null;

    const score = scoreTitleMatch(queryNorm, key, Boolean(catalogMatchRow || comingSoonRow));
    if (queryNorm && score < 0) return;

    const rawPoster = raw.poster_url || raw.Poster || '';
    const poster_url = rawPoster && rawPoster !== 'N/A' && /^https?:\/\//i.test(rawPoster) ? rawPoster : '';
    const imdb_id = String(raw.imdb_id || raw.imdbID || '').trim();
    const year = extractYear(raw.year || raw.Year || raw.releaseDate || '');

    const candidate = {
      key,
      id: raw.id || imdb_id || `${origin}-${key.replace(/\s+/g, '-')}`,
      title,
      year,
      type: normalizedType,
      language: String(raw.language || raw.Language || '').trim(),
      genre: String(raw.genre || raw.Genre || '').trim(),
      poster_url: poster_url || catalogMatchRow?.poster_url || comingSoonRow?.poster_url || '',
      overview: String(raw.overview || raw.Plot || '').trim(),
      imdb_id,
      origin,
      score,
      catalogMatch: catalogMatchRow
        ? {
            status: 'available',
            movieId: catalogMatchRow.id,
            title: catalogMatchRow.title,
            watchUrl: `/movies/${catalogMatchRow.id}`,
          }
        : comingSoonRow
          ? {
              status: 'coming_soon',
              releaseDate: comingSoonRow.releaseDate || '',
              title: comingSoonRow.title,
            }
          : null,
      existingRequest: existingReqRow
        ? {
            id: existingReqRow.id,
            votes: existingReqRow.votes || 0,
            fulfilled: Boolean(existingReqRow.fulfilled),
          }
        : null,
    };

    const existing = deduped.get(key);
    if (!existing) {
      deduped.set(key, candidate);
    } else {
      deduped.set(key, {
        ...existing,
        year: existing.year || candidate.year,
        language: existing.language || candidate.language,
        genre: existing.genre || candidate.genre,
        poster_url: existing.poster_url || candidate.poster_url,
        overview: existing.overview || candidate.overview,
        imdb_id: existing.imdb_id || candidate.imdb_id,
        catalogMatch: existing.catalogMatch || candidate.catalogMatch,
        existingRequest: existing.existingRequest || candidate.existingRequest,
        score: Math.max(existing.score, candidate.score),
      });
    }
  };

  for (const m of catalogMovies || []) registerCandidate(m, 'catalog');
  for (const c of comingSoonMovies || []) registerCandidate(c, 'coming_soon');
  for (const o of omdbResults || []) registerCandidate(o, 'omdb');
  for (const cur of curatedTitles || []) registerCandidate(cur, 'curated');
  for (const req of existingRequests || []) registerCandidate(req, 'request');

  return Array.from(deduped.values())
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return String(b.year || '').localeCompare(String(a.year || ''));
    })
    .slice(0, limit);
}

export function attachMatchedMoviesToRequests(requests = [], approvedMovies = []) {
  const movieMap = new Map();
  for (const m of approvedMovies || []) {
    if (!m?.id || !m?.title) continue;
    movieMap.set(normalizeTitleKey(m.title), m.id);
  }

  return (requests || []).map((req) => {
    const matchedId = req.matched_movie_id || movieMap.get(normalizeTitleKey(req.title)) || null;
    return {
      ...req,
      type: normalizeMediaType(req.type),
      matched_movie_id: matchedId,
    };
  });
}

export function filterRequests(requests = [], { query = '', typeFilter = 'All' } = {}) {
  const q = normalizeTitleKey(query);
  const typeTarget = typeFilter && typeFilter !== 'All' ? normalizeMediaType(typeFilter) : null;

  return (requests || []).filter((item) => {
    if (typeTarget && normalizeMediaType(item.type) !== typeTarget) return false;
    if (!q) return true;
    const haystack = [item.title, item.language, item.requested_by, item.note, item.year, item.type]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(String(query || '').trim().toLowerCase()) || normalizeTitleKey(haystack).includes(q);
  });
}

export function findDuplicatePendingRequest(requests = [], title = '', type = 'Movie') {
  const targetTitle = normalizeTitleKey(title);
  const targetType = normalizeMediaType(type);
  if (!targetTitle) return null;
  return (
    (requests || []).find(
      (r) =>
        !r.fulfilled &&
        normalizeTitleKey(r.title) === targetTitle &&
        normalizeMediaType(r.type) === targetType
    ) || null
  );
}
