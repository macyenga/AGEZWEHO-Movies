import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import { ArrowLeft, ExternalLink, Tv2, X, Play, Globe } from 'lucide-react';
import AdBanner from '../components/ads/AdBanner';

const RWANDA_CHANNELS = [
  { label: 'B+ TV', lang: 'ENG', flag: '🇷🇼', url: 'https://tv.btnrwanda.com:3432/live/bpluslive.m3u8' },
  { label: 'BTN TV', lang: 'KIN', flag: '🇷🇼', url: 'https://tv.btnrwanda.com:3086/live/btnlive.m3u8' },
  { label: 'Isibo TV', lang: 'KIN', flag: '🇷🇼', url: 'https://5c46fa289c89f.streamlock.net/pub2live/myStream/playlist.m3u8' },
  { label: 'KC2', lang: 'ENG', flag: '🇷🇼', url: 'http://197.243.19.131:1935/kc2/kc2/chunklist.m3u8' },
  { label: 'Rwanda TV', lang: 'ENG', flag: '🇷🇼', url: 'http://197.243.19.131:1935/rtv25/rtv/chunklist.m3u8' },
  { label: 'TV10', lang: 'KIN', flag: '🇷🇼', url: 'https://5c46fa289c89f.streamlock.net/pub1live/mystream/playlist.m3u8' },
];

function PlayerModal({ channel, onClose }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!channel || !videoRef.current) return;

    let Hls;
    async function init() {
      Hls = (await import('hls.js')).default;
      if (!Hls) {
        setStatus('unsupported');
        return;
      }
      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(channel.url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play().catch(() => {});
          setStatus('playing');
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) setStatus('error');
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = channel.url;
        videoRef.current.play().catch(() => {});
        setStatus('playing');
      } else {
        setStatus('unsupported');
      }
    }
    init();

    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [channel]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{ background: 'rgba(14,14,22,0.95)', border: '1px solid rgba(201,168,76,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{channel.flag}</span>
            <span className="font-semibold text-sm" style={{ color: '#e8e0d0' }}>{channel.label}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wider"
              style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>{channel.lang}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#6a6a5a' }}
            onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
            onMouseLeave={e => e.currentTarget.style.color = '#6a6a5a'}>
            <X size={18} />
          </button>
        </div>

        {/* Player */}
        <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
          <video ref={videoRef} controls className="w-full h-full" style={{ display: status === 'error' || status === 'unsupported' ? 'none' : 'block' }} />

          {status === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <motion.div className="w-8 h-8 rounded-full" style={{ border: '2px solid rgba(201,168,76,0.2)', borderTopColor: '#c9a84c' }}
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} />
              <span className="text-xs" style={{ color: '#6a6a5a' }}>Loading stream...</span>
            </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <Tv2 size={32} style={{ color: '#6a6a5a' }} />
              <span className="text-sm font-medium" style={{ color: '#e8e0d0' }}>Stream unavailable</span>
              <span className="text-xs" style={{ color: '#6a6a5a' }}>The channel may be offline or restricted. Try another channel.</span>
              <a href={channel.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)' }}>
                <ExternalLink size={12} /> Open in External Player
              </a>
            </div>
          )}

          {status === 'unsupported' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <Globe size={32} style={{ color: '#6a6a5a' }} />
              <span className="text-sm font-medium" style={{ color: '#e8e0d0' }}>Browser not supported</span>
              <span className="text-xs" style={{ color: '#6a6a5a' }}>Your browser doesn't support HLS streaming. Use the external player link below.</span>
              <a href={channel.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)' }}>
                <ExternalLink size={12} /> Open in VLC / External Player
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Live() {
  const [activeChannel, setActiveChannel] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const openPlayer = useCallback((ch) => setActiveChannel(ch), []);
  const closePlayer = useCallback(() => setActiveChannel(null), []);

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Live TV — Agasobanuye Live &amp; Rwanda Channels"
        description="Watch live Sports and Rwanda TV channels on Agezweho Movies — B+ TV, BTN, Isibo TV, KC2, Rwanda TV, TV10. Agasobanuye live.com — also trending amakuru agezweho, igihe amakuru mashya, amazina updates."
        keywords="agasobanuye live.com, agasobanuye live, live TV Rwanda, Rwanda TV channels, B+ TV live, BTN TV, Isibo TV, agasobanuye live, igihe amakuru mashya, amazina agezweho, M23 Rwanda, watch live sports Rwanda, IPTV Rwanda"
        canonical="https://agezweho.com/live"
      />
      <CinematicBackground />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-24">

        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <Link href="/">
            <motion.div whileHover={{ x: -3 }} className="inline-flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: '#6a6a5a' }}
              onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
              onMouseLeave={e => e.currentTarget.style.color = '#6a6a5a'}>
              <ArrowLeft size={13} /> Back to Agasobanuye
            </motion.div>
          </Link>
        </motion.div>

{/* ───── Rwanda TV Section ───── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <motion.div className="w-2 h-2 rounded-full"
              style={{ background: '#c9a84c' }}
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }} />
            <span className="text-xs font-semibold tracking-[3px] uppercase" style={{ color: '#c9a84c' }}>Rwanda TV</span>
          </div>
          <h2 className="font-cinzel font-bold text-xl sm:text-2xl mb-2"
            style={{
              fontFamily: 'Cinzel,serif',
              background: 'linear-gradient(135deg,#c9a84c,#f0d060)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.3))'
            }}>
            Rwanda TV Channels
          </h2>
          <p className="text-xs" style={{ color: '#6a6a5a' }}>Click a channel to start watching</p>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6, duration: 1 }}
            className="divider-gold w-24 mx-auto mt-3" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          style={{}}>
          {RWANDA_CHANNELS.map((ch, i) => (
            <motion.button key={ch.label}
              onClick={() => openPlayer(ch)}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.06 }}
              whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              className="relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all text-left"
              style={{
                background: 'rgba(14,14,22,0.8)',
                border: '1px solid rgba(201,168,76,0.12)',
                backdropFilter: 'blur(20px)',
              }}>
              <span className="text-3xl">{ch.flag}</span>
              <span className="font-semibold text-sm text-center" style={{ color: '#e8e0d0' }}>{ch.label}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wider"
                style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c' }}>{ch.lang}</span>
              <div className="absolute bottom-2 right-2">
                <Play size={12} style={{ color: '#c9a84c', opacity: 0.5 }} />
              </div>
            </motion.button>
          ))}
        </motion.div>

        <p className="text-[10px] text-center mt-4" style={{ color: '#3a3a2a' }}>
          Streams are publicly available IPTV links. If a channel doesn&apos;t load, try another.
        </p>

        <AdBanner size="728x90" className="mt-8 mb-2" />
      </div>

      {/* Player modal */}
      {mounted && (
        <AnimatePresence>
          {activeChannel && (
            <PlayerModal key={activeChannel.label} channel={activeChannel} onClose={closePlayer} />
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
