import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SEOHead from '../../components/SEOHead';
import CinematicBackground from '../../components/CinematicBackground';
import { CheckCircle2, XCircle, Clock, Loader2, Home, Film, Gamepad2, Crown } from 'lucide-react';

export default function PaymentReturn() {
  const router = useRouter();
  const { tx_ref, status, reference } = router.query;
  const [outcome, setOutcome] = useState('checking'); // checking | success | failed | pending
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!tx_ref) return;

    let stop = false;
    let count = 0;

    const check = async () => {
      if (stop) return;
      try {
        const res = await fetch(`/api/payments/status?tx_ref=${encodeURIComponent(String(tx_ref))}`);
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
      setAttempts(count);
      if (count >= 12) {
        setOutcome('pending');
        return;
      }
      setTimeout(check, 3000);
    };

    // If the gateway already told us the result, jump straight there.
    if (status === 'successful') {
      setOutcome('success');
      // Still poll briefly so the DB row flips to completed in the background.
      setTimeout(check, 1200);
    } else if (status === 'failed') {
      setOutcome('failed');
    } else {
      setOutcome('pending');
    }

    return () => { stop = true; };
  }, [tx_ref, status]);

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Payment Status"
        description="Payment confirmation for your Agezweho Movies donation or Pro membership."
        canonical="https://agezweho.com/payment/return"
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
                {tx_ref && (
                  <>
                    <span style={{ color: '#6a6a5a' }}>Reference: </span>
                    <span style={{ color: '#fbbf24' }}>{tx_ref}</span>
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