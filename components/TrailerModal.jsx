import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Play, ExternalLink, Film, Loader2 } from 'lucide-react';
import {
  resolveMovieTrailerVideoId,
  buildYouTubeEmbedUrl,
  buildYouTubeWatchUrl,
} from '../lib/trailers';
import { useLanguage } from '../contexts/LanguageContext';

export default function TrailerModal({ movie, onClose }) {
  const { t } = useLanguage();
  const isOpen = Boolean(movie);
  const directVideoId = movie ? resolveMovieTrailerVideoId(movie) : null;
  const [resolvedId, setResolvedId] = useState(directVideoId);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (!movie) {
      setResolvedId(null);
      setResolving(false);
      return;
    }

    const immediate = resolveMovieTrailerVideoId(movie);
    if (immediate) {
      setResolvedId(immediate);
      setResolving(false);
      return;
    }

    let cancelled = false;
    setResolvedId(null);
    setResolving(true);

    fetch(
      `/api/trailers/resolve?title=${encodeURIComponent(movie.title || '')}&year=${encodeURIComponent(
        movie.year || ''
      )}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.videoId) {
          setResolvedId(data.videoId);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setResolving(false);
      });

    return () => {
      cancelled = true;
    };
  }, [movie]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const activeVideoId = directVideoId || resolvedId;
  const embedUrl = activeVideoId ? buildYouTubeEmbedUrl(activeVideoId, { autoplay: true }) : null;
  const watchUrl = movie ? buildYouTubeWatchUrl(movie, activeVideoId) : '#';

  return (
    <AnimatePresence>
      {isOpen && movie && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${movie.title} Trailer`}
          data-testid="trailer-modal"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{ background: 'rgba(4,4,12,0.88)', backdropFilter: 'blur(10px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'linear-gradient(155deg, rgba(18,18,30,0.98) 0%, rgba(10,10,18,0.99) 100%)',
              border: '1px solid rgba(201,168,76,0.3)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.85)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(201,168,76,0.14)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    color: '#e8c87a',
                  }}
                >
                  <Play size={14} fill="currentColor" />
                </span>
                <div className="min-w-0">
                  <h2
                    className="font-cinzel text-sm sm:text-base font-bold truncate"
                    style={{ color: '#f5e4a8' }}
                  >
                    {movie.title}
                  </h2>
                  <p className="text-[11px] truncate" style={{ color: '#8a8778' }}>
                    {movie.year ? `${movie.year} · ` : ''}
                    {movie.genre || movie.type || t.trailerModal.officialTrailer}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label={t.trailerModal.closeAria}
                data-testid="trailer-modal-close"
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10"
                style={{ color: '#a8a496' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Embedded Autoplay YouTube Player */}
            <div className="relative w-full aspect-video bg-black">
              {embedUrl ? (
                <iframe
                  key={embedUrl}
                  data-testid="trailer-youtube-iframe"
                  src={embedUrl}
                  title={`${movie.title} Official Trailer`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : resolving ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-xs" style={{ color: '#8a8778' }}>
                  <Loader2 size={24} className="animate-spin" style={{ color: '#c9a84c' }} />
                  <span>{t.trailerModal.loading}</span>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-6 text-center">
                  <Film size={32} style={{ color: '#c9a84c' }} />
                  <p className="text-sm font-medium" style={{ color: '#e8e4d8' }}>
                    {t.trailerModal.unavailable}
                  </p>
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                    style={{
                      background: 'rgba(201,168,76,0.2)',
                      border: '1px solid rgba(201,168,76,0.45)',
                      color: '#f5e4a8',
                    }}
                  >
                    {t.trailerModal.watchOnYoutube} <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,8,16,0.9)' }}
            >
              <Link
                href={`/movies/${movie.id}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{
                  background: 'rgba(201,168,76,0.14)',
                  border: '1px solid rgba(201,168,76,0.35)',
                  color: '#e8c87a',
                }}
              >
                <Film size={12} /> {t.trailerModal.openMoviePage}
              </Link>

              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/5"
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#a8a496',
                }}
              >
                {t.trailerModal.openOnYoutube} <ExternalLink size={11} />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
