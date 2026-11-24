import zlib from 'node:zlib';
import {
  mapOpenSubtitlesRecord,
  normalizeOfficialSubtitleUrl,
  parseSubtitleCues,
} from '../subtitles.js';

const OPENSUBTITLES_REST_BASE = 'https://rest.opensubtitles.org/search';
const OPENSUBTITLES_UA = 'TemporaryUserAgent';
const MAX_SUBTITLE_BYTES = 2 * 1024 * 1024; // 2 MB cap

const VALID_LANG_CODES = new Set(['eng', 'fre', 'hin', 'spa', 'ara', 'all']);

async function fetchJsonWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': OPENSUBTITLES_UA,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Upstream subtitle search returned HTTP ${res.status}`);
    }
    const text = await res.text();
    if (!text || text.trim().startsWith('<')) {
      throw new Error('Upstream subtitle service returned non-JSON response');
    }
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

export async function searchOfficialSubtitles({
  query = '',
  imdbId = '',
  lang = 'eng',
  limit = 16,
} = {}) {
  const cleanLang = VALID_LANG_CODES.has(String(lang).toLowerCase())
    ? String(lang).toLowerCase()
    : 'eng';
  const cleanImdb = String(imdbId || '').replace(/^tt/i, '').replace(/\D/g, '');
  const cleanQuery = String(query || '').trim();

  const segments = [];
  if (cleanImdb) {
    segments.push(`imdbid-${encodeURIComponent(cleanImdb)}`);
  } else if (cleanQuery) {
    segments.push(`query-${encodeURIComponent(cleanQuery.toLowerCase())}`);
  } else {
    throw new Error('Search query or IMDb ID is required');
  }

  if (cleanLang !== 'all') {
    segments.push(`sublanguageid-${cleanLang}`);
  }

  const endpoint = `${OPENSUBTITLES_REST_BASE}/${segments.join('/')}`;
  const rawList = await fetchJsonWithTimeout(endpoint);
  const mapped = (Array.isArray(rawList) ? rawList : [])
    .map(mapOpenSubtitlesRecord)
    .filter(Boolean);

  // Deduplicate by file ID and prioritize newest + most downloaded official tracks
  const seen = new Set();
  const deduped = [];
  for (const item of mapped) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    deduped.push(item);
  }

  deduped.sort((a, b) => {
    const dateDiff = String(b.addedAt || '').localeCompare(String(a.addedAt || ''));
    if (dateDiff !== 0) return dateDiff;
    return b.downloadsCount - a.downloadsCount;
  });

  return deduped.slice(0, Math.max(1, Math.min(30, limit)));
}

export async function fetchOfficialSubtitleContent(rawUrl) {
  const safeUrl = normalizeOfficialSubtitleUrl(rawUrl);
  if (!safeUrl) {
    const err = new Error('Subtitle URL must be an official OpenSubtitles download link.');
    err.statusCode = 400;
    throw err;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    let targetUrl = safeUrl;
    let res = await fetch(targetUrl, {
      headers: { 'User-Agent': OPENSUBTITLES_UA },
      redirect: 'manual',
      signal: controller.signal,
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      const resolved = location ? new URL(location, targetUrl).toString() : '';
      const safeRedirect = normalizeOfficialSubtitleUrl(resolved);
      if (!safeRedirect) {
        const err = new Error('Redirect target is not an allowlisted official subtitle host.');
        err.statusCode = 400;
        throw err;
      }
      targetUrl = safeRedirect;
      res = await fetch(targetUrl, {
        headers: { 'User-Agent': OPENSUBTITLES_UA },
        redirect: 'manual',
        signal: controller.signal,
      });
    }

    if (!res.ok) {
      const err = new Error(`Failed to download official subtitle (HTTP ${res.status})`);
      err.statusCode = 502;
      throw err;
    }

    const contentLength = Number(res.headers.get('content-length') || '0');
    if (contentLength > MAX_SUBTITLE_BYTES) {
      const err = new Error('Subtitle file exceeds the 2 MB limit.');
      err.statusCode = 413;
      throw err;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_SUBTITLE_BYTES) {
      const err = new Error('Subtitle file exceeds the 2 MB limit.');
      err.statusCode = 413;
      throw err;
    }

    let decodedBuffer = buf;
    const isGzip = buf.length >= 2 && buf[0] === 0x1f && buf[1] === 0x8b;
    if (isGzip) {
      decodedBuffer = zlib.gunzipSync(buf);
      if (decodedBuffer.length > MAX_SUBTITLE_BYTES * 2) {
        const err = new Error('Decompressed subtitle exceeds size limit.');
        err.statusCode = 413;
        throw err;
      }
    }

    const rawText = decodedBuffer.toString('utf8').replace(/^\uFEFF/, '');
    const cues = parseSubtitleCues(rawText);

    return {
      rawText,
      cues,
      byteLength: decodedBuffer.length,
    };
  } finally {
    clearTimeout(timer);
  }
}
