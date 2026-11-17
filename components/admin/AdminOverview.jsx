import {
  Film, CalendarClock, Gamepad2, Heart, Newspaper, ShoppingBag,
  Wallet, Crown, Mail, Users, ArrowRight, CheckCircle2, Plus, BarChart3,
} from 'lucide-react';
import { buildModerationQueue } from '../../lib/admin-helpers';

export default function AdminOverview({
  summary,
  registeredUsersCount = 0,
  onNavigate,
  onQuickCreate,
}) {
  const queue = buildModerationQueue(summary);

  const kpis = [
    {
      label: 'Agasobanuye Catalog',
      value: summary.totalMovies.toLocaleString(),
      sub: `${summary.approvedMovies} approved · ${summary.featuredMovies} featured · ${summary.totalViews.toLocaleString()} views`,
      accent: '#e8c87a',
      tab: 'all-movies',
    },
    {
      label: 'Confirmed Revenue',
      value: `${summary.totalRevenue.toLocaleString()} RWF`,
      sub: `${summary.transactionRevenueTotal.toLocaleString()} tx · ${summary.directDonationsTotal.toLocaleString()} donations`,
      accent: '#22c55e',
      tab: 'analytics',
    },
    {
      label: 'Community & Pro',
      value: `${summary.activeSubscriptions} Pro`,
      sub: `${summary.totalVotes.toLocaleString()} votes · ${registeredUsersCount} users · ${summary.totalAdmins} admins`,
      accent: '#60a5fa',
      tab: 'subscriptions',
    },
    {
      label: 'Pending Attention',
      value: String(summary.pendingModerationTotal),
      sub: queue.length === 0 ? 'All queues clear' : `${queue.length} active category queues`,
      accent: summary.pendingModerationTotal > 0 ? '#f59e0b' : '#22c55e',
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
      meta: `${summary.totalDonationsCount} donations · Payout ledger`,
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
      actionLabel: 'Open Inbox',
      createType: null,
    },
    {
      id: 'admins',
      label: 'Admins & Users',
      icon: Users,
      metric: `${summary.totalAdmins} admins`,
      meta: `${registeredUsersCount} registered accounts`,
      actionLabel: 'Manage Roles',
      createType: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4-column KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => onNavigate(kpi.tab)}
            className="text-left p-4 rounded-xl transition-colors hover:bg-white/[0.04]"
            style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="text-xs font-medium mb-1" style={{ color: '#8e8a7e' }}>{kpi.label}</div>
            <div className="text-xl font-semibold tabular-nums" style={{ color: kpi.accent }}>{kpi.value}</div>
            <div className="text-xs mt-1.5 leading-snug tabular-nums" style={{ color: '#6a6a5a' }}>{kpi.sub}</div>
          </button>
        ))}
      </div>

      {/* Action Queue */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>Moderation & Action Queue</h2>
            <p className="text-xs" style={{ color: '#6a6a5a' }}>Items across every category requiring review or fulfillment</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('analytics')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: '#e8c87a' }}
          >
            <BarChart3 size={13} /> Full Analytics
          </button>
        </div>

        {queue.length === 0 ? (
          <div className="px-4 py-6 flex items-center gap-3 text-xs" style={{ color: '#8e8a7e' }}>
            <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
            <span>Every moderation queue is clear. Use the category directory below to create or edit content.</span>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {queue.map((item) => (
              <div key={item.tab} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.02]">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="text-xs font-semibold tabular-nums px-2 py-0.5 rounded-md shrink-0"
                    style={{
                      background: item.severity === 'high' ? 'rgba(239,68,68,0.14)' : 'rgba(251,191,36,0.12)',
                      color: item.severity === 'high' ? '#f87171' : '#fbbf24',
                    }}
                  >
                    {item.count}
                  </span>
                  <span className="text-sm truncate" style={{ color: '#e8e6f0' }}>{item.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(item.tab)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8c87a' }}
                >
                  Review <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Controls Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>All Site Categories</h2>
          <span className="text-xs" style={{ color: '#6a6a5a' }}>Direct access to create, edit, and moderate every resource</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(201,168,76,0.09)', border: '1px solid rgba(201,168,76,0.2)' }}
                  >
                    <Icon size={16} style={{ color: '#e8c87a' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-sm font-medium" style={{ color: '#e8e6f0' }}>{cat.label}</span>
                      <span className="text-xs tabular-nums shrink-0" style={{ color: '#c9a84c' }}>{cat.metric}</span>
                    </div>
                    <div className="text-xs mt-0.5 leading-snug" style={{ color: '#6a6a5a' }}>{cat.meta}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {cat.createType ? (
                    <button
                      type="button"
                      onClick={() => onQuickCreate(cat.id, cat.createType)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                      style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.28)', color: '#22c55e' }}
                    >
                      <Plus size={12} /> {cat.actionLabel}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onNavigate(cat.id)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#b8b4a8' }}
                  >
                    Manage
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
