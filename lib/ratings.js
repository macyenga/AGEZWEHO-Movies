export const RATINGS_STORAGE_KEY = 'agasobanuye_movie_ratings';

export function clampStars(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  const rounded = Math.round(n);
  if (rounded < 1 || rounded > 5) return 0;
  return rounded;
}

export function normalizeBaseRatingToFiveScale(rawRating) {
  if (rawRating === null || rawRating === undefined || rawRating === '') return null;
  const n = Number.parseFloat(rawRating);
  if (!Number.isFinite(n) || n <= 0) return null;
  const scaled = n > 5 ? n / 2 : n;
  return Math.min(5, Math.max(0.5, Math.round(scaled * 10) / 10));
}

export function calculateMovieRatingSummary({ baseRating, baseVotes = 1, userStars = 0, extraRatings = [] }) {
  const baseline = normalizeBaseRatingToFiveScale(baseRating);
  const validBaseVotes = baseline !== null && baseVotes > 0 ? baseVotes : 0;
  const validUserStars = clampStars(userStars);
  const validExtras = Array.isArray(extraRatings)
    ? extraRatings.map(clampStars).filter((s) => s > 0)
    : [];

  let totalScore = baseline !== null ? baseline * validBaseVotes : 0;
  let totalCount = validBaseVotes;

  if (validUserStars > 0) {
    totalScore += validUserStars;
    totalCount += 1;
  }

  for (const extra of validExtras) {
    totalScore += extra;
    totalCount += 1;
  }

  const average = totalCount > 0 ? Math.round((totalScore / totalCount) * 10) / 10 : 0;

  return {
    average,
    count: totalCount,
    userStars: validUserStars,
    baseline,
  };
}

export function parseStoredRatings(raw) {
  if (!raw || typeof raw !== 'string') return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const result = {};
    for (const [movieId, entry] of Object.entries(parsed)) {
      if (!movieId) continue;
      const stars = typeof entry === 'number' ? clampStars(entry) : clampStars(entry?.stars);
      if (stars > 0) {
        result[movieId] = {
          stars,
          updatedAt: typeof entry?.updatedAt === 'number' ? entry.updatedAt : Date.now(),
        };
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function readRatingsFromStorage(storage) {
  if (!storage || typeof storage.getItem !== 'function') return {};
  try {
    return parseStoredRatings(storage.getItem(RATINGS_STORAGE_KEY));
  } catch {
    return {};
  }
}

export function writeRatingsToStorage(storage, ratingsMap) {
  if (!storage || typeof storage.setItem !== 'function') return;
  try {
    storage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(ratingsMap || {}));
  } catch {
    // Ignore quota/private browsing errors
  }
}

export function setMovieRatingInMap(ratingsMap, movieId, stars, now = Date.now()) {
  const safeMap = ratingsMap && typeof ratingsMap === 'object' ? { ...ratingsMap } : {};
  const validStars = clampStars(stars);
  if (!movieId) return safeMap;
  if (validStars === 0) {
    delete safeMap[movieId];
    return safeMap;
  }
  safeMap[movieId] = { stars: validStars, updatedAt: now };
  return safeMap;
}
