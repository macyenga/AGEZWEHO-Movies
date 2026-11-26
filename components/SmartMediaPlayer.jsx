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
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  normalizeSubtitles,
  srtToVtt,
  parseVttCues,
} from '../lib/media-preview';
import {
  resolvePreviewSourcesWithTrailerFallback,
  extractExternalDomain,
} from '../lib/editorial';

const GOLD = 'var(--gold)';
const GOLD_LIGHT = 'var(--gold2)';

function withPlaybackParams(source, { mute = true } = {}) {
  if (!source?.embedUrl) return '';
  if (source.playerType === 'video') return source.embedUrl;

  try {
    const parsed = new URL(source.embedUrl);
    if (source.kind === 'youtube') {
      parsed.searchParams.set('autoplay', '1');
      parsed.searchParams.set('playsinline', '1');
      parsed.searchParams.set('mute', mute ? '1' : '0');
    } else if (source.kind === 'vimeo') {
      parsed.searchParams.set('autoplay', '1');
      parsed.searchParams.set('muted', mute ? '1' : '0');
    } else if (source.kind === 'dailymotion') {
      parsed.searchParams.set('autoplay', '1');
      parsed.searchParams.set('mute', mute ? 'true' : 'false');
    }
    return parsed.toString();
  } catch {
    return source.embedUrl;
  }
}

export default function SmartMediaPlayer({
  movie,
  initialSourceId = null,
  initialSubtitleId = null,
  extraTracks = [],
  compact = false,
  autoPlayMuted = true,
  onClose = null,
}) {
  const sources = useMemo(() => resolvePreviewSourcesWithTrailerFallback(movie), [movie]);
  const movieTracks = useMemo(
    () => normalizeSubtitles(movie?.subtitles, movie?.subtitle_url, movie?.language || 'Kinyarwanda'),
    [movie?.subtitles, movie?.subtitle_url, movie?.language]
  );

  const [selectedSourceId, setSelectedSourceId] = useState(initialSourceId || sources[0]?.id || '');
  const [localTracks, setLocalTracks] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState(
    initialSubtitleId || movieTracks[0]?.id || 'off'
  );
  const [mutedPreview, setMutedPreview] = useState(Boolean(autoPlayMuted));
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
  const resolvedEmbedUrl = useMemo(
    () => withPlaybackParams(activeSource, { mute: mutedPreview }),
    [activeSource, mutedPreview]
  );
  const externalHost = activeSource?.url ? extractExternalDomain(activeSource.url) : '';

  useEffect(() => {
    setIframeElapsedSec(0);
    setActiveCueText('');
  }, [activeSource?.id]);

  // Keep HTML5 video element muted state synchronized when toggled
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = mutedPreview;
    }
  }, [mutedPreview, resolvedEmbedUrl]);

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
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
      >
        <Film size={24} className="mx-auto mb-2" style={{ color: GOLD, opacity: 0.7 }} />
        <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>
          No inline preview stream attached for this release yet.
        </p>
        <p className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>
          Use the external watch or download mirrors below, or attach a YouTube, Vimeo, Google Drive, or .MP4 link.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="smart-media-player"
      data-autoplay="true"
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--accent-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Top Source Bar */}
      <div
        className="px-4 py-3 flex flex-wrap items-center justify-between gap-2.5"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card-subtle)' }}
      >
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide min-w-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold shrink-0 mr-1" style={{ color: GOLD_LIGHT }}>
            <Tv2 size={14} />
            <span>{compact ? 'Auto-Playing Preview' : 'Instant Auto-Preview'}</span>
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
                        background: 'var(--accent-bg)',
                        border: '1px solid var(--accent-border)',
                        color: 'var(--gold2)',
                      }
                    : {
                        background: 'var(--bg-ghost)',
                        border: '1px solid var(--border)',
                        color: 'var(--text2)',
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
          <button
            type="button"
            onClick={() => setMutedPreview((v) => !v)}
            data-testid="player-mute-toggle"
            aria-label={mutedPreview ? 'Unmute preview sound' : 'Mute preview sound'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors whitespace-nowrap"
            style={{
              background: mutedPreview ? 'var(--accent-bg)' : 'var(--green-bg)',
              border: mutedPreview ? '1px solid var(--accent-border)' : '1px solid var(--green-border)',
              color: mutedPreview ? GOLD_LIGHT : 'var(--green)',
            }}
          >
            {mutedPreview ? <VolumeX size={12} /> : <Volume2 size={12} />}
            <span>{mutedPreview ? 'Unmute' : 'Sound On'}</span>
          </button>

          {activeSource?.url && (
            <a
              href={activeSource.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="btn-ghost inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap"
            >
              <span>{externalHost ? `Open (${externalHost})` : 'Open Source'}</span>
              <ExternalLink size={11} />
            </a>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Hide preview player"
              className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-ghost-hover)]"
              style={{ color: 'var(--muted)' }}
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
            key={resolvedEmbedUrl}
            ref={videoRef}
            src={resolvedEmbedUrl}
            controls
            autoPlay
            muted={mutedPreview}
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
            key={resolvedEmbedUrl}
            src={resolvedEmbedUrl}
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
        style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card-subtle)' }}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold shrink-0" style={{ color: 'var(--text2)' }}>
            <Subtitles size={14} style={{ color: GOLD_LIGHT }} />
            <span>Subtitles:</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedSubId('off')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
            style={
              selectedSubId === 'off'
                ? { background: 'var(--bg-ghost-hover)', border: '1px solid var(--border2)', color: 'var(--text)' }
                : { background: 'var(--bg-ghost)', border: '1px solid var(--border-subtle)', color: 'var(--muted)' }
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
                        background: 'var(--green-bg)',
                        border: '1px solid var(--green-border)',
                        color: 'var(--green)',
                      }
                    : {
                        background: 'var(--bg-ghost)',
                        border: '1px solid var(--border)',
                        color: 'var(--text2)',
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
            style={{
              background: 'var(--accent-bg)',
              border: '1px solid var(--accent-border)',
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
              className="btn-ghost inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
            >
              <Download size={11} />
              <span>Save Subtitle</span>
            </a>
          )}
        </div>
      </div>

      {subError && (
        <div className="px-4 py-2 text-[11px]" style={{ color: 'var(--danger)', background: 'var(--danger-bg)' }}>
          {subError}
        </div>
      )}
    </div>
  );
}
