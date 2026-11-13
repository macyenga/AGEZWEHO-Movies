import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles, Star, ChevronLeft, ChevronRight, RefreshCw,
  ExternalLink, Inbox, Search, Film, Eye, X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getCategoryLabel } from '../lib/i18n';

const GOLD = '#c9a84c';
const GOLD_LIGHT = '#e8c87a';
const MUTED = '#8a8778';
const DIM = '#4a4a3a';

export default function RecommendedForYou() {
  const { language, t } = useLanguage();
  const [recommendations, setRecommendations] = useState([]);
  const [recentGenres, setRecentGenres] = useState(['Action', 'Thriller']);
  const [activeGenre, setActiveGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [apiSource, setApiSource] = useState('omdb');
  const scrollRef = useRef(null);

  // Load viewed genres from localStorage or default
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('agezweho_viewed_genres') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        setRecentGenres(stored.slice(0, 6));
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchRecommendations = async (genreList, forceActive = activeGenre) => {
    setLoading(true);
    try {
      const targetGenres = forceActive !== 'All'
        ? forceActive
        : (genreList && genreList.length > 0 ? genreList.join(',') : 'Action,Thriller');

      const res = await fetch(`/api/omdb/recommendations?genres=${encodeURIComponent(targetGenres)}&limit=12`);
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
        if (data.source) setApiSource(data.source);
      }
    } catch (err) {
      console.warn('Failed to load OMDB recommendations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(recentGenres, activeGenre);
  }, [activeGenre]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecommendations(recentGenres, activeGenre);
  };

  const handleSelectGenre = (genre) => {
    setActiveGenre(genre);
  };

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 340, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sparkles size={13} className="text-amber-400" />
            </span>
            <span className="section-tag" style={{ color: GOLD }}>{t.recommended.heading}</span>
            <span
              className="text-[9px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.25)',
                color: GOLD_LIGHT,
              }}
            >
              {t.recommended.badge}
            </span>
          </div>
          <p className="text-xs" style={{ color: MUTED }}>
            {t.recommended.subtitle}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: MUTED,
            }}
            title={t.recommended.refresh}
          >
            <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
            <span>{t.recommended.refresh}</span>
          </motion.button>
        </div>
      </div>

      {/* Genre Filter Pills based on recent views */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-2.5 mb-4">
        <span className="text-[10px] uppercase font-semibold mr-1 flex-shrink-0" style={{ color: DIM }}>
          {t.recommended.yourGenres}
        </span>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleSelectGenre('All')}
          className="flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-semibold transition-all"
          style={
            activeGenre === 'All'
              ? { background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.5)', color: GOLD_LIGHT }
              : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: MUTED }
          }
        >
          {t.recommended.allRecentlyViewed}
        </motion.button>
        {recentGenres.map((g) => (
          <motion.button
            key={g}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleSelectGenre(g)}
            className="flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-medium transition-all"
            style={
              activeGenre === g
                ? { background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.5)', color: GOLD_LIGHT }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: MUTED }
            }
          >
            {getCategoryLabel(g, language)}
          </motion.button>
        ))}
      </div>

      {/* Carousel */}
      <div className="relative group">
        {recommendations.length > 4 && (
          <>
            <motion.button
              onClick={() => scroll(-1)}
              className="absolute left-0 top-0 bottom-0 z-20 w-10 flex items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'linear-gradient(90deg, rgba(10,10,15,0.9), transparent)' }}
            >
              <ChevronLeft size={20} style={{ color: GOLD }} />
            </motion.button>
            <motion.button
              onClick={() => scroll(1)}
              className="absolute right-0 top-0 bottom-0 z-20 w-10 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'linear-gradient(270deg, rgba(10,10,15,0.9), transparent)' }}
            >
              <ChevronRight size={20} style={{ color: GOLD }} />
            </motion.button>
          </>
        )}

        {loading ? (
          <div className="flex gap-3 overflow-hidden pb-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0" style={{ width: 'clamp(150px, 18vw, 190px)' }}>
                <div className="shimmer aspect-[2/3] rounded-xl mb-2" />
                <div className="shimmer h-3 rounded w-3/4 mb-1.5" />
                <div className="shimmer h-2 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div
            className="p-8 rounded-xl text-center"
            style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Film size={28} className="mx-auto mb-2" style={{ color: DIM }} />
            <p className="text-xs" style={{ color: MUTED }}>
              {t.recommended.empty}
            </p>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-3.5 overflow-x-auto scrollbar-hide pb-3 pt-1"
            style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
          >
            {recommendations.map((movie, idx) => (
              <motion.div
                key={movie.id || movie.imdbID || idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.03, y: -3 }}
                onClick={() => setSelectedMovie(movie)}
                className="flex-shrink-0 cursor-pointer rounded-xl overflow-hidden group/card"
                style={{
                  width: 'clamp(150px, 18vw, 190px)',
                  background: 'linear-gradient(160deg, rgba(26,26,40,0.85) 0%, rgba(15,15,22,0.95) 100%)',
                  border: '1px solid rgba(201,168,76,0.15)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] overflow-hidden bg-black/40">
                  {movie.poster_url ? (
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900/60">
                      <Film size={28} style={{ color: DIM }} />
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 poster-fade" />

                  {/* Matched Genre Tag */}
                  {movie.matchedGenre && (
                    <div className="absolute top-2 left-2 z-10">
                      <span
                        className="text-[8px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider backdrop-blur-md"
                        style={{
                          background: 'rgba(0,0,0,0.65)',
                          border: '1px solid rgba(201,168,76,0.35)',
                          color: GOLD_LIGHT,
                        }}
                      >
                        {movie.matchedGenre}
                      </span>
                    </div>
                  )}

                  {/* Year */}
                  {movie.year && (
                    <div className="absolute top-2 right-2 z-10">
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-medium backdrop-blur-md"
                        style={{
                          background: 'rgba(0,0,0,0.65)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#e8e4d8',
                        }}
                      >
                        {movie.year}
                      </span>
                    </div>
                  )}

                  {/* Hover action prompt */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center p-3">
                    <span
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg"
                      style={{
                        background: 'rgba(201,168,76,0.9)',
                        color: '#0a0a0f',
                      }}
                    >
                      <Eye size={12} /> {t.recommended.viewDetails}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3">
                  <h4 className="font-semibold text-xs leading-snug mb-1 line-clamp-1" style={{ color: '#e8e4d8' }}>
                    {movie.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px]" style={{ color: MUTED }}>
                    <span className="line-clamp-1">{movie.genre || movie.matchedGenre || 'Similar'}</span>
                    {movie.rating && (
                      <span className="flex items-center gap-0.5 flex-shrink-0" style={{ color: GOLD }}>
                        <Star size={9} fill="currentColor" /> {movie.rating}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Recommendation Details & Action */}
      <AnimatePresence>
        {selectedMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedMovie(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(20,20,32,0.96) 0%, rgba(12,12,18,0.98) 100%)',
                border: '1px solid rgba(201,168,76,0.3)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} style={{ color: GOLD }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD_LIGHT }}>
                    {t.recommended.modalTitle}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedMovie(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 flex flex-col sm:flex-row gap-5">
                <div className="w-28 sm:w-36 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                  <img
                    src={selectedMovie.poster_url}
                    alt={selectedMovie.title}
                    className="w-full aspect-[2/3] object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {selectedMovie.matchedGenre && (
                      <span className="badge badge-gold text-[9px]">Matched: {selectedMovie.matchedGenre}</span>
                    )}
                    {selectedMovie.year && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-300">
                        {selectedMovie.year}
                      </span>
                    )}
                    {selectedMovie.rating && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: GOLD }}>
                        <Star size={10} fill={GOLD} /> {selectedMovie.rating}
                      </span>
                    )}
                  </div>

                  <h3 className="font-cinzel text-base sm:text-lg font-bold leading-tight mb-2" style={{ color: '#e8e4d8' }}>
                    {selectedMovie.title}
                  </h3>

                  <p className="text-xs leading-relaxed text-gray-400 mb-4 line-clamp-3">
                    {selectedMovie.overview ||
                      `Recommended because you recently explored ${selectedMovie.matchedGenre || 'movies'} on Agasobanuye.rw.`}
                  </p>

                  <div className="flex flex-col gap-2 pt-2">
                    <Link
                      href={`/requests?title=${encodeURIComponent(selectedMovie.title)}&year=${encodeURIComponent(
                        selectedMovie.year || ''
                      )}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: 'linear-gradient(135deg, rgba(201,168,76,0.22), rgba(201,168,76,0.1))',
                        border: '1px solid rgba(201,168,76,0.4)',
                        color: GOLD_LIGHT,
                        textDecoration: 'none',
                      }}
                    >
                      <Inbox size={13} /> {t.recommended.requestTranslation}
                    </Link>

                    <div className="flex gap-2">
                      <Link
                        href={`/finder?q=${encodeURIComponent(selectedMovie.title)}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-medium"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#e8e4d8',
                          textDecoration: 'none',
                        }}
                      >
                        <Search size={11} /> {t.recommended.searchLibrary}
                      </Link>

                      {selectedMovie.imdbID && (
                        <a
                          href={`https://www.imdb.com/title/${selectedMovie.imdbID}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-[11px] font-medium"
                          style={{
                            background: 'rgba(245,197,24,0.1)',
                            border: '1px solid rgba(245,197,24,0.3)',
                            color: '#f5c518',
                            textDecoration: 'none',
                          }}
                        >
                          IMDb <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
