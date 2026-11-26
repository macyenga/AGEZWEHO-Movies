import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import {
  ArrowLeft,
  HeartHandshake,
  Mail,
  Copy,
  Check,
  Share2,
  Users,
  TrendingUp,
  Send,
  MessageCircle,
  Globe,
  ExternalLink,
} from 'lucide-react';
import SupportUs from '../components/SupportUs';
import { useLanguage } from '../contexts/LanguageContext';
import {
  ABROAD_TRANSFER_APPS,
  getSocialConfig,
  getDirectContactChannels,
} from '../lib/social-config';

const SITE_URL = 'https://agasobanuye.rw';
const SHARE_TEXT = "🎬 Agasobanuye.rw — Rwanda's home for Agasobanuye movies, Live TV & Multi-Language Subtitles!";

const SHARE_PLATFORMS = [
  {
    name: 'WhatsApp',
    color: '#22c55e',
    url: (u, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${u}`)}`,
  },
  {
    name: 'Telegram',
    color: '#38bdf8',
    url: (u, text) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(text)}`,
  },
  {
    name: 'Facebook',
    color: '#60a5fa',
    url: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
  },
  {
    name: 'Copy Link',
    color: 'var(--gold2)',
    url: null,
  },
];

export default function Support() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [copiedId, setCopiedId] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const socialCfg = getSocialConfig();
  const contactChannels = getDirectContactChannels();

  useEffect(() => {
    fetch('/api/donations/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const handleCopy = (value, id) => {
    navigator.clipboard?.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleShare = (p, text) => {
    if (p.url === null) {
      navigator.clipboard?.writeText(SITE_URL);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      return;
    }
    window.open(p.url(SITE_URL, text), '_blank', 'noopener,noreferrer');
  };

  const pct =
    stats && stats.monthlyGoal > 0
      ? Math.min(100, Math.round((stats.monthlyTotal / stats.monthlyGoal) * 100))
      : 0;

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Support Agasobanuye.rw — Rwanda & Abroad"
        description="Support Agasobanuye.rw from Rwanda (MTN MoMo / Airtel / Paypack) or abroad (Remitly, WorldRemit, Sendwave) and talk directly with us on Telegram +250789690247."
        keywords="support Agasobanuye, donate Rwanda movies, diaspora Rwanda support, Telegram +250789690247, MoMo Pay 156833"
        canonical="https://agasobanuye.rw/support"
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-28 md:pt-24 pb-24 space-y-6">
        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
            style={{ color: 'var(--text2)' }}
          >
            <ArrowLeft size={13} /> {t.pages.support.back}
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
          >
            <HeartHandshake size={26} style={{ color: 'var(--gold2)' }} />
          </div>
          <h1
            className="font-cinzel font-bold text-2xl sm:text-3xl mb-3"
            style={{ fontFamily: 'Cinzel,serif', color: 'var(--gold2)' }}
          >
            {t.pages.support.heading}
          </h1>
          <div className="divider-gold w-20 mx-auto mb-4" />
          <p className="text-sm leading-relaxed max-w-lg mx-auto" style={{ color: 'var(--text2)' }}>
            Agasobanuye.rw stays fast and accessible in Rwanda and across the diaspora because of generous viewers like you.
          </p>
        </motion.div>

        {/* Impact meter */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--accent-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--muted)' }}>
                This month
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold tabular-nums" style={{ color: 'var(--gold2)' }}>
                <TrendingUp size={11} /> {pct}% of goal
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-3 tabular-nums">
              <span className="text-2xl font-bold" style={{ color: 'var(--gold2)' }}>
                {stats.monthlyTotal.toLocaleString()}
              </span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                / {stats.monthlyGoal.toLocaleString()} RWF
              </span>
            </div>
            <div
              className="h-2.5 rounded-full overflow-hidden mb-3"
              style={{ background: 'var(--bg-ghost)', border: '1px solid var(--border)' }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--gold), var(--gold2))' }}
              />
            </div>
            <div className="flex items-center gap-4 text-[11px] tabular-nums" style={{ color: 'var(--text2)' }}>
              <span className="flex items-center gap-1.5">
                <Users size={11} style={{ color: 'var(--gold)' }} /> {(stats.totalDonors || 0).toLocaleString()} supporters
              </span>
              {stats.topDonors && stats.topDonors.length > 0 && (
                <span className="truncate" style={{ color: 'var(--muted)' }}>
                  Top: {stats.topDonors[0].name} · {stats.topDonors[0].total.toLocaleString()} RWF
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Unified Support Form (includes Local MoMo 156833, Paypack & Abroad/Global tab) */}
        <SupportUs variant="full" defaultAmount={1000} merchantName="Iradukunda Didier" />

        {/* Dedicated Diaspora / Abroad & Talk Directly Card */}
        <section
          aria-label="Abroad support and direct communication"
          data-testid="abroad-direct-contact-card"
          className="p-5 sm:p-6 rounded-2xl space-y-4"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border2)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-border)' }}
            >
              <Globe size={18} style={{ color: 'var(--blue)' }} />
            </div>
            <div>
              <h2 className="font-cinzel font-bold text-base sm:text-lg" style={{ fontFamily: 'Cinzel,serif', color: 'var(--text)' }}>
                Abroad Supporters &amp; Direct Chat
              </h2>
              <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--text2)' }}>
                Living in USA, Europe, UK, Canada, or across Africa? Send via{' '}
                <strong style={{ color: 'var(--text)' }}>{ABROAD_TRANSFER_APPS.join(', ')}</strong> to MTN MoMo Rwanda{' '}
                <strong className="tabular-nums" style={{ color: 'var(--gold2)' }}>
                  {socialCfg.telegramPhone}
                </strong>{' '}
                (Iradukunda Didier), or talk directly with us on Telegram before/after sending.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contactChannels.map((ch) => (
              <div
                key={ch.id}
                className="p-3.5 rounded-xl flex flex-col justify-between gap-2.5"
                style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border)' }}
              >
                <div>
                  <div className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
                    {ch.id.includes('telegram') ? (
                      <Send size={13} style={{ color: 'var(--blue)' }} />
                    ) : ch.id.includes('whatsapp') ? (
                      <MessageCircle size={13} style={{ color: 'var(--green)' }} />
                    ) : (
                      <Mail size={13} style={{ color: 'var(--gold2)' }} />
                    )}
                    <span>{ch.name}</span>
                  </div>
                  <div className="text-xs font-mono font-bold mt-1 tabular-nums" style={{ color: 'var(--gold2)' }}>
                    {ch.handle}
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                    {ch.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={ch.href}
                    target={ch.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={ch.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    data-testid={`support-channel-${ch.id}`}
                    className="btn-primary flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                  >
                    <span>Talk Now</span>
                    <ExternalLink size={11} />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(ch.copyValue, ch.id)}
                    className="btn-ghost px-2.5 py-2 rounded-lg text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                    aria-label={`Copy ${ch.name}`}
                  >
                    {copiedId === ch.id ? <Check size={12} style={{ color: 'var(--green)' }} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top supporters */}
        {stats && stats.topDonors && stats.topDonors.length > 0 && (
          <div
            className="p-5 rounded-2xl"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="section-tag mb-3">Top Supporters</div>
            <div className="space-y-2">
              {stats.topDonors.slice(0, 5).map((d, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="w-6 font-bold text-center tabular-nums" style={{ color: i < 3 ? 'var(--gold2)' : 'var(--muted)' }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0 font-medium truncate" style={{ color: 'var(--text)' }}>
                    {d.name}
                  </div>
                  <span className="tabular-nums font-semibold shrink-0" style={{ color: 'var(--gold2)' }}>
                    {d.total.toLocaleString()} RWF
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share card */}
        <div
          className="p-5 rounded-2xl"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="section-tag mb-3 flex items-center gap-2">
            <Share2 size={12} /> Share Agasobanuye.rw
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {SHARE_PLATFORMS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleShare(p, SHARE_TEXT)}
                className="btn-ghost px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer text-center"
              >
                {p.url === null && copiedLink ? 'Copied!' : p.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}