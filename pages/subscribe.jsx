import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Crown, CheckCircle2, Loader2, Smartphone } from 'lucide-react';
import SupportUs from '../components/SupportUs';

const PRO_BENEFITS = [
  'No ads on the entire site',
  'Faster content loading',
  'Support Agasobanuye.rw development',
  'Priority for movie requests',
  'Exclusive Pro badge on your profile',
];

export default function Subscribe() {
  const { user, isPro, loading: authLoading } = useAuth();
  const router = useRouter();
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/subscribe');
      return;
    }
    setState('loading');
    setError('');
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/payments/subscribe', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setState('idle');
        return;
      }
      if (data.payment_url) {
        window.location.assign(data.payment_url);
        return;
      }
      setState('done');
    } catch {
      setError('Network error. Please try again.');
      setState('idle');
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Pro Membership — Agasobanuye.rw"
        description="Subscribe to Agasobanuye.rw Pro — remove all ads, get free votes, and unlock premium content on Rwanda's home for Agasobanuye entertainment."
        keywords="Agasobanuye.rw Pro, membership Rwanda, remove ads, premium movies, ad-free streaming Rwanda"
        canonical="https://agasobanuye.rw/subscribe"
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link href="/">
            <motion.div
              whileHover={{ x: -3 }}
              className="inline-flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: '#6a6a5a' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#c9a84c')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6a6a5a')}
            >
              <ArrowLeft size={13} /> Back
            </motion.div>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)' }}
          >
            <Crown size={28} style={{ color: '#e8c87a' }} />
          </motion.div>
          <h1
            className="font-cinzel font-bold text-2xl sm:text-3xl mb-3"
            style={{
              fontFamily: 'Cinzel,serif',
              background: 'linear-gradient(135deg,#f5e4a8,#c9a84c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Pro Membership
          </h1>
          <div className="divider-gold w-20 mx-auto mb-4" />
          <p className="text-sm leading-relaxed" style={{ color: '#8a8778' }}>
            Go Pro and remove all ads from Agasobanuye.rw.
            <br />
            Support the platform and enjoy an ad-free experience.
          </p>
        </motion.div>

        {isPro ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl text-center"
            style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            <CheckCircle2 size={40} style={{ color: '#22c55e' }} className="mx-auto mb-3" />
            <h2 className="font-cinzel font-semibold text-lg mb-2" style={{ fontFamily: 'Cinzel,serif', color: '#22c55e' }}>
              You are Pro!
            </h2>
            <p className="text-xs" style={{ color: '#8a8778' }}>
              You have an active Pro membership. Enjoy an ad-free experience.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl mb-6"
              style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)' }}
            >
              <h2 className="font-cinzel font-semibold text-base mb-4" style={{ fontFamily: 'Cinzel,serif', color: '#e8c87a' }}>
                Why go Pro?
              </h2>
              <div className="space-y-3">
                {PRO_BENEFITS.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={14} style={{ color: '#22c55e', marginTop: 2 }} />
                    <span className="text-xs" style={{ color: '#b8b4a8' }}>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Automated Account Subscription via Paypack */}
            {user ? (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl mb-6"
                style={{ background: 'rgba(255,204,0,0.04)', border: '1px solid rgba(255,204,0,0.2)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,204,0,0.15)', border: '1px solid rgba(255,204,0,0.3)' }}
                  >
                    <Smartphone size={24} style={{ color: '#FFCC00' }} />
                  </div>
                  <div>
                    <h2 className="font-cinzel font-semibold text-lg leading-tight" style={{ fontFamily: 'Cinzel,serif', color: '#FFCC00' }}>
                      Activate Pro via Paypack
                    </h2>
                    <p className="text-xs" style={{ color: '#8a8060' }}>
                      2,000 RWF / month — Merchant: Agasobanuye
                    </p>
                  </div>
                </div>

                {error && (
                  <div
                    className="px-4 py-2 rounded-xl text-xs mb-4"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
                  >
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  <label className="text-xs mb-2 block" style={{ color: '#8a8060' }}>
                    Your MTN MoMo / Airtel number <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <div
                    className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <Smartphone size={16} style={{ color: '#6a6a5a' }} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0788123456"
                      className="flex-1 bg-transparent text-sm outline-none"
                      style={{ color: '#e8e6f0' }}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubscribe}
                  disabled={state === 'loading' || !phone.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold cursor-pointer"
                  style={{
                    background: state === 'loading' || !phone.trim() ? 'rgba(201,168,76,0.05)' : 'rgba(201,168,76,0.16)',
                    border: `1px solid ${state === 'loading' || !phone.trim() ? 'rgba(255,255,255,0.08)' : 'rgba(201,168,76,0.35)'}`,
                    color: state === 'loading' || !phone.trim() ? '#4a4a3a' : '#e8c87a',
                  }}
                >
                  {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Crown size={16} />}
                  {state === 'loading' ? 'Connecting to Paypack...' : 'Subscribe Now — 2,000 RWF / month'}
                </motion.button>
              </motion.div>
            ) : (
              <div
                className="p-4 rounded-xl mb-6 text-center"
                style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <p className="text-xs mb-3" style={{ color: '#8a8778' }}>
                  Sign in to subscribe to Pro membership automatically, or donate below and confirm on WhatsApp.
                </p>
                <Link href="/auth/login?redirect=/subscribe">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                    style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#e8c87a' }}
                  >
                    Sign In
                  </motion.div>
                </Link>
              </div>
            )}

            {/* Reusable SupportUs component for Paypack donation / manual WhatsApp confirmation */}
            <SupportUs
              variant="card"
              title="Paypack Pro / Donation"
              subtitle="Prefer quick Paypack push or instant WhatsApp confirmation? Pay 2,000 RWF and confirm with merchant Agasobanuye."
              defaultAmount={2000}
              presetAmounts={[2000, 5000, 10000]}
              purpose="Pro Membership (1 Month)"
              defaultEmail={user?.email || ''}
              merchantName="Agasobanuye"
            />
          </>
        )}
      </div>
    </div>
  );
}
