import { Search, SlidersHorizontal, Calendar, Star, X, RotateCcw } from 'lucide-react';
import { MOVIE_CATEGORIES, RATING_FILTER_OPTIONS } from '../lib/movie-filters';
import { useLanguage } from '../contexts/LanguageContext';
import { getCategoryLabel } from '../lib/i18n';

export default function MovieSearchFilter({
  query = '',
  onQueryChange = () => {},
  genre = 'All',
  onGenreChange = () => {},
  year = 'All',
  onYearChange = () => {},
  minRating = 'All',
  onMinRatingChange = () => {},
  availableYears = [],
  categories = MOVIE_CATEGORIES,
  onReset = () => {},
  hasActiveFilters = false,
}) {
  const { language, t, tr } = useLanguage();
  const mf = t.homeSections.movieFilter;

  const activeGenreValue = genre || 'All';
  const activeYearValue = year || 'All';
  const activeRatingValue = minRating || 'All';

  return (
    <div
      data-testid="movie-search-filter"
      className="mb-4 p-3.5 sm:p-4 rounded-xl"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          hasActiveFilters
            ? 'lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))_auto]'
            : 'lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]'
        } gap-3 items-end`}
      >
        {/* Search Input */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label
            htmlFor="movie-filter-search"
            className="flex items-center gap-1.5 text-[11px] font-medium mb-1.5"
            style={{ color: 'var(--text2)' }}
          >
            <Search size={12} style={{ color: 'var(--gold)' }} />
            <span>{mf.searchLabel}</span>
          </label>
          <div className="relative">
            <input
              id="movie-filter-search"
              data-testid="filter-search-input"
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={mf.searchPlaceholder}
              className="input-dark w-full h-10 pl-3 pr-8 rounded-lg text-xs"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                aria-label={t.search.clearAria}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition-colors"
                style={{ color: 'var(--muted)' }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Genre Filter */}
        <div>
          <label
            htmlFor="movie-filter-genre"
            className="flex items-center gap-1.5 text-[11px] font-medium mb-1.5"
            style={{ color: 'var(--text2)' }}
          >
            <SlidersHorizontal size={12} style={{ color: 'var(--gold)' }} />
            <span>{mf.genreLabel}</span>
          </label>
          <select
            id="movie-filter-genre"
            data-testid="filter-genre-select"
            value={activeGenreValue}
            onChange={(e) => onGenreChange(e.target.value)}
            className="input-dark w-full h-10 px-3 rounded-lg text-xs cursor-pointer"
          >
            <option value="All">{mf.allGenres}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {getCategoryLabel(cat, language)}
              </option>
            ))}
          </select>
        </div>

        {/* Release Year Filter */}
        <div>
          <label
            htmlFor="movie-filter-year"
            className="flex items-center gap-1.5 text-[11px] font-medium mb-1.5"
            style={{ color: 'var(--text2)' }}
          >
            <Calendar size={12} style={{ color: 'var(--gold)' }} />
            <span>{mf.yearLabel}</span>
          </label>
          <select
            id="movie-filter-year"
            data-testid="filter-year-select"
            value={activeYearValue}
            onChange={(e) => onYearChange(e.target.value)}
            className="input-dark w-full h-10 px-3 rounded-lg text-xs cursor-pointer tabular-nums"
          >
            <option value="All">{mf.allYears}</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Minimum Rating Filter */}
        <div>
          <label
            htmlFor="movie-filter-rating"
            className="flex items-center gap-1.5 text-[11px] font-medium mb-1.5"
            style={{ color: 'var(--text2)' }}
          >
            <Star size={12} style={{ color: 'var(--gold)' }} />
            <span>{mf.ratingLabel}</span>
          </label>
          <select
            id="movie-filter-rating"
            data-testid="filter-rating-select"
            value={activeRatingValue}
            onChange={(e) => onMinRatingChange(e.target.value)}
            className="input-dark w-full h-10 px-3 rounded-lg text-xs cursor-pointer tabular-nums"
          >
            <option value="All">{mf.anyRating}</option>
            {RATING_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {tr('homeSections.movieFilter.starsAndUp', { stars: opt.value })}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            data-testid="filter-reset-btn"
            className="h-10 px-3.5 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            style={{
              background: 'var(--accent-bg)',
              border: '1px solid var(--accent-border)',
              color: 'var(--gold2)',
            }}
          >
            <RotateCcw size={12} />
            <span>{mf.clearFilters}</span>
          </button>
        )}
      </div>
    </div>
  );
}
