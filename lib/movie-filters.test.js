import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MOVIE_CATEGORIES,
  RATING_FILTER_OPTIONS,
  parseMovieGenres,
  movieMatchesCategory,
  getMovieFilterYears,
  movieMatchesYear,
  movieMatchesMinRating,
  filterMovies,
  getCategoryCounts,
  searchTitles,
} from './movie-filters.js';

const SAMPLE = [
  { id: '1', title: 'Pushpa 2: The Rule', year: '2024', rating: '8.3', type: 'Movie', genre: 'Action', language: 'Hindi', overview: 'Action drama' },
  { id: '2', title: 'Mirzapur Season 3', year: '2024', rating: '8.1', type: 'Series', genre: 'Drama, Crime', language: 'Hindi/English', overview: 'Crime thriller series' },
  { id: '3', title: 'Stree 2', year: '2024', rating: '7.9', type: 'Movie', genre: 'Horror, Comedy', language: 'Hindi', overview: 'Horror comedy hit' },
  { id: '4', title: 'Agasobanuye: Rocky 2026', year: '2026', rating: '8.9', type: 'Movie', genre: 'Action', language: 'Kinyarwanda', overview: 'Rocky agent story' },
  { id: '5', title: 'Solo Leveling: Arise', year: '2024', rating: '8.8', type: 'Anime', genre: 'Fantasy', language: 'Japanese', overview: 'Hunters and monsters' },
  { id: '6', title: 'Animal', year: '2023', rating: '6.8', type: 'Movie', genre: 'Action', language: 'Hindi', overview: 'Action revenge drama' },
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

test('getMovieFilterYears extracts sorted unique release years descending', () => {
  assert.deepEqual(getMovieFilterYears(SAMPLE), ['2026', '2024', '2023']);
  assert.deepEqual(getMovieFilterYears([{ year: null }, { year: 'invalid' }]), []);
});

test('movieMatchesYear and movieMatchesMinRating validate year and 5-star converted thresholds', () => {
  assert.equal(movieMatchesYear(SAMPLE[3], '2026'), true);
  assert.equal(movieMatchesYear(SAMPLE[3], '2024'), false);
  assert.equal(movieMatchesYear(SAMPLE[3], 'All'), true);

  assert.ok(RATING_FILTER_OPTIONS.length >= 4);
  // 8.9 -> 4.5 stars; 6.8 -> 3.4 stars
  assert.equal(movieMatchesMinRating(SAMPLE[3], '4.5'), true);
  assert.equal(movieMatchesMinRating(SAMPLE[0], '4.5'), false);
  assert.equal(movieMatchesMinRating(SAMPLE[5], '3.5'), false);
  assert.equal(movieMatchesMinRating(SAMPLE[5], '3.0'), true);
  assert.equal(movieMatchesMinRating({ rating: null }, '3.0'), false);
  assert.equal(movieMatchesMinRating({ rating: null }, 'All'), true);
});

test('filterMovies combines query, type, category, year, and rating filters accurately', () => {
  assert.equal(filterMovies(SAMPLE, { category: 'Action' }).length, 3);
  assert.equal(filterMovies(SAMPLE, { category: 'Action', year: '2026' }).length, 1);
  assert.equal(filterMovies(SAMPLE, { category: 'Action', minRating: '4.0' }).length, 2);
  assert.equal(filterMovies(SAMPLE, { year: '2024', minRating: '4.2' }).length, 2);
  assert.equal(filterMovies(SAMPLE, { type: 'Series', category: 'Drama' }).length, 1);
  assert.equal(filterMovies(SAMPLE, { type: 'Movie', category: 'Drama' }).length, 0);
  assert.equal(filterMovies(SAMPLE, { query: 'rocky', year: '2026' }).length, 1);
  assert.equal(filterMovies(SAMPLE, { query: 'rocky', year: '2024' }).length, 0);
});

test('getCategoryCounts computes accurate totals across categories respecting year and rating', () => {
  const counts = getCategoryCounts(SAMPLE, MOVIE_CATEGORIES);
  assert.equal(counts.All, 6);
  assert.equal(counts.Action, 3);
  assert.equal(counts.Comedy, 1);
  assert.equal(counts.Drama, 1);
  assert.equal(counts['Sci-Fi'], 0);

  const highRatedCounts = getCategoryCounts(SAMPLE, MOVIE_CATEGORIES, { minRating: '4.4' });
  assert.equal(highRatedCounts.All, 2);
  assert.equal(highRatedCounts.Action, 1);
  assert.equal(highRatedCounts.Fantasy, 1);
});

test('searchTitles prioritizes title matches over overview matches', () => {
  const results = searchTitles(SAMPLE, 'rocky');
  assert.equal(results[0].id, '4');

  const mirzapur = searchTitles(SAMPLE, 'Mirzapur');
  assert.equal(mirzapur.length, 1);
  assert.equal(mirzapur[0].type, 'Series');

  assert.deepEqual(searchTitles(SAMPLE, '   '), []);
});
