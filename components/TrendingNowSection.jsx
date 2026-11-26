import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, Star, Play, Pause } from 'lucide-react';
import {
  getTopTrendingMovies,
  getMovieViews,
  formatViewCount,
  getHighQualityThumbnailUrl,
} from '../lib/trending-movies';
import { getMovieThumbnailSlides, getNextSlideIndex } from '../lib/subtitles';
import { useLanguage } from '../contexts/LanguageContext';
import AnimatedThumbnail from './AnimatedThumbnail';

const GOLD = '#c9a84c';
const GOLD_LIGHT = '#e8c87a';

export default function TrendingNowSection({ movies = [], limit = 5 }) {
  const { t, tr } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const scrollRef = useRef(null);
  const trendingMovies = getTopTrendingMovies(movies, limit);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (prefersReducedMotion || isPaused || trendingMovies.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => {
        const next = getNextSlideIndex(prev, trendingMovies.length, 1);
        const container = scrollRef.current;
        if (container) {
          const cards = container.querySelectorAll('[data-trending-card]');
          const target = cards[next];
          if (target) {
            container.scrollTo({
              left: Math.max(0, target.offsetLeft - 8),
              behavior: 'smooth',
            });
          }
        }
        return next;
      });
    }, 4400);
    return () => clearInterval(timer);
  }, [isPaused, prefersReducedMotion, trendingMovies.length]);

  if (!trendingMovies.length) return null;

  const scroll = (direction) => {
    const nextIdx = getNextSlideIndex(activeSlide, trendingMovies.length, direction);
    setActiveSlide(nextIdx);
    const container = scrollRef.current;
    if (container) {
      const cards = container.querySelectorAll('[data-trending-card]');
      const target = cards[nextIdx];
      if (target) {
        container.scrollTo({
          left: Math.max(0, target.offsetLeft - 8),
          behavior: 'smooth',
        });
      } else {
        container.scrollBy({ left: direction * 320, behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      aria-label={t.trending.heading}
      data-testid="trending-slide-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10"
    >
      <div className="flex items-end justify-between gap-4 mb-5">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2
            className="font-cinzel text-lg sm:text-xl font-bold tracking-wide"
            style={{ fontFamily: 'Cinzel, serif', color: 'var(--text)' }}
          >
            {t.trending.heading}
          </h2>
          <span className="text-xs tabular-nums" style={{ color: 'var(--muted)' }}>
            {tr('trending.subtitle', { count: trendingMovies.length })}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            aria-label={isPaused ? 'Resume thumbnail slide' : 'Pause thumbnail slide'}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text2)' }}
          >
            {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} />}
          </button>
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label={t.trending.scrollLeftAria}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text2)' }}
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={t.trending.scrollRightAria}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text2)' }}
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
          const rawSlides = getMovieThumbnailSlides(movie).map((u) => getHighQualityThumbnailUrl(u));
          const thumb = getHighQualityThumbnailUrl(movie.thumbnail_url || movie.poster_url || '');
          const slides = rawSlides.length > 0 ? rawSlides : (thumb ? [thumb] : []);
          const views = getMovieViews(movie);
          const rating = Number.parseFloat(movie.rating);
          const rankLabel = String(index + 1).padStart(2, '0');
          const isCurrent = index === activeSlide;

          return (
            <motion.div
              key={movie.id}
              data-trending-card
              initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.25), ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHoveredId(movie.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="shrink-0 w-[250px] sm:w-[285px] snap-start"
            >
              <Link
                href={`/watch/${movie.id}`}
                className="group relative block rounded-2xl overflow-hidden bg-[#0d0d15] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(0,0,0,0.65)]"
                style={{
                  border: isCurrent
                    ? '1px solid rgba(201,168,76,0.45)'
                    : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/50">
                  <AnimatedThumbnail
                    slides={slides}
                    alt={movie.title}
                    fallbackTitle={movie.title}
                    active={hoveredId === movie.id}
                    autoSlide={!isPaused && isCurrent}
                    aspectClass="aspect-[16/10]"
                  />

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
                      className="absolute top-2.5 right-3 text-[11px] font-semibold flex items-center gap-1 tabular-nums z-10"
                      style={{ color: GOLD_LIGHT, textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
                    >
                      <Star size={11} fill={GOLD} stroke={GOLD} />
                      {rating.toFixed(1)}
                    </span>
                  )}

                  {/* Editorial Rank Numeral + Title */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-end gap-2.5 z-10">
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
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
