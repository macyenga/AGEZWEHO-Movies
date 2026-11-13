import { useState, useEffect, useCallback } from 'react';
import {
  WATCHLIST_STORAGE_KEY,
  LEGACY_COLLECTION_KEY,
  readWatchlistFromStorage,
  writeWatchlistToStorage,
  addMovieToWatchlist,
  removeMovieFromWatchlist,
  toggleWatchlistItem,
  isMovieInWatchlist,
} from '../lib/watchlist';

const WATCHLIST_EVENT = 'agasobanuye-watchlist-change';

let sharedWatchlist = [];
let hasHydrated = false;
const listeners = new Set();

function hydrateFromStorage() {
  if (typeof window === 'undefined') return sharedWatchlist;
  sharedWatchlist = readWatchlistFromStorage(window.localStorage);
  hasHydrated = true;
  return sharedWatchlist;
}

function notifyListeners(nextList) {
  sharedWatchlist = nextList;
  hasHydrated = true;
  if (typeof window !== 'undefined') {
    writeWatchlistToStorage(window.localStorage, nextList);
    window.dispatchEvent(new CustomEvent(WATCHLIST_EVENT, { detail: nextList }));
  }
  listeners.forEach((listener) => listener(nextList));
}

export function useCollection() {
  const [collection, setCollection] = useState(() => (hasHydrated ? sharedWatchlist : []));
  const [loaded, setLoaded] = useState(() => hasHydrated);

  useEffect(() => {
    const initial = hasHydrated ? sharedWatchlist : hydrateFromStorage();
    setCollection(initial);
    setLoaded(true);

    const handleLocalUpdate = (next) => {
      setCollection(next);
      setLoaded(true);
    };

    const handleStorage = (e) => {
      if (!e || !e.key || e.key === WATCHLIST_STORAGE_KEY || e.key === LEGACY_COLLECTION_KEY) {
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

  const addToCollection = useCallback((movie) => {
    const current = hasHydrated ? sharedWatchlist : hydrateFromStorage();
    const next = addMovieToWatchlist(current, movie);
    if (next !== current) notifyListeners(next);
  }, []);

  const removeFromCollection = useCallback((id) => {
    const current = hasHydrated ? sharedWatchlist : hydrateFromStorage();
    const next = removeMovieFromWatchlist(current, id);
    if (next !== current) notifyListeners(next);
  }, []);

  const toggleWatchlist = useCallback((movie) => {
    const current = hasHydrated ? sharedWatchlist : hydrateFromStorage();
    const next = toggleWatchlistItem(current, movie);
    notifyListeners(next);
    return isMovieInWatchlist(next, movie?.id);
  }, []);

  const isInCollection = useCallback(
    (id) => isMovieInWatchlist(collection, id),
    [collection]
  );

  const clearCollection = useCallback(() => {
    notifyListeners([]);
  }, []);

  return {
    collection,
    watchlist: collection,
    addToCollection,
    addToWatchlist: addToCollection,
    removeFromCollection,
    removeFromWatchlist: removeFromCollection,
    toggleWatchlist,
    isInCollection,
    isInWatchlist: isInCollection,
    clearCollection,
    clearWatchlist: clearCollection,
    loaded,
  };
}

