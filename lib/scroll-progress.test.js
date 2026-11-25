import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateScrollProgress } from './scroll-progress.js';

test('calculateScrollProgress tracks 0%, midpoint, and 100% scroll positions accurately', () => {
  assert.equal(calculateScrollProgress({ scrollTop: 0, scrollHeight: 3000, clientHeight: 1000 }), 0);
  assert.equal(calculateScrollProgress({ scrollTop: 1000, scrollHeight: 3000, clientHeight: 1000 }), 50);
  assert.equal(calculateScrollProgress({ scrollTop: 2000, scrollHeight: 3000, clientHeight: 1000 }), 100);
});

test('calculateScrollProgress clamps overscroll and handles non-scrollable or invalid inputs safely', () => {
  assert.equal(calculateScrollProgress({ scrollTop: -120, scrollHeight: 3000, clientHeight: 1000 }), 0);
  assert.equal(calculateScrollProgress({ scrollTop: 2500, scrollHeight: 3000, clientHeight: 1000 }), 100);
  assert.equal(calculateScrollProgress({ scrollTop: 0, scrollHeight: 900, clientHeight: 900 }), 0);
  assert.equal(calculateScrollProgress({ scrollTop: 100, scrollHeight: 800, clientHeight: 900 }), 0);
  assert.equal(calculateScrollProgress({ scrollTop: NaN, scrollHeight: 3000, clientHeight: 1000 }), 0);
  assert.equal(calculateScrollProgress(), 0);
});
