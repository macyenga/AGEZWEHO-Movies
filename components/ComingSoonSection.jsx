import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Clock, Play, Bell, BellRing, Tv2 } from 'lucide-react';
import { getUpcomingMovies } from '../lib/coming-soon';
import { useTrailer } from '../contexts/TrailerContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getComingSoonCountdownLabel, getCategoryLabel, getMediaTypeLabel } from '../lib/i18n';

const REMINDER_KEY = 'agasobanuye_coming_soon_reminders';
const GOLD = '#c9a84c';
const MUTED = '#6a6a5a';

export default function ComingSoonSection({ items }) {
  const { openTrailer } = useTrailer();
  const { language, t, tr } = useLanguage();
  const [remindedIds, setRemindedIds] = useState([]);
  const upcoming = getUpcomingMovies(items);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(REMINDER_KEY) || '[]');
      if (Array.isArray(saved)) setRemindedIds(saved);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleReminder = (id) => {
    setRemindedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(REMINDER_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  if (upcoming.length === 0) return null;

  return (
    <section
      id="coming-soon"
      data-testid="coming-soon-section"
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 scroll-mt-44 md:scroll-mt-32"
    >
      {/* Section Header */}
      <div className="flex items-baseline justify-between gap-4 pb-3 mb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="font-cinzel text-lg sm:text-xl font-bold tracking-wide" style={{ fontFamily: 'Cinzel, serif', color: '#f3efe3' }}>
            {t.comingSoon.heading}
          </h2>
          <span className="text-xs tabular-nums" style={{ color: '#8a8778' }}>
            {tr('comingSoon.upcomingCount', { count: upcoming.length })}
          </span>
        </div>
        <Link href="/requests" className="text-xs font-medium hover:text-amber-300 transition-colors whitespace-nowrap" style={{ color: '#a5a193' }}>
          {t.comingSoon.requestTitle}
        </Link>
      </div>

      {/* Upcoming Releases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {upcoming.map((movie) => {
          const reminded = remindedIds.includes(movie.id);
          return (
            <motion.article
              key={movie.id}
              data-testid={`coming-soon-card-${movie.id}`}
              whileHover={{
                scale: 1.02,
                y: -3,
                transition: { type: 'spring', stiffness: 280, damping: 22, mass: 0.75 },
              }}
              whileTap={{ scale: 0.99 }}
              style={{
                willChange: 'transform',
                background: 'rgba(15,15,24,0.82)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              className="group relative hover:z-20 rounded-2xl p-3.5 flex gap-3.5 items-stretch transition-colors hover:border-amber-400/35"
            >
              {/* Poster */}
              <div className="relative w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden flex-shrink-0 bg-[#13131e]">
                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={`${movie.title} poster`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full items-center justify-center"
                  style={{ display: movie.poster_url ? 'none' : 'flex' }}
                >
                  <Tv2 size={24} style={{ color: GOLD, opacity: 0.4 }} />
                </div>
                <div className="absolute inset-0 poster-fade" />
                <span
                  className="absolute top-2 left-2 text-[9px] font-semibold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: 'rgba(10, 10, 15, 0.8)',
                    color: movie.type === 'Series' ? '#7ec8f7' : movie.type === 'Anime' ? '#c4b5fd' : '#e8c87a',
                  }}
                >
                  {getMediaTypeLabel(movie.type, language)}
                </span>
              </div>

              {/* Release Info & Actions */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-2 text-[11px] tabular-nums">
                    <span
                      data-testid={`coming-soon-date-${movie.id}`}
                      className="inline-flex items-center gap-1 font-semibold"
                      style={{ color: '#e8c87a' }}
                    >
                      <Calendar size={11} />
                      <span>{movie.formattedReleaseDate}</span>
                    </span>
                    <span aria-hidden="true" style={{ color: '#504d42' }}>·</span>
                    <span className="inline-flex items-center gap-1" style={{ color: '#8a8778' }}>
                      <Clock size={10} />
                      <span>{getComingSoonCountdownLabel(movie.daysUntilRelease, language)}</span>
                    </span>
                  </div>

                  <h3
                    className="font-cinzel text-sm font-semibold leading-snug line-clamp-2 mb-1"
                    style={{ color: '#f0eee8' }}
                  >
                    {movie.title}
                  </h3>

                  <div className="flex items-center flex-wrap gap-1.5 mb-1.5 text-[11px]" style={{ color: '#8f8b7e' }}>
                    {movie.genre && (
                      <span style={{ color: '#b5b0a2' }}>{getCategoryLabel(movie.genre, language)}</span>
                    )}
                    {movie.genre && movie.interpreter && <span aria-hidden="true" style={{ color: '#504d42' }}>·</span>}
                    {movie.interpreter && <span className="truncate">{t.comingSoon.byPrefix} {movie.interpreter}</span>}
                  </div>

                  {movie.overview && (
                    <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: '#8a8778' }}>
                      {movie.overview}
                    </p>
                  )}
                </div>

                {/* Action Row */}
                <div className="flex items-center gap-2 mt-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    type="button"
                    onClick={() => openTrailer({ ...movie, year: movie.releaseDate?.slice(0, 4) })}
                    data-testid={`coming-soon-trailer-${movie.id}`}
                    className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    style={{
                      background: 'rgba(201,168,76,0.12)',
                      border: '1px solid rgba(201,168,76,0.32)',
                      color: '#e8c87a',
                    }}
                  >
                    <Play size={10} fill="currentColor" />
                    <span>{t.comingSoon.teaser}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleReminder(movie.id)}
                    aria-pressed={reminded}
                    data-testid={`coming-soon-remind-${movie.id}`}
                    className="py-1.5 px-2.5 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    style={
                      reminded
                        ? {
                            background: 'rgba(72,199,120,0.14)',
                            border: '1px solid rgba(72,199,120,0.35)',
                            color: '#7de0a8',
                          }
                        : {
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#b8b4a8',
                          }
                    }
                  >
                    {reminded ? <BellRing size={11} /> : <Bell size={11} />}
                    <span>{reminded ? t.comingSoon.notified : t.comingSoon.remind}</span>
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
