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
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Platform Analytics</h2>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Revenue, catalog viewership, genres, and transaction status counts</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChangePeriod(p)}
              className="px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors whitespace-nowrap"
              style={period === p
                ? { background: 'var(--accent-bg)', color: 'var(--gold2)' }
                : { color: 'var(--muted)' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={22} style={{ color: 'var(--gold)' }} className="animate-spin" />
        </div>
      ) : analytics ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Revenue', value: `${(analytics.totalRevenue || 0).toLocaleString()} RWF`, color: 'var(--warn)' },
              { label: 'Game Sales', value: `${(analytics.gameSalesTotal || 0).toLocaleString()} RWF`, color: 'var(--blue)' },
              { label: 'Total Movie Views', value: (analytics.totalViews || 0).toLocaleString(), color: 'var(--gold2)' },
              { label: 'Total Transactions', value: (analytics.totalTransactions || 0).toLocaleString(), color: 'var(--green)' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
              >
                <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{stat.label}</div>
                <div className="text-lg font-semibold tabular-nums" style={{ color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={15} style={{ color: 'var(--gold)' }} />
              <span className="text-xs font-semibold capitalize" style={{ color: 'var(--text)' }}>
                Revenue Trend ({period})
              </span>
            </div>
            {!analytics.revenueByPeriod || analytics.revenueByPeriod.length === 0 ? (
              <p className="text-xs text-center py-6" style={{ color: 'var(--muted)' }}>No completed transaction revenue in this period yet</p>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {analytics.revenueByPeriod.slice().reverse().map((r) => {
                  const maxRevenue = Math.max(...analytics.revenueByPeriod.map((x) => x.total), 1);
                  const pct = (r.total / maxRevenue) * 100;
                  return (
                    <div key={r.date} className="flex items-center gap-3">
                      <span className="text-xs tabular-nums w-24 shrink-0" style={{ color: 'var(--muted)' }}>{r.date}</span>
                      <div className="flex-1 h-4 rounded relative overflow-hidden" style={{ background: 'var(--bg4)' }}>
                        <div
                          className="h-full rounded absolute left-0 top-0"
                          style={{
                            width: `${Math.max(pct, 2)}%`,
                            background: r.donations > r.gameSales ? 'var(--green)' : 'var(--blue)',
                          }}
                        />
                      </div>
                      <span className="text-xs tabular-nums w-24 text-right shrink-0" style={{ color: 'var(--text)' }}>
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
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Film size={15} style={{ color: 'var(--gold2)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Top Agasobanuye by Views</span>
              </div>
              {!analytics.topMovies || analytics.topMovies.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: 'var(--muted)' }}>No movie view data</p>
              ) : (
                <div className="space-y-2">
                  {analytics.topMovies.map((m, i) => (
                    <div key={m.id} className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="tabular-nums font-semibold w-5 shrink-0" style={{ color: i < 3 ? 'var(--gold2)' : 'var(--muted)' }}>#{i + 1}</span>
                        <span className="truncate" style={{ color: 'var(--text)' }}>{m.title}</span>
                        <span className="text-[11px] shrink-0" style={{ color: 'var(--muted)' }}>{m.genre}</span>
                      </div>
                      <span className="flex items-center gap-1 tabular-nums shrink-0" style={{ color: 'var(--gold2)' }}>
                        <Eye size={11} /> {(m.views || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Catalog by Genre */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Filter size={15} style={{ color: 'var(--blue)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Catalog Breakdown by Genre</span>
              </div>
              {!analytics.moviesByGenre || analytics.moviesByGenre.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: 'var(--muted)' }}>No genre breakdown available</p>
              ) : (
                <div className="space-y-2">
                  {analytics.moviesByGenre.map((g) => {
                    const maxCount = Math.max(...analytics.moviesByGenre.map((x) => x.count), 1);
                    const pct = Math.round((g.count / maxCount) * 100);
                    return (
                      <div key={g.genre} className="flex items-center gap-3 text-xs">
                        <span className="w-24 truncate shrink-0" style={{ color: 'var(--text2)' }}>{g.genre}</span>
                        <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg4)' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--gold)' }} />
                        </div>
                        <span className="tabular-nums w-8 text-right shrink-0" style={{ color: 'var(--text)' }}>{g.count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Requests */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Heart size={15} style={{ color: 'var(--warn)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Top Funded Requests</span>
              </div>
              {!analytics.topRequests || analytics.topRequests.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: 'var(--muted)' }}>No request data</p>
              ) : (
                <div className="space-y-2">
                  {analytics.topRequests.slice(0, 8).map((r, i) => (
                    <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="tabular-nums font-semibold w-5 shrink-0" style={{ color: i < 3 ? 'var(--warn)' : 'var(--muted)' }}>#{i + 1}</span>
                        <span className="truncate" style={{ color: 'var(--text)' }}>{r.title}</span>
                      </div>
                      <span className="tabular-nums shrink-0" style={{ color: 'var(--green)' }}>
                        {(r.donation_total || 0).toLocaleString()} RWF · {r.votes || 0} votes
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Games & Transaction Status */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Package size={15} style={{ color: 'var(--blue)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Top Games Revenue</span>
                </div>
                {!analytics.topGames || analytics.topGames.length === 0 ? (
                  <p className="text-xs text-center py-3" style={{ color: 'var(--muted)' }}>No game sales data yet</p>
                ) : (
                  <div className="space-y-2">
                    {analytics.topGames.slice(0, 5).map((g, i) => (
                      <div key={g.id} className="flex items-center justify-between text-xs">
                        <span className="truncate" style={{ color: 'var(--text)' }}>#{i + 1} {g.title}</span>
                        <span className="tabular-nums shrink-0 ml-2" style={{ color: 'var(--blue)' }}>{(g.revenue || 0).toLocaleString()} RWF</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text)' }}>Transaction Status Breakdown</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(analytics.totalByStatus || {}).map(([status, count]) => {
                    const colors = { pending: 'var(--warn)', completed: 'var(--green)', cancelled: 'var(--muted)', refunded: 'var(--danger)' };
                    return (
                      <div key={status} className="p-2.5 rounded-lg" style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border)' }}>
                        <div className="text-[11px] capitalize" style={{ color: 'var(--muted)' }}>{status}</div>
                        <div className="text-sm font-semibold tabular-nums" style={{ color: colors[status] || 'var(--text)' }}>{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="text-xs text-center py-8" style={{ color: 'var(--muted)' }}>Failed to load analytics</p>
      )}
    </div>
  );
}
