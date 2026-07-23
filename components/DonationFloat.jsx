import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Heart, Smartphone } from 'lucide-react';

const MOMO_NUMBER = '0789690247';
const MOMO_PAY_CODE = '*182*8*1*156833#';

export default function DonationFloat() {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [open, setOpen] = useState(false);

  const copyText = (text, type = 'number') => {
    navigator.clipboard?.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed z-[60] right-4 bottom-4 sm:right-5 sm:bottom-5">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="mb-3 w-[min(92vw,320px)] rounded-2xl p-4"
            style={{
              background: 'rgba(13,13,22,0.96)',
              border: '1px solid rgba(255,204,0,0.24)',
              boxShadow: '0 18px 50px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,204,0,0.12)', border: '1px solid rgba(255,204,0,0.3)' }}
              >
                <Smartphone size={19} style={{ color: '#FFCC00' }} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold" style={{ color: '#FFCC00' }}>
                  Support Agezweho
                </div>
                <div className="text-[11px] leading-relaxed" style={{ color: '#8a8778' }}>
                  Keep new movies coming faster with anonymous MoMo support.
                </div>
              </div>
            </div>

            <div
              className="rounded-xl px-3 py-2 mb-3 flex items-center justify-between gap-3"
              style={{ background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,204,0,0.18)' }}
            >
              <span className="font-bold tracking-wider" style={{ color: '#FFCC00', fontFamily: 'monospace' }}>
                {MOMO_NUMBER}
              </span>
              <button
                onClick={() => copyText(MOMO_NUMBER)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,204,0,0.1)',
                  border: `1px solid ${copied ? 'rgba(34,197,94,0.35)' : 'rgba(255,204,0,0.28)'}`,
                  color: copied ? '#22c55e' : '#FFCC00',
                }}
                title={copied ? 'Copied' : 'Copy MoMo number'}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>

            <div
              className="rounded-xl px-3 py-2 mb-3 flex items-center justify-between gap-3"
              style={{ background: 'rgba(255,204,0,0.05)', border: '1px solid rgba(255,204,0,0.18)' }}
            >
              <div className="min-w-0">
                <div className="text-[10px] mb-1" style={{ color: '#8a8778' }}>MoMo Pay code</div>
                <span className="font-bold tracking-wider text-sm" style={{ color: '#FFCC00', fontFamily: 'monospace' }}>
                  {MOMO_PAY_CODE}
                </span>
              </div>
              <button
                onClick={() => copyText(MOMO_PAY_CODE, 'code')}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: copiedCode ? 'rgba(34,197,94,0.15)' : 'rgba(255,204,0,0.1)',
                  border: `1px solid ${copiedCode ? 'rgba(34,197,94,0.35)' : 'rgba(255,204,0,0.28)'}`,
                  color: copiedCode ? '#22c55e' : '#FFCC00',
                }}
                title={copiedCode ? 'Copied' : 'Copy MoMo Pay code'}
              >
                {copiedCode ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => copyText(MOMO_PAY_CODE, 'code')}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(255,204,0,0.1)', border: '1px solid rgba(255,204,0,0.3)', color: '#FFCC00' }}
              >
                {copiedCode ? 'Copied' : 'Copy Code'}
              </button>
              <Link href="/support" className="flex-1">
                <span
                  className="block text-center py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', color: '#e8c87a' }}
                >
                  Donate
                </span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(v => !v)}
        className="h-12 rounded-full px-4 flex items-center gap-2 text-xs font-bold"
        style={{
          background: 'linear-gradient(135deg, rgba(255,204,0,0.95), rgba(201,168,76,0.95))',
          color: '#161006',
          boxShadow: '0 12px 36px rgba(255,204,0,0.22)',
        }}
      >
        <Heart size={15} fill="currentColor" />
        MoMo Donate
      </motion.button>
    </div>
  );
}
