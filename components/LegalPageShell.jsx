import Link from 'next/link';
import SEOHead from './SEOHead';
import CinematicBackground from './CinematicBackground';
import { ArrowLeft } from 'lucide-react';

const GOLD = '#c9a84c';
const GOLD_LIGHT = '#e8c87a';

const LEGAL_NAV = [
  { href: '/about', label: 'About Us' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/dmca', label: 'DMCA & Copyright' },
  { href: '/contact', label: 'Contact' },
];

export default function LegalPageShell({
  title,
  description,
  canonical,
  eyebrow,
  updatedAt = 'November 25, 2026',
  activeHref,
  children,
}) {
  return (
    <div className="min-h-screen bg-deep relative overflow-x-hidden">
      <SEOHead title={`${title} — Agasobanuye.rw`} description={description} canonical={canonical} />
      <CinematicBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium transition-colors hover:text-amber-300"
            style={{ color: '#9c988b' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Catalog</span>
          </Link>

          <nav aria-label="Policy and publisher pages" className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {LEGAL_NAV.map((item) => {
              const active = item.href === activeHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xs font-medium whitespace-nowrap transition-colors hover:text-[#e8c87a]"
                  style={{ color: active ? GOLD_LIGHT : '#8a8778' }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <header className="pb-6 mb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-medium mb-2" style={{ color: GOLD }}>
            {eyebrow}
          </div>
          <h1
            className="font-cinzel font-bold leading-tight mb-2"
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)',
              color: '#f7f4eb',
              textWrap: 'balance',
            }}
          >
            {title}
          </h1>
          <p className="text-xs tabular-nums" style={{ color: '#8a8778' }}>
            Last updated: {updatedAt} · Operator: Iradukunda Didier (Agasobanuye.rw)
          </p>
        </header>

        <article
          className="rounded-2xl p-6 sm:p-8 space-y-7 text-sm sm:text-[15px] leading-[1.75]"
          style={{
            background: 'rgba(14,14,22,0.84)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#c8c3b6',
          }}
        >
          {children}
        </article>
      </div>
    </div>
  );
}
