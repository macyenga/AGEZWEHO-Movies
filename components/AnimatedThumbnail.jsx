import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Film } from 'lucide-react';

export default function AnimatedThumbnail({
  slides = [],
  alt = '',
  fallbackTitle = '',
  active = false,
  autoSlide = false,
  intervalMs = 3800,
  aspectClass = 'aspect-[2/3]',
  className = '',
  imgClassName = '',
}) {
  const prefersReducedMotion = useReducedMotion();
  const validSlides = Array.isArray(slides) ? slides.filter(Boolean) : [];
  const [index, setIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState({});

  useEffect(() => {
    setIndex(0);
  }, [validSlides.length]);

  useEffect(() => {
    if (prefersReducedMotion || validSlides.length <= 1) return;
    if (!active && !autoSlide) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % validSlides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [active, autoSlide, intervalMs, prefersReducedMotion, validSlides.length]);

  const currentUrl = validSlides[index % Math.max(1, validSlides.length)] || '';
  const isBroken = !currentUrl || Boolean(failedUrls[currentUrl]);

  return (
    <div
      data-testid="animated-thumbnail"
      data-slide-count={validSlides.length}
      className={`relative ${aspectClass} w-full overflow-hidden bg-[#12121b] ${className}`}
    >
      {isBroken ? (
        <div
          className="w-full h-full flex flex-col items-center justify-center gap-1.5 px-3 text-center"
          style={{ background: 'linear-gradient(145deg, #171724 0%, #0d0d14 100%)' }}
        >
          <Film size={28} style={{ color: '#c9a84c', opacity: 0.4 }} />
          {fallbackTitle && (
            <span className="text-[10px] font-medium line-clamp-2" style={{ color: '#8a8778' }}>
              {fallbackTitle}
            </span>
          )}
        </div>
      ) : validSlides.length > 1 && !prefersReducedMotion ? (
        <AnimatePresence initial={false} mode="popLayout">
          <motion.img
            key={`${currentUrl}-${index}`}
            src={currentUrl}
            alt={alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            initial={{ opacity: 0.2, x: '18%', scale: 1.04 }}
            animate={{ opacity: 1, x: active ? '-2%' : '0%', scale: active ? 1.07 : 1.02 }}
            exit={{ opacity: 0, x: '-18%' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            onError={() => setFailedUrls((prev) => ({ ...prev, [currentUrl]: true }))}
            className={`w-full h-full object-cover will-change-transform ${imgClassName}`}
          />
        </AnimatePresence>
      ) : (
        <motion.img
          src={currentUrl}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          animate={
            prefersReducedMotion
              ? { x: 0, scale: 1 }
              : active
              ? { x: '-3%', scale: 1.09 }
              : autoSlide
              ? { x: ['1.5%', '-2.5%', '1.5%'], scale: 1.08 }
              : { x: '0%', scale: 1 }
          }
          transition={
            autoSlide && !active && !prefersReducedMotion
              ? { duration: 7, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
          }
          onError={() => setFailedUrls((prev) => ({ ...prev, [currentUrl]: true }))}
          className={`w-full h-full object-cover will-change-transform ${imgClassName}`}
        />
      )}

      {validSlides.length > 1 && (
        <div
          aria-hidden="true"
          className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full"
          style={{ background: 'rgba(8,8,14,0.65)', backdropFilter: 'blur(4px)' }}
        >
          {validSlides.slice(0, 4).map((_, i) => (
            <span
              key={i}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === index ? '12px' : '4px',
                background: i === index ? '#e8c87a' : 'rgba(255,255,255,0.35)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
