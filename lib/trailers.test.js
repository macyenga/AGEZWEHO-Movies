import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractYouTubeVideoId,
  resolveMovieTrailerVideoId,
  buildYouTubeEmbedUrl,
  buildYouTubeWatchUrl,
} from './trailers.js';

test('extractYouTubeVideoId handles watch, short, embed, shorts, and bare root URLs', () => {
  assert.equal(extractYouTubeVideoId('https://www.youtube.com/watch?v=g3JUbgOHgdw'), 'g3JUbgOHgdw');
  assert.equal(extractYouTubeVideoId('https://youtu.be/33o3s4Vs4Sw?si=abc'), '33o3s4Vs4Sw');
  assert.equal(extractYouTubeVideoId('https://www.youtube.com/embed/KVnheXywIbY'), 'KVnheXywIbY');
  assert.equal(extractYouTubeVideoId('https://youtube.com/shorts/eqy85AL70PU'), 'eqy85AL70PU');
  assert.equal(extractYouTubeVideoId('https://www.youtube.com'), null);
  assert.equal(extractYouTubeVideoId(''), null);
});

test('resolveMovieTrailerVideoId prioritizes trailer_url, then watch_links, then known fallback', () => {
  assert.equal(
    resolveMovieTrailerVideoId({
      id: 'custom-1',
      trailer_url: 'https://youtu.be/8FkLRUJj-o0',
    }),
    '8FkLRUJj-o0'
  );

  assert.equal(
    resolveMovieTrailerVideoId({
      id: 'custom-2',
      watch_links: [{ label: 'YT', url: 'https://www.youtube.com/watch?v=eqy85AL70PU' }],
    }),
    'eqy85AL70PU'
  );

  assert.equal(resolveMovieTrailerVideoId({ id: 'mirzapur-s3' }), '33o3s4Vs4Sw');
  assert.equal(resolveMovieTrailerVideoId({ id: 'unknown-movie' }), null);
});

test('buildYouTubeEmbedUrl sets autoplay=1 and playsinline=1 by default', () => {
  const embed = buildYouTubeEmbedUrl('g3JUbgOHgdw');
  assert.ok(embed.startsWith('https://www.youtube.com/embed/g3JUbgOHgdw?'));
  assert.ok(embed.includes('autoplay=1'));
  assert.ok(embed.includes('playsinline=1'));
  assert.equal(buildYouTubeEmbedUrl('bad'), null);
});

test('buildYouTubeWatchUrl creates direct video link or YouTube search fallback', () => {
  assert.equal(
    buildYouTubeWatchUrl({ title: 'Pushpa 2' }, 'g3JUbgOHgdw'),
    'https://www.youtube.com/watch?v=g3JUbgOHgdw'
  );
  const searchUrl = buildYouTubeWatchUrl({ title: 'KGF Chapter 3', year: '2026' }, null);
  assert.ok(searchUrl.includes('youtube.com/results?search_query='));
  assert.ok(searchUrl.includes('KGF'));
});
