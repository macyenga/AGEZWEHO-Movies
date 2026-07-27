import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';
import CinematicBackground from '../components/CinematicBackground';
import SearchBar from '../components/SearchBar';
import CATEGORIES, { CATEGORY_GROUPS } from '../lib/categories';
import { Package, Download, Star, Plus, ChevronDown } from 'lucide-react';

const ACCENT = '#c9a84c';

export default function Games() {
  const [items,  setItems]  = useState([]);
  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState('');
  const [loading,setLoading]= useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch('/api/games')
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load games')))
      .then(({ games }) => { setItems(games || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => items.filter(m => {
    const q = query.toLowerCase();
    const mQ = !q || m.title?.toLowerCase().includes(q) || m.category?.toLowerCase().includes(q);
    const mT = !filter || m.category === filter;
    return mQ && mT;
  }), [items, query, filter]);

  const selectedLabel = filter ? CATEGORIES.find(c => c === filter) || filter : 'All Categories';

  return (
    <div className="min-h-screen bg-deep">
      <Head>
        <title>Premium Content — Agezweho Movies</title>
      </Head>
      <CinematicBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.25)' }}>
            <Package size={24} style={{ color: ACCENT }} />
          </div>
          <h1 className="font-cinzel font-bold text-2xl sm:text-3xl mb-2" style={{ fontFamily:'Cinzel,serif', color: ACCENT }}>
            Premium Content
          </h1>
          <p className="text-xs mb-4" style={{ color:'#8a8778' }}>Browse all premium content — games, apps, tools, and more</p>
          <div className="hero-line w-24 mx-auto mt-3 mb-6" />
          <div className="max-w-lg mx-auto mb-4">
            <SearchBar value={query} onChange={setQuery} onClear={() => setQuery('')}
              placeholder="Search by title or category..." />
          </div>
        </motion.div>

        {/* Filter + Add button row */}
        <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
          {/* Category dropdown */}
          <div className="relative">
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
              style={filter
                ? { background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.3)', color: ACCENT }
                : { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', color:'#8a8778' }
              }>
              {selectedLabel}
              <ChevronDown size={13} style={{ color: filter ? ACCENT : '#6a6a5a' }} />
            </motion.button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-64 max-h-80 overflow-y-auto rounded-xl p-2"
                  style={{ background:'rgba(10,10,20,0.96)', border:'1px solid rgba(201,168,76,0.15)', backdropFilter:'blur(16px)' }}>
                  <button onClick={() => { setFilter(''); setShowDropdown(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs transition-colors"
                    style={{ color: !filter ? ACCENT : '#8a8778', background: !filter ? 'rgba(201,168,76,0.08)' : 'transparent' }}>
                    All Categories
                  </button>
                  {CATEGORY_GROUPS.map(group => (
                    <div key={group.label}>
                      <div className="text-[9px] uppercase tracking-widest px-3 pt-2 pb-1" style={{ color:'#4a4a3a' }}>{group.label}</div>
                      {group.items.map(c => (
                        <button key={c} onClick={() => { setFilter(c); setShowDropdown(false); }}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors"
                          style={{ color: filter === c ? ACCENT : '#b8b4a8', background: filter === c ? 'rgba(201,168,76,0.08)' : 'transparent' }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  ))}
                </motion.div>
              </>
            )}
          </div>

          <Link href="/submit-game">
            <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
              style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', color: ACCENT }}>
              <Plus size={13} /> Add Content
            </motion.div>
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_,i) => <div key={i} className="shimmer aspect-[3/4] rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color:'#6a6a5a' }}>Nothing found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item, i) => (
              <Link key={item.id} href={`/games/${item.id}`}>
                <motion.div
                  initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true }} transition={{ delay: i*0.05 }}
                  whileHover={{ scale:1.03 }} whileTap={{ scale:0.98 }}
                  className="rounded-xl overflow-hidden group cursor-pointer"
                  style={{ background:'rgba(15,15,24,0.9)', border:'1px solid rgba(255,255,255,0.07)',
                    boxShadow:'0 4px 24px rgba(0,0,0,0.4)',
                    transition:'border-color 0.3s, box-shadow 0.3s' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)';
                    e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.6)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
                  }}
                >
                  {/* Cover */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {item.cover_url ? (
                      <img src={item.cover_url} alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105"
                        style={{ transition:'transform 0.5s ease' }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ background:'rgba(201,168,76,0.06)' }}>
                        <Package size={40} style={{ color:'rgba(201,168,76,0.3)' }} />
                      </div>
                    )}
                    <div className="absolute inset-0 poster-fade" />

                    {/* Category badge */}
                    <div className="absolute top-2 right-2">
                      <span className="text-[9px] px-2 py-0.5 rounded font-medium"
                        style={{ background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.3)', color: ACCENT }}>
                        {item.category}
                      </span>
                    </div>

                    {/* Version */}
                    {item.version && (
                      <div className="absolute bottom-2 left-2">
                        <span className="text-[10px] px-2 py-0.5 rounded"
                          style={{ background:'rgba(0,0,0,0.7)', color: ACCENT, border:'1px solid rgba(201,168,76,0.2)' }}>
                          v{item.version}
                        </span>
                      </div>
                    )}

                    {/* Price badge */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                      style={{ background:'rgba(10,10,15,0.75)', border:'1px solid rgba(251,191,36,0.2)' }}>
                      <span className="text-[10px] font-semibold" style={{ color:'#fbbf24' }}>{item.price || 50} RWF</span>
                    </div>

                    {/* Download count */}
                    {item.download_count > 0 && (
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                        style={{ background:'rgba(10,10,15,0.75)', border:'1px solid rgba(201,168,76,0.15)' }}>
                        <Download size={9} style={{ color: ACCENT }} />
                        <span className="text-[10px]" style={{ color: ACCENT }}>{item.download_count}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-1 mb-1" style={{ color:'#e8e4d8' }}>
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color:'#6a6a5a' }}>{item.category}</span>
                      {item.rating && (
                        <span className="flex items-center gap-0.5 text-[10px]" style={{ color: ACCENT }}>
                          <Star size={8} fill="currentColor" />{item.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
