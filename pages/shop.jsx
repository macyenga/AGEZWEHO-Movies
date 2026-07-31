import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import FilterNav from '../components/FilterNav';
import { ShoppingBag, Plus, Tag, Loader2, MessageCircle, Search, ArrowLeft, Clock, Store, TrendingUp, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'All', 'Electronics', 'Fashion', 'Phones & Tablets', 'Vehicles',
  'Property', 'Home & Garden', 'Sports', 'Books', 'Services', 'Other',
];

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function Shop() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
        const res = await fetch(`/api/shop${params}`);
        const data = await res.json();
        setItems(data.items || []);
      } catch { setItems([]); }
      finally { setLoading(false); }
    };
    load();
  }, [category]);

  const filtered = items.filter(i =>
    !search.trim() || i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSellers = [...new Set(items.map(i => i.seller_name))].length;
  const uniqueCats = [...new Set(items.map(i => i.category))];

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead title="Shop" description="Buy and sell items on Agezweho Shop — connect via WhatsApp" canonical="https://agezweho.com/shop" />
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
              style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}>
              <ShoppingBag size={20} style={{ color: '#fbbf24' }} />
            </div>
            <div>
              <h1 className="font-cinzel font-bold text-lg" style={{
                fontFamily: 'Cinzel,serif',
                background: 'linear-gradient(135deg,#fcd34d,#f59e0b)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Shop</h1>
              <p className="text-[10px]" style={{ color: '#6a6a5a' }}>Buy and sell — connect via WhatsApp</p>
            </div>
          </div>
          <div className="divider-gold w-16" />
        </motion.div>

        {/* Stats bar */}
        {!loading && items.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="flex gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.12)' }}>
              <Store size={11} style={{ color: '#fbbf24' }} />
              <span className="text-[10px]" style={{ color: '#6a6a5a' }}><span style={{ color:'#e8e6f0' }}>{items.length}</span> items</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.12)' }}>
              <MessageCircle size={11} style={{ color: '#25d366' }} />
              <span className="text-[10px]" style={{ color: '#6a6a5a' }}><span style={{ color:'#e8e6f0' }}>{totalSellers}</span> sellers</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.12)' }}>
              <TrendingUp size={11} style={{ color: '#a855f7' }} />
              <span className="text-[10px]" style={{ color: '#6a6a5a' }}><span style={{ color:'#e8e6f0' }}>{uniqueCats.length}</span> categories</span>
            </div>
          </motion.div>
        )}

        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a4a3a' }} />
            <input className="input-dark w-full pl-9 pr-3 py-3 rounded-xl text-sm"
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search items..." />
          </div>
          <Link href="/shop/submit">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold w-full sm:w-auto justify-center"
              style={{
                background: 'linear-gradient(135deg,rgba(251,191,36,0.15),rgba(245,158,11,0.08))',
                border: '1px solid rgba(251,191,36,0.3)',
                color: '#fbbf24',
                boxShadow: '0 0 16px rgba(251,191,36,0.06)',
              }}>
              <Sparkles size={16} /> Sell Item
            </motion.button>
          </Link>
        </div>

        {/* Sticky category nav */}
        <FilterNav
          accent="#fbbf24"
          active={category}
          onSelect={setCategory}
          items={CATEGORIES.map(c => ({ id: c, label: c }))}
        />
        <div className="pt-4" />

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/3] shimmer rounded-xl" />
                <div className="space-y-2 px-1">
                  <div className="h-3 shimmer rounded w-3/4" />
                  <div className="h-4 shimmer rounded w-1/3" />
                  <div className="h-2 shimmer rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.12)' }}>
              <ShoppingBag size={32} style={{ color: '#4a4a3a' }} />
            </div>
            <h2 className="font-cinzel text-lg mb-2" style={{ fontFamily: 'Cinzel,serif', color: '#6a6a5a' }}>No items found</h2>
            <p className="text-xs mb-6" style={{ color: '#4a4a3a' }}>
              {search ? `No results for "${search}"` : 'No listings in this category'}
            </p>
            <Link href="/shop/submit">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                <Sparkles size={14} /> Be the first to sell
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="group">
                <Link href={`/shop/${item.id}`}>
                  <div className="rounded-xl overflow-hidden h-full transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                    style={{ background: 'rgba(14,14,22,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="aspect-[4/3] overflow-hidden relative">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.03)' }}>
                          <ShoppingBag size={32} style={{ color: '#3a3a2a' }} />
                        </div>
                      )}
                      {item.price && (
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold"
                          style={{ background: 'rgba(251,191,36,0.9)', color: '#0f0f16' }}>
                          {item.price}
                        </div>
                      )}
                    </div>
                    <div className="p-3.5">
                      <p className="text-xs font-semibold truncate mb-1" style={{ color: '#e8e6f0' }}>{item.title}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-medium"
                          style={{ background: 'rgba(251,191,36,0.08)', color: '#d4a040' }}>
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px]" style={{ color: '#4a4a3a' }}>
                        <MessageCircle size={8} style={{ color: '#25d366' }} />
                        <span className="truncate">{item.seller_name}</span>
                        <span className="ml-auto">{timeAgo(item.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
