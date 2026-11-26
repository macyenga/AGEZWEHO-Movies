import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Subtitles,
  Download,
  Languages,
  Search,
  ArrowUpRight,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  parseSubtitleCues,
  formatCuesToSrt,
  resolveMovieSubtitleAction,
} from '../lib/subtitles';

const GOLD_LIGHT = 'var(--gold2)';
const MUTED = 'var(--muted)';

function saveBlob(content, filename) {
  const blob = new Blob([content], { type: 'application/x-subrip;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function LatestSubtitlesSection({ movies = [] }) {
  const [tab, setTab] = useState('latest');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [savedId, setSavedId] = useState(null);

  const catalogSubtitleMovies = (Array.isArray(movies) ? movies : []).filter(
    (m) => Array.isArray(m?.subtitles) && m.subtitles.length > 0
  );

  const fetchOfficial = useCallback(async (searchText = '') => {
    setLoading(true);
    setError('');
    try {
      const q = String(searchText || '').trim();
      const params = new URLSearchParams({ lang: 'eng' });
      if (q) {
        params.set('q', q);
      } else {
        params.set('latest', '1');
      }
      const res = await fetch(`/api/subtitles/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not load official subtitles');
      setItems(Array.isArray(data.items) ? data.items.slice(0, 6) : []);
    } catch (err) {
      setError(err?.message || 'Unable to reach official subtitle feed.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOfficial('');
  }, [fetchOfficial]);

  const handleCatalogSrtDownload = async (movie) => {
    const info = resolveMovieSubtitleAction(movie);
    if (!info.preferredTrack?.url) return;
    setDownloadingId(movie.id);
    try {
      const res = await fetch(info.preferredTrack.url);
      const raw = await res.text();
      const cues = parseSubtitleCues(raw);
      const srt = cues.length > 0 ? formatCuesToSrt(cues) : raw;
      saveBlob(srt, info.directDownloadFilename);
      setSavedId(movie.id);
      setTimeout(() => setSavedId((curr) => (curr === movie.id ? null : curr)), 2200);
    } catch {
      window.location.assign(info.studioHref);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section
      id="subtitles-showcase"
      data-testid="latest-subtitles-section"
      aria-label="Latest Official and Kinyarwanda Subtitles"
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14"
    >
      {/* Header */}
      <div
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3.5 mb-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Subtitles size={17} style={{ color: GOLD_LIGHT }} />
            <h2
              className="font-cinzel text-lg sm:text-xl font-bold tracking-wide"
              style={{ fontFamily: 'Cinzel, serif', color: 'var(--text)' }}
            >
              Subtitles & Kinyarwanda (.SRT / .VTT)
            </h2>
          </div>
          <p className="text-xs sm:text-sm" style={{ color: MUTED }}>
            Download the latest official movie subtitles or translate dialogue cues into Kinyarwanda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Interactive Tab Switcher */}
          <div
            className="inline-flex items-center gap-1 p-1 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <button
              type="button"
              onClick={() => setTab('latest')}
              data-testid="subtitles-tab-latest"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
              style={
                tab === 'latest'
                  ? { background: 'var(--accent-bg)', color: GOLD_LIGHT }
                  : { color: MUTED }
              }
            >
              Latest Official
            </button>
            <button
              type="button"
              onClick={() => setTab('catalog')}
              data-testid="subtitles-tab-catalog"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
              style={
                tab === 'catalog'
                  ? { background: 'var(--accent-bg)', color: GOLD_LIGHT }
                  : { color: MUTED }
              }
            >
              Catalog RW Tracks ({catalogSubtitleMovies.length})
            </button>
          </div>

          <Link
            href="/subtitles"
            data-testid="home-subtitles-studio-cta"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-transform hover:-translate-y-0.5"
            style={{
              background: 'var(--gold2)',
              color: 'var(--accent-ink)',
            }}
          >
            <span>Open Subtitle Studio</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {/* Inline Official Subtitle Search Strip */}
      {tab === 'latest' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchOfficial(query);
          }}
          className="flex flex-col sm:flex-row gap-2.5 mb-5"
        >
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: MUTED }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find official subtitles by movie or series title..."
              aria-label="Find official subtitles by title"
              className="input-dark w-full pl-9 pr-4 py-2.5 rounded-xl text-xs sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap"
            style={{
              background: 'var(--accent-bg)',
              border: '1px solid var(--accent-border)',
              color: GOLD_LIGHT,
            }}
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            <span>Search Subtitles</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              fetchOfficial('');
            }}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer whitespace-nowrap"
            style={{
              background: 'var(--bg-ghost)',
              border: '1px solid var(--border)',
              color: 'var(--text2)',
            }}
          >
            <RefreshCw size={12} />
            <span>Latest</span>
          </button>
        </form>
      )}

      {/* Tab Content */}
      {tab === 'latest' ? (
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="status" aria-label="Loading official subtitles">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl space-y-3"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="shimmer h-4 w-3/4 rounded" />
                <div className="shimmer h-3 w-1/2 rounded" />
                <div className="flex gap-2 pt-2">
                  <div className="shimmer h-8 flex-1 rounded-lg" />
                  <div className="shimmer h-8 w-28 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className="p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text2)' }}
          >
            <span>{error}</span>
            <Link href="/subtitles" className="font-semibold underline" style={{ color: GOLD_LIGHT }}>
              Open Subtitle Studio
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div
            className="p-6 rounded-2xl text-center space-y-2 text-xs"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: MUTED }}
          >
            <p>No official subtitle releases matched that title.</p>
            <Link href={`/subtitles?q=${encodeURIComponent(query)}`} className="inline-block font-semibold underline" style={{ color: GOLD_LIGHT }}>
              Upload or translate in Subtitle Studio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const downloadHref = `/api/subtitles/download?url=${encodeURIComponent(
                item.downloadUrl
              )}&filename=${encodeURIComponent(item.fileName || item.movieName)}&format=srt`;
              const studioHref = `/subtitles?q=${encodeURIComponent(item.movieName || '')}`;

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -2 }}
                  data-testid={`home-subtitle-card-${item.id}`}
                  className="p-4 rounded-2xl flex flex-col justify-between gap-3 transition-colors hover:border-[var(--border2)]"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                      {item.movieName}
                      {item.year ? ` (${item.year})` : ''}
                    </div>
                    <div className="text-[11px] truncate" style={{ color: 'var(--text2)' }}>
                      {item.fileName}
                    </div>
                    <div className="text-[11px] tabular-nums" style={{ color: MUTED }}>
                      {item.language} · {item.format.toUpperCase()} · {item.downloadsCount.toLocaleString()} downloads
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={downloadHref}
                      data-testid={`home-subtitle-download-${item.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-opacity hover:opacity-85"
                      style={{
                        background: 'var(--green-bg)',
                        border: '1px solid var(--green-border)',
                        color: 'var(--green)',
                      }}
                    >
                      <Download size={12} />
                      <span>Download .SRT</span>
                    </a>
                    <Link
                      href={studioHref}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-opacity hover:opacity-85"
                      style={{
                        background: 'var(--accent-bg)',
                        border: '1px solid var(--accent-border)',
                        color: GOLD_LIGHT,
                      }}
                    >
                      <Languages size={12} />
                      <span>RW Studio</span>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalogSubtitleMovies.slice(0, 6).map((movie) => {
            const info = resolveMovieSubtitleAction(movie);
            const isBusy = downloadingId === movie.id;
            const isSaved = savedId === movie.id;

            return (
              <div
                key={movie.id}
                className="p-4 rounded-2xl flex flex-col justify-between gap-3"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="space-y-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                    {movie.title}
                  </div>
                  <div className="text-[11px] tabular-nums" style={{ color: MUTED }}>
                    {info.tracks.map((tr) => tr.language || tr.label).join(' · ')} · {movie.year || '2026'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCatalogSrtDownload(movie)}
                    disabled={isBusy}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
                    style={{
                      background: 'var(--green-bg)',
                      border: '1px solid var(--green-border)',
                      color: 'var(--green)',
                    }}
                  >
                    {isBusy ? <Loader2 size={12} className="animate-spin" /> : isSaved ? <Check size={12} /> : <Download size={12} />}
                    <span>{isSaved ? 'Saved .SRT' : 'Download .SRT'}</span>
                  </button>
                  <Link
                    href={info.detailSubtitlesHref}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap"
                    style={{
                      background: 'var(--accent-bg)',
                      border: '1px solid var(--accent-border)',
                      color: GOLD_LIGHT,
                    }}
                  >
                    <Languages size={12} />
                    <span>Open</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
