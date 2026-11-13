import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  Play,
  Star,
  Tv2,
  ArrowRight,
} from 'lucide-react';
import { useTrailer } from '../contexts/TrailerContext';
import { useLanguage } from '../contexts/LanguageContext';
import { formatViewCountLocalized, getCategoryLabel } from '../lib/i18n';
import {
  getHighQualityThumbnailUrl,
  getMovieViews,
  getTopTrendingMovies,
} from '../lib/trending-movies';

const GOLD = '#c9a84c';
const MUTED = '#6a6a5a';

export default function TrendingNowSection({ movies = [] }) {
  const sliderRef = useRef(null);
  const { openTrailer } = useTrailer();
  const { language, t, tr } = useLanguage();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const topTrending = getTopTrendingMovies(movies, 5);

  const updateScrollButtons = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = sliderRef.current;
    if (!el) return undefined;
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons, topTrending.length]);

  const scrollSlider = (direction) => {
    const el = sliderRef.current;
    if (!el) return;
    const step = Math.max(280, Math.round(el.clientWidth * 0.55));
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  if (topTrending.length === 0) return null;

  return (
    <section
      id="trending-now"
      data-testid="trending-now-section"
      aria-label="Trending Now"
      className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-8 scroll-mt-44 md:scroll-mt-32"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp size={14} style={{ color: GOLD }} />
        <h2 className="section-tag" style={{ color: '#e8c87a' }}>
          {t.trending.heading}
        </h2>
        <span className="hidden sm:inline text-[11px] font-medium" style={{ color: '#8a8778' }}>
          {tr('trending.subtitle', { count: topTrending.length })}
        </span>
        <div className="flex-1 divider-soft" />

        {/* Slider Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollSlider(-1)}
            disabled={!canScrollLeft}
            aria-label={t.trending.scrollLeftAria}
            data-testid="trending-scroll-left"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: '#e8e4d8',
            }}
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => scrollSlider(1)}
            disabled={!canScrollRight}
            aria-label={t.trending.scrollRightAria}
            data-testid="trending-scroll-right"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(201,168,76,0.12)',
              border: '1px solid rgba(201,168,76,0.32)',
              color: '#e8c87a',
            }}
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <Link
          href="/finder"
          className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium hover:underline whitespace-nowrap shrink-0"
          style={{ color: MUTED }}
        >
          <span>{t.trending.viewAll}</span>
          <ArrowRight size={11} />
        </Link>
      </div>

      {/* Horizontal Slider */}
      <div
        ref={sliderRef}
        data-testid="trending-slider"
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-proximity pb-2"
        style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
      >
        {topTrending.map((movie, idx) => {
          const views = getMovieViews(movie);
          const thumbUrl = getHighQualityThumbnailUrl(movie.poster_url, 900);

          return (
            <motion.article
              key={movie.id}
              data-testid={`trending-card-${movie.id}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="group snap-start flex-shrink-0 w-[268px] sm:w-[296px] lg:w-[310px] glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col"
            >
              {/* High-Quality Thumbnail */}
              <Link href={`/movies/${movie.id}`} className="relative block aspect-[16/10] overflow-hidden bg-[#13131e]">
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt={`${movie.title} thumbnail`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-[center_25%] transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}

                <div
                  className="w-full h-full items-center justify-center flex-col gap-1.5"
                  style={{ display: thumbUrl ? 'none' : 'flex' }}
                >
                  <Tv2 size={28} style={{ color: GOLD, opacity: 0.45 }} />
                  <span className="text-[11px] px-3 text-center line-clamp-1" style={{ color: '#8a8778' }}>
                    {movie.title}
                  </span>
                </div>

                {/* Scrim for crisp contrast over any thumbnail brightness */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(10,10,15,0.45) 0%, rgba(10,10,15,0.12) 45%, rgba(10,10,15,0.92) 100%)',
                  }}
                />

                {/* Top Row: Gold 'Trending' Badge + Rank */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10">
                  <span
                    data-testid={`trending-badge-${movie.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #f5e4a8 0%, #c9a84c 58%, #a67c25 100%)',
                      color: '#0a0a0f',
                      boxShadow: '0 4px 14px rgba(201,168,76,0.35)',
                    }}
                  >
                    <TrendingUp size={11} strokeWidth={2.5} />
                    <span>{t.trending.badge}</span>
                  </span>

                  <span
                    className="px-2 py-0.5 rounded-md text-[11px] font-cinzel font-bold tabular-nums whitespace-nowrap shrink-0"
                    style={{
                      background: 'rgba(10,10,15,0.82)',
                      border: '1px solid rgba(201,168,76,0.45)',
                      color: '#f5e4a8',
                      backdropFilter: 'blur(6px)',
                    }}
                  >
                    #{idx + 1}
                  </span>
                </div>

                {/* Bottom Thumbnail Metadata: Views + Rating */}
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10 text-[11px]">
                  <span
                    data-testid={`trending-views-${movie.id}`}
                    className="inline-flex items-center gap-1.5 font-medium tabular-nums"
                    style={{ color: '#e8e4d8' }}
                  >
                    <Eye size={12} style={{ color: '#e8c87a' }} />
                    <span>{formatViewCountLocalized(views, language)}</span>
                  </span>

                  {movie.rating && (
                    <span
                      className="inline-flex items-center gap-1 font-semibold tabular-nums"
                      style={{ color: '#f5e4a8' }}
                    >
                      <Star size={11} fill={GOLD} style={{ color: GOLD }} />
                      <span>{movie.rating}</span>
                    </span>
                  )}
                </div>
              </Link>

              {/* Card Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <Link href={`/movies/${movie.id}`} className="block">
                    <h3
                      className="font-cinzel text-sm font-semibold leading-snug line-clamp-1 mb-1 group-hover:text-[#e8c87a] transition-colors"
                      style={{ color: '#f0eee8' }}
                    >
                      {movie.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1.5 text-[11px] truncate" style={{ color: '#8a8778' }}>
                    {movie.year && <span className="tabular-nums">{movie.year}</span>}
                    {movie.genre && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>
                          {movie.genre
                            .split(',')
                            .map((g) => getCategoryLabel(g.trim(), language))
                            .join(', ')}
                        </span>
                      </>
                    )}
                    {movie.language && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{movie.language}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Row */}
                <div
                  className="flex items-center gap-2 pt-2.5"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <Link
                    href={`/movies/${movie.id}`}
                    className="flex-1 py-1.5 px-3 rounded-lg text-[11px] font-semibold text-center whitespace-nowrap transition-colors"
                    style={{
                      background: 'rgba(201,168,76,0.14)',
                      border: '1px solid rgba(201,168,76,0.34)',
                      color: '#e8c87a',
                    }}
                  >
                    {t.trending.watchNow}
                  </Link>
                  <button
                    type="button"
                    onClick={() => openTrailer(movie)}
                    data-testid={`trending-trailer-${movie.id}`}
                    aria-label={`${t.card.playTrailer} — ${movie.title}`}
                    className="py-1.5 px-3 rounded-lg text-[11px] font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#d8d4c8',
                    }}
                  >
                    <Play size={10} fill="currentColor" />
                    <span>{t.trending.trailer}</span>
                  </button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
