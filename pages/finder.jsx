import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import TrendingSearches from '../components/TrendingSearches';
import FilterNav from '../components/FilterNav';
import {
  Search, ArrowLeft, ExternalLink, Film, Gamepad2, Newspaper, ShoppingBag,
  Loader2, AlertTriangle, ChevronRight, Sparkles, Compass, Tv, Hash, BookOpen, TrendingUp, Flame,
} from 'lucide-react';
import AdBanner from '../components/ads/AdBanner';
import { TOP_QUERIES, RISING_QUERIES, getQueryUrl } from '../lib/trending';

const SITES = [
  { name: 'NCDTV',             color: '#22c55e', icon: '📺', badge: 'Very Active', url: q => `https://www.ncdtv.net/search?q=${encodeURIComponent(q)}` },
  { name: 'AgasobanuyeKose',   color: '#f59e0b', icon: '🔥', badge: 'Very Active', url: q => `https://agasobanuyekose.com/search.php?q=${encodeURIComponent(q)}` },
  { name: 'AgasobanuyeNow',    color: '#a855f7', icon: '▶️', badge: 'Very Active', url: q => `https://agasobanuyenow.com/search.php?q=${encodeURIComponent(q)}` },
  { name: 'KinyaFilms',        color: '#8b5cf6', icon: '🎬', badge: 'Active',      url: q => `https://www.kinyafilms.com/?s=${encodeURIComponent(q)}` },
  { name: 'Agasobanuye.info',  color: '#3b82f6', icon: 'ℹ️', badge: 'Active',      url: q => `https://agasobanuye.info/?s=${encodeURIComponent(q)}` },
  { name: 'OSHAkur Films',     color: '#ef4444', icon: '🎞️', badge: 'Active',      url: q => `https://oshakurfilms.com/?s=${encodeURIComponent(q)}` },
  { name: 'CineBeta',          color: '#06b6d4', icon: '🌍', badge: 'Active',      url: q => `https://www.cinebeta.com/reba?s=${encodeURIComponent(q)}` },
  { name: 'HotPluss',          color: '#f97316', icon: '⭐', badge: 'Active',      url: q => `https://hotpluss.com/search?q=${encodeURIComponent(q)}` },
  { name: 'Agasobanuye Filmz', color: '#ec4899', icon: '🎥', badge: 'Active',      url: q => `https://www.agasobanuyefilmz.com/?s=${encodeURIComponent(q)}` },
  { name: 'RebaMovie',         color: '#14b8a6', icon: '📱', badge: 'Active',      url: q => `https://www.rebamovie.com/search?q=${encodeURIComponent(q)}` },
  { name: 'reba.rw',           color: '#e11d48', icon: '🇷🇼', badge: 'Active',      url: q => `https://reba.rw/?s=${encodeURIComponent(q)}` },
  { name: 'Agasobanuye Films', color: '#6366f1', icon: '🎦', badge: 'Active',      url: q => `https://agasobanuyefilms.com/movie/search?q=${encodeURIComponent(q)}` },
  { name: 'Agasobanuye Times', color: '#f43f5e', icon: '📰', badge: 'Active',      url: q => `https://www.agasobanuyetimes.com/search?q=${encodeURIComponent(q)}` },
  { name: 'MihetoFilms',       color: '#0ea5e9', icon: '🎭', badge: 'Active',      url: q => `https://mihetofilms.com/?s=${encodeURIComponent(q)}` },
  { name: 'RujamaFilms',       color: '#d946ef', icon: '🎪', badge: 'Active',      url: q => `https://rujamafilms.com/?s=${encodeURIComponent(q)}` },
];

const TABS = [
  { id: 'site', label: 'Search Site', icon: Compass },
  { id: 'movies', label: 'Movie Finder', icon: Film },
];

const RESULT_CONFIG = {
  movies: { icon: Film, color: '#3b82f6', link: (i) => `/movies/${i.id}`, label: (i) => `${i.title}${i.year ? ` (${i.year})` : ''}`, section: 'Agasobanuye' },
  games: { icon: Gamepad2, color: '#a855f7', link: (i) => `/games/${i.id}`, label: (i) => i.title, section: 'Exclusive Games' },
  news: { icon: Newspaper, color: '#38bdf8', link: (i) => `/news/${i.id}`, label: (i) => i.title, section: 'Amakuru / News' },
  shop: { icon: ShoppingBag, color: '#fbbf24', link: (i) => `/shop/${i.id}`, label: (i) => `${i.title}${i.price ? ` — ${i.price}` : ''}`, section: 'Shop' },
};

export default function Finder() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('site');
  const [searched, setSearched] = useState('');
  const [clicked, setClicked] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (router.query.q) {
      setQuery(router.query.q);
      setSearched(router.query.q);
      if (tab === 'site') handleSiteSearch(router.query.q);
    }
  }, [router.query.q]);

  const handleSiteSearch = async (q) => {
    const searchTerm = q || query;
    if (!searchTerm.trim()) return;
    setSearched(searchTerm.trim());
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm.trim())}`);
      const data = await res.json();
      setResults(data);
    } catch { setResults({ movies: [], games: [], news: [], shop: [] }); }
    finally { setLoading(false); }
  };

  const handleMovieSearch = () => {
    if (!query.trim()) return;
    setSearched(query.trim());
    setClicked({});
  };

  const handleSiteClick = (site) => {
    setClicked(c => ({ ...c, [site.name]: true }));
    window.open(site.url(searched), '_blank');
  };

  const sections = results ? Object.entries(results).filter(([, items]) => items.length > 0) : [];
  const totalResults = results ? Object.values(results).reduce((s, arr) => s + arr.length, 0) : 0;

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Finder — Agasobanuye Rocky 2026, Sankara & Amakuru Search"
        description="Search movies, games, news, shop and 15+ Kinyarwanda sites. Find agasobanuye rocky 2026, sankara, agent kim, mujyosi store, agasobanuye gashya 2026 netflix, amakuru agezweho, igihe amakuru mashya, amazina, M23 updates."
        keywords="agasobanuye rocky 2026, agasobanuye sankara 2026, agasobanuye agent kim, agent kim reactivated, mujyosi store download, agasobanuye gashya 2026 netflix, agasobanuye by rocky kimomo, agasobanuye by sankara, agasobanuye by fey 2025, agasobanuye by junior giti, agasobanuye by yanga, agasobanuye live.com, amakuru agezweho, igihe amakuru, amazina agezweho, M23 Rwanda, kigali today, movie finder, Rwanda movies"
        canonical="https://agezweho.com/finder"
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/">
              <motion.div whileHover={{ x: -3 }} className="text-xs" style={{ color: '#6a6a5a' }}>
                <ArrowLeft size={13} />
              </motion.div>
            </Link>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}>
              <Search size={20} style={{ color: '#c9a84c' }} />
            </div>
            <div>
              <h1 className="font-cinzel font-bold text-lg" style={{
                fontFamily: 'Cinzel,serif',
                background: 'linear-gradient(135deg,#f5e4a8,#c9a84c)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Finder</h1>
              <p className="text-[10px]" style={{ color: '#6a6a5a' }}>Search everything on Agezweho + 15 movie sites</p>
            </div>
          </div>
          <div className="divider-gold w-16" />
        </motion.div>

        {/* Sticky tabs */}
        <FilterNav
          accent="#c9a84c"
          maxWidth="3xl"
          active={tab}
          onSelect={(id) => { setTab(id); setResults(null); setSearched(''); }}
          items={TABS.map(t => ({ id: t.id, label: t.label, icon: t.icon }))}
        />
        <div className="pt-4" />

        {/* Search bar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4a4a3a' }} />
              <input
                className="input-dark w-full pl-9 pr-4 py-3.5 rounded-xl text-sm"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (tab === 'site' ? handleSiteSearch() : handleMovieSearch())}
                placeholder={tab === 'site' ? "Search movies, games, news, shop..." : "Enter a movie or series name..."}
                autoFocus
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => tab === 'site' ? handleSiteSearch() : handleMovieSearch()}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg,rgba(201,168,76,0.15),rgba(180,140,60,0.08))',
                border: '1px solid rgba(201,168,76,0.3)',
                color: '#c9a84c',
                boxShadow: '0 0 16px rgba(201,168,76,0.06)',
              }}>
              <Search size={16} /> Search
            </motion.button>
          </div>
        </motion.div>

        <TrendingSearches compact />

        {/* Site Search Results */}
        {tab === 'site' && (
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4">
                <div className="h-4 shimmer rounded w-1/3 mb-2" />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="w-10 h-10 shimmer rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 shimmer rounded w-3/4" />
                      <div className="h-2 shimmer rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : results && sections.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)' }}>
                  <AlertTriangle size={28} style={{ color: '#4a4a3a' }} />
                </div>
                <p className="text-sm" style={{ color: '#6a6a5a' }}>No results on Agezweho</p>
                <p className="text-[10px] mt-1" style={{ color: '#3a3a2a' }}>Try the Movie Finder tab to search external sites</p>
              </motion.div>
            ) : results && sections.length > 0 ? (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                {/* Results header */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider"
                    style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}>
                    {totalResults} result{totalResults !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: '#e8c87a' }}>"{searched}"</span>
                  <div className="flex-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
                </div>
                {sections.map(([type, items]) => {
                  const cfg = RESULT_CONFIG[type];
                  return (
                    <div key={type}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 rounded-full" style={{ background: cfg.color }} />
                        <cfg.icon size={13} style={{ color: cfg.color }} />
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>
                          {cfg.section}
                        </span>
                        <span className="text-[9px]" style={{ color: '#4a4a3a' }}>({items.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {items.map(item => (
                          <Link key={item.id} href={cfg.link(item)}>
                            <motion.div whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.04)' }}
                              className="flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer"
                              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                              {item.cover_url || item.image_url ? (
                                <img src={item.cover_url || item.image_url} alt=""
                                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                  onError={e => e.target.style.display = 'none'} />
                              ) : (
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                                  <cfg.icon size={16} style={{ color: cfg.color, opacity: 0.4 }} />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate" style={{ color: '#e8e6f0' }}>{cfg.label(item)}</p>
                                <p className="text-[9px]" style={{ color: '#4a4a3a' }}>
                                  {item.category || item.author_name || item.seller_name || ''}
                                </p>
                              </div>
                              <ChevronRight size={12} style={{ color: '#4a4a3a' }} />
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : searched && !results ? null : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)' }}>
                  <Compass size={28} style={{ color: '#c9a84c' }} />
                </div>
                <p className="text-xs" style={{ color: '#4a4a3a' }}>Movies, games, news, shop — all in one place</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Movie Finder Results */}
        {tab === 'movies' && (
          <AnimatePresence>
            {searched ? (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider"
                    style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}>
                    {SITES.length} sites
                  </span>
                  <span className="text-xs font-semibold" style={{ color: '#e8c87a' }}>"{searched}"</span>
                  <div className="flex-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
                </div>

                <div className="flex items-center gap-2 mb-4 mt-4">
                  <div className="w-1 h-4 rounded-full" style={{ background: '#22c55e' }} />
                  <Tv size={13} style={{ color: '#22c55e' }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#22c55e' }}>Agasobanuye</span>
                  <span className="text-[9px]" style={{ color: '#4a4a3a' }}>({SITES.length} sites)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SITES.map((site, i) => (
                    <motion.button key={site.name}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.96 }}
                      onClick={() => handleSiteClick(site)}
                      className="relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-left overflow-hidden transition-all"
                      style={{
                        background: clicked[site.name] ? `${site.color}22` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${clicked[site.name] ? site.color + '50' : 'rgba(255,255,255,0.08)'}`,
                        color: clicked[site.name] ? site.color : '#b8b4a8',
                      }}>
                      <motion.div className="absolute inset-0 pointer-events-none"
                        style={{ background: `linear-gradient(105deg,transparent 30%,${site.color}08 50%,transparent 70%)` }}
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', repeatDelay: 1 + i * 0.2 }} />
                      <span className="text-lg flex-shrink-0">{site.icon}</span>
                      <div className="flex-1 min-w-0 relative z-10">
                        <div className="font-semibold text-xs truncate">{site.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[8px] px-1.5 py-0.5 rounded"
                            style={{
                              background: site.badge === 'Very Active' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.12)',
                              color: site.badge === 'Very Active' ? '#22c55e' : '#60a5fa',
                            }}>{site.badge}</span>
                          {clicked[site.name] && (
                            <span className="text-[8px]" style={{ color: site.color, opacity: 0.8 }}>Opened ✓</span>
                          )}
                        </div>
                      </div>
                      <ExternalLink size={12} className="relative z-10 flex-shrink-0" style={{ opacity: 0.5 }} />
                    </motion.button>
                  ))}
                </div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  className="mt-6 text-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => SITES.forEach((s, i) => setTimeout(() => handleSiteClick(s), i * 300))}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold"
                    style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: '#c9a84c' }}>
                    Open All Sites at Once
                  </motion.button>
                  <p className="text-[10px] mt-2" style={{ color: '#3a3a2a' }}>
                    Will open {SITES.length} tabs — make sure popups are allowed
                  </p>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)' }}>
                  <Film size={28} style={{ color: '#c9a84c' }} />
                </div>
                <p className="text-xs" style={{ color: '#4a4a3a' }}>Search across 15+ Kinyarwanda movie sites</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <AdBanner size="728x90" className="mt-8" />
      </div>
    </div>
  );
}
