import { TrendingUp, Heart, Package, Filter, Film, Eye, Loader2 } from 'lucide-react';

export default function AdminAnalyticsPanel({
  analytics,
  loading,
  period,
  onChangePeriod,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>Platform Analytics</h2>
          <p className="text-xs" style={{ color: '#6a6a5a' }}>Revenue, catalog viewership, genres, and transaction status counts</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChangePeriod(p)}
              className="px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors whitespace-nowrap"
              style={period === p
                ? { background: 'rgba(201,168,76,0.16)', color: '#e8c87a' }
                : { color: '#8e8a7e' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={22} style={{ color: '#c9a84c' }} className="animate-spin" />
        </div>
      ) : analytics ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Revenue', value: `${(analytics.totalRevenue || 0).toLocaleString()} RWF`, color: '#fbbf24' },
              { label: 'Game Sales', value: `${(analytics.gameSalesTotal || 0).toLocaleString()} RWF`, color: '#60a5fa' },
              { label: 'Total Movie Views', value: (analytics.totalViews || 0).toLocaleString(), color: '#e8c87a' },
              { label: 'Total Transactions', value: (analytics.totalTransactions || 0).toLocaleString(), color: '#22c55e' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl"
                style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="text-xs mb-1" style={{ color: '#8e8a7e' }}>{stat.label}</div>
                <div className="text-lg font-semibold tabular-nums" style={{ color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={15} style={{ color: '#c9a84c' }} />
              <span className="text-xs font-semibold capitalize" style={{ color: '#e8e6f0' }}>
                Revenue Trend ({period})
              </span>
            </div>
            {!analytics.revenueByPeriod || analytics.revenueByPeriod.length === 0 ? (
              <p className="text-xs text-center py-6" style={{ color: '#6a6a5a' }}>No completed transaction revenue in this period yet</p>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {analytics.revenueByPeriod.slice().reverse().map((r) => {
                  const maxRevenue = Math.max(...analytics.revenueByPeriod.map((x) => x.total), 1);
                  const pct = (r.total / maxRevenue) * 100;
                  return (
                    <div key={r.date} className="flex items-center gap-3">
                      <span className="text-xs tabular-nums w-24 shrink-0" style={{ color: '#8e8a7e' }}>{r.date}</span>
                      <div className="flex-1 h-4 rounded relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div
                          className="h-full rounded absolute left-0 top-0"
                          style={{
                            width: `${Math.max(pct, 2)}%`,
                            background: r.donations > r.gameSales ? '#22c55e' : '#3b82f6',
                          }}
                        />
                      </div>
                      <span className="text-xs tabular-nums w-24 text-right shrink-0" style={{ color: '#e8e6f0' }}>
                        {r.total.toLocaleString()} RWF
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Movies by Views */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Film size={15} style={{ color: '#e8c87a' }} />
                <span className="text-xs font-semibold" style={{ color: '#e8e6f0' }}>Top Agasobanuye by Views</span>
              </div>
              {!analytics.topMovies || analytics.topMovies.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: '#6a6a5a' }}>No movie view data</p>
              ) : (
                <div className="space-y-2">
                  {analytics.topMovies.map((m, i) => (
                    <div key={m.id} className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="tabular-nums font-semibold w-5 shrink-0" style={{ color: i < 3 ? '#e8c87a' : '#6a6a5a' }}>#{i + 1}</span>
                        <span className="truncate" style={{ color: '#e8e6f0' }}>{m.title}</span>
                        <span className="text-[11px] shrink-0" style={{ color: '#6a6a5a' }}>{m.genre}</span>
                      </div>
                      <span className="flex items-center gap-1 tabular-nums shrink-0" style={{ color: '#e8c87a' }}>
                        <Eye size={11} /> {(m.views || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Catalog by Genre */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Filter size={15} style={{ color: '#60a5fa' }} />
                <span className="text-xs font-semibold" style={{ color: '#e8e6f0' }}>Catalog Breakdown by Genre</span>
              </div>
              {!analytics.moviesByGenre || analytics.moviesByGenre.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: '#6a6a5a' }}>No genre breakdown available</p>
              ) : (
                <div className="space-y-2">
                  {analytics.moviesByGenre.map((g) => {
                    const maxCount = Math.max(...analytics.moviesByGenre.map((x) => x.count), 1);
                    const pct = Math.round((g.count / maxCount) * 100);
                    return (
                      <div key={g.genre} className="flex items-center gap-3 text-xs">
                        <span className="w-24 truncate shrink-0" style={{ color: '#b8b4a8' }}>{g.genre}</span>
                        <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#c9a84c' }} />
                        </div>
                        <span className="tabular-nums w-8 text-right shrink-0" style={{ color: '#e8e6f0' }}>{g.count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Requests */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Heart size={15} style={{ color: '#fbbf24' }} />
                <span className="text-xs font-semibold" style={{ color: '#e8e6f0' }}>Top Funded Requests</span>
              </div>
              {!analytics.topRequests || analytics.topRequests.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: '#6a6a5a' }}>No request data</p>
              ) : (
                <div className="space-y-2">
                  {analytics.topRequests.slice(0, 8).map((r, i) => (
                    <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="tabular-nums font-semibold w-5 shrink-0" style={{ color: i < 3 ? '#fbbf24' : '#6a6a5a' }}>#{i + 1}</span>
                        <span className="truncate" style={{ color: '#e8e6f0' }}>{r.title}</span>
                      </div>
                      <span className="tabular-nums shrink-0" style={{ color: '#22c55e' }}>
                        {(r.donation_total || 0).toLocaleString()} RWF · {r.votes || 0} votes
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Games & Transaction Status */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Package size={15} style={{ color: '#60a5fa' }} />
                  <span className="text-xs font-semibold" style={{ color: '#e8e6f0' }}>Top Games Revenue</span>
                </div>
                {!analytics.topGames || analytics.topGames.length === 0 ? (
                  <p className="text-xs text-center py-3" style={{ color: '#6a6a5a' }}>No game sales data yet</p>
                ) : (
                  <div className="space-y-2">
                    {analytics.topGames.slice(0, 5).map((g, i) => (
                      <div key={g.id} className="flex items-center justify-between text-xs">
                        <span className="truncate" style={{ color: '#e8e6f0' }}>#{i + 1} {g.title}</span>
                        <span className="tabular-nums shrink-0 ml-2" style={{ color: '#60a5fa' }}>{(g.revenue || 0).toLocaleString()} RWF</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-xs font-semibold mb-3" style={{ color: '#e8e6f0' }}>Transaction Status Breakdown</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(analytics.totalByStatus || {}).map(([status, count]) => {
                    const colors = { pending: '#fbbf24', completed: '#22c55e', cancelled: '#8e8a7e', refunded: '#f87171' };
                    return (
                      <div key={status} className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="text-[11px] capitalize" style={{ color: '#8e8a7e' }}>{status}</div>
                        <div className="text-sm font-semibold tabular-nums" style={{ color: colors[status] || '#e8e6f0' }}>{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="text-xs text-center py-8" style={{ color: '#6a6a5a' }}>Failed to load analytics</p>
      )}
    </div>
  );
}
