import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play,
  ExternalLink,
  Subtitles,
  Upload,
  Download,
  Film,
  X,
  Check,
  Tv2,
} from 'lucide-react';
import {
  collectPlayableSources,
  normalizeSubtitles,
  srtToVtt,
  parseVttCues,
} from '../lib/media-preview';

const GOLD = '#c9a84c';
const GOLD_LIGHT = '#e8c87a';

export default function SmartMediaPlayer({
  movie,
  initialSourceId = null,
  initialSubtitleId = null,
  extraTracks = [],
  compact = false,
  onClose = null,
}) {
  const sources = useMemo(() => collectPlayableSources(movie), [movie]);
  const movieTracks = useMemo(
    () => normalizeSubtitles(movie?.subtitles, movie?.subtitle_url, movie?.language || 'Kinyarwanda'),
    [movie?.subtitles, movie?.subtitle_url, movie?.language]
  );

  const [selectedSourceId, setSelectedSourceId] = useState(initialSourceId || sources[0]?.id || '');
  const [localTracks, setLocalTracks] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState(
    initialSubtitleId || movieTracks[0]?.id || 'off'
  );
  const [activeCueText, setActiveCueText] = useState('');
  const [cues, setCues] = useState([]);
  const [subError, setSubError] = useState('');
  const [iframeElapsedSec, setIframeElapsedSec] = useState(0);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const blobUrlsRef = useRef([]);

  const allTracks = useMemo(
    () => [...movieTracks, ...(Array.isArray(extraTracks) ? extraTracks : []), ...localTracks],
    [movieTracks, extraTracks, localTracks]
  );

  useEffect(() => {
    if (initialSourceId && sources.some((s) => s.id === initialSourceId)) {
      setSelectedSourceId(initialSourceId);
    } else if (!sources.some((s) => s.id === selectedSourceId)) {
      setSelectedSourceId(sources[0]?.id || '');
    }
  }, [initialSourceId, sources, selectedSourceId]);

  useEffect(() => {
    if (initialSubtitleId && allTracks.some((t) => t.id === initialSubtitleId)) {
      setSelectedSubId(initialSubtitleId);
    } else if (selectedSubId !== 'off' && !allTracks.some((t) => t.id === selectedSubId)) {
      setSelectedSubId(allTracks[0]?.id || 'off');
    }
  }, [initialSubtitleId, allTracks, selectedSubId]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {
          // ignore
        }
      });
      blobUrlsRef.current = [];
    };
  }, []);

  const activeSource = sources.find((s) => s.id === selectedSourceId) || sources[0] || null;
  const activeTrack = selectedSubId === 'off' ? null : allTracks.find((t) => t.id === selectedSubId) || null;

  useEffect(() => {
    setIframeElapsedSec(0);
    setActiveCueText('');
  }, [activeSource?.id]);

  // Load cue text for custom subtitle preview/overlay when track is local blob or same-origin /api/subtitles
  useEffect(() => {
    if (!activeTrack) {
      setCues([]);
      setActiveCueText('');
      return;
    }

    if (activeTrack.rawText) {
      setCues(parseVttCues(activeTrack.rawText));
      return;
    }

    const canFetchSameOrigin = activeTrack.url.startsWith('/api/subtitles/') || activeTrack.url.startsWith('blob:');
    if (!canFetchSameOrigin) {
      setCues([]);
      return;
    }

    let cancelled = false;
    fetch(activeTrack.url)
      .then((res) => (res.ok ? res.text() : ''))
      .then((text) => {
        if (!cancelled && text) {
          setCues(parseVttCues(text));
        }
      })
      .catch(() => {
        if (!cancelled) setCues([]);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTrack]);

  // Lightweight preview clock for embedded iframes when cues are available
  useEffect(() => {
    if (!activeSource || activeSource.playerType !== 'iframe' || cues.length === 0) return undefined;
    const timer = setInterval(() => {
      setIframeElapsedSec((prev) => (prev + 0.5) % 20);
    }, 500);
    return () => clearInterval(timer);
  }, [activeSource, cues.length]);

  useEffect(() => {
    if (!activeTrack || cues.length === 0) {
      setActiveCueText('');
      return;
    }
    if (activeSource?.playerType === 'iframe') {
      const matched = cues.find((c) => iframeElapsedSec >= c.startSec && iframeElapsedSec <= c.endSec);
      setActiveCueText(matched ? matched.text : '');
    }
  }, [activeTrack, cues, iframeElapsedSec, activeSource?.playerType]);

  const handleVideoTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid || cues.length === 0) return;
    const sec = vid.currentTime;
    const matched = cues.find((c) => sec >= c.startSec && sec <= c.endSec);
    setActiveCueText(matched ? matched.text : '');
  };

  const handleUploadSubtitleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubError('');

    if (!/\.(srt|vtt)$/i.test(file.name)) {
      setSubError('Please select a .srt or .vtt subtitle file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const rawText = typeof reader.result === 'string' ? reader.result : '';
      const vttText = srtToVtt(rawText);
      const blob = new Blob([vttText], { type: 'text/vtt;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      blobUrlsRef.current.push(blobUrl);

      const newId = `local-${Date.now()}`;
      const cleanName = file.name.replace(/\.(srt|vtt)$/i, '');
      const trackObj = {
        id: newId,
        language: 'Custom',
        label: `${cleanName} (Local)`,
        url: blobUrl,
        format: 'vtt',
        rawText: vttText,
      };
      setLocalTracks((prev) => [...prev, trackObj]);
      setSelectedSubId(newId);
    };
    reader.onerror = () => {
      setSubError('Could not read subtitle file.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!movie || sources.length === 0) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: 'rgba(14,14,22,0.82)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Film size={24} className="mx-auto mb-2" style={{ color: GOLD, opacity: 0.6 }} />
        <p className="text-xs font-medium" style={{ color: '#e8e4d8' }}>
          No inline preview stream attached for this release yet.
        </p>
        <p className="text-[11px] mt-1" style={{ color: '#8a8778' }}>
          Use the external watch or download mirrors below, or attach a YouTube, Vimeo, Google Drive, or .MP4 link.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="smart-media-player"
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(12,12,20,0.92)',
        border: '1px solid rgba(201,168,76,0.28)',
      }}
    >
      {/* Top Source Bar */}
      <div
        className="px-4 py-3 flex flex-wrap items-center justify-between gap-2.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(8,8,14,0.8)' }}
      >
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide min-w-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold shrink-0 mr-1" style={{ color: GOLD_LIGHT }}>
            <Tv2 size={14} />
            <span>{compact ? 'Preview Player' : 'Instant Preview'}</span>
          </span>

          {sources.map((src) => {
            const active = activeSource?.id === src.id;
            return (
              <button
                key={src.id}
                type="button"
                onClick={() => setSelectedSourceId(src.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0"
                style={
                  active
                    ? {
                        background: 'rgba(201,168,76,0.18)',
                        border: '1px solid rgba(201,168,76,0.45)',
                        color: '#f5e4a8',
                      }
                    : {
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        color: '#b8b4a8',
                      }
                }
              >
                <Play size={10} fill={active ? 'currentColor' : 'none'} />
                <span>{src.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeSource?.url && (
            <a
              href={activeSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-white/10 whitespace-nowrap"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#d4cfc0' }}
            >
              <span>Open Original</span>
              <ExternalLink size={11} />
            </a>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview player"
              className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10"
              style={{ color: '#9c988b' }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Video / Embed Stage */}
      <div className="relative w-full aspect-video bg-black">
        {activeSource?.playerType === 'video' ? (
          <video
            key={activeSource.embedUrl}
            ref={videoRef}
            src={activeSource.embedUrl}
            controls
            autoPlay
            playsInline
            crossOrigin="anonymous"
            onTimeUpdate={handleVideoTimeUpdate}
            className="w-full h-full object-contain"
          >
            {allTracks.map((tr) => (
              <track
                key={tr.id}
                kind="subtitles"
                src={tr.url}
                srcLang={tr.language.toLowerCase().slice(0, 2) || 'rw'}
                label={tr.label}
                default={activeTrack?.id === tr.id}
              />
            ))}
          </video>
        ) : (
          <iframe
            key={activeSource.embedUrl}
            src={activeSource.embedUrl}
            title={`${movie.title} — ${activeSource.label}`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        )}

        {/* Live Synchronized Subtitle Overlay */}
        {activeTrack && activeCueText && (
          <div
            data-testid="live-subtitle-overlay"
            className="pointer-events-none absolute inset-x-4 bottom-10 flex justify-center"
          >
            <div
              className="max-w-xl px-3.5 py-1.5 rounded-lg text-center text-xs sm:text-sm font-semibold leading-snug whitespace-pre-line"
              style={{
                background: 'rgba(6,6,12,0.84)',
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {activeCueText}
            </div>
          </div>
        )}
      </div>

      {/* Subtitle Selector & Upload Dock */}
      <div
        className="px-4 py-3 flex flex-wrap items-center justify-between gap-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,16,0.9)' }}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold shrink-0" style={{ color: '#d4cfc0' }}>
            <Subtitles size={14} style={{ color: GOLD_LIGHT }} />
            <span>Subtitles:</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedSubId('off')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
            style={
              selectedSubId === 'off'
                ? { background: 'rgba(255,255,255,0.14)', color: '#f7f4eb' }
                : { background: 'rgba(255,255,255,0.04)', color: '#8a8778' }
            }
          >
            Off
          </button>

          {allTracks.map((tr) => {
            const active = activeTrack?.id === tr.id;
            return (
              <button
                key={tr.id}
                type="button"
                onClick={() => setSelectedSubId(tr.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
                style={
                  active
                    ? {
                        background: 'rgba(34,197,94,0.15)',
                        border: '1px solid rgba(74,222,128,0.4)',
                        color: '#86efac',
                      }
                    : {
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#c8c3b6',
                      }
                }
              >
                {active && <Check size={10} />}
                <span>{tr.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".srt,.vtt"
            onChange={handleUploadSubtitleFile}
            className="hidden"
            aria-label="Load SRT or VTT subtitle file"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            data-testid="load-subtitle-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors hover:bg-white/10"
            style={{
              background: 'rgba(201,168,76,0.12)',
              border: '1px solid rgba(201,168,76,0.3)',
              color: GOLD_LIGHT,
            }}
          >
            <Upload size={11} />
            <span>Load .SRT / .VTT</span>
          </button>

          {activeTrack && (
            <a
              href={activeTrack.url}
              download={`${(movie.title || 'subtitle').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${activeTrack.language.toLowerCase()}.vtt`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#d4cfc0' }}
            >
              <Download size={11} />
              <span>Save Subtitle</span>
            </a>
          )}
        </div>
      </div>

      {subError && (
        <div className="px-4 py-2 text-[11px]" style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)' }}>
          {subError}
        </div>
      )}
    </div>
  );
}
