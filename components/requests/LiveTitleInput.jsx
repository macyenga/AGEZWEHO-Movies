import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Film,
  Tv,
  Sparkles,
  BookOpen,
  Loader2,
  X,
  CheckCircle2,
  Clock,
  ChevronUp,
  ArrowUpRight,
  Search,
} from 'lucide-react';

function TypeIcon({ type, size = 14 }) {
  if (type === 'Series') return <Tv size={size} />;
  if (type === 'Anime') return <Sparkles size={size} />;
  if (type === 'Documentary') return <BookOpen size={size} />;
  return <Film size={size} />;
}

export default function LiveTitleInput({
  id = 'request-title-input',
  value,
  mediaType = 'All',
  onChange,
  onSelectSuggestion,
  onVoteExisting,
  selectedMeta = null,
  onClearMeta,
  error = '',
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [failedImages, setFailedImages] = useState({});

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    const q = String(value || '').trim();
    if (q.length < 2) {
      if (abortRef.current) abortRef.current.abort();
      setSuggestions([]);
      setSearching(false);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    // Skip immediate re-query if the input exactly matches the currently selected item
    if (selectedMeta && selectedMeta.title && selectedMeta.title.toLowerCase() === q.toLowerCase()) {
      return;
    }

    const timer = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setSearching(true);

      try {
        const params = new URLSearchParams({
          q,
          type: mediaType || 'All',
        });
        const res = await fetch(`/api/requests/lookup-title?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!controller.signal.aborted && res.ok) {
          const list = Array.isArray(data.suggestions) ? data.suggestions : [];
          setSuggestions(list);
          setOpen(true);
          setActiveIndex(list.length > 0 ? 0 : -1);
        }
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 220);

    return () => {
      clearTimeout(timer);
    };
  }, [value, mediaType, selectedMeta]);

  const pickSuggestion = async (item) => {
    setOpen(false);
    setActiveIndex(-1);
    onSelectSuggestion(item);

    // Enrich missing language/overview from OMDb detail endpoint if imdb_id is available
    if (item.imdb_id && (!item.language || !item.overview)) {
      try {
        const res = await fetch(`/api/requests/lookup-title?imdbId=${encodeURIComponent(item.imdb_id)}`);
        if (res.ok) {
          const { detail } = await res.json();
          if (detail) {
            onSelectSuggestion({
              ...item,
              year: detail.year || item.year,
              type: detail.type || item.type,
              language: detail.language || item.language,
              poster_url: detail.poster_url || item.poster_url,
              overview: detail.overview || item.overview,
            });
          }
        }
      } catch {
        // Keep base selection
      }
    }
  };

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) {
      if (e.key === 'Escape') setOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && suggestions[activeIndex]) {
      e.preventDefault();
      pickSuggestion(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <label
          htmlFor={id}
          className="block text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--muted)' }}
        >
          Movie / Series Title <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <span className="text-[11px]" style={{ color: 'var(--dim)' }}>
          Live catalog &amp; title lookup
        </span>
      </div>

      <div className="relative flex items-center">
        <span
          className="absolute left-3 pointer-events-none flex items-center"
          style={{ color: searching ? 'var(--gold)' : 'var(--muted)' }}
        >
          {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
        </span>
        <input
          ref={inputRef}
          id={id}
          data-testid="request-title-input"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          aria-activedescendant={
            open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
          }
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (selectedMeta && onClearMeta) onClearMeta();
          }}
          onFocus={() => {
            if (suggestions.length > 0 && String(value || '').trim().length >= 2) {
              setOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search or enter movie / series title..."
          className={`input-dark w-full pl-9 pr-9 py-2.5 rounded-xl text-sm ${
            error ? 'border-red-500/60' : ''
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              if (onClearMeta) onClearMeta();
              setSuggestions([]);
              setOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Clear movie or series title"
            className="absolute right-2.5 p-1 rounded-md transition-colors cursor-pointer"
            style={{ color: 'var(--muted)' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}

      {/* Selected title preview */}
      {selectedMeta && (
        <div
          data-testid="selected-title-preview"
          className="mt-2.5 flex items-center gap-3 p-2.5 rounded-xl"
          style={{
            background: 'var(--bg-card-subtle)',
            border: '1px solid var(--accent-border)',
          }}
        >
          <div
            className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ background: 'var(--bg-ghost)', border: '1px solid var(--border)' }}
          >
            {selectedMeta.poster_url && !failedImages[selectedMeta.id] ? (
              <img
                src={selectedMeta.poster_url}
                alt={selectedMeta.title}
                referrerPolicy="no-referrer"
                onError={() =>
                  setFailedImages((prev) => ({ ...prev, [selectedMeta.id]: true }))
                }
                className="w-full h-full object-cover"
              />
            ) : (
              <span style={{ color: 'var(--gold)' }}>
                <TypeIcon type={selectedMeta.type} size={16} />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
              {selectedMeta.title}
            </div>
            <div className="text-[11px] mt-0.5 flex items-center gap-1.5 flex-wrap" style={{ color: 'var(--muted)' }}>
              <span>{selectedMeta.type || 'Movie'}</span>
              {selectedMeta.year && (
                <>
                  <span>·</span>
                  <span className="tabular-nums">{selectedMeta.year}</span>
                </>
              )}
              {selectedMeta.language && (
                <>
                  <span>·</span>
                  <span>{selectedMeta.language}</span>
                </>
              )}
            </div>
          </div>
          {onClearMeta && (
            <button
              type="button"
              onClick={onClearMeta}
              aria-label="Remove matched title details"
              className="p-1.5 rounded-lg text-xs cursor-pointer"
              style={{ color: 'var(--muted)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Live dropdown */}
      {open && (
        <div
          id={`${id}-listbox`}
          role="listbox"
          data-testid="live-title-suggestions"
          className="absolute left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-40 max-h-80 overflow-y-auto"
          style={{
            background: 'var(--bg-dropdown)',
            border: '1px solid var(--border2)',
            boxShadow: 'var(--shadow-card)',
            backdropFilter: 'blur(18px)',
          }}
        >
          {suggestions.length === 0 ? (
            <div className="px-4 py-3.5 text-xs" style={{ color: 'var(--muted)' }}>
              {searching
                ? 'Searching movies and series...'
                : `No instant match for "${value}". Continue filling Year & Language below to submit it.`}
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {suggestions.map((item, idx) => {
                const isActive = idx === activeIndex;
                const isAvailable = item.catalogMatch?.status === 'available';
                const isComingSoon = item.catalogMatch?.status === 'coming_soon';
                const hasPendingReq = item.existingRequest && !item.existingRequest.fulfilled;

                return (
                  <div
                    key={item.id || `${item.title}-${idx}`}
                    id={`${id}-option-${idx}`}
                    role="option"
                    aria-selected={isActive}
                    className="flex items-center gap-3 px-3.5 py-2.5 transition-colors"
                    style={{
                      background: isActive ? 'var(--accent-bg)' : 'transparent',
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <button
                      type="button"
                      onClick={() => pickSuggestion(item)}
                      className="flex-1 min-w-0 flex items-center gap-3 text-left cursor-pointer"
                    >
                      <div
                        className="w-9 h-12 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center"
                        style={{
                          background: 'var(--bg-ghost)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {item.poster_url && !failedImages[item.id] ? (
                          <img
                            src={item.poster_url}
                            alt=""
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedImages((prev) => ({ ...prev, [item.id]: true }))
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span style={{ color: 'var(--gold)' }}>
                            <TypeIcon type={item.type} size={15} />
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-semibold truncate"
                          style={{ color: 'var(--text)' }}
                        >
                          {item.title}
                        </div>
                        <div
                          className="text-[11px] mt-0.5 flex items-center gap-1.5 flex-wrap"
                          style={{ color: 'var(--muted)' }}
                        >
                          <span style={{ color: 'var(--gold2)' }}>{item.type}</span>
                          {item.year && (
                            <>
                              <span>·</span>
                              <span className="tabular-nums">{item.year}</span>
                            </>
                          )}
                          {item.language && (
                            <>
                              <span>·</span>
                              <span className="truncate max-w-[140px]">{item.language}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isAvailable && (
                        <Link
                          href={item.catalogMatch.watchUrl}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap"
                          style={{
                            background: 'var(--green-bg)',
                            border: '1px solid var(--green-border)',
                            color: 'var(--green)',
                          }}
                        >
                          <CheckCircle2 size={12} />
                          Watch Now
                          <ArrowUpRight size={11} />
                        </Link>
                      )}

                      {!isAvailable && isComingSoon && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap"
                          style={{
                            background: 'var(--blue-bg)',
                            border: '1px solid var(--blue-border)',
                            color: 'var(--blue)',
                          }}
                        >
                          <Clock size={11} />
                          Coming {item.catalogMatch.releaseDate || 'Soon'}
                        </span>
                      )}

                      {!isAvailable && hasPendingReq && onVoteExisting && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            onVoteExisting(item.existingRequest.id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap cursor-pointer"
                          style={{
                            background: 'var(--accent-bg)',
                            border: '1px solid var(--accent-border)',
                            color: 'var(--gold2)',
                          }}
                        >
                          <ChevronUp size={12} />
                          <span className="tabular-nums">{item.existingRequest.votes}</span>
                          <span>Boost</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
