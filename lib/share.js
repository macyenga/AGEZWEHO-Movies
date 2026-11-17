export function buildMovieShareUrl(movieId, origin) {
  const safeId = encodeURIComponent(String(movieId ?? '').trim());
  const rawOrigin = typeof origin === 'string' && origin.trim()
    ? origin.trim().replace(/\/+$/, '')
    : (typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://agasobanuye.rw');

  if (!safeId) return rawOrigin;
  return `${rawOrigin}/movies/${safeId}`;
}

export function buildMovieSharePayload(movie, origin) {
  const title = movie?.title ? String(movie.title).trim() : 'Agasobanuye.rw';
  const metaParts = [movie?.genre, movie?.year].filter(Boolean);
  const metaSuffix = metaParts.length > 0 ? ` (${metaParts.join(' · ')})` : '';
  const url = buildMovieShareUrl(movie?.id, origin);

  return {
    title,
    text: `Watch ${title}${metaSuffix} on Agasobanuye.rw`,
    url,
  };
}

export async function shareMovieLink({
  movie,
  origin,
  nav = typeof navigator !== 'undefined' ? navigator : undefined,
  doc = typeof document !== 'undefined' ? document : undefined,
} = {}) {
  const payload = buildMovieSharePayload(movie, origin);

  if (nav && typeof nav.share === 'function') {
    try {
      await nav.share(payload);
      return { status: 'shared', url: payload.url, payload };
    } catch (err) {
      if (err && err.name === 'AbortError') {
        return { status: 'cancelled', url: payload.url, payload };
      }
      // Non-abort errors (e.g., blocked in embedded iframe or unsupported desktop context)
      // fall through gracefully to clipboard copy below.
    }
  }

  if (nav?.clipboard && typeof nav.clipboard.writeText === 'function') {
    try {
      await nav.clipboard.writeText(payload.url);
      return { status: 'copied', url: payload.url, payload };
    } catch {
      // Fall through to legacy textarea copy if clipboard API rejects.
    }
  }

  if (doc && doc.body && typeof doc.createElement === 'function' && typeof doc.execCommand === 'function') {
    try {
      const textarea = doc.createElement('textarea');
      textarea.value = payload.url;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      doc.body.appendChild(textarea);
      textarea.select();
      const ok = doc.execCommand('copy');
      doc.body.removeChild(textarea);
      if (ok) {
        return { status: 'copied', url: payload.url, payload };
      }
    } catch {
      // Ignore DOM fallback errors.
    }
  }

  return { status: 'error', url: payload.url, payload };
}
