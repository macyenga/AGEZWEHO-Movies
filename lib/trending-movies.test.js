import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getMovieViews,
  getTopTrendingMovies,
  formatViewCount,
  getHighQualityThumbnailUrl,
} from './trending-movies.js';

test('getMovieViews handles numbers, strings, and invalid inputs safely', () => {
  assert.equal(getMovieViews({ views: 148200 }), 148200);
  assert.equal(getMovieViews({ view_count: '42500.8' }), 42500);
  assert.equal(getMovieViews({ views: -10 }), 0);
  assert.equal(getMovieViews(null), 0);
});

test('getTopTrendingMovies returns top 5 sorted descending by views', () => {
  const sample = [
    { id: 'a', title: 'Movie A', views: 12000, rating: '8.0' },
    { id: 'b', title: 'Movie B', views: 95000, rating: '7.5' },
    { id: 'c', title: 'Movie C', views: 150000, rating: '8.9' },
    { id: 'd', title: 'Movie D', views: 44000, rating: '9.1' },
    { id: 'e', title: 'Movie E', views: 67000, rating: '8.2' },
    { id: 'f', title: 'Movie F', views: 81000, rating: '8.4' },
    { id: 'g', title: 'Movie G', views: 5000, rating: '7.0' },
  ];

  const top5 = getTopTrendingMovies(sample);
  assert.equal(top5.length, 5);
  assert.deepEqual(
    top5.map((m) => m.id),
    ['c', 'b', 'f', 'e', 'd']
  );
});

test('getTopTrendingMovies breaks view ties using rating and created_at', () => {
  const tied = [
    { id: 'low-rate', title: 'Low', views: 50000, rating: '7.1', created_at: '2026-10-01T00:00:00Z' },
    { id: 'high-rate', title: 'High', views: 50000, rating: '8.8', created_at: '2026-09-01T00:00:00Z' },
  ];
  const result = getTopTrendingMovies(tied, 5);
  assert.deepEqual(result.map((m) => m.id), ['high-rate', 'low-rate']);
  assert.deepEqual(getTopTrendingMovies([], 5), []);
});

test('formatViewCount formats millions, thousands, and singular/plural units', () => {
  assert.equal(formatViewCount(148200), '148.2K views');
  assert.equal(formatViewCount(1000000), '1M views');
  assert.equal(formatViewCount(2350000), '2.4M views');
  assert.equal(formatViewCount(850), '850 views');
  assert.equal(formatViewCount(1), '1 view');
  assert.equal(formatViewCount(0), '0 views');
});

test('getHighQualityThumbnailUrl upgrades Unsplash widths to high-res and preserves other URLs', () => {
  const upgraded = getHighQualityThumbnailUrl(
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80'
  );
  assert.match(upgraded, /w=900/);
  assert.match(upgraded, /q=85/);
  assert.equal(getHighQualityThumbnailUrl('https://cdn.example.com/poster.jpg'), 'https://cdn.example.com/poster.jpg');
  assert.equal(getHighQualityThumbnailUrl(''), '');
});
