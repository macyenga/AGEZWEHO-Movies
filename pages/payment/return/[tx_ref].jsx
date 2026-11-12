import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SEOHead from '../../../components/SEOHead';
import CinematicBackground from '../../../components/CinematicBackground';
import { CheckCircle2, XCircle, Clock, Loader2, Home, Film, Gamepad2, Crown, Share2 } from 'lucide-react';

const DONATE_SHARE_TEXT = '🎬 I just supported Agasobanuye.rw — keep the movies FREE, one MoMo tap at a time. Join me:';
const SITE_URL = 'https://agasobanuye.rw';

export default function PaymentReturn() {
  const router = useRouter();
  const txRef = Array.isArray(router.query.tx_ref)
    ? router.query.tx_ref[0]
    : (router.query.tx_ref || '');
  const status = router.query.status;
  const reference = router.query.reference;
  const [outcome, setOutcome] = useState('checking'); // checking | success | failed | pending

  useEffect(() => {
    if (!txRef) return;

    let stop = false;
    let count = 0;

    const check = async () => {
      if (stop) return;
      try {
        const res = await fetch(`/api/payments/status?tx_ref=${encodeURIComponent(txRef)}`);
        const data = await res.json().catch(() => ({}));
        if (data.transaction?.status === 'completed') {
          setOutcome('success');
          return;
        }
        if (data.transaction?.status === 'failed') {
          setOutcome('failed');
          return;
        }
      } catch {
        // ignore transient errors, keep polling
      }

      count += 1;
      if (count >= 12) {
        setOutcome('pending');
        return;
      }
      setTimeout(check, 3000);
    };

    // If the gateway already told us the result, jump straight there.
    if (status === 'successful') {
      setOutcome('success');
      setTimeout(check, 1200); // still poll briefly so the DB row flips to completed
    } else if (status === 'failed') {
      setOutcome('failed');
    } else {
      setOutcome('pending');
    }

    return () => { stop = true; };
  }, [txRef, status]);

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Payment Status"
        description="Payment confirmation for your Agasobanuye.rw donation or Pro membership."
        canonical="https://agasobanuye.rw/payment/return"
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-md mx-auto px-4 sm:px-6 pt-24 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl text-center"
          style={{ background: 'rgba(12,12,24,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {outcome === 'checking' && (
            <>
              <Loader2 size={42} className="mx-auto mb-4 animate-spin" style={{ color: '#c9a84c' }} />
              <h1 className="font-cinzel text-lg mb-2" style={{ fontFamily: 'Cinzel,serif', color: '#e8e6f0' }}>Confirming payment…</h1>
              <p className="text-xs" style={{ color: '#6a6a5a' }}>Checking RwandaPay for your payment. This should take a few seconds.</p>
            </>
          )}

          {outcome === 'success' && (
            <>
              <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
              <h1 className="font-cinzel text-lg mb-2" style={{ fontFamily: 'Cinzel,serif', color: '#22c55e' }}>Payment Successful!</h1>
              <p className="text-xs mb-4" style={{ color: '#8a8778' }}>
                Your payment was confirmed. Access and vote power have been applied to your account.
              </p>
              <div className="mb-5 p-3 rounded-xl text-xs break-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#b8b4a8' }}>
                {txRef && (
                  <>
                    <span style={{ color: '#6a6a5a' }}>Reference: </span>
                    <span style={{ color: '#fbbf24' }}>{txRef}</span>
                    <br />
                  </>
                )}
                {reference && (
                  <>
                    <span style={{ color: '#6a6a5a' }}>Gateway: </span>
                    <span style={{ color: '#fbbf24' }}>{reference}</span>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="py-2.5 rounded-xl text-xs font-semibold"
                    style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#e8c87a' }}>
                    <Home size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} /> Home
                  </motion.div>
                </Link>
                <Link href="/subscribe">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="py-2.5 rounded-xl text-xs font-semibold"
                    style={{ background: 'rgba(255,204,0,0.1)', border: '1px solid rgba(255,204,0,0.25)', color: '#FFCC00' }}>
                    <Crown size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} /> Go Pro
                  </motion.div>
                </Link>
                <Link href="/movies">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="py-2.5 rounded-xl text-xs font-semibold"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8e6f0' }}>
                    <Film size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} /> Movies
                  </motion.div>
                </Link>
                <Link href="/games">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="py-2.5 rounded-xl text-xs font-semibold"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8e6f0' }}>
                    <Gamepad2 size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} /> Games
                  </motion.div>
                </Link>
              </div>

              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="section-tag mb-2 flex items-center gap-1.5">
                  <Share2 size={10} /> Share your support
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(DONATE_SHARE_TEXT + ' ' + SITE_URL)}`, '_blank')}
                    className="py-2 rounded-xl text-[10px] font-semibold"
                    style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366' }}>
                    WhatsApp
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(DONATE_SHARE_TEXT)}`, '_blank')}
                    className="py-2 rounded-xl text-[10px] font-semibold"
                    style={{ background: 'rgba(34,158,217,0.1)', border: '1px solid rgba(34,158,217,0.25)', color: '#4fc3f7' }}>
                    Telegram
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => { navigator.clipboard?.writeText(SITE_URL); alert('Link copied!'); }}
                    className="py-2 rounded-xl text-[10px] font-semibold"
                    style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: '#e8c87a' }}>
                    Copy Link
                  </motion.button>
                </div>
              </div>
            </>
          )}

          {outcome === 'failed' && (
            <>
              <XCircle size={48} className="mx-auto mb-4" style={{ color: '#f87171' }} />
              <h1 className="font-cinzel text-lg mb-2" style={{ fontFamily: 'Cinzel,serif', color: '#f87171' }}>Payment Failed</h1>
              <p className="text-xs mb-4" style={{ color: '#8a8778' }}>
                The payment was not completed. You can try again using MTN MoMo or Airtel Money.
              </p>
              <Link href="/">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#e8c87a' }}>
                  Back to Home
                </motion.div>
              </Link>
            </>
          )}

          {outcome === 'pending' && (
            <>
              <Clock size={48} className="mx-auto mb-4" style={{ color: '#fbbf24' }} />
              <h1 className="font-cinzel text-lg mb-2" style={{ fontFamily: 'Cinzel,serif', color: '#fbbf24' }}>Payment Still Processing</h1>
              <p className="text-xs mb-4" style={{ color: '#8a8778' }}>
                We haven&apos;t received confirmation yet. Check your phone for the MoMo prompt, or wait a moment.
              </p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => router.reload()}
                className="w-full py-2.5 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#e8c87a' }}>
                Check Again
              </motion.button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}