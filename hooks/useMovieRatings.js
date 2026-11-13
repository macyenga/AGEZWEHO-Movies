import { useState, useEffect, useCallback } from 'react';
import {
  RATINGS_STORAGE_KEY,
  readRatingsFromStorage,
  writeRatingsToStorage,
  setMovieRatingInMap,
  calculateMovieRatingSummary,
} from '../lib/ratings';

const RATINGS_EVENT = 'agasobanuye-ratings-change';

let sharedRatings = {};
let hasHydrated = false;
const listeners = new Set();

function hydrateFromStorage() {
  if (typeof window === 'undefined') return sharedRatings;
  sharedRatings = readRatingsFromStorage(window.localStorage);
  hasHydrated = true;
  return sharedRatings;
}

function notifyListeners(nextMap) {
  sharedRatings = nextMap;
  hasHydrated = true;
  if (typeof window !== 'undefined') {
    writeRatingsToStorage(window.localStorage, nextMap);
    window.dispatchEvent(new CustomEvent(RATINGS_EVENT, { detail: nextMap }));
  }
  listeners.forEach((listener) => listener(nextMap));
}

export function useMovieRatings() {
  const [ratingsMap, setRatingsMap] = useState(() => (hasHydrated ? sharedRatings : {}));

  useEffect(() => {
    const initial = hasHydrated ? sharedRatings : hydrateFromStorage();
    setRatingsMap(initial);

    const handleLocalUpdate = (next) => {
      setRatingsMap(next);
    };

    const handleStorage = (e) => {
      if (!e || !e.key || e.key === RATINGS_STORAGE_KEY) {
        const synced = hydrateFromStorage();
        listeners.forEach((listener) => listener(synced));
      }
    };

    listeners.add(handleLocalUpdate);
    window.addEventListener('storage', handleStorage);
    return () => {
      listeners.delete(handleLocalUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const rateMovie = useCallback((movieId, stars) => {
    if (!movieId) return;
    const current = hasHydrated ? sharedRatings : hydrateFromStorage();
    const next = setMovieRatingInMap(current, movieId, stars);
    notifyListeners(next);
  }, []);

  const getMovieRatingSummary = useCallback(
    (movie) => {
      if (!movie) return { average: 0, count: 0, userStars: 0, baseline: null };
      const entry = ratingsMap?.[movie.id];
      return calculateMovieRatingSummary({
        baseRating: movie.rating,
        baseVotes: 1,
        userStars: entry?.stars || 0,
      });
    },
    [ratingsMap]
  );

  return {
    ratingsMap,
    rateMovie,
    getMovieRatingSummary,
  };
}
