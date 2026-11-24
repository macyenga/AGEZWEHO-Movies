import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Film, CalendarClock, Gamepad2, Heart, Newspaper, ShoppingBag,
  Wallet, Crown, Mail, Users, ArrowRight, CheckCircle2, Plus, BarChart3,
  Eye, Star, ExternalLink, DollarSign, AlertTriangle, Tv2,
  Monitor, LayoutGrid, Clock, Play, Subtitles,
} from 'lucide-react';
import { buildModerationQueue } from '../../lib/admin-helpers';
import { calculateMovieViewBonus } from '../../lib/uploader-earnings';
import { collectPlayableSources, normalizeSubtitles } from '../../lib/media-preview';
import SmartMediaPlayer from '../SmartMediaPlayer';

const GOLD = '#c9a84c';
const GOLD_LIGHT = '#e8c87a';

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
  const [previewLayout, setPreviewLayout] = useState('card'); // 'card' | 'spotlight'
  const [selectedKey, setSelectedKey] = useState('');
  const [playingPreview, setPlayingPreview] = useState(false);

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
        playableSources: collectPlayableSources(m),
        subtitleTracks: normalizeSubtitles(m.subtitles, m.subtitle_url, m.language || 'Kinyarwanda'),
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
      playableSources: collectPlayableSources(m),
      subtitleTracks: normalizeSubtitles(m.subtitles, m.subtitle_url, m.language || 'Kinyarwanda'),
    }));
  }, [previewFilter, pendingMovies, allGames, allMovies, payouts]);

  useEffect(() => {
    if (previewItems.length === 0) {
      setSelectedKey('');
      setPlayingPreview(false);
      return;
    }
    if (!previewItems.some((item) => item.key === selectedKey)) {
      setSelectedKey(previewItems[0].key);
      setPlayingPreview(false);
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
      accent: '#22c55e',
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
      accent: '#60a5fa',
      tab: summary.pendingPayoutsCount > 0 ? 'payouts' : 'subscriptions',
    },
    {
      label: 'Moderation Attention',
      value: `${summary.pendingModerationTotal} items`,
      detail: queue.length === 0 ? 'All queues clear' : `${queue.length} active queues awaiting review`,
      accent: summary.pendingModerationTotal > 0 ? '#fbbf24' : '#22c55e',
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
    high: { text: 'Urgent', color: '#f87171' },
    medium: { text: 'Review', color: '#fbbf24' },
    low: { text: 'Inbox', color: '#60a5fa' },
  };

  return (
    <div className="space-y-6" data-testid="admin-overview">
      {/* 1. Executive 4-Cell Ledger Strip */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.07] rounded-2xl overflow-hidden"
        style={{ background: 'rgba(14,14,22,0.82)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {kpis.map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => onNavigate(kpi.tab)}
            className="text-left p-5 transition-colors hover:bg-white/[0.03] cursor-pointer"
          >
            <div className="text-xs font-medium mb-1.5" style={{ color: '#9c988b' }}>
              {kpi.label}
            </div>
            <div className="text-2xl font-semibold tabular-nums tracking-tight" style={{ color: kpi.accent }}>
              {kpi.value}
            </div>
            <div className="text-xs mt-1.5 leading-snug tabular-nums" style={{ color: '#787467' }}>
              {kpi.detail}
            </div>
          </button>
        ))}
      </div>

      {/* 2. Proportional Revenue & Creator Payout Mix Bar */}
      <div
        className="p-5 rounded-2xl"
        style={{ background: 'rgba(14,14,22,0.82)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: '#f3efe3' }}>
              Revenue & Creator Disbursement Split
            </h2>
            <p className="text-xs mt-0.5 tabular-nums" style={{ color: '#8a8778' }}>
              Unlocks {summary.transactionRevenueTotal.toLocaleString()} RWF · Direct Tips {summary.directDonationsTotal.toLocaleString()} RWF · Pending Payouts {(summary.pendingPayoutsTotalRwf || 0).toLocaleString()} RWF · Paid Out {(summary.paidPayoutsTotalRwf || 0).toLocaleString()} RWF
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('payouts')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors hover:bg-white/[0.06] whitespace-nowrap"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#d4cfc0' }}
            >
              Payout Ledger
            </button>
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap"
              style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: GOLD_LIGHT }}
            >
              <BarChart3 size={13} />
              <span>Full Analytics</span>
            </button>
          </div>
        </div>

        <div
          className="h-2.5 w-full rounded-full overflow-hidden flex"
          style={{ background: 'rgba(255,255,255,0.05)' }}
          aria-label="Revenue allocation breakdown"
        >
          {summary.totalRevenue > 0 ? (
            <>
              <div
                style={{ width: `${txSharePct}%`, background: '#3b82f6' }}
                title={`Unlocks & Subscriptions: ${summary.transactionRevenueTotal.toLocaleString()} RWF`}
              />
              <div
                style={{ width: `${tipSharePct}%`, background: '#22c55e' }}
                title={`Direct Fan Donations: ${summary.directDonationsTotal.toLocaleString()} RWF`}
              />
            </>
          ) : (
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)' }} />
          )}
        </div>
      </div>

      {/* 3. Main Split: Live Show Preview Studio (60%) + Moderation Queue (40%) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Live Show Preview Studio */}
        <section
          aria-label="Show Preview Studio"
          className="xl:col-span-7 rounded-2xl overflow-hidden flex flex-col"
          style={{ background: 'rgba(14,14,22,0.82)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07]">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: '#f3efe3' }}>
                Show Preview & Release Inspector
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#8a8778' }}>
                Inspect how titles, uploader MoMo accounts, and payouts appear live
              </p>
            </div>

            <div
              className="inline-flex items-center p-0.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <button
                type="button"
                onClick={() => setPreviewLayout('card')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap"
                style={
                  previewLayout === 'card'
                    ? { background: 'rgba(201,168,76,0.16)', color: GOLD_LIGHT }
                    : { color: '#8a8778' }
                }
              >
                <LayoutGrid size={12} />
                <span>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewLayout('spotlight')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap"
                style={
                  previewLayout === 'spotlight'
                    ? { background: 'rgba(201,168,76,0.16)', color: GOLD_LIGHT }
                    : { color: '#8a8778' }
                }
              >
                <Monitor size={12} />
                <span>Spotlight</span>
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
                      ? { background: 'rgba(201,168,76,0.16)', border: '1px solid rgba(201,168,76,0.38)', color: GOLD_LIGHT }
                      : { background: 'transparent', border: '1px solid transparent', color: '#8e8a7e' }
                  }
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.07]">
            {/* Item Selector Column */}
            <div className="md:col-span-5 divide-y divide-white/[0.05] max-h-[360px] overflow-y-auto">
              {previewItems.length === 0 ? (
                <div className="p-6 text-xs" style={{ color: '#8a8778' }}>
                  No items match this view right now.
                </div>
              ) : (
                previewItems.map((item) => {
                  const selected = activePreview?.key === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setSelectedKey(item.key);
                        setPlayingPreview(false);
                      }}
                      className="w-full text-left px-4 py-3 transition-colors cursor-pointer flex items-start justify-between gap-2"
                      style={{
                        background: selected ? 'rgba(201,168,76,0.08)' : 'transparent',
                      }}
                    >
                      <div className="min-w-0">
                        <div
                          className="text-xs font-semibold truncate"
                          style={{ color: selected ? GOLD_LIGHT : '#f1ede2' }}
                        >
                          {item.title}
                        </div>
                        <div className="text-[11px] truncate mt-0.5 tabular-nums" style={{ color: '#8a8778' }}>
                          {item.subtitle}
                        </div>
                      </div>
                      <span
                        className="text-[11px] font-medium capitalize shrink-0"
                        style={{
                          color:
                            item.status === 'approved' || item.status === 'paid'
                              ? '#4ade80'
                              : item.status === 'pending'
                              ? '#fbbf24'
                              : '#9c988b',
                        }}
                      >
                        {item.status}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Live Preview Canvas */}
            <div className="md:col-span-7 p-5 flex flex-col justify-between gap-4">
              {activePreview ? (
                <>
                  {playingPreview && activePreview.rawMovie && activePreview.playableSources?.length > 0 ? (
                    <SmartMediaPlayer
                      movie={activePreview.rawMovie}
                      compact
                      onClose={() => setPlayingPreview(false)}
                    />
                  ) : (
                    <div
                      className={
                        previewLayout === 'spotlight'
                          ? 'space-y-4'
                          : 'flex gap-4 items-start'
                      }
                    >
                      <div
                        className={
                          previewLayout === 'spotlight'
                            ? 'relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#101019]'
                            : 'relative w-24 aspect-[2/3] rounded-xl overflow-hidden shrink-0 bg-[#101019]'
                        }
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
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
                            background: 'linear-gradient(145deg, #171724 0%, #0d0d14 100%)',
                          }}
                        >
                          {activePreview.kind === 'payout' ? (
                            <Wallet size={22} style={{ color: GOLD }} />
                          ) : (
                            <Tv2 size={22} style={{ color: GOLD, opacity: 0.6 }} />
                          )}
                        </div>
                        {previewLayout === 'spotlight' && (
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: 'linear-gradient(180deg, transparent 35%, rgba(8,8,14,0.92) 100%)' }}
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] tabular-nums mb-1" style={{ color: '#9c988b' }}>
                          <span className="capitalize font-semibold" style={{ color: activePreview.status === 'pending' ? '#fbbf24' : '#4ade80' }}>
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

                        <h3 className="font-cinzel text-base font-bold leading-snug mb-1.5" style={{ fontFamily: 'Cinzel, serif', color: '#f7f4eb' }}>
                          {activePreview.title}
                        </h3>

                        <p className="text-xs leading-relaxed line-clamp-3" style={{ color: '#a5a193' }}>
                          {activePreview.overview}
                        </p>

                        {activePreview.subtitleTracks?.length > 0 && (
                          <div className="mt-2.5 flex items-center gap-1.5 text-[11px]" style={{ color: '#86efac' }}>
                            <Subtitles size={12} />
                            <span>
                              Subtitles: {activePreview.subtitleTracks.map((s) => s.language).join(', ')}
                            </span>
                          </div>
                        )}

                        <div className="mt-3 pt-3 grid grid-cols-2 gap-3 text-xs tabular-nums border-t border-white/[0.06]">
                          <div>
                            <div className="text-[11px]" style={{ color: '#787467' }}>Creator / Uploader</div>
                            <div className="font-medium truncate mt-0.5" style={{ color: '#e8e4d8' }}>
                              {activePreview.uploader}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px]" style={{ color: '#787467' }}>
                              {activePreview.kind === 'payout' ? 'MoMo Destination' : 'Reach & Earnings'}
                            </div>
                            <div className="font-medium mt-0.5" style={{ color: '#4ade80' }}>
                              {activePreview.kind === 'payout'
                                ? activePreview.momo || 'Not set'
                                : `${activePreview.views.toLocaleString()} views · ${activePreview.earnings.toLocaleString()} RWF`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/[0.06]">
                    <div className="flex flex-wrap items-center gap-2">
                      {activePreview.playableSources?.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setPlayingPreview((v) => !v)}
                          data-testid="admin-play-preview-btn"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
                          style={
                            playingPreview
                              ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', color: '#f7f4eb' }
                              : { background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)`, color: '#09080b' }
                          }
                        >
                          <Play size={12} fill={playingPreview ? 'none' : 'currentColor'} />
                          <span>{playingPreview ? 'Back to Card Details' : `Play Preview (${activePreview.playableSources.length})`}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onNavigate(activePreview.tab)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
                        style={{
                          background: 'rgba(201,168,76,0.16)',
                          border: '1px solid rgba(201,168,76,0.38)',
                          color: GOLD_LIGHT,
                        }}
                      >
                        <span>Open in Moderation Tab</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    <Link
                      href={activePreview.href}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-white/[0.06] whitespace-nowrap"
                      style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#d4cfc0' }}
                    >
                      <ExternalLink size={12} />
                      <span>View Public Page</span>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center text-xs" style={{ color: '#8a8778' }}>
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
          style={{ background: 'rgba(14,14,22,0.82)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: '#f3efe3' }}>
                Moderation & Payout Queue
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#8a8778' }}>
                Operational bottlenecks needing admin sign-off
              </p>
            </div>
            <span className="text-xs font-semibold tabular-nums" style={{ color: queue.length > 0 ? '#fbbf24' : '#4ade80' }}>
              {summary.pendingModerationTotal} open
            </span>
          </div>

          {queue.length === 0 ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-2">
              <CheckCircle2 size={24} style={{ color: '#22c55e' }} />
              <div className="text-sm font-medium" style={{ color: '#f3efe3' }}>All queues clear</div>
              <p className="text-xs max-w-xs" style={{ color: '#8a8778' }}>
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
                    className="px-5 py-3.5 flex items-center justify-between gap-3 transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs mb-0.5">
                        <span className="inline-flex items-center gap-1 font-semibold" style={{ color: sev.color }}>
                          {item.severity === 'high' ? <AlertTriangle size={11} /> : <Clock size={11} />}
                          {sev.text}
                        </span>
                        <span aria-hidden="true" style={{ color: '#504d42' }}>·</span>
                        <span className="tabular-nums font-semibold" style={{ color: '#f1ede2' }}>
                          {item.count} {item.count === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      <div className="text-xs truncate" style={{ color: '#c8c3b6' }}>
                        {item.label}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.tab)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors hover:bg-white/[0.08] whitespace-nowrap shrink-0"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: GOLD_LIGHT,
                      }}
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
        <div className="flex items-baseline justify-between gap-4 pb-2.5 mb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-sm font-semibold" style={{ color: '#f3efe3' }}>
            All Platform Modules
          </h2>
          <span className="text-xs" style={{ color: '#8a8778' }}>
            Direct navigation and quick creation across {categories.length} sections
          </span>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 divide-y divide-white/[0.06] md:divide-x rounded-2xl overflow-hidden"
          style={{ background: 'rgba(14,14,22,0.82)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(201,168,76,0.09)', border: '1px solid rgba(201,168,76,0.2)' }}
                  >
                    <Icon size={16} style={{ color: GOLD_LIGHT }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-sm font-medium" style={{ color: '#f1ede2' }}>{cat.label}</span>
                      <span className="text-xs tabular-nums" style={{ color: GOLD }}>{cat.metric}</span>
                    </div>
                    <div className="text-xs mt-0.5 leading-snug tabular-nums" style={{ color: '#787467' }}>
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
                      style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.28)', color: '#4ade80' }}
                    >
                      <Plus size={12} />
                      <span>{cat.actionLabel}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onNavigate(cat.id)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors hover:bg-white/[0.08] whitespace-nowrap"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#d4cfc0' }}
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
