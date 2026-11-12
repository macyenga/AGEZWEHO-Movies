import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import {
  ArrowLeft, HeartHandshake, Mail, Copy, Check, Share2,
  Loader2, Users, TrendingUp
} from 'lucide-react';

const GOLD = '#c9a84c';

const SHARE_PLATFORMS = [
  {
    name: 'WhatsApp',
    color: '#25D366',
    url: (u, t) => `https://wa.me/?text=${encodeURIComponent(t + ' ' + u)}`,
    icon: <svg viewBox="0 0 24 24" fill="#25D366" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.847L.057 23.887a.5.5 0 0 0 .611.611l6.04-1.471A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.031-1.369l-.361-.214-3.735.979.996-3.648-.235-.374A9.86 9.86 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1S21.9 6.534 21.9 12 17.466 21.9 12 21.9z"/></svg>,
  },
  {
    name: 'Telegram',
    color: '#229ED9',
    url: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
    icon: <svg viewBox="0 0 24 24" fill="#229ED9" width="20" height="20"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.978.942z"/></svg>,
  },
  {
    name: 'Facebook',
    color: '#1877F2',
    url: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
    icon: <svg viewBox="0 0 24 24" fill="#1877F2" width="20" height="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  },
  {
    name: 'Twitter / X',
    color: '#fffdfc',
    url: (u, t) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}`,
    icon: <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
  {
    name: 'Instagram',
    color: '#E1306C',
    url: () => `https://www.instagram.com/`,
    note: '(Copy link & share in story)',
    icon: <svg viewBox="0 0 24 24" width="20" height="20"><defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="25%" stopColor="#e6683c"/><stop offset="50%" stopColor="#dc2743"/><stop offset="75%" stopColor="#cc2366"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs><path fill="url(#ig)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
  },
  {
    name: 'Copy Link',
    color: '#c9a84c',
    url: null,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" width="20" height="20"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  },
];

const SITE_URL = 'https://agasobanuye.rw';
const SHARE_TEXT = '🎬 Agasobanuye.rw — Rwanda\'s home for Agasobanuye movies, series & anime! Free forever.';

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'macyenga@gmail.com';

const TIERS = [
  { amount: 500,   label: 'A coffee for the server' },
  { amount: 1000,  label: 'Funds an episode upload' },
  { amount: 2000,  label: 'A full day of hosting' },
  { amount: 5000,  label: 'Supports an uploader' },
];

export default function Support() {
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    fetch('/api/donations/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const amount = selected === 'custom' ? parseInt(customAmount, 10) : selected;

  const handleDonate = async () => {
    setError('');
    if (!amount || Number.isNaN(amount) || amount < 100) {
      setError('Minimum donation is 100 RWF.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, phone: phone || null }),
      });
      const data = await res.json().catch(() => ({}));

      if (data.payment_url) {
        window.location.assign(data.payment_url);
        return;
      }
      setError(data.error || data.message || 'Could not start the payment. Please try again.');
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  const handleShare = (p, text) => {
    if (p.url === null) {
      navigator.clipboard?.writeText(SITE_URL);
      alert('Link copied!');
      return;
    }
    window.open(p.url(SITE_URL, text), '_blank');
  };

  const copyEmail = () => {
    navigator.clipboard?.writeText(CONTACT_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const pct = stats && stats.monthlyGoal > 0
    ? Math.min(100, Math.round((stats.monthlyTotal / stats.monthlyGoal) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Support Agasobanuye.rw"
        description="Donate via MTN MoMo or Airtel Money to keep Agasobanuye.rw free — Rwanda's home for Agasobanuye movies, series & anime"
        canonical="https://agasobanuye.rw/support"
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 pt-20 pb-24">

        {/* Back */}
        <motion.div initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }} className="mb-6">
          <Link href="/">
            <motion.div whileHover={{ x:-3 }} className="inline-flex items-center gap-1.5 text-xs transition-colors"
              style={{ color:'#6a6a5a' }}
              onMouseEnter={e=>e.currentTarget.style.color=GOLD}
              onMouseLeave={e=>e.currentTarget.style.color='#6a6a5a'}>
              <ArrowLeft size={13} /> Back
            </motion.div>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-8">
          <motion.div
            animate={{ scale:[1,1.12,1] }}
            transition={{ repeat:Infinity, duration:2.5, ease:'easeInOut' }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)' }}>
            <HeartHandshake size={28} style={{ color:GOLD }} />
          </motion.div>
          <h1 className="font-cinzel font-bold text-2xl sm:text-3xl mb-3"
            style={{ fontFamily:'Cinzel,serif',
              background:'linear-gradient(135deg,#f5e4a8,#c9a84c)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Support Agasobanuye.rw
          </h1>
          <div className="divider-gold w-20 mx-auto mb-4" />
          <p className="text-sm leading-relaxed" style={{ color:'#8a8778' }}>
            Agasobanuye.rw is free because of kind viewers like you.
            <br />A small MoMo donation pays for hosting, uploads & bandwidth.
          </p>
        </motion.div>

        {/* Impact meter */}
        {stats && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="p-5 rounded-2xl mb-6"
            style={{ background:'rgba(201,168,76,0.04)', border:'1px solid rgba(201,168,76,0.16)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider" style={{ color:'#6a6a5a' }}>This month</span>
              <span className="flex items-center gap-1 text-[10px]" style={{ color:'#e8c87a' }}>
                <TrendingUp size={10} /> {pct}% of goal
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold" style={{ color:GOLD }}>{stats.monthlyTotal.toLocaleString()}</span>
              <span className="text-xs" style={{ color:'#6a6a5a' }}>/ {stats.monthlyGoal.toLocaleString()} RWF</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden mb-3" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(201,168,76,0.12)' }}>
              <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:1, ease:'easeOut' }}
                className="h-full rounded-full" style={{ background:'linear-gradient(90deg,#a07828,#e8c87a)' }} />
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[10px]" style={{ color:'#8a8778' }}>
                <Users size={10} style={{ color:GOLD }} /> {(stats.totalDonors || 0).toLocaleString()} supporters
              </span>
              {stats.topDonors && stats.topDonors.length > 0 && (
                <span className="text-[10px] truncate" style={{ color:'#6a6a5a' }}>
                  Top: {stats.topDonors[0].name} · {stats.topDonors[0].total.toLocaleString()} RWF
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Donate card */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
          className="p-6 rounded-2xl mb-6 relative overflow-hidden"
          style={{ background:'rgba(14,14,22,0.85)', border:'1px solid rgba(201,168,76,0.22)', backdropFilter:'blur(20px)' }}>
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background:'linear-gradient(105deg,transparent 30%,rgba(201,168,76,0.06) 50%,transparent 70%)' }}
            animate={{ x:['-100%','200%'] }}
            transition={{ repeat:Infinity, duration:4, ease:'easeInOut', repeatDelay:2 }}
          />

          <div className="relative z-10">
            <h2 className="font-cinzel font-semibold text-lg mb-1" style={{ fontFamily:'Cinzel,serif', color:'#e8c87a' }}>
              Pay with MTN MoMo or Airtel Money via RwandaPay
            </h2>
            <p className="text-[11px] mb-5" style={{ color:'#6a6a5a' }}>
              Choose an amount — you&apos;ll get a secure RwandaPay prompt on your phone. <a href="https://rwandapay.rw" target="_blank" rel="noreferrer" style={{ color:'#c9a84c' }}>rwandapay.rw</a>
            </p>

            {/* Amount tiers */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {TIERS.map(t => {
                const active = selected === t.amount;
                return (
                  <motion.button key={t.amount} whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                    onClick={() => { setSelected(t.amount); setCustomAmount(''); }}
                    className="rounded-xl px-3 py-3 text-left relative overflow-hidden"
                    style={active
                      ? { background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.45)' }
                      : { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <div className="text-sm font-bold" style={{ color: active ? '#e8c87a' : '#e8e6f0' }}>
                      {t.amount.toLocaleString()} <span style={{ color:'#6a6a5a', fontWeight:400, fontSize:10 }}>RWF</span>
                    </div>
                    <div className="text-[9px] mt-0.5" style={{ color: active ? '#c9a84c' : '#6a6a5a' }}>{t.label}</div>
                  </motion.button>
                );
              })}
            </div>

            {/* Custom amount */}
            <div className="flex items-center gap-2 mb-4">
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                onClick={() => setSelected('custom')}
                className="px-3 py-2.5 rounded-xl text-[11px] font-semibold flex-shrink-0"
                style={selected === 'custom'
                  ? { background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.45)', color:'#e8c87a' }
                  : { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', color:'#8a8778' }}>
                Custom
              </motion.button>
              <input
                type="number" min="100" step="100" placeholder="Your amount"
                value={customAmount}
                onChange={e => { setCustomAmount(e.target.value); setSelected('custom'); }}
                className="flex-1 rounded-xl px-3 py-2.5 text-xs w-full outline-none"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', color:'#e8e6f0' }}
              />
            </div>

            {/* Phone */}
            <div className="mb-5">
              <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color:'#6a6a5a' }}>
                Your MoMo / Airtel number <span style={{ color:'#4a4a3a' }}>(optional)</span>
              </label>
              <input
                type="tel" placeholder="07XXXXXXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-xs outline-none mb-4"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', color:'#e8e6f0' }}
              />
            </div>

            {error && (
              <div className="mb-3 px-3 py-2.5 rounded-xl text-[11px]" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171' }}>
                {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
              disabled={submitting}
              onClick={handleDonate}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold disabled:opacity-60"
              style={{ background:'linear-gradient(135deg, rgba(201,168,76,0.95), rgba(160,120,40,0.95))', color:'#0a0808', boxShadow:'0 12px 30px rgba(201,168,76,0.18)' }}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <HeartHandshake size={16} />}
              {submitting ? 'Starting…' : `Donate ${(amount || 0).toLocaleString()} RWF`}
            </motion.button>

            <p className="text-center text-[9px] mt-3" style={{ color:'#4a4a3a' }}>
              Pay with MTN MoMo or Airtel Money via RwandaPay — secure, instant. Murakoze cyane! · rwandapay.rw
            </p>
          </div>
        </motion.div>

        {/* Top supporters */}
        {stats && stats.topDonors && stats.topDonors.length > 0 && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="p-5 rounded-2xl mb-6"
            style={{ background:'rgba(14,14,22,0.8)', border:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(20px)' }}>
            <div className="section-tag mb-3">Top Supporters</div>
            <div className="space-y-2">
              {stats.topDonors.slice(0, 5).map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 text-[11px] font-bold text-center" style={{ color: i < 3 ? GOLD : '#4a4a3a' }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium truncate" style={{ color:'#e8e6f0' }}>{d.name}</div>
                  </div>
                  <span className="text-[10px] flex-shrink-0" style={{ color:'#e8c87a' }}>{d.total.toLocaleString()} RWF</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Share card */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="p-6 rounded-2xl mb-6"
          style={{ background:'rgba(14,14,22,0.8)', border:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(20px)' }}>

          <div className="section-tag mb-4 flex items-center gap-2">
            <Share2 size={11} /> Share with Friends
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SHARE_PLATFORMS.map((p, i) => (
              <motion.button key={i}
                initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: 0.35 + i*0.05 }}
                whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.96 }}
                onClick={() => handleShare(p, SHARE_TEXT)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-left relative overflow-hidden"
                style={{ background:`${p.color}12`, border:`1px solid ${p.color}30`, color:p.color, cursor:'pointer' }}>
                <span className="text-base flex-shrink-0">{p.icon}</span>
                <div className="relative z-10">
                  <div className="font-semibold">{p.name}</div>
                  {p.note && <div className="text-[9px] opacity-60 mt-0.5">{p.note}</div>}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
          className="p-6 rounded-2xl mb-6"
          style={{ background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.2)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background:'rgba(59,130,246,0.15)', border:'1px solid rgba(59,130,246,0.3)' }}>
              <Mail size={24} style={{ color:'#3b82f6' }} />
            </div>
            <div>
              <h2 className="font-cinzel font-semibold text-lg" style={{ fontFamily:'Cinzel,serif', color:'#3b82f6' }}>
                Contact Us
              </h2>
              <p className="text-xs" style={{ color:'#8a8060' }}>For partnerships & inquiries</p>
            </div>
          </div>
          <div className="p-4 rounded-xl mb-3 text-center" style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(59,130,246,0.2)' }}>
            <p className="text-sm" style={{ color:'#3b82f6' }}>{CONTACT_EMAIL}</p>
          </div>
          <motion.button
            whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={copyEmail}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
            style={{
              background: copiedEmail ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.1)',
              border: `1px solid ${copiedEmail ? 'rgba(34,197,94,0.4)' : 'rgba(59,130,246,0.3)'}`,
              color: copiedEmail ? '#22c55e' : '#3b82f6'
            }}>
            {copiedEmail ? <Check size={16} /> : <Copy size={16} />}
            {copiedEmail ? 'Copied!' : 'Copy Email'}
          </motion.button>
        </motion.div>

        {/* Thank you */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
          className="text-center mt-6">
          <p className="text-xs" style={{ color:'#4a4a3a' }}>
            Donated? Share it — every share brings another supporter. Murakoze ku mutima! — Agasobanuye.rw Team
          </p>
        </motion.div>
      </div>
    </div>
  );
}