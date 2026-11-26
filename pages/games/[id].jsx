import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import SEOHead from '../../components/SEOHead';
import { supabaseAdmin } from '../../lib/server/supabase-admin';
import CinematicBackground from '../../components/CinematicBackground';
import SmartMediaPlayer from '../../components/SmartMediaPlayer';
import UnifiedPaymentFlow from '../../components/UnifiedPaymentFlow';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { resolvePremiumVideoSources, sanitizeGameForGate } from '../../lib/premium-content';
import { extractExternalDomain } from '../../lib/editorial';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Package,
  Star,
  ShieldCheck,
  Lock,
  Heart,
  Crown,
  X,
  PlayCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  LogIn,
} from 'lucide-react';

const UNLOCK_KEY = 'agezweho_unlocked_games';
const GAME_TX_KEY = 'agezweho_game_transactions';

export default function GameDetail({ game }) {
  const { user, loading: authLoading, isPro, isAdmin } = useAuth();
  const { isLight } = useTheme();
  const [unlocked, setUnlocked] = useState(false);
  const [accessSource, setAccessSource] = useState('');
  const [accessState, setAccessState] = useState('locked');
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [showDonate, setShowDonate] = useState(false);
  const [unlockedVideoUrl, setUnlockedVideoUrl] = useState(null);
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [pendingTxRef, setPendingTxRef] = useState('');
  const unlockedRef = useRef(false);

  const donateAmount = Math.max(50, Number(game?.price) || 500);

  const loadUnlockedMedia = useCallback(
    async ({ silent = false } = {}) => {
      if (!game?.id || !user) {
        unlockedRef.current = false;
        setUnlocked(false);
        setUnlockedVideoUrl(null);
        setDownloadLinks([]);
        setAccessState('unauthenticated');
        setCheckingAccess(false);
        return false;
      }

      if (!silent && !unlockedRef.current) {
        setCheckingAccess(true);
      }

      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (!token) {
          unlockedRef.current = false;
          setUnlocked(false);
          setAccessState('unauthenticated');
          return false;
        }

        const res = await fetch(`/api/games/${encodeURIComponent(game.id)}/links`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          unlockedRef.current = false;
          setUnlocked(false);
          setUnlockedVideoUrl(null);
          setDownloadLinks([]);
          setAccessState(data.accessState || 'payment_required');
          return false;
        }

        setUnlockedVideoUrl(data.video_url || null);
        setDownloadLinks(Array.isArray(data.links) ? data.links : []);
        setAccessSource(data.accessSource || 'approved');
        setAccessState('approved');
        unlockedRef.current = true;
        setUnlocked(true);

        try {
          const unlockedGames = JSON.parse(localStorage.getItem(UNLOCK_KEY) || '{}');
          localStorage.setItem(UNLOCK_KEY, JSON.stringify({ ...unlockedGames, [game.id]: true }));
        } catch {
          // ignore storage errors
        }
        return true;
      } catch {
        unlockedRef.current = false;
        setUnlocked(false);
        return false;
      } finally {
        setCheckingAccess(false);
      }
    },
    [game?.id, user]
  );

  const checkPaymentStatus = useCallback(
    async (txRefParam) => {
      const refToUse = txRefParam || pendingTxRef;
      if (!refToUse) return false;
      try {
        const res = await fetch(`/api/payments/status?tx_ref=${encodeURIComponent(refToUse)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return false;

        if (data.transaction?.status === 'completed' && data.transaction?.game_id === game?.id) {
          return loadUnlockedMedia({ silent: true });
        }
        if (data.transaction?.status === 'pending') {
          setAccessState('pending_approval');
        }
      } catch {
        // ignore network errors
      }
      return false;
    },
    [game?.id, loadUnlockedMedia, pendingTxRef]
  );

  useEffect(() => {
    if (authLoading || !game?.id) return;

    let active = true;

    if (!user) {
      unlockedRef.current = false;
      setUnlocked(false);
      setAccessState('unauthenticated');
      setCheckingAccess(false);
      return undefined;
    }

    loadUnlockedMedia({ silent: unlockedRef.current }).then((ok) => {
      if (!active || ok) return;
      try {
        const txRefs = JSON.parse(localStorage.getItem(GAME_TX_KEY) || '{}');
        if (txRefs[game.id]) {
          setPendingTxRef(txRefs[game.id]);
          fetch(`/api/payments/status?tx_ref=${encodeURIComponent(txRefs[game.id])}`)
            .then((r) => r.json().catch(() => ({})))
            .then((data) => {
              if (!active) return;
              if (data.transaction?.status === 'completed' && data.transaction?.game_id === game.id) {
                loadUnlockedMedia({ silent: true });
              } else if (data.transaction?.status === 'pending') {
                setAccessState('pending_approval');
              }
            })
            .catch(() => {});
        }
      } catch {
        // ignore storage errors
      }
    });

    return () => {
      active = false;
    };
  }, [authLoading, user?.id, isPro, isAdmin, game?.id, loadUnlockedMedia]);

  const videoSources = useMemo(() => {
    if (!unlocked || !game) return [];
    return resolvePremiumVideoSources({
      ...game,
      video_url: unlockedVideoUrl,
      links: downloadLinks,
    });
  }, [unlocked, game, unlockedVideoUrl, downloadLinks]);

  const playerMoviePayload = useMemo(() => {
    if (!unlocked || !game) return null;
    return {
      title: game.title,
      language: 'Kinyarwanda',
      watch_links: unlockedVideoUrl
        ? [{ label: 'Private Video Stream', url: unlockedVideoUrl, info: game.type || 'Video' }]
        : [],
      links: downloadLinks,
    };
  }, [unlocked, game, unlockedVideoUrl, downloadLinks]);

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep">
        <CinematicBackground />
        <div className="text-center z-10 px-4">
          <h1 className="font-cinzel text-xl mb-4" style={{ fontFamily: 'Cinzel,serif', color: 'var(--gold2)' }}>
            Private Content Not Found
          </h1>
          <Link href="/games" className="btn-ghost px-4 py-2 rounded-lg text-sm inline-block">
            ← Back to Private Vault
          </Link>
        </div>
      </div>
    );
  }

  const accessBadgeText =
    accessSource === 'admin'
      ? 'Admin Access'
      : accessSource === 'pro'
      ? 'Pro Member Unlocked'
      : accessSource === 'owner'
      ? 'Creator Access'
      : accessSource === 'purchased'
      ? 'Payment Verified'
      : 'Approved Access';

  const greenText = isLight ? '#15803d' : '#4ade80';
  const greenBg = isLight ? 'rgba(21,128,61,0.1)' : 'rgba(34,197,94,0.12)';
  const greenBorder = isLight ? 'rgba(21,128,61,0.3)' : 'rgba(34,197,94,0.3)';

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title={`${game.title} — Private Vault`}
        description="Private paid and approved video and exclusive content for authorized Agasobanuye.rw members."
        canonical={`https://agasobanuye.rw/games/${game.id}`}
        noIndex
      />
      <CinematicBackground />

      {!isLight && game.cover_url && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${game.cover_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(80px) saturate(0.2)',
            opacity: 0.08,
          }}
        />
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-20">
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/games"
            className="inline-flex items-center gap-1.5 text-xs transition-colors hover:underline"
            style={{ color: 'var(--text2)' }}
          >
            <ArrowLeft size={13} /> Back to Private Vault
          </Link>

          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-md"
            style={{
              background: unlocked ? greenBg : 'var(--accent-bg)',
              border: `1px solid ${unlocked ? greenBorder : 'var(--accent-border)'}`,
              color: unlocked ? greenText : 'var(--gold2)',
            }}
          >
            {unlocked ? <ShieldCheck size={12} /> : <Lock size={12} />}
            <span>{unlocked ? accessBadgeText : 'Private Paid & Approved Only'}</span>
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-10">
          {/* Left Column: Cover + Concise Specs */}
          <div className="flex-shrink-0 w-full md:w-56">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                border: '1px solid var(--border2)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {game.cover_url ? (
                <img
                  src={game.cover_url}
                  alt={game.title}
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[3/4] object-cover"
                />
              ) : (
                <div
                  className="w-full aspect-[3/4] flex items-center justify-center"
                  style={{ background: 'var(--accent-bg)' }}
                >
                  {game.has_video ? (
                    <PlayCircle size={56} style={{ color: 'var(--gold)', opacity: 0.7 }} />
                  ) : (
                    <Package size={56} style={{ color: 'var(--gold)', opacity: 0.55 }} />
                  )}
                </div>
              )}
            </div>

            <div
              className="mt-4 space-y-2.5 p-3.5 rounded-xl"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {[
                ['Format', game.type || (game.has_video ? 'Video' : 'Content')],
                ['Category', game.category],
                ['Version', game.version ? `v${game.version}` : null],
                ['Unlock Fee', `${donateAmount.toLocaleString()} RWF`],
                ['Attachments', `${game.has_video ? 'Video' : 'Files'}${game.download_count > 0 ? ` · ${game.download_count} links` : ''}`],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                      {k}
                    </span>
                    <span className="font-semibold tabular-nums text-right" style={{ color: 'var(--text)' }}>
                      {v}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Right Column: Info + Private Video Theater / Gate */}
          <div className="flex-1 min-w-0 space-y-6">
            <div>
              <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: 'var(--muted)' }}>
                {game.type || 'Private Release'} · {game.category}
              </div>
              <h1
                className="font-cinzel font-bold leading-tight mb-3"
                style={{
                  fontFamily: 'Cinzel,serif',
                  fontSize: 'clamp(1.5rem, 3.6vw, 2.35rem)',
                  color: 'var(--text)',
                }}
              >
                {game.title}
              </h1>

              {game.rating && (
                <div className="flex items-center gap-1.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < Math.round(parseFloat(game.rating) / 2) ? 'var(--gold)' : 'none'}
                      style={{
                        color: i < Math.round(parseFloat(game.rating) / 2) ? 'var(--gold)' : 'var(--border)',
                      }}
                    />
                  ))}
                  <span className="text-sm font-bold ml-1 tabular-nums" style={{ color: 'var(--gold2)' }}>
                    {game.rating}
                  </span>
                </div>
              )}

              {game.overview && (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
                  {game.overview}
                </p>
              )}
            </div>

            {checkingAccess || authLoading ? (
              <div
                className="rounded-2xl p-6 space-y-3"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="h-52 rounded-xl shimmer" />
                <div className="h-4 rounded shimmer w-1/3" />
              </div>
            ) : !unlocked ? (
              /* Private Locked Gate */
              <div
                data-testid="detail-locked-gate"
                className="p-6 sm:p-7 rounded-2xl text-center space-y-4"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border2)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto"
                  style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
                >
                  {accessState === 'pending_approval' ? (
                    <Clock size={22} style={{ color: 'var(--gold)' }} />
                  ) : (
                    <Lock size={22} style={{ color: 'var(--gold)' }} />
                  )}
                </div>

                <div>
                  <h2 className="font-cinzel text-lg font-bold mb-1.5" style={{ fontFamily: 'Cinzel,serif', color: 'var(--gold2)' }}>
                    {!user
                      ? 'Sign In Required'
                      : accessState === 'pending_approval'
                      ? 'Payment Pending Admin Approval'
                      : 'Private Content — Unlock to Watch'}
                  </h2>
                  <p className="text-xs max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text2)' }}>
                    {!user ? (
                      'This private video and its files are hidden until you sign in with a paid and approved account.'
                    ) : accessState === 'pending_approval' ? (
                      'Your payment submission is awaiting admin verification. Click refresh once approved to start streaming.'
                    ) : (
                      <>
                        Unlock this release for <strong className="tabular-nums" style={{ color: 'var(--text)' }}>{donateAmount.toLocaleString()} RWF</strong> via MoMo Pay <strong>156833</strong> or Paypack, or use an approved Pro Membership.
                      </>
                    )}
                  </p>
                </div>

                {!user ? (
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    <Link
                      href={`/auth/login?redirect=/games/${encodeURIComponent(game.id)}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap"
                      style={{
                        background: 'var(--gold)',
                        color: 'var(--accent-ink)',
                      }}
                    >
                      <LogIn size={14} /> Sign In to Unlock
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
                      <Crown size={14} style={{ color: 'var(--gold)' }} /> Go Pro
                    </Link>
                  </div>
                ) : accessState === 'pending_approval' ? (
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => (pendingTxRef ? checkPaymentStatus(pendingTxRef) : loadUnlockedMedia())}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap"
                      style={{
                        background: 'var(--gold)',
                        color: 'var(--accent-ink)',
                      }}
                    >
                      <RefreshCw size={13} /> Check Approval Status
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDonate(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium cursor-pointer whitespace-nowrap"
                      style={{
                        background: 'var(--bg-ghost)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                      }}
                    >
                      Submit Another Proof
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowDonate(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap"
                      style={{
                        background: 'var(--gold)',
                        color: 'var(--accent-ink)',
                      }}
                    >
                      <Heart size={14} /> Unlock Item ({donateAmount.toLocaleString()} RWF)
                    </button>
                    <Link
                      href="/subscribe"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap"
                      style={{
                        background: 'var(--bg-ghost)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                      }}
                    >
                      <Crown size={14} style={{ color: 'var(--gold)' }} /> Go Pro (All Private Videos)
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              /* Unlocked Private Video Theater & Downloads */
              <div data-testid="unlocked-private-content" className="space-y-6">
                {videoSources.length > 0 && playerMoviePayload && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gold2)' }}>
                        <PlayCircle size={14} />
                        <span>Private Video Player</span>
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                        Authorized Stream
                      </span>
                    </div>
                    <SmartMediaPlayer movie={playerMoviePayload} autoPlayMuted={false} />
                  </div>
                )}

                {unlockedVideoUrl && videoSources.length === 0 && (
                  <div
                    className="p-4 rounded-xl flex items-center justify-between gap-3 flex-wrap"
                    style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <PlayCircle size={18} style={{ color: 'var(--gold)' }} />
                      <div>
                        <div className="text-xs font-semibold" style={{ color: 'var(--gold2)' }}>
                          Private Video Stream
                        </div>
                        <div className="text-[11px]" style={{ color: 'var(--text2)' }}>
                          Hosted on {extractExternalDomain(unlockedVideoUrl) || 'external stream'}
                        </div>
                      </div>
                    </div>
                    <a
                      href={unlockedVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                      style={{
                        background: 'var(--gold)',
                        color: 'var(--accent-ink)',
                      }}
                    >
                      <span>Open Video Stream</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                {/* Unlocked Download / Resource Links */}
                <div
                  className="p-5 rounded-2xl space-y-3"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gold2)' }}>
                    <Download size={13} />
                    <span>Downloads &amp; Resources</span>
                  </div>

                  {downloadLinks.length === 0 ? (
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {videoSources.length > 0
                        ? 'This release streams directly in the Private Video Player above.'
                        : 'No download files attached yet.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {downloadLinks.map((l, i) => {
                        const domain = extractExternalDomain(l.url);
                        return (
                          <a
                            key={`${l.url}-${i}`}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors"
                            style={{
                              background: 'var(--accent-bg)',
                              border: '1px solid var(--accent-border)',
                              color: 'var(--gold2)',
                            }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Download size={14} className="shrink-0" style={{ color: 'var(--gold)' }} />
                              <div className="min-w-0">
                                <div className="truncate">{l.label || 'Download File'}</div>
                                {(l.info || domain) && (
                                  <div className="text-[10px] font-normal truncate" style={{ color: 'var(--text2)' }}>
                                    {[l.info, domain].filter(Boolean).join(' · ')}
                                  </div>
                                )}
                              </div>
                            </div>
                            <ExternalLink size={12} className="shrink-0 opacity-75" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Safety Notice */}
            <div
              className="p-4 rounded-xl flex items-start gap-2.5"
              style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border)' }}
            >
              <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text2)' }}>
                Member Notice: Only use verified files and official mirrors you trust. Scan external downloads before installing on your device.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Unlock Modal */}
      <AnimatePresence>
        {showDonate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowDonate(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 relative"
              style={{
                background: 'var(--bg-dropdown)',
                border: '1px solid var(--border2)',
                boxShadow: 'var(--shadow-card)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowDonate(false)}
                aria-label="Close unlock modal"
                className="absolute top-4 right-4 p-1.5 rounded-lg cursor-pointer"
                style={{ background: 'var(--bg-ghost)', color: 'var(--muted)' }}
              >
                <X size={16} />
              </button>

              <div className="text-center mb-4">
                <Lock size={28} style={{ color: 'var(--gold)', margin: '0 auto 8px' }} />
                <h3 className="font-cinzel text-lg font-bold" style={{ fontFamily: 'Cinzel,serif', color: 'var(--gold2)' }}>
                  Unlock Private Content
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
                  Pay <strong className="tabular-nums">{donateAmount.toLocaleString()} RWF</strong> to unlock &ldquo;{game.title}&rdquo;.
                </p>
              </div>

              <UnifiedPaymentFlow
                amount={donateAmount}
                minAmount={donateAmount}
                gameId={game.id}
                purpose={`Unlock ${game.title}`}
                compact
                resetTrigger={`${game.id}-${showDonate}`}
                onSubmitted={(data) => {
                  if (data?.tx_ref) {
                    try {
                      const txRefs = JSON.parse(localStorage.getItem(GAME_TX_KEY) || '{}');
                      localStorage.setItem(GAME_TX_KEY, JSON.stringify({ ...txRefs, [game.id]: data.tx_ref }));
                    } catch {
                      // ignore storage errors
                    }
                    setPendingTxRef(data.tx_ref);
                    setAccessState('pending_approval');
                  }
                }}
                onConfirmed={() => {
                  loadUnlockedMedia({ silent: true }).then((ok) => {
                    if (ok) setShowDonate(false);
                  });
                }}
                onDone={() => {
                  setShowDonate(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const { data: game } = await supabaseAdmin
      .from('games')
      .select('*')
      .eq('id', params.id)
      .eq('status', 'approved')
      .single();

    if (!game) return { notFound: true };

    return {
      props: {
        // Never leak private video_url or links into SSR HTML / __NEXT_DATA__
        game: sanitizeGameForGate(game, { includePrivateMedia: false }),
      },
    };
  } catch {
    return { notFound: true };
  }
}
