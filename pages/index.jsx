import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import { getMovies } from '../lib/supabase';
import CinematicBackground from '../components/CinematicBackground';
import SearchBar from '../components/SearchBar';
import MovieCard from '../components/MovieCard';
import AdBanner, { NativeBanner } from '../components/ads/AdBanner';
import SupportCTA from '../components/SupportCTA';
import {
  Film, Inbox, ChevronLeft, ChevronRight, Download, Send, Heart, Upload,
  Newspaper, ShoppingBag, Gamepad2, Search, TrendingUp, Sparkles,
  Star, Play, Eye, Tv, BookOpen, Compass, Swords, Theater, Laugh, Zap,
  Ghost, Rocket, Wand2, Siren
} from 'lucide-react';

const GOLD = '#c9a84c';
const MUTED = '#6a6a5a';
const TEXT = '#e8e4d8';
const DIM = '#4a4a3a';
const BG_CARD = 'rgba(14,14,22,0.6)';
const BORDER = 'rgba(255,255,255,0.06)';

function NoticeBoard() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
      className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-4">
      <div className="relative px-4 py-2.5 rounded-xl overflow-hidden flex items-center gap-3"
        style={{ background:'rgba(201,168,76,0.04)', border:'1px solid rgba(201,168,76,0.12)', backdropFilter:'blur(12px)' }}>
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{ background:'linear-gradient(105deg,transparent 30%,rgba(201,168,76,0.04) 50%,transparent 70%)' }}
          animate={{ x:['-100%','200%'] }}
          transition={{ repeat:Infinity, duration:5, ease:'easeInOut', repeatDelay:3 }} />
        <span className="text-sm flex-shrink-0">📢</span>
        <p className="text-[10px] leading-relaxed flex-1" style={{ color:'#8a8778' }}>
          Only requested movies and series are added. Head to{' '}
          <Link href="/requests"><span className="underline cursor-pointer" style={{ color:GOLD }}>Requests</span></Link>
          {' '}to submit — added within 24 hours.
        </p>
        <motion.button whileHover={{ scale:1.1, rotate:90 }} whileTap={{ scale:0.9 }}
          onClick={() => setVisible(false)}
          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#6a6a5a' }}>✕</motion.button>
      </div>
    </motion.div>
  );
}

const CATEGORIES = [
  { key:'Series', label:'Series', icon:Tv, count:0 },
  { key:'Anime', label:'Anime', icon:Star, count:0 },
  { key:'Documentary', label:'Documentary', icon:BookOpen, count:0 },
];

const GENRES = ['Action','Drama','Comedy','Thriller','Horror','Romance','Sci-Fi','Fantasy','Animation','Adventure','Crime','Mystery'];

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

function ScrollRow({ title, icon:Icon, color, movies, link, onViewAll, id }) {
  const rowRef = useRef(null);
  const scroll = (dir) => {
    if (rowRef.current) rowRef.current.scrollBy({ left: dir * 320, behavior:'smooth' });
  };
  return (
    <section id={id} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-10 scroll-mt-32">
      <div className="flex items-center gap-3 mb-4">
        <Icon size={13} style={{ color }} />
        <span className="section-tag" style={{ color }}>{title}</span>
        <div className="flex-1 divider-soft" />
        {link && (
          <Link href={link}>
            <span className="text-[10px] cursor-pointer hover:underline" style={{ color: MUTED }}>View all →</span>
          </Link>
        )}
        {!link && onViewAll && (
          <motion.button onClick={onViewAll} whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
            className="text-[10px] cursor-pointer hover:underline" style={{ color: MUTED }}>
            View all →
          </motion.button>
        )}
      </div>
      <div className="relative group">
        {movies.length > 4 && (
          <>
            <motion.button onClick={() => scroll(-1)}
              className="absolute left-0 top-0 bottom-0 z-20 w-10 flex items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background:'linear-gradient(90deg,rgba(10,10,15,0.85),transparent)' }}>
              <ChevronLeft size={18} style={{ color:GOLD }} />
            </motion.button>
            <motion.button onClick={() => scroll(1)}
              className="absolute right-0 top-0 bottom-0 z-20 w-10 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background:'linear-gradient(270deg,rgba(10,10,15,0.85),transparent)' }}>
              <ChevronRight size={18} style={{ color:GOLD }} />
            </motion.button>
          </>
        )}
        <div ref={rowRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollBehavior:'smooth', WebkitOverflowScrolling:'touch' }}>
          {movies.map((m, i) => (
            <div key={m.id} className="flex-shrink-0" style={{ width:'clamp(140px,16vw,180px)' }}>
              <MovieCard movie={m} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GenreNav({ active, onSelect }) {
  const navRef = useRef(null);
  const scroll = (dir) => {
    if (navRef.current) navRef.current.scrollBy({ left: dir * 200, behavior:'smooth' });
  };
  return (
    <motion.div
      initial={{ opacity:0, y:-8 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay:0.1, duration:0.4 }}
      className="sticky top-[64px] z-40 mb-2"
      style={{ background:'rgba(10,10,16,0.92)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div ref={navRef} className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-2.5"
          style={{ scrollBehavior:'smooth', WebkitOverflowScrolling:'touch' }}>
          <motion.button onClick={() => onSelect('All')}
            whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all"
            style={active === 'All'
              ? { background:'rgba(201,168,76,0.18)', border:'1px solid rgba(201,168,76,0.5)', color:'#e8c87a' }
              : { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', color:MUTED }}>
            <Compass size={10} /> All
          </motion.button>
          {GENRES.map(g => (
            <motion.button key={g} onClick={() => onSelect(g)}
              whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all"
              style={active === g
                ? { background:'rgba(201,168,76,0.18)', border:'1px solid rgba(201,168,76,0.5)', color:'#e8c87a' }
                : { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', color:MUTED }
              }>{g}</motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const BLUE = '#38bdf8';
const AMBER = '#fbbf24';

function NewsRowCard({ item, index }) {
  const date = item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '';
  return (
    <Link href={`/news/${item.id}`}>
      <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:'-20px' }}
        transition={{ delay: Math.min((index||0)%6,5)*0.04 }}
        whileHover={{ scale:1.02, y:-2 }}
        className="rounded-xl overflow-hidden cursor-pointer h-full"
        style={{ background:'rgba(14,14,22,0.6)', border:'1px solid rgba(56,189,248,0.08)' }}>
        {item.image_url && (
          <div className="w-full aspect-[16/9] overflow-hidden">
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500"
              style={{ willChange:'transform' }}
              onMouseEnter={e => e.currentTarget.style.transform='scale(1.06)'}
              onMouseLeave={e => e.currentTarget.style.transform='scale(1)'} />
          </div>
        )}
        <div className="p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            {item.category && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ background:'rgba(56,189,248,0.1)', color:BLUE, border:'1px solid rgba(56,189,248,0.15)' }}>
                {item.category}
              </span>
            )}
            {date && <span className="text-[9px]" style={{ color:DIM }}>{date}</span>}
          </div>
          <p className="text-[11px] font-semibold leading-tight mb-1.5 line-clamp-2" style={{ color:TEXT }}>{item.title}</p>
          <div className="flex items-center gap-2">
            {item.author_name && <span className="text-[9px]" style={{ color:MUTED }}>{item.author_name}</span>}
            {item.likes > 0 && (
              <span className="flex items-center gap-0.5 text-[9px]" style={{ color:DIM }}>
                <Heart size={8} /> {item.likes}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function ShopRowCard({ item, index }) {
  return (
    <Link href={`/shop/${item.id}`}>
      <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:'-20px' }}
        transition={{ delay: Math.min((index||0)%6,5)*0.04 }}
        whileHover={{ scale:1.02, y:-2 }}
        className="rounded-xl overflow-hidden cursor-pointer h-full"
        style={{ background:'rgba(14,14,22,0.6)', border:'1px solid rgba(251,191,36,0.08)' }}>
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          {item.image_url
            ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500"
                style={{ willChange:'transform' }}
                onMouseEnter={e => e.currentTarget.style.transform='scale(1.06)'}
                onMouseLeave={e => e.currentTarget.style.transform='scale(1)'} />
            : <div className="w-full h-full flex items-center justify-center" style={{ background:'rgba(255,255,255,0.03)' }}>
                <ShoppingBag size={28} style={{ color:'#3a3a2a' }} />
              </div>
          }
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-semibold"
            style={{ background:'rgba(251,191,36,0.15)', border:'1px solid rgba(251,191,36,0.3)', color:AMBER, backdropFilter:'blur(8px)' }}>
            {item.currency || 'RWF'} {item.price}
          </div>
          {item.category && (
            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md text-[8px]"
              style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', color:'#d4a040', border:'1px solid rgba(212,160,64,0.2)' }}>
              {item.category}
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-[11px] font-semibold leading-tight mb-1 line-clamp-1" style={{ color:TEXT }}>{item.title}</p>
          {item.seller_name && <p className="text-[9px] mb-1" style={{ color:MUTED }}>{item.seller_name}</p>}
          <div className="flex items-center gap-1">
            <MessageSquare size={8} style={{ color:'#25d366' }} />
            <span className="text-[8px]" style={{ color:'#25d366' }}>WhatsApp</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function HeroMovieSpotlight({ movie }) {
  if (!movie) return null;
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-10">
      <div className="relative rounded-2xl overflow-hidden"
        style={{ background:'rgba(14,14,22,0.7)', border:'1px solid rgba(201,168,76,0.15)' }}>
        {movie.poster_url && (
          <div className="absolute inset-0 opacity-20">
            <img src={movie.poster_url} alt="" className="w-full h-full object-cover"
              style={{ filter:'blur(40px) brightness(0.4)' }} />
          </div>
        )}
        <div className="absolute inset-0" style={{ background:'linear-gradient(135deg,rgba(10,10,15,0.9) 30%,rgba(10,10,15,0.5) 70%,transparent)' }} />
        <div className="relative z-10 flex flex-col sm:flex-row gap-6 p-6 sm:p-8 items-center sm:items-start">
          <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.15 }}
            className="flex-shrink-0 w-32 sm:w-44 rounded-xl overflow-hidden shadow-2xl"
            style={{ border:'1px solid rgba(255,255,255,0.08)' }}>
            {movie.poster_url
              ? <img src={movie.poster_url} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
              : <div className="w-full aspect-[2/3] flex items-center justify-center" style={{ background:'rgba(255,255,255,0.03)' }}>
                  <Film size={32} style={{ color:'#3a3a2a' }} />
                </div>
            }
          </motion.div>
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.25 }}
            className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mb-2">
              <span className="badge badge-gold text-[10px]">{movie.type || 'Movie'}</span>
              {movie.year && <span className="text-[11px]" style={{ color:MUTED }}>{movie.year}</span>}
              {movie.rating && (
                <span className="flex items-center gap-1 text-[11px]" style={{ color:GOLD }}>
                  <Star size={10} fill={GOLD} /> {movie.rating}
                </span>
              )}
              {movie.language && <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background:'rgba(201,168,76,0.1)', color:'#c9a84c', border:'1px solid rgba(201,168,76,0.15)' }}>{movie.language}</span>}
              {movie.platforms && movie.platforms.length > 0 && (
                <div className="flex gap-1">
                  {movie.platforms.slice(0, 3).map(p => (
                    <span key={p} className="text-[8px] px-1.5 py-0.5 rounded"
                      style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#b8b4a8' }}>
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <h2 className="font-cinzel font-bold text-lg sm:text-xl mb-2 leading-tight"
              style={{ fontFamily:'Cinzel,serif', color:TEXT }}>
              {movie.title}
            </h2>

            {movie.genre && (
              <div className="flex flex-wrap gap-1.5 mb-3 justify-center sm:justify-start">
                {movie.genre.split(',').map(g => (
                  <span key={g.trim()} className="text-[10px] px-2 py-0.5 rounded-md"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', color:'#b8b4a8' }}>
                    {g.trim()}
                  </span>
                ))}
              </div>
            )}

            {movie.overview && (
              <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color:MUTED }}>
                {movie.overview}
              </p>
            )}

            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                style={{ background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.3)', color:GOLD }}>
                <Play size={13} /> Watch Now
              </motion.div>
              <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#8a8778' }}>
                <Download size={13} /> Download
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function Home({ movies: initial }) {
  const [movies, setMovies] = useState(initial || []);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [genreFilter, setGenreFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(!initial || initial.length === 0);
  const [stats, setStats] = useState(null);
  const [heroMovie, setHeroMovie] = useState(null);
  const [newsItems, setNewsItems] = useState([]);
  const [shopItems, setShopItems] = useState([]);

  useEffect(() => {
    if (!initial || initial.length === 0) {
      getMovies().then(d => { setMovies(d); setLoading(false); }).catch(() => setLoading(false));
    }
    fetch('/api/search?q=a').then(r => r.json()).then(d => {
      setStats({
        movies: d.movies?.length || 0, games: d.games?.length || 0,
        news: d.news?.length || 0, shop: d.shop?.length || 0,
      });
    }).catch(() => {});

    fetch('/api/news').then(r => r.json()).then(d => {
      if (d?.length) setNewsItems(d.slice(0, 8));
    }).catch(() => {});

    fetch('/api/shop').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setShopItems(d.slice(0, 8));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (movies.length > 0) {
      const featured = movies.find(m => m.featured);
      setHeroMovie(featured || movies[0]);
    }
  }, [movies]);

  useEffect(() => { setPage(1); }, [query, filter, genreFilter]);

  const types = ['All', 'Movie', 'Series', 'Anime', 'Documentary'];

  const filtered = movies.filter(m => {
    const q = query.toLowerCase().trim();
    const mQ = !q
      || m.title?.toLowerCase().includes(q)
      || m.genre?.toLowerCase().includes(q)
      || m.language?.toLowerCase().includes(q);
    const mT = filter === 'All' || m.type === filter;
    const mG = !genreFilter || m.genre?.toLowerCase().includes(genreFilter.toLowerCase());
    return mQ && mT && mG;
  });

  const noResult = query && filtered.length === 0;
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages];
    return [1, '...', page-1, page, page+1, '...', totalPages];
  };

  const changePage = (p) => {
    setPage(p);
    setTimeout(() => {
      document.getElementById('explore')?.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 50);
  };

  const moviesByType = (type) => movies.filter(m => m.type === type);

  const moviesByGenre = (genre) => movies.filter(m =>
    m.genre?.toLowerCase().includes(genre.toLowerCase())
  );

  const handleGenreBrowse = (genre) => {
    if (genre === 'All') {
      setGenreFilter('');
      setPage(1);
      setTimeout(() => {
        document.getElementById('explore')?.scrollIntoView({ behavior:'smooth', block:'start' });
      }, 50);
      return;
    }
    setGenreFilter(genre);
    setPage(1);
    const row = document.getElementById(`genre-row-${genre}`);
    if (row) {
      setTimeout(() => {
        row.scrollIntoView({ behavior:'smooth', block:'start' });
      }, 50);
    } else {
      setTimeout(() => {
        document.getElementById('explore')?.scrollIntoView({ behavior:'smooth', block:'start' });
      }, 50);
    }
  };

  const trending = movies.slice(0, 8);

  return (
    <>
      <SEOHead
        title="Agezweho Movies — Agasobanuye Rocky 2026, Sankara, Agent Kim & Amakuru Agezweho"
        description="Rwanda's home for Agasobanuye movies — Rocky 2026, Rocky Kimomo, Sankara 2026, Agent Kim, Gashya 2026 Netflix, Fey, Junior Giti, Mujyosi Store — and latest Amakuru Agezweho, Igihe Amakuru Mashya, Amazina Agezweho & M23 coverage. Watch, download, stream free."
        keywords="agasobanuye rocky 2026, agasobanuye 2026, agasobanuye sankara 2026, agasobanuye gashya 2026 netflix, agasobanuye agent kim, agent kim reactivated, agasobanuye by rocky kimomo, agasobanuye by sankara, agasobanuye by fey 2025, agasobanuye by junior giti, mujyosi store download, agahinde agasobanuye na rocky, agasobanuye rocky new, amakuru agezweho, igihe amakuru mashya, igihe amakuru, amazina agezweho, M23 Rwanda, kigali today, amakuru agezweho akakanya, amakuru agezweho mu rwanda, Kinyarwanda movies, Rwanda movies"
        canonical="https://agezweho.com"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Agezweho Movies',
            url: 'https://agezweho.com',
            description: "Rwanda's home for Agasobanuye movies and Amakuru Agezweho news — Rocky 2026, Sankara, Agent Kim, Gashya Netflix, Igihe Amakuru Mashya, Amazina Agezweho.",
            inLanguage: 'rw-RW',
            potentialAction: {
              '@type': 'SearchAction',
              target: { '@type': 'EntryPoint', urlTemplate: 'https://agezweho.com/finder?q={search_term_string}' },
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Agasobanuye Movie Finder',
            numberOfItems: 14,
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Agasobanuye Rocky 2026', url: 'https://agezweho.com/finder?q=agasobanuye%20rocky%202026' },
              { '@type': 'ListItem', position: 2, name: 'Agasobanuye by Sankara', url: 'https://agezweho.com/finder?q=agasobanuye%20by%20sankara' },
              { '@type': 'ListItem', position: 3, name: 'Agasobanuye Gashya 2026 Netflix', url: 'https://agezweho.com/finder?q=agasobanuye%20gashya%202026%20netflix' },
              { '@type': 'ListItem', position: 4, name: 'Agasobanuye Agent Kim', url: 'https://agezweho.com/finder?q=agasobanuye%20agent%20kim' },
              { '@type': 'ListItem', position: 5, name: 'Agasobanuye by Rocky Kimomo', url: 'https://agezweho.com/finder?q=agasobanuye%20by%20rocky%20kimomo' },
              { '@type': 'ListItem', position: 6, name: 'Agasobanuye by Fey 2025', url: 'https://agezweho.com/finder?q=agasobanuye%20by%20fey%202025' },
              { '@type': 'ListItem', position: 7, name: 'Agasobanuye by Junior Giti', url: 'https://agezweho.com/finder?q=agasobanuye%20by%20junior%20giti' },
              { '@type': 'ListItem', position: 8, name: 'Agasobanuye by Yanga', url: 'https://agezweho.com/finder?q=agasobanuye%20by%20yanga' },
              { '@type': 'ListItem', position: 9, name: 'Agahinde Agasobanuye na Rocky', url: 'https://agezweho.com/finder?q=agahinde%20agasobanuye%20na%20rocky' },
              { '@type': 'ListItem', position: 10, name: 'Mujyosi Store Download', url: 'https://agezweho.com/finder?q=mujyosi%20store%20download' },
              { '@type': 'ListItem', position: 11, name: 'Amakuru Agezweho', url: 'https://agezweho.com/news' },
              { '@type': 'ListItem', position: 12, name: 'Igihe Amakuru Mashya', url: 'https://agezweho.com/news' },
              { '@type': 'ListItem', position: 13, name: 'Amazina Agezweho', url: 'https://agezweho.com/news' },
              { '@type': 'ListItem', position: 14, name: 'Kigali Today', url: 'https://agezweho.com/news' },
            ],
          },
        ]}
      />

      <div className="min-h-screen bg-deep">
        <CinematicBackground />

        {/* ══ HERO ══ */}
        <section className="relative flex flex-col items-center justify-center px-4 pt-20 pb-10 overflow-hidden">
          <div className="orb absolute -top-40 left-0 w-[500px] h-[500px]" style={{ background:'rgba(201,168,76,0.06)' }} />
          <div className="orb absolute top-0 right-0 w-[350px] h-[350px]" style={{ background:'rgba(168,85,247,0.04)' }} />

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.7, ease:[0.16,1,0.3,1] }}
            className="relative z-10 text-center w-full max-w-3xl mx-auto">

            <motion.div className="mb-3" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1, duration:0.8 }}>
              <motion.h1 className="font-cinzel font-bold tracking-[0.2em] leading-none select-none"
                style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(2.6rem,7vw,4.8rem)',
                  background:'linear-gradient(135deg,#f5e4a8 0%,#c9a84c 40%,#e8c87a 65%,#a07828 100%)',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
                  filter:'drop-shadow(0 0 30px rgba(201,168,76,0.4))',
                }}
                animate={{ filter:['drop-shadow(0 0 20px rgba(201,168,76,0.3))','drop-shadow(0 0 50px rgba(201,168,76,0.6))','drop-shadow(0 0 20px rgba(201,168,76,0.3))'] }}
                transition={{ repeat:Infinity, duration:3.5, ease:'easeInOut' }}>
                AGEZWEHO
              </motion.h1>
              <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }}
                transition={{ delay:0.5, duration:1.2, ease:'easeOut' }}
                className="divider-gold w-36 mx-auto mt-3" />
            </motion.div>

            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
              className="text-sm sm:text-base font-light mb-5 leading-relaxed max-w-lg mx-auto"
              style={{ color:'#8a8778' }}>
              Rwanda&apos;s home for Agasobanuye movies — Discover, stream, and download the latest episodes of Rocky, Sankara, Gashya, Agent Kim, and more.
            </motion.p>

            {/* Stats */}
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
              className="flex justify-center gap-3 mb-5 flex-wrap">
              {[
                { label: 'movies', value: movies.length, color: GOLD, icon: Film },
                { label: 'news', value: stats?.news || 0, color: '#38bdf8', icon: Newspaper },
                { label: 'shop', value: stats?.shop || 0, color: '#fbbf24', icon: ShoppingBag },
                { label: 'games', value: stats?.games || 0, color: '#a855f7', icon: Gamepad2 },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background:`${s.color}0A`, border:`1px solid ${s.color}18` }}>
                  <s.icon size={9} style={{ color:s.color }} />
                  <span className="text-[9px]" style={{ color:MUTED }}><span style={{ color:'#e8e6f0', fontWeight:600 }}>{s.value}</span> {s.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Search */}
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45 }}
              className="max-w-md mx-auto mb-5">
              <SearchBar value={query} onChange={setQuery} onClear={() => setQuery('')} placeholder="Search movies, series, anime..." />
            </motion.div>

            {/* Filter pills — cleaner */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.55 }}
              className="flex items-center justify-center gap-1.5 flex-wrap mb-5">
              {types.map(t => (
                <motion.button key={t} onClick={() => setFilter(t)}
                  whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                  className="px-3 py-1.5 rounded-full text-[10px] font-medium transition-all"
                  style={filter === t
                    ? { background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.4)', color:'#e8c87a' }
                    : { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', color:MUTED }
                  }>
                  {t}{t === 'Anime' && <span className="ml-0.5">✦</span>}
                </motion.button>
              ))}
            </motion.div>

            {/* CTAs — tighter */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.65 }}
              className="flex items-center justify-center gap-2 flex-wrap">
              <Link href="/submit">
                <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{ background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.3)', color:GOLD }}>
                  <Upload size={12} /> Add Movie
                </motion.div>
              </Link>
              <Link href="/requests">
                <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#8a8778' }}>
                  <Inbox size={12} /> Request
                </motion.div>
              </Link>
              <Link href="/live">
                <motion.div whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-medium"
                  style={{ background:'rgba(200,0,0,0.1)', border:'1px solid rgba(220,0,0,0.35)', color:'#ff4444' }}>
                  <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background:'#ef4444' }}
                    animate={{ opacity:[1,0.2,1] }} transition={{ repeat:Infinity, duration:1 }} />
                  Live Sports
                </motion.div>
              </Link>
              <motion.a href="https://t.me/+n3etNnm3RxI5NGZl" target="_blank" rel="noopener noreferrer"
                whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-medium"
                style={{ background:'rgba(34,158,217,0.1)', border:'1px solid rgba(34,158,217,0.3)', color:'#4fc3f7' }}>
                <Send size={10} /> Telegram
              </motion.a>
            </motion.div>
          </motion.div>
        </section>

        {/* Notice */}
        <NoticeBoard />

        {/* ══ HERO SPOTLIGHT ══ */}
        {heroMovie && <HeroMovieSpotlight movie={heroMovie} />}

        {/* ══ SUPPORT / KEEP US FREE ══ */}
        <SupportCTA />

        {/* ══ GENRE NAV (sticky) ══ */}
        <GenreNav active={genreFilter || 'All'} onSelect={handleGenreBrowse} />

        {/* ══ ADS ══ */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-10">
          <AdBanner size="728x90" className="mb-3" />
          <NativeBanner />
        </div>

        {/* ══ NEWS ROW ══ */}
        {newsItems.length > 0 && (
          <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Newspaper size={13} style={{ color:BLUE }} />
              <span className="section-tag" style={{ color:BLUE }}>Latest News</span>
              <div className="flex-1 divider-soft" />
              <Link href="/news"><span className="text-[10px] cursor-pointer hover:underline" style={{ color:MUTED }}>View all →</span></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {newsItems.slice(0, 4).map((item, i) => (
                <NewsRowCard key={item.id} item={item} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ══ TRENDING ROW ══ */}
        {trending.length > 0 && (
          <ScrollRow title="Trending Now" icon={TrendingUp} color="#ef4444" movies={trending} link="/finder" />
        )}

        {/* ══ SHOP ROW ══ */}
        {shopItems.length > 0 && (
          <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag size={13} style={{ color:AMBER }} />
              <span className="section-tag" style={{ color:AMBER }}>Shop Deals</span>
              <div className="flex-1 divider-soft" />
              <Link href="/shop"><span className="text-[10px] cursor-pointer hover:underline" style={{ color:MUTED }}>View all →</span></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {shopItems.slice(0, 4).map((item, i) => (
                <ShopRowCard key={item.id} item={item} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ══ CATEGORY ROWS ══ */}
        {CATEGORIES.map(cat => {
          const catMovies = moviesByType(cat.key);
          if (catMovies.length === 0) return null;
          return (
            <ScrollRow key={cat.key} title={cat.label} icon={cat.icon} color={GOLD} movies={catMovies} />
          );
        })}

        {/* ══ GENRE ROWS ══ */}
        {GENRE_ROWS.map(g => {
          const genreMovies = moviesByGenre(g.name);
          if (genreMovies.length === 0) return null;
          return (
            <ScrollRow key={g.name} id={`genre-row-${g.name}`} title={g.name} icon={g.icon} color={g.color}
              movies={genreMovies.slice(0, 12)} onViewAll={() => handleGenreBrowse(g.name)} />
          );
        })}

        {/* ══ BROWSE ALL ══ */}
        <section id="explore" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-24">
          <div className="flex items-center gap-3 mb-3">
            <Film size={13} style={{ color:GOLD }} />
            <span className="section-tag">{filter === 'All' ? 'All Titles' : filter}</span>
            <div className="flex-1 divider-soft" />
            <span className="text-[11px]" style={{ color:MUTED }}>
              {filtered.length} title{filtered.length !== 1 && 's'}
              {totalPages > 1 && <span style={{ color:'#4a4a3a' }}> · p{page}/{totalPages}</span>}
            </span>
          </div>

          {/* Genre chips */}
          <div className="flex items-center gap-1.5 flex-wrap mb-5">
            <motion.button onClick={() => setGenreFilter('')}
              whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
              className="px-2.5 py-1 rounded-lg text-[9px] font-medium transition-all"
              style={!genreFilter
                ? { background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)', color:GOLD }
                : { background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', color:DIM }
              }>All</motion.button>
            {GENRES.map(g => (
              <motion.button key={g} onClick={() => setGenreFilter(genreFilter === g ? '' : g)}
                whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                className="px-2.5 py-1 rounded-lg text-[9px] font-medium transition-all whitespace-nowrap"
                style={genreFilter === g
                  ? { background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)', color:GOLD }
                  : { background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', color:DIM }
                }>{g}</motion.button>
            ))}
          </div>

          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => (
                <div key={i}>
                  <div className="shimmer aspect-[2/3] rounded-xl mb-2" />
                  <div className="shimmer h-2.5 rounded w-3/4 mb-1.5" />
                  <div className="shimmer h-2 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!loading && noResult && (
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.12)' }}>
                <Film size={28} style={{ color:'#4a4a3a' }} />
              </div>
              <h3 className="font-cinzel text-base mb-2" style={{ fontFamily:'Cinzel,serif', color:GOLD }}>Not in the library</h3>
              <p className="text-xs mb-5" style={{ color:MUTED }}>
                {query && <span>&ldquo;<span style={{ color:'#b8b4a8' }}>{query}</span>&rdquo; isn&apos;t added yet. </span>}
                Request it or add it yourself.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/requests">
                  <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                    style={{ background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.3)', color:GOLD }}>
                    <Inbox size={13} /> Request It
                  </motion.div>
                </Link>
                <Link href="/submit">
                  <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#8a8778' }}>
                    <Upload size={13} /> Add It
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          )}

          {!loading && !noResult && (
            <>
              <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-10">
                <AnimatePresence>
                  {paginated.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
                </AnimatePresence>
              </motion.div>

              {totalPages > 1 && (
                <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                  className="flex items-center justify-center gap-2 flex-wrap">
                  <motion.button onClick={() => changePage(page-1)} disabled={page===1}
                    whileHover={page!==1 ? { scale:1.05 } : {}} whileTap={page!==1 ? { scale:0.95 } : {}}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium"
                    style={page===1
                      ? { background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', color:'#3a3a2a', cursor:'not-allowed' }
                      : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'#b8b4a8', cursor:'pointer' }
                    }>
                    <ChevronLeft size={14} /> Prev
                  </motion.button>
                  {getPageNumbers().map((p, i) => (
                    <motion.button key={i} onClick={() => p !== '...' && changePage(p)}
                      whileHover={p !== '...' ? { scale:1.08 } : {}} whileTap={p !== '...' ? { scale:0.93 } : {}}
                      className="w-9 h-9 rounded-xl text-xs font-medium flex items-center justify-center"
                      style={p===page
                        ? { background:'rgba(201,168,76,0.2)', border:'1px solid rgba(201,168,76,0.45)', color:'#e8c87a', boxShadow:'0 0 16px rgba(201,168,76,0.15)', cursor:'default' }
                        : p==='...'
                          ? { background:'transparent', border:'none', color:'#4a4a3a', cursor:'default' }
                          : { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', color:'#8a8778', cursor:'pointer' }
                      }>
                      {p}
                    </motion.button>
                  ))}
                  <motion.button onClick={() => changePage(page+1)} disabled={page===totalPages}
                    whileHover={page!==totalPages ? { scale:1.05 } : {}} whileTap={page!==totalPages ? { scale:0.95 } : {}}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium"
                    style={page===totalPages
                      ? { background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', color:'#3a3a2a', cursor:'not-allowed' }
                      : { background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.3)', color:GOLD, cursor:'pointer' }
                    }>
                    Next <ChevronRight size={14} />
                  </motion.button>
                </motion.div>
              )}
            </>
          )}

          {!loading && movies.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm mb-4" style={{ color:MUTED }}>No movies added yet.</p>
              <Link href="/submit">
                <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.3)', color:GOLD }}>
                  <Upload size={14} /> Add First Movie
                </motion.div>
              </Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const movies = await getMovies();
    return { props: { movies } };
  } catch {
    return { props: { movies: [] } };
  }
}
