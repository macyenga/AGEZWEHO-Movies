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
