export default function MovieSkeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      data-testid="movie-skeleton-card"
      className={`h-full relative ${className}`}
    >
      <div
        className="movie-card relative rounded-xl overflow-hidden flex flex-col h-full"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Poster placeholder */}
        <div className="relative aspect-[2/3] overflow-hidden shimmer">
          <div
            className="absolute top-2 left-2 w-8 h-8 rounded-full shimmer"
            style={{ border: '1px solid var(--border-subtle)' }}
          />
          <div className="absolute top-2.5 right-2.5 w-14 h-4 rounded shimmer" />
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
            <div className="h-2.5 w-16 rounded shimmer" />
            <div className="h-2.5 w-6 rounded shimmer" />
          </div>
        </div>

        {/* Title & metadata placeholders */}
        <div className="px-3 pt-3 pb-2 space-y-2 flex-1">
          <div className="shimmer h-3.5 rounded w-4/5" />
          <div className="shimmer h-2.5 rounded w-3/5" />
          <div className="shimmer h-2 rounded w-2/5" />
        </div>

        {/* Rating & action footer placeholders */}
        <div
          className="px-2.5 sm:px-3 pb-2.5 pt-2 space-y-2"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="shimmer h-3 rounded w-20" />
            <div className="shimmer h-3 rounded w-9" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="shimmer h-7 rounded-lg flex-1" />
            <div className="shimmer h-7 rounded-lg w-14" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="shimmer h-7 rounded-lg flex-1" />
            <div className="shimmer h-7 rounded-lg w-7" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MovieGridSkeleton({
  count = 12,
  className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8',
}) {
  const safeCount = Math.max(1, Math.min(24, Number(count) || 12));

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading movies"
      data-testid="movie-grid-skeleton"
      className={className}
    >
      <span className="sr-only">Loading movies...</span>
      {Array.from({ length: safeCount }).map((_, idx) => (
        <MovieSkeleton key={idx} />
      ))}
    </div>
  );
}
