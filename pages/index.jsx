import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import { getMovies, getComingSoonMovies } from '../lib/supabase';
import CinematicBackground from '../components/CinematicBackground';
import MovieCard from '../components/MovieCard';
import { MovieGridSkeleton } from '../components/MovieSkeleton';
import AdBanner, { NativeBanner } from '../components/ads/AdBanner';
import SupportCTA from '../components/SupportCTA';
import NewsletterSignup from '../components/NewsletterSignup';
import RecommendedForYou from '../components/RecommendedForYou';
import ComingSoonSection from '../components/ComingSoonSection';
import TrendingNowSection from '../components/TrendingNowSection';
import CategoryFilterBar from '../components/CategoryFilterBar';
import MovieSearchFilter from '../components/MovieSearchFilter';
import { MOVIE_CATEGORIES, filterMovies, getCategoryCounts, getMovieFilterYears } from '../lib/movie-filters';
import { useLanguage } from '../contexts/LanguageContext';
import { useCollection } from '../hooks/useCollection';
import { useTrailer } from '../contexts/TrailerContext';
import { getCategoryLabel, getMediaTypeLabel } from '../lib/i18n';
import { getAllSocialLinks } from '../lib/social-config';
import {
  Film, Inbox, ChevronLeft, ChevronRight, Download, Send, Heart, Upload,
  Newspaper, ShoppingBag, Sparkles, Star, Play, Eye, Tv, BookOpen, Compass,
  Swords, Theater, Laugh, Zap, Ghost, Rocket, Wand2, Siren, MessageSquare,
  Bookmark, X, Bell, ArrowUpRight, MessageCircle, Camera, Music2, Globe, AtSign, Subtitles
} from 'lucide-react';

const HERO_SOCIAL_ICONS = {
  telegram: Send,
  whatsapp: MessageCircle,
  instagram: Camera,
  tiktok: Music2,
  youtube: Play,
  facebook: Globe,
  x: AtSign,
};

const GOLD = '#c9a84c';
const GOLD_LIGHT = '#e8c87a';
const MUTED = '#8a8679';
const TEXT = '#f1ede2';
const DIM = '#565347';
const BLUE = '#38bdf8';
const AMBER = '#fbbf24';

const CATEGORIES = [
  { key: 'Series', label: 'Series', icon: Tv },
  { key: 'Anime', label: 'Anime', icon: Star },
  { key: 'Documentary', label: 'Documentary', icon: BookOpen },
];

const GENRES = MOVIE_CATEGORIES;

const GENRE_ROWS = [
  { name: 'Action',    icon: Swords,   color: '#ef4444' },
  { name: 'Drama',     icon: Theater,  color: '#f59e0b' },
  { name: 'Comedy',    icon: Laugh,    color: '#22c55e' },
  { name: 'Thriller',  icon: Zap,      color: '#06b6d4' },
  { name: 'Horror',    icon: Ghost,    color: '#a855f7' },
  { name: 'Romance',   icon: Heart,    color: '#ec4899' },
  { name: 'Sci-Fi',    icon: Rocket,   color: '#3b82f6' },
  { name: 'Fantasy',   icon: Wand2,    color: '#8b5cf6' },
  { name: 'Animation', icon: Sparkles, color: '#fbbf24' },
  { name: 'Adventure', icon: Compass,  color: '#14b8a6' },
  { name: 'Crime',     icon: Siren,    color: '#f43f5e' },
  { name: 'Mystery',   icon: Eye,      color: '#6366f1' },
];

const PER_PAGE = 24;

function NoticeBoard() {
  const [visible, setVisible] = useState(true);
  const { t } = useLanguage();
  if (!visible) return null;

  return (
    <div
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(14,14,22,0.52)',
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3">
        <Bell size={13} className="shrink-0" style={{ color: GOLD }} />
        <p className="text-xs leading-relaxed flex-1 min-w-0" style={{ color: '#a9a596' }}>
          {t.notice.prefix}{' '}
          <Link href="/requests" className="underline hover:text-amber-300 transition-colors" style={{ color: GOLD_LIGHT }}>
            {t.notice.link}
          </Link>{' '}
          {t.notice.suffix}
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label={t.notice.dismissAria}
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10"
          style={{ color: '#8a8778' }}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

function PremiereHeroStage({ movies = [] }) {
  const { language, t } = useLanguage();
  const { toggleWatchlist, isInWatchlist } = useCollection();
  const { openTrailer } = useTrailer();

  const featuredPool = movies.filter((m) => m.featured);
  const premiereList = (featuredPool.length > 0 ? featuredPool : movies).slice(0, 3);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= premiereList.length) setActiveIndex(0);
  }, [activeIndex, premiereList.length]);

  const activeMovie = premiereList[activeIndex] || movies[0] || null;
  const saved = activeMovie ? isInWatchlist(activeMovie.id) : false;

  return (
    <section
      aria-label="Featured Premiere"
      className="relative pt-20 sm:pt-24 pb-6 sm:pb-10 overflow-hidden"
    >
      {/* Full-bleed Kigali Screening Room + subtle ambient film atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/images/hero-cinema-stage.jpg"
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-55"
        />
        {activeMovie?.poster_url && (
          <img
            src={activeMovie.poster_url}
            alt=""
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-20 blur-3xl scale-110 transition-opacity duration-700"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(100deg, rgba(7,7,11,0.96) 0%, rgba(7,7,11,0.84) 44%, rgba(7,7,11,0.44) 76%, rgba(7,7,11,0.86) 100%)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32"
          style={{ background: 'linear-gradient(to top, #0a0a0f 0%, transparent 100%)' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeMovie ? (
          <>
            {/* Editorial Split: Narrative & Primary Action Left + Framed Vertical Poster Right */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_310px] xl:grid-cols-[minmax(0,1fr)_340px] gap-5 sm:gap-8 lg:gap-14 items-center">
              <div className="order-2 lg:order-1 min-w-0">
                {/* Quiet single-line stage eyebrow */}
                <div className="flex items-center justify-between gap-3 pb-3 mb-3.5 sm:pb-4 sm:mb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs tabular-nums" style={{ color: '#b8b3a6' }}>
                    <span className="font-semibold" style={{ color: GOLD_LIGHT }}>
                      {getMediaTypeLabel(activeMovie.type || 'Movie', language)}
                    </span>
                    {activeMovie.year && (
                      <>
                        <span aria-hidden="true" style={{ color: DIM }}>·</span>
                        <span>{activeMovie.year}</span>
                      </>
                    )}
                    {activeMovie.language && (
                      <>
                        <span aria-hidden="true" style={{ color: DIM }}>·</span>
                        <span>{activeMovie.language}</span>
                      </>
                    )}
                    {activeMovie.genre && (
                      <>
                        <span aria-hidden="true" style={{ color: DIM }}>·</span>
                        <span>
                          {activeMovie.genre
                            .split(',')
                            .map((g) => getCategoryLabel(g.trim(), language))
                            .join(', ')}
                        </span>
                      </>
                    )}
                    {activeMovie.rating && (
                      <>
                        <span aria-hidden="true" style={{ color: DIM }}>·</span>
                        <span className="inline-flex items-center gap-1 font-semibold" style={{ color: GOLD_LIGHT }}>
                          <Star size={11} fill={GOLD} stroke={GOLD} />
                          {activeMovie.rating}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <h1
                  className="font-cinzel font-bold leading-[1.04] tracking-tight mb-3 sm:mb-4"
                  style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: 'clamp(1.9rem, 4.1vw, 3.55rem)',
                    color: '#f7f4eb',
                    textWrap: 'balance',
                    textShadow: '0 6px 32px rgba(0,0,0,0.65)',
                  }}
                >
                  {activeMovie.title}
                </h1>

                {activeMovie.overview && (
                  <p
                    className="text-sm sm:text-[15px] leading-[1.62] sm:leading-[1.68] max-w-2xl mb-5 sm:mb-7 line-clamp-2 sm:line-clamp-3"
                    style={{ color: '#c4bfb2' }}
                  >
                    {activeMovie.overview}
                  </p>
                )}

                {/* Single Dominant Primary CTA + Quiet Secondary Controls */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <Link
                    href={`/watch/${activeMovie.id}`}
                    className="inline-flex items-center gap-2.5 px-7 py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-transform duration-200 hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #f6e3a4 0%, #c9a84c 100%)',
                      color: '#09080b',
                      boxShadow: '0 14px 34px rgba(201,168,76,0.28)',
                    }}
                  >
                    <Play size={14} fill="currentColor" />
                    <span>{t.spotlight.watchNow}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => openTrailer(activeMovie)}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors hover:bg-white/10"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.16)',
                      color: '#f1ede2',
                    }}
                  >
                    <Play size={12} />
                    <span>{t.trending.trailer}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWatchlist(activeMovie)}
                    data-testid="spotlight-watchlist-btn"
                    aria-pressed={saved}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer transition-colors hover:bg-white/10"
                    style={{
                      background: saved ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.03)',
                      border: saved ? '1px solid rgba(201,168,76,0.45)' : '1px solid rgba(255,255,255,0.12)',
                      color: saved ? '#f5e4a8' : '#c8c3b6',
                    }}
                  >
                    <Bookmark size={12} fill={saved ? GOLD : 'none'} />
                    <span>{saved ? t.card.inWatchlist : t.card.saveToWatchlist}</span>
                  </button>

                  <Link
                    href={`/movies/${activeMovie.id}`}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 sm:py-3 text-xs font-medium whitespace-nowrap transition-colors hover:text-amber-300"
                    style={{ color: '#b0ab9d' }}
                  >
                    <Download size={12} />
                    <span>{t.spotlight.download}</span>
                  </Link>
                </div>

                {/* Social Media Row: Telegram first, followed by WhatsApp, Instagram, TikTok, YouTube, Facebook, X */}
                <div
                  data-testid="hero-social-links"
                  className="mt-4 sm:mt-5 pt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {getAllSocialLinks().map((social) => {
                    const SocialIcon = HERO_SOCIAL_ICONS[social.id] || Send;
                    return (
                      <a
                        key={social.id}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`hero-social-${social.id}`}
                        aria-label={social.ariaLabel}
                        title={social.ariaLabel}
                        className="inline-flex items-center gap-1.5 py-1 text-xs font-medium whitespace-nowrap transition-opacity opacity-85 hover:opacity-100"
                        style={{ color: social.accentColor }}
                      >
                        <SocialIcon size={12} aria-hidden="true" />
                        <span style={{ color: '#d4cfc0' }}>{social.name}</span>
                        {social.id === 'telegram' && (
                          <ArrowUpRight size={11} style={{ color: social.accentColor }} aria-hidden="true" />
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Right Stage: Framed 3:4 Cinema Poster Showcase */}
              <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                <Link
                  href={`/movies/${activeMovie.id}`}
                  className="group relative w-full max-w-[380px] lg:max-w-[340px] aspect-[16/9] lg:aspect-[3/4] rounded-2xl overflow-hidden block bg-[#12121b]"
                  style={{
                    border: '1px solid rgba(232,200,122,0.28)',
                    boxShadow: '0 26px 64px rgba(0,0,0,0.75), 0 0 42px rgba(201,168,76,0.12)',
                  }}
                >
                  {activeMovie.poster_url ? (
                    <img
                      src={activeMovie.poster_url}
                      alt={activeMovie.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full items-center justify-center flex-col gap-2 px-6 text-center"
                    style={{
                      display: activeMovie.poster_url ? 'none' : 'flex',
                      background: 'linear-gradient(145deg, #171724 0%, #0d0d14 100%)',
                    }}
                  >
                    <Film size={32} style={{ color: GOLD, opacity: 0.45 }} />
                    <span className="font-cinzel text-sm" style={{ color: '#b8b4a8' }}>
                      {activeMovie.title}
                    </span>
                  </div>

                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(8,8,14,0.04) 0%, rgba(8,8,14,0.22) 55%, rgba(8,8,14,0.92) 100%)',
                    }}
                  />

                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      {activeMovie.uploaded_by && (
                        <div className="text-xs truncate" style={{ color: '#d4cfc0' }}>
                          {t.card.byPrefix}{' '}
                          <span className="font-semibold text-white">{activeMovie.uploaded_by}</span>
                        </div>
                      )}
                      {activeMovie.views > 0 && (
                        <div className="text-[11px] tabular-nums mt-0.5" style={{ color: '#a5a193' }}>
                          {Number(activeMovie.views).toLocaleString()} views
                        </div>
                      )}
                    </div>
                    <span
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
                      style={{
                        background: 'rgba(10,10,16,0.82)',
                        border: '1px solid rgba(232,200,122,0.55)',
                        color: GOLD_LIGHT,
                      }}
                    >
                      <Play size={14} fill="currentColor" />
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Full-Width 3-Card Thumbnail Premiere Dock below the hero split */}
            {premiereList.length > 1 && (
              <div
                className="mt-5 sm:mt-7 pt-3.5 sm:pt-4 flex sm:grid sm:grid-cols-3 gap-2.5 sm:gap-3 overflow-x-auto scrollbar-hide pb-1.5 sm:pb-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                {premiereList.map((item, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      data-testid={`hero-reel-tab-${idx}`}
                      className="group relative flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer min-w-[220px] sm:min-w-0 shrink-0 sm:shrink"
                      style={{
                        background: isActive ? 'rgba(201,168,76,0.11)' : 'rgba(14,14,22,0.55)',
                        border: isActive
                          ? '1px solid rgba(232,200,122,0.42)'
                          : '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-[#12121b]">
                        {item.poster_url ? (
                          <img
                            src={item.poster_url}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film size={14} style={{ color: GOLD, opacity: 0.45 }} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[11px] tabular-nums mb-0.5">
                          <span style={{ color: isActive ? GOLD_LIGHT : '#7e7a6d', fontWeight: 700 }}>
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          {item.year && <span style={{ color: '#7e7a6d' }}>{item.year}</span>}
                          {item.genre && (
                            <span className="truncate" style={{ color: '#8a8778' }}>
                              · {getCategoryLabel(item.genre.split(',')[0].trim(), language)}
                            </span>
                          )}
                        </div>
                        <div
                          className="text-xs sm:text-[13px] font-semibold truncate transition-colors group-hover:text-amber-200"
                          style={{ color: isActive ? '#f7f4eb' : '#c4bfb2' }}
                        >
                          {item.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <h1 className="font-cinzel text-3xl font-bold" style={{ color: GOLD_LIGHT }}>
              AGASOBANUYE.RW
            </h1>
          </div>
        )}
      </div>
    </section>
  );
}

function ScrollRow({ title, icon: Icon, color, movies, link, onViewAll, id }) {
  const rowRef = useRef(null);
  const { t } = useLanguage();
  const scroll = (dir) => {
    if (rowRef.current) rowRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section id={id} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 scroll-mt-32">
      <div className="flex items-baseline justify-between gap-4 pb-3 mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2.5">
          <Icon size={15} style={{ color }} />
          <h2 className="font-cinzel text-lg sm:text-xl font-bold tracking-wide" style={{ fontFamily: 'Cinzel, serif', color: '#f3efe3' }}>
            {title}
          </h2>
        </div>
        {link && (
          <Link href={link} className="text-xs font-medium hover:text-amber-300 transition-colors" style={{ color: MUTED }}>
            {t.homeSections.viewAll}
          </Link>
        )}
        {!link && onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-medium cursor-pointer hover:text-amber-300 transition-colors"
            style={{ color: MUTED }}
          >
            {t.homeSections.viewAll}
          </button>
        )}
      </div>
      <div className="relative group">
        {movies.length > 4 && (
          <>
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
              className="absolute left-0 top-0 bottom-0 z-20 w-10 flex items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              style={{ background: 'linear-gradient(90deg,rgba(10,10,15,0.85),transparent)' }}
            >
              <ChevronLeft size={18} style={{ color: GOLD }} />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Scroll right"
              className="absolute right-0 top-0 bottom-0 z-20 w-10 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              style={{ background: 'linear-gradient(270deg,rgba(10,10,15,0.85),transparent)' }}
            >
              <ChevronRight size={18} style={{ color: GOLD }} />
            </button>
          </>
        )}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-0.5"
          style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
        >
          {movies.map((m, i) => (
            <div key={m.id} className="flex-shrink-0" style={{ width: 'clamp(160px,16vw,196px)' }}>
              <MovieCard movie={m} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GenreNav({ active, onSelect }) {
  const { language } = useLanguage();
  return (
    <div
      className="sticky top-[110px] md:top-[64px] z-40"
      style={{
        background: 'rgba(10,10,16,0.94)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="flex items-center gap-5 overflow-x-auto scrollbar-hide"
          style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
        >
          <button
            type="button"
            onClick={() => onSelect('All')}
            className="flex-shrink-0 flex items-center gap-1.5 py-3 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            style={{
              color: active === 'All' ? GOLD_LIGHT : MUTED,
              borderBottom: active === 'All' ? `2px solid ${GOLD}` : '2px solid transparent',
            }}
          >
            <Compass size={12} />
            <span>{getCategoryLabel('All', language)}</span>
          </button>
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onSelect(g)}
              className="flex-shrink-0 py-3 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap hover:text-stone-200"
              style={{
                color: active === g ? GOLD_LIGHT : '#948f82',
                borderBottom: active === g ? `2px solid ${GOLD}` : '2px solid transparent',
              }}
            >
              {getCategoryLabel(g, language)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function NewsRowCard({ item }) {
  const date = item.created_at
    ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';
  return (
    <Link href={`/news/${item.id}`}>
      <div
        className="rounded-2xl overflow-hidden cursor-pointer h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/35"
        style={{ background: 'rgba(15,15,24,0.82)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {item.image_url && (
          <div className="w-full aspect-[16/9] overflow-hidden bg-[#12121b]">
            <img
              src={item.image_url}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-1.5 mb-1.5 text-[11px]" style={{ color: '#8a8778' }}>
            {item.category && <span style={{ color: BLUE, fontWeight: 600 }}>{item.category}</span>}
            {item.category && date && <span aria-hidden="true">·</span>}
            {date && <span>{date}</span>}
          </div>
          <p className="text-xs sm:text-sm font-semibold leading-snug mb-2 line-clamp-2" style={{ color: TEXT }}>
            {item.title}
          </p>
          <div className="flex items-center gap-3 text-[11px]" style={{ color: MUTED }}>
            {item.author_name && <span>{item.author_name}</span>}
            {item.likes > 0 && (
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Heart size={10} /> {item.likes}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function ShopRowCard({ item }) {
  return (
    <Link href={`/shop/${item.id}`}>
      <div
        className="rounded-2xl overflow-hidden cursor-pointer h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/35"
        style={{ background: 'rgba(15,15,24,0.82)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#12121b]">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={28} style={{ color: '#3a3a2a' }} />
            </div>
          )}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(8,8,14,0.86) 100%)' }}
          />
          <div
            className="absolute bottom-2.5 right-3 text-xs font-bold tabular-nums"
            style={{ color: AMBER }}
          >
            {item.currency || 'RWF'} {item.price}
          </div>
        </div>
        <div className="p-4">
          {item.category && (
            <div className="text-[11px] mb-1 font-medium" style={{ color: '#c9a84c' }}>
              {item.category}
            </div>
          )}
          <p className="text-xs sm:text-sm font-semibold leading-snug mb-1.5 line-clamp-1" style={{ color: TEXT }}>
            {item.title}
          </p>
          <div className="flex items-center justify-between gap-2 text-[11px]" style={{ color: MUTED }}>
            {item.seller_name ? <span className="truncate">{item.seller_name}</span> : <span />}
            <span className="inline-flex items-center gap-1 shrink-0" style={{ color: '#25d366' }}>
              <MessageSquare size={10} /> WhatsApp
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home({ movies: initial, comingSoon }) {
  const { language, t, tr } = useLanguage();
  const [movies, setMovies] = useState(initial || []);
  const [query, setQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(!initial || initial.length === 0);
  const [newsItems, setNewsItems] = useState([]);
  const [shopItems, setShopItems] = useState([]);

  useEffect(() => {
    if (!initial || initial.length === 0) {
      getMovies().then((d) => { setMovies(d); setLoading(false); }).catch(() => setLoading(false));
    }

    fetch('/api/news').then((r) => r.json()).then((d) => {
      const list = Array.isArray(d) ? d : d?.news;
      if (list?.length) setNewsItems(list.slice(0, 8));
    }).catch(() => {});

    fetch('/api/shop').then((r) => r.json()).then((d) => {
      const list = Array.isArray(d) ? d : d?.items;
      if (list?.length) setShopItems(list.slice(0, 8));
    }).catch(() => {});
  }, [initial]);

  useEffect(() => { setPage(1); }, [query, genreFilter, yearFilter, ratingFilter]);

  const availableYears = getMovieFilterYears(movies);
  const hasActiveFilters = Boolean(
    query.trim() || genreFilter || yearFilter !== 'All' || ratingFilter !== 'All'
  );

  const resetAllFilters = () => {
    setQuery('');
    setGenreFilter('');
    setYearFilter('All');
    setRatingFilter('All');
    setPage(1);
  };

  const filtered = filterMovies(movies, {
    query,
    type: 'All',
    category: genreFilter || 'All',
    year: yearFilter,
    minRating: ratingFilter,
  });

  const categoryCounts = getCategoryCounts(movies, GENRES, {
    query,
    type: 'All',
    year: yearFilter,
    minRating: ratingFilter,
  });

  const noResult = movies.length > 0 && filtered.length === 0;
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  const jumpToSection = (sectionId) => {
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 30);
  };

  const changePage = (p) => {
    setPage(p);
    jumpToSection('explore');
  };

  const moviesByType = (type) => movies.filter((m) => m.type === type);
  const moviesByGenre = (genre) => movies.filter((m) => m.genre?.toLowerCase().includes(genre.toLowerCase()));

  const handleGenreBrowse = (genre) => {
    if (genre !== 'All') {
      try {
        const stored = JSON.parse(localStorage.getItem('agezweho_viewed_genres') || '[]');
        const updated = [...new Set([genre, ...stored])].slice(0, 10);
        localStorage.setItem('agezweho_viewed_genres', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    if (genre === 'All') {
      setGenreFilter('');
      setPage(1);
      jumpToSection('explore');
      return;
    }
    setGenreFilter(genre);
    setPage(1);
    jumpToSection('explore');
  };

  return (
    <>
      <SEOHead
        title="Agasobanuye.rw — Agasobanuye Rocky 2026, Sankara, Agent Kim & Amakuru Mashya"
        description="Agasobanuye.rw — Rwanda's #1 editorial home for Agasobanuye movies — Rocky 2026, Rocky Kimomo, Sankara 2026, Agent Kim, trailers, reviews, and Kinyarwanda subtitles."
        keywords="agasobanuye rocky 2026, agasobanuye 2026, agasobanuye sankara 2026, agasobanuye gashya 2026 netflix, agasobanuye agent kim, agent kim reactivated, agasobanuye by rocky kimomo, agasobanuye by sankara, agasobanuye by fey 2025, agasobanuye by junior giti, mujyosi store download, agahinde agasobanuye na rocky, agasobanuye rocky new, amakuru agezweho, igihe amakuru mashya, amazina agezweho, M23 Rwanda, kigali today, Kinyarwanda movies, Rwanda movies"
        canonical="https://agasobanuye.rw"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Agasobanuye.rw',
            url: 'https://agasobanuye.rw',
            description: "Rwanda's home for Agasobanuye movies and news — Rocky 2026, Sankara, Agent Kim, Gashya Netflix, Igihe Amakuru Mashya.",
            inLanguage: 'rw-RW',
            potentialAction: {
              '@type': 'SearchAction',
              target: { '@type': 'EntryPoint', urlTemplate: 'https://agasobanuye.rw/finder?q={search_term_string}' },
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Agasobanuye Movie Finder',
            numberOfItems: 14,
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Agasobanuye Rocky 2026', url: 'https://agasobanuye.rw/finder?q=agasobanuye%20rocky%202026' },
              { '@type': 'ListItem', position: 2, name: 'Agasobanuye by Sankara', url: 'https://agasobanuye.rw/finder?q=agasobanuye%20by%20sankara' },
              { '@type': 'ListItem', position: 3, name: 'Agasobanuye Gashya 2026 Netflix', url: 'https://agasobanuye.rw/finder?q=agasobanuye%20gashya%202026%20netflix' },
              { '@type': 'ListItem', position: 4, name: 'Agasobanuye Agent Kim', url: 'https://agasobanuye.rw/finder?q=agasobanuye%20agent%20kim' },
              { '@type': 'ListItem', position: 5, name: 'Agasobanuye by Rocky Kimomo', url: 'https://agasobanuye.rw/finder?q=agasobanuye%20by%20rocky%20kimomo' },
              { '@type': 'ListItem', position: 6, name: 'Agasobanuye by Fey 2025', url: 'https://agasobanuye.rw/finder?q=agasobanuye%20by%20fey%202025' },
              { '@type': 'ListItem', position: 7, name: 'Agasobanuye by Junior Giti', url: 'https://agasobanuye.rw/finder?q=agasobanuye%20by%20junior%20giti' },
              { '@type': 'ListItem', position: 8, name: 'Agasobanuye by Yanga', url: 'https://agasobanuye.rw/finder?q=agasobanuye%20by%20yanga' },
              { '@type': 'ListItem', position: 9, name: 'Agahinde Agasobanuye na Rocky', url: 'https://agasobanuye.rw/finder?q=agahinde%20agasobanuye%20na%20rocky' },
              { '@type': 'ListItem', position: 10, name: 'Mujyosi Store Download', url: 'https://agasobanuye.rw/finder?q=mujyosi%20store%20download' },
              { '@type': 'ListItem', position: 11, name: 'Amakuru Agezweho', url: 'https://agasobanuye.rw/news' },
              { '@type': 'ListItem', position: 12, name: 'Igihe Amakuru Mashya', url: 'https://agasobanuye.rw/news' },
              { '@type': 'ListItem', position: 13, name: 'Amazina Agezweho', url: 'https://agasobanuye.rw/news' },
              { '@type': 'ListItem', position: 14, name: 'Kigali Today', url: 'https://agasobanuye.rw/news' },
            ],
          },
        ]}
      />

      <div className="min-h-screen bg-deep pb-16">
        <CinematicBackground />

        {/* 1. Full-Bleed Kigali Screening Room Premiere Stage */}
        <PremiereHeroStage movies={movies} />

        {/* 2. Quiet Editorial Notice Strip */}
        <NoticeBoard />

        {/* 3. Architectural Ranked Trending Showcase */}
        <TrendingNowSection movies={movies} limit={8} />

        {/* 4. Editorial Sticky Genre Rail */}
        <GenreNav active={genreFilter || 'All'} onSelect={handleGenreBrowse} />

        {/* 5. Main Film Catalog */}
        <section id="explore" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 scroll-mt-44 md:scroll-mt-32">
          <div className="flex items-baseline justify-between gap-4 pb-3 mb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="font-cinzel text-lg sm:text-xl font-bold tracking-wide" style={{ fontFamily: 'Cinzel, serif', color: '#f3efe3' }}>
                {t.homeSections.allTitles}
              </h2>
              {(genreFilter || yearFilter !== 'All' || ratingFilter !== 'All') && (
                <span className="text-xs font-medium" style={{ color: GOLD_LIGHT }}>
                  {[
                    genreFilter ? getCategoryLabel(genreFilter, language) : null,
                    yearFilter !== 'All' ? yearFilter : null,
                    ratingFilter !== 'All' ? `${ratingFilter}+ ★` : null,
                  ].filter(Boolean).join(' · ')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-medium px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                  style={{
                    background: 'rgba(201,168,76,0.12)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    color: GOLD_LIGHT,
                  }}
                >
                  {t.homeSections.reset}
                </button>
              )}
              <span className="text-xs tabular-nums" data-testid="explore-result-count" style={{ color: MUTED }}>
                {filtered.length} {filtered.length === 1 ? t.homeSections.titleSingular : t.homeSections.titlePlural}
                {totalPages > 1 && <span style={{ color: DIM }}> · p{page}/{totalPages}</span>}
              </span>
            </div>
          </div>

          <MovieSearchFilter
            query={query}
            onQueryChange={(val) => {
              setQuery(val);
              setPage(1);
            }}
            genre={genreFilter || 'All'}
            onGenreChange={(cat) => {
              setGenreFilter(cat === 'All' ? '' : cat);
              setPage(1);
            }}
            year={yearFilter}
            onYearChange={(yr) => {
              setYearFilter(yr);
              setPage(1);
            }}
            minRating={ratingFilter}
            onMinRatingChange={(rt) => {
              setRatingFilter(rt);
              setPage(1);
            }}
            availableYears={availableYears}
            categories={GENRES}
            onReset={resetAllFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <CategoryFilterBar
            categories={GENRES}
            activeCategory={genreFilter || 'All'}
            onSelectCategory={(cat) => {
              setGenreFilter(cat === 'All' || cat === genreFilter ? '' : cat);
              setPage(1);
            }}
            counts={categoryCounts}
            label={t.homeSections.filterByCategoryAria}
          />

          {loading && <MovieGridSkeleton count={12} />}

          {!loading && noResult && (
            <div className="text-center py-16">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)' }}
              >
                <Film size={28} style={{ color: '#4a4a3a' }} />
              </div>
              <h3 className="font-cinzel text-base mb-2" style={{ fontFamily: 'Cinzel,serif', color: GOLD }}>
                {query
                  ? t.homeSections.notInLibrary
                  : tr('homeSections.noCategoryTitles', {
                      category: genreFilter
                        ? getCategoryLabel(genreFilter, language)
                        : yearFilter !== 'All'
                        ? yearFilter
                        : ratingFilter !== 'All'
                        ? `${ratingFilter}+ ★`
                        : t.homeSections.allTitles,
                    })}
              </h3>
              <p className="text-xs mb-5" style={{ color: MUTED }}>
                {query ? (
                  <>
                    <span>&ldquo;<span style={{ color: '#b8b4a8' }}>{query}</span>&rdquo; — </span>
                    {t.homeSections.requestIt}
                  </>
                ) : (
                  t.homeSections.emptyFilterHint
                )}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                  style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: GOLD }}
                >
                  {t.homeSections.showAllTitles}
                </button>
                <Link href="/requests">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#b8b4a8' }}
                  >
                    <Inbox size={13} /> {t.homeSections.requestIt}
                  </div>
                </Link>
                <Link href="/submit">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#8a8778' }}
                  >
                    <Upload size={13} /> {t.homeSections.addIt}
                  </div>
                </Link>
              </div>
            </div>
          )}

          {!loading && !noResult && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
                {paginated.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => changePage(page - 1)}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium"
                    style={
                      page === 1
                        ? { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#3a3a2a', cursor: 'not-allowed' }
                        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#b8b4a8', cursor: 'pointer' }
                    }
                  >
                    <ChevronLeft size={14} /> {t.homeSections.prev}
                  </button>
                  {getPageNumbers().map((p, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => p !== '...' && changePage(p)}
                      className="w-9 h-9 rounded-xl text-xs font-medium flex items-center justify-center tabular-nums"
                      style={
                        p === page
                          ? { background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.45)', color: GOLD_LIGHT, cursor: 'default' }
                          : p === '...'
                          ? { background: 'transparent', border: 'none', color: '#4a4a3a', cursor: 'default' }
                          : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#8a8778', cursor: 'pointer' }
                      }
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => changePage(page + 1)}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium"
                    style={
                      page === totalPages
                        ? { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#3a3a2a', cursor: 'not-allowed' }
                        : { background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: GOLD, cursor: 'pointer' }
                    }
                  >
                    {t.homeSections.next} <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}

          {!loading && movies.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm mb-4" style={{ color: MUTED }}>{t.homeSections.noMoviesAdded}</p>
              <Link href="/submit">
                <div
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: GOLD }}
                >
                  <Upload size={14} /> {t.homeSections.addFirstMovie}
                </div>
              </Link>
            </div>
          )}
        </section>

        {/* 6. Curated Collections (Only collections with >= 2 titles) */}
        {CATEGORIES.map((cat) => {
          const catMovies = moviesByType(cat.key);
          if (catMovies.length < 2) return null;
          return (
            <ScrollRow
              key={cat.key}
              title={getMediaTypeLabel(cat.key, language)}
              icon={cat.icon}
              color={GOLD}
              movies={catMovies}
            />
          );
        })}

        {GENRE_ROWS.map((g) => {
          const genreMovies = moviesByGenre(g.name);
          if (genreMovies.length < 2) return null;
          return (
            <ScrollRow
              key={g.name}
              id={`genre-row-${g.name}`}
              title={getCategoryLabel(g.name, language)}
              icon={g.icon}
              color={g.color}
              movies={genreMovies.slice(0, 12)}
              onViewAll={() => handleGenreBrowse(g.name)}
            />
          );
        })}

        {/* Latest Official Subtitles -> Kinyarwanda */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14" aria-label="Official Subtitles Studio">
          <div
            className="p-5 sm:p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            style={{
              background: 'rgba(14,14,22,0.84)',
              border: '1px solid rgba(201,168,76,0.24)',
            }}
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: GOLD_LIGHT }}>
                <Subtitles size={14} />
                <span>Official Subtitles & Kinyarwanda Studio</span>
              </div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#f3efe3' }}>
                Download Latest Official Subtitles & Translate to Kinyarwanda
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#9c988b' }}>
                Fetch the latest official .SRT tracks, translate cue lines into Kinyarwanda, and download ready-to-play .SRT or .VTT subtitles.
              </p>
              {movies.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {movies.slice(0, 4).map((m) => (
                    <Link
                      key={m.id}
                      href={`/subtitles?q=${encodeURIComponent(m.title)}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:text-[#f5e4a8]"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        color: '#d4cfc0',
                      }}
                    >
                      {m.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/subtitles"
              data-testid="home-subtitles-studio-cta"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold whitespace-nowrap shrink-0"
              style={{
                background: 'linear-gradient(135deg,#e8c87a,#c9a84c)',
                color: '#09090f',
              }}
            >
              <Subtitles size={14} />
              <span>Browse Official Subtitles</span>
            </Link>
          </div>
        </section>

        {/* 7. Upcoming Premieres */}
        <ComingSoonSection items={comingSoon || undefined} />

        {/* 8. Latest Amakuru News */}
        {newsItems.length > 0 && (
          <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
            <div className="flex items-baseline justify-between gap-4 pb-3 mb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2.5">
                <Newspaper size={15} style={{ color: BLUE }} />
                <h2 className="font-cinzel text-lg sm:text-xl font-bold tracking-wide" style={{ fontFamily: 'Cinzel, serif', color: '#f3efe3' }}>
                  {t.homeSections.latestNews}
                </h2>
              </div>
              <Link href="/news" className="text-xs font-medium hover:text-sky-300 transition-colors" style={{ color: MUTED }}>
                {t.homeSections.viewAll}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {newsItems.slice(0, 4).map((item) => (
                <NewsRowCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* 9. Community Shop */}
        {shopItems.length > 0 && (
          <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
            <div className="flex items-baseline justify-between gap-4 pb-3 mb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={15} style={{ color: AMBER }} />
                <h2 className="font-cinzel text-lg sm:text-xl font-bold tracking-wide" style={{ fontFamily: 'Cinzel, serif', color: '#f3efe3' }}>
                  {t.homeSections.shopDeals}
                </h2>
              </div>
              <Link href="/shop" className="text-xs font-medium hover:text-amber-300 transition-colors" style={{ color: MUTED }}>
                {t.homeSections.viewAll}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {shopItems.slice(0, 4).map((item) => (
                <ShopRowCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* 10. Recommended For You */}
        <RecommendedForYou />

        {/* 11. Newsletter Signup */}
        <NewsletterSignup source="homepage" />

        {/* 12. Keep Us Free / Support CTA */}
        <SupportCTA />

        {/* 12. Partner Placements */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <AdBanner size="728x90" className="mb-3" />
          <NativeBanner />
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const [movies, comingSoon] = await Promise.all([
      getMovies(),
      getComingSoonMovies(),
    ]);
    return { props: { movies, comingSoon: comingSoon || null } };
  } catch {
    return { props: { movies: [], comingSoon: null } };
  }
}
