import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabaseAdmin } from '../../lib/server/supabase-admin';
import SEOHead from '../../components/SEOHead';
import CinematicBackground from '../../components/CinematicBackground';
import { ArrowLeft, Heart, MessageCircle, Clock, Share2, Smartphone, Copy, Check, Crown } from 'lucide-react';

const USSD_CODE = process.env.NEXT_PUBLIC_USSD_CODE || '*182*8*1*156833#';

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function NewsDetail({ news }) {
  const [likes, setLikes] = useState(news?.likes || 0);
  const [showTip, setShowTip] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!news) return (
    <div className="min-h-screen flex items-center justify-center bg-deep">
      <CinematicBackground />
      <div className="text-center z-10">
        <h1 className="font-cinzel text-xl mb-4" style={{ color: '#38bdf8' }}>Not Found</h1>
        <Link href="/news"><span className="btn-ghost px-4 py-2 rounded-lg text-sm inline-block cursor-pointer">← Back</span></Link>
      </div>
    </div>
  );

  const handleLike = async () => {
    const res = await fetch(`/api/news/${news.id}/like`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setLikes(data.likes);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: news.title, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead title={news.title} description={news.content || news.title} canonical={`https://agezweho.com/news/${news.id}`} />
      <CinematicBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link href="/news">
            <motion.div whileHover={{ x: -3 }} className="inline-flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: '#6a6a5a' }}
              onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
              onMouseLeave={e => e.currentTarget.style.color = '#6a6a5a'}>
              <ArrowLeft size={13} /> Back to Amakuru
            </motion.div>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl"
          style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(56,189,248,0.15)' }}>

          {/* Meta */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs font-medium" style={{ color: '#38bdf8' }}>{news.author_name}</span>
            <span className="text-[9px]" style={{ color: '#4a4a3a' }}>·</span>
            <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(56,189,248,0.08)', color: '#38bdf8' }}>
              {news.category}
            </span>
            <span className="text-[10px] flex items-center gap-1 ml-auto" style={{ color: '#4a4a3a' }}>
              <Clock size={10} /> {timeAgo(news.created_at)}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-cinzel font-bold text-xl mb-4 leading-tight" style={{
            fontFamily: 'Cinzel,serif',
            background: 'linear-gradient(135deg,#7dd3fc,#38bdf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>{news.title}</h1>

          {/* Image */}
          {news.image_url && (
            <div className="rounded-xl overflow-hidden mb-4">
              <img src={news.image_url} alt={news.title} className="w-full object-cover max-h-96"
                onError={e => e.target.style.display = 'none'} />
            </div>
          )}

          {/* Content */}
          {news.content && (
            <div className="text-sm leading-relaxed mb-6 whitespace-pre-wrap" style={{ color: '#a8a49a' }}>
              {news.content}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: '#4a4a3a' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
              onMouseLeave={e => e.currentTarget.style.color = '#4a4a3a'}>
              <Heart size={15} /> <span>{likes}</span>
            </motion.button>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: '#4a4a3a' }}>
              <MessageCircle size={15} /> {news.comments_count || 0}
            </span>
            {news.publisher_momo && (
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setShowTip(true)}
                className="flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: '#4a4a3a' }}
                onMouseEnter={e => e.currentTarget.style.color = '#22c55e'}
                onMouseLeave={e => e.currentTarget.style.color = '#4a4a3a'}>
                <Smartphone size={14} /> Tip
              </motion.button>
            )}
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs ml-auto transition-colors"
              style={{ color: '#4a4a3a' }}
              onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
              onMouseLeave={e => e.currentTarget.style.color = '#4a4a3a'}>
              <Share2 size={14} /> Share
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Tip Modal */}
      <AnimatePresence>
        {showTip && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => { setShowTip(false); setCopied(false); }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: 'rgba(12,12,24,0.95)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Smartphone size={36} style={{ color: '#22c55e', margin: '0 auto 12px', display: 'block' }} />
              <h3 className="font-cinzel text-lg mb-1 text-center" style={{ fontFamily: 'Cinzel,serif', color: '#22c55e' }}>Tip Publisher</h3>
              <p className="text-xs text-center mb-4" style={{ color: '#8a8060' }}>
                Support <strong style={{ color: '#38bdf8' }}>{news.author_name}</strong> for their news post
              </p>
              <div className="p-4 rounded-xl mb-4 text-center"
                style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <p className="text-[10px] mb-1.5" style={{ color: '#8a8060' }}>Send tip via USSD:</p>
                <p className="text-2xl font-bold tracking-wider mb-3" style={{ color: '#22c55e', fontFamily: 'monospace' }}>{USSD_CODE}</p>
                <p className="text-[10px] leading-relaxed" style={{ color: '#6a6a5a' }}>
                  Admin will receive and manually send to {news.author_name}.
                </p>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => { navigator.clipboard?.writeText(USSD_CODE); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium mb-2"
                style={{
                  background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.08)',
                  border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(34,197,94,0.2)'}`,
                  color: copied ? '#22c55e' : '#22c55e',
                }}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy USSD Code'}
              </motion.button>
              <Link href="/subscribe">
                <div className="p-2 rounded-xl text-center cursor-pointer"
                  style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)' }}>
                  <p className="text-[10px]" style={{ color: '#b8a060' }}>
                    <Crown size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    Go Pro — support all publishers, no per-tip fees
                  </p>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const { data: news } = await supabaseAdmin
      .from('news')
      .select('*')
      .eq('id', params.id)
      .single();
    if (!news) return { notFound: true };
    return { props: { news } };
  } catch {
    return { notFound: true };
  }
}
