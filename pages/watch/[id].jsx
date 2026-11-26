import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bookmark,
  Check,
  Copy,
  Download,
  ExternalLink,
  Film,
  HeartHandshake,
  Info,
  Languages,
  Play,
  Share2,
  Star,
  Subtitles,
} from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import CinematicBackground from '../../components/CinematicBackground';
import SmartMediaPlayer from '../../components/SmartMediaPlayer';
import OfficialSubtitleStudio from '../../components/OfficialSubtitleStudio';
import AdBanner from '../../components/ads/AdBanner';
import { getMovieById, getMovies } from '../../lib/supabase';
import { collectPlayableSources, normalizeSubtitles } from '../../lib/media-preview';
import { useCollection } from '../../hooks/useCollection';
import { useDonate } from '../../contexts/DonateContext';
import { useLanguage } from '../../contexts/LanguageContext';

const SITE_URL = 'https://agasobanuye.rw';
const GOLD = 'var(--gold)';
const GOLD_LIGHT = 'var(--gold2)';

export default function WatchMoviePage({ movie, upNext = [] }) {
  const { toggleWatchlist, isInWatchlist } = useCollection();
  const { openDonate } = useDonate();
  const { t } = useLanguage();

  const [generatedSubtitles, setGeneratedSubtitles] = useState([]);
  const [selectedSubtitleId, setSelectedSubtitleId] = useState(null);
  const [showOfficialSubFinder, setShowOfficialSubFinder] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const playableSources = useMemo(() => collectPlayableSources(movie), [movie]);
  const subtitleTracks = useMemo(
    () => normalizeSubtitles(movie?.subtitles, movie?.subtitle_url, movie?.language || 'Kinyarwanda'),
    [movie?.subtitles, movie?.subtitle_url, movie?.language]
  );

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep">
        <SEOHead title="Watch — Title Not Found" noIndex />
        <CinematicBackground />
        <div className="relative z-10 text-center px-6">
          <h1 className="font-cinzel text-2xl mb-4" style={{ fontFamily: 'Cinzel, serif', color: GOLD_LIGHT }}>
            Title Not Found
          </h1>
          <Link
            href="/"
            className="btn-ghost inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold"
          >
            <ArrowLeft size={13} /> Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie.id);
  const links = Array.isArray(movie.links) ? movie.links : [];
  const watchUrl = `${SITE_URL}/watch/${movie.id}`;
  const detailUrl = `/movies/${movie.id}`;

  const handleCopyShare = () => {
    navigator.clipboard?.writeText(watchUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 1800);
  };

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: `Watch ${movie.title} — Agasobanuye.rw`,
      description: movie.overview || `Watch ${movie.title} online on Agasobanuye.rw.`,
      thumbnailUrl: movie.poster_url ? [movie.poster_url] : [`${SITE_URL}/og-image.svg`],
      uploadDate: movie.created_at || undefined,
      contentUrl: watchUrl,
      inLanguage: movie.language || 'rw',
      publisher: { '@type': 'Organization', name: 'Agasobanuye.rw', url: SITE_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Agasobanuye.rw', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: movie.title, item: `${SITE_URL}/movies/${movie.id}` },
        { '@type': 'ListItem', position: 3, name: `Watch ${movie.title}`, item: watchUrl },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-deep relative overflow-x-hidden">
      <SEOHead
        title={`Watch ${movie.title} ${movie.year || ''}`.trim()}
        description={movie.overview || `Stream ${movie.title} online with subtitles on Agasobanuye.rw.`}
        ogImage={movie.poster_url || undefined}
        ogType="video.movie"
        canonical={watchUrl}
        jsonLd={jsonLd}
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 space-y-6">
        {/* Top theater bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--muted)' }}
            >
              <ArrowLeft size={14} />
              <span>Catalog</span>
            </Link>
            <span style={{ color: 'var(--dim)' }}>/</span>
            <Link
              href={detailUrl}
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: GOLD_LIGHT }}
            >
              <Info size={13} />
              <span>Full Movie Details</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => toggleWatchlist(movie)}
              aria-pressed={inWatchlist}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              style={{
                background: inWatchlist ? 'var(--accent-bg)' : 'var(--bg-ghost)',
                border: inWatchlist ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                color: inWatchlist ? GOLD_LIGHT : 'var(--text)',
              }}
            >
              <Bookmark size={13} fill={inWatchlist ? 'currentColor' : 'none'} />
              <span>{inWatchlist ? t.card.inWatchlist : t.card.saveToWatchlist}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyShare}
              className="btn-ghost inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            >
              {copiedShare ? <Check size={13} style={{ color: 'var(--green)' }} /> : <Share2 size={13} />}
              <span>{copiedShare ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Title Header */}
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs tabular-nums" style={{ color: 'var(--text2)' }}>
            {movie.type && (
              <span className="font-semibold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', color: GOLD_LIGHT }}>
                {movie.type}
              </span>
            )}
            {movie.year && <span>{movie.year}</span>}
            {movie.genre && <span>· {movie.genre}</span>}
            {movie.language && <span>· {movie.language}</span>}
            {movie.rating && (
              <span className="inline-flex items-center gap-1 font-semibold" style={{ color: GOLD_LIGHT }}>
                · <Star size={11} fill={GOLD} stroke={GOLD} /> {movie.rating}
              </span>
            )}
          </div>
          <h1
            className="font-cinzel text-2xl sm:text-3xl font-bold leading-tight"
            style={{ fontFamily: 'Cinzel, serif', color: 'var(--text)' }}
          >
            {movie.title}
          </h1>
        </header>

        {/* Screening Room Player */}
        <section aria-label="Cinema Screening Player">
          <SmartMediaPlayer
            movie={movie}
            initialSourceId={playableSources[0]?.id || null}
            initialSubtitleId={selectedSubtitleId || subtitleTracks[0]?.id || null}
            extraTracks={generatedSubtitles}
          />
        </section>

        {/* Subtitle Studio + Download Mirrors + Tip Creator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-5">
            {movie.overview && (
              <section
                className="p-5 rounded-2xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
              >
                <h2 className="text-xs font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: GOLD_LIGHT }}>
                  Synopsis
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
                  {movie.overview}
                </p>
              </section>
            )}

            {/* Official Subtitle Finder & Kinyarwanda Translator Toggle */}
            <section
              className="p-5 rounded-2xl space-y-4"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-border)', boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Subtitles size={16} style={{ color: GOLD_LIGHT }} />
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    Subtitles &amp; Kinyarwanda Studio
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOfficialSubFinder((v) => !v)}
                  data-testid="watch-toggle-subtitles-btn"
                  className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Languages size={13} />
                  <span>{showOfficialSubFinder ? 'Hide Subtitle Studio' : 'Find Official & Translate (RW)'}</span>
                </button>
              </div>

              {showOfficialSubFinder && (
                <OfficialSubtitleStudio
                  initialQuery={movie.title}
                  compact
                  onAttachTrack={(track) => {
                    if (!track) return;
                    setGeneratedSubtitles((prev) => [track, ...prev.filter((tItem) => tItem.id !== track.id)]);
                    setSelectedSubtitleId(track.id);
                  }}
                />
              )}
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-5">
            {links.length > 0 && (
              <section
                className="p-5 rounded-2xl space-y-3"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
              >
                <h2 className="text-xs font-semibold uppercase tracking-[0.15em] flex items-center gap-2" style={{ color: GOLD_LIGHT }}>
                  <Download size={13} />
                  <span>Download Mirrors</span>
                </h2>
                <div className="space-y-2">
                  {links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium"
                    >
                      <span className="truncate">{link.label || `Download ${idx + 1}`}</span>
                      <span className="inline-flex items-center gap-1 shrink-0 text-[11px]" style={{ color: GOLD_LIGHT }}>
                        {link.info || 'HD'} <ExternalLink size={11} />
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            <section
              className="p-5 rounded-2xl space-y-3"
              style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: GOLD_LIGHT }}>
                <HeartHandshake size={14} />
                <span>Support {movie.uploaded_by || 'Agasobanuye.rw'}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
                Enjoyed watching {movie.title}? Support the creator and keep Agasobanuye.rw streaming free.
              </p>
              <button
                type="button"
                onClick={() => openDonate({ movieId: movie.id, defaultAmount: 1000 })}
                className="w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-opacity hover:opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
                  color: 'var(--accent-ink)',
                }}
              >
                Tip via MoMo Pay 156833
              </button>
            </section>

            <AdBanner size="300x250" />
          </aside>
        </div>

        {/* Up Next */}
        {upNext.length > 0 && (
          <section aria-label="Up Next" className="pt-4 space-y-4">
            <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 className="font-cinzel text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', color: 'var(--text)' }}>
                Up Next on Agasobanuye.rw
              </h2>
              <Link href="/#explore" className="text-xs font-medium hover:opacity-80" style={{ color: GOLD_LIGHT }}>
                View All Titles
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {upNext.map((item) => (
                <Link
                  key={item.id}
                  href={`/watch/${item.id}`}
                  className="group rounded-xl overflow-hidden transition-transform hover:-translate-y-1"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div className="relative aspect-[2/3] bg-[var(--bg4)] overflow-hidden">
                    {item.poster_url ? (
                      <img
                        src={item.poster_url}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={24} style={{ color: 'var(--dim)' }} />
                      </div>
                    )}
                    <div className="absolute inset-0 poster-fade" />
                    <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(10,10,16,0.82)', border: '1px solid rgba(245,208,97,0.55)' }}>
                      <Play size={11} fill="#f5d061" style={{ color: '#f5d061' }} />
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h3 className="text-xs font-semibold line-clamp-1" style={{ color: 'var(--text)' }}>
                      {item.title}
                    </h3>
                    <p className="text-[11px] mt-0.5 tabular-nums" style={{ color: 'var(--muted)' }}>
                      {item.year || 'Movie'}{item.genre ? ` · ${item.genre.split(',')[0]}` : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const [movie, allMovies] = await Promise.all([
      getMovieById(params.id),
      getMovies().catch(() => []),
    ]);
    if (!movie) return { notFound: true };
    const upNext = (Array.isArray(allMovies) ? allMovies : [])
      .filter((m) => m.id !== movie.id)
      .slice(0, 6);
    return { props: { movie, upNext } };
  } catch {
    return { notFound: true };
  }
}
