import { isValidRwandaPhone, normalizeRwandaPhone } from './paypack-client.js';

export const UPLOADER_MONETIZATION_CONFIG = {
  movieTipShareRate: 0.5, // 50% of viewer donations on uploader's movie
  movieViewBonusPer1k: 250, // 250 RWF per 1,000 verified views on approved movies
  gameUnlockShareRate: 0.7, // 70% of paid premium game/app unlocks
  minPayoutRwf: 2000, // Minimum 2,000 RWF available balance to request MoMo payout
  payoutSchedule: '24-48 hours via MTN MoMo / Airtel Money',
};

export function calculateMovieTipShare(amountRwf) {
  const num = Number(amountRwf);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.floor(num * UPLOADER_MONETIZATION_CONFIG.movieTipShareRate);
}

export function calculateMovieViewBonus(views) {
  const count = Number(views);
  if (!Number.isFinite(count) || count < 1000) return 0;
  return Math.floor(count / 1000) * UPLOADER_MONETIZATION_CONFIG.movieViewBonusPer1k;
}

export function calculateGameUnlockShare(amountRwf) {
  const num = Number(amountRwf);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.floor(num * UPLOADER_MONETIZATION_CONFIG.gameUnlockShareRate);
}

export function estimateMonthlyUploaderEarnings({
  monthlyViews = 0,
  viewerTipsRwf = 0,
  gameUnlockRevenueRwf = 0,
} = {}) {
  const viewBonus = calculateMovieViewBonus(monthlyViews);
  const tipShare = calculateMovieTipShare(viewerTipsRwf);
  const gameShare = calculateGameUnlockShare(gameUnlockRevenueRwf);
  return {
    viewBonus,
    tipShare,
    gameShare,
    totalEstimatedRwf: viewBonus + tipShare + gameShare,
  };
}

export function summarizeUploaderEarnings({
  movies = [],
  games = [],
  completedGameTxs = [],
  payouts = [],
} = {}) {
  const safeMovies = Array.isArray(movies) ? movies : [];
  const safeGames = Array.isArray(games) ? games : [];
  const safeTxs = Array.isArray(completedGameTxs) ? completedGameTxs : [];
  const safePayouts = Array.isArray(payouts) ? payouts : [];

  const txRevenueByGame = new Map();
  for (const tx of safeTxs) {
    if (!tx || !tx.game_id || tx.status !== 'completed') continue;
    const key = String(tx.game_id);
    txRevenueByGame.set(key, (txRevenueByGame.get(key) || 0) + Math.max(0, Number(tx.amount) || 0));
  }

  let movieTipEarnings = 0;
  let movieViewBonus = 0;
  const movieBreakdown = safeMovies.map((m) => {
    const tips = Math.max(0, Math.round(Number(m?.uploader_earnings) || 0));
    const isApproved = m?.status === 'approved';
    const views = Math.max(0, Math.round(Number(m?.views) || 0));
    const viewBonus = isApproved ? calculateMovieViewBonus(views) : 0;
    movieTipEarnings += tips;
    movieViewBonus += viewBonus;
    return {
      id: m.id,
      title: m.title,
      type: m.type || 'Movie',
      status: m.status || 'pending',
      views,
      tipEarnings: tips,
      viewBonus,
      totalEarnings: tips + viewBonus,
      momoNumber: m.uploader_momo_number || '',
      createdAt: m.created_at || null,
    };
  });

  let gameUnlockEarnings = 0;
  const gameBreakdown = safeGames.map((g) => {
    const txGross = txRevenueByGame.get(String(g.id)) || 0;
    const txShare = calculateGameUnlockShare(txGross);
    const storedShare = Math.max(0, Math.round(Number(g?.uploader_earnings) || 0));
    const share = Math.max(txShare, storedShare);
    gameUnlockEarnings += share;
    return {
      id: g.id,
      title: g.title,
      category: g.category || 'Game',
      status: g.status || 'pending',
      price: Math.max(0, Math.round(Number(g?.price) || 0)),
      grossSales: txGross,
      totalEarnings: share,
      momoNumber: g.uploader_momo_number || '',
      createdAt: g.created_at || null,
    };
  });

  let paidOut = 0;
  let pendingPayouts = 0;
  for (const p of safePayouts) {
    if (!p) continue;
    const amt = Math.max(0, Math.round(Number(p.amount) || 0));
    if (p.status === 'paid') paidOut += amt;
    else if (p.status === 'pending') pendingPayouts += amt;
  }

  const grossEarned = movieTipEarnings + movieViewBonus + gameUnlockEarnings;
  const availableBalance = Math.max(0, grossEarned - paidOut - pendingPayouts);

  return {
    movieTipEarnings,
    movieViewBonus,
    gameUnlockEarnings,
    grossEarned,
    paidOut,
    pendingPayouts,
    availableBalance,
    canWithdraw: availableBalance >= UPLOADER_MONETIZATION_CONFIG.minPayoutRwf,
    minPayoutRwf: UPLOADER_MONETIZATION_CONFIG.minPayoutRwf,
    movieBreakdown,
    gameBreakdown,
  };
}

export function validatePayoutRequest({
  amount,
  momoNumber,
  availableBalance = 0,
  minPayoutRwf = UPLOADER_MONETIZATION_CONFIG.minPayoutRwf,
} = {}) {
  const normalizedPhone = normalizeRwandaPhone(momoNumber);
  if (!normalizedPhone || !isValidRwandaPhone(normalizedPhone)) {
    return {
      ok: false,
      error: 'Enter a valid Rwandan MTN MoMo or Airtel Money number (e.g. 0788123456).',
    };
  }

  const parsedAmount = Math.round(Number(amount));
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return {
      ok: false,
      error: 'Enter a valid payout amount in RWF.',
    };
  }

  if (parsedAmount < minPayoutRwf) {
    return {
      ok: false,
      error: `Minimum payout amount is ${minPayoutRwf.toLocaleString()} RWF.`,
    };
  }

  if (parsedAmount > Math.floor(Number(availableBalance) || 0)) {
    return {
      ok: false,
      error: `Requested amount exceeds your available balance (${Math.floor(Number(availableBalance) || 0).toLocaleString()} RWF).`,
    };
  }

  return {
    ok: true,
    amount: parsedAmount,
    momoNumber: normalizedPhone,
  };
}
