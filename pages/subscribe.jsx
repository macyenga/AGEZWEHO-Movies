import { motion } from 'framer-motion';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Crown, CheckCircle2, Smartphone } from 'lucide-react';
import SupportUs from '../components/SupportUs';
import UnifiedPaymentFlow from '../components/UnifiedPaymentFlow';

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

            {/* Pro Account Subscription via MoMo Pay 156833 or Paypack */}
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
                      Activate Pro Membership
                    </h2>
                    <p className="text-xs tabular-nums" style={{ color: '#8a8060' }}>
                      2,000 RWF / month — MoMo Pay ID 156833 (Agasobanuye)
                    </p>
                  </div>
                </div>

                <UnifiedPaymentFlow
                  amount={2000}
                  minAmount={2000}
                  purpose="Pro Membership (1 Month)"
                  subscriptionPlan="pro"
                  months={1}
                  defaultEmail={user?.email || ''}
                  showEmail
                  onConfirmed={() => router.reload()}
                />
              </motion.div>
            ) : (
              <div
                className="p-4 rounded-xl mb-6 text-center"
                style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <p className="text-xs mb-3" style={{ color: '#8a8778' }}>
                  Sign in to link a Pro subscription to your account (MoMo Pay 156833 or Paypack), or support us below.
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

            {/* Reusable SupportUs component */}
            <SupportUs
              variant="card"
              title="MoMo Pay 156833 / Support"
              subtitle="Send a support transfer or donation via MoMo Pay 156833 (QR / USSD) or Paypack to merchant Agasobanuye."
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
