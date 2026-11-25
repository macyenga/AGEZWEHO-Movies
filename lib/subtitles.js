const ALLOWED_SUBTITLE_HOSTS = new Set([
  'dl.opensubtitles.org',
  'dl.opensubtitles.com',
  'www.opensubtitles.org',
]);

export const OFFICIAL_SUBTITLE_LANGUAGES = [
  { id: 'eng', label: 'English' },
  { id: 'fre', label: 'French' },
  { id: 'hin', label: 'Hindi' },
  { id: 'spa', label: 'Spanish' },
  { id: 'ara', label: 'Arabic' },
  { id: 'all', label: 'All Languages' },
];

export function normalizeOfficialSubtitleUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let candidate = rawUrl.trim();
  if (!candidate) return null;
  if (candidate.startsWith('http://dl.opensubtitles.')) {
    candidate = `https://${candidate.slice('http://'.length)}`;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:') return null;
    if (parsed.username || parsed.password) return null;
    const host = parsed.hostname.toLowerCase();
    if (!ALLOWED_SUBTITLE_HOSTS.has(host)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function isOfficialSubtitleDownloadUrl(rawUrl) {
  return Boolean(normalizeOfficialSubtitleUrl(rawUrl));
}

export function sanitizeSubtitleFilename(name, ext = 'srt') {
  const safeExt = ext === 'vtt' ? 'vtt' : 'srt';
  const leaf = String(name || 'subtitle').split(/[/\\]+/).pop() || 'subtitle';
  const base = leaf
    .replace(/(\.(srt|vtt|gz|zip))+$/i, '')
    .replace(/\.{2,}/g, '_')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^[._-]+|[._-]+$/g, '')
    .slice(0, 80);

  return `${base || 'subtitle'}.${safeExt}`;
}

function toSrtTimestamp(rawTs) {
  const clean = String(rawTs || '').trim().split(/\s+/)[0];
  if (!clean) return '00:00:00,000';

  const normalized = clean.replace('.', ',');
  const parts = normalized.split(':');
  if (parts.length === 2) {
    const [mm, ssMs] = parts;
    const [ss = '00', ms = '000'] = ssMs.split(',');
    return `00:${mm.padStart(2, '0')}:${ss.padStart(2, '0')},${ms.padEnd(3, '0').slice(0, 3)}`;
  }
  if (parts.length === 3) {
    const [hh, mm, ssMs] = parts;
    const [ss = '00', ms = '000'] = ssMs.split(',');
    return `${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:${ss.padStart(2, '0')},${ms.padEnd(3, '0').slice(0, 3)}`;
  }
  return '00:00:00,000';
}

function toVttTimestamp(srtTs) {
  return toSrtTimestamp(srtTs).replace(',', '.');
}

export function parseSubtitleCues(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];
  const normalized = rawText
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  if (!normalized) return [];

  const blocks = normalized.split(/\n{2,}/);
  const cues = [];

  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((line) => line.trimEnd())
      .filter((line) => line.trim() !== '');

    if (lines.length === 0) continue;
    if (/^WEBVTT/i.test(lines[0].trim()) || /^NOTE\b/i.test(lines[0].trim())) continue;

    const timingIdx = lines.findIndex((line) => line.includes('-->'));
    if (timingIdx === -1) continue;

    const [startRaw, endRaw] = lines[timingIdx].split('-->');
    if (!startRaw || !endRaw) continue;

    const textLines = lines.slice(timingIdx + 1).map((l) => l.trim()).filter(Boolean);
    if (textLines.length === 0) continue;

    cues.push({
      index: cues.length + 1,
      startTime: toSrtTimestamp(startRaw),
      endTime: toSrtTimestamp(endRaw),
      text: textLines.join('\n'),
    });
  }

  return cues;
}

export function formatCuesToSrt(cues, { useTranslated = false } = {}) {
  if (!Array.isArray(cues) || cues.length === 0) return '';

  return (
    cues
      .map((cue, idx) => {
        const body =
          useTranslated && typeof cue.translatedText === 'string' && cue.translatedText.trim()
            ? cue.translatedText.trim()
            : String(cue.text || '').trim();
        return `${idx + 1}\n${toSrtTimestamp(cue.startTime)} --> ${toSrtTimestamp(cue.endTime)}\n${body}`;
      })
      .join('\n\n') + '\n'
  );
}

export function formatCuesToVtt(cues, { useTranslated = false } = {}) {
  if (!Array.isArray(cues) || cues.length === 0) return 'WEBVTT\n\n';

  const body = cues
    .map((cue) => {
      const text =
        useTranslated && typeof cue.translatedText === 'string' && cue.translatedText.trim()
          ? cue.translatedText.trim()
          : String(cue.text || '').trim();
      return `${toVttTimestamp(cue.startTime)} --> ${toVttTimestamp(cue.endTime)}\n${text}`;
    })
    .join('\n\n');

  return `WEBVTT\n\n${body}\n`;
}

export function chunkCuesForTranslation(cues, chunkSize = 50) {
  if (!Array.isArray(cues) || cues.length === 0) return [];
  const size = Math.max(1, Math.min(100, Number(chunkSize) || 50));
  const chunks = [];
  for (let i = 0; i < cues.length; i += size) {
    chunks.push(cues.slice(i, i + size));
  }
  return chunks;
}

export function mergeTranslatedCues(originalCues, translatedItems) {
  const byIndex = new Map();
  if (Array.isArray(translatedItems)) {
    for (const item of translatedItems) {
      if (item && Number.isFinite(Number(item.index)) && typeof item.translatedText === 'string') {
        byIndex.set(Number(item.index), item.translatedText.trim());
      }
    }
  }

  return (originalCues || []).map((cue) => ({
    ...cue,
    translatedText: byIndex.get(cue.index) || cue.translatedText || cue.text,
  }));
}

export function mapOpenSubtitlesRecord(item) {
  if (!item || typeof item !== 'object') return null;
  const downloadUrl = normalizeOfficialSubtitleUrl(item.SubDownloadLink);
  if (!downloadUrl) return null;

  const year = item.MovieYear ? String(item.MovieYear).trim() : '';
  const movieName = item.MovieName ? String(item.MovieName).trim() : 'Untitled Release';
  const fileName = item.SubFileName ? String(item.SubFileName).trim() : `${movieName}.srt`;
  const language = item.LanguageName ? String(item.LanguageName).trim() : 'English';
  const format = item.SubFormat ? String(item.SubFormat).trim().toLowerCase() : 'srt';
  const downloadsCount = Number.parseInt(item.SubDownloadsCnt || '0', 10) || 0;

  return {
    id: String(item.IDSubtitleFile || fileName),
    movieName,
    year,
    imdbId: item.IDMovieImdb ? `tt${String(item.IDMovieImdb).replace(/^tt/i, '').padStart(7, '0')}` : '',
    fileName,
    language,
    languageCode: item.ISO639 ? String(item.ISO639).toLowerCase() : 'en',
    format: format === 'vtt' ? 'vtt' : 'srt',
    downloadsCount,
    addedAt: item.SubAddDate ? String(item.SubAddDate).trim() : '',
    downloadUrl,
    pageUrl: normalizeOfficialSubtitleUrl(item.SubtitlesLink) || null,
    source: 'OpenSubtitles Official',
  };
}

export function cleanMovieTitleForSubtitleSearch(rawTitle) {
  return String(rawTitle || '')
    .replace(/^Agasobanuye\s*:\s*/i, '')
    .replace(/\b(Rocky|Sankara|Gashya|Junior Giti)\s*20\d{2}\b/gi, '')
    .replace(/\s*[—–-]\s*(The Agent|Bloodline).*$/i, '')
    .replace(/Season\s+\d+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildSubtitleDownloadFilename(title, lang = 'rw', ext = 'srt') {
  const cleanTitle = String(title || 'subtitle').trim() || 'subtitle';
  const safeLang = String(lang || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
  const base = safeLang ? `${cleanTitle}_${safeLang}` : cleanTitle;
  return sanitizeSubtitleFilename(base, ext);
}

export function resolveMovieSubtitleAction(movie) {
  const title = movie && typeof movie === 'object' ? String(movie.title || '').trim() : '';
  const searchTitle = cleanMovieTitleForSubtitleSearch(title) || title;
  const rawSubs = movie && Array.isArray(movie.subtitles) ? movie.subtitles : [];
  const tracks = rawSubs.filter(
    (s) => s && typeof s === 'object' && typeof s.url === 'string' && s.url.trim()
  );

  const preferredTrack =
    tracks.find((t) => /kinyarwanda|rw/i.test(`${t.language || ''} ${t.label || ''}`)) ||
    tracks[0] ||
    null;

  const langSuffix = preferredTrack
    ? /kinyarwanda|rw/i.test(`${preferredTrack.language || ''} ${preferredTrack.label || ''}`)
      ? 'kinyarwanda'
      : String(preferredTrack.language || 'sub').toLowerCase()
    : 'subtitles';

  return {
    hasAttachedTrack: Boolean(preferredTrack),
    trackCount: tracks.length,
    tracks,
    preferredTrack,
    searchTitle,
    studioHref: searchTitle ? `/subtitles?q=${encodeURIComponent(searchTitle)}` : '/subtitles',
    detailSubtitlesHref: movie?.id ? `/movies/${movie.id}#subtitles` : '/subtitles',
    directDownloadFilename: buildSubtitleDownloadFilename(title || 'movie', langSuffix, 'srt'),
  };
}

export function getMovieThumbnailSlides(movie) {
  if (!movie || typeof movie !== 'object') return [];
  const candidates = [
    movie.thumbnail_url,
    movie.poster_url,
    movie.backdrop_url,
    ...(Array.isArray(movie.gallery) ? movie.gallery : []),
    ...(Array.isArray(movie.thumbnails) ? movie.thumbnails : []),
  ];

  const seen = new Set();
  const slides = [];
  for (const item of candidates) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    slides.push(trimmed);
  }
  return slides;
}

export function getNextSlideIndex(current, total, direction = 1) {
  const count = Number(total);
  if (!Number.isFinite(count) || count <= 0) return 0;
  const idx = Number.isFinite(Number(current)) ? Math.trunc(Number(current)) : 0;
  const step = Number.isFinite(Number(direction)) ? Math.trunc(Number(direction)) : 1;
  return (((idx + step) % count) + count) % count;
}

export function dedupeLatestSubtitlesByMovie(items, limit = 20) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const cap = Math.max(1, Number(limit) || 20);
  const buckets = new Map();

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const key = String(item.movieName || item.title || item.id || '')
      .trim()
      .toLowerCase();
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(item);
  }

  const result = [];
  let added = true;
  while (result.length < cap && added) {
    added = false;
    for (const group of buckets.values()) {
      if (group.length > 0 && result.length < cap) {
        result.push(group.shift());
        added = true;
      }
    }
  }
  return result;
}


