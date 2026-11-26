import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { getMovieById } from '../../lib/supabase';
import SEOHead from '../../components/SEOHead';
import CinematicBackground from '../../components/CinematicBackground';
import AdBanner from '../../components/ads/AdBanner';
import SmartMediaPlayer from '../../components/SmartMediaPlayer';
import OfficialSubtitleStudio from '../../components/OfficialSubtitleStudio';
import { useDonate } from '../../contexts/DonateContext';
import { useCollection } from '../../hooks/useCollection';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTrailer } from '../../contexts/TrailerContext';
import { calculateMovieViewBonus } from '../../lib/uploader-earnings';
import {
  classifyPreviewLink,
  normalizeSubtitles,
} from '../../lib/media-preview';
import {
  resolvePreviewSourcesWithTrailerFallback,
  buildMovieEditorialGuide,
  classifyExternalLinkAttribution,
  buildMovieFaqs,
  buildMovieFaqJsonLd,
} from '../../lib/editorial';
import MovieFaqSection from '../../components/MovieFaqSection';
import WatchProgressBar from '../../components/WatchProgressBar';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ArrowLeft, Star, Download, ExternalLink, Film, User, Tv2,
  Share2, Copy, Check, Play, Bookmark, HeartHandshake, Wallet,
  HelpCircle, Eye, Globe, Subtitles, Languages, BookOpen, ShieldCheck,
} from 'lucide-react';

const SITE_URL = 'https://agasobanuye.rw';
const GOLD = 'var(--gold)';
const GOLD_LIGHT = 'var(--gold2)';

const sharePlatforms = [
  { name: 'WhatsApp', color: '#16a34a', url: (u, t) => `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}` },
  { name: 'Telegram', color: '#0284c7', url: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { name: 'Facebook', color: '#1877F2', url: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { name: 'X', color: null, url: (u, t) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}` },
];

const OFFICIAL_PLATFORMS = [
  { name: 'Netflix', color: '#E50914', url: 'https://www.netflix.com/search?q=' },
  { name: 'Amazon Prime Video', color: '#00A8E1', url: 'https://www.primevideo.com/search/ref=atv_nb_sr?phrase=' },
  { name: 'JioCinema', color: '#6B4DE6', url: 'https://www.jiocinema.com/search/' },
  { name: 'JioHotstar', color: '#1F80E0', url: 'https://www.hotstar.com/in/search?q=' },
  { name: 'YouTube', color: '#FF0000', url: 'https://www.youtube.com/results?search_query=' },
  { name: 'SonyLIV', color: '#0057A8', url: 'https://www.sonyliv.com/search/' },
  { name: 'ZEE5', color: '#7B2FBE', url: 'https://www.zee5.com/search?q=' },
  { name: 'MX Player', color: '#FF6C00', url: 'https://www.mxplayer.in/search?query=' },
];

export default function MovieDetail({ movie }) {
  const playableSources = useMemo(() => resolvePreviewSourcesWithTrailerFallback(movie), [movie]);
  const subtitleTracks = useMemo(
    () => normalizeSubtitles(movie?.subtitles, movie?.subtitle_url, movie?.language || 'Kinyarwanda'),
    [movie?.subtitles, movie?.subtitle_url, movie?.language]
  );
  const editorialGuide = useMemo(() => buildMovieEditorialGuide(movie), [movie]);
  const movieFaqs = useMemo(() => buildMovieFaqs(movie), [movie]);
  const movieFaqJsonLd = useMemo(() => buildMovieFaqJsonLd(movie), [movie]);

  const [copiedShare, setCopiedShare] = useState(false);
  const [showInlinePlayer, setShowInlinePlayer] = useState(playableSources.length > 0);
  const [selectedSourceId, setSelectedSourceId] = useState(null);
  const [selectedSubtitleId, setSelectedSubtitleId] = useState(null);
  const [showOfficialSubFinder, setShowOfficialSubFinder] = useState(false);
  const [generatedSubtitles, setGeneratedSubtitles] = useState([]);
  const playerSectionRef = useRef(null);
  const { openDonate } = useDonate();
  const { toggleWatchlist, isInWatchlist } = useCollection();
  const { openTrailer } = useTrailer();
  const { t } = useLanguage();
  const { isLight } = useTheme();
  const inWatchlist = movie?.id ? isInWatchlist(movie.id) : false;

  useEffect(() => {
    setShowInlinePlayer(playableSources.length > 0);
    setSelectedSourceId(playableSources[0]?.id || null);
  }, [movie?.id, playableSources]);

  const launchInlinePreview = (sourceUrl = null, subtitleId = null) => {
    if (sourceUrl) {
      const classified = classifyPreviewLink(sourceUrl);
      const matched = playableSources.find(
        (s) => s.url === sourceUrl || (classified.embedUrl && s.embedUrl === classified.embedUrl)
      );
      if (matched) setSelectedSourceId(matched.id);
    }
    if (subtitleId) {
      setSelectedSubtitleId(subtitleId);
    }
    setShowInlinePlayer(true);
    setTimeout(() => {
      playerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  useEffect(() => {
    if (!movie?.genre && !movie?.title) return;
    try {
      const stored = JSON.parse(localStorage.getItem('agezweho_viewed_genres') || '[]');
      const genres = (movie.genre || '')
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);
      const updated = [...new Set([...genres, ...stored])].slice(0, 10);
      localStorage.setItem('agezweho_viewed_genres', JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  }, [movie?.id, movie?.genre, movie?.title]);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep">
        <CinematicBackground />
        <div className="text-center z-10 px-6">
          <h1 className="font-cinzel text-2xl mb-4" style={{ fontFamily: 'Cinzel, serif', color: GOLD_LIGHT }}>
            Title Not Found
          </h1>
          <Link
            href="/"
            className="btn-ghost inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold"
          >
            <ArrowLeft size={13} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const links = Array.isArray(movie.links) ? movie.links : [];
  const watchLinks = Array.isArray(movie.watch_links) ? movie.watch_links : [];
  const pageUrl = `${SITE_URL}/movies/${movie.id}`;
  const primaryWatch = watchLinks[0];
  const primaryDownload = links[0];
  const ratingValue = Number.parseFloat(movie.rating);
  const viewCount = Number(movie.views) || 0;
  const tipEarnings = Number(movie.uploader_earnings) || 0;
  const viewBonus = movie.status === 'approved' ? calculateMovieViewBonus(viewCount) : 0;
  const totalCreatorEarnings = tipEarnings + viewBonus;

  const seoTitle = `${movie.title} ${movie.year || ''} - Agasobanuye Watch, Download | Agasobanuye.rw`;
  const seoDescription =
    movie.overview ||
    `Watch and download ${movie.title} — Agasobanuye — on Agasobanuye.rw, Rwanda's home for Agasobanuye entertainment, Rocky 2026, Sankara 2026, Agent Kim, Gashya 2026 Netflix and more.`;
  const seoKeywords = `${movie.title} download, ${movie.title} ${movie.year || ''}, agasobanuye, agasobanuye rocky 2026, agasobanuye sankara 2026, agasobanuye agent kim, agasobanuye gashya 2026 netflix, agasobanuye by rocky kimomo, ${movie.title} 1080p download, ${movie.title} 4k download, ${movie.title} netflix, ${movie.genre || ''} movies download free`;
  const shareText = `${movie.title} on Agasobanuye.rw`;

  const copyShare = () => {
    navigator.clipboard?.writeText(pageUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 1800);
  };

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': movie.type === 'Series' ? 'TVSeries' : 'Movie',
      name: movie.title,
      url: pageUrl,
      image: movie.poster_url || `${SITE_URL}/favicon.svg`,
      description: seoDescription,
      datePublished: movie.year || undefined,
      inLanguage: movie.language || 'rw',
      genre: movie.genre || undefined,
      countryOfOrigin: { '@type': 'Country', name: 'Rwanda' },
      provider: { '@type': 'Organization', name: 'Agasobanuye.rw', url: SITE_URL },
      aggregateRating: Number.isFinite(ratingValue)
        ? { '@type': 'AggregateRating', ratingValue, bestRating: 10, worstRating: 1, ratingCount: 1 }
        : undefined,
      potentialAction: [
        primaryWatch ? { '@type': 'WatchAction', target: primaryWatch.url } : null,
        primaryDownload ? { '@type': 'DownloadAction', target: primaryDownload.url } : null,
      ].filter(Boolean),
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'RWF',
        availability: 'https://schema.org/InStock',
        url: pageUrl,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: `${movie.title} - Watch on Agasobanuye.rw`,
      description: seoDescription,
      thumbnailUrl: movie.poster_url ? [movie.poster_url] : [`${SITE_URL}/favicon.svg`],
      uploadDate: movie.created_at || undefined,
      contentUrl: primaryWatch?.url || primaryDownload?.url || pageUrl,
      embedUrl: primaryWatch?.url || undefined,
      inLanguage: movie.language || 'rw',
      regionsAllowed: 'RW',
      publisher: { '@type': 'Organization', name: 'Agasobanuye.rw', url: SITE_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Agasobanuye.rw', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: movie.title, item: pageUrl },
      ],
    },
    movieFaqJsonLd,
  ].filter(Boolean);

  const officialMatches = OFFICIAL_PLATFORMS.filter((p) => (movie.platforms || []).includes(p.name));

  return (
    <div className="min-h-screen bg-deep relative overflow-x-hidden">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        ogTitle={`${movie.title} — Agasobanuye.rw`}
        ogDescription={movie.overview || 'Watch on Agasobanuye.rw'}
        ogImage={movie.poster_url || undefined}
        ogType="video.movie"
        canonical={pageUrl}
        jsonLd={jsonLd}
      />

      <WatchProgressBar label={`${movie.title} page progress`} />

      <CinematicBackground />

      {/* Atmospheric Backdrop Scrim */}
      <div className="absolute inset-x-0 top-0 h-[520px] pointer-events-none overflow-hidden">
        {movie.poster_url && (
          <img
            src={movie.poster_url}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-20 blur-3xl scale-110"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: isLight
              ? 'linear-gradient(180deg, rgba(238,241,246,0.78) 0%, rgba(238,241,246,0.92) 65%, var(--bg) 100%)'
              : 'linear-gradient(180deg, rgba(7,9,15,0.72) 0%, rgba(7,9,15,0.88) 65%, var(--bg) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        {/* Top Back Navigation */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Catalog</span>
          </Link>

          <Link
            href="/earnings"
            className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--muted)' }}
          >
            <Wallet size={12} style={{ color: GOLD }} />
            <span>Creator Revenue Rules</span>
          </Link>
        </div>

        <AdBanner size="728x90" className="mb-8" />

        {/* Architectural Two-Column Overview Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
          {/* Left Column: Poster + Fact Sheet + Creator Support */}
          <aside className="space-y-4">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {movie.poster_url ? (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[2/3] object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-full aspect-[2/3] items-center justify-center flex-col gap-2 px-4 text-center"
                style={{
                  display: movie.poster_url ? 'none' : 'flex',
                  background: 'var(--bg4)',
                }}
              >
                <Film size={34} style={{ color: GOLD, opacity: 0.55 }} />
                <span className="font-cinzel text-xs" style={{ color: 'var(--muted)' }}>
                  {movie.title}
                </span>
              </div>
            </div>

            {/* Structured Fact Sheet */}
            <div
              className="rounded-2xl divide-y divide-[var(--border-subtle)]"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
            >
              {[
                ['Format', movie.type || 'Movie'],
                ['Language', movie.language],
                ['Release Year', movie.year],
                ['Genre', movie.genre],
                ['Views', viewCount > 0 ? viewCount.toLocaleString() : null],
              ]
                .filter(([, val]) => Boolean(val))
                .map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs">
                    <span style={{ color: 'var(--muted)' }}>{label}</span>
                    <span className="font-medium text-right tabular-nums" style={{ color: 'var(--text)' }}>
                      {val}
                    </span>
                  </div>
                ))}
            </div>

            {/* Uploader Attribution & Gurira MB Support */}
            {movie.uploaded_by && (
              <div
                className="p-4 rounded-2xl space-y-3"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-border)', boxShadow: 'var(--shadow-card)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
                  >
                    <User size={15} style={{ color: GOLD_LIGHT }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px]" style={{ color: 'var(--muted)' }}>Uploaded & Translated By</div>
                    <div className="text-sm font-semibold truncate" style={{ color: GOLD_LIGHT }}>
                      {movie.uploaded_by}
                    </div>
                  </div>
                </div>

                {totalCreatorEarnings > 0 && (
                  <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs tabular-nums">
                    <span style={{ color: 'var(--muted)' }}>Creator Earned</span>
                    <span className="font-semibold" style={{ color: 'var(--green)' }}>
                      {totalCreatorEarnings.toLocaleString()} RWF
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    openDonate({
                      title: `Support ${movie.uploaded_by || movie.title}`,
                      subtitle: `Select a donation amount for "${movie.title}" (50% supports uploader ${movie.uploaded_by}).`,
                      purpose: `Movie Support: ${movie.title}`,
                      movieId: movie.id,
                      defaultAmount: 1000,
                    })
                  }
                  className="btn-primary w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <HeartHandshake size={14} />
                  <span>Gurira MB {movie.uploaded_by}</span>
                </button>
              </div>
            )}
          </aside>

          {/* Right Column: Title, Overview, Primary Actions, Stream & Download Servers */}
          <main className="min-w-0 space-y-7">
            {/* Unboxed Metadata Line + Display Headline */}
            <header className="pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs tabular-nums mb-3" style={{ color: 'var(--text2)' }}>
                {movie.featured && (
                  <>
                    <span className="font-semibold" style={{ color: GOLD_LIGHT }}>Featured Release</span>
                    <span aria-hidden="true" style={{ color: 'var(--dim)' }}>·</span>
                  </>
                )}
                <span>{movie.type || 'Movie'}</span>
                {movie.year && (
                  <>
                    <span aria-hidden="true" style={{ color: 'var(--dim)' }}>·</span>
                    <span>{movie.year}</span>
                  </>
                )}
                {movie.genre && (
                  <>
                    <span aria-hidden="true" style={{ color: 'var(--dim)' }}>·</span>
                    <span>{movie.genre}</span>
                  </>
                )}
                {watchLinks.length > 0 && (
                  <>
                    <span aria-hidden="true" style={{ color: 'var(--dim)' }}>·</span>
                    <span className="font-semibold" style={{ color: 'var(--green)' }}>Stream Ready</span>
                  </>
                )}
                {Number.isFinite(ratingValue) && (
                  <>
                    <span aria-hidden="true" style={{ color: 'var(--dim)' }}>·</span>
                    <span className="inline-flex items-center gap-1 font-semibold" style={{ color: GOLD_LIGHT }}>
                      <Star size={11} fill={GOLD} stroke={GOLD} />
                      {movie.rating}/10
                    </span>
                  </>
                )}
                {viewCount > 0 && (
                  <>
                    <span aria-hidden="true" style={{ color: 'var(--dim)' }}>·</span>
                    <span className="inline-flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                      <Eye size={11} />
                      {viewCount.toLocaleString()} views
                    </span>
                  </>
                )}
              </div>

              <h1
                className="font-cinzel font-bold leading-[1.08] tracking-tight mb-5"
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: 'clamp(1.85rem, 3.8vw, 3rem)',
                  color: 'var(--text)',
                  textWrap: 'balance',
                }}
              >
                {movie.title}
              </h1>

              {/* Primary Action Hierarchy */}
              <div className="flex flex-wrap items-center gap-3">
                {playableSources.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => launchInlinePreview(playableSources[0].url)}
                    data-testid="hero-play-preview-btn"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-transform duration-150 hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)`,
                      color: 'var(--accent-ink)',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    <Play size={14} fill="currentColor" />
                    <span>{showInlinePlayer ? 'Watching Preview' : 'Play Preview Now'}</span>
                  </button>
                ) : primaryWatch ? (
                  <a
                    href={primaryWatch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-transform duration-150 hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)`,
                      color: 'var(--accent-ink)',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    <Play size={14} fill="currentColor" />
                    <span>Watch Online</span>
                  </a>
                ) : null}

                <button
                  type="button"
                  onClick={() => openTrailer(movie)}
                  className="btn-ghost inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer"
                >
                  <Film size={13} />
                  <span>Play Trailer</span>
                </button>

                {primaryDownload && (
                  <a
                    href={primaryDownload.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold whitespace-nowrap"
                  >
                    <Download size={13} />
                    <span>Fast Download</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => toggleWatchlist(movie)}
                  data-testid="detail-watchlist-btn"
                  aria-pressed={inWatchlist}
                  aria-label={
                    inWatchlist
                      ? `${t.card.inWatchlistTitle}: ${movie.title}`
                      : `${t.card.addToWatchlistTitle}: ${movie.title}`
                  }
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
                  style={{
                    background: inWatchlist ? 'var(--accent-bg)' : 'var(--bg-ghost)',
                    border: inWatchlist ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                    color: inWatchlist ? GOLD_LIGHT : 'var(--text)',
                  }}
                >
                  <Bookmark size={14} fill={inWatchlist ? 'currentColor' : 'none'} />
                  <span>{inWatchlist ? t.card.inWatchlist : t.card.saveToWatchlist}</span>
                </button>
              </div>
            </header>

            {/* Inline Auto-Playing Theater Preview & Subtitle Player */}
            {(showInlinePlayer || playableSources.length > 0) && (
              <section ref={playerSectionRef} aria-label="Auto-Playing Theater Preview" data-testid="movie-auto-preview-section">
                {showInlinePlayer ? (
                  <SmartMediaPlayer
                    key={`player-${movie.id}`}
                    movie={movie}
                    initialSourceId={selectedSourceId}
                    initialSubtitleId={selectedSubtitleId}
                    extraTracks={generatedSubtitles}
                    autoPlayMuted
                    onClose={() => setShowInlinePlayer(false)}
                  />
                ) : (
                  <div
                    className="p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--accent-border)',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: GOLD_LIGHT }}>
                        <Play size={13} fill="currentColor" />
                        <span>{playableSources.length} Playable Preview {playableSources.length === 1 ? 'Link' : 'Links'} Ready</span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                        Watch inline on Agasobanuye.rw with {subtitleTracks.length > 0 ? `${subtitleTracks.length} subtitle tracks` : '.SRT / .VTT subtitle support'}.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => launchInlinePreview(playableSources[0].url)}
                      data-testid="expand-inline-player-btn"
                      className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
                    >
                      <Play size={12} fill="currentColor" />
                      <span>Show Auto-Preview</span>
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Editorial Synopsis & Cultural Commentary (AdSense Original Value-Add) */}
            <section
              aria-label="Story Overview and Editorial Guide"
              data-testid="movie-editorial-guide"
              className="p-6 rounded-2xl space-y-4"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] flex items-center gap-2" style={{ color: GOLD_LIGHT }}>
                  <BookOpen size={14} />
                  <span>Overview & Editorial Viewing Guide</span>
                </h2>
                <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  {movie.language || 'Kinyarwanda'} Edition
                </span>
              </div>

              <p className="text-sm sm:text-[15px] leading-[1.72]" style={{ color: 'var(--text)' }}>
                {movie.overview ||
                  `Stream and download ${movie.title} translated in ${movie.language || 'Kinyarwanda'} on Agasobanuye.rw.`}
              </p>

              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
                {editorialGuide.narrationNote} {editorialGuide.editorialSummary}
              </p>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-start gap-2 text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                <ShieldCheck size={14} className="shrink-0 mt-0.5" style={{ color: GOLD }} />
                <span>
                  {editorialGuide.externalLinkDisclosure}{' '}
                  <Link href="/dmca" className="underline hover:opacity-80" style={{ color: 'var(--text2)' }}>
                    DMCA & Link Policy
                  </Link>
                </span>
              </div>
            </section>

            {/* Stream Online Links */}
            {watchLinks.length > 0 && (
              <section aria-label="Watch Online Mirrors">
                <div className="flex items-center justify-between pb-2.5 mb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                    <Tv2 size={15} style={{ color: 'var(--green)' }} />
                    <span>External Watch & Preview Links</span>
                  </h2>
                  <span className="text-xs tabular-nums" style={{ color: 'var(--muted)' }}>
                    {watchLinks.length} {watchLinks.length === 1 ? 'source' : 'sources'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {watchLinks.map((l, i) => {
                    const previewInfo = classifyPreviewLink(l.url, l.label);
                    const linkMeta = classifyExternalLinkAttribution(l.url, l.label);
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl"
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--green-border)',
                          boxShadow: 'var(--shadow-card)',
                        }}
                      >
                        <div className="min-w-0">
                          <div className="inline-flex items-center gap-2 text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                            <Play size={14} fill="currentColor" style={{ color: 'var(--green)' }} />
                            <span className="truncate">{l.label || `Stream Server ${i + 1}`}</span>
                          </div>
                          <div className="text-[11px] mt-0.5 truncate" style={{ color: previewInfo.playable ? 'var(--green)' : 'var(--muted)' }}>
                            {linkMeta.domain} · {previewInfo.playable ? 'Auto-playable inline' : linkMeta.category}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {previewInfo.playable && (
                            <button
                              type="button"
                              onClick={() => launchInlinePreview(l.url)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                              style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', color: 'var(--green)' }}
                            >
                              Play
                            </button>
                          )}
                          <a
                            href={l.url}
                            target="_blank"
                            rel={linkMeta.rel}
                            aria-label={`Open ${l.label || 'stream'} on ${linkMeta.domain}`}
                            className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-ghost-hover)]"
                            style={{ color: 'var(--green)' }}
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Subtitles & Captions (.VTT / .SRT) */}
            <section id="subtitles" aria-label="Movie Subtitles" className="space-y-3 scroll-mt-24">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                    <Subtitles size={15} style={{ color: GOLD_LIGHT }} />
                    <span>Subtitles (.SRT / .VTT)</span>
                  </h2>
                  <span className="text-xs tabular-nums" style={{ color: 'var(--muted)' }}>
                    {subtitleTracks.length > 0 ? `${subtitleTracks.length} ${subtitleTracks.length === 1 ? 'track' : 'tracks'}` : 'Load local or official subtitles'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOfficialSubFinder((v) => !v)}
                    data-testid="toggle-official-subtitles-btn"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    style={{
                      background: 'var(--accent-bg)',
                      border: '1px solid var(--accent-border)',
                      color: GOLD_LIGHT,
                    }}
                  >
                    <Languages size={12} />
                    <span>{showOfficialSubFinder ? 'Hide Official Finder' : 'Find Official & Translate (RW)'}</span>
                  </button>
                  <Link
                    href={`/subtitles?q=${encodeURIComponent(movie.title)}`}
                    className="text-xs font-medium hover:underline"
                    style={{ color: 'var(--muted)' }}
                  >
                    Full Studio
                  </Link>
                </div>
              </div>

              {subtitleTracks.length === 0 ? (
                <div
                  className="p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    No pre-attached subtitles yet — search official subtitles above or load a local .SRT / .VTT file in the player.
                  </span>
                  {playableSources.length > 0 && (
                    <button
                      type="button"
                      onClick={() => launchInlinePreview(playableSources[0].url)}
                      className="btn-primary px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Load Subtitle in Player
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-subtle)] rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                  {subtitleTracks.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                          {sub.label}
                        </div>
                        <div className="text-xs mt-0.5 uppercase tabular-nums" style={{ color: 'var(--muted)' }}>
                          {sub.language} · {sub.format}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {playableSources.length > 0 && (
                          <button
                            type="button"
                            onClick={() => launchInlinePreview(playableSources[0].url, sub.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                            style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', color: 'var(--green)' }}
                          >
                            <Play size={11} fill="currentColor" />
                            <span>Play With Subtitle</span>
                          </button>
                        )}
                        <a
                          href={sub.url}
                          download={`${movie.id}-${sub.language.toLowerCase()}.${sub.format}`}
                          className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        >
                          <Download size={12} />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showOfficialSubFinder && (
                <div className="pt-1">
                  <OfficialSubtitleStudio
                    initialQuery={movie.title}
                    movieId={movie.id}
                    compact
                    onApplyKinyarwandaTrack={
                      playableSources.length > 0
                        ? (track) => {
                            const blob = new Blob([track.rawText || 'WEBVTT\n\n'], { type: 'text/vtt;charset=utf-8' });
                            const url = URL.createObjectURL(blob);
                            const readyTrack = { ...track, url };
                            setGeneratedSubtitles((prev) => [...prev, readyTrack]);
                            launchInlinePreview(playableSources[0].url, readyTrack.id);
                          }
                        : null
                    }
                  />
                </div>
              )}
            </section>

            {/* Download Mirrors */}
            <section aria-label="Download Mirrors">
              <div className="flex items-center justify-between pb-2.5 mb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <Download size={15} style={{ color: GOLD_LIGHT }} />
                  <span>Download Links</span>
                </h2>
                <a
                  href="https://drive.google.com/drive/folders/1s-llW3hYo3-4pK6U2XR3M5bJEakbHDjI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
                  style={{ color: 'var(--muted)' }}
                >
                  <HelpCircle size={13} />
                  <span>How to Download</span>
                </a>
              </div>

              {links.length === 0 ? (
                <div
                  className="p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    No direct download mirrors added yet for this title.
                  </span>
                  <Link
                    href={`/requests?title=${encodeURIComponent(movie.title)}`}
                    className="btn-primary px-3.5 py-2 rounded-lg text-xs font-semibold"
                  >
                    Request Download Link
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-subtle)] rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                  {links.map((l, i) => {
                    const previewInfo = classifyPreviewLink(l.url, l.label);
                    const linkMeta = classifyExternalLinkAttribution(l.url, l.label);
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--bg-ghost)]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
                          >
                            <Download size={14} style={{ color: l.color || GOLD_LIGHT }} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                              {l.label || `Download Mirror ${i + 1}`}
                            </div>
                            <div className="text-xs truncate mt-0.5" style={{ color: 'var(--muted)' }}>
                              {linkMeta.domain ? `${linkMeta.domain} · ${linkMeta.category}` : linkMeta.category}
                              {l.info ? ` · ${l.info}` : ''}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {previewInfo.playable && (
                            <button
                              type="button"
                              onClick={() => launchInlinePreview(l.url)}
                              className="btn-primary inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              <Play size={11} fill="currentColor" />
                              <span>Play Preview</span>
                            </button>
                          )}
                          <a
                            href={l.url}
                            target="_blank"
                            rel={linkMeta.rel}
                            aria-label={`Open ${l.label || 'download'} link on ${linkMeta.domain}`}
                            className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-ghost-hover)]"
                            style={{ color: l.color || GOLD_LIGHT }}
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Official Streaming Availability */}
            {officialMatches.length > 0 && (
              <section aria-label="Officially Available On">
                <div className="flex items-center gap-2 pb-2.5 mb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <Globe size={14} style={{ color: GOLD_LIGHT }} />
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    Official Streaming Search
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {officialMatches.map((p) => (
                    <a
                      key={p.name}
                      href={p.url + encodeURIComponent(movie.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors hover:opacity-85"
                      style={{
                        background: `${p.color}16`,
                        border: `1px solid ${p.color}42`,
                        color: 'var(--text)',
                      }}
                    >
                      <span>{p.name}</span>
                      <ExternalLink size={11} style={{ color: p.color }} />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Share Dock */}
            <section
              aria-label="Share This Title"
              className="p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--text2)' }}>
                <Share2 size={14} style={{ color: GOLD_LIGHT }} />
                <span>Share This Title</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {sharePlatforms.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.url(pageUrl, shareText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors hover:opacity-85"
                    style={
                      platform.color
                        ? {
                            background: `${platform.color}14`,
                            border: `1px solid ${platform.color}36`,
                            color: platform.color,
                          }
                        : {
                            background: 'var(--bg-ghost)',
                            border: '1px solid var(--border)',
                            color: 'var(--text)',
                          }
                    }
                  >
                    {platform.name}
                  </a>
                ))}
                <button
                  type="button"
                  onClick={copyShare}
                  className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {copiedShare ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedShare ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </section>

            <MovieFaqSection faqs={movieFaqs} movieTitle={movie.title} />

            <AdBanner size="300x250" />
          </main>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const movie = await getMovieById(params.id);
    if (!movie) return { notFound: true };
    return { props: { movie } };
  } catch {
    return { notFound: true };
  }
}
