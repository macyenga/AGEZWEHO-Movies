import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Search, X, Film, Tv, Star, ArrowRight, Loader2, Inbox } from 'lucide-react';
import { searchTitles } from '../lib/movie-filters';
import { useLanguage } from '../contexts/LanguageContext';

export default function GlobalSearchInput({
  className = '',
  placeholder,
  inputId = 'global-search-input',
  onNavigate = null,
}) {
  const router = useRouter();
  const { t, tr } = useLanguage();
  const resolvedPlaceholder = placeholder || t.search.desktopPlaceholder;
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOpen(false);
  }, [router.asPath]);

  // Debounced live title search against /api/search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (!cancelled) {
          const movies = Array.isArray(data?.movies) ? data.movies : [];
          const ranked = searchTitles(movies, trimmed, 6);
          setResults(ranked.length > 0 ? ranked : movies.slice(0, 6));
          setOpen(true);
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    setOpen(false);
    if (typeof onNavigate === 'function') onNavigate();
    router.push(`/finder?q=${encodeURIComponent(trimmed)}`);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} role="search" aria-label={t.search.formAria}>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
          style={{
            background: focused ? 'rgba(20,20,32,0.95)' : 'rgba(255,255,255,0.04)',
            border: focused
              ? '1px solid rgba(201,168,76,0.5)'
              : '1px solid rgba(255,255,255,0.09)',
            boxShadow: focused ? '0 0 18px rgba(201,168,76,0.12)' : 'none',
          }}
        >
          <Search
            size={14}
            className="flex-shrink-0"
            style={{ color: focused ? '#c9a84c' : '#6a6a5a' }}
          />
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim()) setOpen(true);
            }}
            onFocus={() => {
              setFocused(true);
              if (query.trim()) setOpen(true);
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={resolvedPlaceholder}
            aria-label={t.search.inputAria}
            autoComplete="off"
            className="w-full min-w-0 bg-transparent outline-none text-xs text-stone-100 placeholder:text-stone-500 [&::-webkit-search-cancel-button]:hidden"
          />
          {loading ? (
            <Loader2 size={13} className="animate-spin flex-shrink-0 text-amber-400" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label={t.search.clearAria}
              className="flex-shrink-0 p-0.5 rounded text-stone-400 hover:text-stone-100 cursor-pointer"
            >
              <X size={13} />
            </button>
          ) : null}
        </div>
      </form>

      {/* Instant Live Results Dropdown */}
      {showDropdown && (
        <div
          id={`${inputId}-results`}
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-full mt-2 rounded-xl overflow-hidden z-[80]"
          style={{
            background: 'rgba(14,14,22,0.98)',
            border: '1px solid rgba(201,168,76,0.28)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
            backdropFilter: 'blur(20px)',
            minWidth: '280px',
          }}
        >
          <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between text-[10px]">
            <span className="uppercase tracking-wider font-semibold text-amber-400/90">
              {t.search.dropdownTitle}
            </span>
            <span className="text-stone-500">
              {loading
                ? t.search.searching
                : results.length === 1
                ? t.search.matchSingular
                : tr('search.matchPlural', { count: results.length })}
            </span>
          </div>

          {results.length > 0 ? (
            <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
              {results.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movies/${movie.id}`}
                  onClick={() => {
                    setOpen(false);
                    if (typeof onNavigate === 'function') onNavigate();
                  }}
                >
                  <div
                    role="option"
                    aria-selected="false"
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="w-9 h-12 rounded-md overflow-hidden flex-shrink-0 bg-stone-900 border border-white/10 flex items-center justify-center">
                      {movie.poster_url ? (
                        <img
                          src={movie.poster_url}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : movie.type === 'Series' ? (
                        <Tv size={14} className="text-sky-400/60" />
                      ) : (
                        <Film size={14} className="text-amber-400/60" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-100 truncate">
                        {movie.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-stone-400 flex-wrap">
                        <span
                          className="px-1.5 py-0.2 rounded font-semibold uppercase text-[9px]"
                          style={{
                            background:
                              movie.type === 'Series'
                                ? 'rgba(56,189,248,0.14)'
                                : 'rgba(201,168,76,0.14)',
                            color: movie.type === 'Series' ? '#7dd3fc' : '#e8c87a',
                          }}
                        >
                          {movie.type || 'Movie'}
                        </span>
                        {movie.year && <span>{movie.year}</span>}
                        {movie.genre && <span className="truncate">· {movie.genre}</span>}
                        {movie.rating && (
                          <span className="inline-flex items-center gap-0.5 text-amber-400">
                            <Star size={9} fill="currentColor" /> {movie.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : !loading ? (
            <div className="px-4 py-5 text-center space-y-2">
              <p className="text-xs text-stone-400">
                {tr('search.noMatch', { query: query.trim() })}
              </p>
              <Link
                href="/requests"
                onClick={() => {
                  setOpen(false);
                  if (typeof onNavigate === 'function') onNavigate();
                }}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 hover:text-amber-300"
              >
                <Inbox size={12} /> {t.search.requestTitle}
              </Link>
            </div>
          ) : null}

          <Link
            href={`/finder?q=${encodeURIComponent(query.trim())}`}
            onClick={() => {
              setOpen(false);
              if (typeof onNavigate === 'function') onNavigate();
            }}
            className="flex items-center justify-between px-3 py-2.5 text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/15 text-amber-300 border-t border-white/10 transition-colors"
          >
            <span className="truncate">{tr('search.searchAllResults', { query: query.trim() })}</span>
            <ArrowRight size={13} className="flex-shrink-0" />
          </Link>
        </div>
      )}
    </div>
  );
}
