import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Flame, Eye, Star, Play } from 'lucide-react';
import {
  getTopTrendingMovies,
  getMovieViews,
  formatViewCount,
  getHighQualityThumbnailUrl,
} from '../lib/trending-movies';
import { useLanguage } from '../contexts/LanguageContext';

const GOLD = '#c9a84c';
const GOLD_LIGHT = '#e8c87a';

export default function TrendingNowSection({ movies = [], limit = 5 }) {
  const { t, tr } = useLanguage();
  const scrollRef = useRef(null);
  const trendingMovies = getTopTrendingMovies(movies, limit);

  if (!trendingMovies.length) return null;

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction * 340, behavior: 'smooth' });
    }
  };

  return (
    <section
      aria-label={t.trending.heading}
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10"
    >
      <div className="flex items-end justify-between gap-4 mb-5">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2
            className="font-cinzel text-lg sm:text-xl font-bold tracking-wide"
            style={{ fontFamily: 'Cinzel, serif', color: '#f3efe3' }}
          >
            {t.trending.heading}
          </h2>
          <span className="text-xs tabular-nums" style={{ color: '#8a8778' }}>
            {tr('trending.subtitle', { count: trendingMovies.length })}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label={t.trending.scrollLeftAria}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.04] hover:bg-amber-500/15 border border-white/10 hover:border-amber-400/40 text-stone-300 hover:text-amber-200 transition-colors cursor-pointer"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={t.trending.scrollRightAria}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.04] hover:bg-amber-500/15 border border-white/10 hover:border-amber-400/40 text-stone-300 hover:text-amber-200 transition-colors cursor-pointer"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {trendingMovies.map((movie, index) => {
          const thumb = getHighQualityThumbnailUrl(movie.thumbnail_url || movie.poster_url || '');
          const views = getMovieViews(movie);
          const rating = Number.parseFloat(movie.rating);
          const rankLabel = String(index + 1).padStart(2, '0');

          return (
            <Link
              key={movie.id}
              href={`/watch/${movie.id}`}
              className="group relative shrink-0 w-[250px] sm:w-[285px] snap-start rounded-2xl overflow-hidden border border-white/[0.08] hover:border-amber-400/40 bg-[#0d0d15] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(0,0,0,0.65)]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/50">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={movie.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-600">
                    <Play size={28} />
                  </div>
                )}

                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(8,8,14,0.08) 0%, rgba(8,8,14,0.45) 48%, rgba(8,8,14,0.95) 100%)',
                  }}
                />

                {/* Hover play indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(10,10,16,0.75)',
                      border: '1px solid rgba(232,200,122,0.55)',
                      color: GOLD_LIGHT,
                    }}
                  >
                    <Play size={14} fill="currentColor" />
                  </span>
                </div>

                {/* Unboxed top-right rating */}
                {Number.isFinite(rating) && rating > 0 && (
                  <span
                    className="absolute top-2.5 right-3 text-[11px] font-semibold flex items-center gap-1 tabular-nums"
                    style={{ color: GOLD_LIGHT, textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
                  >
                    <Star size={11} fill={GOLD} stroke={GOLD} />
                    {rating.toFixed(1)}
                  </span>
                )}

                {/* Editorial Rank Numeral + Title */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-end gap-2.5">
                  <span
                    className="font-cinzel text-3xl sm:text-[34px] font-bold leading-[0.85] tabular-nums shrink-0 select-none"
                    style={{
                      fontFamily: 'Cinzel, serif',
                      background: index === 0
                        ? 'linear-gradient(180deg, #f8e9b5 0%, #c9a84c 100%)'
                        : 'linear-gradient(180deg, rgba(245,242,233,0.92) 0%, rgba(168,162,146,0.45) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {rankLabel}
                  </span>
                  <div className="min-w-0 flex-1 pb-0.5">
                    <h3 className="text-xs sm:text-[13px] font-semibold text-stone-100 truncate group-hover:text-amber-200 transition-colors">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-stone-300/85 tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Eye size={10} style={{ color: GOLD }} />
                        {formatViewCount(views)}
                      </span>
                      {movie.genre && (
                        <span className="text-stone-400 truncate">· {movie.genre.split(',')[0]}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
