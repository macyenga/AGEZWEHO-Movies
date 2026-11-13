import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MOVIE_CATEGORIES,
  parseMovieGenres,
  movieMatchesCategory,
  filterMovies,
  getCategoryCounts,
  searchTitles,
} from './movie-filters.js';

const SAMPLE = [
  { id: '1', title: 'Pushpa 2: The Rule', type: 'Movie', genre: 'Action', language: 'Hindi', overview: 'Action drama' },
  { id: '2', title: 'Mirzapur Season 3', type: 'Series', genre: 'Drama, Crime', language: 'Hindi/English', overview: 'Crime thriller series' },
  { id: '3', title: 'Stree 2', type: 'Movie', genre: 'Horror, Comedy', language: 'Hindi', overview: 'Horror comedy hit' },
  { id: '4', title: 'Agasobanuye: Rocky 2026', type: 'Movie', genre: 'Action', language: 'Kinyarwanda', overview: 'Rocky agent story' },
  { id: '5', title: 'Solo Leveling: Arise', type: 'Anime', genre: 'Fantasy', language: 'Japanese', overview: 'Hunters and monsters' },
];

test('parseMovieGenres splits comma-separated genres cleanly', () => {
  assert.deepEqual(parseMovieGenres('Drama, Crime'), ['Drama', 'Crime']);
  assert.deepEqual(parseMovieGenres(''), []);
  assert.deepEqual(parseMovieGenres(null), []);
});

test('movieMatchesCategory matches single and multi-genre entries case-insensitively', () => {
  assert.equal(movieMatchesCategory(SAMPLE[1], 'Drama'), true);
  assert.equal(movieMatchesCategory(SAMPLE[1], 'crime'), true);
  assert.equal(movieMatchesCategory(SAMPLE[1], 'Comedy'), false);
  assert.equal(movieMatchesCategory(SAMPLE[1], 'All'), true);
});

test('filterMovies combines query, type, and category filters accurately', () => {
  assert.equal(filterMovies(SAMPLE, { category: 'Action' }).length, 2);
  assert.equal(filterMovies(SAMPLE, { category: 'Comedy' }).length, 1);
  assert.equal(filterMovies(SAMPLE, { type: 'Series', category: 'Drama' }).length, 1);
  assert.equal(filterMovies(SAMPLE, { type: 'Movie', category: 'Drama' }).length, 0);
  assert.equal(filterMovies(SAMPLE, { query: 'rocky' }).length, 1);
});

test('getCategoryCounts computes accurate totals across categories', () => {
  const counts = getCategoryCounts(SAMPLE, MOVIE_CATEGORIES);
  assert.equal(counts.All, 5);
  assert.equal(counts.Action, 2);
  assert.equal(counts.Comedy, 1);
  assert.equal(counts.Drama, 1);
  assert.equal(counts.Sci_Fi || counts['Sci-Fi'], 0);
});

test('searchTitles prioritizes title matches over overview matches', () => {
  const results = searchTitles(SAMPLE, 'rocky');
  assert.equal(results[0].id, '4');

  const mirzapur = searchTitles(SAMPLE, 'Mirzapur');
  assert.equal(mirzapur.length, 1);
  assert.equal(mirzapur[0].type, 'Series');

  assert.deepEqual(searchTitles(SAMPLE, '   '), []);
});
