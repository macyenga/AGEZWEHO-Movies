import { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';

const SIZE_STYLES = {
  '160x300': { maxWidth: 160, minHeight: 300 },
  '160x600': { maxWidth: 160, minHeight: 600 },
  '300x250': { maxWidth: 300, minHeight: 250 },
  '320x50': { maxWidth: 320, minHeight: 50 },
  '468x60': { maxWidth: 468, minHeight: 60 },
  '728x90': { maxWidth: 728, minHeight: 90 },
};

export default function AdBanner({ size = '300x250', slotId = '', className = '' }) {
  const { isPro } = useAuth();
  const pushedRef = useRef(false);
  const slot = slotId || process.env.NEXT_PUBLIC_ADSENSE_SLOT || '';

  useEffect(() => {
    if (isPro || !ADSENSE_CLIENT || !slot || pushedRef.current) return;
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      }
    } catch {
      // Ignore AdSense push failures when blocked by adblockers or unconfigured slots
    }
  }, [isPro, slot]);

  if (isPro || !ADSENSE_CLIENT || !slot) return null;

  const dims = SIZE_STYLES[size] || SIZE_STYLES['300x250'];

  return (
    <aside
      aria-label="Advertisement"
      className={`flex flex-col items-center justify-center overflow-hidden mx-auto w-full ${className}`}
      style={{ maxWidth: dims.maxWidth }}
    >
      <span
        className="text-[10px] uppercase tracking-[0.14em] mb-1.5"
        style={{ color: '#6b685c' }}
      >
        Advertisement
      </span>
      <ins
        className="adsbygoogle block w-full"
        style={{ display: 'block', minHeight: dims.minHeight }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot || undefined}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

export function NativeBanner({ className = '' }) {
  return <AdBanner size="728x90" className={className} />;
}

// Disabled popunder/social-bar injectors cleanly to maintain Google AdSense policy compliance
export function Popunder() {
  return null;
}

export function SocialBar() {
  return null;
}

export function SmartLink() {
  return null;
}
