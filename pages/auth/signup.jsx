import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SEOHead from '../../components/SEOHead';
import CinematicBackground from '../../components/CinematicBackground';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, UserPlus, Eye, EyeOff, CheckCircle2, Mail, Lock, User } from 'lucide-react';
import AdBanner from '../../components/ads/AdBanner';

export default function Signup() {
  const { user, loading: authLoading, signup } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (user) router.replace('/games');
  }, [user, authLoading]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) { setError('All fields required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPwd) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      await signup(email, password, name.trim());
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-deep flex items-center justify-center">
      <CinematicBackground />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center px-6 max-w-md">
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
          <CheckCircle2 size={56} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
        </motion.div>
        <h2 className="font-cinzel text-2xl mb-3" style={{ fontFamily: 'Cinzel,serif', color: '#22c55e' }}>Account Created!</h2>
        <p className="text-sm mb-6" style={{ color: '#8a8778' }}>You can now sign in to access premium content.</p>
        <Link href="/auth/login">
          <motion.div whileHover={{ scale: 1.03 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#e8c87a' }}>
            Sign In
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-deep flex items-center justify-center">
      <SEOHead
        title="Sign Up"
        description="Create your Agasobanuye.rw account — vote for movie requests, build your collection, and unlock premium content."
        canonical="https://agasobanuye.rw/auth/signup"
      />
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
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <UserPlus size={20} style={{ color: '#22c55e' }} />
            </div>
            <h1 className="font-cinzel text-xl" style={{ fontFamily: 'Cinzel,serif', color: '#22c55e' }}>Create Account</h1>
            <p className="text-xs mt-1" style={{ color: '#6a6a5a' }}>Sign up to access premium content</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-2.5 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color: '#6a6a5a' }}>Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a4a3a' }} />
                <input type="text" className="input-dark w-full px-9 py-2.5 rounded-lg text-sm" value={name}
                  onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
            </div>
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
                  value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#4a4a3a' }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color: '#6a6a5a' }}>Confirm Password</label>
              <input type={showPwd ? 'text' : 'password'} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm"
                value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Repeat password" />
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs" style={{ color: '#6a6a5a' }}>
              Already have an account?{' '}
              <Link href="/auth/login"><span style={{ color: '#c9a84c' }}>Sign in</span></Link>
            </p>
          </div>
        </motion.div>

        <AdBanner size="728x90" className="mt-8 mb-2" />
      </div>
    </div>
  );
}
