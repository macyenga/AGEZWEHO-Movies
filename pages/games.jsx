import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import SearchBar from '../components/SearchBar';
import AdBanner from '../components/ads/AdBanner';
import FilterNav from '../components/FilterNav';
import CATEGORIES, { CATEGORY_GROUPS } from '../lib/categories';
import { Package, Download, Star, Plus, ChevronDown, Crown, ArrowRight, AlertTriangle, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ACCENT = '#c9a84c';

export default function Games() {
  const [items,  setItems]  = useState([]);
  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState('');
  const [loading,setLoading]= useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, isPro } = useAuth();

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
      <SEOHead
        title="Premium Content"
        description="Download premium games, modded apps, and exclusive content on Agezweho Movies — Rwanda's home for Agasobanuye entertainment."
        keywords="premium games Rwanda, modded apps, game download Rwanda, Agezweho premium, Android games, PC games Rwanda"
        canonical="https://agezweho.com/games"
      />
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

        {/* Sticky filter nav */}
        <FilterNav items={[]}>
          {/* Category dropdown */}
          <div className="relative flex-shrink-0">
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
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
                  className="absolute top-full right-0 mt-2 z-50 w-64 max-h-80 overflow-y-auto rounded-xl p-2"
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

          <Link href="/submit-game" className="flex-shrink-0">
            <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
              style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', color: ACCENT }}>
              <Plus size={13} /> Add Content
            </motion.div>
          </Link>
        </FilterNav>
        <div className="pt-4" />

        {/* Pro upsell banner */}
        {!isPro && (
          <Link href="/subscribe">
            <motion.div whileHover={{ scale:1.01 }} whileTap={{ scale:0.99 }}
              className="relative overflow-hidden rounded-2xl mb-6 p-5 cursor-pointer"
              style={{ background:'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(201,168,76,0.05))', border:'1px solid rgba(251,191,36,0.2)' }}>
              <motion.div className="absolute inset-0 pointer-events-none"
                style={{ background:'linear-gradient(105deg,transparent 30%,rgba(251,191,36,0.08) 50%,transparent 70%)' }}
                animate={{ x:['-200%','300%'] }}
                transition={{ repeat:Infinity, duration:3, ease:'easeInOut' }} />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:'rgba(251,191,36,0.15)', border:'1px solid rgba(251,191,36,0.3)' }}>
                  <Crown size={18} style={{ color:'#fbbf24' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color:'#fbbf24' }}>Go Pro for unlimited access</div>
                  <div className="text-[11px] mt-0.5" style={{ color:'#8a8778' }}>
                    Get all premium content free + remove all ads — just 2,000 RWF/month
        </div>

        <AdBanner size="300x250" className="mt-6 mb-2 mx-auto" />
      </div>
                <ArrowRight size={16} style={{ color:'#fbbf24', flexShrink:0 }} />
              </div>
            </motion.div>
          </Link>
        )}

        {/* Disclaimer banner — covers all categories */}
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          className="mb-6 p-4 rounded-xl relative overflow-hidden"
          style={{ background:'rgba(224,92,58,0.06)', border:'1px solid rgba(224,92,58,0.2)' }}>
          <div className="flex gap-3 items-start">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color:'#e05c3a' }} />
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color:'#e05c3a' }}>Disclaimer</p>
              <p className="text-[11px] leading-relaxed" style={{ color:'#8a8778' }}>
                Content on this page is uploaded by community members. We do not host, verify, or endorse any files,
                links, or materials. All downloads and usage are entirely at <span style={{ color:'#e05c3a' }}>your own risk</span>.
                We are <span style={{ color:'#e05c3a' }}>not responsible</span> for any damage, data loss, device issues,
                or legal consequences. If uncertain, always use official versions.
              </p>
            </div>
          </div>
        </motion.div>

        <AdBanner size="728x90" className="mb-6" />

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

                    {/* Price / Pro badge */}
                    {isPro ? (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                        style={{ background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)' }}>
                        <Crown size={8} style={{ color:'#22c55e' }} />
                        <span className="text-[10px] font-semibold" style={{ color:'#22c55e' }}>Free</span>
                      </div>
                    ) : (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-1.5 py-0.5 rounded-md"
                        style={{ background:'rgba(10,10,15,0.75)', border:'1px solid rgba(251,191,36,0.2)' }}>
                        <Lock size={8} style={{ color:'#fbbf24' }} />
                        <span className="text-[10px] font-semibold" style={{ color:'#fbbf24' }}>{item.price || 50} RWF</span>
                      </div>
                    )}

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
