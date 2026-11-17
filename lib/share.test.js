import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMovieShareUrl,
  buildMovieSharePayload,
  shareMovieLink,
} from './share.js';

const SAMPLE_MOVIE = {
  id: 'agasobanuye-rocky-2026-agent',
  title: 'Rocky 2026: The Last Mission',
  genre: 'Action',
  year: 2026,
};

test('buildMovieShareUrl and buildMovieSharePayload produce valid share metadata', () => {
  assert.equal(
    buildMovieShareUrl('abc-123', 'https://agasobanuye.rw/'),
    'https://agasobanuye.rw/movies/abc-123'
  );
  assert.equal(
    buildMovieShareUrl('a b', 'http://localhost:3000'),
    'http://localhost:3000/movies/a%20b'
  );

  const payload = buildMovieSharePayload(SAMPLE_MOVIE, 'http://localhost:3000');
  assert.equal(payload.title, 'Rocky 2026: The Last Mission');
  assert.equal(payload.url, 'http://localhost:3000/movies/agasobanuye-rocky-2026-agent');
  assert.match(payload.text, /Rocky 2026: The Last Mission/);
  assert.match(payload.text, /Action · 2026/);
});

test('shareMovieLink uses navigator.share when supported and returns shared', async () => {
  let received = null;
  let clipboardCalled = false;

  const result = await shareMovieLink({
    movie: SAMPLE_MOVIE,
    origin: 'http://localhost:3000',
    nav: {
      share: async (data) => {
        received = data;
      },
      clipboard: {
        writeText: async () => {
          clipboardCalled = true;
        },
      },
    },
    doc: null,
  });

  assert.equal(result.status, 'shared');
  assert.equal(received.url, 'http://localhost:3000/movies/agasobanuye-rocky-2026-agent');
  assert.equal(clipboardCalled, false);
});

test('shareMovieLink treats user AbortError as cancelled without copying', async () => {
  let clipboardCalled = false;

  const result = await shareMovieLink({
    movie: SAMPLE_MOVIE,
    origin: 'http://localhost:3000',
    nav: {
      share: async () => {
        const err = new Error('Share cancelled');
        err.name = 'AbortError';
        throw err;
      },
      clipboard: {
        writeText: async () => {
          clipboardCalled = true;
        },
      },
    },
    doc: null,
  });

  assert.equal(result.status, 'cancelled');
  assert.equal(clipboardCalled, false);
});

test('shareMovieLink falls back to clipboard when navigator.share fails or is absent', async () => {
  let copiedText = '';

  const fallbackAfterError = await shareMovieLink({
    movie: SAMPLE_MOVIE,
    origin: 'http://localhost:3000',
    nav: {
      share: async () => {
        throw new Error('NotAllowedError');
      },
      clipboard: {
        writeText: async (text) => {
          copiedText = text;
        },
      },
    },
    doc: null,
  });

  assert.equal(fallbackAfterError.status, 'copied');
  assert.equal(copiedText, 'http://localhost:3000/movies/agasobanuye-rocky-2026-agent');

  copiedText = '';
  const clipboardOnly = await shareMovieLink({
    movie: SAMPLE_MOVIE,
    origin: 'https://agasobanuye.rw',
    nav: {
      clipboard: {
        writeText: async (text) => {
          copiedText = text;
        },
      },
    },
    doc: null,
  });

  assert.equal(clipboardOnly.status, 'copied');
  assert.equal(copiedText, 'https://agasobanuye.rw/movies/agasobanuye-rocky-2026-agent');
});

test('shareMovieLink returns error when neither Web Share nor clipboard succeeds', async () => {
  const result = await shareMovieLink({
    movie: SAMPLE_MOVIE,
    origin: 'http://localhost:3000',
    nav: {},
    doc: null,
  });

  assert.equal(result.status, 'error');
  assert.equal(result.url, 'http://localhost:3000/movies/agasobanuye-rocky-2026-agent');
});
