import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UPCOMING_MOVIES,
  formatReleaseDate,
  getDaysUntilRelease,
  getCountdownLabel,
  getUpcomingMovies,
} from './coming-soon.js';

test('formatReleaseDate converts ISO YYYY-MM-DD dates into readable calendar labels', () => {
  assert.equal(formatReleaseDate('2026-11-28'), 'Nov 28, 2026');
  assert.equal(formatReleaseDate('2027-01-09'), 'Jan 9, 2027');
  assert.equal(formatReleaseDate(''), 'TBA');
});

test('getDaysUntilRelease and getCountdownLabel compute deterministic day offsets', () => {
  const ref = new Date('2026-11-13T12:00:00Z');
  assert.equal(getDaysUntilRelease('2026-11-28', ref), 15);
  assert.equal(getCountdownLabel('2026-11-28', ref), 'In 15 days');
  assert.equal(getCountdownLabel('2026-11-14', ref), 'Tomorrow');
  assert.equal(getCountdownLabel('2026-11-13', ref), 'Releasing Today');
  assert.equal(getDaysUntilRelease('2026-11-01', ref), 0);
});

test('getUpcomingMovies sorts releases chronologically and enriches date labels', () => {
  const ref = new Date('2026-11-13T00:00:00Z');
  const sorted = getUpcomingMovies(UPCOMING_MOVIES, ref);
  assert.equal(sorted.length, UPCOMING_MOVIES.length);
  for (let i = 1; i < sorted.length; i += 1) {
    assert.ok(sorted[i - 1].releaseDate <= sorted[i].releaseDate);
  }
  assert.equal(sorted[0].formattedReleaseDate, 'Nov 28, 2026');
  assert.equal(sorted[0].countdownLabel, 'In 15 days');
});
