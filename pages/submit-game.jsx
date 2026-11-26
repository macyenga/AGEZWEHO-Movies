import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { isValidRwandaPhone, normalizeRwandaPhone } from '../lib/paypack-client';
import { UPLOADER_MONETIZATION_CONFIG } from '../lib/uploader-earnings';
import { PREMIUM_CONTENT_TYPES, sanitizeHttpUrl } from '../lib/premium-content';
import { classifyPreviewLink } from '../lib/media-preview';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import SmartMediaPlayer from '../components/SmartMediaPlayer';
import { CATEGORY_GROUPS } from '../lib/categories';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  CheckCircle2,
  Package,
  Lock,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
  Globe,
  DollarSign,
  Phone,
  FileText,
  Hash,
  Star,
  ChevronDown,
  Wallet,
  ArrowRight,
  Video,
  Eye,
} from 'lucide-react';

const PLATFORMS = [
  { name: 'Direct MP4', color: '#22c55e' },
  { name: 'Google Drive', color: '#4285F4' },
  { name: 'Mega.nz', color: '#D9272E' },
  { name: 'MediaFire', color: '#1B82E4' },
  { name: 'Dropbox', color: '#0061FF' },
  { name: 'OneDrive', color: '#0078D4' },
  { name: 'Custom Mirror', color: '#c9a84c' },
];

const EMPTY = {
  title: '',
  type: 'Video',
  category: '',
  version: '',
  rating: '',
  cover_url: '',
  video_url: '',
  overview: '',
  premium: true,
  price: 500,
  uploader_momo_number: '',
};

const validateUrl = (u) => !u || Boolean(sanitizeHttpUrl(u));
const validateMomo = (n) => !n || isValidRwandaPhone(normalizeRwandaPhone(n));

export default function SubmitGame() {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [catOpen, setCatOpen] = useState(false);
  const [previewVideoOpen, setPreviewVideoOpen] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '', submit: '' }));
    if (k === 'cover_url') setCoverFailed(false);
  };

  const addLink = () => setLinks((l) => [...l, { label: '', info: '', url: '' }]);
  const setLink = (i, k, v) => setLinks((l) => l.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
  const removeLink = (i) => setLinks((l) => l.filter((_, idx) => idx !== i));
  const applyPlatform = (i, p) =>
    setLinks((l) => l.map((x, idx) => (idx === i ? { ...x, label: p.name, color: p.color } : x)));

  const videoAnalysis = useMemo(() => {
    const trimmed = form.video_url.trim();
    if (!trimmed) return null;
    if (!sanitizeHttpUrl(trimmed)) return { valid: false, label: 'Must start with https:// or http://' };
    const classified = classifyPreviewLink(trimmed, 'Private Video Preview');
    return {
      valid: true,
      playable: classified.playable,
      label: classified.playable ? `${classified.label} detected (inline ready)` : 'External video URL verified',
    };
  }, [form.video_url]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.category) errs.category = 'Category is required';
    if (form.cover_url.trim() && !validateUrl(form.cover_url)) {
      errs.cover_url = 'Cover URL must start with http:// or https://';
    }
    if (form.video_url.trim() && !validateUrl(form.video_url)) {
      errs.video_url = 'Video URL must start with http:// or https://';
    }
    links.forEach((l, i) => {
      if (l.url && !validateUrl(l.url)) errs[`link_${i}`] = 'Must start with http:// or https://';
    });
    const validLinksCount = links.filter((l) => l.url?.trim() && validateUrl(l.url)).length;
    if (!form.video_url.trim() && validLinksCount === 0) {
      errs.submit = 'Please attach a Private Video URL or at least one valid Download/Resource Link.';
    }
    if (form.uploader_momo_number && !validateMomo(form.uploader_momo_number)) {
      errs.uploader_momo_number = 'Invalid MoMo format (e.g. 0788123456)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch('/api/games/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...form,
          uploader_momo_number: form.uploader_momo_number.trim()
            ? normalizeRwandaPhone(form.uploader_momo_number)
            : '',
          price: form.premium ? Math.max(50, parseInt(form.price, 10) || 50) : 0,
          links: links.filter((l) => l.url?.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSuccess(true);
      setForm(EMPTY);
      setLinks([]);
      setPreviewVideoOpen(false);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center">
        <CinematicBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center px-6 max-w-md"
        >
          <CheckCircle2 size={56} className="mx-auto mb-4" style={{ color: 'var(--gold2)' }} />
          <h2 className="font-cinzel text-2xl mb-3" style={{ fontFamily: 'Cinzel,serif', color: 'var(--gold2)' }}>
            Submitted for Review
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
            Your private video/content submission is pending admin review and will be available to paid-approved members once approved.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/games" className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm">
              <Package size={14} /> Open Private Vault
            </Link>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="btn-ghost flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm cursor-pointer"
            >
              <Plus size={14} /> Add Another
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Add Private Content & Video"
        description="Submit private videos, courses, games, or exclusive files to the Agasobanuye.rw paid-member vault."
        canonical="https://agasobanuye.rw/submit-game"
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        <div className="mb-6">
          <Link href="/games" className="inline-flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity" style={{ color: 'var(--muted)' }}>
            <ArrowLeft size={13} /> Back to Private Vault
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
            >
              <Video size={22} style={{ color: 'var(--gold2)' }} />
            </div>
            <div>
              <h1
                className="font-cinzel font-bold text-xl sm:text-2xl"
                style={{
                  fontFamily: 'Cinzel,serif',
                  color: 'var(--gold2)',
                }}
              >
                Add Private Content &amp; Video
              </h1>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Upload private video streams or files for paid &amp; approved members
              </p>
            </div>
          </div>
          <div className="divider-gold w-20" />
        </div>

        {/* Creator Revenue Share Banner */}
        <div
          className="mb-4 p-4 rounded-xl"
          style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)' }}
              >
                <Wallet size={16} style={{ color: 'var(--green)' }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                  Keep 70% of Every Paid Unlock
                </p>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text2)' }}>
                  Every time a member unlocks your release,{' '}
                  <strong className="tabular-nums" style={{ color: 'var(--green)' }}>70%</strong> goes to your Creator Wallet (withdraw from{' '}
                  {UPLOADER_MONETIZATION_CONFIG.minPayoutRwf.toLocaleString()} RWF).
                  {!user && (
                    <>
                      {' '}
                      <Link href="/auth/login?redirect=/submit-game" className="underline" style={{ color: 'var(--gold2)' }}>
                        Sign in
                      </Link>{' '}
                      first to link earnings to your account.
                    </>
                  )}
                </p>
              </div>
            </div>
            <Link
              href="/earnings"
              className="inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap flex-shrink-0 px-3 py-2 rounded-lg"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--green-border)', color: 'var(--green)' }}
            >
              Creator Wallet <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Moderation Guidelines */}
        <div
          className="mb-6 p-4 rounded-xl flex gap-3 items-start"
          style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
        >
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--warn)' }} />
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--gold2)' }}>
              Moderation &amp; Privacy Guidelines
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text2)' }}>
              Attach a working Private Video URL (.mp4, YouTube, Vimeo, Google Drive, Archive.org) or verified file mirror. All submissions stay hidden until reviewed and approved by an admin.
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6 rounded-2xl"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border2)',
            boxShadow: 'var(--shadow-card)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Title */}
          <div>
            <label htmlFor="sub-title" className="block text-[11px] font-medium mb-1.5 tracking-[1.5px] uppercase" style={{ color: 'var(--text2)' }}>
              Title <span style={{ color: 'var(--danger)' }}>*</span>
              <span className="ml-2 text-[10px] normal-case tracking-normal tabular-nums" style={{ color: 'var(--muted)' }}>
                {form.title.length}/100
              </span>
            </label>
            <input
              id="sub-title"
              className={`input-dark w-full px-3 py-2.5 rounded-lg text-sm ${errors.title ? 'border-red-500/40' : ''}`}
              value={form.title}
              onChange={(e) => {
                if (e.target.value.length <= 100) set('title', e.target.value);
              }}
              placeholder="e.g. VIP Backstage Dubbing Session, Exclusive Course..."
            />
            {errors.title && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.title}</p>}
          </div>

          {/* Content Type + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="sub-type" className="block text-[11px] font-medium mb-1.5 tracking-[1.5px] uppercase" style={{ color: 'var(--text2)' }}>
                Content Type
              </label>
              <select
                id="sub-type"
                className="input-dark w-full px-3 py-2.5 rounded-lg text-sm"
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
              >
                {PREMIUM_CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-[11px] font-medium mb-1.5 tracking-[1.5px] uppercase" style={{ color: 'var(--text2)' }}>
                Category <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <button
                type="button"
                onClick={() => setCatOpen((o) => !o)}
                className={`input-dark w-full px-3 py-2.5 rounded-lg text-sm text-left flex items-center justify-between cursor-pointer ${
                  errors.category ? 'border-red-500/40' : ''
                }`}
                style={{ color: form.category ? 'var(--text)' : 'var(--muted)' }}
              >
                <span className="truncate">{form.category || 'Select category...'}</span>
                <ChevronDown size={14} style={{ color: 'var(--muted)' }} />
              </button>
              {errors.category && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.category}</p>}
              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl overflow-hidden max-h-64 overflow-y-auto"
                    style={{
                      background: 'var(--bg-dropdown)',
                      border: '1px solid var(--border2)',
                      boxShadow: 'var(--shadow-card)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    {CATEGORY_GROUPS.map((group) => (
                      <div key={group.label}>
                        <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--muted)', background: 'var(--bg-ghost)' }}>
                          {group.label}
                        </div>
                        {group.items.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              set('category', item);
                              setCatOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--bg-ghost-hover)] cursor-pointer"
                            style={{ color: form.category === item ? 'var(--gold2)' : 'var(--text)' }}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Version + Rating */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="sub-version" className="block text-[11px] font-medium mb-1.5 tracking-[1.5px] uppercase" style={{ color: 'var(--text2)' }}>
                <Hash size={10} className="inline mr-1" />Quality / Version
              </label>
              <input
                id="sub-version"
                className="input-dark w-full px-3 py-2 rounded-lg text-sm"
                value={form.version}
                onChange={(e) => set('version', e.target.value)}
                placeholder="4K HD or 1.2.0"
              />
            </div>
            <div>
              <label htmlFor="sub-rating" className="block text-[11px] font-medium mb-1.5 tracking-[1.5px] uppercase" style={{ color: 'var(--text2)' }}>
                <Star size={10} className="inline mr-1" />Rating
              </label>
              <input
                id="sub-rating"
                className="input-dark w-full px-3 py-2 rounded-lg text-sm"
                value={form.rating}
                onChange={(e) => set('rating', e.target.value)}
                placeholder="4.9"
              />
            </div>
          </div>

          {/* Private Video Stream URL + Live Preview */}
          <div className="p-4 rounded-xl space-y-2.5" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label htmlFor="sub-video-url" className="text-[11px] font-semibold tracking-[1.5px] uppercase" style={{ color: 'var(--gold2)' }}>
                <Video size={12} className="inline mr-1.5" />Private Video URL
              </label>
              {videoAnalysis?.valid && (
                <button
                  type="button"
                  onClick={() => setPreviewVideoOpen((v) => !v)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--accent-border)',
                    color: 'var(--gold2)',
                  }}
                >
                  <Eye size={11} />
                  <span>{previewVideoOpen ? 'Hide Preview' : 'Test Video'}</span>
                </button>
              )}
            </div>

            <input
              id="sub-video-url"
              className={`input-dark w-full px-3 py-2 rounded-lg text-sm ${errors.video_url ? 'border-red-500/40' : ''}`}
              value={form.video_url}
              onChange={(e) => set('video_url', e.target.value)}
              placeholder="https://... (.mp4, YouTube, Vimeo, Google Drive, Archive.org)"
            />

            {errors.video_url ? (
              <p className="text-xs" style={{ color: 'var(--danger)' }}>{errors.video_url}</p>
            ) : videoAnalysis ? (
              <p className="text-[11px]" style={{ color: videoAnalysis.valid ? 'var(--green)' : 'var(--danger)' }}>
                {videoAnalysis.label}
              </p>
            ) : (
              <p className="text-[11px]" style={{ color: 'var(--text2)' }}>
                Only visible inside the Private Vault after payment and admin approval.
              </p>
            )}

            {previewVideoOpen && videoAnalysis?.valid && (
              <div className="pt-2">
                <SmartMediaPlayer
                  compact
                  autoPlayMuted={false}
                  movie={{
                    title: form.title || 'Private Video Preview',
                    watch_links: [{ label: 'Preview Stream', url: form.video_url.trim() }],
                  }}
                  onClose={() => setPreviewVideoOpen(false)}
                />
              </div>
            )}
          </div>

          {/* Cover Image */}
          <div>
            <label htmlFor="sub-cover-url" className="block text-[11px] font-medium mb-1.5 tracking-[1.5px] uppercase" style={{ color: 'var(--text2)' }}>
              <ImageIcon size={10} className="inline mr-1" />Cover Image URL
            </label>
            <input
              id="sub-cover-url"
              className={`input-dark w-full px-3 py-2 rounded-lg text-sm ${errors.cover_url ? 'border-red-500/40' : ''}`}
              value={form.cover_url}
              onChange={(e) => set('cover_url', e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
            {errors.cover_url && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.cover_url}</p>}
            {form.cover_url.trim() && validateUrl(form.cover_url) && (
              <div className="mt-2 flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border)' }}>
                {!coverFailed ? (
                  <img
                    src={form.cover_url}
                    alt="Cover preview"
                    className="w-12 h-16 object-cover rounded-md"
                    onError={() => setCoverFailed(true)}
                    style={{ border: '1px solid var(--accent-border)' }}
                  />
                ) : (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--danger)' }}>
                    <AlertTriangle size={12} /> Could not load preview image
                  </div>
                )}
                <div className="text-[11px]" style={{ color: 'var(--text2)' }}>
                  {form.type} · {form.category || 'No category'}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="sub-overview" className="block text-[11px] font-medium mb-1.5 tracking-[1.5px] uppercase" style={{ color: 'var(--text2)' }}>
              <FileText size={10} className="inline mr-1" />Description
              <span className="ml-2 text-[10px] normal-case tracking-normal tabular-nums" style={{ color: 'var(--muted)' }}>
                {form.overview.length}/500
              </span>
            </label>
            <textarea
              id="sub-overview"
              className="input-dark w-full px-3 py-2 rounded-lg text-sm resize-none"
              rows={3}
              value={form.overview}
              onChange={(e) => {
                if (e.target.value.length <= 500) set('overview', e.target.value);
              }}
              placeholder="Describe what paid members receive in this private release..."
            />
          </div>

          {/* Access Tier & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
              <Lock size={16} style={{ color: 'var(--gold2)' }} />
              <div className="flex-1">
                <div className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                  Paid Item Unlock
                </div>
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  Require per-item or Pro pass
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.premium}
                  onChange={(e) => set('premium', e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
                  style={{ background: form.premium ? 'var(--gold)' : 'var(--bg4)' }}
                />
              </label>
            </div>

            <div className="p-3.5 rounded-xl" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
              <label htmlFor="sub-price" className="block text-[11px] font-semibold mb-1 tracking-[1px] uppercase" style={{ color: 'var(--gold2)' }}>
                <DollarSign size={11} className="inline mr-0.5" />Unlock Price (RWF · min 50)
              </label>
              <input
                id="sub-price"
                type="number"
                min="50"
                step="50"
                disabled={!form.premium}
                className="input-dark w-full px-3 py-1.5 rounded-lg text-sm tabular-nums disabled:opacity-40"
                value={form.premium ? form.price : 0}
                onChange={(e) => set('price', parseInt(e.target.value, 10) || 50)}
                placeholder="500"
              />
            </div>
          </div>

          {/* MoMo Payout Number */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)' }}>
            <label htmlFor="sub-momo" className="block text-[11px] font-semibold mb-1.5 tracking-[1.5px] uppercase" style={{ color: 'var(--green)' }}>
              <Phone size={11} className="inline mr-1" />Your MoMo Number (Creator Payouts)
            </label>
            <input
              id="sub-momo"
              className={`input-dark w-full px-3 py-2 rounded-lg text-sm ${errors.uploader_momo_number ? 'border-red-500/40' : ''}`}
              value={form.uploader_momo_number}
              onChange={(e) => set('uploader_momo_number', e.target.value)}
              placeholder="e.g. 0788123456"
            />
            {errors.uploader_momo_number ? (
              <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.uploader_momo_number}</p>
            ) : (
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--text2)' }}>
                Used to pay your 70% share when members unlock your content.
              </p>
            )}
          </div>

          {/* Download / Resource Links */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: 'var(--text2)' }}>
                <Globe size={11} className="inline mr-1" />Download &amp; Mirror Links
              </span>
              <button
                type="button"
                onClick={addLink}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', color: 'var(--gold2)' }}
              >
                <Plus size={12} /> Add Link
              </button>
            </div>

            {links.map((link, i) => (
              <div
                key={i}
                className="mb-3 p-3 rounded-xl space-y-2.5"
                style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border)' }}
              >
                <div className="flex flex-wrap gap-1.5">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPlatform(i, p)}
                      className="text-[11px] px-2 py-0.5 rounded-md cursor-pointer"
                      style={{
                        background: link.label === p.name ? 'var(--accent-bg)' : 'var(--bg-ghost)',
                        border: `1px solid ${link.label === p.name ? 'var(--accent-border)' : 'var(--border)'}`,
                        color: link.label === p.name ? 'var(--gold2)' : 'var(--text2)',
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                <input
                  className="input-dark w-full px-2.5 py-1.5 rounded-lg text-xs"
                  value={link.info || ''}
                  onChange={(e) => setLink(i, 'info', e.target.value)}
                  placeholder="File details (e.g. 1080p MP4 · 1.2 GB)"
                />

                <div className="flex gap-2 items-center flex-wrap">
                  <input
                    className="input-dark flex-1 min-w-[90px] px-2.5 py-1.5 rounded-lg text-xs"
                    value={link.label}
                    onChange={(e) => setLink(i, 'label', e.target.value)}
                    placeholder="Label"
                  />
                  <input
                    className={`input-dark flex-[2] min-w-[130px] px-2.5 py-1.5 rounded-lg text-xs ${errors[`link_${i}`] ? 'border-red-500/40' : ''}`}
                    value={link.url}
                    onChange={(e) => {
                      setLink(i, 'url', e.target.value);
                      setErrors((er) => ({ ...er, [`link_${i}`]: '', submit: '' }));
                    }}
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    aria-label={`Remove link ${i + 1}`}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer"
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {errors[`link_${i}`] && <p className="text-[11px]" style={{ color: 'var(--danger)' }}>{errors[`link_${i}`]}</p>}
              </div>
            ))}

            {links.length === 0 && (
              <div
                className="text-center py-3 rounded-xl text-xs"
                style={{ color: 'var(--muted)', border: '1px dashed var(--border2)' }}
              >
                Optional if you attached a Private Video URL above
              </div>
            )}
          </div>

          {errors.submit && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg text-xs"
              style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)' }}
            >
              <AlertTriangle size={14} className="shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-opacity disabled:opacity-60"
            style={{
              background: 'var(--gold2)',
              color: 'var(--accent-ink)',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Submitting for Review...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Submit Private Content</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
