import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeHttpUrl,
  normalizeContentType,
  normalizePremiumLinks,
  resolvePremiumVideoSources,
  hasActiveProSubscription,
  hasGlobalPremiumAccess,
  hasPendingPremiumPayment,
  hasItemUnlockAccess,
  sanitizeGameForGate,
  sanitizeGamePreviewForGate,
} from './premium-content.js';

test('sanitizeHttpUrl allows only http/https URLs and blocks unsafe schemes', () => {
  assert.equal(sanitizeHttpUrl('https://cdn.example.com/video.mp4'), 'https://cdn.example.com/video.mp4');
  assert.equal(sanitizeHttpUrl('http://example.com/file.zip'), 'http://example.com/file.zip');
  assert.equal(sanitizeHttpUrl('javascript:alert(1)'), null);
  assert.equal(sanitizeHttpUrl('data:text/html,<script>alert(1)</script>'), null);
  assert.equal(sanitizeHttpUrl('/relative/path'), null);
  assert.equal(sanitizeHttpUrl(''), null);
});

test('normalizePremiumLinks filters unsafe links and deduplicates URLs', () => {
  const result = normalizePremiumLinks([
    { label: 'HD Video', url: 'https://cdn.example.com/vid.mp4', info: '1080p', color: '#c9a84c' },
    { label: 'Duplicate', url: 'HTTPS://cdn.example.com/vid.mp4' },
    { label: 'Bad', url: 'javascript:void(0)' },
    { label: 'Drive Mirror', url: 'https://drive.google.com/file/d/abc123/view' },
  ]);

  assert.equal(result.length, 2);
  assert.equal(result[0].label, 'HD Video');
  assert.equal(result[0].color, '#c9a84c');
  assert.equal(result[1].label, 'Drive Mirror');
});

test('normalizeContentType respects valid types and infers Video when video is attached', () => {
  assert.equal(normalizeContentType('video', false), 'Video');
  assert.equal(normalizeContentType('Course', false), 'Course');
  assert.equal(normalizeContentType('Unknown', true), 'Video');
  assert.equal(normalizeContentType('', false), 'Game');
});

test('resolvePremiumVideoSources prioritizes explicit video_url and playable mirrors', () => {
  const direct = resolvePremiumVideoSources({
    title: 'Private Masterclass',
    type: 'Video',
    video_url: 'https://cdn.example.com/private-film.mp4',
    links: [{ label: 'Download PDF', url: 'https://example.com/guide.pdf' }],
  });
  assert.equal(direct.length, 1);
  assert.equal(direct[0].playerType, 'video');
  assert.equal(direct[0].embedUrl, 'https://cdn.example.com/private-film.mp4');

  const yt = resolvePremiumVideoSources({
    title: 'Exclusive Stream',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  });
  assert.equal(yt.length, 1);
  assert.equal(yt[0].kind, 'youtube');
  assert.equal(yt[0].playerType, 'iframe');
});

test('access helpers enforce paid-approved access across subscriptions, requests, and transactions', () => {
  const now = new Date('2026-11-26T12:00:00Z');
  const activeSub = [{ status: 'active', expires_at: '2026-12-26T12:00:00Z' }];
  const expiredSub = [{ status: 'active', expires_at: '2026-11-01T12:00:00Z' }];

  assert.equal(hasActiveProSubscription(activeSub, now), true);
  assert.equal(hasActiveProSubscription(expiredSub, now), false);

  assert.equal(hasGlobalPremiumAccess({ isAdmin: true, now }), true);
  assert.equal(hasGlobalPremiumAccess({ subscriptions: activeSub, now }), true);
  assert.equal(
    hasGlobalPremiumAccess({ accessRequests: [{ status: 'approved', scope: 'global' }], now }),
    true
  );
  assert.equal(
    hasGlobalPremiumAccess({ accessRequests: [{ status: 'approved', game_id: 'g1' }], now }),
    false
  );
  assert.equal(hasGlobalPremiumAccess({ subscriptions: expiredSub, now }), false);

  assert.equal(
    hasPendingPremiumPayment({ subscriptions: [{ status: 'pending' }] }),
    true
  );
  assert.equal(
    hasPendingPremiumPayment({ transactions: [{ status: 'pending', game_id: 'g1' }] }),
    true
  );
  assert.equal(
    hasPendingPremiumPayment({ transactions: [{ status: 'completed', game_id: 'g1' }] }),
    false
  );
});

test('hasItemUnlockAccess handles pro, approved request, per-item transaction, owner, and unauthenticated lock', () => {
  const game = { id: 'vid-1', uploader_id: 'creator-1', premium: false };
  const now = new Date('2026-11-26T12:00:00Z');

  assert.deepEqual(hasItemUnlockAccess({ game, userId: null, now }), { unlocked: false, reason: 'locked' });
  assert.deepEqual(hasItemUnlockAccess({ game, userId: 'u2', now }), { unlocked: false, reason: 'locked' });
  assert.deepEqual(
    hasItemUnlockAccess({ game, userId: 'creator-1', now }),
    { unlocked: true, reason: 'owner' }
  );
  assert.deepEqual(
    hasItemUnlockAccess({
      game,
      userId: 'u2',
      transactions: [{ status: 'completed', game_id: 'vid-1' }],
      now,
    }),
    { unlocked: true, reason: 'purchased' }
  );
  assert.deepEqual(
    hasItemUnlockAccess({
      game,
      userId: 'u2',
      subscriptions: [{ status: 'active', expires_at: '2026-12-26T12:00:00Z' }],
      now,
    }),
    { unlocked: true, reason: 'pro' }
  );
});

test('sanitizeGameForGate hides private video_url and links unless includePrivateMedia is true', () => {
  const raw = {
    id: 'vid-1',
    title: 'VIP Agasobanuye Special',
    type: 'Video',
    category: 'Entertainment',
    cover_url: 'https://images.example.com/cover.jpg',
    video_url: 'https://private.cdn.example.com/secret.mp4',
    links: [{ label: 'Download 1080p', url: 'https://private.cdn.example.com/file.mp4' }],
    premium: true,
    price: 1000,
    status: 'approved',
  };

  const gated = sanitizeGameForGate(raw, { includePrivateMedia: false });
  assert.equal(gated.video_url, null);
  assert.deepEqual(gated.links, []);
  assert.equal(gated.has_video, true);
  assert.equal(gated.download_count, 1);

  const unlocked = sanitizeGameForGate(raw, { includePrivateMedia: true });
  assert.equal(unlocked.video_url, 'https://private.cdn.example.com/secret.mp4');
  assert.equal(unlocked.links.length, 1);

  const preview = sanitizeGamePreviewForGate(raw);
  assert.equal(preview.id, 'vid-1');
  assert.equal(preview.cover_url, 'https://images.example.com/cover.jpg');
  assert.equal(preview.title, 'VIP Agasobanuye Special');
  assert.equal(preview.has_video, true);
  assert.equal(preview.locked, true);
  assert.equal('video_url' in preview, false);
  assert.equal('links' in preview, false);
  assert.equal('overview' in preview, false);
});
