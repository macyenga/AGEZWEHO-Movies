import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Star, Download, Tv2, Heart, Play, Share2, Check } from 'lucide-react';
import { useCollection } from '../hooks/useCollection';
import { useMovieRatings } from '../hooks/useMovieRatings';
import { useTrailer } from '../contexts/TrailerContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getCategoryLabel, getMediaTypeLabel } from '../lib/i18n';
import { shareMovieLink } from '../lib/share';

const PLATFORM_COLORS = {
  Netflix: '#E50914',
  Amazon: '#00A8E1',
  YouTube: '#FF0000',
  JioCinema: '#6B4DE6',
  Hotstar: '#1F80E0',
  SonyLIV: '#0057A8',
  ZEE5: '#7B2FBE',
  MXPlayer: '#FF6C00',
};

export default function MovieCard({ movie, index = 0 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-60,60], [6,-6]), { stiffness:200, damping:24 });
  const rotateY = useSpring(useTransform(x, [-60,60], [-6,6]), { stiffness:200, damping:24 });
  const { toggleWatchlist, isInWatchlist } = useCollection();
  const { rateMovie, getMovieRatingSummary } = useMovieRatings();
  const { openTrailer } = useTrailer();
  const { language, t, tr } = useLanguage();
  const [hoverStar, setHoverStar] = useState(0);
  const [shareStatus, setShareStatus] = useState('idle');
  const shareTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (shareTimerRef.current) {
        clearTimeout(shareTimerRef.current);
      }
    };
  }, []);

  const handleMouse = e => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width/2);
    y.set(e.clientY - rect.top  - rect.height/2);
  };

  const links   = Array.isArray(movie.links) ? movie.links : [];
  const inWatchlist = isInWatchlist(movie.id);
  const ratingSummary = getMovieRatingSummary(movie);
  const displayStars = hoverStar || ratingSummary.userStars || Math.round(ratingSummary.average);

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
    <motion.div
      initial={{ opacity:0, y:24 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, margin:'-30px' }}
      transition={{ duration:0.45, delay:(index%5)*0.06 }}
      className="h-full relative hover:z-20"
    >
      <motion.div
        ref={ref}
        data-testid={`movie-card-${movie.id}`}
        style={{
          rotateX,
          rotateY,
          transformPerspective: 900,
          willChange: 'transform',
          background:'linear-gradient(160deg,rgba(26,26,40,0.9) 0%,rgba(15,15,22,0.95) 100%)',
          border:'1px solid rgba(255,255,255,0.06)',
          boxShadow:'0 4px 24px rgba(0,0,0,0.5)',
        }}
        onMouseMove={handleMouse}
        whileHover={{
          scale: 1.04,
          y: -4,
          transition: { type: 'spring', stiffness: 280, damping: 22, mass: 0.75 },
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="movie-card group relative rounded-xl overflow-hidden flex flex-col h-full transition-[border-color,box-shadow] duration-300 ease-out"
        onMouseEnter={e => {
          e.currentTarget.style.borderColor='rgba(201,168,76,0.35)';
          e.currentTarget.style.boxShadow='0 14px 40px rgba(0,0,0,0.68), 0 0 28px rgba(201,168,76,0.12)';
        }}
        onMouseLeave={e => {
          x.set(0);
          y.set(0);
          e.currentTarget.style.borderColor='rgba(255,255,255,0.06)';
          e.currentTarget.style.boxShadow='0 4px 24px rgba(0,0,0,0.5)';
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
          {/* Poster */}
          <div className="relative aspect-[2/3] overflow-hidden">
            {movie.poster_url ? (
              <img src={movie.poster_url} alt={movie.title} loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
              />
            ) : null}
            <div className="w-full h-full bg-[#13131e] items-center justify-center"
              style={{ display: movie.poster_url ? 'none' : 'flex' }}>
              <div className="text-center opacity-20">
                <Tv2 size={32} className="mx-auto mb-1" style={{ color:'#c9a84c' }} />
                <span className="text-[10px]" style={{ color:'#6a6a5a' }}>{movie.title}</span>
              </div>
            </div>
            <div className="absolute inset-0 poster-fade" />

            {movie.featured && (
              <div className="absolute top-2 right-2 z-10">
                <span className="badge badge-gold">{t.card.featured}</span>
              </div>
            )}
            {!movie.featured && (
              <div className="absolute top-2 right-2 z-10">
                <span className={`badge ${movie.type==='Series'?'badge-blue':movie.type==='Anime'?'badge-purple':'badge-muted'}`}>
                  {getMediaTypeLabel(movie.type, language)}
                </span>
              </div>
            )}

            {/* Platform badges */}
            {movie.platforms && movie.platforms.length > 0 && (
              <div className="absolute bottom-2 left-2 z-10 flex gap-1">
                {movie.platforms.slice(0, 3).map(p => (
                  <span key={p} className="text-[8px] px-1.5 py-0.5 rounded font-semibold"
                    style={{
                      background: `${PLATFORM_COLORS[p] || '#c9a84c'}25`,
                      color: PLATFORM_COLORS[p] || '#c9a84c',
                      border: `1px solid ${PLATFORM_COLORS[p] || '#c9a84c'}40`,
                    }}>
                    {p}
                  </span>
                ))}
              </div>
            )}

            {links.length > 0 && (
              <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                style={{ background:'rgba(10,10,15,0.75)', border:'1px solid rgba(201,168,76,0.15)' }}>
                <Download size={9} style={{ color:'#c9a84c' }} />
                <span className="text-[10px]" style={{ color:'#c9a84c' }}>{links.length}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="px-2.5 sm:px-3 pt-2.5 pb-1.5">
            <h3 className="font-medium text-sm leading-snug mb-1 line-clamp-2" style={{ color:'#e8e4d8' }}>
              {movie.title}
            </h3>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] truncate" style={{ color:'#6a6a5a' }}>
                {movie.year}{movie.language ? ` · ${movie.language}` : ''}
              </span>
              {movie.genre && <span className="badge badge-muted flex-shrink-0">{getCategoryLabel(movie.genre, language)}</span>}
            </div>
            {movie.uploaded_by && (
              <div className="mt-1 text-[10px] truncate" style={{ color:'#4a4a3a' }}>{t.card.byPrefix} {movie.uploaded_by}</div>
            )}
          </div>
        </Link>

        {/* Interactive 5-Star Rating & Play Trailer Footer */}
        <div
          className="px-2.5 sm:px-3 pb-2.5 pt-2 space-y-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
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
                      fill={filled ? '#c9a84c' : 'none'}
                      style={{
                        color: isUserChoice
                          ? '#f5e4a8'
                          : filled
                          ? '#c9a84c'
                          : '#5a584c',
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
              style={{ color: ratingSummary.userStars > 0 ? '#f5e4a8' : '#c9a84c' }}
            >
              <span>{ratingSummary.average > 0 ? ratingSummary.average.toFixed(1) : '—'}</span>
              <span className="text-[9px] font-normal" style={{ color: '#6a6a5a' }}>
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
                background: 'rgba(201,168,76,0.12)',
                border: '1px solid rgba(201,168,76,0.32)',
                color: '#e8c87a',
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
                background: 'rgba(74,222,128,0.14)',
                border: '1px solid rgba(74,222,128,0.4)',
                color: '#86efac',
              } : {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: '#d6d2c4',
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
        </div>
      </motion.div>
    </motion.div>
  );
}
