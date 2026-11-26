import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeMediaType,
  validateRequestPayload,
  normalizeRequestPayload,
  mergeTitleSuggestions,
  attachMatchedMoviesToRequests,
  filterRequests,
  findDuplicatePendingRequest,
} from './requests-helpers.js';

test('normalizeMediaType maps movie, series, anime, documentary consistently', () => {
  assert.equal(normalizeMediaType('series'), 'Series');
  assert.equal(normalizeMediaType('TV'), 'Series');
  assert.equal(normalizeMediaType('anime'), 'Anime');
  assert.equal(normalizeMediaType('Documentary'), 'Documentary');
  assert.equal(normalizeMediaType('movie'), 'Movie');
  assert.equal(normalizeMediaType(''), 'Movie');
});

test('validateRequestPayload enforces required live request fields and valid 4-digit year', () => {
  const emptyResult = validateRequestPayload({});
  assert.equal(emptyResult.valid, false);
  assert.ok(emptyResult.errors.title);
  assert.ok(emptyResult.errors.year);
  assert.ok(emptyResult.errors.language);
  assert.ok(emptyResult.errors.source);

  const badYear = validateRequestPayload({
    title: 'Squid Game',
    year: '26',
    language: 'Korean',
    source: 'Telegram',
  });
  assert.equal(badYear.valid, false);
  assert.ok(badYear.errors.year);

  const validResult = validateRequestPayload({
    title: 'Squid Game',
    year: '2021-2025',
    language: 'Korean',
    source: 'Telegram',
  });
  assert.equal(validResult.valid, true);
  assert.deepEqual(validResult.errors, {});
});

test('normalizeRequestPayload extracts 4-digit year, strips unsafe poster urls, and sets defaults', () => {
  const normalized = normalizeRequestPayload({
    title: '  Squid Game  ',
    type: 'series',
    year: '2021–2025',
    language: 'Korean',
    source: 'Telegram',
    poster_url: 'javascript:alert(1)',
    requested_by: '',
  });

  assert.equal(normalized.title, 'Squid Game');
  assert.equal(normalized.type, 'Series');
  assert.equal(normalized.year, '2021');
  assert.equal(normalized.poster_url, '');
  assert.equal(normalized.requested_by, 'Community Member');
});

test('mergeTitleSuggestions prioritizes exact/catalog matches, merges OMDb & curated, and preserves flags', () => {
  const suggestions = mergeTitleSuggestions({
    query: 'Pushpa 2',
    typeFilter: 'All',
    catalogMovies: [
      {
        id: 'pushpa-2-the-rule',
        title: 'Pushpa 2: The Rule',
        year: '2024',
        type: 'Movie',
        language: 'Telugu/Hindi',
        poster_url: 'https://example.com/pushpa.jpg',
      },
    ],
    omdbResults: [
      {
        Title: 'Pushpa 2: The Rule',
        Year: '2024',
        Type: 'movie',
        imdbID: 'tt16539454',
        Poster: 'https://example.com/omdb-pushpa.jpg',
      },
    ],
    existingRequests: [
      {
        id: 'req-pushpa',
        title: 'Pushpa 2: The Rule',
        votes: 14,
        fulfilled: false,
      },
    ],
  });

  assert.equal(suggestions.length, 1);
  assert.equal(suggestions[0].title, 'Pushpa 2: The Rule');
  assert.equal(suggestions[0].imdb_id, 'tt16539454');
  assert.equal(suggestions[0].catalogMatch?.status, 'available');
  assert.equal(suggestions[0].catalogMatch?.watchUrl, '/movies/pushpa-2-the-rule');
  assert.equal(suggestions[0].existingRequest?.votes, 14);
});

test('mergeTitleSuggestions respects typeFilter for Series vs Movie', () => {
  const seriesOnly = mergeTitleSuggestions({
    query: 'Squid',
    typeFilter: 'Series',
  });
  assert.ok(seriesOnly.length >= 1);
  assert.equal(seriesOnly[0].title, 'Squid Game');
  assert.equal(seriesOnly[0].type, 'Series');

  const moviesOnly = mergeTitleSuggestions({
    query: 'Squid',
    typeFilter: 'Movie',
  });
  assert.equal(moviesOnly.some((item) => item.title === 'Squid Game'), false);
});

test('filterRequests filters by type and query across title, language, and requester', () => {
  const rows = [
    { id: '1', title: 'Squid Game', type: 'Series', language: 'Korean', requested_by: 'Aline', votes: 12 },
    { id: '2', title: 'John Wick 4', type: 'Movie', language: 'English', requested_by: 'Eric', votes: 8 },
    { id: '3', title: 'Solo Leveling', type: 'Anime', language: 'Japanese', requested_by: 'Diane', votes: 5 },
  ];

  assert.equal(filterRequests(rows, { typeFilter: 'Series' }).length, 1);
  assert.equal(filterRequests(rows, { query: 'Aline' })[0].id, '1');
  assert.equal(filterRequests(rows, { query: 'english', typeFilter: 'Movie' })[0].id, '2');
  assert.equal(filterRequests(rows, { query: 'english', typeFilter: 'Series' }).length, 0);
});

test('findDuplicatePendingRequest matches pending requests case-insensitively by title and type', () => {
  const rows = [
    { id: 'r1', title: 'KGF Chapter 3', type: 'Movie', fulfilled: false, votes: 36 },
    { id: 'r2', title: 'Squid Game', type: 'Series', fulfilled: true, votes: 19 },
  ];

  const dup = findDuplicatePendingRequest(rows, '  kgf chapter 3! ', 'Movie');
  assert.equal(dup?.id, 'r1');

  const fulfilledShouldNotBlock = findDuplicatePendingRequest(rows, 'Squid Game', 'Series');
  assert.equal(fulfilledShouldNotBlock, null);
});

test('attachMatchedMoviesToRequests attaches catalog movie id for matching titles', () => {
  const enriched = attachMatchedMoviesToRequests(
    [{ id: 'req-1', title: 'Pushpa 2: The Rule', fulfilled: true }],
    [{ id: 'pushpa-2-the-rule', title: 'Pushpa 2: The Rule' }]
  );
  assert.equal(enriched[0].matched_movie_id, 'pushpa-2-the-rule');
  assert.equal(enriched[0].type, 'Movie');
});
