import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import AdBanner from '../components/ads/AdBanner';
import FilterNav from '../components/FilterNav';
import {
  ArrowLeft, Plus, Heart, Clock, Smartphone, Crown, HeartHandshake, Newspaper,
  TrendingUp, User, Sparkles, Eye, BookOpen, Hash,
} from 'lucide-react';

const CATEGORIES = [
  'Amakuru agezweho', 'Amakuru mashya', 'Politiki', 'M23',
  'Ubukungu', 'Imyidagaduro', 'Siporo', 'Ubuzima', 'Uburezi', 'Ikoranabuhanga',
];

const TRENDING = [
  { tag: 'Amakuru agezweho', posts: '1.2K' },
  { tag: 'M23', posts: '856' },
  { tag: 'Amakuru mashya', posts: '723' },
  { tag: 'Kigali today', posts: '654' },
  { tag: 'Amazina agezweho', posts: '412' },
  { tag: 'Politiki', posts: '389' },
];

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [tipItem, setTipItem] = useState(null);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { setNews(data.news || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleLike = async (id) => {
    const res = await fetch(`/api/news/${id}/like`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setNews(prev => prev.map(n => n.id === id ? { ...n, likes: data.likes } : n));
    }
  };

  const filtered = useMemo(() => {
    if (!filter) return news;
    return news.filter(n => n.category === filter);
  }, [news, filter]);

  const featured = filtered.length > 0 ? filtered[0] : null;
  const rest = filtered.length > 1 ? filtered.slice(1) : [];

  const uniqueCategories = [...new Set(news.map(n => n.category))];
  const totalLikes = news.reduce((s, n) => s + (n.likes || 0), 0);

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Amakuru Agezweho — Igihe Amakuru Mashya, M23, Kigali Today"
        description="Latest Amakuru Agezweho news — igihe amakuru mashya, amakuru agezweho akakanya, M23 updates, amazina agezweho, kigali today, amaribaya agezweho, amakanzu agezweho. Community news from Rwanda and Burundi."
        keywords="amakuru agezweho, igihe amakuru mashya, igihe amakuru, amakuru igihe, amakuru agezweho akakanya, amakuru agezweho mu rwanda, amazina agezweho, amazina agezweho y'abakobwa, M23 Rwanda, kigali today, amaribaya agezweho, amakanzu agezweho, igihe.com amakuru agezweho, amakuru mashya, bwiza amakuru, Rwanda news, Burundi news"
        canonical="https://agasobanuye.rw/news"
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/">
              <motion.div whileHover={{ x: -3 }} className="text-xs" style={{ color: '#6a6a5a' }}>
                <ArrowLeft size={13} />
              </motion.div>
            </Link>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)' }}>
              <Newspaper size={20} style={{ color: '#38bdf8' }} />
            </div>
            <div>
              <h1 className="font-cinzel font-bold text-lg" style={{
                fontFamily: 'Cinzel,serif',
                background: 'linear-gradient(135deg,#7dd3fc,#38bdf8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Amakuru / News</h1>
              <p className="text-[10px]" style={{ color: '#6a6a5a' }}>Stories published by the community</p>
            </div>
          </div>
          <div className="divider-gold w-16" />
        </motion.div>

        {/* Stats bar */}
        {!loading && news.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="flex gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.12)' }}>
              <Newspaper size={11} style={{ color: '#38bdf8' }} />
              <span className="text-[10px]" style={{ color: '#6a6a5a' }}><span style={{ color:'#e8e6f0' }}>{news.length}</span> stories</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.12)' }}>
              <BookOpen size={11} style={{ color: '#fbbf24' }} />
              <span className="text-[10px]" style={{ color: '#6a6a5a' }}><span style={{ color:'#e8e6f0' }}>{uniqueCategories.length}</span> categories</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.12)' }}>
              <Heart size={11} style={{ color: '#f97316' }} />
              <span className="text-[10px]" style={{ color: '#6a6a5a' }}><span style={{ color:'#e8e6f0' }}>{totalLikes}</span> likes</span>
            </div>
          </motion.div>
        )}

        {/* Sticky category nav + publish */}
        <FilterNav
          accent="#38bdf8"
          active={filter}
          onSelect={(c) => setFilter(c === filter ? '' : c)}
          items={[{ id: '', label: 'All' }, ...CATEGORIES.map(c => ({ id: c, label: c }))]}
        >
          <Link href="/news/submit">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              style={{
                background: 'linear-gradient(135deg,rgba(56,189,248,0.15),rgba(14,165,233,0.08))',
                border: '1px solid rgba(56,189,248,0.3)',
                color: '#38bdf8',
                boxShadow: '0 0 16px rgba(56,189,248,0.06)',
              }}>
              <Sparkles size={12} /> Publish Story
            </motion.div>
          </Link>
        </FilterNav>
        <div className="pt-4" />

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            <div className="h-72 shimmer rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-56 shimmer rounded-xl" />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.12)' }}>
              <Newspaper size={32} style={{ color: '#4a4a3a' }} />
            </div>
            <h2 className="font-cinzel text-lg mb-2" style={{ fontFamily: 'Cinzel,serif', color: '#6a6a5a' }}>No stories yet</h2>
            <p className="text-xs mb-6" style={{ color: '#4a4a3a' }}>
              {filter ? `Nothing in "${filter}"` : 'Be the first to publish'}
            </p>
            <Link href="/news/submit">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
                style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', color: '#38bdf8' }}>
                <Sparkles size={14} /> Publish the first story
              </motion.div>
            </Link>
          </motion.div>
        ) : (
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              {/* Featured hero */}
              {featured && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-2xl overflow-hidden group relative">
                  <Link href={`/news/${featured.id}`} className="block">
                    <div className="aspect-[2/1] sm:aspect-[3/1] relative">
                      {featured.image_url ? (
                        <img src={featured.image_url} alt={featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.04)' }}>
                          <Newspaper size={48} style={{ color: '#3a3a2a' }} />
                        </div>
                      )}
                      <div className="absolute inset-0" style={{
                        background: 'linear-gradient(to top, rgba(10,10,18,0.9) 0%, rgba(10,10,18,0.2) 60%, transparent 100%)',
                      }} />
                      <div className="absolute top-4 left-4">
                        <span className="text-[9px] px-2 py-1 rounded font-semibold uppercase tracking-wider"
                          style={{ background: 'rgba(56,189,248,0.9)', color: '#fff' }}>
                          {featured.category}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                        <h2 className="font-cinzel font-bold text-xl sm:text-2xl mb-2 leading-tight"
                          style={{ fontFamily: 'Cinzel,serif', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                          {featured.title}
                        </h2>
                        <div className="flex items-center gap-3 text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          <span className="flex items-center gap-1"><User size={9} /> {featured.author_name}</span>
                          <span className="flex items-center gap-1"><Clock size={9} /> {timeAgo(featured.created_at)}</span>
                          <span className="flex items-center gap-1"><Heart size={9} /> {featured.likes || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rest.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: 'rgba(14,14,22,0.7)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                    <Link href={`/news/${item.id}`} className="block">
                      <div className="aspect-[16/10] overflow-hidden relative">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.03)' }}>
                            <Newspaper size={28} style={{ color: '#3a3a2a' }} />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 text-[8px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
                          style={{ background: 'rgba(56,189,248,0.85)', color: '#fff' }}>
                          {item.category}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1.5 text-[9px]" style={{ color: '#4a4a3a' }}>
                          <span className="flex items-center gap-1"><User size={8} /> {item.author_name}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Clock size={8} /> {timeAgo(item.created_at)}</span>
                        </div>
                        <h3 className="text-sm font-semibold mb-1.5 line-clamp-2 leading-snug" style={{ color: '#e8e4d8' }}>
                          {item.title}
                        </h3>
                        {item.content && (
                          <p className="text-[11px] leading-relaxed line-clamp-2 mb-3" style={{ color: '#8a8778' }}>{item.content}</p>
                        )}
                        <div className="flex items-center gap-3 text-[10px]" style={{ color: '#4a4a3a' }}>
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLike(item.id); }}
                            className="flex items-center gap-1 transition-colors hover:opacity-80"
                            style={{ color: '#4a4a3a' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                            onMouseLeave={e => e.currentTarget.style.color = '#4a4a3a'}>
                            <Heart size={10} /> {item.likes || 0}
                          </button>
                          {item.publisher_momo && (
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTipItem(item); }}
                              className="flex items-center gap-1 ml-auto transition-colors"
                              style={{ color: '#4a4a3a' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#22c55e'}
                              onMouseLeave={e => e.currentTarget.style.color = '#4a4a3a'}>
                              <Smartphone size={10} /> Tip
                            </button>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0 space-y-4">
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                className="p-5 rounded-2xl sticky top-24"
                style={{ background: 'rgba(14,14,22,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={15} style={{ color: '#f97316' }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#f97316' }}>Trending</span>
                </div>
                <div className="space-y-2.5">
                  {TRENDING.map((t, i) => (
                    <motion.button key={i} whileHover={{ x: 3 }}
                      onClick={() => setFilter(t.tag === filter ? '' : t.tag)}
                      className="w-full text-left group"
                      style={{
                        padding: '6px 10px',
                        borderRadius: '10px',
                        background: filter === t.tag ? 'rgba(56,189,248,0.08)' : 'transparent',
                        border: `1px solid ${filter === t.tag ? 'rgba(56,189,248,0.2)' : 'transparent'}`,
                      }}>
                      <div className="flex items-center gap-2">
                        <Hash size={10} style={{ color: filter === t.tag ? '#38bdf8' : '#4a4a3a' }} />
                        <span className="text-xs font-medium transition-colors" style={{
                          color: filter === t.tag ? '#38bdf8' : '#b8b4a8',
                        }}>{t.tag}</span>
                      </div>
                      <div className="text-[9px] pl-5" style={{ color: '#4a4a3a' }}>{t.posts} posts</div>
                    </motion.button>
                  ))}
                </div>
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <Link href="/news/submit">
                    <motion.div whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-semibold cursor-pointer"
                      style={{ background: 'rgba(56,189,248,0.08)', color: '#38bdf8' }}>
                      <Sparkles size={11} /> Publish a story
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        <AdBanner size="728x90" className="mt-8" />
      </div>

      {/* Tip Modal */}
      <AnimatePresence>
        {tipItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => { setTipItem(null); }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: 'rgba(12,12,24,0.95)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <HeartHandshake size={36} style={{ color: '#c9a84c', margin: '0 auto 12px', display: 'block' }} />
              <h3 className="font-cinzel text-lg mb-1 text-center" style={{ fontFamily: 'Cinzel,serif', color: '#c9a84c' }}>Tip Publisher</h3>
              <p className="text-xs text-center mb-4" style={{ color: '#8a8060' }}>
                Support <strong style={{ color: '#38bdf8' }}>{tipItem.author_name}</strong>
              </p>
              <p className="text-[10px] leading-relaxed mb-4 text-center" style={{ color: '#6a6a5a' }}>
                Tip via a secure MTN MoMo / Airtel Money donation — funds keep the news free and reach the publisher.
              </p>
              <Link href="/support">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#e8c87a' }}>
                  <Smartphone size={16} /> Donate via MTN MoMo / Airtel
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
