import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Film, Inbox, Plus, Heart, Send, Gamepad2, Home, Mail, LogIn, User, Shield, Menu, X, Search } from 'lucide-react';
import { useCollection } from '../hooks/useCollection';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const bgO = useTransform(scrollY, [0, 60], [0, 1]);
  const { collection } = useCollection();
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
   { href: '/',         label: 'Explore',     icon: Home     },
   { href: '/finder',   label: 'Finder',       icon: Search   },
   { href: '/requests', label: 'Requests',    icon: Inbox    },
   { href: '/games',    label: 'Premium',     icon: Gamepad2 },
    { href: '/submit',   label: 'Add Agasobanuye',   icon: Plus     },
   { href: '/contact',  label: 'Contact',     icon: Mail     },
   { href: '/support',  label: 'Support',     icon: Heart    },
 ];
  return (
    <motion.nav className="fixed top-0 left-0 right-0 z-50">
      <motion.div
        className="absolute inset-0"
        style={{ opacity: bgO, background: 'rgba(8,8,18,0.92)', borderBottom: '1px solid rgba(201,168,76,0.08)', backdropFilter: 'blur(24px)' }}
      />

      <div className="relative max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

        {/* Logo icon only */}
        <Link href="/">
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="relative cursor-pointer">
          
           
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))', border: '1px solid rgba(201,168,76,0.4)' }}>
              <Film size={17} style={{ color: '#e8c87a' }} />
            </div>
          </motion.div>
        </Link>

        {/* Desktop nav links */}
       <div className="hidden sm:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = router.pathname === href;
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all overflow-hidden"
                  style={active ? {
                    color: '#e8c87a',
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.25)',
                  } : {
                    color: '#8a8778',
                    border: '1px solid transparent',
                  }}
                >
                  {active && (
                    <motion.div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(105deg,transparent 30%,rgba(201,168,76,0.1) 50%,transparent 70%)' }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', repeatDelay: 2 }}
                    />
                  )}
                  <Icon size={14} />
                  <span className="hidden sm:block tracking-wide">{label}</span>
                  {active && (
                    <motion.div layoutId="nav-dot"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: '#c9a84c' }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-1">
              {isAdmin && (
                <Link href="/admin">
                  <motion.div whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{ color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <Shield size={12} />
                    <span className="hidden sm:block">Admin</span>
                  </motion.div>
                </Link>
              )}
              <Link href="/games">
                <motion.div whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                  <User size={13} />
                  <span className="hidden sm:block max-w-[80px] truncate">{user.email?.split('@')[0]}</span>
                </motion.div>
              </Link>
              <motion.button onClick={logout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-3 py-2 rounded-xl text-xs font-semibold"
                style={{ color: '#6a6a5a', border: '1px solid transparent' }}>
                Exit
              </motion.button>
            </div>
          ) : (
            <Link href="/auth/login">
              <motion.div whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: '#e8c87a' }}>
                <LogIn size={13} />
                <span className="hidden sm:block tracking-wide">Sign</span>
              </motion.div>
            </Link>
          )}

          {/* Telegram */}
          <motion.a
            href="https://t.me/+n3etNnm3RxI5NGZl"
            target="_blank" rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold relative overflow-hidden"
            style={{ background: 'rgba(34,158,217,0.1)', border: '1px solid rgba(34,158,217,0.25)', color: '#4fc3f7' }}
          >
            <motion.div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(105deg,transparent 30%,rgba(79,195,247,0.1) 50%,transparent 70%)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', repeatDelay: 2 }}
            />
            <Send size={13} />
            <span className="hidden sm:block tracking-wide">Telegram</span>
          </motion.a>

          {/* Collection */}
          <Link href="/collection">
            <motion.div
              whileHover={{ scale: 1.08, y: -1 }} whileTap={{ scale: 0.95 }}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl"
              style={router.pathname === '/collection'
                ? { background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }
                : { border: '1px solid transparent' }
              }
            >
              <motion.div
                animate={collection.length > 0 ? { scale: [1, 1.25, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                <Heart size={16} fill={collection.length > 0 ? '#c9a84c' : 'none'}
                  style={{ color: collection.length > 0 ? '#c9a84c' : '#6a6a5a' }} />
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
        </div>

        {/* Mobile hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <Link href="/collection">
            <motion.div whileTap={{ scale: 0.9 }}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl"
              style={{ border: '1px solid transparent' }}>
              <Heart size={16} fill={collection.length > 0 ? '#c9a84c' : 'none'}
                style={{ color: collection.length > 0 ? '#c9a84c' : '#6a6a5a' }} />
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
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            {mobileOpen ? <X size={16} style={{ color:'#c9a84c' }} /> : <Menu size={16} style={{ color:'#8a8778' }} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="absolute top-full left-0 right-0 sm:hidden"
            style={{ background: 'rgba(8,8,18,0.96)', borderBottom: '1px solid rgba(201,168,76,0.08)', backdropFilter: 'blur(24px)' }}>
            <div className="max-w-6xl mx-auto px-5 py-4 space-y-1">
              {links.map(({ href, label, icon: Icon }) => {
                const active = router.pathname === href;
                return (
                  <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                    <motion.div whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                      style={active ? { background: 'rgba(201,168,76,0.1)', color: '#e8c87a' } : { color: '#8a8778' }}>
                      <Icon size={16} />
                      {label}
                    </motion.div>
                  </Link>
                );
              })}
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
                        <Shield size={16} /> Admin
                      </motion.div>
                    </Link>
                  )}
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm w-full text-left" style={{ color: '#6a6a5a' }}>
                    Exit
                  </motion.button>
                </>
              ) : (
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                  <motion.div whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ color: '#e8c87a' }}>
                    <LogIn size={16} /> Sign In
                  </motion.div>
                </Link>
              )}
              <motion.a href="https://t.me/+n3etNnm3RxI5NGZl" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ color: '#4fc3f7' }}>
                <Send size={16} /> Telegram
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
