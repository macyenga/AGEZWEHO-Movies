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
      className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-12 scroll-mt-44 md:scroll-mt-32"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <Calendar size={13} style={{ color: GOLD }} />
        <span className="section-tag">{t.comingSoon.heading}</span>
        <div className="flex-1 divider-soft" />
        <span className="text-[11px] hidden sm:inline" style={{ color: MUTED }}>
          {tr('comingSoon.upcomingCount', { count: upcoming.length })}
        </span>
        <Link href="/requests">
          <span className="text-[10px] cursor-pointer hover:underline" style={{ color: MUTED }}>
            {t.comingSoon.requestTitle}
          </span>
        </Link>
      </div>

      {/* Upcoming Releases Grid using existing glass-card styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {upcoming.map((movie, idx) => {
          const reminded = remindedIds.includes(movie.id);
          return (
            <motion.article
              key={movie.id}
              data-testid={`coming-soon-card-${movie.id}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.4, delay: Math.min(idx, 5) * 0.05 }}
              whileHover={{ y: -3 }}
              className="glass-card glass-card-hover rounded-2xl p-3 flex gap-3.5 items-stretch"
            >
              {/* Poster */}
              <div className="relative w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden flex-shrink-0 bg-[#13131e]">
                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={`${movie.title} poster`}
                    loading="lazy"
                    className="w-full h-full object-cover"
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
                  className={`absolute top-1.5 left-1.5 max-w-[calc(100%-12px)] truncate badge backdrop-blur-md ${
                    movie.type === 'Series'
                      ? 'badge-blue'
                      : movie.type === 'Anime'
                      ? 'badge-purple'
                      : 'badge-gold'
                  }`}
                  style={{ backgroundColor: 'rgba(10, 10, 15, 0.78)' }}
                >
                  {getMediaTypeLabel(movie.type, language)}
                </span>
              </div>

              {/* Release Info & Actions */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  {/* Release Date Pill */}
                  <div className="flex items-center flex-wrap gap-1.5 mb-2">
                    <span
                      data-testid={`coming-soon-date-${movie.id}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                      style={{
                        background: 'rgba(201,168,76,0.14)',
                        border: '1px solid rgba(201,168,76,0.3)',
                        color: '#e8c87a',
                      }}
                    >
                      <Calendar size={10} />
                      <span>{movie.formattedReleaseDate}</span>
                    </span>
                    <span
                      className="inline-flex items-center gap-1 text-[10px]"
                      style={{ color: '#8a8778' }}
                    >
                      <Clock size={9} />
                      <span>{getComingSoonCountdownLabel(movie.daysUntilRelease, language)}</span>
                    </span>
                  </div>

                  <h3
                    className="font-cinzel text-sm font-semibold leading-snug line-clamp-2 mb-1"
                    style={{ color: '#f0eee8' }}
                  >
                    {movie.title}
                  </h3>

                  <div className="flex items-center flex-wrap gap-1.5 mb-1.5 text-[10px]" style={{ color: MUTED }}>
                    {movie.genre && <span className="badge badge-muted">{getCategoryLabel(movie.genre, language)}</span>}
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
