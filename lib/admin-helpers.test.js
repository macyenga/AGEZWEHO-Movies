import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeAdminSummary,
  filterAdminMovies,
  filterAdminGames,
  filterAdminRequests,
  filterAdminNews,
  filterAdminShop,
  filterAdminDonations,
  filterAdminSubscriptions,
  filterAdminContacts,
  comingSoonToMoviePayload,
  buildTransactionsCsv,
  buildModerationQueue,
} from './admin-helpers.js';

test('buildModerationQueue returns only non-zero action items with target tabs', () => {
  const queue = buildModerationQueue({
    pendingMovies: 2,
    pendingTransactions: 0,
    pendingSubscriptions: 1,
    unconfirmedDonationsCount: 0,
    pendingGames: 3,
    pendingNews: 0,
    unresolvedContacts: 4,
  });
  assert.equal(queue.length, 4);
  assert.deepEqual(
    queue.map((q) => [q.tab, q.count]),
    [['movies', 2], ['subscriptions', 1], ['premium', 3], ['contacts', 4]]
  );
});

test('computeAdminSummary aggregates KPIs and moderation queue across all categories', () => {
  const summary = computeAdminSummary({
    allMovies: [
      { id: '1', status: 'approved', featured: true, views: 1000 },
      { id: '2', status: 'pending', featured: false, views: 250 },
    ],
    pendingMovies: [{ id: '2' }],
    allGames: [{ id: 'g1', status: 'pending' }, { id: 'g2', status: 'approved' }],
    allRequests: [{ id: 'r1', fulfilled: true, votes: 15 }, { id: 'r2', fulfilled: false, votes: 10 }],
    allNews: [{ id: 'n1', status: 'pending' }, { id: 'n2', status: 'approved' }],
    allShop: [{ id: 's1', status: 'active' }, { id: 's2', status: 'sold' }],
    comingSoon: [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }],
    pendingTransactions: [{ id: 't1' }],
    completedTransactions: [{ id: 't2', amount: 1500 }],
    completedDonations: [
      { id: 'd1', amount: 2000, confirmed: true },
      { id: 'd2', amount: 500, confirmed: false },
    ],
    subscriptions: [
      { id: 'sub1', status: 'pending' },
      { id: 'sub2', status: 'active', expires_at: new Date(Date.now() + 86400000).toISOString() },
    ],
    contacts: [{ id: 'msg1', resolved: false }, { id: 'msg2', resolved: true }],
    admins: [{ id: 'a1' }],
  });

  assert.equal(summary.totalMovies, 2);
  assert.equal(summary.approvedMovies, 1);
  assert.equal(summary.featuredMovies, 1);
  assert.equal(summary.totalViews, 1250);
  assert.equal(summary.pendingGames, 1);
  assert.equal(summary.fulfilledRequests, 1);
  assert.equal(summary.totalVotes, 25);
  assert.equal(summary.pendingNews, 1);
  assert.equal(summary.activeShop, 1);
  assert.equal(summary.soldShop, 1);
  assert.equal(summary.totalComingSoon, 3);
  assert.equal(summary.totalRevenue, 3500);
  assert.equal(summary.activeSubscriptions, 1);
  assert.equal(summary.unresolvedContacts, 1);
  assert.equal(summary.pendingModerationTotal, 7);
});

test('category filters match search text, status, and tier cleanly', () => {
  const movies = [
    { id: 'm1', title: 'Pushpa 2', status: 'approved', genre: 'Action', featured: true, uploaded_by: 'Rocky' },
    { id: 'm2', title: 'Sankara Film', status: 'pending', genre: 'Thriller', featured: false, uploaded_by: 'Sankara' },
  ];
  assert.equal(filterAdminMovies(movies, { status: 'pending' }).length, 1);
  assert.equal(filterAdminMovies(movies, { featured: 'featured', search: 'rocky' }).length, 1);
  assert.equal(filterAdminMovies(movies, { genre: 'Drama' }).length, 0);

  const games = [
    { id: 'g1', title: 'FIFA Rwanda', status: 'approved', premium: true, category: 'Sports' },
    { id: 'g2', title: 'GTA Kigali', status: 'pending', premium: false, category: 'Action' },
  ];
  assert.equal(filterAdminGames(games, { tier: 'premium' }).length, 1);
  assert.equal(filterAdminGames(games, { status: 'pending' }).length, 1);

  assert.equal(filterAdminRequests([{ title: 'KGF 3', fulfilled: false }], { status: 'pending', search: 'kgf' }).length, 1);
  assert.equal(filterAdminNews([{ title: 'News', status: 'approved' }], { status: 'pending' }).length, 0);
  assert.equal(filterAdminShop([{ title: 'PS5', status: 'active' }], { status: 'active' }).length, 1);
  assert.equal(filterAdminDonations([{ donor_name: 'Alice', confirmed: false }], { status: 'pending' }).length, 1);
  assert.equal(filterAdminContacts([{ name: 'Bob', resolved: false }], { status: 'unread' }).length, 1);

  const subs = [
    { id: 's1', user_id: 'u1', status: 'active', expires_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 's2', user_id: 'u2', status: 'active', expires_at: new Date(Date.now() + 86400000).toISOString() },
  ];
  assert.equal(filterAdminSubscriptions(subs, { status: 'expired' }, { u1: 'a@b.com' }).length, 1);
  assert.equal(filterAdminSubscriptions(subs, { search: 'a@b.com' }, { u1: 'a@b.com' }).length, 1);
});

test('comingSoonToMoviePayload and buildTransactionsCsv format data cleanly', () => {
  const movie = comingSoonToMoviePayload({
    title: 'KGF Chapter 3',
    releaseDate: '2026-11-28',
    type: 'Movie',
    genre: 'Action',
    language: 'Kinyarwanda',
    interpreter: 'Rocky Kimomo',
    poster_url: 'https://img.example/kgf.jpg',
    trailer_url: 'https://youtube.com/watch?v=abc',
    overview: 'Epic return',
  });
  assert.equal(movie.year, '2026');
  assert.equal(movie.status, 'approved');
  assert.equal(movie.featured, true);
  assert.equal(movie.uploaded_by, 'Rocky Kimomo');

  const csv = buildTransactionsCsv([
    {
      id: 'tx-1',
      tx_ref: 'REF,1',
      status: 'completed',
      amount: 2000,
      phone: '0788123456',
      donor_email: 'user@example.com',
      user_id: 'u1',
      created_at: '2026-11-17T00:00:00Z',
    },
  ], { u1: 'user@example.com' });
  const lines = csv.split('\n');
  assert.equal(lines.length, 2);
  assert.match(lines[0], /^ID,Reference,Status/);
  assert.match(lines[1], /"REF,1"/);
});
