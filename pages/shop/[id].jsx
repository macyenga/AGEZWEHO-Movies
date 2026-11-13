import { motion } from 'framer-motion';
import Link from 'next/link';
import SEOHead from '../../components/SEOHead';
import CinematicBackground from '../../components/CinematicBackground';
import { supabaseAdmin } from '../../lib/server/supabase-admin';
import { ArrowLeft, MessageCircle, ShoppingBag, Clock, Tag, Share2, AlertTriangle } from 'lucide-react';

function formatWhatsApp(phone) {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) return `250${cleaned.slice(1)}`;
  if (cleaned.startsWith('250')) return cleaned;
  return cleaned;
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function ShopDetail({ item }) {
  if (!item || item.status !== 'active') return (
    <div className="min-h-screen flex items-center justify-center bg-deep">
      <CinematicBackground />
      <div className="text-center z-10">
        <AlertTriangle size={40} className="mx-auto mb-3" style={{ color: '#fbbf24' }} />
        <h1 className="font-cinzel text-xl mb-4" style={{ color: '#fbbf24' }}>Not Available</h1>
        <Link href="/shop"><span className="btn-ghost px-4 py-2 rounded-lg text-sm inline-block cursor-pointer">← Back to Shop</span></Link>
      </div>
    </div>
  );

  const waLink = `https://wa.me/${formatWhatsApp(item.seller_whatsapp)}?text=${encodeURIComponent(`Hi, I'm interested in "${item.title}" listed on Agasobanuye.rw Shop.`)}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: item.title, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead title={item.title} description={item.description || item.title} canonical={`https://agasobanuye.rw/shop/${item.id}`} />
      <CinematicBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link href="/shop">
            <motion.div whileHover={{ x: -3 }} className="inline-flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: '#6a6a5a' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fbbf24'}
              onMouseLeave={e => e.currentTarget.style.color = '#6a6a5a'}>
              <ArrowLeft size={13} /> Back to Shop
            </motion.div>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(251,191,36,0.12)' }}>

          {/* Image */}
          {item.image_url ? (
            <div className="aspect-video overflow-hidden">
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover"
                onError={e => e.target.style.display = 'none'} />
            </div>
          ) : (
            <div className="aspect-video flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <ShoppingBag size={48} style={{ color: '#3a3a2a' }} />
            </div>
          )}

          <div className="p-6">
            {/* Meta */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-[9px] px-2 py-0.5 rounded" style={{ background: 'rgba(251,191,36,0.08)', color: '#d4a040' }}>
                {item.category}
              </span>
              <span className="text-[10px] flex items-center gap-1" style={{ color: '#4a4a3a' }}>
                <Clock size={10} /> {timeAgo(item.created_at)}
              </span>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="ml-auto flex items-center gap-1 text-[10px] transition-colors"
                style={{ color: '#4a4a3a' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fbbf24'}
                onMouseLeave={e => e.currentTarget.style.color = '#4a4a3a'}>
                <Share2 size={12} /> Share
              </motion.button>
            </div>

            {/* Title */}
            <h1 className="font-cinzel font-bold text-xl mb-2 leading-tight" style={{
              fontFamily: 'Cinzel,serif',
              background: 'linear-gradient(135deg,#fcd34d,#f59e0b)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>{item.title}</h1>

            {/* Price */}
            {item.price && (
              <div className="flex items-center gap-2 mb-4">
                <Tag size={14} style={{ color: '#fbbf24' }} />
                <span className="text-lg font-bold" style={{ color: '#fbbf24' }}>{item.price}</span>
              </div>
            )}

            {/* Seller */}
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                {item.seller_name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#e8e6f0' }}>{item.seller_name}</p>
                <p className="text-[9px]" style={{ color: '#4a4a3a' }}>Seller</p>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div className="text-sm leading-relaxed mb-6 whitespace-pre-wrap" style={{ color: '#a8a49a' }}>
                {item.description}
              </div>
            )}

            {/* WhatsApp CTA */}
            <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              href={waLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg,rgba(37,211,102,0.2),rgba(37,211,102,0.08))',
                border: '1px solid rgba(37,211,102,0.35)',
                color: '#25d366',
              }}>
              <MessageCircle size={20} />
              Contact via WhatsApp
            </motion.a>
            <p className="text-[10px] text-center mt-2" style={{ color: '#4a4a3a' }}>
              Deal directly with the seller. Agasobanuye.rw is not responsible for transactions.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const { data: item } = await supabaseAdmin
      .from('shop')
      .select('*')
      .eq('id', params.id)
      .single();
    if (!item) return { notFound: true };
    return { props: { item } };
  } catch {
    return { notFound: true };
  }
}
