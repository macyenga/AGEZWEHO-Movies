import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import AdBanner from '../components/ads/AdBanner';
import {
  ArrowLeft,
  ExternalLink,
  Tv2,
  Radio,
  Volume2,
  VolumeX,
  Maximize2,
  RefreshCw,
  Globe,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  LIVE_CHANNELS,
  buildProxyStreamUrl,
  selectAutoPlayChannel,
} from '../lib/live-channels';

const LIVE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Live TV Rwanda & 24/7 Live Streams — Agasobanuye.rw',
  url: 'https://agasobanuye.rw/live',
  description:
    'Watch Rwanda Live TV channels (Rwanda TV, KC2, Isibo TV, TV10, B+ TV) and 24/7 international live broadcasts playing directly inside the Agasobanuye.rw Live Theater.',
};

export default function LivePage() {
  const [channels, setChannels] = useState(() =>
    LIVE_CHANNELS.map((ch) => ({
      ...ch,
      proxyUrl: buildProxyStreamUrl(ch.url),
      online: null,
    }))
  );
  const [activeChannelId, setActiveChannelId] = useState(LIVE_CHANNELS[0].id);
  const [playerStatus, setPlayerStatus] = useState('loading'); // 'loading' | 'playing' | 'fallback' | 'error'
  const [statusMessage, setStatusMessage] = useState('Connecting to live broadcast...');
  const [muted, setMuted] = useState(true);
  const [probeReady, setProbeReady] = useState(false);

  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const triedIdsRef = useRef(new Set());
  const userSelectedRef = useRef(false);

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId) || channels[0],
    [channels, activeChannelId]
  );

  // Probe live stream health on entry so an online channel auto-starts immediately
  useEffect(() => {
    let mounted = true;
    fetch('/api/live/status')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted || !Array.isArray(data?.channels)) return;
        setChannels(data.channels);
        setProbeReady(true);

        if (!userSelectedRef.current && data.recommendedChannelId) {
          setActiveChannelId(data.recommendedChannelId);
        }
      })
      .catch(() => {
        if (mounted) setProbeReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const switchToNextHealthyChannel = useCallback(
    (failedId) => {
      triedIdsRef.current.add(failedId);

      // Prefer a verified online channel not yet tried
      const nextOnline = channels.find(
        (ch) => !triedIdsRef.current.has(ch.id) && ch.online === true
      );
      if (nextOnline) {
        setPlayerStatus('fallback');
        setStatusMessage(`Stream offline — auto-switching to ${nextOnline.label}...`);
        setActiveChannelId(nextOnline.id);
        return true;
      }

      // Otherwise try next untested channel
      const nextCandidate = channels.find((ch) => !triedIdsRef.current.has(ch.id));
      if (nextCandidate) {
        setPlayerStatus('fallback');
        setStatusMessage(`Trying ${nextCandidate.label} live feed...`);
        setActiveChannelId(nextCandidate.id);
        return true;
      }

      return false;
    },
    [channels]
  );

  // Initialize self-playing HLS stream through our SSRF-safe HTTPS relay proxy
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !activeChannel) return undefined;

    let cancelled = false;
    setPlayerStatus('loading');
    setStatusMessage(`Connecting to ${activeChannel.label}...`);

    const streamSrc = activeChannel.proxyUrl || buildProxyStreamUrl(activeChannel.url) || activeChannel.url;

    async function mountHls() {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      try {
        const HlsModule = await import('hls.js');
        const Hls = HlsModule.default || HlsModule;

        if (cancelled || !videoRef.current) return;

        if (Hls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 30,
          });
          hlsRef.current = hls;
          hls.loadSource(streamSrc);
          hls.attachMedia(videoRef.current);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (cancelled || !videoRef.current) return;
            videoRef.current.muted = muted;
            videoRef.current
              .play()
              .then(() => {
                if (!cancelled) {
                  setPlayerStatus('playing');
                  setStatusMessage(`Live · ${activeChannel.label}`);
                }
              })
              .catch(() => {
                // Ensure muted autoplay works across strict browser policies
                if (videoRef.current) {
                  videoRef.current.muted = true;
                  setMuted(true);
                  videoRef.current.play().catch(() => {});
                }
                if (!cancelled) {
                  setPlayerStatus('playing');
                  setStatusMessage(`Live · ${activeChannel.label}`);
                }
              });
          });

          hls.on(Hls.Events.ERROR, (_, data) => {
            if (!data?.fatal || cancelled) return;
            hls.destroy();
            hlsRef.current = null;

            const switched = switchToNextHealthyChannel(activeChannel.id);
            if (!switched) {
              setPlayerStatus('error');
              setStatusMessage('This stream is currently offline. Select another channel or open external stream.');
            }
          });
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = streamSrc;
          videoRef.current.muted = muted;
          videoRef.current
            .play()
            .then(() => {
              if (!cancelled) {
                setPlayerStatus('playing');
                setStatusMessage(`Live · ${activeChannel.label}`);
              }
            })
            .catch(() => {
              if (!cancelled) setPlayerStatus('playing');
            });
        } else {
          setPlayerStatus('error');
          setStatusMessage('Browser does not support HLS live playback.');
        }
      } catch {
        if (!cancelled) {
          setPlayerStatus('error');
          setStatusMessage('Could not initialize live player.');
        }
      }
    }

    mountHls();

    return () => {
      cancelled = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeChannel, switchToNextHealthyChannel]); // intentionally omit muted to avoid reloading stream on unmute

  const handleToggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (!nextMuted && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleFullscreen = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  };

  const handleSelectChannel = (ch) => {
    userSelectedRef.current = true;
    triedIdsRef.current.clear();
    setActiveChannelId(ch.id);
  };

  const handleManualRetry = () => {
    triedIdsRef.current.clear();
    setPlayerStatus('loading');
    const recommended = selectAutoPlayChannel(channels, {});
    setActiveChannelId((prev) => (prev === activeChannel?.id ? prev : recommended?.id || prev));
    // Re-trigger probe
    fetch('/api/live/status')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.channels)) setChannels(d.channels);
      })
      .catch(() => {});
  };

  const rwandaChannels = channels.filter((c) => c.category === 'Rwanda TV');
  const globalChannels = channels.filter((c) => c.category !== 'Rwanda TV');

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Live TV — Rwanda Channels &amp; 24/7 Live Theater"
        description="Watch Live Rwanda TV channels (Rwanda TV, KC2, Isibo TV, TV10, B+ TV) and 24/7 live broadcasts playing automatically in your browser on Agasobanuye.rw."
        keywords="agasobanuye live, live TV Rwanda, Rwanda TV live, KC2 live, Isibo TV live, TV10 Rwanda live, B+ TV live, Kigali live TV"
        canonical="https://agasobanuye.rw/live"
        jsonLd={LIVE_JSON_LD}
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-28 md:pt-24 pb-24 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline mb-2"
              style={{ color: 'var(--text2)' }}
            >
              <ArrowLeft size={13} /> Back to Catalog
            </Link>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
              >
                <Radio size={18} style={{ color: 'var(--gold2)' }} />
              </div>
              <div>
                <h1
                  className="font-cinzel font-bold text-xl sm:text-2xl"
                  style={{ fontFamily: 'Cinzel,serif', color: 'var(--gold2)' }}
                >
                  Live TV Theater
                </h1>
                <p className="text-xs" style={{ color: 'var(--text2)' }}>
                  Auto-playing Rwanda TV &amp; 24/7 global streams via HTTPS live relay
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger)',
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--danger)' }} />
              <span>LIVE AUTO-PLAY</span>
            </span>
            <button
              type="button"
              onClick={handleManualRetry}
              className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Refresh Feeds</span>
            </button>
          </div>
        </div>

        {/* Inline Self-Playing Live Theater */}
        <section
          aria-label="Live broadcast player"
          data-testid="live-theater-player"
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--accent-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Active Channel Header Bar */}
          <div
            className="px-4 py-3 flex flex-wrap items-center justify-between gap-3"
            style={{ background: 'var(--bg-card-subtle)', borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Tv2 size={18} style={{ color: 'var(--gold2)' }} />
              <div className="min-w-0">
                <div className="text-sm font-bold truncate flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <span data-testid="active-live-channel-title">{activeChannel?.label}</span>
                  {activeChannel?.quality && (
                    <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--gold2)' }}>
                      · {activeChannel.quality}
                    </span>
                  )}
                </div>
                <p className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>
                  {activeChannel?.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMute}
                data-testid="live-mute-toggle"
                className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                <span>{muted ? 'Unmute Sound' : 'Sound On'}</span>
              </button>

              <button
                type="button"
                onClick={handleFullscreen}
                className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                aria-label="Fullscreen live player"
              >
                <Maximize2 size={13} />
                <span className="hidden sm:inline">Fullscreen</span>
              </button>

              {activeChannel?.url && (
                <a
                  href={activeChannel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                >
                  <ExternalLink size={12} />
                  <span className="hidden sm:inline">VLC / External</span>
                </a>
              )}
            </div>
          </div>

          {/* Video Stage */}
          <div className="relative bg-black aspect-video w-full">
            <video
              ref={videoRef}
              autoPlay
              muted={muted}
              playsInline
              controls
              data-testid="live-video-element"
              className="w-full h-full object-contain"
            />

            {(playerStatus === 'loading' || playerStatus === 'fallback') && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-center px-4">
                <Loader2 size={28} className="animate-spin text-amber-300" />
                <span className="text-xs font-medium text-amber-100">{statusMessage}</span>
              </div>
            )}

            {playerStatus === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85 text-center p-6">
                <AlertCircle size={32} className="text-amber-300" />
                <p className="text-sm font-semibold text-stone-100">{statusMessage}</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectChannel(channels.find((c) => c.id === 'dw-news') || channels[0])}
                    className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Switch to 24/7 Live Feed
                  </button>
                  {activeChannel?.url && (
                    <a
                      href={activeChannel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <ExternalLink size={12} /> Open Direct URL
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Channel Directory: Rwanda TV */}
        <section aria-label="Rwanda Live TV channels" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-cinzel font-bold text-base sm:text-lg" style={{ fontFamily: 'Cinzel,serif', color: 'var(--text)' }}>
              Rwanda Live TV Channels
            </h2>
            <span className="text-xs tabular-nums" style={{ color: 'var(--muted)' }}>
              {probeReady ? `${rwandaChannels.filter((c) => c.online).length}/${rwandaChannels.length} live` : `${rwandaChannels.length} channels`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rwandaChannels.map((ch) => {
              const isSelected = ch.id === activeChannel?.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  data-testid={`live-channel-card-${ch.id}`}
                  onClick={() => handleSelectChannel(ch)}
                  className="p-4 rounded-xl text-left transition-all cursor-pointer flex items-start justify-between gap-3"
                  style={
                    isSelected
                      ? {
                          background: 'var(--accent-bg)',
                          border: '1px solid var(--gold)',
                          boxShadow: 'var(--shadow-card)',
                        }
                      : {
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          boxShadow: 'var(--shadow-card)',
                        }
                  }
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold truncate" style={{ color: isSelected ? 'var(--gold2)' : 'var(--text)' }}>
                        {ch.label}
                      </span>
                      {ch.online === true && (
                        <CheckCircle2 size={13} style={{ color: 'var(--green)' }} className="shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] tabular-nums" style={{ color: 'var(--muted)' }}>
                      {ch.lang} · {ch.quality} · {ch.badge}
                    </div>
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--text2)' }}>
                      {ch.description}
                    </p>
                  </div>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: isSelected ? 'var(--gold)' : 'var(--bg-ghost)',
                      color: isSelected ? 'var(--accent-ink)' : 'var(--gold2)',
                    }}
                  >
                    <Play size={13} fill="currentColor" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Global 24/7 Live Streams */}
        <section aria-label="Global 24/7 live channels" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-cinzel font-bold text-base sm:text-lg flex items-center gap-2" style={{ fontFamily: 'Cinzel,serif', color: 'var(--text)' }}>
              <Globe size={16} style={{ color: 'var(--blue)' }} />
              <span>24/7 Global Live Streams</span>
            </h2>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              Always-on live feeds
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {globalChannels.map((ch) => {
              const isSelected = ch.id === activeChannel?.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  data-testid={`live-channel-card-${ch.id}`}
                  onClick={() => handleSelectChannel(ch)}
                  className="p-4 rounded-xl text-left transition-all cursor-pointer flex items-start justify-between gap-3"
                  style={
                    isSelected
                      ? {
                          background: 'var(--accent-bg)',
                          border: '1px solid var(--gold)',
                          boxShadow: 'var(--shadow-card)',
                        }
                      : {
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          boxShadow: 'var(--shadow-card)',
                        }
                  }
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold truncate" style={{ color: isSelected ? 'var(--gold2)' : 'var(--text)' }}>
                        {ch.label}
                      </span>
                      {ch.online === true && (
                        <CheckCircle2 size={13} style={{ color: 'var(--green)' }} className="shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                      {ch.lang} · {ch.badge}
                    </div>
                  </div>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: isSelected ? 'var(--gold)' : 'var(--bg-ghost)',
                      color: isSelected ? 'var(--accent-ink)' : 'var(--blue)',
                    }}
                  >
                    <Play size={13} fill="currentColor" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <AdBanner size="728x90" className="mt-6" />
      </div>
    </div>
  );
}
