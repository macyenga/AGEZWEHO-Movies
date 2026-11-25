import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { calculateScrollProgress } from '../lib/scroll-progress';

export default function WatchProgressBar({ label = 'Movie page reading and watch progress' }) {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    let rafId = 0;

    const updateProgress = () => {
      rafId = 0;
      const doc = document.documentElement;
      const body = document.body;
      const scrollTop = window.scrollY || doc.scrollTop || body?.scrollTop || 0;
      const scrollHeight = Math.max(doc.scrollHeight || 0, body?.scrollHeight || 0);
      const clientHeight = window.innerHeight || doc.clientHeight || 0;
      setProgress(calculateScrollProgress({ scrollTop, scrollHeight, clientHeight }));
    };

    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  const rounded = Math.round(progress);

  return createPortal(
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={rounded}
      data-testid="watch-progress-bar"
      data-progress={rounded}
      className="fixed top-0 left-0 right-0 z-[70] h-[3px] pointer-events-none overflow-hidden"
      style={{ background: 'rgba(255, 255, 255, 0.05)' }}
    >
      <div
        data-testid="watch-progress-fill"
        className="h-full w-full will-change-transform"
        style={{
          transform: `scaleX(${progress / 100})`,
          transformOrigin: 'left center',
          transition: 'transform 80ms linear',
          background: 'linear-gradient(90deg, #9a7628 0%, #c9a84c 55%, #f5e4a8 100%)',
          boxShadow: progress > 0 ? '0 0 10px rgba(232, 200, 122, 0.5)' : 'none',
        }}
      />
    </div>,
    document.body
  );
}
