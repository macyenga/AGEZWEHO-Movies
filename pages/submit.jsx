import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { addMovie } from '../lib/supabase';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import { Film, Plus, Trash2, Save, ArrowLeft, CheckCircle2, Upload, Sparkles, Link2, Smartphone, User, Monitor } from 'lucide-react';
import AdBanner from '../components/ads/AdBanner';

const PLATFORMS = [
  { name: 'Telegram',     color: '#229ED9' },
  { name: 'Google Drive', color: '#4285F4' },
  { name: 'Mega.nz',      color: '#D9272E' },
  { name: 'MediaFire',    color: '#1B82E4' },
  { name: 'Filmyzilla',   color: '#e05c3a' },
  { name: 'Filmywap',     color: '#c0392b' },
  { name: '1Fichier',     color: '#55a05b' },
  { name: 'YouTube',      color: '#FF0000' },
  { name: 'Custom',       color: '#c9a84c' },
];

const EMPTY = { title:'', year:'', type:'Movie', language:'', genre:'', rating:'', poster_url:'', overview:'', uploaded_by:'', uploader_momo_number:'', featured:false, trailer_url:'' };

export default function Submit() {
  const [form, setForm] = useState(EMPTY);
  const [links, setLinks] = useState([]);
  const [watchLinks, setWatchLinks] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submittedBy, setSubmittedBy] = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const searchTMDB = async (query) => {
    if (!query.trim() || query.length < 2) { setSearchResults([]); setShowResults(false); return; }
    setSearching(true);
    setSearchError('');
    setShowResults(false);
    try {
      const res = await fetch(`/api/omdb/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.error || 'Search failed');
        setSearchResults([]);
      } else if (data.Search) {
        setSearchResults(data.Search.slice(0, 6));
        setShowResults(true);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchError('Search unavailable');
      setSearchResults([]);
    }
    finally { setSearching(false); }
  };

  const fillFromTMDB = async (item) => {
    setShowResults(false);
    setSearchQuery('');
    try {
      const res = await fetch(`/api/omdb/search?id=${item.imdbID}`);
      const d = await res.json();
      setForm(f => ({ ...f,
        title: d.Title || item.Title || '',
        year: d.Year?.slice(0, 4) || '',
        poster_url: d.Poster !== 'N/A' ? d.Poster : '',
        rating: d.imdbRating !== 'N/A' ? d.imdbRating : '',
        overview: d.Plot !== 'N/A' ? d.Plot : '',
        genre: d.Genre !== 'N/A' ? d.Genre.split(',')[0].trim() : '',
        language: d.Language !== 'N/A' ? d.Language.split(',')[0].trim() : '',
        type: d.Type === 'series' ? 'Series' : d.Type === 'movie' ? 'Movie' : 'Movie',
      }));
    } catch {}
  };

  const addLink = () => setLinks(l => [...l, { label:'', info:'', url:'', color:'#c9a84c' }]);
  const setLink = (i, k, v) => setLinks(l => l.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const removeLink = i => setLinks(l => l.filter((_, idx) => idx !== i));
  const applyPlatform = (i, p) => setLinks(l => l.map((x, idx) => idx === i ? { ...x, label: p.name, color: p.color } : x));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.year?.trim()) errs.year = 'Year is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await addMovie({ ...form, links: links.filter(l => l.url), watch_links: watchLinks.filter(l=>l.url) });
      setSubmittedBy(form.uploaded_by.trim());
      setSuccess(true);
      setForm(EMPTY);
      setLinks([]);
      setWatchLinks([]);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-deep flex items-center justify-center">
      <CinematicBackground />
      <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
        className="relative z-10 text-center px-6 max-w-md">
        <motion.div animate={{ scale:[1,1.15,1] }} transition={{ repeat:Infinity, duration:2 }}>
          <CheckCircle2 size={56} className="mx-auto mb-4" style={{ color:'#22c55e' }} />
        </motion.div>
        <h2 className="font-cinzel text-2xl mb-3" style={{ fontFamily:'Cinzel,serif', color:'#22c55e' }}>Movie Submitted!</h2>
        <p className="text-sm mb-6" style={{ color:'#8a8778' }}>
          {submittedBy ? `Thank you ${submittedBy}!` : 'Thank you!'} Your movie is waiting for admin review.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
              style={{ background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.3)', color:'#c9a84c' }}>
              <Film size={14} /> Browse Agasobanuye
            </motion.div>
          </Link>
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={() => setSuccess(false)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#8a8778' }}>
            <Plus size={14} /> Add Another
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Add Agasobanuye"
        description="Submit a new Agasobanuye movie, series, or anime to Agasobanuye.rw"
        canonical="https://agasobanuye.rw/submit"
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/">
              <motion.div whileHover={{ x:-3 }} className="text-xs" style={{ color:'#6a6a5a' }}>
                <ArrowLeft size={13} />
              </motion.div>
            </Link>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)' }}>
              <Upload size={20} style={{ color:'#c9a84c' }} />
            </div>
            <div>
              <h1 className="font-cinzel font-bold text-lg" style={{
                fontFamily:'Cinzel,serif',
                background:'linear-gradient(135deg,#f5e4a8,#c9a84c)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              }}>Add Agasobanuye</h1>
              <p className="text-[10px]" style={{ color:'#6a6a5a' }}>Share a movie, series, or anime with the community</p>
            </div>
          </div>
          <div className="divider-gold w-16" />
        </motion.div>

        {/* Notice Banner */}
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.06 }}
          className="mb-5 p-4 rounded-xl relative overflow-hidden"
          style={{ background:'rgba(234,179,8,0.06)', border:'1px solid rgba(234,179,8,0.2)' }}>
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background:'linear-gradient(105deg,transparent 30%,rgba(234,179,8,0.06) 50%,transparent 70%)' }}
            animate={{ x:['-100%','200%'] }}
            transition={{ repeat:Infinity, duration:4, ease:'easeInOut', repeatDelay:3 }} />
          <div className="flex gap-3 items-start relative z-10">
            <span className="text-base flex-shrink-0 mt-0.5">⚠️</span>
            <div>
              <p className="text-[10px] font-semibold mb-1" style={{ color:'#fbbf24' }}>Dear Uploader — Please Read</p>
              <p className="text-[10px] leading-relaxed" style={{ color:'#8a8060' }}>
                Upload <span style={{ color:'#fbbf24' }}>valid working links only</span>.
                Fake or broken links will be <span style={{ color:'#f87171' }}>permanently rejected</span>.
                All submissions are <span style={{ color:'#fbbf24' }}>reviewed by admin</span> before appearing.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="space-y-5 p-5 rounded-2xl"
          style={{ background:'rgba(14,14,22,0.8)', border:'1px solid rgba(201,168,76,0.12)', backdropFilter:'blur(20px)' }}>

          {/* Uploader name */}
          <div className="p-4 rounded-xl" style={{ background:'rgba(201,168,76,0.05)', border:'1px solid rgba(201,168,76,0.12)' }}>
            <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color:'#c9a84c' }}>
              <User size={10} className="inline mr-1" />Your Name — so we can credit you
            </label>
            <input className="input-dark w-full px-3 py-2 rounded-lg text-sm"
              value={form.uploaded_by} onChange={e => set('uploaded_by', e.target.value)}
              placeholder="e.g. Keshav, Rahul, Anonymous..." />
            <p className="text-[9px] mt-1" style={{ color:'#3a3a2a' }}>
              Shows as "Uploaded by {form.uploaded_by || 'you'}" on the movie page
            </p>
          </div>

          {/* Title with TMDB Search */}
          <div className="relative">
            <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color:'#6a6a5a' }}>
              Search Movie / Series <span style={{ color:'#e05c3a' }}>*</span>
            </label>
            <div className="relative">
              <input
                className={`input-dark w-full px-3 py-2.5 rounded-lg text-sm pr-10 ${errors.title ? 'border-red-500/40' : ''}`}
                value={searchQuery || form.title}
                onChange={e => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  set('title', val);
                  setSearchError('');
                  searchTMDB(val);
                }}
                placeholder="Type name to search from TMDB..."
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor:'#c9a84c', borderTopColor:'transparent' }} />
                </div>
              )}
            </div>
            {errors.title && <p className="text-red-400/80 text-[10px] mt-1">{errors.title}</p>}
            {searchError && !showResults && (
              <p className="text-[10px] mt-1" style={{ color:'#e05c3a' }}>{searchError}</p>
            )}

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showResults && searchResults.length > 0 && (
                <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                  className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl overflow-hidden"
                  style={{ background:'rgba(14,14,22,0.98)', border:'1px solid rgba(201,168,76,0.2)', backdropFilter:'blur(20px)', boxShadow:'0 20px 60px rgba(0,0,0,0.6)' }}>
                  {searchResults.map((item, i) => {
                    const title = item.Title;
                    const year = item.Year;
                    const poster = item.Poster !== 'N/A' ? item.Poster : null;
                    return (
                      <motion.div key={item.imdbID}
                        whileHover={{ background:'rgba(201,168,76,0.08)' }}
                        onMouseDown={() => fillFromTMDB(item)}
                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors"
                        style={{ borderBottom: i < searchResults.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        {poster
                          ? <img src={poster} alt={title} className="w-8 h-12 object-cover rounded-md flex-shrink-0" />
                          : <div className="w-8 h-12 rounded-md flex-shrink-0" style={{ background:'#1a1a28' }} />
                        }
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate" style={{ color:'#e8e4d8' }}>{title}</div>
                          <div className="text-[10px] mt-0.5" style={{ color:'#4a4a3a' }}>
                            {year && <span>{year}</span>}
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[8px]"
                              style={{ background: item.Type === 'series' ? 'rgba(79,150,247,0.15)' : 'rgba(201,168,76,0.12)',
                                color: item.Type === 'series' ? '#7ec8f7' : '#c9a84c' }}>
                              {item.Type === 'series' ? 'Series' : 'Movie'}
                            </span>
                          </div>
                        </div>
                        {item.imdbRating && item.imdbRating !== 'N/A' && (
                          <span className="text-[10px] flex-shrink-0" style={{ color:'#c9a84c' }}>★ {item.imdbRating}</span>
                        )}
                      </motion.div>
                    );
                  })}
                  <div className="px-3 py-1 text-[8px] text-right" style={{ color:'#3a3a2a', background:'rgba(0,0,0,0.3)' }}>
                    Powered by OMDB
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Watch Online Links */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-medium tracking-[2px] uppercase" style={{ color:'#6a6a5a' }}>
                  <Monitor size={10} className="inline mr-1" />Watch Online
                </span>
                <span className="text-[9px] ml-1" style={{ color:'#3a3a2a' }}>optional</span>
              </div>
              <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                onClick={() => setWatchLinks(l=>[...l,{label:'',url:''}])}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium"
                style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.25)', color:'#60a5fa' }}>
                <Plus size={10} /> Add Link
              </motion.button>
            </div>
            <AnimatePresence>
              {watchLinks.map((link, i) => (
                <motion.div key={i} initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, height:0 }}
                  className="mb-2.5 p-3 rounded-xl" style={{ background:'rgba(59,130,246,0.04)', border:'1px solid rgba(59,130,246,0.12)' }}>
                  <div className="flex gap-2 items-center flex-wrap">
                    <input className="input-dark flex-1 min-w-[100px] px-2.5 py-1.5 rounded-lg text-xs"
                      value={link.label} onChange={e => setWatchLinks(l=>l.map((x,idx)=>idx===i?{...x,label:e.target.value}:x))}
                      placeholder="Label (e.g. Watch HD)" />
                    <input className="input-dark flex-[2] min-w-[130px] px-2.5 py-1.5 rounded-lg text-xs"
                      value={link.url} onChange={e => setWatchLinks(l=>l.map((x,idx)=>idx===i?{...x,url:e.target.value}:x))}
                      placeholder="Stream URL" />
                    <button onClick={() => setWatchLinks(l=>l.filter((_,idx)=>idx!==i))}
                      className="transition-colors" style={{ color:'#e05c3a44' }}
                      onMouseEnter={e=>e.currentTarget.style.color='#e05c3a'}
                      onMouseLeave={e=>e.currentTarget.style.color='#e05c3a44'}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {watchLinks.length === 0 && (
              <div className="text-center py-3 rounded-xl text-[10px]" style={{ color:'#3a3a2a', border:'1px dashed rgba(59,130,246,0.12)' }}>
                No watch links yet
              </div>
            )}
          </div>

          {/* MoMo Number */}
          <div className="p-4 rounded-xl" style={{ background:'rgba(34,197,94,0.05)', border:'1px solid rgba(34,197,94,0.12)' }}>
            <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color:'#22c55e' }}>
              <Smartphone size={10} className="inline mr-1" />MoMo Number — for admin to credit you
            </label>
            <input className="input-dark w-full px-3 py-2 rounded-lg text-sm"
              value={form.uploader_momo_number} onChange={e => set('uploader_momo_number', e.target.value)}
              placeholder="e.g. 0788123456" />
            <p className="text-[9px] mt-1" style={{ color:'#3a3a2a' }}>
              Optional — for rewards when admin approves your upload
            </p>
          </div>

          {/* Download Links */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-medium tracking-[2px] uppercase" style={{ color:'#6a6a5a' }}>
                  <Link2 size={10} className="inline mr-1" />Download Links
                </span>
                <span className="text-[9px] ml-1" style={{ color:'#3a3a2a' }}>optional</span>
              </div>
              <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={addLink}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium"
                style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)', color:'#c9a84c' }}>
                <Plus size={10} /> Add Link
              </motion.button>
            </div>

            <AnimatePresence>
              {links.map((link, i) => (
                <motion.div key={i} initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, height:0 }}
                  className="mb-2.5 p-3 rounded-xl space-y-2"
                  style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex flex-wrap gap-1.5">
                    {PLATFORMS.map(p => (
                      <button key={p.name} onClick={() => applyPlatform(i, p)}
                        className="text-[9px] px-2 py-0.5 rounded-md transition-all"
                        style={{
                          background: link.label === p.name ? p.color+'22' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${link.label === p.name ? p.color+'55' : 'rgba(255,255,255,0.07)'}`,
                          color: link.label === p.name ? p.color : '#6a6a5a',
                        }}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-[8px] tracking-widest uppercase mb-1" style={{ color:'#3a3a2a' }}>
                      Link Info — what is this? (1080p, Season 1, 4K, etc.)
                    </label>
                    <input className="input-dark w-full px-2.5 py-1.5 rounded-lg text-xs"
                      value={link.info || ''} onChange={e => setLink(i, 'info', e.target.value)}
                      placeholder="e.g. 1080p HD / Season 1 Ep 1-12 / 4K HDR / 480p" />
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    <input className="input-dark flex-1 min-w-[80px] px-2.5 py-1.5 rounded-lg text-xs"
                      value={link.label} onChange={e => setLink(i, 'label', e.target.value)}
                      placeholder="Platform" />
                    <input className="input-dark flex-[2] min-w-[120px] px-2.5 py-1.5 rounded-lg text-xs"
                      value={link.url} onChange={e => setLink(i, 'url', e.target.value)}
                      placeholder="URL" />
                    <input type="color" value={link.color || '#c9a84c'} onChange={e => setLink(i, 'color', e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0" />
                    <button onClick={() => removeLink(i)} style={{ color:'#e05c3a44' }}
                      onMouseEnter={e => e.currentTarget.style.color='#e05c3a'}
                      onMouseLeave={e => e.currentTarget.style.color='#e05c3a44'}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {links.length === 0 && (
              <div className="text-center py-3 rounded-xl text-[10px]" style={{ color:'#3a3a2a', border:'1px dashed rgba(255,255,255,0.06)' }}>
                No download links yet
              </div>
            )}
          </div>

          {errors.submit && <p className="text-red-400/80 text-[10px]">{errors.submit}</p>}

          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
            onClick={handleSubmit} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg,rgba(201,168,76,0.15),rgba(180,140,60,0.08))',
              border: '1px solid rgba(201,168,76,0.3)',
              color: '#c9a84c',
              boxShadow: '0 0 16px rgba(201,168,76,0.06)',
            }}>
            {loading
              ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor:'#c9a84c', borderTopColor:'transparent' }} />
              : <Upload size={15} />}
            {loading ? 'Adding...' : 'Add to Agasobanuye.rw'}
          </motion.button>
        </motion.div>

        <AdBanner size="728x90" className="mt-8" />
      </div>
    </div>
  );
}
