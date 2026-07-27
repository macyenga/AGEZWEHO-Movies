import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import CinematicBackground from '../../components/CinematicBackground';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, LogIn, Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';

export default function Login() {
  const { user, loading: authLoading, login, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (user) router.replace(router.query.redirect || '/games');
  }, [user, authLoading]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError('All fields required'); return; }
    setLoading(true); setError('');
    try {
      await login(email, password);
      const redirect = router.query.redirect || '/games';
      router.push(redirect);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep flex items-center justify-center">
      <Head><title>Login — Agezweho Movies</title></Head>
      <CinematicBackground />
      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div initial={{ opacity: 0, x: -14 }} className="mb-6">
          <Link href="/">
            <motion.div whileHover={{ x: -3 }} className="inline-flex items-center gap-1.5 text-xs"
              style={{ color: '#6a6a5a' }}>
              <ArrowLeft size={13} /> Back to Home
            </motion.div>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(201,168,76,0.15)', backdropFilter: 'blur(20px)' }}>
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <LogIn size={20} style={{ color: '#c9a84c' }} />
            </div>
            <h1 className="font-cinzel text-xl" style={{ fontFamily: 'Cinzel,serif', color: '#e8c87a' }}>Welcome Back</h1>
            <p className="text-xs mt-1" style={{ color: '#6a6a5a' }}>Sign in to access premium content</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-2.5 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color: '#6a6a5a' }}>Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a4a3a' }} />
                <input type="email" className="input-dark w-full px-9 py-2.5 rounded-lg text-sm" value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color: '#6a6a5a' }}>Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a4a3a' }} />
                <input type={showPwd ? 'text' : 'password'} className="input-dark w-full px-9 py-2.5 rounded-lg text-sm pr-10"
                  value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#4a4a3a' }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#e8c87a' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          {isAdmin && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <Link href="/admin">
                <motion.div whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                  <Shield size={13} /> Admin Panel
                </motion.div>
              </Link>
            </motion.div>
          )}

          <div className="mt-5 text-center">
            <p className="text-xs" style={{ color: '#6a6a5a' }}>
              No account?{' '}
              <Link href="/auth/signup"><span style={{ color: '#c9a84c' }}>Sign up</span></Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
