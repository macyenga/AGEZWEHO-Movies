const DEFAULT_SITE_URL = 'https://agasobanuye.rw';
const MAX_SITEMAP_URLS = 50000;
const DEFAULT_PAGE_SIZE = 1000;

export function resolveSiteOrigin(rawUrl) {
  const candidate = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  if (candidate) {
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    } catch {
      // fall back to default
    }
  }
  return DEFAULT_SITE_URL;
}

export function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function toIsoDate(value) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString();
}

export const STATIC_SITEMAP_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/subtitles', priority: '0.9', changefreq: 'daily' },
  { path: '/news', priority: '0.9', changefreq: 'daily' },
  { path: '/requests', priority: '0.9', changefreq: 'daily' },
  { path: '/games', priority: '0.9', changefreq: 'daily' },
  { path: '/live', priority: '0.8', changefreq: 'daily' },
  { path: '/finder', priority: '0.7', changefreq: 'weekly' },
  { path: '/shop', priority: '0.7', changefreq: 'weekly' },
  { path: '/subscribe', priority: '0.7', changefreq: 'weekly' },
  { path: '/earnings', priority: '0.7', changefreq: 'weekly' },
  { path: '/submit', priority: '0.6', changefreq: 'weekly' },
  { path: '/submit-game', priority: '0.6', changefreq: 'weekly' },
  { path: '/news/submit', priority: '0.6', changefreq: 'weekly' },
  { path: '/shop/submit', priority: '0.6', changefreq: 'weekly' },
  { path: '/collection', priority: '0.6', changefreq: 'monthly' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/privacy-policy', priority: '0.5', changefreq: 'monthly' },
  { path: '/terms', priority: '0.5', changefreq: 'monthly' },
  { path: '/dmca', priority: '0.5', changefreq: 'monthly' },
  { path: '/support', priority: '0.5', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'monthly' },
];

export function formatSitemapUrlEntry({ origin, path, priority = '0.5', changefreq = 'monthly', lastmod = '' }) {
  const safePath = String(path || '/').startsWith('/') ? String(path || '/') : `/${path}`;
  const loc = escapeXml(`${origin}${safePath}`);
  const isoMod = toIsoDate(lastmod);
  return `<url><loc>${loc}</loc>${isoMod ? `<lastmod>${escapeXml(isoMod)}</lastmod>` : ''}<changefreq>${escapeXml(changefreq)}</changefreq><priority>${escapeXml(priority)}</priority></url>`;
}

export function buildMovieSitemapRoutes(movies = []) {
  const routes = [];
  const seenIds = new Set();

  for (const movie of Array.isArray(movies) ? movies : []) {
    if (!movie?.id) continue;
    if (movie.status && movie.status !== 'approved') continue;

    const rawId = String(movie.id).trim();
    if (!rawId || seenIds.has(rawId)) continue;
    seenIds.add(rawId);

    const encodedId = encodeURIComponent(rawId);
    const lastmod = movie.updated_at || movie.created_at || '';
    routes.push({
      path: `/movies/${encodedId}`,
      priority: '0.9',
      changefreq: 'weekly',
      lastmod,
    });
    routes.push({
      path: `/watch/${encodedId}`,
      priority: '0.85',
      changefreq: 'weekly',
      lastmod,
    });
  }

  return routes;
}

export function buildSitemapXml({
  siteUrl = DEFAULT_SITE_URL,
  movies = [],
  games = [],
  news = [],
  shop = [],
  extraRoutes = [],
} = {}) {
  const origin = resolveSiteOrigin(siteUrl);
  const seenPaths = new Set();
  const entries = [];

  const pushRoute = (route) => {
    if (!route?.path || entries.length >= MAX_SITEMAP_URLS) return;
    const normalizedPath = route.path.startsWith('/') ? route.path : `/${route.path}`;
    if (seenPaths.has(normalizedPath)) return;
    seenPaths.add(normalizedPath);
    entries.push(formatSitemapUrlEntry({ ...route, path: normalizedPath, origin }));
  };

  STATIC_SITEMAP_ROUTES.forEach(pushRoute);
  buildMovieSitemapRoutes(movies).forEach(pushRoute);

  (Array.isArray(games) ? games : []).forEach((g) => {
    if (!g?.id) return;
    if (g.status && g.status !== 'approved') return;
    pushRoute({
      path: `/games/${encodeURIComponent(String(g.id).trim())}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: g.updated_at || g.created_at,
    });
  });

  (Array.isArray(news) ? news : []).forEach((n) => {
    if (!n?.id) return;
    if (n.status && n.status !== 'approved') return;
    pushRoute({
      path: `/news/${encodeURIComponent(String(n.id).trim())}`,
      priority: '0.8',
      changefreq: 'daily',
      lastmod: n.updated_at || n.created_at,
    });
  });

  (Array.isArray(shop) ? shop : []).forEach((s) => {
    if (!s?.id) return;
    if (s.status && s.status !== 'active') return;
    pushRoute({
      path: `/shop/${encodeURIComponent(String(s.id).trim())}`,
      priority: '0.6',
      changefreq: 'weekly',
      lastmod: s.updated_at || s.created_at,
    });
  });

  (Array.isArray(extraRoutes) ? extraRoutes : []).forEach(pushRoute);

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`;
}

export async function fetchAllTableRows(
  client,
  {
    table,
    select = 'id, created_at',
    status = 'approved',
    pageSize = DEFAULT_PAGE_SIZE,
    maxRows = 20000,
  } = {}
) {
  if (!client || typeof client.from !== 'function' || !table) {
    return [];
  }

  const allRows = [];
  let offset = 0;

  while (allRows.length < maxRows) {
    let query = client.from(table).select(select);
    if (status && typeof query.eq === 'function') {
      query = query.eq('status', status);
    }
    if (typeof query.order === 'function') {
      query = query.order('created_at', { ascending: false });
    }

    const supportsRange = typeof query.range === 'function';
    if (supportsRange) {
      query = query.range(offset, offset + pageSize - 1);
    } else if (typeof query.limit === 'function') {
      query = query.limit(pageSize);
    }

    const { data, error } = await query;
    if (error || !Array.isArray(data) || data.length === 0) {
      break;
    }

    allRows.push(...data);

    if (!supportsRange || data.length < pageSize) {
      break;
    }
    offset += pageSize;
  }

  return allRows.slice(0, maxRows);
}

export async function generateSitemapXml({
  siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL,
  client = null,
  movies,
  games,
  news,
  shop,
  extraRoutes = [],
} = {}) {
  const safeFetch = (override, config) =>
    Array.isArray(override) ? Promise.resolve(override) : fetchAllTableRows(client, config);

  const [movieResult, gameResult, newsResult, shopResult] = await Promise.allSettled([
    safeFetch(movies, { table: 'movies', select: 'id, created_at, status', status: 'approved' }),
    safeFetch(games, { table: 'games', select: 'id, created_at, status', status: 'approved', maxRows: 5000 }),
    safeFetch(news, { table: 'news', select: 'id, created_at, status', status: 'approved', maxRows: 5000 }),
    safeFetch(shop, { table: 'shop', select: 'id, created_at, status', status: 'active', maxRows: 5000 }),
  ]);

  const extract = (res) => (res.status === 'fulfilled' && Array.isArray(res.value) ? res.value : []);

  return buildSitemapXml({
    siteUrl,
    movies: extract(movieResult),
    games: extract(gameResult),
    news: extract(newsResult),
    shop: extract(shopResult),
    extraRoutes,
  });
}
