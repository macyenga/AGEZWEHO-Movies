import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  Download,
  Languages,
  Subtitles,
  Loader2,
  Sparkles,
  Upload,
  Check,
  AlertCircle,
  Play,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import {
  OFFICIAL_SUBTITLE_LANGUAGES,
  parseSubtitleCues,
  formatCuesToSrt,
  formatCuesToVtt,
  chunkCuesForTranslation,
  sanitizeSubtitleFilename,
} from '../lib/subtitles';

const GOLD = '#c9a84c';
const GOLD_LIGHT = '#e8c87a';

function triggerBlobDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function OfficialSubtitleStudio({
  initialQuery = '',
  movieId = null,
  compact = false,
  onApplyKinyarwandaTrack = null,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [lang, setLang] = useState('eng');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [items, setItems] = useState([]);
  const [quickPicks, setQuickPicks] = useState([]);
  const [modeLabel, setModeLabel] = useState('Latest Official Releases');

  // Workbench state
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [cues, setCues] = useState([]);
  const [activeTitle, setActiveTitle] = useState(initialQuery || '');
  const [activeLangName, setActiveLangName] = useState('English');
  const [activeFilename, setActiveFilename] = useState('official_subtitle');

  // Translation state
  const [translating, setTranslating] = useState(false);
  const [translateProgress, setTranslateProgress] = useState({ done: 0, total: 0 });
  const [translateError, setTranslateError] = useState('');
  const [hasTranslated, setHasTranslated] = useState(false);
  const [appliedToast, setAppliedToast] = useState(false);

  const fileInputRef = useRef(null);
  const cancelTranslationRef = useRef(false);

  const runSearch = useCallback(async (searchText, targetLang) => {
    const q = String(searchText ?? '').trim();
    setSearching(true);
    setSearchError('');

    try {
      const params = new URLSearchParams();
      params.set('lang', targetLang || 'eng');
      if (q) {
        params.set('q', q);
        setModeLabel(`Official Results for "${q}"`);
      } else {
        params.set('latest', '1');
        setModeLabel('Latest Official Releases');
      }

      const res = await fetch(`/api/subtitles/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Could not search official subtitles');
      }
      setItems(Array.isArray(data.items) ? data.items : []);
      if (Array.isArray(data.catalogQuickPicks)) {
        setQuickPicks(data.catalogQuickPicks);
      }
    } catch (err) {
      setSearchError(err?.message || 'Failed to load official subtitles.');
      setItems([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    runSearch(initialQuery, 'eng');
  }, [initialQuery, runSearch]);

  const translateCuesList = async (sourceCues, movieTitle, sourceLang) => {
    if (!Array.isArray(sourceCues) || sourceCues.length === 0) return;

    cancelTranslationRef.current = false;
    setTranslating(true);
    setTranslateError('');
    setTranslateProgress({ done: 0, total: sourceCues.length });

    const batches = chunkCuesForTranslation(sourceCues, 45);
    let working = [...sourceCues];
    let completed = 0;

    try {
      for (const batch of batches) {
        if (cancelTranslationRef.current) break;

        const res = await fetch('/api/subtitles/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cues: batch,
            movieTitle,
            sourceLanguage: sourceLang,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Kinyarwanda translation failed');
        }

        const translatedMap = new Map(
          (data.cues || []).map((c) => [c.index, c.translatedText])
        );
        working = working.map((cue) =>
          translatedMap.has(cue.index)
            ? { ...cue, translatedText: translatedMap.get(cue.index) }
            : cue
        );
        completed += batch.length;
        setCues(working);
        setTranslateProgress({ done: Math.min(completed, working.length), total: working.length });
        setHasTranslated(true);
      }
    } catch (err) {
      setTranslateError(err?.message || 'Translation paused due to an error.');
    } finally {
      setTranslating(false);
    }
  };

  const handleLoadOfficialSubtitle = async (item, { autoTranslate = false } = {}) => {
    setSelectedItem(item);
    setLoadingSub(true);
    setTranslateError('');
    setHasTranslated(false);
    setAppliedToast(false);

    try {
      const params = new URLSearchParams({
        url: item.downloadUrl,
        filename: item.fileName || item.movieName,
        format: 'json',
      });
      const res = await fetch(`/api/subtitles/download?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load subtitle file');
      }

      const loadedCues = Array.isArray(data.cues) ? data.cues : [];
      if (loadedCues.length === 0) {
        throw new Error('This subtitle release contained no readable timing cues.');
      }

      setCues(loadedCues);
      setActiveTitle(item.movieName || initialQuery || 'Movie');
      setActiveLangName(item.language || 'English');
      setActiveFilename(item.fileName || item.movieName || 'subtitle');
      setTranslateProgress({ done: 0, total: loadedCues.length });

      if (autoTranslate) {
        setLoadingSub(false);
        await translateCuesList(
          loadedCues,
          item.movieName || initialQuery,
          item.language || 'English'
        );
      }
    } catch (err) {
      setTranslateError(err?.message || 'Could not unpack official subtitle.');
    } finally {
      setLoadingSub(false);
    }
  };

  const handleLocalFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTranslateError('');
    setHasTranslated(false);

    const reader = new FileReader();
    reader.onload = () => {
      const rawText = typeof reader.result === 'string' ? reader.result : '';
      const parsed = parseSubtitleCues(rawText);
      if (parsed.length === 0) {
        setTranslateError('No valid .SRT or .VTT cues found in that file.');
        return;
      }
      setSelectedItem(null);
      setCues(parsed);
      setActiveTitle(file.name.replace(/\.(srt|vtt)$/i, ''));
      setActiveLangName('Uploaded Subtitle');
      setActiveFilename(file.name);
      setTranslateProgress({ done: 0, total: parsed.length });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCueEdit = (cueIndex, nextText) => {
    setCues((prev) =>
      prev.map((c) => (c.index === cueIndex ? { ...c, translatedText: nextText } : c))
    );
    setHasTranslated(true);
  };

  const handleDownloadKinyarwanda = (format) => {
    if (cues.length === 0) return;
    const baseName = `${activeFilename || activeTitle || 'agasobanuye'}_kinyarwanda`;
    const filename = sanitizeSubtitleFilename(baseName, format);
    const content =
      format === 'vtt'
        ? formatCuesToVtt(cues, { useTranslated: true })
        : formatCuesToSrt(cues, { useTranslated: true });
    const mime = format === 'vtt' ? 'text/vtt' : 'application/x-subrip';
    triggerBlobDownload(content, filename, mime);
  };

  const handleApplyToPlayer = () => {
    if (!onApplyKinyarwandaTrack || cues.length === 0) return;
    const vttText = formatCuesToVtt(cues, { useTranslated: true });
    onApplyKinyarwandaTrack({
      id: `rw-studio-${Date.now()}`,
      language: 'Kinyarwanda',
      label: `${activeTitle || 'Official'} · Kinyarwanda`,
      rawText: vttText,
      format: 'vtt',
    });
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 2500);
  };

  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      {/* Search + Language Controls */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query, lang);
        }}
        className="p-4 rounded-2xl space-y-3"
        style={{
          background: 'rgba(14,14,22,0.86)',
          border: '1px solid rgba(201,168,76,0.22)',
        }}
      >
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#8a8778' }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movie or series (e.g. Pushpa 2, Squid Game, Dune)..."
              aria-label="Search official subtitles by movie or series title"
              className="input-dark w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>

          <select
            value={lang}
            onChange={(e) => {
              const nextLang = e.target.value;
              setLang(nextLang);
              runSearch(query, nextLang);
            }}
            aria-label="Official subtitle source language"
            className="input-dark px-3.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer"
            style={{ background: '#0f0f17' }}
          >
            {OFFICIAL_SUBTITLE_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={searching}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-opacity disabled:opacity-60 whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg,#e8c87a,#c9a84c)',
              color: '#09090f',
            }}
          >
            {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            <span>Find Official</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setQuery('');
              runSearch('', lang);
            }}
            disabled={searching}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#d4cfc0',
            }}
          >
            <RefreshCw size={13} />
            <span>Latest</span>
          </button>
        </div>

        {!compact && quickPicks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-medium" style={{ color: '#8a8778' }}>
              Latest on site:
            </span>
            {quickPicks.map((pick) => (
              <button
                key={pick.id}
                type="button"
                onClick={() => {
                  setQuery(pick.searchHint);
                  runSearch(pick.searchHint, lang);
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer transition-colors hover:text-[#f5e4a8]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#c8c3b6',
                }}
              >
                {pick.searchHint}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Main Split: Official Catalog + Kinyarwanda Studio */}
      <div className={`grid grid-cols-1 ${compact ? '' : 'lg:grid-cols-12'} gap-5 items-start`}>
        {/* Official Results Column */}
        <div
          className={`${compact ? '' : 'lg:col-span-6'} rounded-2xl overflow-hidden`}
          style={{
            background: 'rgba(14,14,22,0.84)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between gap-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Subtitles size={15} style={{ color: GOLD_LIGHT }} />
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] truncate" style={{ color: GOLD_LIGHT }}>
                {modeLabel}
              </h2>
            </div>
            <span className="text-xs tabular-nums shrink-0" style={{ color: '#8a8778' }}>
              {searching ? 'Loading...' : `${items.length} found`}
            </span>
          </div>

          {searchError && (
            <div
              className="m-4 p-3.5 rounded-xl flex items-start gap-2.5 text-xs"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#fca5a5',
              }}
            >
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{searchError}</span>
            </div>
          )}

          {searching ? (
            <div className="p-6 flex items-center justify-center gap-2 text-xs" style={{ color: '#9c988b' }}>
              <Loader2 size={16} className="animate-spin" style={{ color: GOLD_LIGHT }} />
              <span>Fetching latest official subtitle tracks...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center space-y-2">
              <p className="text-xs font-medium" style={{ color: '#c8c3b6' }}>
                No official subtitle tracks matched that query.
              </p>
              <p className="text-[11px]" style={{ color: '#8a8778' }}>
                Try another title spelling or upload any .SRT / .VTT file in the Kinyarwanda Studio panel.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06] max-h-[540px] overflow-y-auto">
              {items.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const downloadHref = `/api/subtitles/download?url=${encodeURIComponent(
                  item.downloadUrl
                )}&filename=${encodeURIComponent(item.fileName || item.movieName)}&format=srt`;

                return (
                  <div
                    key={item.id}
                    data-testid={`official-sub-row-${item.id}`}
                    className="p-4 transition-colors"
                    style={{
                      background: isSelected ? 'rgba(201,168,76,0.08)' : 'transparent',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: '#f3efe3' }}>
                          {item.movieName}
                          {item.year ? ` (${item.year})` : ''}
                        </div>
                        <div className="text-[11px] truncate mt-0.5" style={{ color: '#b8b4a8' }}>
                          {item.fileName}
                        </div>
                        <div className="text-[11px] mt-1 tabular-nums" style={{ color: '#8a8778' }}>
                          {item.language} · {item.format.toUpperCase()} · {item.downloadsCount.toLocaleString()} downloads
                          {item.addedAt ? ` · ${item.addedAt.slice(0, 10)}` : ''}
                        </div>
                      </div>

                      {item.matchedMovieId && !movieId && (
                        <Link
                          href={`/movies/${item.matchedMovieId}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium shrink-0 hover:underline"
                          style={{ color: '#86efac' }}
                        >
                          <span>Movie Page</span>
                          <ExternalLink size={11} />
                        </Link>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => handleLoadOfficialSubtitle(item, { autoTranslate: true })}
                        disabled={loadingSub || translating}
                        data-testid={`translate-rw-btn-${item.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-opacity disabled:opacity-50"
                        style={{
                          background: 'rgba(201,168,76,0.16)',
                          border: '1px solid rgba(201,168,76,0.4)',
                          color: '#f5e4a8',
                        }}
                      >
                        <Languages size={13} />
                        <span>Translate to Kinyarwanda</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLoadOfficialSubtitle(item, { autoTranslate: false })}
                        disabled={loadingSub}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#d4cfc0',
                        }}
                      >
                        <span>Inspect Cues</span>
                      </button>

                      <a
                        href={downloadHref}
                        data-testid={`download-official-srt-${item.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/[0.06]"
                        style={{
                          border: '1px solid rgba(74,222,128,0.28)',
                          color: '#86efac',
                        }}
                      >
                        <Download size={12} />
                        <span>Download Original (.SRT)</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Kinyarwanda Studio Column */}
        <div
          className={`${compact ? '' : 'lg:col-span-6'} rounded-2xl overflow-hidden`}
          data-testid="kinyarwanda-subtitle-studio"
          style={{
            background: 'rgba(14,14,22,0.88)',
            border: '1px solid rgba(201,168,76,0.24)',
          }}
        >
          <div
            className="px-4 py-3 flex flex-wrap items-center justify-between gap-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles size={15} style={{ color: GOLD_LIGHT }} />
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: GOLD_LIGHT }}>
                Kinyarwanda Subtitle Studio
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".srt,.vtt,text/vtt,application/x-subrip"
                onChange={handleLocalFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#d4cfc0',
                }}
              >
                <Upload size={11} />
                <span>Load Local .SRT/.VTT</span>
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {loadingSub && (
              <div className="py-8 flex items-center justify-center gap-2 text-xs" style={{ color: GOLD_LIGHT }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Unpacking official subtitle file...</span>
              </div>
            )}

            {translateError && (
              <div
                data-testid="subtitle-translate-error"
                className="p-3.5 rounded-xl flex items-start gap-2.5 text-xs"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.28)',
                  color: '#fca5a5',
                }}
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">{translateError}</p>
                  {cues.length > 0 && (
                    <p style={{ color: '#e5e7eb' }}>
                      You can still edit lines manually below and download the .SRT or .VTT subtitle file.
                    </p>
                  )}
                </div>
              </div>
            )}

            {!loadingSub && cues.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Languages size={26} className="mx-auto" style={{ color: GOLD, opacity: 0.7 }} />
                <p className="text-xs font-medium" style={{ color: '#e8e4d8' }}>
                  Select any official subtitle release on the left or load your own .SRT / .VTT file.
                </p>
                <p className="text-[11px] max-w-md mx-auto" style={{ color: '#8a8778' }}>
                  Cues are translated into Kinyarwanda while preserving original timestamps, ready to download as .SRT or .VTT.
                </p>
              </div>
            ) : !loadingSub ? (
              <>
                {/* Active File Summary & Controls */}
                <div
                  className="p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate" style={{ color: '#f3efe3' }}>
                      {activeTitle}
                    </div>
                    <div className="text-[11px] mt-0.5 tabular-nums" style={{ color: '#8a8778' }}>
                      {cues.length} cues · {activeLangName} → Kinyarwanda
                      {translating
                        ? ` · Translating ${translateProgress.done}/${translateProgress.total}`
                        : hasTranslated
                        ? ` · ${translateProgress.done}/${translateProgress.total} ready`
                        : ''}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {translating ? (
                      <button
                        type="button"
                        onClick={() => {
                          cancelTranslationRef.current = true;
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                        style={{
                          background: 'rgba(239,68,68,0.14)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          color: '#fca5a5',
                        }}
                      >
                        <Loader2 size={12} className="animate-spin" />
                        <span>Stop ({translateProgress.done}/{translateProgress.total})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => translateCuesList(cues, activeTitle, activeLangName)}
                        data-testid="studio-translate-btn"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                        style={{
                          background: 'linear-gradient(135deg,#e8c87a,#c9a84c)',
                          color: '#09090f',
                        }}
                      >
                        <Languages size={12} />
                        <span>{hasTranslated ? 'Re-translate to RW' : 'Translate to Kinyarwanda'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Download & Play Export Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadKinyarwanda('srt')}
                    data-testid="download-rw-srt-btn"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                    style={{
                      background: 'rgba(34,197,94,0.15)',
                      border: '1px solid rgba(74,222,128,0.35)',
                      color: '#86efac',
                    }}
                  >
                    <Download size={13} />
                    <span>Download Kinyarwanda .SRT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadKinyarwanda('vtt')}
                    data-testid="download-rw-vtt-btn"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                    style={{
                      background: 'rgba(201,168,76,0.14)',
                      border: '1px solid rgba(201,168,76,0.32)',
                      color: GOLD_LIGHT,
                    }}
                  >
                    <Download size={13} />
                    <span>Download .VTT</span>
                  </button>

                  {onApplyKinyarwandaTrack && (
                    <button
                      type="button"
                      onClick={handleApplyToPlayer}
                      data-testid="apply-rw-player-btn"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                      style={{
                        background: 'rgba(56,189,248,0.14)',
                        border: '1px solid rgba(56,189,248,0.35)',
                        color: '#7dd3fc',
                      }}
                    >
                      {appliedToast ? <Check size={13} /> : <Play size={13} fill="currentColor" />}
                      <span>{appliedToast ? 'Loaded in Player' : 'Play Subtitle in Player'}</span>
                    </button>
                  )}
                </div>

                {/* Cue Preview & Inline Kinyarwanda Editor (shows first 40 cues for snappy editing) */}
                <div className="divide-y divide-white/[0.06] rounded-xl overflow-hidden max-h-[380px] overflow-y-auto"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(8,8,14,0.75)' }}>
                  {cues.slice(0, 60).map((cue) => (
                    <div key={cue.index} className="p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] tabular-nums" style={{ color: '#8a8778' }}>
                        <span>#{cue.index}</span>
                        <span>
                          {cue.startTime} → {cue.endTime}
                        </span>
                      </div>
                      <p className="text-xs leading-snug" style={{ color: '#9c988b' }}>
                        {cue.text}
                      </p>
                      <input
                        type="text"
                        value={cue.translatedText ?? ''}
                        onChange={(e) => handleCueEdit(cue.index, e.target.value)}
                        placeholder="Kinyarwanda subtitle line..."
                        aria-label={`Kinyarwanda translation for cue ${cue.index}`}
                        className="input-dark w-full px-2.5 py-1.5 rounded-lg text-xs"
                        style={{ color: '#f5e4a8' }}
                      />
                    </div>
                  ))}
                  {cues.length > 60 && (
                    <div className="p-3 text-center text-[11px] tabular-nums" style={{ color: '#8a8778' }}>
                      Showing first 60 cues in preview editor — all {cues.length} cues are included in downloads.
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
