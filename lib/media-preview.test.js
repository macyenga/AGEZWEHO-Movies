import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isSafeHttpUrl,
  classifyPreviewLink,
  collectPlayableSources,
  normalizeSubtitles,
  srtToVtt,
  parseVttCues,
} from './media-preview.js';

test('isSafeHttpUrl allows http, https, and internal subtitle API paths while blocking javascript/data URIs', () => {
  assert.equal(isSafeHttpUrl('https://www.youtube.com/watch?v=g3JUbgOHgdw'), true);
  assert.equal(isSafeHttpUrl('http://cdn.example.com/movie.mp4'), true);
  assert.equal(isSafeHttpUrl('/api/subtitles/sample?id=test&lang=rw'), true);
  assert.equal(isSafeHttpUrl('javascript:alert(1)'), false);
  assert.equal(isSafeHttpUrl('data:text/html,<script>alert(1)</script>'), false);
});

test('classifyPreviewLink detects YouTube, Vimeo, Google Drive, Archive item, Direct MP4, and external URLs', () => {
  const yt = classifyPreviewLink('https://www.youtube.com/watch?v=g3JUbgOHgdw', 'HD Stream');
  assert.equal(yt.playable, true);
  assert.equal(yt.kind, 'youtube');
  assert.equal(yt.playerType, 'iframe');
  assert.match(yt.embedUrl, /youtube\.com\/embed\/g3JUbgOHgdw/);

  const gd = classifyPreviewLink('https://drive.google.com/file/d/1AbCDefGhIjkLMN/view?usp=sharing');
  assert.equal(gd.playable, true);
  assert.equal(gd.kind, 'gdrive');
  assert.equal(gd.embedUrl, 'https://drive.google.com/file/d/1AbCDefGhIjkLMN/preview');

  const arch = classifyPreviewLink('https://archive.org/details/sample-rwanda-film');
  assert.equal(arch.playable, true);
  assert.equal(arch.kind, 'archive');
  assert.equal(arch.embedUrl, 'https://archive.org/embed/sample-rwanda-film');

  const vimeo = classifyPreviewLink('https://vimeo.com/987654321');
  assert.equal(vimeo.playable, true);
  assert.equal(vimeo.kind, 'vimeo');
  assert.equal(vimeo.embedUrl, 'https://player.vimeo.com/video/987654321?autoplay=1');

  const mp4 = classifyPreviewLink('https://cdn.example.com/videos/rocky-2026.mp4?token=123');
  assert.equal(mp4.playable, true);
  assert.equal(mp4.kind, 'direct-video');
  assert.equal(mp4.playerType, 'video');

  const ext = classifyPreviewLink('https://www.netflix.com');
  assert.equal(ext.playable, false);
  assert.equal(ext.kind, 'external');
});

test('collectPlayableSources aggregates and deduplicates playable watch links, trailer, and playable download mirrors', () => {
  const sources = collectPlayableSources({
    watch_links: [
      { label: 'Watch HD', url: 'https://www.youtube.com/watch?v=g3JUbgOHgdw' },
      { label: 'Direct MP4', url: 'https://cdn.example.com/movie.mp4', info: '720p' },
    ],
    trailer_url: 'https://youtu.be/g3JUbgOHgdw', // duplicate of watch_links[0]
    links: [
      { label: 'External Archive Root', url: 'https://archive.org' }, // not playable directly
      { label: 'Drive Mirror', url: 'https://drive.google.com/file/d/XYZ123/view', info: '1.2 GB' },
    ],
  });

  assert.equal(sources.length, 3);
  assert.equal(sources[0].label, 'Watch HD');
  assert.equal(sources[1].playerType, 'video');
  assert.equal(sources[2].kind, 'gdrive');
  assert.equal(sources[2].sourceType, 'download-preview');
});

test('normalizeSubtitles validates URLs, deduplicates tracks, and includes fallback subtitle_url', () => {
  const tracks = normalizeSubtitles(
    [
      { language: 'Kinyarwanda', label: 'Kinyarwanda (Rocky)', url: '/api/subtitles/sample?id=agent&lang=rw' },
      { language: 'Bad', url: 'javascript:evil()' },
      { language: 'Kinyarwanda Dup', url: '/api/subtitles/sample?id=agent&lang=rw' },
    ],
    'https://cdn.example.com/subs/agent-en.srt',
    'English'
  );

  assert.equal(tracks.length, 2);
  assert.equal(tracks[0].language, 'Kinyarwanda');
  assert.equal(tracks[1].language, 'English');
  assert.equal(tracks[1].format, 'srt');
});

test('srtToVtt and parseVttCues convert SRT cues cleanly into WebVTT and structured timing cues', () => {
  const sampleSrt = [
    '1',
    '00:00:01,500 --> 00:00:04,200',
    'Murakaza neza kuri Agasobanuye.rw',
    '',
    '2',
    '00:00:05,000 --> 00:00:08,000',
    'Ubu ushobora kureba firime n amagambo hasi.',
  ].join('\n');

  const vtt = srtToVtt(sampleSrt);
  assert.match(vtt, /^WEBVTT/);
  assert.match(vtt, /00:00:01\.500 --> 00:00:04\.200/);

  const cues = parseVttCues(sampleSrt);
  assert.equal(cues.length, 2);
  assert.equal(cues[0].startSec, 1.5);
  assert.equal(cues[0].endSec, 4.2);
  assert.equal(cues[0].text, 'Murakaza neza kuri Agasobanuye.rw');
});
