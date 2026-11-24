import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UPLOADER_MONETIZATION_CONFIG,
  calculateMovieTipShare,
  calculateMovieViewBonus,
  calculateGameUnlockShare,
  estimateMonthlyUploaderEarnings,
  summarizeUploaderEarnings,
  validatePayoutRequest,
} from './uploader-earnings.js';

test('revenue split calculators apply 50% tips, 250 RWF per 1k views, and 70% game share', () => {
  assert.equal(calculateMovieTipShare(5000), 2500);
  assert.equal(calculateMovieTipShare(-100), 0);

  assert.equal(calculateMovieViewBonus(999), 0);
  assert.equal(calculateMovieViewBonus(2500), 500);
  assert.equal(calculateMovieViewBonus(10000), 2500);

  assert.equal(calculateGameUnlockShare(1000), 700);
  assert.equal(calculateGameUnlockShare(500), 350);

  const estimate = estimateMonthlyUploaderEarnings({
    monthlyViews: 20000,
    viewerTipsRwf: 10000,
    gameUnlockRevenueRwf: 10000,
  });
  assert.deepEqual(estimate, {
    viewBonus: 5000,
    tipShare: 5000,
    gameShare: 7000,
    totalEstimatedRwf: 17000,
  });
});

test('summarizeUploaderEarnings aggregates movie tips, approved view bonuses, game unlocks, and payouts', () => {
  const summary = summarizeUploaderEarnings({
    movies: [
      { id: 'm1', title: 'Rocky 2026', status: 'approved', views: 12400, uploader_earnings: 4000 },
      { id: 'm2', title: 'Pending Film', status: 'pending', views: 5000, uploader_earnings: 0 },
    ],
    games: [
      { id: 'g1', title: 'FIFA Rwanda', status: 'approved', price: 1000, uploader_earnings: 0 },
    ],
    completedGameTxs: [
      { id: 't1', game_id: 'g1', amount: 2000, status: 'completed' },
      { id: 't2', game_id: 'g1', amount: 1000, status: 'pending' },
    ],
    payouts: [
      { id: 'p1', amount: 3000, status: 'paid' },
      { id: 'p2', amount: 1500, status: 'pending' },
    ],
  });

  // m1 tips: 4000, m1 viewBonus (12 * 250): 3000 (m2 pending -> 0 view bonus)
  // g1 unlock share (70% of 2000): 1400
  // grossEarned = 4000 + 3000 + 1400 = 8400
  // availableBalance = 8400 - 3000 - 1500 = 3900
  assert.equal(summary.movieTipEarnings, 4000);
  assert.equal(summary.movieViewBonus, 3000);
  assert.equal(summary.gameUnlockEarnings, 1400);
  assert.equal(summary.grossEarned, 8400);
  assert.equal(summary.paidOut, 3000);
  assert.equal(summary.pendingPayouts, 1500);
  assert.equal(summary.availableBalance, 3900);
  assert.equal(summary.canWithdraw, true);
});

test('validatePayoutRequest enforces valid Rwanda MoMo number, minimum threshold, and balance cap', () => {
  const badPhone = validatePayoutRequest({
    amount: 3000,
    momoNumber: '12345',
    availableBalance: 5000,
  });
  assert.equal(badPhone.ok, false);

  const belowMin = validatePayoutRequest({
    amount: UPLOADER_MONETIZATION_CONFIG.minPayoutRwf - 500,
    momoNumber: '0788123456',
    availableBalance: 5000,
  });
  assert.equal(belowMin.ok, false);

  const overBalance = validatePayoutRequest({
    amount: 6000,
    momoNumber: '+250788123456',
    availableBalance: 5000,
  });
  assert.equal(overBalance.ok, false);

  const valid = validatePayoutRequest({
    amount: 4500,
    momoNumber: '+250788123456',
    availableBalance: 5000,
  });
  assert.deepEqual(valid, {
    ok: true,
    amount: 4500,
    momoNumber: '0788123456',
  });
});
