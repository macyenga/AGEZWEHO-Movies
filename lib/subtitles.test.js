import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeOfficialSubtitleUrl,
  isOfficialSubtitleDownloadUrl,
  sanitizeSubtitleFilename,
  parseSubtitleCues,
  formatCuesToSrt,
  formatCuesToVtt,
  chunkCuesForTranslation,
  mergeTranslatedCues,
  mapOpenSubtitlesRecord,
  cleanMovieTitleForSubtitleSearch,
  buildSubtitleDownloadFilename,
  resolveMovieSubtitleAction,
  getMovieThumbnailSlides,
  getNextSlideIndex,
  dedupeLatestSubtitlesByMovie,
} from './subtitles.js';

test('normalizeOfficialSubtitleUrl allowlists only official OpenSubtitles hosts and blocks SSRF targets', () => {
  assert.equal(
    normalizeOfficialSubtitleUrl('http://dl.opensubtitles.org/en/download/filead/123.gz'),
    'https://dl.opensubtitles.org/en/download/filead/123.gz'
  );
  assert.equal(
    isOfficialSubtitleDownloadUrl('https://dl.opensubtitles.com/en/download/123.gz'),
    true
  );
  assert.equal(isOfficialSubtitleDownloadUrl('http://127.0.0.1:8080/secret'), false);
  assert.equal(isOfficialSubtitleDownloadUrl('http://169.254.169.254/latest/meta-data'), false);
  assert.equal(isOfficialSubtitleDownloadUrl('https://evil.example.com/sub.srt'), false);
  assert.equal(isOfficialSubtitleDownloadUrl('https://user:pass@dl.opensubtitles.org/file.gz'), false);
});

test('parseSubtitleCues parses both SRT and VTT blocks with multi-line dialogue cleanly', () => {
  const srt = `\uFEFF1\r\n00:00:01,500 --> 00:00:04,200\r\nWelcome to Kigali.\r\nStay alert.\r\n\r\n2\r\n00:00:05,000 --> 00:00:08,100\r\nMove out now!`;
  const cues = parseSubtitleCues(srt);
  assert.equal(cues.length, 2);
  assert.equal(cues[0].index, 1);
  assert.equal(cues[0].startTime, '00:00:01,500');
  assert.equal(cues[0].endTime, '00:00:04,200');
  assert.equal(cues[0].text, 'Welcome to Kigali.\nStay alert.');

  const vttCues = parseSubtitleCues('WEBVTT\n\n01:02.300 --> 01:05.700\nLine one');
  assert.equal(vttCues.length, 1);
  assert.equal(vttCues[0].startTime, '00:01:02,300');
  assert.equal(vttCues[0].endTime, '00:01:05,700');
});

test('formatCuesToSrt and formatCuesToVtt preserve timestamps and apply translated Kinyarwanda lines', () => {
  const cues = parseSubtitleCues('1\n00:00:02,000 --> 00:00:05,500\nHello brother.');
  const merged = mergeTranslatedCues(cues, [{ index: 1, translatedText: 'Muraho muvandimwe.' }]);

  const srt = formatCuesToSrt(merged, { useTranslated: true });
  assert.match(srt, /^1\n00:00:02,000 --> 00:00:05,500\nMuraho muvandimwe\./);

  const vtt = formatCuesToVtt(merged, { useTranslated: true });
  assert.match(vtt, /^WEBVTT\n\n00:00:02\.000 --> 00:00:05\.500\nMuraho muvandimwe\./);
});

test('chunkCuesForTranslation splits cues into deterministic slices and sanitizeSubtitleFilename strips unsafe chars', () => {
  const many = Array.from({ length: 120 }, (_, i) => ({
    index: i + 1,
    startTime: '00:00:01,000',
    endTime: '00:00:02,000',
    text: `Line ${i + 1}`,
  }));
  const chunks = chunkCuesForTranslation(many, 50);
  assert.equal(chunks.length, 3);
  assert.equal(chunks[0].length, 50);
  assert.equal(chunks[2].length, 20);

  assert.equal(sanitizeSubtitleFilename('../../Pushpa 2 (2024).srt.gz', 'vtt'), 'Pushpa_2_2024.vtt');
});

test('mapOpenSubtitlesRecord filters invalid records and normalizes valid official releases', () => {
  const valid = mapOpenSubtitlesRecord({
    IDSubtitleFile: '1961524952',
    MovieName: 'Pushpa: The Rule - Part 2',
    MovieYear: '2024',
    IDMovieImdb: '16539454',
    SubFileName: 'Pushpa.2.WEB-DL.srt',
    LanguageName: 'English',
    ISO639: 'en',
    SubFormat: 'srt',
    SubDownloadsCnt: '41263',
    SubAddDate: '2025-01-28 19:16:12',
    SubDownloadLink: 'http://dl.opensubtitles.org/en/download/filead/1961524952.gz',
    SubtitlesLink: 'https://www.opensubtitles.org/en/subtitles/12950865',
  });
  assert.equal(valid.id, '1961524952');
  assert.equal(valid.imdbId, 'tt16539454');
  assert.equal(valid.downloadsCount, 41263);
  assert.equal(valid.downloadUrl, 'https://dl.opensubtitles.org/en/download/filead/1961524952.gz');

  const unsafe = mapOpenSubtitlesRecord({
    IDSubtitleFile: '999',
    SubDownloadLink: 'https://attacker.test/bad.srt',
  });
  assert.equal(unsafe, null);
});

test('resolveMovieSubtitleAction prefers Kinyarwanda track and resolves clean studio URLs', () => {
  assert.equal(cleanMovieTitleForSubtitleSearch('Agasobanuye: Rocky 2026 — The Agent'), '');
  assert.equal(cleanMovieTitleForSubtitleSearch('Mirzapur Season 3'), 'Mirzapur');
  assert.equal(buildSubtitleDownloadFilename('Pushpa 2: The Rule', 'rw', 'srt'), 'Pushpa_2_The_Rule_rw.srt');

  const withSubs = resolveMovieSubtitleAction({
    id: 'pushpa-2-the-rule',
    title: 'Pushpa 2: The Rule',
    subtitles: [
      { language: 'English', label: 'English (VTT)', url: '/api/subtitles/sample?lang=en' },
      { language: 'Kinyarwanda', label: 'Kinyarwanda (VTT)', url: '/api/subtitles/sample?lang=rw' },
    ],
  });
  assert.equal(withSubs.hasAttachedTrack, true);
  assert.equal(withSubs.trackCount, 2);
  assert.equal(withSubs.preferredTrack.language, 'Kinyarwanda');
  assert.equal(withSubs.studioHref, '/subtitles?q=Pushpa%202%3A%20The%20Rule');
  assert.equal(withSubs.directDownloadFilename, 'Pushpa_2_The_Rule_kinyarwanda.srt');

  const withoutSubs = resolveMovieSubtitleAction({
    id: 'stree-2',
    title: 'Stree 2: Sarkate Ka Aatank',
  });
  assert.equal(withoutSubs.hasAttachedTrack, false);
  assert.equal(withoutSubs.preferredTrack, null);
  assert.equal(withoutSubs.studioHref, '/subtitles?q=Stree%202%3A%20Sarkate%20Ka%20Aatank');
});

test('getMovieThumbnailSlides deduplicates image candidates and getNextSlideIndex wraps cleanly', () => {
  const slides = getMovieThumbnailSlides({
    thumbnail_url: 'https://example.com/a.jpg',
    poster_url: 'https://example.com/a.jpg',
    backdrop_url: 'https://example.com/b.jpg',
    gallery: ['https://example.com/c.jpg', ' ', 'https://example.com/b.jpg'],
  });
  assert.deepEqual(slides, [
    'https://example.com/a.jpg',
    'https://example.com/b.jpg',
    'https://example.com/c.jpg',
  ]);

  assert.equal(getNextSlideIndex(0, 3, 1), 1);
  assert.equal(getNextSlideIndex(2, 3, 1), 0);
  assert.equal(getNextSlideIndex(0, 3, -1), 2);
  assert.equal(getNextSlideIndex(0, 0, 1), 0);
});

test('dedupeLatestSubtitlesByMovie distributes latest releases across distinct movies before repeating titles', () => {
  const input = [
    { id: 'p1', movieName: 'Pushpa: The Rule - Part 2' },
    { id: 'p2', movieName: 'Pushpa: The Rule - Part 2' },
    { id: 'p3', movieName: 'Pushpa: The Rule - Part 2' },
    { id: 'm1', movieName: 'Mirzapur' },
    { id: 's1', movieName: 'Stree 2' },
    { id: 'a1', movieName: 'Animal' },
  ];
  const picked = dedupeLatestSubtitlesByMovie(input, 4);
  assert.deepEqual(
    picked.map((x) => x.id),
    ['p1', 'm1', 's1', 'a1']
  );
  const all = dedupeLatestSubtitlesByMovie(input, 6);
  assert.equal(all.length, 6);
});

