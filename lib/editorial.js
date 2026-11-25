import { collectPlayableSources } from './media-preview.js';
import { resolveMovieTrailerVideoId, buildYouTubeEmbedUrl, buildYouTubeWatchUrl } from './trailers.js';

export function extractExternalDomain(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('/')) return 'agasobanuye.rw';
  try {
    const parsed = new URL(trimmed);
    return parsed.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
}

export function classifyExternalLinkAttribution(url, label = '') {
  const domain = extractExternalDomain(url);
  const lower = `${domain} ${label}`.toLowerCase();

  if (domain.includes('youtube.com') || domain === 'youtu.be' || domain.includes('vimeo.com') || domain.includes('archive.org')) {
    return { domain: domain || 'external', category: 'Stream & Preview Embed', rel: 'noopener noreferrer nofollow' };
  }
  if (domain.includes('drive.google.com') || domain.includes('mega.nz') || domain.includes('mediafire.com')) {
    return { domain, category: 'Cloud File Mirror', rel: 'noopener noreferrer nofollow ugc' };
  }
  if (domain === 't.me' || domain.includes('telegram.') || domain.includes('wa.me')) {
    return { domain, category: 'Official Community Channel', rel: 'noopener noreferrer nofollow' };
  }
  if (
    lower.includes('netflix') ||
    lower.includes('primevideo') ||
    lower.includes('hotstar') ||
    lower.includes('jiocinema') ||
    lower.includes('sonyliv') ||
    lower.includes('zee5')
  ) {
    return { domain, category: 'Official Streaming Platform', rel: 'noopener noreferrer nofollow' };
  }
  return { domain: domain || 'external', category: 'External Resource', rel: 'noopener noreferrer nofollow ugc' };
}

export function resolvePreviewSourcesWithTrailerFallback(movie) {
  if (!movie || typeof movie !== 'object') return [];
  const direct = collectPlayableSources(movie);
  if (direct.length > 0) return direct;

  const fallbackYtId = resolveMovieTrailerVideoId(movie);
  if (!fallbackYtId) return [];

  const embedUrl = buildYouTubeEmbedUrl(fallbackYtId, { autoplay: true });
  if (!embedUrl) return [];

  return [
    {
      id: 'trailer-fallback-1',
      label: 'Preview Trailer',
      sourceType: 'trailer',
      url: buildYouTubeWatchUrl(movie, fallbackYtId),
      embedUrl,
      playerType: 'iframe',
      kind: 'youtube',
      info: 'Auto-matched preview',
    },
  ];
}

export function buildMovieEditorialGuide(movie) {
  if (!movie || typeof movie !== 'object') {
    return {
      narrationNote: '',
      editorialSummary: '',
      externalLinkDisclosure: '',
      facts: [],
    };
  }

  const title = movie.title || 'This release';
  const format = movie.type || 'Movie';
  const year = movie.year || '2026';
  const genre = movie.genre || 'Cinema';
  const language = movie.language || 'Kinyarwanda';
  const narrator = movie.uploaded_by || 'the Agasobanuye.rw editorial community';
  const subCount = Array.isArray(movie.subtitles) ? movie.subtitles.length : movie.subtitle_url ? 1 : 0;

  const narrationNote = `${title} (${year}) is indexed as a ${format.toLowerCase()} in ${genre}, curated with viewer commentary and translation context attributed to ${narrator}. Original audio and cultural adaptation notes help Rwandan and international audiences follow key plot turns, dialogue idioms, and regional references in ${language}.`;

  const editorialSummary =
    subCount > 0
      ? `This catalog guide includes ${subCount} synchronized subtitle ${subCount === 1 ? 'track' : 'tracks'} ready for .SRT / .VTT download or inline preview alongside external viewing mirrors.`
      : `Viewers can stream the inline preview directly on this page, open our Kinyarwanda Subtitle Studio to search or translate matching .SRT dialogue files, and check listed external platforms.`;

  const externalLinkDisclosure =
    'Agasobanuye.rw acts strictly as an editorial directory, subtitle translation studio, and review index. External watch and download links point to third-party platforms or creator-submitted cloud mirrors outside our servers.';

  const facts = [
    { label: 'Editorial Format', value: `${format} (${year})` },
    { label: 'Primary Genre', value: genre },
    { label: 'Dialogue & Narration', value: language },
    { label: 'Curator / Narrator', value: narrator },
    { label: 'Subtitle Tracks', value: subCount > 0 ? `${subCount} attached (.SRT / .VTT)` : 'Studio Search Ready' },
  ];

  return {
    narrationNote,
    editorialSummary,
    externalLinkDisclosure,
    facts,
  };
}

export function evaluateAdsenseReadiness(movie) {
  if (!movie || typeof movie !== 'object') {
    return { score: 0, passed: false, checks: [] };
  }
  const overviewWords = String(movie.overview || '').trim().split(/\s+/).filter(Boolean).length;
  const hasPoster = Boolean(movie.poster_url);
  const hasPlayablePreview = resolvePreviewSourcesWithTrailerFallback(movie).length > 0;
  const hasSubtitles = (Array.isArray(movie.subtitles) && movie.subtitles.length > 0) || Boolean(movie.subtitle_url);

  const checks = [
    { id: 'overview', label: 'Editorial synopsis & context', ok: overviewWords >= 8 },
    { id: 'poster', label: 'Verified cover artwork', ok: hasPoster },
    { id: 'preview', label: 'Auto-playable inline preview', ok: hasPlayablePreview },
    { id: 'attribution', label: 'Creator / external link attribution', ok: Boolean(movie.uploaded_by || movie.genre) },
    { id: 'subtitles', label: 'Subtitle track or studio support', ok: hasSubtitles || Boolean(movie.title) },
  ];
  const passedCount = checks.filter((c) => c.ok).length;
  const score = Math.round((passedCount / checks.length) * 100);
  return {
    score,
    passed: passedCount >= 4,
    checks,
  };
}

export function buildMovieFaqs(movie) {
  if (!movie || typeof movie !== 'object' || !String(movie.title || '').trim()) {
    return [];
  }

  const title = String(movie.title).trim();
  const year = movie.year ? String(movie.year).trim() : '';
  const typeLabel = movie.type ? String(movie.type).trim().toLowerCase() : 'movie';
  const genre = movie.genre ? String(movie.genre).trim() : 'Drama & Action';
  const language = movie.language ? String(movie.language).trim() : 'Kinyarwanda';
  const narrator = movie.uploaded_by ? String(movie.uploaded_by).trim() : 'the Agasobanuye.rw editorial team';
  const overview = String(movie.overview || '').trim();
  const hasPlayablePreview = resolvePreviewSourcesWithTrailerFallback(movie).length > 0;
  const subCount = Array.isArray(movie.subtitles) ? movie.subtitles.length : movie.subtitle_url ? 1 : 0;
  const officialPlatforms = Array.isArray(movie.platforms) ? movie.platforms.filter(Boolean) : [];
  const watchLinksCount = Array.isArray(movie.watch_links) ? movie.watch_links.length : 0;
  const linkCount = Array.isArray(movie.links) ? movie.links.length : 0;

  const genreArticle = /^[aeiou]/i.test(genre) ? 'an' : 'a';

  const faqs = [
    {
      id: 'about',
      question: `What is ${title}${year ? ` (${year})` : ''} about?`,
      answer: overview
        ? `${overview} It is listed as ${genreArticle} ${genre} ${typeLabel} (${language}) on Agasobanuye.rw.`
        : `${title}${year ? ` (${year})` : ''} is ${genreArticle} ${genre} ${typeLabel} featured in ${language} on Agasobanuye.rw with curated viewing context and release metadata.`,
    },
    {
      id: 'narrator-language',
      question: `Who translated or curated ${title}, and what language is it in?`,
      answer: `${title} is presented in ${language} and attributed to ${narrator}. You can explore cultural adaptation notes, viewer ratings, and community context directly on this title guide.`,
    },
    {
      id: 'subtitles',
      question: `Are Kinyarwanda or English subtitles (.SRT / .VTT) available for ${title}?`,
      answer:
        subCount > 0
          ? `Yes. ${title} currently has ${subCount} attached subtitle ${subCount === 1 ? 'track' : 'tracks'} (.SRT / .VTT) ready to preview inline or download, plus you can generate or translate additional Kinyarwanda subtitles via our Official Subtitle Studio.`
          : `You can search official .SRT subtitle releases for ${title} and translate them into Kinyarwanda using the built-in Subtitle Studio right on this page, or load your own .SRT / .VTT file inside the player.`,
    },
    {
      id: 'preview-watch',
      question: `How can I watch the preview or find official streaming platforms for ${title}?`,
      answer: [
        hasPlayablePreview
          ? `An inline preview player is ready on both this details page and the dedicated Watch Theater (/watch/${movie.id}).`
          : `Visit the dedicated Watch Theater (/watch/${movie.id}) for available playback options.`,
        officialPlatforms.length > 0
          ? `Official streaming availability matches include ${officialPlatforms.join(', ')}.`
          : '',
        watchLinksCount + linkCount > 0
          ? `${watchLinksCount + linkCount} external reference ${watchLinksCount + linkCount === 1 ? 'link is' : 'links are'} also indexed with domain attribution.`
          : '',
      ]
        .filter(Boolean)
        .join(' '),
    },
    {
      id: 'watchlist-support',
      question: `Can I save ${title} to my Watchlist or support the creator?`,
      answer: `Yes. Click Watchlist to bookmark ${title} in your browser or sync it to your signed-in account, and use the Support / MoMo Pay option (Merchant Code 156833) to tip ${narrator} for Kinyarwanda curation.`,
    },
  ];

  return faqs;
}

export function buildMovieFaqJsonLd(movie) {
  const faqs = buildMovieFaqs(movie);
  if (faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
