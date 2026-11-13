import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RATINGS_STORAGE_KEY,
  clampStars,
  normalizeBaseRatingToFiveScale,
  calculateMovieRatingSummary,
  parseStoredRatings,
  readRatingsFromStorage,
  writeRatingsToStorage,
  setMovieRatingInMap,
} from './ratings.js';

function createMemoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem(k) {
      return map.has(k) ? map.get(k) : null;
    },
    setItem(k, v) {
      map.set(k, String(v));
    },
  };
}

test('normalizeBaseRatingToFiveScale converts 10-point and 5-point ratings accurately', () => {
  assert.equal(normalizeBaseRatingToFiveScale('8.3'), 4.2);
  assert.equal(normalizeBaseRatingToFiveScale('9.2'), 4.6);
  assert.equal(normalizeBaseRatingToFiveScale('4.5'), 4.5);
  assert.equal(normalizeBaseRatingToFiveScale(null), null);
  assert.equal(normalizeBaseRatingToFiveScale('invalid'), null);
});

test('calculateMovieRatingSummary computes average and count with user rating', () => {
  const initial = calculateMovieRatingSummary({ baseRating: '8.0', userStars: 0 });
  assert.equal(initial.average, 4);
  assert.equal(initial.count, 1);
  assert.equal(initial.userStars, 0);

  const ratedFive = calculateMovieRatingSummary({ baseRating: '8.0', userStars: 5 });
  assert.equal(ratedFive.average, 4.5);
  assert.equal(ratedFive.count, 2);
  assert.equal(ratedFive.userStars, 5);

  const ratedOne = calculateMovieRatingSummary({ baseRating: '8.0', userStars: 1 });
  assert.equal(ratedOne.average, 2.5);
  assert.equal(ratedOne.count, 2);

  const noBase = calculateMovieRatingSummary({ baseRating: null, userStars: 4 });
  assert.equal(noBase.average, 4);
  assert.equal(noBase.count, 1);
});

test('rating storage helpers validate, read, update, and persist star ratings', () => {
  assert.equal(clampStars(6), 0);
  assert.equal(clampStars(3), 3);

  const storage = createMemoryStorage();
  const map1 = setMovieRatingInMap(readRatingsFromStorage(storage), 'pushpa-2-the-rule', 5, 1234);
  const map2 = setMovieRatingInMap(map1, 'mirzapur-s3', 4, 2345);
  writeRatingsToStorage(storage, map2);

  const reread = readRatingsFromStorage(storage);
  assert.equal(reread['pushpa-2-the-rule'].stars, 5);
  assert.equal(reread['mirzapur-s3'].stars, 4);
  assert.deepEqual(parseStoredRatings('bad-json'), {});
  assert.ok(storage.getItem(RATINGS_STORAGE_KEY));
});
