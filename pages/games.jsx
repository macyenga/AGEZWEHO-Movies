import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import SearchBar from '../components/SearchBar';
import UnifiedPaymentFlow from '../components/UnifiedPaymentFlow';
import CATEGORIES, { CATEGORY_GROUPS } from '../lib/categories';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Package,
  Download,
  Star,
  Plus,
  ChevronDown,
  Crown,
  ArrowRight,
  AlertTriangle,
  Lock,
  PlayCircle,
  ShieldCheck,
  Clock,
  RefreshCw,
  LogIn,
  Video,
} from 'lucide-react';

const TYPE_FILTERS = [
  { id: 'all', label: 'All Formats' },
  { id: 'video', label: 'Videos & Courses' },
  { id: 'software', label: 'Games & Apps' },
];

function VaultCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="aspect-[3/4] shimmer" />
      <div className="p-3.5 space-y-2">
        <div className="h-3.5 rounded shimmer w-4/5" />
        <div className="h-2.5 rounded shimmer w-3/5" />
        <div className="h-2.5 rounded shimmer w-2/5" />
      </div>
    </div>
  );
}

export default function Games() {
  const { user, loading: authLoading, isPro, isAdmin } = useAuth();
  const { isLight } = useTheme();
  const [items, setItems] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [authorized, setAuthorized] = useState(false);
  const [accessState, setAccessState] = useState('loading');
  const [lockedCount, setLockedCount] = useState(0);
  const [stats, setStats] = useState({ totalCount: 0, videoCount: 0 });
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [brokenThumbs, setBrokenThumbs] = useState({});

  const loadVault = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token || '';
      const res = await fetch('/api/games', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || 'Failed to load vault');

      setAuthorized(Boolean(payload.authorized));
      setAccessState(payload.accessState || (payload.authorized ? 'approved' : 'unauthenticated'));
      setItems(Array.isArray(payload.games) ? payload.games : []);
      setPreviews(Array.isArray(payload.previews) ? payload.previews : []);
      setLockedCount(Number(payload.lockedCount) || 0);
      setStats({
        totalCount: Number(payload.stats?.totalCount) || 0,
        videoCount: Number(payload.stats?.videoCount) || 0,
      });
    } catch {
      setAuthorized(false);
      setAccessState(user ? 'payment_required' : 'unauthenticated');
      setItems([]);
      setPreviews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    loadVault();
  }, [authLoading, user?.id, isPro, isAdmin, loadVault]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.type?.toLowerCase().includes(q);
      const matchesCategory = !filter || item.category === filter;
      const isVideoItem =
        Boolean(item.has_video) ||
        ['Video', 'Series', 'Course'].includes(item.type);
      const matchesType =
        typeFilter === 'all'
          ? true
          : typeFilter === 'video'
          ? isVideoItem
          : !isVideoItem;
      return matchesQuery && matchesCategory && matchesType;
    });
  }, [items, query, filter, typeFilter]);

  const selectedLabel = filter ? CATEGORIES.find((c) => c === filter) || filter : 'All Categories';

  const accessLabel =
    accessState === 'admin'
      ? 'Admin Vault Access'
      : accessState === 'pro'
      ? 'Pro Member Access'
      : accessState === 'approved'
      ? 'Approved Member Access'
      : accessState === 'partial'
      ? 'Unlocked Items Access'
      : 'Members Only';

  const greenText = isLight ? '#15803d' : '#4ade80';
  const greenBg = isLight ? 'rgba(21,128,61,0.1)' : 'rgba(34,197,94,0.1)';
  const greenBorder = isLight ? 'rgba(21,128,61,0.3)' : 'rgba(34,197,94,0.28)';

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Private Premium Content"
        description="Private members-only video vault and exclusive releases for paid and approved Agasobanuye.rw members."
        canonical="https://agasobanuye.rw/games"
        noIndex
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-28 md:pt-24 pb-20">
        {/* Compact Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
            >
              {authorized ? (
                <ShieldCheck size={20} style={{ color: 'var(--gold)' }} />
              ) : (
                <Lock size={20} style={{ color: 'var(--gold)' }} />
              )}
            </div>
            <h1
              className="font-cinzel font-bold text-2xl sm:text-3xl"
              style={{ fontFamily: 'Cinzel,serif', color: 'var(--gold2)' }}
            >
              Private Premium Content
            </h1>
          </div>
          <p className="text-xs sm:text-sm max-w-xl mx-auto mb-2.5" style={{ color: 'var(--text2)' }}>
            Exclusive private videos, courses, and premium releases accessible only to paid and approved members.
          </p>
          <div
            className="inline-flex items-center gap-2 text-[11px] font-semibold px-3 py-1 rounded-md"
            style={{
              background: authorized ? greenBg : 'var(--accent-bg)',
              border: `1px solid ${authorized ? greenBorder : 'var(--accent-border)'}`,
              color: authorized ? greenText : 'var(--gold2)',
            }}
          >
            {authorized ? <ShieldCheck size={12} /> : <Lock size={12} />}
            <span>{accessLabel}</span>
            {stats.totalCount > 0 && (
              <span className="tabular-nums opacity-85">
                · {stats.totalCount} releases ({stats.videoCount} videos)
              </span>
            )}
          </div>
        </motion.div>

        {loading || authLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <VaultCardSkeleton key={i} />
            ))}
          </div>
        ) : !authorized ? (
          /* Private Paid-Approved Access Gate + Safe Visual Preview Thumbnails */
          <div className="space-y-8">
            <motion.div
              id="vault-unlock-gate"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              data-testid="premium-access-gate"
              className="max-w-4xl mx-auto rounded-2xl overflow-hidden"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border2)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left: Private Vault Overview */}
              <div
                className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between gap-6"
                style={{
                  background: 'var(--bg-card-subtle)',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--gold2)' }}>
                    <Video size={14} />
                    <span>Paid &amp; Approved Access Only</span>
                  </div>
                  <h2 className="font-cinzel font-bold text-xl mb-3" style={{ fontFamily: 'Cinzel,serif', color: 'var(--text)' }}>
                    {accessState === 'pending_approval'
                      ? 'Payment Pending Approval'
                      : user
                      ? 'Activate Your Private Vault Pass'
                      : 'Sign In to Unlock Private Videos'}
                  </h2>
                  <p className="text-xs leading-relaxed mb-5" style={{ color: 'var(--text2)' }}>
                    {accessState === 'pending_approval'
                      ? 'We received your payment submission. Once an admin verifies and approves it, all private videos and downloads unlock immediately.'
                      : 'This section is private. Only signed-in members with an approved MoMo Pay 156833, Paypack, or Pro subscription can stream private videos and access files.'}
                  </p>

                  <div className="space-y-2.5 text-xs" style={{ color: 'var(--text)' }}>
                    <div className="flex items-center gap-2.5">
                      <PlayCircle size={14} style={{ color: 'var(--gold)' }} />
                      <span>Private HD &amp; embed video theater playback</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Download size={14} style={{ color: 'var(--gold)' }} />
                      <span>Direct mirror downloads when included</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={14} style={{ color: 'var(--gold)' }} />
                      <span className="tabular-nums">
                        {stats.totalCount} approved private releases ({stats.videoCount} videos)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center justify-between gap-2 text-xs" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--muted)' }}>Creator or uploader?</span>
                  <Link
                    href="/submit-game"
                    className="inline-flex items-center gap-1.5 font-semibold hover:underline whitespace-nowrap"
                    style={{ color: 'var(--gold2)' }}
                  >
                    <Plus size={13} /> Add Content (Earn 70%)
                  </Link>
                </div>
              </div>

              {/* Right: Auth / Pending / Checkout Action */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
                {!user ? (
                  <div className="space-y-4 text-center sm:text-left">
                    <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
                      Step 1: Sign in to your account
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
                      Sign in first so we can verify your paid membership or admin approval, or start a MoMo Pay 156833 / Paypack pass linked directly to your account.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link
                        href="/auth/login?redirect=/games"
                        data-testid="vault-signin-cta"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap"
                        style={{
                          background: 'var(--gold)',
                          color: 'var(--accent-ink)',
                        }}
                      >
                        <LogIn size={14} /> Sign In to Access
                      </Link>
                      <Link
                        href="/subscribe"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap"
                        style={{
                          background: 'var(--bg-ghost)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                        }}
                      >
                        <Crown size={14} style={{ color: 'var(--gold)' }} /> View Pro Plans
                      </Link>
                    </div>
                  </div>
                ) : accessState === 'pending_approval' ? (
                  <div className="space-y-4">
                    <div
                      className="p-4 rounded-xl flex items-start gap-3"
                      style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
                    >
                      <Clock size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: 'var(--gold2)' }}>
                          Awaiting Admin Verification
                        </p>
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text2)' }}>
                          Signed in as <strong>{user.email}</strong>. Your payment is queued for approval. Click below after confirmation to enter the vault.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => loadVault({ silent: true })}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap"
                        style={{
                          background: 'var(--gold)',
                          color: 'var(--accent-ink)',
                        }}
                      >
                        <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                        <span>{refreshing ? 'Checking...' : 'Check Approval Status'}</span>
                      </button>
                      <Link
                        href="/subscribe"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap"
                        style={{
                          background: 'var(--bg-ghost)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                        }}
                      >
                        Submit Another Proof
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                          Unlock Private Video Vault — 2,000 RWF / month
                        </h3>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                          Signed in as {user.email}. Pay via MoMo Pay 156833 or Paypack for approval.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => loadVault({ silent: true })}
                        disabled={refreshing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer whitespace-nowrap"
                        style={{
                          background: 'var(--bg-ghost)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                        }}
                      >
                        <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                      </button>
                    </div>

                    <UnifiedPaymentFlow
                      amount={2000}
                      minAmount={2000}
                      purpose="Private VIP Vault Membership (1 Month)"
                      subscriptionPlan="pro"
                      months={1}
                      defaultEmail={user.email || ''}
                      compact
                      onSubmitted={() => loadVault({ silent: true })}
                      onConfirmed={() => loadVault({ silent: true })}
                    />
                  </div>
                )}
              </div>
            </div>
            </motion.div>

            {/* Locked Preview Thumbnails Showcase — Motivates Unlocking Without Exposing Private Media */}
            {previews.length > 0 && (
              <section
                aria-label="Private vault content previews"
                data-testid="vault-preview-thumbnails"
                className="space-y-4"
              >
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--gold2)' }}>
                      Inside the Private Vault
                    </div>
                    <h2 className="font-cinzel font-bold text-lg sm:text-xl mt-0.5" style={{ fontFamily: 'Cinzel,serif', color: 'var(--text)' }}>
                      Unlock Exclusive Videos, Mods &amp; Releases
                    </h2>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text2)' }}>
                    Preview thumbnails only — full video streams &amp; download mirrors unlock after approval.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {previews.map((preview) => {
                    const showImg = preview.cover_url && !brokenThumbs[preview.id];
                    return (
                      <a
                        key={preview.id}
                        href="#vault-unlock-gate"
                        data-testid={`vault-preview-card-${preview.id}`}
                        className="group rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5"
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          boxShadow: 'var(--shadow-card)',
                        }}
                      >
                        <div className="relative aspect-[3/4] overflow-hidden bg-black/50">
                          {showImg ? (
                            <img
                              src={preview.cover_url}
                              alt={preview.title}
                              referrerPolicy="no-referrer"
                              onError={() => setBrokenThumbs((prev) => ({ ...prev, [preview.id]: true }))}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-90"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center"
                              style={{
                                background: 'linear-gradient(145deg, rgba(201,168,76,0.18), rgba(14,14,24,0.92))',
                              }}
                            >
                              {preview.has_video ? (
                                <PlayCircle size={38} style={{ color: 'var(--gold2)' }} />
                              ) : (
                                <Package size={38} style={{ color: 'var(--gold2)' }} />
                              )}
                              <span className="text-[11px] font-semibold line-clamp-2" style={{ color: 'var(--text)' }}>
                                {preview.title}
                              </span>
                            </div>
                          )}

                          <div
                            className="absolute inset-0"
                            style={{
                              background: 'linear-gradient(to top, rgba(8,8,14,0.92) 0%, rgba(8,8,14,0.22) 55%, rgba(8,8,14,0.45) 100%)',
                            }}
                          />

                          {/* Top-left Lock Badge */}
                          <div className="absolute top-2.5 left-2.5">
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                              style={{
                                background: 'rgba(10,10,16,0.88)',
                                border: '1px solid rgba(201,168,76,0.45)',
                                color: '#f5d061',
                              }}
                            >
                              <Lock size={10} />
                              <span>Locked</span>
                            </span>
                          </div>

                          {/* Top-right Type Badge */}
                          <div className="absolute top-2.5 right-2.5">
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                              style={{
                                background: 'rgba(10,10,16,0.85)',
                                border: '1px solid rgba(255,255,255,0.16)',
                                color: '#f1ede2',
                              }}
                            >
                              {preview.has_video && <PlayCircle size={10} />}
                              <span>{preview.type || 'VIP'}</span>
                            </span>
                          </div>

                          {/* Bottom Unlock Callout */}
                          <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between gap-2 text-[11px] font-semibold text-amber-200">
                            <span className="inline-flex items-center gap-1">
                              <Crown size={12} />
                              <span>Unlock to Watch</span>
                            </span>
                            {preview.price > 0 && (
                              <span className="tabular-nums text-[10px] text-amber-300">
                                {Number(preview.price).toLocaleString()} RWF
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-3.5 flex-1 flex flex-col justify-between gap-1.5">
                          <div className="text-[11px] uppercase tracking-wider truncate font-medium" style={{ color: 'var(--muted)' }}>
                            {preview.category}
                            {preview.rating ? ` · ★ ${preview.rating}` : ''}
                          </div>
                          <h3 className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>
                            {preview.title}
                          </h3>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* Authorized Private Catalog View */
          <>
            {/* Top Search Bar */}
            <div className="max-w-lg mx-auto mb-4">
              <SearchBar
                value={query}
                onChange={setQuery}
                onClear={() => setQuery('')}
                placeholder="Search private videos, courses, or apps..."
              />
            </div>

            {/* Clean Single-Row Filter & Action Toolbar */}
            <div
              data-testid="vault-toolbar"
              className="mb-5 px-3.5 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                {TYPE_FILTERS.map((tf) => {
                  const active = typeFilter === tf.id;
                  return (
                    <button
                      key={tf.id}
                      type="button"
                      onClick={() => setTypeFilter(tf.id)}
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap shrink-0"
                      style={
                        active
                          ? {
                              background: 'var(--accent-bg)',
                              border: '1px solid var(--accent-border)',
                              color: 'var(--gold2)',
                            }
                          : {
                              background: 'var(--bg-ghost)',
                              border: '1px solid var(--border)',
                              color: 'var(--text2)',
                            }
                      }
                    >
                      {tf.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDropdown((v) => !v)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap"
                    style={
                      filter
                        ? {
                            background: 'var(--accent-bg)',
                            border: '1px solid var(--accent-border)',
                            color: 'var(--gold2)',
                          }
                        : {
                            background: 'var(--bg-ghost)',
                            border: '1px solid var(--border)',
                            color: 'var(--text2)',
                          }
                    }
                  >
                    <span>{selectedLabel}</span>
                    <ChevronDown size={13} />
                  </button>

                  {showDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                      <div
                        className="absolute top-full right-0 mt-2 z-50 w-64 max-h-80 overflow-y-auto rounded-xl p-2"
                        style={{
                          background: 'var(--bg-dropdown)',
                          border: '1px solid var(--border2)',
                          boxShadow: 'var(--shadow-card)',
                          backdropFilter: 'blur(16px)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setFilter('');
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                          style={{
                            color: !filter ? 'var(--gold2)' : 'var(--text2)',
                            background: !filter ? 'var(--accent-bg)' : 'transparent',
                          }}
                        >
                          All Categories
                        </button>
                        {CATEGORY_GROUPS.map((group) => (
                          <div key={group.label}>
                            <div className="text-[10px] uppercase tracking-wider px-3 pt-2 pb-1 font-semibold" style={{ color: 'var(--muted)' }}>
                              {group.label}
                            </div>
                            {group.items.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setFilter(c);
                                  setShowDropdown(false);
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                                style={{
                                  color: filter === c ? 'var(--gold2)' : 'var(--text)',
                                  background: filter === c ? 'var(--accent-bg)' : 'transparent',
                                }}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <Link
                  href="/submit-game"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0"
                  style={{
                    background: 'var(--gold)',
                    color: 'var(--accent-ink)',
                  }}
                >
                  <Plus size={13} /> Add Content
                </Link>
              </div>
            </div>

            {accessState === 'partial' && lockedCount > 0 && (
              <div
                className="mb-5 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3"
                style={{
                  background: 'var(--accent-bg)',
                  border: '1px solid var(--accent-border)',
                }}
              >
                <div className="text-xs" style={{ color: 'var(--text)' }}>
                  Showing your unlocked items.{' '}
                  <span className="tabular-nums font-semibold" style={{ color: 'var(--gold2)' }}>
                    {lockedCount} additional private releases
                  </span>{' '}
                  require Pro membership.
                </div>
                <Link
                  href="/subscribe"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                  style={{
                    background: 'var(--gold)',
                    color: 'var(--accent-ink)',
                  }}
                >
                  <Crown size={13} /> Unlock Full Vault <ArrowRight size={13} />
                </Link>
              </div>
            )}

            {/* Member Safety Notice */}
            <div
              className="mb-5 p-3.5 rounded-xl flex gap-3 items-center"
              style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border)' }}
            >
              <AlertTriangle size={15} className="shrink-0" style={{ color: 'var(--gold)' }} />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
                Private member releases are for authorized account holders only. Please respect creator attribution and verify external files before installing.
              </p>
            </div>

            {filtered.length === 0 ? (
              <div
                className="text-center py-16 rounded-2xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <p className="text-sm mb-3" style={{ color: 'var(--text2)' }}>
                  No private items match your current filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setFilter('');
                    setTypeFilter('all');
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                  style={{
                    background: 'var(--accent-bg)',
                    border: '1px solid var(--accent-border)',
                    color: 'var(--gold2)',
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {filtered.map((item) => (
                  <Link key={item.id} href={`/games/${item.id}`} className="group block">
                    <div
                      className="rounded-xl overflow-hidden h-full flex flex-col transition-transform duration-200 group-hover:-translate-y-0.5"
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-card)',
                      }}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-black/40">
                        {item.cover_url ? (
                          <img
                            src={item.cover_url}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--accent-bg)' }}>
                            {item.has_video ? (
                              <PlayCircle size={40} style={{ color: 'var(--gold)' }} />
                            ) : (
                              <Package size={40} style={{ color: 'var(--gold)' }} />
                            )}
                          </div>
                        )}
                        <div className="absolute inset-0 poster-fade" />

                        {/* Single top-right format indicator */}
                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                            style={{
                              background: 'rgba(10,10,16,0.86)',
                              border: '1px solid rgba(201,168,76,0.38)',
                              color: '#f5d061',
                            }}
                          >
                            {item.has_video && <PlayCircle size={10} />}
                            <span>{item.type || (item.has_video ? 'Video' : 'Content')}</span>
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between gap-2">
                        <div>
                          <div className="text-[11px] uppercase tracking-wider truncate mb-1 font-medium" style={{ color: 'var(--muted)' }}>
                            {item.category}
                            {item.version ? ` · v${item.version}` : ''}
                          </div>
                          <h3 className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>
                            {item.title}
                          </h3>
                        </div>

                        <div
                          className="flex items-center justify-between pt-2 text-xs"
                          style={{ borderTop: '1px solid var(--border-subtle)' }}
                        >
                          <span className="inline-flex items-center gap-1 font-semibold tabular-nums" style={{ color: greenText }}>
                            <ShieldCheck size={12} />
                            <span>{item.has_video ? 'Watch & Open' : 'Unlocked'}</span>
                          </span>
                          <div className="flex items-center gap-2.5 tabular-nums">
                            {item.download_count > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: 'var(--muted)' }}>
                                <Download size={11} />
                                {item.download_count}
                              </span>
                            )}
                            {item.rating && (
                              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold" style={{ color: 'var(--gold2)' }}>
                                <Star size={10} fill="currentColor" />
                                {item.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
