import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';
import { getMovies, getMovieById } from '../../lib/supabase';
import CinematicBackground from '../../components/CinematicBackground';
import { ArrowLeft, Star, Download, ExternalLink, Film, User, Tv2, Share2, Copy, Check, PlayCircle, Captions } from 'lucide-react';

const SITE_URL = 'https://agezweho.com';

const sharePlatforms = [
  { name: 'WhatsApp', color: '#25D366', url: (u, t) => `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}` },
  { name: 'Telegram', color: '#229ED9', url: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { name: 'Facebook', color: '#1877F2', url: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { name: 'X', color: '#f8fafc', url: (u, t) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}` },
];

export default function MovieDetail({ movie }) {
  const [copiedShare, setCopiedShare] = useState(false);

  if (!movie) return (
    <div className="min-h-screen flex items-center justify-center bg-deep">
    <CinematicBackground />
    <div className="text-center z-10">
    <h1 className="font-cinzel text-xl mb-4" style={{ fontFamily:'Cinzel,serif', color:'#c9a84c' }}>Not Found</h1>
    <Link href="/"><span className="btn-ghost px-4 py-2 rounded-lg text-sm inline-block cursor-pointer">← Back</span></Link>
    </div>
    </div>
  );

  const links = Array.isArray(movie.links) ? movie.links : [];
  const watchLinks = Array.isArray(movie.watch_links) ? movie.watch_links : [];
  const subtitleLinks = Array.isArray(movie.subtitle_links)
    ? movie.subtitle_links
    : Array.isArray(movie.subtitles)
      ? movie.subtitles
      : [];
  const pageUrl = `${SITE_URL}/movies/${movie.id}`;
  const primaryWatch = watchLinks[0];
  const primaryDownload = links[0];
  const primarySubtitle = subtitleLinks[0];
  const stars = movie.rating ? Math.round(parseFloat(movie.rating) / 2) : 0;
  const ratingValue = Number.parseFloat(movie.rating);
  const seoTitle = `${movie.title} ${movie.year || ''} - Watch, Download${subtitleLinks.length ? ' & Subtitles' : ''} | Agezweho Movies Rwanda`;
  const seoDescription = movie.overview
    || `Watch and download ${movie.title} on Agezweho Movies, Rwanda's home for Agasobanuye movies, series, anime and entertainment.`;
  const shareText = `${movie.title} on Agezweho Movies Rwanda`;
  const copyShare = () => {
    navigator.clipboard?.writeText(pageUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 1800);
  };

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': movie.type === 'Series' ? 'TVSeries' : 'Movie',
      name: movie.title,
      url: pageUrl,
      image: movie.poster_url || `${SITE_URL}/favicon.svg`,
      description: seoDescription,
      datePublished: movie.year || undefined,
      inLanguage: movie.language || 'rw',
      genre: movie.genre || undefined,
      countryOfOrigin: { '@type': 'Country', name: 'Rwanda' },
      provider: { '@type': 'Organization', name: 'Agezweho Movies', url: SITE_URL },
      aggregateRating: Number.isFinite(ratingValue)
        ? { '@type': 'AggregateRating', ratingValue, bestRating: 10, worstRating: 1, ratingCount: 1 }
        : undefined,
      potentialAction: [
        primaryWatch ? { '@type': 'WatchAction', target: primaryWatch.url } : null,
        primaryDownload ? { '@type': 'DownloadAction', target: primaryDownload.url } : null,
      ].filter(Boolean),
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'RWF',
        availability: 'https://schema.org/InStock',
        url: pageUrl,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: `${movie.title} - Watch on Agezweho Movies`,
      description: seoDescription,
      thumbnailUrl: movie.poster_url ? [movie.poster_url] : [`${SITE_URL}/favicon.svg`],
      uploadDate: movie.created_at || undefined,
      contentUrl: primaryWatch?.url || primaryDownload?.url || pageUrl,
      embedUrl: primaryWatch?.url || undefined,
      inLanguage: movie.language || 'rw',
      regionsAllowed: 'RW',
      publisher: { '@type': 'Organization', name: 'Agezweho Movies', url: SITE_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Agezweho Movies', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: movie.title, item: pageUrl },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-deep">
    <Head>
   <title>{movie.title} {movie.year || ''} — Watch {movie.language || 'Kinyarwanda'} {movie.type || 'Movie'} Online | Agezweho Movies</title>
<meta name="keywords" content={`${movie.title} download, ${movie.title} free download, ${movie.title} ${movie.year || ''} download, watch ${movie.title} online free, ${movie.title} ${movie.language || 'hindi'} download, ${movie.title} 1080p download, ${movie.title} 4k download, ${movie.title} 720p, ${movie.genre || ''} movies download free`} />
    <meta name="description" content={`${movie.overview || `Watch ${movie.title} online on Agezweho Movies — Rwanda's home for Agasobanuye entertainment.`}`} />
    <meta name="keywords" content={`${movie.title} download, ${movie.title} ${movie.year || ''}, ${movie.title} ${movie.language || 'hindi'}, ${movie.title} 1080p, ${movie.title} 4k, ${movie.genre || ''} movies download`} />
    <meta property="og:title" content={movie.title + ' — Agezweho Movies'} />
    <meta property="og:description" content={movie.overview || 'Watch on Agezweho Movies'} />
    {movie.poster_url && <meta property="og:image" content={movie.poster_url} />}
    <meta name="title" content={seoTitle} />
    <link rel="canonical" href={pageUrl} />
    <meta property="og:type" content="video.movie" />
    <meta property="og:url" content={pageUrl} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={`${movie.title} - Agezweho Movies Rwanda`} />
    <meta name="twitter:description" content={seoDescription} />
    {movie.poster_url && <meta name="twitter:image" content={movie.poster_url} />}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Head>

    <CinematicBackground />
    {movie.poster_url && (
      <div className="fixed inset-0 pointer-events-none z-0"
      style={{ backgroundImage:`url(${movie.poster_url})`, backgroundSize:'cover',
                          backgroundPosition:'center', filter:'blur(80px) saturate(0.2)', opacity:0.1 }} />
    )}

    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-20">
    <motion.div initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} className="mb-8">
    <Link href="/">
    <motion.div whileHover={{ x:-3 }} className="inline-flex items-center gap-1.5 text-xs transition-colors"
    style={{ color:'#6a6a5a' }}
    onMouseEnter={e=>e.currentTarget.style.color='#c9a84c'}
    onMouseLeave={e=>e.currentTarget.style.color='#6a6a5a'}>
    <ArrowLeft size={13} /> Back to Library
    </motion.div>
    </Link>
    </motion.div>

    <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
    {/* Poster */}
    <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
    className="flex-shrink-0 w-full md:w-52">
    <div className="rounded-2xl overflow-hidden"
    style={{ border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 20px 60px rgba(0,0,0,0.6)' }}>
    {movie.poster_url
      ? <img src={movie.poster_url} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
      : <div className="w-full aspect-[2/3] flex items-center justify-center" style={{ background:'#131320' }}>
      <Film size={40} style={{ color:'#6a6a5a' }} />
      </div>
    }
    </div>

    {movie.uploaded_by && (
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
      className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
      style={{ background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.15)' }}>
      <User size={12} style={{ color:'#c9a84c', flexShrink:0 }} />
      <div>
      <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color:'#4a4a3a' }}>Uploaded by</div>
      <div className="font-medium" style={{ color:'#e8c87a' }}>{movie.uploaded_by}</div>
      <div className="text-[9px] mt-0.5" style={{ color:'#4a4a3a' }}>Thanks for contributing! 🙌</div>
      </div>
      </motion.div>
    )}

    <div className="mt-3 space-y-1.5">
    {[['Type',movie.type],['Language',movie.language],['Year',movie.year],['Genre',movie.genre]]
      .filter(([,v])=>v).map(([k,v])=>(
        <div key={k} className="flex justify-between">
        <span className="text-[10px] uppercase tracking-wider" style={{ color:'#4a4a3a' }}>{k}</span>
        <span className="text-xs" style={{ color:'#b8b4a8' }}>{v}</span>
        </div>
      ))}
      </div>
      </motion.div>


      {/* Info */}
      <div className="flex-1 min-w-0">
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
      {movie.featured && <span className="inline-block mb-3 badge badge-gold">Featured</span>}
      <h1 className="font-cinzel font-semibold leading-tight mb-3"
      style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(1.5rem,4vw,2.4rem)',
        letterSpacing:'0.05em', background:'linear-gradient(135deg,#f5e4a8,#c9a84c)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          {movie.title}
          </h1>

          {movie.rating && (
            <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-0.5">
            {[...Array(5)].map((_,i)=>(
              <Star key={i} size={14} fill={i<stars?'#c9a84c':'none'}
              style={{ color:i<stars?'#c9a84c':'rgba(255,255,255,0.12)' }} />
            ))}
            </div>
            <span className="text-xl font-semibold" style={{ color:'#e8c87a', fontFamily:'Cinzel,serif' }}>{movie.rating}</span>
            <span className="text-xs" style={{ color:'#4a4a3a' }}>/10</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-5">
          {movie.type && <span className={`badge ${movie.type==='Anime'?'badge-purple':movie.type==='Series'?'badge-blue':'badge-muted'}`}>{movie.type}</span>}
          {movie.genre && <span className="badge badge-muted">{movie.genre}</span>}
          {movie.year && <span className="badge badge-muted">{movie.year}</span>}
          {watchLinks.length > 0 && <span className="badge badge-green">Play Ready</span>}
          {subtitleLinks.length > 0 && <span className="badge badge-blue">Subtitles</span>}
          </div>

          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.16 }}
            className="mb-6 p-4 rounded-2xl"
            style={{ background:'rgba(12,12,20,0.72)', border:'1px solid rgba(201,168,76,0.14)' }}>
            <div className="section-tag mb-3 flex items-center gap-2">
              <PlayCircle size={11} /> Quick Actions
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {primaryWatch ? (
                <motion.a href={primaryWatch.url} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold"
                  style={{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.3)', color:'#4ade80', textDecoration:'none' }}>
                  <PlayCircle size={15} /> Play Now
                </motion.a>
              ) : (
                <Link href="/requests" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#8a8778', textDecoration:'none' }}>
                  <PlayCircle size={15} /> Request Play
                </Link>
              )}
              {primaryDownload ? (
                <motion.a href={primaryDownload.url} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold"
                  style={{ background:'rgba(201,168,76,0.14)', border:'1px solid rgba(201,168,76,0.34)', color:'#e8c87a', textDecoration:'none' }}>
                  <Download size={15} /> Fast Download
                </motion.a>
              ) : (
                <Link href="/requests" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#8a8778', textDecoration:'none' }}>
                  <Download size={15} /> Request Link
                </Link>
              )}
              {primarySubtitle ? (
                <motion.a href={primarySubtitle.url} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold"
                  style={{ background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.3)', color:'#93c5fd', textDecoration:'none' }}>
                  <Captions size={15} /> Subtitles
                </motion.a>
              ) : (
                <Link href="/requests" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#8a8778', textDecoration:'none' }}>
                  <Captions size={15} /> Request Subs
                </Link>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18 }}
            className="mb-6">
            <div className="section-tag mb-3 flex items-center gap-2">
              <Share2 size={11} /> Share This Title
            </div>
            <div className="flex flex-wrap gap-2">
              {sharePlatforms.map(platform => (
                <motion.a key={platform.name}
                  href={platform.url(pageUrl, shareText)}
                  target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale:1.04, y:-1 }} whileTap={{ scale:0.96 }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold"
                  style={{ background:`${platform.color}12`, border:`1px solid ${platform.color}30`, color:platform.color, textDecoration:'none' }}>
                  {platform.name}
                </motion.a>
              ))}
              <motion.button
                onClick={copyShare}
                whileHover={{ scale:1.04, y:-1 }} whileTap={{ scale:0.96 }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold"
                style={{ background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.3)', color:'#e8c87a' }}>
                {copiedShare ? <Check size={13} /> : <Copy size={13} />}
                {copiedShare ? 'Copied' : 'Copy Link'}
              </motion.button>
            </div>
          </motion.div>

          {movie.overview && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }} className="mb-6">
            <div className="section-tag mb-2">Overview</div>
            <p className="text-sm leading-relaxed" style={{ color:'#a8a49a' }}>{movie.overview}</p>
            </motion.div>
          )}
          </motion.div>

      {/* Trailer */}
{movie.trailer_url && (
  <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18 }} className="mb-6">
    <div className="section-tag mb-3 flex items-center gap-2">
      <Film size={11} /> Official Trailer
    </div>
    <motion.a href={movie.trailer_url} target="_blank" rel="noopener noreferrer"
      whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
      className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-semibold"
      style={{ background:'rgba(255,0,0,0.1)', border:'1px solid rgba(255,0,0,0.3)', color:'#f87171', textDecoration:'none' }}>
      ▶ Watch Trailer
      <ExternalLink size={11} style={{ opacity:0.6 }} />
    </motion.a>
  </motion.div>
)}

        
        {/* ── AVAILABLE ON ── */}
{movie.platforms && movie.platforms.length > 0 && (
  <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }} className="mb-6">
    <div className="section-tag mb-3 flex items-center gap-2">
      <Tv2 size={11} /> Officially Available on
    </div>
    <div className="flex flex-wrap gap-2">
      {[
        { name:'Netflix',      color:'#E50914', url:'https://www.netflix.com/search?q=' },
        { name:'Amazon Prime Video', color:'#00A8E1', url:'https://www.primevideo.com/search/ref=atv_nb_sr?phrase=' },
        { name:'JioCinema',    color:'#6B4DE6', url:'https://www.jiocinema.com/search/' },
        { name:'JioHotstar',      color:'#1F80E0', url:'https://www.hotstar.com/in/search?q=' },
        { name:'YouTube',      color:'#FF0000', url:'https://www.youtube.com/results?search_query=' },
        { name:'SonyLIV',      color:'#0057A8', url:'https://www.sonyliv.com/search/' },
        { name:'ZEE5',         color:'#7B2FBE', url:'https://www.zee5.com/search?q=' },
        { name:'MX Player',    color:'#FF6C00', url:'https://www.mxplayer.in/search?query=' },
      ].filter(p => movie.platforms.includes(p.name)).map((p, i) => (
        <motion.a key={i}
          href={p.url + encodeURIComponent(movie.title)}
          target="_blank" rel="noopener noreferrer"
          whileHover={{ scale:1.05, y:-2 }} whileTap={{ scale:0.96 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
          style={{
            background: p.color+'20',
            border: `1px solid ${p.color}50`,
            color: p.color,
            textDecoration: 'none',
            boxShadow: `0 4px 20px ${p.color}15`,
          }}>
          Watch on {p.name}
          <ExternalLink size={10} style={{ opacity:0.6 }} />
        </motion.a>
      ))}
    </div>
  </motion.div>
)}


        {/* Watch Online */}
{watchLinks.length > 0 && (
  <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22 }} className="mb-6">
    <div className="section-tag mb-3 flex items-center gap-2">
      <Tv2 size={11} /> Watch Online
    </div>
    <div className="flex flex-wrap gap-3">
      {watchLinks.map((l, i) => (
      <motion.a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
          whileTap={{ scale:0.95 }}
          className="relative flex items-center gap-3 px-7 py-3.5 rounded-2xl text-sm font-bold overflow-hidden group"
          style={{ textDecoration:'none', cursor:'pointer', pointerEvents:'all', color:'#fff', minWidth:'200px', justifyContent:'center' }}
        >
          {/* Base dark bg */}
          <div className="absolute inset-0 rounded-2xl" style={{ background:'#0a0a1a' }} />

        

          {/* Inner dark overlay */}
          <div className="absolute inset-[1.5px] rounded-2xl" style={{ background:'linear-gradient(135deg,#0f0f2a,#0a0a1a)' }} />

     

          {/* Shimmer */}
          <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{ background:'linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.12) 50%,transparent 70%)' }}
            animate={{ x:['-100%','200%'] }}
            transition={{ repeat:Infinity, duration:2.2, ease:'easeInOut', repeatDelay:0.8 }}
          />

          {/* Play icon animated */}
          <motion.div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)' }}
            animate={{ scale:[1,1.2,1], boxShadow:['0 0 0px rgba(99,102,241,0)','0 0 16px rgba(99,102,241,0.8)','0 0 0px rgba(99,102,241,0)'] }}
            transition={{ repeat:Infinity, duration:1.8, ease:'easeInOut' }}
          >
            <span style={{ fontSize:'10px', marginLeft:'1px' }}>▶</span>
          </motion.div>

          <span className="relative z-10 tracking-wide">{l.label || 'Watch Online'}</span>
          <ExternalLink size={12} className="relative z-10" style={{ opacity:0.7 }} />
        </motion.a>
      ))}
    </div>
  </motion.div>
)}

        {/* Subtitles */}
{subtitleLinks.length > 0 && (
  <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="mb-6">
    <div className="section-tag mb-3 flex items-center gap-2">
      <Captions size={11} /> Subtitles
    </div>
    <div className="flex flex-wrap gap-3">
      {subtitleLinks.map((l, i) => (
        <motion.a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
          initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
          transition={{ delay:0.3 + i*0.05 }}
          whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
          style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.25)', color:'#93c5fd', textDecoration:'none' }}>
          <Captions size={13} />
          {l.label || l.language || 'Download Subtitles'}
          <ExternalLink size={10} style={{ opacity:0.6 }} />
        </motion.a>
      ))}
    </div>
  </motion.div>
)}

          {/* ── DOWNLOAD LINKS (manual) ── */}
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}>
          <div className="section-tag mb-3 flex items-center gap-2">
          <Download size={11} /> Download Links
          </div>

          {links.length === 0
            ? <p className="text-sm italic" style={{ color:'#4a4a3a' }}>No download links added yet.</p>
            : (
              <div className="flex flex-wrap gap-3">
              {links.map((l, i) => (
                <motion.a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                transition={{ delay:0.35 + i*0.06 }}
                whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }}
                className="flex flex-col gap-1 px-4 py-2.5 rounded-xl transition-all"
                style={{
                  background:`${l.color||'#c9a84c'}18`,
                  border:`1px solid ${l.color||'#c9a84c'}35`,
                  boxShadow:`0 4px 20px ${l.color||'#c9a84c'}10`,
                  textDecoration:'none',
                }}>
                <div className="flex items-center gap-2">
                <Download size={12} style={{ color:l.color||'#c9a84c' }} />
                <span className="text-sm font-medium" style={{ color:l.color||'#c9a84c' }}>
                {l.label||'Download'}
                </span>
                <ExternalLink size={10} style={{ color:l.color||'#c9a84c', opacity:0.5 }} />
                </div>
                {l.info && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded self-start"
                  style={{ background:`${l.color||'#c9a84c'}15`, color:l.color||'#c9a84c', opacity:0.8 }}>
                  {l.info}
                  </span>
                )}
                </motion.a>
              ))}
              </div>
            )
          }
          </motion.div>
       {/* How to Download */}
<motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }} className="mt-6">
  <motion.a
    href="https://drive.google.com/drive/folders/1s-llW3hYo3-4pK6U2XR3M5bJEakbHDjI"
    target="_blank" rel="noopener noreferrer"
    whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
    className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl text-xs font-semibold relative overflow-hidden"
    style={{ textDecoration:'none', color:'#fff', background:'transparent' }}
  >
    {/* Animated dashed border */}
    <motion.div className="absolute inset-0 rounded-2xl"
      style={{ border:'1.5px dashed rgba(220,38,38,0.6)', borderRadius:'16px' }}
      animate={{ rotate: 360 }}
      transition={{ repeat:Infinity, duration:8, ease:'linear' }}
    />
    {/* Dark bg */}
    <div className="absolute inset-0 rounded-2xl" style={{ background:'rgba(8,8,20,0.9)' }} />
    {/* Glow */}
    <motion.div className="absolute inset-0 rounded-2xl"
      style={{ background:'radial-gradient(circle at 50% 50%, rgba(220,38,38,0.15) 0%, transparent 70%)' }}
      animate={{ opacity:[0.4,1,0.4] }}
      transition={{ repeat:Infinity, duration:2.5, ease:'easeInOut' }}
    />
    {/* Light swipe */}
    <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
      style={{ background:'linear-gradient(105deg,transparent 25%,rgba(255,255,255,0.12) 50%,transparent 75%)' }}
      animate={{ x:['-150%','200%'] }}
      transition={{ repeat:Infinity, duration:2, ease:'easeInOut', repeatDelay:1.5 }}
    />
    {/* Question mark icon */}
    <div className="relative z-10 w-7 h-7 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
      style={{ background:'rgba(220,38,38,0.2)', border:'1px solid rgba(220,38,38,0.4)', color:'#f87171' }}>
      ?
    </div>
    <div className="relative z-10 text-left">
      <div className="text-[11px] font-bold" style={{ color:'#f87171' }}>How to Download</div>
      <div className="text-[9px] mt-0.5" style={{ color:'#6a6a8a' }}>Watch video tutorial →</div>
    </div>
  </motion.a>
</motion.div>
          </div>
          </div>
          </div>
          </div>
  );
}

export async function getStaticPaths() {
  try {
    const movies = await getMovies();
    return { paths: movies.map(m=>({params:{id:m.id}})), fallback:'blocking' };
  } catch { return { paths:[], fallback:'blocking' }; }
}

export async function getStaticProps({ params }) {
  try {
    const movie = await getMovieById(params.id);
    return { props:{movie}, revalidate:60 };
  } catch { return { notFound:true }; }
}
