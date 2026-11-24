import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Film,
  Inbox,
  Upload,
  Heart,
  Gamepad2,
  Home,
  Mail,
  LogIn,
  User,
  Shield,
  Menu,
  X,
  Search,
  Newspaper,
  ShoppingBag,
  HeartHandshake,
  ChevronDown,
  Crown,
  Wallet,
  Subtitles,
} from 'lucide-react';
import { useCollection } from '../hooks/useCollection';
import { useAuth } from '../contexts/AuthContext';
import { useDonate } from '../contexts/DonateContext';
import { useLanguage } from '../contexts/LanguageContext';
import GlobalSearchInput from './GlobalSearchInput';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const bgO = useTransform(scrollY, [0, 60], [0, 1]);
  const { collection } = useCollection();
  const { user, isAdmin, logout } = useAuth();
  const { openDonate } = useDonate();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  const primaryLinks = [
    { href: '/', label: t.nav.explore, icon: Home },
    { href: '/requests', label: t.nav.requests, icon: Inbox },
    { href: '/news', label: t.nav.news, icon: Newspaper },
  ];

  const secondaryLinks = [
    { href: '/games', label: t.nav.exclusive, icon: Gamepad2 },
    { href: '/shop', label: t.nav.shop, icon: ShoppingBag },
    { href: '/submit', label: t.nav.upload, icon: Upload },
    { href: '/subtitles', label: 'Subtitles (RW)', icon: Subtitles, accent: '#e8c87a' },
    { href: '/earnings', label: t.nav.creatorProgram, icon: Wallet, accent: '#4ade80' },
    { href: '/finder', label: t.nav.finder, icon: Search },
    { href: '/contact', label: t.nav.contact, icon: Mail },
    { href: '/subscribe', label: t.nav.goPro, icon: Crown, accent: '#fbbf24' },
  ];

  const allDrawerLinks = [...primaryLinks, ...secondaryLinks];
  const isMoreActive = secondaryLinks.some((item) => item.href === router.pathname);

  useEffect(() => {
    setMoreOpen(false);
    setMobileOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    if (!moreOpen) return;

    const handleClickOutside = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMoreOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [moreOpen]);

  const navItem = (href, label, Icon, active) => (
    <Link key={href} href={href}>
      <motion.div
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.96 }}
        className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all overflow-hidden whitespace-nowrap"
        style={active ? {
          color: '#e8c87a',
          background: 'rgba(201,168,76,0.12)',
          border: '1px solid rgba(201,168,76,0.3)',
        } : {
          color: '#8a8778',
          border: '1px solid transparent',
        }}
      >
        <Icon size={13} />
        <span className="tracking-wide">{label}</span>
        {active && (
          <motion.div layoutId="nav-dot"
            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
            style={{ background: '#c9a84c' }}
          />
        )}
      </motion.div>
    </Link>
  );

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(8,8,18,0.72)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: bgO, background: 'rgba(8,8,18,0.92)', borderBottom: '1px solid rgba(201,168,76,0.08)' }}
      />

      <div className="relative max-w-[1440px] mx-auto px-3 sm:px-5 h-16 flex items-center justify-between gap-2 lg:gap-3">

        {/* Brand + Minimal Desktop Navigation */}
        <div className="flex items-center gap-1.5 lg:gap-2 flex-shrink-0 min-w-0">
          <Link href="/">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} className="relative cursor-pointer flex items-center gap-2 mr-1">
              <div className="relative w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.25), rgba(201,168,76,0.08))', border: '1px solid rgba(201,168,76,0.45)' }}>
                <Film size={15} style={{ color: '#e8c87a' }} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-cinzel font-bold text-xs sm:text-[13px] tracking-wide leading-none whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #f5e4a8, #c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  AGASOBANUYE<span className="text-[10px] sm:text-[11px] font-semibold text-amber-300">.RW</span>
                </span>
                <span className="text-[8px] uppercase tracking-wider leading-none mt-0.5 truncate max-w-[115px]" style={{ color: '#8a8778' }}>
                  {t.nav.brandSubtitle}
                </span>
              </div>
            </motion.div>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            {primaryLinks.map(({ href, label, icon }) => navItem(href, label, icon, router.pathname === href))}

            {/* Secondary links consolidated in clean More dropdown */}
            <div ref={moreRef} className="relative">
              <motion.button
                type="button"
                onClick={() => setMoreOpen((prev) => !prev)}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                data-testid="nav-more-btn"
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                style={(moreOpen || isMoreActive) ? {
                  color: '#e8c87a',
                  background: 'rgba(201,168,76,0.12)',
                  border: '1px solid rgba(201,168,76,0.3)',
                } : {
                  color: '#8a8778',
                  border: '1px solid transparent',
                }}
              >
                <span className="tracking-wide">{t.nav.more}</span>
                <ChevronDown
                  size={13}
                  className="transition-transform duration-200"
                  style={{ transform: moreOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </motion.button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    role="menu"
                    data-testid="nav-more-menu"
                    className="absolute left-0 top-full mt-2 w-52 rounded-2xl p-1.5 shadow-2xl z-50"
                    style={{
                      background: 'rgba(12,12,24,0.97)',
                      border: '1px solid rgba(201,168,76,0.22)',
                      backdropFilter: 'blur(24px)',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.72)',
                    }}
                  >
                    {secondaryLinks.map(({ href, label, icon: Icon, accent }) => {
                      const active = router.pathname === href;
                      return (
                        <Link
                          key={href}
                          href={href}
                          role="menuitem"
                          onClick={() => setMoreOpen(false)}
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                          style={active ? {
                            color: '#f5e4a8',
                            background: 'rgba(201,168,76,0.14)',
                          } : {
                            color: accent || '#b5b1a2',
                            background: 'transparent',
                          }}
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon size={14} style={{ color: accent || (active ? '#e8c87a' : '#8a8778') }} />
                            <span>{label}</span>
                          </span>
                          {active && (
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: '#c9a84c' }}
                            />
                          )}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Global Search Bar (Tablet & Desktop) */}
        <div className="hidden md:block flex-1 min-w-[140px] lg:max-w-[260px] xl:max-w-[300px] mx-1">
          <GlobalSearchInput
            inputId="global-search-desktop"
            placeholder={t.search.desktopPlaceholder}
          />
        </div>

        {/* Streamlined Desktop Right Actions */}
        <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
          <LanguageSwitcher variant="compact" testIdPrefix="lang" />

          <motion.button
            type="button"
            onClick={() => openDonate()}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold overflow-hidden cursor-pointer whitespace-nowrap"
            style={{
              color: '#e8c87a',
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.28)',
            }}
          >
            <HeartHandshake size={13} style={{ color: '#c9a84c' }} />
            <span className="tracking-wide">{t.nav.donate}</span>
          </motion.button>

          <Link href="/collection" aria-label={t.nav.watchlist} title={t.nav.watchlist}>
            <motion.div
              whileHover={{ scale: 1.08, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center justify-center w-8 h-8 rounded-xl"
              style={router.pathname === '/collection'
                ? { background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }
                : { border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              <motion.div
                animate={collection.length > 0 ? { scale: [1, 1.25, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                <Heart size={15} fill={collection.length > 0 ? '#c9a84c' : 'none'}
                  style={{ color: collection.length > 0 ? '#c9a84c' : '#8a8778' }} />
              </motion.div>
              {collection.length > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: '#c9a84c', color: '#0a0808' }}>
                  {collection.length > 9 ? '9+' : collection.length}
                </motion.span>
              )}
            </motion.div>
          </Link>

          {user ? (
            <div className="flex items-center gap-1 pl-1.5 ml-0.5" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
              {isAdmin && (
                <Link href="/admin">
                  <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap"
                    style={{ color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <Shield size={12} />
                    <span>{t.nav.admin}</span>
                  </motion.div>
                </Link>
              )}
              <motion.button onClick={logout} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap"
                title={user.email}
                style={{ color: '#8a8778', border: '1px solid rgba(255,255,255,0.08)' }}>
                <User size={12} style={{ color: '#4ade80' }} />
                <span>{t.nav.exit}</span>
              </motion.button>
            </div>
          ) : (
            <div className="pl-1.5 ml-0.5" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
              <Link href="/auth/login">
                <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap"
                  style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.28)', color: '#e8c87a' }}>
                  <LogIn size={12} />
                  <span className="tracking-wide">{t.nav.sign}</span>
                </motion.div>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile / Tablet controls */}
        <div className="flex lg:hidden items-center gap-1.5 flex-shrink-0">
          <LanguageSwitcher variant="compact" testIdPrefix="mobile-lang" />
          <Link href="/collection" aria-label={t.nav.watchlist} title={t.nav.watchlist}>
            <motion.div whileTap={{ scale: 0.9 }}
              className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <Heart size={15} fill={collection.length > 0 ? '#c9a84c' : 'none'}
                style={{ color: collection.length > 0 ? '#c9a84c' : '#8a8778' }} />
              {collection.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-[7px] font-bold flex items-center justify-center"
                  style={{ background: '#c9a84c', color: '#0a0808' }}>
                  {collection.length > 9 ? '9+' : collection.length}
                </span>
              )}
            </motion.div>
          </Link>
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t.nav.toggleMenu}
            aria-expanded={mobileOpen}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center cursor-pointer"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            {mobileOpen ? <X size={16} style={{ color: '#c9a84c' }} /> : <Menu size={16} style={{ color: '#8a8778' }} />}
          </motion.button>
        </div>
      </div>

      {/* Global Search Bar (Mobile) */}
      <div
        className="relative md:hidden px-4 pb-2.5 pt-1"
        style={{
          background: 'rgba(8,8,18,0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <GlobalSearchInput
          inputId="global-search-mobile"
          placeholder={t.search.mobilePlaceholder}
        />
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="absolute top-full left-0 right-0 lg:hidden"
            style={{ background: 'rgba(8,8,18,0.96)', borderBottom: '1px solid rgba(201,168,76,0.08)', backdropFilter: 'blur(24px)' }}>
            <div className="max-w-6xl mx-auto px-5 py-4 space-y-1">
              <div className="pb-2 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <LanguageSwitcher variant="expanded" testIdPrefix="drawer-lang" />
              </div>
              {allDrawerLinks.map(({ href, label, icon: Icon, accent }) => {
                const active = router.pathname === href;
                return (
                  <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                    <motion.div whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                      style={active
                        ? { background: 'rgba(201,168,76,0.1)', color: '#e8c87a' }
                        : { color: accent || '#8a8778' }}>
                      <Icon size={16} />
                      {label}
                    </motion.div>
                  </Link>
                );
              })}
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setMobileOpen(false);
                  openDonate();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm w-full text-left cursor-pointer"
                style={{ background: 'rgba(201,168,76,0.08)', color: '#e8c87a' }}
              >
                <HeartHandshake size={16} /> {t.nav.donate}
              </motion.button>
              <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} className="my-2" />
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 text-xs" style={{ color: '#6a6a5a' }}>
                    <User size={13} /> {user.email}
                  </div>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)}>
                      <motion.div whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ color: '#f87171' }}>
                        <Shield size={16} /> {t.nav.admin}
                      </motion.div>
                    </Link>
                  )}
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm w-full text-left" style={{ color: '#6a6a5a' }}>
                    {t.nav.exit}
                  </motion.button>
                </>
              ) : (
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                  <motion.div whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ color: '#e8c87a' }}>
                    <LogIn size={16} /> {t.nav.signIn}
                  </motion.div>
                </Link>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
