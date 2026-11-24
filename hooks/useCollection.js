import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  WATCHLIST_STORAGE_KEY,
  LEGACY_COLLECTION_KEY,
  readWatchlistFromStorage,
  writeWatchlistToStorage,
  addMovieToWatchlist,
  removeMovieFromWatchlist,
  toggleWatchlistItem,
  isMovieInWatchlist,
  mergeWatchlists,
} from '../lib/watchlist';

const WATCHLIST_EVENT = 'agasobanuye-watchlist-change';

let sharedWatchlist = [];
let hasHydrated = false;
let sharedSyncing = false;
let sharedSyncedToProfile = false;
let activeSyncUserId = null;
let inFlightLoginSyncUserId = null;
let localMutationVersion = 0;
let mutationQueue = Promise.resolve();

const listeners = new Set();

function getSnapshot() {
  return {
    collection: sharedWatchlist,
    loaded: hasHydrated,
    syncing: sharedSyncing,
    syncedToProfile: sharedSyncedToProfile,
  };
}

function broadcast() {
  const snapshot = getSnapshot();
  listeners.forEach((listener) => listener(snapshot));
}

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
  broadcast();
}

async function getAccessToken() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch {
    return null;
  }
}

async function syncWatchlistRequest(items, mode = 'replace') {
  const token = await getAccessToken();
  if (!token) return null;

  const res = await fetch('/api/watchlist', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items, mode }),
  });

  if (!res.ok) {
    throw new Error(`Watchlist sync failed (${res.status})`);
  }

  return res.json();
}

function queueProfilePersist(nextList) {
  mutationQueue = mutationQueue
    .then(async () => {
      sharedSyncing = true;
      broadcast();
      await syncWatchlistRequest(nextList, 'replace');
      sharedSyncedToProfile = true;
    })
    .catch(() => {
      // Keep localStorage copy even if network sync fails temporarily
    })
    .finally(() => {
      sharedSyncing = false;
      broadcast();
    });
}

export function useCollection() {
  const { user } = useAuth();
  const userId = user?.id || null;

  const [state, setState] = useState(() => getSnapshot());

  useEffect(() => {
    if (!hasHydrated) {
      hydrateFromStorage();
    }
    setState(getSnapshot());

    const handleLocalUpdate = (snapshot) => {
      setState(snapshot);
    };

    const handleStorage = (e) => {
      if (!e || !e.key || e.key === WATCHLIST_STORAGE_KEY || e.key === LEGACY_COLLECTION_KEY) {
        hydrateFromStorage();
        broadcast();
      }
    };

    listeners.add(handleLocalUpdate);
    window.addEventListener('storage', handleStorage);
    return () => {
      listeners.delete(handleLocalUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      if (activeSyncUserId !== null || sharedSyncedToProfile) {
        activeSyncUserId = null;
        inFlightLoginSyncUserId = null;
        sharedSyncedToProfile = false;
        sharedSyncing = false;
        broadcast();
      }
      return;
    }

    if (activeSyncUserId === userId || inFlightLoginSyncUserId === userId) {
      return;
    }

    let cancelled = false;
    inFlightLoginSyncUserId = userId;
    sharedSyncing = true;
    broadcast();

    const versionAtStart = localMutationVersion;
    const localItems = hasHydrated ? sharedWatchlist : hydrateFromStorage();

    syncWatchlistRequest(localItems, 'merge')
      .then((data) => {
        if (cancelled || !data || !Array.isArray(data.items)) return;

        activeSyncUserId = userId;
        sharedSyncedToProfile = true;

        if (localMutationVersion !== versionAtStart) {
          const remerged = mergeWatchlists(sharedWatchlist, data.items);
          notifyListeners(remerged);
          queueProfilePersist(remerged);
        } else {
          notifyListeners(data.items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          sharedSyncedToProfile = false;
        }
      })
      .finally(() => {
        if (inFlightLoginSyncUserId === userId) {
          inFlightLoginSyncUserId = null;
        }
        sharedSyncing = false;
        broadcast();
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const addToCollection = useCallback(
    (movie) => {
      const current = hasHydrated ? sharedWatchlist : hydrateFromStorage();
      const next = addMovieToWatchlist(current, movie);
      if (next !== current) {
        localMutationVersion += 1;
        notifyListeners(next);
        if (userId) queueProfilePersist(next);
      }
    },
    [userId]
  );

  const removeFromCollection = useCallback(
    (id) => {
      const current = hasHydrated ? sharedWatchlist : hydrateFromStorage();
      const next = removeMovieFromWatchlist(current, id);
      if (next !== current) {
        localMutationVersion += 1;
        notifyListeners(next);
        if (userId) queueProfilePersist(next);
      }
    },
    [userId]
  );

  const toggleWatchlist = useCallback(
    (movie) => {
      const current = hasHydrated ? sharedWatchlist : hydrateFromStorage();
      const next = toggleWatchlistItem(current, movie);
      if (next !== current) {
        localMutationVersion += 1;
        notifyListeners(next);
        if (userId) queueProfilePersist(next);
      }
      return isMovieInWatchlist(next, movie?.id);
    },
    [userId]
  );

  const isInCollection = useCallback(
    (id) => isMovieInWatchlist(state.collection, id),
    [state.collection]
  );

  const clearCollection = useCallback(() => {
    localMutationVersion += 1;
    notifyListeners([]);
    if (userId) queueProfilePersist([]);
  }, [userId]);

  return {
    collection: state.collection,
    watchlist: state.collection,
    addToCollection,
    addToWatchlist: addToCollection,
    removeFromCollection,
    removeFromWatchlist: removeFromCollection,
    toggleWatchlist,
    isInCollection,
    isInWatchlist: isInCollection,
    clearCollection,
    clearWatchlist: clearCollection,
    loaded: state.loaded,
    syncing: state.syncing,
    syncedToProfile: state.syncedToProfile,
    isAuthenticated: Boolean(userId),
  };
}
