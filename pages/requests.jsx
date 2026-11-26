import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { loadLiveRequests } from './api/requests/index';
import {
  REQUEST_TYPES,
  REQUEST_SOURCES,
  validateRequestPayload,
  filterRequests,
} from '../lib/requests-helpers';
import CinematicBackground from '../components/CinematicBackground';
import AdBanner from '../components/ads/AdBanner';
import SearchBar from '../components/SearchBar';
import SEOHead from '../components/SEOHead';
import LiveTitleInput from '../components/requests/LiveTitleInput';
import UnifiedPaymentFlow from '../components/UnifiedPaymentFlow';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Star,
  ChevronUp,
  Send,
  CheckCircle2,
  Smartphone,
  Loader2,
  Crown,
  Inbox,
  TrendingUp,
  RefreshCw,
  Film,
  Tv,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  X,
} from 'lucide-react';

function MediaTypeIcon({ type, size = 12 }) {
  if (type === 'Series') return <Tv size={size} />;
  if (type === 'Anime') return <Sparkles size={size} />;
  if (type === 'Documentary') return <BookOpen size={size} />;
  return <Film size={size} />;
}

export default function Requests({ requests: initial, updatedAt: initialUpdatedAt }) {
  const router = useRouter();
  const { t } = useLanguage();
  const { isPro } = useAuth();

  const [requests, setRequests] = useState(initial || []);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [form, setForm] = useState({
    title: '',
    type: 'Movie',
    year: '',
    language: '',
    source: '',
    requested_by: '',
    note: '',
    poster_url: '',
    imdb_id: '',
  });
  const [selectedMeta, setSelectedMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(initialUpdatedAt || '');
  const [voted, setVoted] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [highlightedId, setHighlightedId] = useState(null);
  const [donateModal, setDonateModal] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [voteAmount, setVoteAmount] = useState(100);
  const voteBoost = Math.max(1, Math.floor(voteAmount / 50));

  const queryTitleAppliedRef = useRef('');

  const fetchLiveBoard = useCallback(async ({ silent = true } = {}) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch('/api/requests');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.requests)) {
        setRequests(data.requests);
      }
      if (data.updatedAt) {
        setLastSyncedAt(data.updatedAt);
      }
    } catch {
      // Keep current list on transient network error
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, []);

  // Pre-fill title when linked from /movies/[id] or ?title=
  useEffect(() => {
    if (!router.isReady) return;
    const rawTitle = typeof router.query.title === 'string' ? router.query.title.trim() : '';
    const rawType = typeof router.query.type === 'string' ? router.query.type.trim() : '';
    if (rawTitle && queryTitleAppliedRef.current !== rawTitle) {
      queryTitleAppliedRef.current = rawTitle;
      setForm((prev) => ({
        ...prev,
        title: rawTitle,
        type: REQUEST_TYPES.includes(rawType) ? rawType : prev.type,
      }));
    }
  }, [router.isReady, router.query.title, router.query.type]);

  // Initial sync + live background polling + Supabase Realtime when active
  useEffect(() => {
    fetchLiveBoard({ silent: true });

    const interval = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        fetchLiveBoard({ silent: true });
      }
    }, 10000);

    let channel;
    if (typeof supabase?.channel === 'function') {
      channel = supabase
        .channel('requests-live-board')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
          fetchLiveBoard({ silent: true });
        })
        .subscribe();
    }

    return () => {
      clearInterval(interval);
      if (channel && typeof supabase?.removeChannel === 'function') {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchLiveBoard]);

  const filtered = filterRequests(requests, { query, typeFilter });
  const pending = filtered.filter((r) => !r.fulfilled);
  const fulfilled = filtered.filter((r) => r.fulfilled);

  const totalPending = requests.filter((r) => !r.fulfilled).length;
  const totalFulfilled = requests.filter((r) => r.fulfilled).length;
  const totalVotes = requests.reduce((s, r) => s + (Number(r.votes) || 0), 0);

  const focusExistingRequest = (requestId) => {
    const match = requests.find((r) => r.id === requestId);
    if (!match) return;
    setHighlightedId(requestId);
    setTypeFilter('All');
    setQuery('');
    if (!isPro) {
      setDonateModal(match);
      setVoteAmount(100);
    }
    setTimeout(() => setHighlightedId(null), 4000);
  };

  const handleVote = (req) => {
    if (voted[req.id]) return;
    setDonateModal(req);
    setVoteAmount(100);
  };

  const handleProVote = async (req) => {
    if (voted[req.id]) return;
    setProcessing(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/requests/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: req.id, skipPayment: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVoted((prev) => ({ ...prev, [req.id]: true }));
      setRequests((prev) => prev.map((r) => (r.id === data.request.id ? { ...r, ...data.request } : r)));
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    setSelectedMeta(item);
    setForm((f) => ({
      ...f,
      title: item.title || f.title,
      type: REQUEST_TYPES.includes(item.type) ? item.type : f.type,
      year: item.year || f.year,
      language: item.language || f.language || 'Kinyarwanda',
      poster_url: item.poster_url || f.poster_url,
      imdb_id: item.imdb_id || f.imdb_id,
    }));
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const validation = validateRequestPayload(form);
    setErrors(validation.errors);
    if (!validation.valid) return;

    setLoading(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.status === 409 && data.duplicate) {
        setErrors({ submit: data.error });
        focusExistingRequest(data.duplicate.id);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Could not submit request');
      }

      if (data.request) {
        setRequests((prev) => [data.request, ...prev.filter((r) => r.id !== data.request.id)]);
      } else {
        await fetchLiveBoard({ silent: true });
      }

      setForm({
        title: '',
        type: 'Movie',
        year: '',
        language: '',
        source: '',
        requested_by: '',
        note: '',
        poster_url: '',
        imdb_id: '',
      });
      setSelectedMeta(null);
      setErrors({});
      setSuccessMessage('Request added to the live queue! Viewers can now upvote it.');
      setLastSyncedAt(new Date().toISOString());
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const formattedSyncTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Live';

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Live Movie & Series Requests — Agasobanuye.rw"
        description="Search live movie and series titles, check if they are already on Agasobanuye.rw, and submit or upvote requests for Rocky 2026, Sankara, Junior Giti, and series."
        keywords="agasobanuye request, live movie request, series request, agasobanuye rocky 2026, agasobanuye sankara 2026, movie requests Rwanda, Kinyarwanda movies"
        canonical="https://agasobanuye.rw/requests"
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-28 md:pt-24 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'var(--accent-bg)',
                  border: '1px solid var(--accent-border)',
                  color: 'var(--gold)',
                }}
              >
                <Inbox size={20} />
              </div>
              <div>
                <h1
                  className="font-cinzel font-bold text-xl sm:text-2xl"
                  style={{ fontFamily: 'Cinzel, serif', color: 'var(--text)' }}
                >
                  {t?.pages?.requests?.heading || 'Movie & Series Requests'}
                </h1>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Search live titles, avoid duplicates, and upvote what gets added next
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchLiveBoard({ silent: false })}
              disabled={refreshing}
              aria-label="Refresh live requests"
              className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              <span className="tabular-nums">Updated {formattedSyncTime}</span>
            </button>
          </div>
          <div className="divider-gold w-20" />
        </motion.div>

        {/* Live summary metrics */}
        <div
          className="grid grid-cols-3 gap-2.5 mb-6 p-3 rounded-xl"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center gap-2.5 px-2 py-1">
            <Inbox size={14} style={{ color: 'var(--gold)' }} />
            <div>
              <div className="text-sm font-bold tabular-nums" style={{ color: 'var(--text)' }}>
                {totalPending}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                Open queue
              </div>
            </div>
          </div>
          <div
            className="flex items-center gap-2.5 px-2 py-1 border-l"
            style={{ borderColor: 'var(--border)' }}
          >
            <CheckCircle2 size={14} style={{ color: 'var(--green)' }} />
            <div>
              <div className="text-sm font-bold tabular-nums" style={{ color: 'var(--text)' }}>
                {totalFulfilled}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                Added
              </div>
            </div>
          </div>
          <div
            className="flex items-center gap-2.5 px-2 py-1 border-l"
            style={{ borderColor: 'var(--border)' }}
          >
            <TrendingUp size={14} style={{ color: 'var(--warn)' }} />
            <div>
              <div className="text-sm font-bold tabular-nums" style={{ color: 'var(--text)' }}>
                {totalVotes}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                Total votes
              </div>
            </div>
          </div>
        </div>

        {/* Request Form */}
        <motion.form
          onSubmit={handleSubmit}
          noValidate
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="mb-8 p-5 rounded-2xl"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Star size={14} style={{ color: 'var(--gold)' }} />
              <span
                className="text-xs font-semibold uppercase tracking-[1.5px]"
                style={{ color: 'var(--gold2)' }}
              >
                Submit a Live Request
              </span>
            </div>
            <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
              Priority boost: 100 RWF via MoMo (Free for Pro)
            </span>
          </div>

          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 mb-4 px-3.5 py-2.5 rounded-xl text-xs font-medium"
                style={{
                  background: 'var(--green-bg)',
                  border: '1px solid var(--green-border)',
                  color: 'var(--green)',
                }}
              >
                <CheckCircle2 size={15} />
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {/* Format selector */}
            <div>
              <span
                className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--muted)' }}
              >
                Format
              </span>
              <div className="flex flex-wrap gap-1.5">
                {REQUEST_TYPES.map((tp) => {
                  const active = form.type === tp;
                  return (
                    <button
                      key={tp}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: tp }))}
                      aria-pressed={active}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      style={
                        active
                          ? {
                              background: 'var(--accent-bg)',
                              border: '1px solid var(--gold)',
                              color: 'var(--gold2)',
                            }
                          : {
                              background: 'var(--bg-ghost)',
                              border: '1px solid var(--border)',
                              color: 'var(--muted)',
                            }
                      }
                    >
                      <MediaTypeIcon type={tp} size={13} />
                      {tp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Movie / Series Title Autocomplete */}
            <LiveTitleInput
              id="request-title-input"
              value={form.title}
              mediaType="All"
              onChange={(val) => {
                setForm((f) => ({ ...f, title: val }));
                setErrors((prev) => ({ ...prev, title: '', submit: '' }));
              }}
              onSelectSuggestion={handleSelectSuggestion}
              onVoteExisting={focusExistingRequest}
              selectedMeta={selectedMeta}
              onClearMeta={() => {
                setSelectedMeta(null);
                setForm((f) => ({ ...f, poster_url: '', imdb_id: '' }));
              }}
              error={errors.title}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="request-year-input"
                  className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                  style={{ color: 'var(--muted)' }}
                >
                  Release Year <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="request-year-input"
                  data-testid="request-year-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  className={`input-dark w-full px-3 py-2 rounded-xl text-sm tabular-nums ${
                    errors.year ? 'border-red-500/60' : ''
                  }`}
                  value={form.year}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, year: e.target.value }));
                    setErrors((prev) => ({ ...prev, year: '' }));
                  }}
                  placeholder="e.g. 2026"
                />
                {errors.year && (
                  <p className="text-xs mt-1 font-medium" style={{ color: 'var(--danger)' }}>
                    {errors.year}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="request-language-input"
                  className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                  style={{ color: 'var(--muted)' }}
                >
                  Language / Agasobanuye <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="request-language-input"
                  data-testid="request-language-input"
                  type="text"
                  className={`input-dark w-full px-3 py-2 rounded-xl text-sm ${
                    errors.language ? 'border-red-500/60' : ''
                  }`}
                  value={form.language}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, language: e.target.value }));
                    setErrors((prev) => ({ ...prev, language: '' }));
                  }}
                  placeholder="e.g. Kinyarwanda, Hindi, English"
                />
                {errors.language && (
                  <p className="text-xs mt-1 font-medium" style={{ color: 'var(--danger)' }}>
                    {errors.language}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="request-source-select"
                  className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                  style={{ color: 'var(--muted)' }}
                >
                  Where did you hear about Agasobanuye.rw?{' '}
                  <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  id="request-source-select"
                  data-testid="request-source-select"
                  className={`input-dark w-full px-3 py-2 rounded-xl text-sm cursor-pointer ${
                    errors.source ? 'border-red-500/60' : ''
                  }`}
                  value={form.source}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, source: e.target.value }));
                    setErrors((prev) => ({ ...prev, source: '' }));
                  }}
                >
                  <option value="">Select...</option>
                  {REQUEST_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
                {errors.source && (
                  <p className="text-xs mt-1 font-medium" style={{ color: 'var(--danger)' }}>
                    {errors.source}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="request-by-input"
                  className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                  style={{ color: 'var(--muted)' }}
                >
                  Your Name (Optional)
                </label>
                <input
                  id="request-by-input"
                  data-testid="request-by-input"
                  type="text"
                  className="input-dark w-full px-3 py-2 rounded-xl text-sm"
                  value={form.requested_by}
                  onChange={(e) => setForm((f) => ({ ...f, requested_by: e.target.value }))}
                  placeholder="e.g. Jean Claude"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="request-note-input"
                className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: 'var(--muted)' }}
              >
                Interpreter / Season Note (Optional)
              </label>
              <input
                id="request-note-input"
                type="text"
                className="input-dark w-full px-3 py-2 rounded-xl text-sm"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="e.g. Prefer Rocky Kimomo or Season 2 episodes"
              />
            </div>

            {errors.submit && (
              <p className="text-xs font-medium" style={{ color: 'var(--danger)' }}>
                {errors.submit}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="submit-request-btn"
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {loading ? 'Submitting Request...' : 'Submit Request'}
            </button>
          </div>
        </motion.form>

        {/* Live Filter Bar */}
        <div className="space-y-3 mb-5">
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={() => setQuery('')}
            placeholder="Filter live requests by title, language, or requester..."
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter requests by media type">
              {['All', ...REQUEST_TYPES].map((tp) => {
                const active = typeFilter === tp;
                return (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => setTypeFilter(tp)}
                    aria-pressed={active}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    style={
                      active
                        ? {
                            background: 'var(--accent-bg)',
                            border: '1px solid var(--gold)',
                            color: 'var(--gold2)',
                          }
                        : {
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            color: 'var(--muted)',
                          }
                    }
                  >
                    {tp}
                  </button>
                );
              })}
            </div>
            <span className="text-xs tabular-nums" style={{ color: 'var(--muted)' }}>
              {pending.length} open request{pending.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Pending Live Requests */}
        {pending.length === 0 ? (
          <div
            className="text-center py-14 rounded-2xl mb-8"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{
                background: 'var(--accent-bg)',
                border: '1px solid var(--accent-border)',
                color: 'var(--gold)',
              }}
            >
              <Inbox size={22} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              {query || typeFilter !== 'All'
                ? 'No open requests match your filter'
                : 'No pending requests yet'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              Submit a movie or series above to add it to the live queue.
            </p>
          </div>
        ) : (
          <div data-testid="pending-requests-list" className="space-y-2.5 mb-8">
            {pending.map((r) => {
              const isHighlighted = highlightedId === r.id;
              return (
                <div
                  key={r.id}
                  className="flex items-start gap-3.5 p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: 'var(--bg-card)',
                    border: isHighlighted
                      ? '1.5px solid var(--gold)'
                      : '1px solid var(--border)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => (isPro ? handleProVote(r) : handleVote(r))}
                    disabled={voted[r.id] || processing}
                    aria-label={`Vote for ${r.title} (${r.votes || 0} votes)`}
                    className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors flex-shrink-0 cursor-pointer"
                    style={
                      voted[r.id]
                        ? {
                            background: 'var(--accent-bg)',
                            border: '1px solid var(--gold)',
                            color: 'var(--gold2)',
                            cursor: 'default',
                          }
                        : {
                            background: 'var(--bg-ghost)',
                            border: '1px solid var(--border)',
                            color: 'var(--text)',
                          }
                    }
                  >
                    {isPro ? (
                      <Crown size={14} style={{ color: 'var(--gold2)' }} />
                    ) : (
                      <ChevronUp
                        size={16}
                        style={{ color: voted[r.id] ? 'var(--gold2)' : 'var(--muted)' }}
                      />
                    )}
                    <span
                      className="text-sm font-bold font-cinzel tabular-nums"
                      style={{
                        fontFamily: 'Cinzel, serif',
                        color: voted[r.id] ? 'var(--gold2)' : 'var(--text)',
                      }}
                    >
                      {r.votes || 0}
                    </span>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: voted[r.id] ? 'var(--gold2)' : 'var(--muted)' }}
                    >
                      {voted[r.id] ? 'Voted' : isPro ? 'Pro' : '100 RWF'}
                    </span>
                  </button>

                  {r.poster_url && (
                    <div
                      className="hidden sm:block w-11 h-16 rounded-lg overflow-hidden flex-shrink-0"
                      style={{
                        background: 'var(--bg-ghost)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <img
                        src={r.poster_url}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                        {r.title}
                      </h2>
                      {r.matched_movie_id && (
                        <Link
                          href={`/movies/${r.matched_movie_id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap"
                          style={{ color: 'var(--green)' }}
                        >
                          Watch <ArrowUpRight size={12} />
                        </Link>
                      )}
                    </div>

                    <div
                      className="flex items-center gap-1.5 flex-wrap text-xs mt-1"
                      style={{ color: 'var(--muted)' }}
                    >
                      <span style={{ color: 'var(--gold2)' }}>{r.type || 'Movie'}</span>
                      {r.year && (
                        <>
                          <span>·</span>
                          <span className="tabular-nums">{r.year}</span>
                        </>
                      )}
                      {r.language && (
                        <>
                          <span>·</span>
                          <span>{r.language}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>by {r.requested_by || 'Community Member'}</span>
                    </div>

                    {r.note && (
                      <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text2)' }}>
                        {r.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Donate / Boost Modal */}
        <AnimatePresence>
          {donateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
              onClick={() => setDonateModal(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="boost-vote-title"
                className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl"
                style={{
                  background: 'var(--bg-dropdown)',
                  border: '1px solid var(--border2)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Smartphone size={18} style={{ color: 'var(--gold2)' }} />
                      <h3
                        id="boost-vote-title"
                        className="font-cinzel text-lg font-semibold"
                        style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold2)' }}
                      >
                        Boost Vote
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDonateModal(null)}
                      aria-label="Close boost modal"
                      className="p-1 rounded-lg cursor-pointer"
                      style={{ color: 'var(--muted)' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
                    {donateModal.title}
                  </p>

                  <div
                    className="p-4 rounded-xl mb-4 text-center"
                    style={{
                      background: 'var(--bg-card-subtle)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <p className="text-xs mb-2.5" style={{ color: 'var(--muted)' }}>
                      Choose boost amount
                    </p>
                    <div className="flex gap-2 justify-center mb-3 flex-wrap">
                      {[50, 100, 200, 500].map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setVoteAmount(a)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold tabular-nums cursor-pointer"
                          style={
                            voteAmount === a
                              ? {
                                  background: 'var(--accent-bg)',
                                  border: '1px solid var(--gold)',
                                  color: 'var(--gold2)',
                                }
                              : {
                                  background: 'var(--bg-ghost)',
                                  border: '1px solid var(--border)',
                                  color: 'var(--muted)',
                                }
                          }
                        >
                          {a} RWF
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <input
                        type="number"
                        aria-label="Custom boost amount in RWF"
                        value={voteAmount}
                        onChange={(e) =>
                          setVoteAmount(Math.max(50, parseInt(e.target.value, 10) || 50))
                        }
                        min="50"
                        step="50"
                        className="input-dark w-24 text-center px-2 py-1.5 rounded-lg text-sm font-bold tabular-nums"
                        style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold2)' }}
                      />
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>
                        RWF
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-lg mb-4"
                    style={{
                      background: 'var(--green-bg)',
                      border: '1px solid var(--green-border)',
                    }}
                  >
                    <span className="text-xs" style={{ color: 'var(--text2)' }}>
                      Vote boost
                    </span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--green)' }}>
                      +{voteBoost} vote{voteBoost > 1 ? 's' : ''}
                    </span>
                  </div>

                  <UnifiedPaymentFlow
                    amount={voteAmount}
                    minAmount={50}
                    requestId={donateModal.id}
                    purpose={`Boost vote: ${donateModal.title}`}
                    compact
                    resetTrigger={donateModal?.id}
                    onSubmitted={() => {
                      setVoted((prev) => ({ ...prev, [donateModal.id]: true }));
                    }}
                    onConfirmed={() => {
                      fetchLiveBoard({ silent: true });
                    }}
                    onDone={() => {
                      setDonateModal(null);
                      fetchLiveBoard({ silent: true });
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <AdBanner size="728x90" className="flex-1" />
          <AdBanner size="300x250" className="sm:w-[300px]" />
        </div>

        {/* Fulfilled section */}
        {fulfilled.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 size={14} style={{ color: 'var(--green)' }} />
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--green)' }}
              >
                Already Added ({fulfilled.length})
              </span>
              <div className="flex-1" style={{ borderBottom: '1px solid var(--border)' }} />
            </div>
            <div className="space-y-2">
              {fulfilled.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                        {r.title}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>
                        {r.type || 'Movie'}
                        {r.year ? ` · ${r.year}` : ''}
                      </div>
                    </div>
                  </div>
                  {r.matched_movie_id ? (
                    <Link
                      href={`/movies/${r.matched_movie_id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
                      style={{
                        background: 'var(--green-bg)',
                        border: '1px solid var(--green-border)',
                        color: 'var(--green)',
                      }}
                    >
                      Watch Now <ArrowUpRight size={12} />
                    </Link>
                  ) : (
                    <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--green)' }}>
                      Added
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const payload = await loadLiveRequests();
    return {
      props: {
        requests: payload.requests,
        updatedAt: payload.updatedAt,
      },
    };
  } catch {
    return { props: { requests: [], updatedAt: '' } };
  }
}
