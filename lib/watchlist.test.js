import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WATCHLIST_STORAGE_KEY,
  LEGACY_COLLECTION_KEY,
  normalizeWatchlistMovie,
  parseStoredWatchlist,
  isMovieInWatchlist,
  addMovieToWatchlist,
  removeMovieFromWatchlist,
  toggleWatchlistItem,
  readWatchlistFromStorage,
  writeWatchlistToStorage,
} from './watchlist.js';

function createMemoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem(k) {
      return map.has(k) ? map.get(k) : null;
    },
    setItem(k, v) {
      map.set(k, String(v));
    },
    dump() {
      return Object.fromEntries(map.entries());
    },
  };
}

test('addMovieToWatchlist and removeMovieFromWatchlist keep updates immutable and deduplicated', () => {
  const m1 = { id: 'rocky-2026', title: 'Rocky 2026', year: 2026, genre: 'Action', type: 'Movie' };
  const m2 = { id: 'mirzapur-s3', title: 'Mirzapur Season 3', year: 2024, genre: 'Drama', type: 'Series' };

  const initial = [];
  const step1 = addMovieToWatchlist(initial, m1, 1000);
  const step2 = addMovieToWatchlist(step1, m2, 2000);
  const step2Dup = addMovieToWatchlist(step2, m1, 3000);

  assert.equal(initial.length, 0);
  assert.equal(step2.length, 2);
  assert.equal(step2[0].id, 'mirzapur-s3');
  assert.equal(step2Dup.length, 2);
  assert.equal(isMovieInWatchlist(step2, 'rocky-2026'), true);
  assert.equal(isMovieInWatchlist(step2, 'missing'), false);

  const step3 = removeMovieFromWatchlist(step2, 'rocky-2026');
  assert.equal(step3.length, 1);
  assert.equal(step3[0].id, 'mirzapur-s3');
});

test('toggleWatchlistItem adds when missing and removes when present', () => {
  const movie = { id: 'pushpa-2', title: 'Pushpa 2: The Rule', year: 2024, type: 'Movie' };
  const added = toggleWatchlistItem([], movie, 5000);
  assert.equal(added.length, 1);
  assert.equal(added[0].savedAt, 5000);

  const removed = toggleWatchlistItem(added, movie, 6000);
  assert.equal(removed.length, 0);
});

test('parseStoredWatchlist ignores malformed JSON and deduplicates corrupted entries', () => {
  assert.deepEqual(parseStoredWatchlist('not-json'), []);
  assert.deepEqual(parseStoredWatchlist('{"not":"array"}'), []);

  const raw = JSON.stringify([
    { id: 'a', title: 'Movie A' },
    { id: 'a', title: 'Duplicate A' },
    { title: 'Missing ID' },
    { id: 'b', title: 'Movie B', type: 'Series' },
  ]);
  const parsed = parseStoredWatchlist(raw);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].id, 'a');
  assert.equal(parsed[1].id, 'b');
});

test('readWatchlistFromStorage and writeWatchlistToStorage persist and migrate legacy key', () => {
  const storage = createMemoryStorage({
    [LEGACY_COLLECTION_KEY]: JSON.stringify([{ id: 'legacy-1', title: 'Legacy Film' }]),
  });

  const migrated = readWatchlistFromStorage(storage);
  assert.equal(migrated.length, 1);
  assert.equal(migrated[0].id, 'legacy-1');

  const updated = addMovieToWatchlist(migrated, { id: 'new-1', title: 'New Film' }, 9000);
  writeWatchlistToStorage(storage, updated);

  const reread = readWatchlistFromStorage(storage);
  assert.equal(reread.length, 2);
  assert.equal(reread[0].id, 'new-1');

  const dumped = storage.dump();
  assert.ok(dumped[WATCHLIST_STORAGE_KEY]);
  assert.ok(dumped[LEGACY_COLLECTION_KEY]);
  assert.equal(normalizeWatchlistMovie(null), null);
});
