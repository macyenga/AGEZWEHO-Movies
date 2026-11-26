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
  STUDIO_TARGET_LANGUAGES,
  resolveStudioTargetLanguage,
  parseSubtitleCues,
  formatCuesToSrt,
  formatCuesToVtt,
  chunkCuesForTranslation,
  sanitizeSubtitleFilename,
} from '../lib/subtitles';

const GOLD = 'var(--gold)';
const GOLD_LIGHT = 'var(--gold2)';

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
  const [targetLanguage, setTargetLanguage] = useState('Kinyarwanda');
  const [translating, setTranslating] = useState(false);
  const [translateProgress, setTranslateProgress] = useState({ done: 0, total: 0 });
  const [translateError, setTranslateError] = useState('');
  const [hasTranslated, setHasTranslated] = useState(false);
  const [appliedToast, setAppliedToast] = useState(false);

  const selectedTarget = resolveStudioTargetLanguage(targetLanguage);

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

  const translateCuesList = async (
    sourceCues,
    movieTitle,
    sourceLang,
    requestedTarget = targetLanguage
  ) => {
    if (!Array.isArray(sourceCues) || sourceCues.length === 0) return;

    const targetObj = resolveStudioTargetLanguage(requestedTarget);
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
            targetLanguage: targetObj.label,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || `${targetObj.label} translation failed`);
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

  const handleDownloadTranslated = (format) => {
    if (cues.length === 0) return;
    const langSlug = selectedTarget.label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const baseName = `${activeFilename || activeTitle || 'agasobanuye'}_${langSlug}`;
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
      id: `${selectedTarget.id}-studio-${Date.now()}`,
      language: selectedTarget.label,
      label: `${activeTitle || 'Official'} · ${selectedTarget.label}`,
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
          background: 'var(--bg-card)',
          border: '1px solid var(--accent-border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--muted)' }}
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
              background: 'linear-gradient(135deg, var(--gold2), var(--gold))',
              color: 'var(--accent-ink)',
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
            className="btn-ghost inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            <RefreshCw size={13} />
            <span>Latest</span>
          </button>
        </div>

        {!compact && quickPicks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>
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
                className="btn-ghost px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer"
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
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between gap-2"
            style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card-subtle)' }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Subtitles size={15} style={{ color: GOLD_LIGHT }} />
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] truncate" style={{ color: GOLD_LIGHT }}>
                {modeLabel}
              </h2>
            </div>
            <span className="text-xs tabular-nums shrink-0" style={{ color: 'var(--muted)' }}>
              {searching ? 'Loading...' : `${items.length} found`}
            </span>
          </div>

          {searchError && (
            <div
              className="m-4 p-3.5 rounded-xl flex items-start gap-2.5 text-xs"
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger)',
              }}
            >
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{searchError}</span>
            </div>
          )}

          {searching ? (
            <div className="p-6 flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
              <Loader2 size={16} className="animate-spin" style={{ color: GOLD_LIGHT }} />
              <span>Fetching latest official subtitle tracks...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center space-y-2">
              <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                No official subtitle tracks matched that query.
              </p>
              <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                Try another title spelling or upload any .SRT / .VTT file in the Kinyarwanda Studio panel.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)] max-h-[540px] overflow-y-auto">
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
                      background: isSelected ? 'var(--accent-bg)' : 'transparent',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                          {item.movieName}
                          {item.year ? ` (${item.year})` : ''}
                        </div>
                        <div className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text2)' }}>
                          {item.fileName}
                        </div>
                        <div className="text-[11px] mt-1 tabular-nums" style={{ color: 'var(--muted)' }}>
                          {item.language} · {item.format.toUpperCase()} · {item.downloadsCount.toLocaleString()} downloads
                          {item.addedAt ? ` · ${item.addedAt.slice(0, 10)}` : ''}
                        </div>
                      </div>

                      {item.matchedMovieId && !movieId && (
                        <Link
                          href={`/movies/${item.matchedMovieId}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium shrink-0 hover:underline"
                          style={{ color: 'var(--green)' }}
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
                        className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-opacity disabled:opacity-50"
                      >
                        <Languages size={13} />
                        <span>Translate to {selectedTarget.label}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLoadOfficialSubtitle(item, { autoTranslate: false })}
                        disabled={loadingSub}
                        className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        <span>Inspect Cues</span>
                      </button>

                      <a
                        href={downloadHref}
                        data-testid={`download-official-srt-${item.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          background: 'var(--green-bg)',
                          border: '1px solid var(--green-border)',
                          color: 'var(--green)',
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

        {/* Multi-Language Subtitle Studio Column */}
        <div
          className={`${compact ? '' : 'lg:col-span-6'} rounded-2xl overflow-hidden`}
          data-testid="kinyarwanda-subtitle-studio"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--accent-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            className="px-4 py-3 flex flex-wrap items-center justify-between gap-2"
            style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card-subtle)' }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles size={15} style={{ color: GOLD_LIGHT }} />
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: GOLD_LIGHT }}>
                Multi-Language Subtitle Studio
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="studio-target-lang" className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>
                To:
              </label>
              <select
                id="studio-target-lang"
                data-testid="studio-target-lang-select"
                value={selectedTarget.label}
                onChange={(e) => setTargetLanguage(e.target.value)}
                aria-label="Target subtitle translation language"
                className="input-dark px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer"
              >
                {STUDIO_TARGET_LANGUAGES.map((tl) => (
                  <option key={tl.id} value={tl.label}>
                    {tl.label}
                  </option>
                ))}
              </select>

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
                className="btn-ghost inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer"
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
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger)',
                }}
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">{translateError}</p>
                  {cues.length > 0 && (
                    <p style={{ color: 'var(--text2)' }}>
                      You can still edit lines manually below and download the .SRT or .VTT subtitle file.
                    </p>
                  )}
                </div>
              </div>
            )}

            {!loadingSub && cues.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Languages size={26} className="mx-auto" style={{ color: GOLD, opacity: 0.7 }} />
                <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                  Select any official subtitle release on the left or load your own .SRT / .VTT file.
                </p>
                <p className="text-[11px] max-w-md mx-auto" style={{ color: 'var(--muted)' }}>
                  Cues are translated into {selectedTarget.label} (or any supported language) while preserving original timestamps, ready to download as .SRT or .VTT.
                </p>
              </div>
            ) : !loadingSub ? (
              <>
                {/* Active File Summary & Controls */}
                <div
                  className="p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3"
                  style={{
                    background: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
                      {activeTitle}
                    </div>
                    <div className="text-[11px] mt-0.5 tabular-nums" style={{ color: 'var(--muted)' }}>
                      {cues.length} cues · {activeLangName} → {selectedTarget.label}
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
                          background: 'var(--danger-bg)',
                          border: '1px solid var(--danger-border)',
                          color: 'var(--danger)',
                        }}
                      >
                        <Loader2 size={12} className="animate-spin" />
                        <span>Stop ({translateProgress.done}/{translateProgress.total})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => translateCuesList(cues, activeTitle, activeLangName, selectedTarget.label)}
                        data-testid="studio-translate-btn"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                        style={{
                          background: 'linear-gradient(135deg, var(--gold2), var(--gold))',
                          color: 'var(--accent-ink)',
                        }}
                      >
                        <Languages size={12} />
                        <span>
                          {hasTranslated ? `Re-translate (${selectedTarget.label})` : `Translate to ${selectedTarget.label}`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Download & Play Export Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadTranslated('srt')}
                    data-testid="download-rw-srt-btn"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                    style={{
                      background: 'var(--green-bg)',
                      border: '1px solid var(--green-border)',
                      color: 'var(--green)',
                    }}
                  >
                    <Download size={13} />
                    <span>Download {selectedTarget.label} .SRT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadTranslated('vtt')}
                    data-testid="download-rw-vtt-btn"
                    className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
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
                        background: 'var(--blue-bg)',
                        border: '1px solid var(--blue-border)',
                        color: 'var(--blue)',
                      }}
                    >
                      {appliedToast ? <Check size={13} /> : <Play size={13} fill="currentColor" />}
                      <span>{appliedToast ? 'Loaded in Player' : 'Play Subtitle in Player'}</span>
                    </button>
                  )}
                </div>

                {/* Cue Preview & Inline Editor (shows first 60 cues for snappy editing) */}
                <div className="divide-y divide-[var(--border-subtle)] rounded-xl overflow-hidden max-h-[380px] overflow-y-auto"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg-card-subtle)' }}>
                  {cues.slice(0, 60).map((cue) => (
                    <div key={cue.index} className="p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] tabular-nums" style={{ color: 'var(--muted)' }}>
                        <span>#{cue.index}</span>
                        <span>
                          {cue.startTime} → {cue.endTime}
                        </span>
                      </div>
                      <p className="text-xs leading-snug" style={{ color: 'var(--text2)' }}>
                        {cue.text}
                      </p>
                      <input
                        type="text"
                        value={cue.translatedText ?? ''}
                        onChange={(e) => handleCueEdit(cue.index, e.target.value)}
                        placeholder={`${selectedTarget.label} subtitle line...`}
                        aria-label={`${selectedTarget.label} translation for cue ${cue.index}`}
                        className="input-dark w-full px-2.5 py-1.5 rounded-lg text-xs"
                        style={{ color: GOLD_LIGHT }}
                      />
                    </div>
                  ))}
                  {cues.length > 60 && (
                    <div className="p-3 text-center text-[11px] tabular-nums" style={{ color: 'var(--muted)' }}>
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
