import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import CinematicBackground from '../components/CinematicBackground';
import { Search, ArrowLeft, ExternalLink, Film } from 'lucide-react';

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

export default function Finder() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState('');
  const [clicked, setClicked] = useState({});

  useEffect(() => {
    if (router.query.q) {
      setQuery(router.query.q);
      setSearched(router.query.q);
    }
  }, [router.query.q]);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearched(query.trim());
    setClicked({});
  };

  const handleSiteClick = (site) => {
    setClicked(c => ({ ...c, [site.name]: true }));
    window.open(site.url(searched), '_blank');
  };

  return (
    <div className="min-h-screen bg-deep">
      <Head>
        <title>Movie Finder — Agezweho Movies</title>
        <meta name="description" content="Search across 15 Kinyarwanda Agasobanuye movie sites at once — NCDTV, KinyaFilms, AgasobanuyeKose, AgasobanuyeNow, and more" />
      </Head>
      <CinematicBackground />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link href="/">
            <motion.div whileHover={{ x: -3 }} className="inline-flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: '#6a6a5a' }}
              onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
              onMouseLeave={e => e.currentTarget.style.color = '#6a6a5a'}>
              <ArrowLeft size={13} /> Back to Agasobanuye
            </motion.div>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}>
            <Search size={24} style={{ color: '#c9a84c' }} />
          </div>
          <h1 className="font-cinzel font-bold text-2xl sm:text-3xl mb-2"
            style={{ fontFamily: 'Cinzel,serif',
              background: 'linear-gradient(135deg,#f5e4a8,#c9a84c)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Movie Finder
          </h1>
          <p className="text-xs leading-relaxed max-w-md mx-auto" style={{ color: '#6a6a5a' }}>
            Type any movie name and search across Kinyarwanda Agasobanuye movie sites at once.
            Click any site to open it directly.
          </p>
          <div className="divider-gold w-20 mx-auto mt-3" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                className="input-dark w-full px-4 py-3.5 rounded-xl text-sm"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Enter movie or series name..."
                autoFocus
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleSearch}
              className="btn-primary flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold flex-shrink-0">
              <Search size={16} /> Search
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {searched && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-5">
                <Film size={14} style={{ color: '#c9a84c' }} />
                <span className="section-tag">Results for</span>
                <span className="text-sm font-semibold" style={{ color: '#e8c87a' }}>"{searched}"</span>
                <div className="flex-1 divider-soft" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SITES.map((site, i) => (
                  <motion.button key={site.name}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
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
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', repeatDelay: 1 + i * 0.2 }}
                    />
                    <span className="text-lg flex-shrink-0">{site.icon}</span>
                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="font-semibold text-xs truncate">{site.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{
                            background: site.badge === 'Very Active' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.12)',
                            color: site.badge === 'Very Active' ? '#22c55e' : '#60a5fa',
                          }}>{site.badge}</span>
                        {clicked[site.name] && (
                          <span className="text-[9px]" style={{ color: site.color, opacity: 0.8 }}>Opened ✓</span>
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
          )}
        </AnimatePresence>

        {!searched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-center py-8">
            <p className="text-xs" style={{ color: '#4a4a3a' }}>
              Type a movie name above and press Search or Enter
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}