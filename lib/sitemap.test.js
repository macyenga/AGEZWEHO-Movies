import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STATIC_SITEMAP_ROUTES,
  buildMovieSitemapRoutes,
  buildSitemapXml,
  escapeXml,
  fetchAllTableRows,
  generateSitemapXml,
  resolveSiteOrigin,
  toIsoDate,
} from './sitemap.js';

test('resolveSiteOrigin normalizes valid origins and falls back to production domain', () => {
  assert.equal(resolveSiteOrigin('https://agasobanuye.rw/'), 'https://agasobanuye.rw');
  assert.equal(resolveSiteOrigin('https://custom.example.com/subpath'), 'https://custom.example.com');
  assert.equal(resolveSiteOrigin('javascript:alert(1)'), 'https://agasobanuye.rw');
  assert.equal(resolveSiteOrigin(''), 'https://agasobanuye.rw');
});

test('escapeXml and toIsoDate sanitize unsafe XML characters and invalid dates', () => {
  assert.equal(escapeXml('a&b<c>"d\'e'), 'a&amp;b&lt;c&gt;&quot;d&apos;e');
  assert.equal(toIsoDate('2026-11-25T08:00:00Z'), '2026-11-25T08:00:00.000Z');
  assert.equal(toIsoDate('not-a-date'), '');
});

test('buildMovieSitemapRoutes filters unapproved movies, deduplicates IDs, and indexes both detail and watch routes', () => {
  const routes = buildMovieSitemapRoutes([
    { id: 'rocky-2026', status: 'approved', created_at: '2026-11-20T00:00:00Z', updated_at: '2026-11-24T00:00:00Z' },
    { id: 'rocky-2026', status: 'approved', created_at: '2026-11-19T00:00:00Z' },
    { id: 'pending-movie', status: 'pending', created_at: '2026-11-24T00:00:00Z' },
    { id: '', status: 'approved' },
  ]);

  assert.equal(routes.length, 2);
  assert.deepEqual(routes[0], {
    path: '/movies/rocky-2026',
    priority: '0.9',
    changefreq: 'weekly',
    lastmod: '2026-11-24T00:00:00Z',
  });
  assert.deepEqual(routes[1], {
    path: '/watch/rocky-2026',
    priority: '0.85',
    changefreq: 'weekly',
    lastmod: '2026-11-24T00:00:00Z',
  });
});

test('buildSitemapXml includes all public static routes and excludes private routes', () => {
  const xml = buildSitemapXml();

  for (const route of STATIC_SITEMAP_ROUTES) {
    assert.ok(xml.includes(`<loc>https://agasobanuye.rw${route.path}</loc>`), `Missing route ${route.path}`);
  }

  assert.ok(xml.includes('<loc>https://agasobanuye.rw/subtitles</loc>'));
  assert.ok(xml.includes('<loc>https://agasobanuye.rw/earnings</loc>'));
  assert.ok(xml.includes('<loc>https://agasobanuye.rw/submit-game</loc>'));
  assert.ok(xml.includes('<loc>https://agasobanuye.rw/about</loc>'));
  assert.ok(xml.includes('<loc>https://agasobanuye.rw/privacy-policy</loc>'));
  assert.ok(xml.includes('<loc>https://agasobanuye.rw/terms</loc>'));
  assert.ok(xml.includes('<loc>https://agasobanuye.rw/dmca</loc>'));

  assert.equal(xml.includes('/admin'), false);
  assert.equal(xml.includes('/games'), false);
  assert.equal(xml.includes('/payment/'), false);
  assert.equal(xml.includes('/api/'), false);
  assert.equal(xml.includes('/404'), false);
});

test('buildSitemapXml deduplicates dynamic items and maps movie, watch, news, and shop URLs while keeping /games private', () => {
  const xml = buildSitemapXml({
    movies: [
      { id: 'pushpa-2', created_at: '2026-11-20T00:00:00Z' },
      { id: 'pushpa-2', created_at: '2026-11-21T00:00:00Z' },
    ],
    games: [{ id: 'fifa-24', created_at: '2026-11-18T00:00:00Z' }],
    news: [{ id: 'news-1', created_at: '2026-11-22T00:00:00Z' }],
    shop: [{ id: 'shop-1', created_at: 'bad-date' }],
  });

  assert.equal((xml.match(/<loc>https:\/\/agasobanuye\.rw\/movies\/pushpa-2<\/loc>/g) || []).length, 1);
  assert.equal((xml.match(/<loc>https:\/\/agasobanuye\.rw\/watch\/pushpa-2<\/loc>/g) || []).length, 1);
  assert.equal((xml.match(/<loc>https:\/\/agasobanuye\.rw\/requests<\/loc>/g) || []).length, 1);
  assert.equal(xml.includes('/games/fifa-24'), false);
  assert.ok(xml.includes('<loc>https://agasobanuye.rw/news/news-1</loc>'));
  assert.ok(xml.includes('<loc>https://agasobanuye.rw/shop/shop-1</loc>'));
});

test('fetchAllTableRows paginates across multiple pages and generateSitemapXml handles partial client errors', async () => {
  const movieRows = [
    { id: 'm-1', status: 'approved', created_at: '2026-11-21T00:00:00Z' },
    { id: 'm-2', status: 'approved', created_at: '2026-11-20T00:00:00Z' },
    { id: 'm-3', status: 'approved', created_at: '2026-11-19T00:00:00Z' },
  ];

  const mockClient = {
    from(table) {
      let rangeStart = 0;
      let rangeEnd = 100;
      return {
        select() { return this; },
        eq() { return this; },
        order() { return this; },
        range(from, to) {
          rangeStart = from;
          rangeEnd = to;
          return this;
        },
        then(resolve, reject) {
          if (table === 'games') {
            return Promise.reject(new Error('games query failed')).then(resolve, reject);
          }
          if (table === 'movies') {
            return Promise.resolve({ data: movieRows.slice(rangeStart, rangeEnd + 1), error: null }).then(resolve, reject);
          }
          return Promise.resolve({ data: [], error: null }).then(resolve, reject);
        },
      };
    },
  };

  const paginated = await fetchAllTableRows(mockClient, { table: 'movies', pageSize: 2 });
  assert.equal(paginated.length, 3);

  const xml = await generateSitemapXml({ siteUrl: 'https://agasobanuye.rw', client: mockClient });
  assert.ok(xml.includes('<loc>https://agasobanuye.rw/movies/m-1</loc>'));
  assert.ok(xml.includes('<loc>https://agasobanuye.rw/watch/m-3</loc>'));
});
