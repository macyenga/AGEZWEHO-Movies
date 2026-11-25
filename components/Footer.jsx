import Link from 'next/link';
import {
  Film,
  Send,
  MessageCircle,
  Camera,
  Music2,
  Play,
  Globe,
  AtSign,
  HeartHandshake,
  ArrowUpRight,
} from 'lucide-react';
import { getSocialConfig, getAllSocialLinks } from '../lib/social-config';
import { useDonate } from '../contexts/DonateContext';
import { useLanguage } from '../contexts/LanguageContext';

const GOLD = '#c9a84c';
const SOCIAL_ICONS = {
  telegram: Send,
  whatsapp: MessageCircle,
  instagram: Camera,
  tiktok: Music2,
  youtube: Play,
  facebook: Globe,
  x: AtSign,
};

export default function Footer() {
  const { openDonate } = useDonate();
  const { t, tr } = useLanguage();
  const config = getSocialConfig();
  const socialLinks = getAllSocialLinks();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: '/', label: t.footer.links.explore },
    { href: '/finder', label: t.footer.links.finder },
    { href: '/subtitles', label: 'Subtitles (RW)' },
    { href: '/requests', label: t.footer.links.requests },
    { href: '/collection', label: t.footer.links.watchlist },
    { href: '/earnings', label: t.footer.links.earnings },
    { href: '/support', label: t.footer.links.support },
    { href: '/contact', label: t.footer.links.contact },
  ];

  return (
    <footer
      id="site-footer"
      data-testid="site-footer"
      className="relative z-10 mt-12 border-t"
      style={{
        background: 'rgba(8, 8, 16, 0.92)',
        borderColor: 'rgba(201, 168, 76, 0.14)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <div className="divider-gold w-full opacity-50" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-24 sm:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.22), rgba(201,168,76,0.08))',
                  border: '1px solid rgba(201,168,76,0.4)',
                }}
              >
                <Film size={17} style={{ color: '#e8c87a' }} />
              </div>
              <div className="flex flex-col">
                <span
                  className="font-cinzel font-bold text-sm tracking-wider leading-none"
                  style={{
                    background: 'linear-gradient(135deg, #f5e4a8, #c9a84c)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  AGASOBANUYE.RW
                </span>
                <span className="text-[10px] tracking-widest uppercase mt-1" style={{ color: '#8a8778' }}>
                  {t.footer.subtitle}
                </span>
              </div>
            </Link>
            <p className="text-xs leading-relaxed max-w-sm" style={{ color: '#8a8778' }}>
              {t.footer.descriptionPrefix}{' '}
              <span style={{ color: '#e8e4d8' }}>{config.merchantName}</span>.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[3px] mb-3" style={{ color: GOLD }}>
              {t.footer.browseHeading}
            </h3>
            <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-4 gap-y-2">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xs whitespace-nowrap transition-colors hover:text-[#e8c87a]"
                  style={{ color: '#b8b4a8' }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Media Links */}
          <div className="md:col-span-4">
            <h3 className="text-[10px] font-semibold uppercase tracking-[3px] mb-3" style={{ color: GOLD }}>
              {t.footer.connectHeading}
            </h3>
            <div
              data-testid="footer-social-links"
              className="flex flex-wrap items-center gap-2.5"
            >
              {socialLinks.map((social) => {
                const Icon = SOCIAL_ICONS[social.id] || MessageCircle;
                return (
                  <a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`footer-social-${social.id}`}
                    aria-label={social.ariaLabel}
                    title={social.ariaLabel}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl inline-flex items-center gap-2 text-xs font-medium whitespace-nowrap transition-transform hover:-translate-y-0.5"
                    style={{
                      background: social.bgColor,
                      border: `1px solid ${social.borderColor}`,
                      color: '#f0eee8',
                    }}
                  >
                    <Icon size={16} style={{ color: social.accentColor }} aria-hidden="true" />
                    <span>{social.name}</span>
                    <ArrowUpRight size={12} style={{ color: '#8a8778' }} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Legal & Support Row */}
        <div
          className="mt-8 pt-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-[11px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#6a6a5a' }}
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="tabular-nums">
              &copy; {currentYear} {config.merchantName} · Agasobanuye.rw. {t.footer.rights}
            </p>
            <nav aria-label="Legal and compliance links" className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link href="/about" className="hover:text-[#e8c87a] transition-colors" style={{ color: '#9c988b' }}>
                About
              </Link>
              <Link href="/privacy-policy" className="hover:text-[#e8c87a] transition-colors" style={{ color: '#9c988b' }}>
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[#e8c87a] transition-colors" style={{ color: '#9c988b' }}>
                Terms
              </Link>
              <Link href="/dmca" className="hover:text-[#e8c87a] transition-colors" style={{ color: '#9c988b' }}>
                DMCA
              </Link>
            </nav>
          </div>

          <button
            type="button"
            onClick={() => openDonate({ defaultAmount: 1000 })}
            data-testid="footer-donate-btn"
            className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors hover:text-[#f5e4a8] whitespace-nowrap"
            style={{ color: '#e8c87a' }}
          >
            <HeartHandshake size={14} />
            <span>{tr('footer.supportButton', { merchant: config.merchantName })}</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
