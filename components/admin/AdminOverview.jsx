import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Film, CalendarClock, Gamepad2, Heart, Newspaper, ShoppingBag,
  Wallet, Crown, Mail, Users, ArrowRight, CheckCircle2, Plus, BarChart3,
  Star, ExternalLink, DollarSign, AlertTriangle, Tv2,
  Monitor, LayoutGrid, Clock, Subtitles, ShieldCheck, Globe,
} from 'lucide-react';
import { buildModerationQueue } from '../../lib/admin-helpers';
import { calculateMovieViewBonus } from '../../lib/uploader-earnings';
import { normalizeSubtitles } from '../../lib/media-preview';
import {
  resolvePreviewSourcesWithTrailerFallback,
  evaluateAdsenseReadiness,
  extractExternalDomain,
} from '../../lib/editorial';
import SmartMediaPlayer from '../SmartMediaPlayer';

const GOLD = 'var(--gold)';
const GOLD_LIGHT = 'var(--gold2)';

const PREVIEW_FILTERS = [
  { id: 'pending', label: 'Pending Review' },
  { id: 'top', label: 'Top Viewed' },
  { id: 'featured', label: 'Featured Stage' },
  { id: 'payouts', label: 'Creator Payouts' },
];

export default function AdminOverview({
  summary,
  data,
  registeredUsersCount = 0,
  onNavigate,
  onQuickCreate,
}) {
  const queue = buildModerationQueue(summary);
  const [previewFilter, setPreviewFilter] = useState('pending');
  const [previewLayout, setPreviewLayout] = useState('autoplay'); // 'autoplay' | 'card'
  const [selectedKey, setSelectedKey] = useState('');

  const allMovies = data?.allMovies || [];
  const pendingMovies = data?.pendingMovies || [];
  const allGames = data?.allGames || [];
  const payouts = data?.payouts || [];

  const previewItems = useMemo(() => {
    if (previewFilter === 'pending') {
      const movieQueue = pendingMovies.map((m) => ({
        key: `movie:${m.id}`,
        kind: 'movie',
        id: m.id,
        title: m.title,
        subtitle: `${m.type || 'Movie'} · ${m.year || '2026'} · ${m.genre || 'General'}`,
        status: m.status || 'pending',
        poster: m.poster_url,
        overview: m.overview || 'Awaiting admin moderation and link verification.',
        uploader: m.uploaded_by || m.uploader_email || 'Community Uploader',
        momo: m.uploader_momo_number || '',
        views: Number(m.views) || 0,
        earnings: (Number(m.uploader_earnings) || 0) + (m.status === 'approved' ? calculateMovieViewBonus(m.views) : 0),
        rating: m.rating,
        tab: 'movies',
        href: `/movies/${m.id}`,
        featured: Boolean(m.featured),
        rawMovie: m,
        playableSources: resolvePreviewSourcesWithTrailerFallback(m),
        subtitleTracks: normalizeSubtitles(m.subtitles, m.subtitle_url, m.language || 'Kinyarwanda'),
        adsenseReadiness: evaluateAdsenseReadiness(m),
      }));

      const gameQueue = allGames
        .filter((g) => g.status === 'pending')
        .map((g) => ({
          key: `game:${g.id}`,
          kind: 'game',
          id: g.id,
          title: g.title,
          subtitle: `${g.category || 'Game'} · ${g.premium ? `${Number(g.price || 0).toLocaleString()} RWF` : 'Free'}`,
          status: 'pending',
          poster: g.cover_url,
          overview: g.overview || 'Game or modded app awaiting review.',
          uploader: g.uploader_email || 'Creator Submission',
          momo: g.uploader_momo_number || '',
          views: 0,
          earnings: Number(g.uploader_earnings) || 0,
          rating: g.rating,
          tab: 'premium',
          href: `/games/${g.id}`,
          featured: false,
        }));

      const combined = [...movieQueue, ...gameQueue];
      if (combined.length > 0) return combined.slice(0, 8);
    }

    if (previewFilter === 'payouts') {
      return payouts.slice(0, 8).map((p) => ({
        key: `payout:${p.id}`,
        kind: 'payout',
        id: p.id,
        title: `${Number(p.amount || 0).toLocaleString()} RWF Withdrawal`,
        subtitle: `MoMo ${p.uploader_phone || 'Not provided'} · ${p.status || 'pending'}`,
        status: p.status || 'pending',
        poster: null,
        overview: p.notes || 'Creator payout request queued for MTN MoMo or Airtel Money transfer.',
        uploader: p.uploader_email || p.uploader_id || 'Creator Account',
        momo: p.uploader_phone || '',
        views: 0,
        earnings: Number(p.amount) || 0,
        rating: null,
        tab: 'payouts',
        href: '/earnings',
        featured: false,
      }));
    }

    const baseMovies =
      previewFilter === 'featured'
        ? allMovies.filter((m) => Boolean(m.featured))
        : [...allMovies].sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));

    return (baseMovies.length > 0 ? baseMovies : allMovies).slice(0, 8).map((m) => ({
      key: `movie:${m.id}`,
      kind: 'movie',
      id: m.id,
      title: m.title,
      subtitle: `${m.type || 'Movie'} · ${m.year || '2026'} · ${m.genre || 'Action'}`,
      status: m.status || 'approved',
      poster: m.poster_url,
      overview: m.overview || 'Stream and download the latest Agasobanuye release on Agasobanuye.rw.',
      uploader: m.uploaded_by || m.uploader_email || 'Agasobanuye.rw',
      momo: m.uploader_momo_number || '',
      views: Number(m.views) || 0,
      earnings: (Number(m.uploader_earnings) || 0) + (m.status === 'approved' ? calculateMovieViewBonus(m.views) : 0),
      rating: m.rating,
      tab: m.status === 'pending' ? 'movies' : 'all-movies',
      href: `/movies/${m.id}`,
      featured: Boolean(m.featured),
      rawMovie: m,
      playableSources: resolvePreviewSourcesWithTrailerFallback(m),
      subtitleTracks: normalizeSubtitles(m.subtitles, m.subtitle_url, m.language || 'Kinyarwanda'),
      adsenseReadiness: evaluateAdsenseReadiness(m),
    }));
  }, [previewFilter, pendingMovies, allGames, allMovies, payouts]);

  useEffect(() => {
    if (previewItems.length === 0) {
      setSelectedKey('');
      return;
    }
    if (!previewItems.some((item) => item.key === selectedKey)) {
      setSelectedKey(previewItems[0].key);
    }
  }, [previewItems, selectedKey]);

  const activePreview = previewItems.find((item) => item.key === selectedKey) || previewItems[0] || null;

  const totalRev = Math.max(1, summary.totalRevenue || 0);
  const txSharePct = Math.round(((summary.transactionRevenueTotal || 0) / totalRev) * 100);
  const tipSharePct = summary.totalRevenue > 0 ? Math.max(0, 100 - txSharePct) : 0;

  const kpis = [
    {
      label: 'Confirmed Revenue',
      value: `${summary.totalRevenue.toLocaleString()} RWF`,
      detail: `${txSharePct}% unlocks · ${tipSharePct}% tips`,
      accent: 'var(--green)',
      tab: 'analytics',
    },
    {
      label: 'Catalog & Reach',
      value: `${summary.totalMovies.toLocaleString()} titles`,
      detail: `${summary.approvedMovies} live · ${summary.featuredMovies} featured · ${summary.totalViews.toLocaleString()} views`,
      accent: GOLD_LIGHT,
      tab: 'all-movies',
    },
    {
      label: 'Creator Payouts & Pro',
      value: `${(summary.pendingPayoutsCount || 0).toLocaleString()} queued`,
      detail: `${(summary.pendingPayoutsTotalRwf || 0).toLocaleString()} RWF due · ${summary.activeSubscriptions} Pro · ${registeredUsersCount} users`,
      accent: 'var(--blue)',
      tab: summary.pendingPayoutsCount > 0 ? 'payouts' : 'subscriptions',
    },
    {
      label: 'Moderation Attention',
      value: `${summary.pendingModerationTotal} items`,
      detail: queue.length === 0 ? 'All queues clear' : `${queue.length} active queues awaiting review`,
      accent: summary.pendingModerationTotal > 0 ? 'var(--warn)' : 'var(--green)',
      tab: queue[0]?.tab || 'movies',
    },
  ];

  const categories = [
    {
      id: 'all-movies',
      label: 'All Agasobanuye',
      icon: Film,
      metric: `${summary.totalMovies} titles`,
      meta: `${summary.pendingMovies} pending · ${summary.featuredMovies} featured`,
      actionLabel: 'Add Movie',
      createType: 'movie',
    },
    {
      id: 'coming-soon',
      label: 'Coming Soon',
      icon: CalendarClock,
      metric: `${summary.totalComingSoon} scheduled`,
      meta: 'Synced to homepage Upcoming strip',
      actionLabel: 'Add Release',
      createType: 'coming-soon',
    },
    {
      id: 'premium',
      label: 'Games & Premium',
      icon: Gamepad2,
      metric: `${summary.totalGames} items`,
      meta: `${summary.pendingGames} awaiting review`,
      actionLabel: 'Add Item',
      createType: 'game',
    },
    {
      id: 'payouts',
      label: 'Creator Payouts',
      icon: DollarSign,
      metric: `${summary.pendingPayoutsCount || 0} pending`,
      meta: `${(summary.paidPayoutsTotalRwf || 0).toLocaleString()} RWF paid out via MoMo`,
      actionLabel: null,
      createType: null,
    },
    {
      id: 'requests',
      label: 'Movie Requests',
      icon: Heart,
      metric: `${summary.totalRequests} requests`,
      meta: `${summary.fulfilledRequests} fulfilled · ${summary.pendingRequests} open`,
      actionLabel: 'Add Request',
      createType: 'request',
    },
    {
      id: 'news',
      label: 'News & Amakuru',
      icon: Newspaper,
      metric: `${summary.totalNews} posts`,
      meta: `${summary.pendingNews} pending approval`,
      actionLabel: 'Publish Post',
      createType: 'news',
    },
    {
      id: 'shop',
      label: 'Marketplace Shop',
      icon: ShoppingBag,
      metric: `${summary.totalShop} listings`,
      meta: `${summary.activeShop} active · ${summary.soldShop} sold`,
      actionLabel: 'Add Listing',
      createType: 'shop',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: Wallet,
      metric: `${summary.pendingTransactions} pending tx`,
      meta: `${summary.totalDonationsCount} donations · Full CSV ledger`,
      actionLabel: 'Manual Tx',
      createType: 'transaction',
    },
    {
      id: 'subscriptions',
      label: 'Pro Subscriptions',
      icon: Crown,
      metric: `${summary.activeSubscriptions} active`,
      meta: `${summary.pendingSubscriptions} awaiting approval`,
      actionLabel: 'Grant Pro',
      createType: 'subscription',
    },
    {
      id: 'contacts',
      label: 'Contact Messages',
      icon: Mail,
      metric: `${summary.totalContacts} total`,
      meta: `${summary.unresolvedContacts} unread`,
      actionLabel: null,
      createType: null,
    },
    {
      id: 'admins',
      label: 'Admins & Users',
      icon: Users,
      metric: `${summary.totalAdmins} admins`,
      meta: `${registeredUsersCount} registered accounts`,
      actionLabel: null,
      createType: null,
    },
  ];

  const severityLabel = {
    high: { text: 'Urgent', color: 'var(--danger)' },
    medium: { text: 'Review', color: 'var(--warn)' },
    low: { text: 'Inbox', color: 'var(--blue)' },
  };

  return (
    <div className="space-y-6" data-testid="admin-overview">
      {/* 1. Executive 4-Cell Ledger Strip */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.07] rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
      >
        {kpis.map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => onNavigate(kpi.tab)}
            className="text-left p-5 transition-colors hover:bg-[var(--bg-ghost)] cursor-pointer"
          >
            <div className="text-xs font-medium mb-1.5" style={{ color: 'var(--text2)' }}>
              {kpi.label}
            </div>
            <div className="text-2xl font-semibold tabular-nums tracking-tight" style={{ color: kpi.accent }}>
              {kpi.value}
            </div>
            <div className="text-xs mt-1.5 leading-snug tabular-nums" style={{ color: 'var(--muted)' }}>
              {kpi.detail}
            </div>
          </button>
        ))}
      </div>

      {/* 2. Proportional Revenue & Creator Payout Mix Bar */}
      <div
        className="p-5 rounded-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Revenue & Creator Disbursement Split
            </h2>
            <p className="text-xs mt-0.5 tabular-nums" style={{ color: 'var(--muted)' }}>
              Unlocks {summary.transactionRevenueTotal.toLocaleString()} RWF · Direct Tips {summary.directDonationsTotal.toLocaleString()} RWF · Pending Payouts {(summary.pendingPayoutsTotalRwf || 0).toLocaleString()} RWF · Paid Out {(summary.paidPayoutsTotalRwf || 0).toLocaleString()} RWF
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('payouts')}
              className="btn-ghost px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap"
            >
              Payout Ledger
            </button>
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap"
            >
              <BarChart3 size={13} />
              <span>Full Analytics</span>
            </button>
          </div>
        </div>

        <div
          className="h-2.5 w-full rounded-full overflow-hidden flex"
          style={{ background: 'var(--bg-ghost)' }}
          aria-label="Revenue allocation breakdown"
        >
          {summary.totalRevenue > 0 ? (
            <>
              <div
                style={{ width: `${txSharePct}%`, background: 'var(--blue)' }}
                title={`Unlocks & Subscriptions: ${summary.transactionRevenueTotal.toLocaleString()} RWF`}
              />
              <div
                style={{ width: `${tipSharePct}%`, background: 'var(--green)' }}
                title={`Direct Fan Donations: ${summary.directDonationsTotal.toLocaleString()} RWF`}
              />
            </>
          ) : (
            <div style={{ width: '100%', background: 'var(--bg-ghost)' }} />
          )}
        </div>
      </div>

      {/* 3. Main Split: Auto-Playing Show Preview Studio (60%) + Moderation Queue (40%) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Show Preview Studio */}
        <section
          aria-label="Show Preview Studio"
          data-testid="show-preview-studio"
          className="xl:col-span-7 rounded-2xl overflow-hidden flex flex-col"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07]">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                Show Preview & Release Inspector
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                Auto-playing external stream preview, subtitle verification, and AdSense content checks
              </p>
            </div>

            <div
              className="inline-flex items-center p-0.5 rounded-lg"
              style={{ background: 'var(--bg-ghost)', border: '1px solid var(--border)' }}
            >
              <button
                type="button"
                onClick={() => setPreviewLayout('autoplay')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap"
                style={
                  previewLayout === 'autoplay'
                    ? { background: 'var(--accent-bg)', color: GOLD_LIGHT }
                    : { color: 'var(--muted)' }
                }
              >
                <Monitor size={12} />
                <span>Auto Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewLayout('card')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap"
                style={
                  previewLayout === 'card'
                    ? { background: 'var(--accent-bg)', color: GOLD_LIGHT }
                    : { color: 'var(--muted)' }
                }
              >
                <LayoutGrid size={12} />
                <span>Poster Card</span>
              </button>
            </div>
          </div>

          {/* Filter Segment Bar */}
          <div className="px-5 py-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-hide border-b border-white/[0.06]">
            {PREVIEW_FILTERS.map((f) => {
              const active = previewFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPreviewFilter(f.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0"
                  style={
                    active
                      ? { background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', color: GOLD_LIGHT }
                      : { background: 'transparent', border: '1px solid transparent', color: 'var(--muted)' }
                  }
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.07]">
            {/* Item Selector Column */}
            <div className="md:col-span-4 divide-y divide-white/[0.05] max-h-[520px] overflow-y-auto">
              {previewItems.length === 0 ? (
                <div className="p-6 text-xs" style={{ color: 'var(--muted)' }}>
                  No items match this view right now.
                </div>
              ) : (
                previewItems.map((item) => {
                  const selected = activePreview?.key === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSelectedKey(item.key)}
                      className="w-full text-left px-4 py-3 transition-colors cursor-pointer flex items-start justify-between gap-2"
                      style={{
                        background: selected ? 'var(--accent-bg)' : 'transparent',
                      }}
                    >
                      <div className="min-w-0">
                        <div
                          className="text-xs font-semibold truncate"
                          style={{ color: selected ? GOLD_LIGHT : 'var(--text)' }}
                        >
                          {item.title}
                        </div>
                        <div className="text-[11px] truncate mt-0.5 tabular-nums" style={{ color: 'var(--muted)' }}>
                          {item.subtitle}
                        </div>
                      </div>
                      <span
                        className="text-[11px] font-medium capitalize shrink-0"
                        style={{
                          color:
                            item.status === 'approved' || item.status === 'paid'
                              ? 'var(--green)'
                              : item.status === 'pending'
                              ? 'var(--warn)'
                              : 'var(--muted)',
                        }}
                      >
                        {item.status}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Live Auto-Playing Preview Canvas */}
            <div className="md:col-span-8 p-5 flex flex-col justify-between gap-4">
              {activePreview ? (
                <>
                  <div className="space-y-4">
                    {/* Auto-play stage immediately when playable sources exist and Auto Preview mode is active */}
                    {previewLayout === 'autoplay' && activePreview.rawMovie && activePreview.playableSources?.length > 0 ? (
                      <SmartMediaPlayer
                        key={activePreview.key}
                        movie={activePreview.rawMovie}
                        compact
                        autoPlayMuted
                      />
                    ) : (
                      <div className="flex gap-4 items-start">
                        <div
                          className="relative w-24 aspect-[2/3] rounded-xl overflow-hidden shrink-0"
                          style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
                        >
                          {activePreview.poster ? (
                            <img
                              src={activePreview.poster}
                              alt={activePreview.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full items-center justify-center flex-col gap-1.5 text-center p-2"
                            style={{
                              display: activePreview.poster ? 'none' : 'flex',
                              background: 'var(--bg4)',
                            }}
                          >
                            {activePreview.kind === 'payout' ? (
                              <Wallet size={22} style={{ color: GOLD }} />
                            ) : (
                              <Tv2 size={22} style={{ color: GOLD, opacity: 0.7 }} />
                            )}
                          </div>
                        </div>
                        <div className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
                          {activePreview.overview}
                        </div>
                      </div>
                    )}

                    {/* Title, Editorial Overview & External Links / AdSense Readiness Ledger */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] tabular-nums" style={{ color: 'var(--muted)' }}>
                        <span className="capitalize font-semibold" style={{ color: activePreview.status === 'pending' ? 'var(--warn)' : 'var(--green)' }}>
                          {activePreview.status}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{activePreview.subtitle}</span>
                        {activePreview.rating && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-0.5" style={{ color: GOLD_LIGHT }}>
                              <Star size={10} fill="currentColor" /> {activePreview.rating}
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="font-cinzel text-base font-bold leading-snug" style={{ fontFamily: 'Cinzel, serif', color: 'var(--text)' }}>
                        {activePreview.title}
                      </h3>

                      {previewLayout === 'autoplay' && (
                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text2)' }}>
                          {activePreview.overview}
                        </p>
                      )}

                      <div className="pt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs tabular-nums border-t border-white/[0.06]">
                        <div>
                          <div className="text-[11px]" style={{ color: 'var(--muted)' }}>Creator / Uploader</div>
                          <div className="font-medium truncate mt-0.5" style={{ color: 'var(--text)' }}>
                            {activePreview.uploader}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                            {activePreview.kind === 'payout' ? 'MoMo Destination' : 'Reach & Earnings'}
                          </div>
                          <div className="font-medium mt-0.5" style={{ color: 'var(--green)' }}>
                            {activePreview.kind === 'payout'
                              ? activePreview.momo || 'Not set'
                              : `${activePreview.views.toLocaleString()} views · ${activePreview.earnings.toLocaleString()} RWF`}
                          </div>
                        </div>
                        {activePreview.adsenseReadiness && (
                          <div>
                            <div className="text-[11px] flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                              <ShieldCheck size={11} style={{ color: GOLD_LIGHT }} />
                              <span>AdSense Content</span>
                            </div>
                            <div
                              className="font-semibold mt-0.5"
                              style={{ color: activePreview.adsenseReadiness.passed ? 'var(--green)' : 'var(--warn)' }}
                            >
                              {activePreview.adsenseReadiness.score}% Ready
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Subtitles & External Mirror Hosts Strip */}
                      {(activePreview.subtitleTracks?.length > 0 || activePreview.playableSources?.length > 0) && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] pt-1" style={{ color: 'var(--text2)' }}>
                          {activePreview.subtitleTracks?.length > 0 && (
                            <span className="inline-flex items-center gap-1 font-medium" style={{ color: 'var(--green)' }}>
                              <Subtitles size={11} />
                              Subtitles: {activePreview.subtitleTracks.map((s) => s.language).join(', ')}
                            </span>
                          )}
                          {activePreview.playableSources?.length > 0 && (
                            <span className="inline-flex items-center gap-1 font-medium" style={{ color: GOLD_LIGHT }}>
                              <Globe size={11} />
                              Source: {extractExternalDomain(activePreview.playableSources[0].url) || activePreview.playableSources[0].label}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => onNavigate(activePreview.tab)}
                      className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap"
                    >
                      <span>Open in Moderation Tab</span>
                      <ArrowRight size={13} />
                    </button>

                    <Link
                      href={activePreview.href}
                      className="btn-ghost inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap"
                    >
                      <ExternalLink size={12} />
                      <span>View Public Page</span>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center text-xs" style={{ color: 'var(--muted)' }}>
                  Select a title or payout on the left to inspect its live storefront preview.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Moderation & Payout Action Queue (40%) */}
        <section
          aria-label="Moderation Queue"
          className="xl:col-span-5 rounded-2xl overflow-hidden flex flex-col"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                Moderation & Payout Queue
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                Operational bottlenecks needing admin sign-off
              </p>
            </div>
            <span className="text-xs font-semibold tabular-nums" style={{ color: queue.length > 0 ? 'var(--warn)' : 'var(--green)' }}>
              {summary.pendingModerationTotal} open
            </span>
          </div>

          {queue.length === 0 ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-2">
              <CheckCircle2 size={24} style={{ color: 'var(--green)' }} />
              <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>All queues clear</div>
              <p className="text-xs max-w-xs" style={{ color: 'var(--muted)' }}>
                Every upload, transaction, and creator payout request is up to date.
              </p>
            </div>
          ) : (
            <div className="flex-1 divide-y divide-white/[0.06]">
              {queue.map((item) => {
                const sev = severityLabel[item.severity] || severityLabel.low;
                return (
                  <div
                    key={item.tab}
                    className="px-5 py-3.5 flex items-center justify-between gap-3 transition-colors hover:bg-[var(--bg-ghost)]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs mb-0.5">
                        <span className="inline-flex items-center gap-1 font-semibold" style={{ color: sev.color }}>
                          {item.severity === 'high' ? <AlertTriangle size={11} /> : <Clock size={11} />}
                          {sev.text}
                        </span>
                        <span aria-hidden="true" style={{ color: 'var(--dim)' }}>·</span>
                        <span className="tabular-nums font-semibold" style={{ color: 'var(--text)' }}>
                          {item.count} {item.count === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      <div className="text-xs truncate" style={{ color: 'var(--text2)' }}>
                        {item.label}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.tab)}
                      className="btn-ghost inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap shrink-0"
                      style={{ color: GOLD_LIGHT }}
                    >
                      <span>Review</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 4. Hairline-Divided Operational Directory (All Site Modules) */}
      <section aria-label="Platform Modules">
        <div className="flex items-baseline justify-between gap-4 pb-2.5 mb-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            All Platform Modules
          </h2>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            Direct navigation and quick creation across {categories.length} sections
          </span>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 divide-y divide-white/[0.06] md:divide-x rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-[var(--bg-ghost)]"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
                  >
                    <Icon size={16} style={{ color: GOLD_LIGHT }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{cat.label}</span>
                      <span className="text-xs tabular-nums font-semibold" style={{ color: GOLD }}>{cat.metric}</span>
                    </div>
                    <div className="text-xs mt-0.5 leading-snug tabular-nums" style={{ color: 'var(--muted)' }}>
                      {cat.meta}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {cat.createType && (
                    <button
                      type="button"
                      onClick={() => onQuickCreate(cat.id, cat.createType)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap"
                      style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', color: 'var(--green)' }}
                    >
                      <Plus size={12} />
                      <span>{cat.actionLabel}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onNavigate(cat.id)}
                    className="btn-ghost px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap"
                  >
                    Manage
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
