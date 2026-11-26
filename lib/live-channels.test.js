import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LIVE_CHANNELS,
  isAllowedLiveStreamUrl,
  buildProxyStreamUrl,
  rewriteM3u8Manifest,
  selectAutoPlayChannel,
} from './live-channels.js';

test('isAllowedLiveStreamUrl permits configured broadcast hosts and blocks SSRF targets', () => {
  assert.equal(
    isAllowedLiveStreamUrl('http://197.243.19.131:1935/rtv25/rtv/chunklist.m3u8'),
    true
  );
  assert.equal(
    isAllowedLiveStreamUrl('https://5c46fa289c89f.streamlock.net/pub2live/myStream/playlist.m3u8'),
    true
  );

  // SSRF / private IP / credential / invalid protocol checks
  assert.equal(isAllowedLiveStreamUrl('http://127.0.0.1:3000/secret'), false);
  assert.equal(isAllowedLiveStreamUrl('http://169.254.169.254/latest/meta-data'), false);
  assert.equal(isAllowedLiveStreamUrl('http://192.168.1.1/admin'), false);
  assert.equal(isAllowedLiveStreamUrl('http://10.0.0.5/stream.m3u8'), false);
  assert.equal(isAllowedLiveStreamUrl('http://localhost/stream.m3u8'), false);
  assert.equal(isAllowedLiveStreamUrl('https://evil.example.com/live.m3u8'), false);
  assert.equal(isAllowedLiveStreamUrl('ftp://197.243.19.131/rtv.m3u8'), false);
  assert.equal(isAllowedLiveStreamUrl('https://user:pass@tv.btnrwanda.com/live.m3u8'), false);
});

test('rewriteM3u8Manifest resolves relative playlists, segments, and tag URIs through proxy', () => {
  const baseUrl = 'http://197.243.19.131:1935/rtv25/rtv/chunklist.m3u8';
  const raw = [
    '#EXTM3U',
    '#EXT-X-VERSION:3',
    '#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="eng",URI="subs/playlist.m3u8"',
    '#EXT-X-STREAM-INF:BANDWIDTH=2380642',
    'chunklist_w123.m3u8',
    'media_42.ts',
  ].join('\n');

  const rewritten = rewriteM3u8Manifest(raw, baseUrl, '/api/live/proxy');
  assert.ok(
    rewritten.includes(
      'URI="/api/live/proxy?url=http%3A%2F%2F197.243.19.131%3A1935%2Frtv25%2Frtv%2Fsubs%2Fplaylist.m3u8"'
    )
  );
  assert.ok(
    rewritten.includes(
      '/api/live/proxy?url=http%3A%2F%2F197.243.19.131%3A1935%2Frtv25%2Frtv%2Fchunklist_w123.m3u8'
    )
  );
  assert.ok(
    rewritten.includes(
      '/api/live/proxy?url=http%3A%2F%2F197.243.19.131%3A1935%2Frtv25%2Frtv%2Fmedia_42.ts'
    )
  );
  assert.equal(buildProxyStreamUrl('https://evil.example.com/a.m3u8'), null);
});

test('selectAutoPlayChannel prioritizes online Rwanda channels before global fallbacks', () => {
  const picked = selectAutoPlayChannel(LIVE_CHANNELS, {
    'rwanda-tv': { online: false },
    kc2: { online: true },
    'dw-news': { online: true },
  });
  assert.equal(picked.id, 'kc2');

  const fallback = selectAutoPlayChannel(LIVE_CHANNELS, {
    'rwanda-tv': { online: false },
    kc2: { online: false },
    'isibo-tv': { online: false },
    tv10: { online: false },
    'bplus-tv': { online: false },
    'btn-tv': { online: false },
    'dw-news': { online: true },
  });
  assert.equal(fallback.id, 'dw-news');
});
