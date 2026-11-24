import { extractYouTubeVideoId, buildYouTubeEmbedUrl } from './trailers.js';

const DIRECT_VIDEO_EXT_RE = /\.(mp4|webm|ogg|ogv|m4v|mov)(?:[?#].*)?$/i;
const SUBTITLE_EXT_RE = /\.(vtt|srt)(?:[?#].*)?$/i;

export function isSafeHttpUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/api/subtitles/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function extractGoogleDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    if (host !== 'drive.google.com' && host !== 'docs.google.com') return null;

    const match = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];

    const idParam = parsed.searchParams.get('id');
    if (idParam && /^[a-zA-Z0-9_-]+$/.test(idParam)) return idParam;
  } catch {
    return null;
  }
  return null;
}

export function extractVimeoVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    if (host !== 'vimeo.com' && host !== 'player.vimeo.com') return null;
    const match = parsed.pathname.match(/(?:\/video)?\/(\d+)/);
    return match && match[1] ? match[1] : null;
  } catch {
    return null;
  }
}

export function extractArchiveItemId(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    if (host !== 'archive.org') return null;
    const match = parsed.pathname.match(/^\/(?:details|embed)\/([^/?#]+)/i);
    return match && match[1] ? match[1] : null;
  } catch {
    return null;
  }
}

export function extractDailymotionVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    if (host === 'dai.ly') {
      const seg = parsed.pathname.split('/').filter(Boolean)[0];
      return seg || null;
    }
    if (host === 'dailymotion.com' || host === 'geo.dailymotion.com') {
      const match = parsed.pathname.match(/\/(?:embed\/)?video\/([a-zA-Z0-9]+)/);
      return match && match[1] ? match[1] : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function classifyPreviewLink(url, fallbackLabel = '') {
  if (!isSafeHttpUrl(url)) {
    return { playable: false, kind: 'invalid', playerType: null, embedUrl: null, label: fallbackLabel || 'Link' };
  }

  const trimmed = url.trim();
  if (trimmed.startsWith('/')) {
    return { playable: false, kind: 'external', playerType: null, embedUrl: null, label: fallbackLabel || 'Link' };
  }

  const ytId = extractYouTubeVideoId(trimmed);
  if (ytId) {
    return {
      playable: true,
      kind: 'youtube',
      playerType: 'iframe',
      embedUrl: buildYouTubeEmbedUrl(ytId, { autoplay: true }),
      label: fallbackLabel || 'YouTube Stream',
    };
  }

  const vimeoId = extractVimeoVideoId(trimmed);
  if (vimeoId) {
    return {
      playable: true,
      kind: 'vimeo',
      playerType: 'iframe',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
      label: fallbackLabel || 'Vimeo Player',
    };
  }

  const driveId = extractGoogleDriveFileId(trimmed);
  if (driveId) {
    return {
      playable: true,
      kind: 'gdrive',
      playerType: 'iframe',
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      label: fallbackLabel || 'Google Drive Preview',
    };
  }

  const archiveId = extractArchiveItemId(trimmed);
  if (archiveId) {
    return {
      playable: true,
      kind: 'archive',
      playerType: 'iframe',
      embedUrl: `https://archive.org/embed/${archiveId}`,
      label: fallbackLabel || 'Archive.org Player',
    };
  }

  const dmId = extractDailymotionVideoId(trimmed);
  if (dmId) {
    return {
      playable: true,
      kind: 'dailymotion',
      playerType: 'iframe',
      embedUrl: `https://www.dailymotion.com/embed/video/${dmId}?autoplay=1`,
      label: fallbackLabel || 'Dailymotion Player',
    };
  }

  try {
    const parsed = new URL(trimmed);
    const pathname = parsed.pathname || '';
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();

    if (DIRECT_VIDEO_EXT_RE.test(pathname) || DIRECT_VIDEO_EXT_RE.test(trimmed)) {
      return {
        playable: true,
        kind: 'direct-video',
        playerType: 'video',
        embedUrl: trimmed,
        label: fallbackLabel || 'Direct Video',
      };
    }

    if (
      /\/(embed|player)\//i.test(pathname) ||
      host.includes('streamtape') ||
      host.includes('dood') ||
      host.includes('vidsrc') ||
      host.includes('filemoon') ||
      host === 'ok.ru'
    ) {
      return {
        playable: true,
        kind: 'embed',
        playerType: 'iframe',
        embedUrl: trimmed,
        label: fallbackLabel || 'Embedded Player',
      };
    }
  } catch {
    // ignore URL errors
  }

  return {
    playable: false,
    kind: 'external',
    playerType: null,
    embedUrl: null,
    label: fallbackLabel || 'External Link',
  };
}

export function collectPlayableSources(movie) {
  if (!movie || typeof movie !== 'object') return [];
  const sources = [];
  const seen = new Set();

  const pushSource = (url, label, sourceType, info = '') => {
    if (!url || typeof url !== 'string') return;
    const trimmed = url.trim();
    if (!trimmed) return;
    const classified = classifyPreviewLink(trimmed, label);
    if (!classified.playable || !classified.embedUrl) return;
    const key = classified.embedUrl.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    sources.push({
      id: `${sourceType}-${sources.length + 1}`,
      label: label || classified.label,
      sourceType,
      url: trimmed,
      embedUrl: classified.embedUrl,
      playerType: classified.playerType,
      kind: classified.kind,
      info: info || '',
    });
  };

  if (Array.isArray(movie.watch_links)) {
    movie.watch_links.forEach((link, idx) => {
      if (link?.url) {
        pushSource(link.url, link.label || `Watch Server ${idx + 1}`, 'stream', link.info || '');
      }
    });
  }

  if (movie.trailer_url) {
    pushSource(movie.trailer_url, 'Official Trailer', 'trailer');
  }

  if (Array.isArray(movie.links)) {
    movie.links.forEach((link, idx) => {
      if (link?.url) {
        pushSource(link.url, link.label || `Preview Mirror ${idx + 1}`, 'download-preview', link.info || '');
      }
    });
  }

  return sources;
}

export function normalizeSubtitles(subtitles, fallbackUrl = '', fallbackLang = 'Kinyarwanda') {
  const list = [];
  const seen = new Set();

  const pushTrack = (item, idx) => {
    if (!item) return;
    const rawUrl = typeof item === 'string' ? item : item.url;
    if (!isSafeHttpUrl(rawUrl)) return;
    const url = rawUrl.trim();
    const key = url.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    const language = (typeof item === 'object' && item.language ? String(item.language).trim() : '') || fallbackLang;
    const label =
      (typeof item === 'object' && item.label ? String(item.label).trim() : '') ||
      `${language} Subtitles`;
    const formatMatch = url.match(SUBTITLE_EXT_RE);
    const format = formatMatch ? formatMatch[1].toLowerCase() : (url.includes('lang=') ? 'vtt' : 'vtt');

    list.push({
      id: (typeof item === 'object' && item.id) || `sub-${idx + 1}`,
      language,
      label,
      url,
      format,
    });
  };

  if (Array.isArray(subtitles)) {
    subtitles.forEach((item, idx) => pushTrack(item, idx));
  }
  if (fallbackUrl) {
    pushTrack({ language: fallbackLang, label: `${fallbackLang} Subtitles`, url: fallbackUrl }, list.length);
  }

  return list;
}

export function srtToVtt(srtText) {
  if (!srtText || typeof srtText !== 'string') return 'WEBVTT\n\n';
  const normalized = srtText.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return 'WEBVTT\n\n';
  if (/^WEBVTT/i.test(normalized)) return normalized;

  const converted = normalized.replace(
    /(\d{2}:\d{2}:\d{2}),(\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}),(\d{3})/g,
    '$1.$2 --> $3.$4'
  );
  return `WEBVTT\n\n${converted}\n`;
}

function parseTimestampToSeconds(ts) {
  const clean = String(ts || '').trim().replace(',', '.');
  const parts = clean.split(':');
  if (parts.length === 3) {
    const h = Number(parts[0]) || 0;
    const m = Number(parts[1]) || 0;
    const s = Number(parts[2]) || 0;
    return h * 3600 + m * 60 + s;
  }
  if (parts.length === 2) {
    const m = Number(parts[0]) || 0;
    const s = Number(parts[1]) || 0;
    return m * 60 + s;
  }
  return 0;
}

export function parseVttCues(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];
  const vtt = srtToVtt(rawText);
  const blocks = vtt.split(/\n{2,}/);
  const cues = [];

  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0 || /^WEBVTT/i.test(lines[0])) continue;

    const timeIdx = lines.findIndex((line) => line.includes('-->'));
    if (timeIdx === -1) continue;

    const [startRaw, endRawWithMeta] = lines[timeIdx].split('-->');
    const endRaw = (endRawWithMeta || '').trim().split(/\s+/)[0];
    const startSec = parseTimestampToSeconds(startRaw);
    const endSec = parseTimestampToSeconds(endRaw);
    const text = lines.slice(timeIdx + 1).join('\n').trim();

    if (text && endSec >= startSec) {
      cues.push({ startSec, endSec, text });
    }
  }

  return cues;
}
