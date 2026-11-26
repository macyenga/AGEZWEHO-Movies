import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Star,
  Download,
  Heart,
  Play,
  Share2,
  Check,
  Subtitles,
  Languages,
  Loader2,
} from 'lucide-react';
import { useCollection } from '../hooks/useCollection';
import { useMovieRatings } from '../hooks/useMovieRatings';
import { useTrailer } from '../contexts/TrailerContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getCategoryLabel, getMediaTypeLabel } from '../lib/i18n';
import { shareMovieLink } from '../lib/share';
import {
  resolveMovieSubtitleAction,
  getMovieThumbnailSlides,
  parseSubtitleCues,
  formatCuesToSrt,
  sanitizeSubtitleFilename,
} from '../lib/subtitles';
import AnimatedThumbnail from './AnimatedThumbnail';

function triggerClientSrtDownload(content, filename) {
  const blob = new Blob([content], { type: 'application/x-subrip;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function MovieCard({ movie }) {
  const router = useRouter();
  const ref = useRef(null);
  const { toggleWatchlist, isInWatchlist } = useCollection();
  const { rateMovie, getMovieRatingSummary } = useMovieRatings();
  const { openTrailer } = useTrailer();
  const { language, t, tr } = useLanguage();
  const [hoverStar, setHoverStar] = useState(0);
  const [shareStatus, setShareStatus] = useState('idle');
  const [subStatus, setSubStatus] = useState('idle');
  const [isCardHovered, setIsCardHovered] = useState(false);
  const shareTimerRef = useRef(null);
  const subTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
      if (subTimerRef.current) clearTimeout(subTimerRef.current);
    };
  }, []);

  const links = Array.isArray(movie.links) ? movie.links : [];
  const inWatchlist = isInWatchlist(movie.id);
  const ratingSummary = getMovieRatingSummary(movie);
  const displayStars = hoverStar || ratingSummary.userStars || Math.round(ratingSummary.average);
  const subtitleInfo = resolveMovieSubtitleAction(movie);
  const thumbnailSlides = getMovieThumbnailSlides(movie);

  const handleToggleWatchlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(movie);
  };

  const handleRate = (e, stars) => {
    e.preventDefault();
    e.stopPropagation();
    rateMovie(movie.id, stars);
  };

  const handlePlayTrailer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openTrailer(movie);
  };

  const handleDownloadSubtitles = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (subStatus === 'loading') return;

    setSubStatus('loading');
    try {
      if (subtitleInfo.hasAttachedTrack && subtitleInfo.preferredTrack?.url) {
        const res = await fetch(subtitleInfo.preferredTrack.url);
        if (!res.ok) throw new Error('Track fetch failed');
        const raw = await res.text();
        const cues = parseSubtitleCues(raw);
        const srtContent = cues.length > 0 ? formatCuesToSrt(cues) : raw;
        triggerClientSrtDownload(srtContent, subtitleInfo.directDownloadFilename);
      } else {
        const searchParams = new URLSearchParams({
          q: subtitleInfo.searchTitle || movie.title || '',
          lang: 'eng',
        });
        const searchRes = await fetch(`/api/subtitles/search?${searchParams.toString()}`);
        const searchData = await searchRes.json();
        const topMatch = Array.isArray(searchData?.items) ? searchData.items[0] : null;

        if (!topMatch?.downloadUrl) {
          setSubStatus('idle');
          router.push(subtitleInfo.studioHref);
          return;
        }

        const dlParams = new URLSearchParams({
          url: topMatch.downloadUrl,
          filename: topMatch.fileName || movie.title || 'subtitle',
          format: 'srt',
        });
        const dlRes = await fetch(`/api/subtitles/download?${dlParams.toString()}`);
        if (!dlRes.ok) {
          setSubStatus('idle');
          router.push(subtitleInfo.studioHref);
          return;
        }
        const srtText = await dlRes.text();
        const finalName = sanitizeSubtitleFilename(topMatch.fileName || movie.title, 'srt');
        triggerClientSrtDownload(srtText, finalName);
      }

      setSubStatus('saved');
      if (subTimerRef.current) clearTimeout(subTimerRef.current);
      subTimerRef.current = setTimeout(() => setSubStatus('idle'), 2400);
    } catch {
      setSubStatus('idle');
      router.push(subtitleInfo.studioHref);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
    const result = await shareMovieLink({ movie, origin });

    if (result.status === 'shared' || result.status === 'copied') {
      setShareStatus(result.status);
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
      shareTimerRef.current = setTimeout(() => {
        setShareStatus('idle');
      }, 2200);
    }
  };

  return (
    <div className="h-full relative hover:z-20">
      <motion.div
        ref={ref}
        data-testid={`movie-card-${movie.id}`}
        style={{
          willChange: 'transform',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)',
        }}
        whileHover={{
          scale: 1.04,
          y: -4,
          transition: { type: 'spring', stiffness: 280, damping: 22, mass: 0.75 },
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="movie-card group relative rounded-xl overflow-hidden flex flex-col h-full transition-[border-color,box-shadow] duration-300 ease-out"
        onMouseEnter={e => {
          setIsCardHovered(true);
          e.currentTarget.style.borderColor='var(--border2)';
          e.currentTarget.style.boxShadow='0 14px 36px rgba(15,23,42,0.22)';
        }}
        onMouseLeave={e => {
          setIsCardHovered(false);
          e.currentTarget.style.borderColor='var(--border)';
          e.currentTarget.style.boxShadow='var(--shadow-card)';
        }}
      >
        {/* ── Watchlist Heart Button ── */}
        <motion.button
          type="button"
          onClick={handleToggleWatchlist}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.88 }}
          data-testid={`watchlist-btn-${movie.id}`}
          aria-label={inWatchlist ? `${t.card.inWatchlistTitle}: ${movie.title}` : `${t.card.addToWatchlistTitle}: ${movie.title}`}
          aria-pressed={inWatchlist}
          title={inWatchlist ? t.card.inWatchlist : t.card.addToWatchlistTitle}
          className="absolute top-2 left-2 z-30 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all opacity-95 group-hover:opacity-100"
          style={{
            background: inWatchlist ? 'rgba(18,16,10,0.88)' : 'rgba(8,8,18,0.78)',
            border: inWatchlist ? '1px solid rgba(201,168,76,0.82)' : '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(6px)',
            boxShadow: inWatchlist ? '0 0 12px rgba(201,168,76,0.4)' : '0 2px 8px rgba(0,0,0,0.45)',
          }}
        >
          <Heart
            size={14}
            fill={inWatchlist ? '#c9a84c' : 'none'}
            style={{ color: inWatchlist ? '#f5e4a8' : '#e8e4d8' }}
          />
        </motion.button>

        <Link href={`/movies/${movie.id}`} className="block cursor-pointer flex-1">
          {/* Animated Poster Slide */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <AnimatedThumbnail
              slides={thumbnailSlides}
              alt={movie.title}
              fallbackTitle={movie.title}
              active={isCardHovered}
              aspectClass="aspect-[2/3]"
            />
            <div className="absolute inset-0 poster-fade pointer-events-none" />

            {movie.featured ? (
              <div
                className="absolute top-2.5 right-2.5 z-10 text-[9px] font-semibold uppercase tracking-[0.14em] px-2 py-0.5 rounded"
                style={{
                  background: 'rgba(10,10,16,0.78)',
                  color: '#e8c87a',
                  backdropFilter: 'blur(6px)',
                }}
              >
                {t.card.featured}
              </div>
            ) : (
              <div
                className="absolute top-2.5 right-2.5 z-10 text-[9px] font-medium uppercase tracking-[0.12em] px-2 py-0.5 rounded"
                style={{
                  background: 'rgba(10,10,16,0.72)',
                  color: movie.type === 'Series' ? '#7ec8f7' : movie.type === 'Anime' ? '#c4b5fd' : '#d6d2c4',
                  backdropFilter: 'blur(6px)',
                }}
              >
                {getMediaTypeLabel(movie.type, language)}
              </div>
            )}

            {/* Quiet unboxed source + subtitle + download count footer over scrim */}
            {((movie.platforms && movie.platforms.length > 0) || links.length > 0 || subtitleInfo.hasAttachedTrack) && (
              <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex items-center justify-between gap-2 text-[10px]">
                <span className="truncate font-medium" style={{ color: 'rgba(232,228,216,0.82)' }}>
                  {movie.platforms && movie.platforms.length > 0 ? movie.platforms[0] : ''}
                </span>
                <div className="flex items-center gap-2 shrink-0 tabular-nums font-semibold">
                  {subtitleInfo.hasAttachedTrack && (
                    <span className="inline-flex items-center gap-0.5" style={{ color: '#86efac' }}>
                      <Subtitles size={10} />
                      <span>RW</span>
                    </span>
                  )}
                  {links.length > 0 && (
                    <span className="inline-flex items-center gap-1" style={{ color: '#e8c87a' }}>
                      <Download size={10} />
                      {links.length}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="px-3 pt-3 pb-2">
            <h3 className="font-semibold text-sm leading-snug mb-1.5 line-clamp-2 text-[var(--text)] group-hover:text-[var(--gold2)] transition-colors">
              {movie.title}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] truncate tabular-nums" style={{ color: 'var(--muted)' }}>
              {movie.year && <span>{movie.year}</span>}
              {movie.year && movie.genre && <span aria-hidden="true" style={{ color: 'var(--dim)' }}>·</span>}
              {movie.genre && (
                <span style={{ color: 'var(--text2)' }}>
                  {getCategoryLabel(movie.genre.split(',')[0].trim(), language)}
                </span>
              )}
              {movie.language && (
                <>
                  <span aria-hidden="true" style={{ color: 'var(--dim)' }}>·</span>
                  <span className="truncate">{movie.language}</span>
                </>
              )}
            </div>
            {movie.uploaded_by && (
              <div className="mt-1 text-[10px] truncate" style={{ color: 'var(--muted)' }}>
                {t.card.byPrefix} {movie.uploaded_by}
              </div>
            )}
          </div>
        </Link>

        {/* Interactive 5-Star Rating & Play Trailer Footer */}
        <div
          className="px-2.5 sm:px-3 pb-2.5 pt-2 space-y-2"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          {/* 5-Star Rating Row */}
          <div
            className="flex items-center justify-between gap-1"
            onMouseLeave={() => setHoverStar(0)}
          >
            <div
              className="flex items-center gap-0.5"
              role="group"
              aria-label={tr('card.rateGroupAria', { title: movie.title })}
            >
              {[1, 2, 3, 4, 5].map((starValue) => {
                const filled = starValue <= displayStars;
                const isUserChoice = ratingSummary.userStars >= starValue && hoverStar === 0;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={(e) => handleRate(e, starValue)}
                    onMouseEnter={() => setHoverStar(starValue)}
                    data-testid={`rate-star-${movie.id}-${starValue}`}
                    aria-label={`Rate ${movie.title} ${starValue} out of 5 stars`}
                    aria-pressed={ratingSummary.userStars === starValue}
                    title={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
                    className="p-0.5 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      size={12}
                      fill={filled ? 'var(--gold)' : 'none'}
                      style={{
                        color: isUserChoice
                          ? 'var(--gold2)'
                          : filled
                          ? 'var(--gold)'
                          : 'var(--dim)',
                      }}
                    />
                  </button>
                );
              })}
            </div>

            <div
              className="flex items-center gap-1 text-[11px] font-semibold tabular-nums flex-shrink-0"
              data-testid={`avg-rating-${movie.id}`}
              title={`Average rating: ${ratingSummary.average.toFixed(1)} / 5 (${ratingSummary.count} rating${ratingSummary.count === 1 ? '' : 's'})`}
              style={{ color: ratingSummary.userStars > 0 ? 'var(--gold2)' : 'var(--gold)' }}
            >
              <span>{ratingSummary.average > 0 ? ratingSummary.average.toFixed(1) : '—'}</span>
              <span className="text-[9px] font-normal" style={{ color: 'var(--muted)' }}>
                ({ratingSummary.count})
              </span>
            </div>
          </div>

          {/* Play Trailer & Share Actions */}
          <div className="flex items-center gap-1.5">
            <motion.button
              type="button"
              onClick={handlePlayTrailer}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              data-testid={`play-trailer-btn-${movie.id}`}
              aria-label={`${t.card.playTrailer} — ${movie.title}`}
              title={t.card.playTrailer}
              className="flex-1 min-w-0 py-1.5 px-2 rounded-lg text-[10px] sm:text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
              style={{
                background: 'var(--accent-bg)',
                border: '1px solid var(--accent-border)',
                color: 'var(--gold2)',
              }}
            >
              <Play size={10} fill="currentColor" className="flex-shrink-0" />
              <span>{t.card.playTrailerShort}</span>
            </motion.button>

            <motion.button
              type="button"
              onClick={handleShare}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              data-testid={`share-btn-${movie.id}`}
              aria-label={tr('card.shareAria', { title: movie.title })}
              title={tr('card.shareAria', { title: movie.title })}
              className="flex-shrink-0 py-1.5 px-2 rounded-lg text-[10px] sm:text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
              style={shareStatus !== 'idle' ? {
                background: 'var(--green-bg)',
                border: '1px solid var(--green-border)',
                color: 'var(--green)',
              } : {
                background: 'var(--bg-ghost)',
                border: '1px solid var(--border)',
                color: 'var(--text2)',
              }}
            >
              {shareStatus !== 'idle' ? (
                <Check size={10} className="flex-shrink-0" />
              ) : (
                <Share2 size={10} className="flex-shrink-0" />
              )}
              <span>
                {shareStatus === 'shared'
                  ? t.card.shared
                  : shareStatus === 'copied'
                  ? t.card.copied
                  : t.card.share}
              </span>
            </motion.button>
          </div>

          {/* Direct Subtitle (.SRT) Download & Kinyarwanda Studio */}
          <div className="flex items-center gap-1.5">
            <motion.button
              type="button"
              onClick={handleDownloadSubtitles}
              disabled={subStatus === 'loading'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              data-testid={`card-subtitles-btn-${movie.id}`}
              aria-label={`Download Subtitles (.SRT) — ${movie.title}`}
              title={`Download Subtitles (.SRT) — ${movie.title}`}
              className="flex-1 min-w-0 py-1.5 px-1.5 sm:px-2 rounded-lg text-[10px] sm:text-[10.5px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors whitespace-nowrap disabled:opacity-60"
              style={{
                background: 'var(--green-bg)',
                border: '1px solid var(--green-border)',
                color: 'var(--green)',
              }}
            >
              {subStatus === 'loading' ? (
                <Loader2 size={10} className="animate-spin flex-shrink-0" />
              ) : subStatus === 'saved' ? (
                <Check size={10} className="flex-shrink-0" />
              ) : (
                <Download size={10} className="flex-shrink-0" />
              )}
              <span className="truncate">
                {subStatus === 'loading'
                  ? t.card.subtitlesDownloading
                  : subStatus === 'saved'
                  ? t.card.subtitlesSaved
                  : t.card.subtitlesDownload}
              </span>
            </motion.button>

            <Link
              href={subtitleInfo.studioHref}
              onClick={(e) => e.stopPropagation()}
              data-testid={`card-subtitles-studio-${movie.id}`}
              aria-label={`${t.card.subtitlesStudio} — ${movie.title}`}
              title={t.card.subtitlesStudio}
              className="w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center transition-colors hover:opacity-85"
              style={{
                background: 'var(--accent-bg)',
                border: '1px solid var(--accent-border)',
                color: 'var(--gold2)',
              }}
            >
              <Languages size={12} />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
