import { classifyPreviewLink, collectPlayableSources, isSafeHttpUrl } from './media-preview.js';

export const PREMIUM_CONTENT_TYPES = [
  'Video',
  'Series',
  'Course',
  'Game',
  'App',
  'Mod',
  'Resource',
];

export const DEFAULT_ADMIN_EMAIL = 'macyenga@gmail.com';

export function sanitizeHttpUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed || !isSafeHttpUrl(trimmed) || trimmed.startsWith('/')) {
    return null;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function normalizeContentType(rawType, hasVideo = false) {
  const candidate = String(rawType || '').trim();
  const matched = PREMIUM_CONTENT_TYPES.find(
    (item) => item.toLowerCase() === candidate.toLowerCase()
  );
  if (matched) return matched;
  return hasVideo ? 'Video' : 'Game';
}

export function normalizePremiumLinks(links = []) {
  if (!Array.isArray(links)) return [];
  const normalized = [];
  const seen = new Set();

  for (let i = 0; i < links.length; i++) {
    const raw = links[i];
    const urlValue = typeof raw === 'string' ? raw : raw?.url;
    const safeUrl = sanitizeHttpUrl(urlValue);
    if (!safeUrl) continue;

    const dedupeKey = safeUrl.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const label =
      typeof raw === 'object' && raw?.label
        ? String(raw.label).trim().slice(0, 80)
        : `Mirror ${normalized.length + 1}`;
    const info =
      typeof raw === 'object' && raw?.info
        ? String(raw.info).trim().slice(0, 120)
        : '';
    const color =
      typeof raw === 'object' && typeof raw?.color === 'string' && /^#[0-9a-f]{3,8}$/i.test(raw.color.trim())
        ? raw.color.trim()
        : '';

    normalized.push({
      label,
      url: safeUrl,
      ...(info ? { info } : {}),
      ...(color ? { color } : {}),
    });
  }

  return normalized;
}

export function resolvePremiumVideoSources(item) {
  if (!item || typeof item !== 'object') return [];

  const safeVideoUrl = sanitizeHttpUrl(item.video_url);
  const safeLinks = normalizePremiumLinks(item.links);

  const mediaPayload = {
    title: item.title || 'Private Premium Video',
    watch_links: safeVideoUrl
      ? [{ label: 'Private Video Stream', url: safeVideoUrl, info: item.type || 'Video' }]
      : [],
    links: safeLinks,
  };

  const sources = collectPlayableSources(mediaPayload);
  if (sources.length > 0) return sources;

  if (safeVideoUrl) {
    const classified = classifyPreviewLink(safeVideoUrl, 'Private Video Stream');
    if (classified.playable && classified.embedUrl) {
      return [
        {
          id: 'private-video-1',
          label: 'Private Video Stream',
          sourceType: 'stream',
          url: safeVideoUrl,
          embedUrl: classified.embedUrl,
          playerType: classified.playerType,
          kind: classified.kind,
          info: item.type || 'Video',
        },
      ];
    }

    // Fallback direct video element if explicit video_url points to a CDN stream without extension
    return [
      {
        id: 'private-video-direct-1',
        label: 'Private Video Stream',
        sourceType: 'stream',
        url: safeVideoUrl,
        embedUrl: safeVideoUrl,
        playerType: 'video',
        kind: 'direct-video',
        info: item.type || 'Video',
      },
    ];
  }

  return [];
}

export function hasActiveProSubscription(subscriptions = [], now = new Date()) {
  if (!Array.isArray(subscriptions)) return false;
  const nowMs = now instanceof Date ? now.getTime() : Date.now();

  return subscriptions.some((sub) => {
    if (!sub || sub.status !== 'active') return false;
    if (!sub.expires_at) return true;
    const expMs = Date.parse(sub.expires_at);
    return Number.isFinite(expMs) && expMs > nowMs;
  });
}

export function hasGlobalPremiumAccess({
  isAdmin = false,
  subscriptions = [],
  accessRequests = [],
  now = new Date(),
} = {}) {
  if (isAdmin) return true;
  if (hasActiveProSubscription(subscriptions, now)) return true;

  if (Array.isArray(accessRequests)) {
    return accessRequests.some(
      (req) => req && req.status === 'approved' && (!req.game_id || req.scope === 'global')
    );
  }

  return false;
}

export function hasPendingPremiumPayment({
  subscriptions = [],
  accessRequests = [],
  transactions = [],
} = {}) {
  const pendingSub = Array.isArray(subscriptions)
    ? subscriptions.some((sub) => sub && sub.status === 'pending')
    : false;
  if (pendingSub) return true;

  const pendingReq = Array.isArray(accessRequests)
    ? accessRequests.some((req) => req && req.status === 'pending')
    : false;
  if (pendingReq) return true;

  const pendingTx = Array.isArray(transactions)
    ? transactions.some(
        (tx) =>
          tx &&
          tx.status === 'pending' &&
          (tx.game_id || tx.purpose?.toLowerCase().includes('pro') || tx.purpose?.toLowerCase().includes('premium'))
      )
    : false;

  return pendingTx;
}

export function hasItemUnlockAccess({
  game,
  userId = null,
  isAdmin = false,
  subscriptions = [],
  accessRequests = [],
  transactions = [],
  now = new Date(),
} = {}) {
  if (!game || !userId) {
    return { unlocked: false, reason: 'locked' };
  }

  if (isAdmin) {
    return { unlocked: true, reason: 'admin' };
  }

  if (hasActiveProSubscription(subscriptions, now)) {
    return { unlocked: true, reason: 'pro' };
  }

  if (
    Array.isArray(accessRequests) &&
    accessRequests.some(
      (req) =>
        req &&
        req.status === 'approved' &&
        (!req.game_id || String(req.game_id) === String(game.id) || req.scope === 'global')
    )
  ) {
    return { unlocked: true, reason: 'approved' };
  }

  if (game.uploader_id && String(game.uploader_id) === String(userId)) {
    return { unlocked: true, reason: 'owner' };
  }

  if (
    Array.isArray(transactions) &&
    transactions.some(
      (tx) =>
        tx &&
        tx.status === 'completed' &&
        tx.game_id &&
        String(tx.game_id) === String(game.id)
    )
  ) {
    return { unlocked: true, reason: 'purchased' };
  }

  return { unlocked: false, reason: 'locked' };
}

export function sanitizeGameForGate(game, { includePrivateMedia = false } = {}) {
  if (!game || typeof game !== 'object') return null;

  const safeVideoUrl = sanitizeHttpUrl(game.video_url);
  const safeLinks = normalizePremiumLinks(game.links);
  const hasPlayableLink = safeLinks.some((link) => classifyPreviewLink(link.url).playable);
  const hasVideo = Boolean(safeVideoUrl || hasPlayableLink);

  return {
    id: game.id,
    title: game.title || '',
    type: normalizeContentType(game.type, hasVideo),
    category: game.category || 'Entertainment',
    version: game.version || null,
    rating: game.rating || null,
    cover_url: sanitizeHttpUrl(game.cover_url),
    overview: game.overview || '',
    premium: game.premium !== false,
    price: Number(game.price) || 0,
    status: game.status || 'approved',
    uploader_id: game.uploader_id || null,
    created_at: game.created_at || null,
    has_video: hasVideo,
    download_count: safeLinks.length,
    video_url: includePrivateMedia ? safeVideoUrl : null,
    links: includePrivateMedia ? safeLinks : [],
  };
}

export function sanitizeGamePreviewForGate(game) {
  if (!game || typeof game !== 'object') return null;

  const safeVideoUrl = sanitizeHttpUrl(game.video_url);
  const safeLinks = normalizePremiumLinks(game.links);
  const hasPlayableLink = safeLinks.some((link) => classifyPreviewLink(link.url).playable);
  const hasVideo = Boolean(safeVideoUrl || hasPlayableLink);

  return {
    id: game.id,
    title: game.title || '',
    type: normalizeContentType(game.type, hasVideo),
    category: game.category || 'Entertainment',
    rating: game.rating || null,
    cover_url: sanitizeHttpUrl(game.cover_url),
    price: Number(game.price) || 0,
    has_video: hasVideo,
    download_count: safeLinks.length,
    locked: true,
  };
}
