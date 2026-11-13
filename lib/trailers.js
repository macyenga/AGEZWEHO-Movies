const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

const FALLBACK_TRAILER_MAP = {
  'pushpa-2-the-rule': 'g3JUbgOHgdw',
  'agasobanuye-rocky-2026-agent': 'g3JUbgOHgdw',
  'agasobanuye-sankara-2026-bloodline': '8FkLRUJj-o0',
  'stree-2': 'KVnheXywIbY',
  'mirzapur-s3': '33o3s4Vs4Sw',
  'animal-2023': '8FkLRUJj-o0',
  'solo-leveling-anime': 'eqy85AL70PU',
  'gorillas-in-the-mist-rwanda': 'XzWjio_RuNE',
};

export function extractYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();

    if (host === 'youtu.be') {
      const candidate = parsed.pathname.split('/').filter(Boolean)[0];
      return candidate && YOUTUBE_ID_REGEX.test(candidate) ? candidate : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const vParam = parsed.searchParams.get('v');
      if (vParam && YOUTUBE_ID_REGEX.test(vParam)) return vParam;

      const segments = parsed.pathname.split('/').filter(Boolean);
      if (
        segments.length >= 2 &&
        (segments[0] === 'embed' || segments[0] === 'shorts' || segments[0] === 'live') &&
        YOUTUBE_ID_REGEX.test(segments[1])
      ) {
        return segments[1];
      }
    }
  } catch {
    const match = trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) return match[1];
  }

  return null;
}

export function resolveMovieTrailerVideoId(movie) {
  if (!movie) return null;

  const fromTrailerUrl = extractYouTubeVideoId(movie.trailer_url);
  if (fromTrailerUrl) return fromTrailerUrl;

  if (Array.isArray(movie.watch_links)) {
    for (const link of movie.watch_links) {
      const id = extractYouTubeVideoId(link?.url);
      if (id) return id;
    }
  }

  if (movie.id && FALLBACK_TRAILER_MAP[movie.id]) {
    return FALLBACK_TRAILER_MAP[movie.id];
  }

  return null;
}

export function buildYouTubeEmbedUrl(videoId, { autoplay = true } = {}) {
  if (!videoId || !YOUTUBE_ID_REGEX.test(videoId)) return null;
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    enablejsapi: '1',
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function buildYouTubeWatchUrl(movie, videoId) {
  if (videoId && YOUTUBE_ID_REGEX.test(videoId)) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
  const query = [movie?.title, movie?.year, 'official trailer'].filter(Boolean).join(' ');
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query || 'movie trailer')}`;
}
