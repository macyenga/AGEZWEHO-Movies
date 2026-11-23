import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Heart,
  ArrowRight,
  ArrowLeft,
  Shield,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { PAYPACK_CLIENT_CONFIG, formatRwf } from '../lib/paypack-client';
import { useLanguage } from '../contexts/LanguageContext';
import UnifiedPaymentFlow from './UnifiedPaymentFlow';

const DONATION_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000];

export default function DonateModal({ isOpen, onClose, options = {} }) {
  const { t, tr } = useLanguage();
  const {
    title = t.donateModal.defaultTitle,
    subtitle = t.donateModal.defaultSubtitle,
    merchantName = PAYPACK_CLIENT_CONFIG.merchantName || 'Agasobanuye',
    defaultAmount = 1000,
    purpose = 'Donation / Support Agasobanuye.rw',
    requestId = null,
    movieId = null,
    gameId = null,
    onSuccess = null,
  } = options;

  // Step 1: 'amount' (select donation amount) -> Step 2: 'gateway' (MoMo Pay 156833 QR/Proof or Paypack Auto Push)
  const [step, setStep] = useState('amount');
  const [selectedAmount, setSelectedAmount] = useState(defaultAmount);
  const [customAmount, setCustomAmount] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset modal state cleanly whenever opened with new options
  useEffect(() => {
    if (isOpen) {
      setStep('amount');
      setSelectedAmount(defaultAmount || 1000);
      setCustomAmount('');
      setErrorMessage('');
    }
  }, [isOpen, defaultAmount]);

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const effectiveAmount = customAmount ? parseInt(customAmount, 10) || 0 : selectedAmount;

  const handleProceedToGateway = () => {
    if (effectiveAmount < 100) {
      setErrorMessage('Minimum donation amount is 100 RWF.');
      return;
    }
    setErrorMessage('');
    setStep('gateway');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ background: 'rgba(5, 5, 10, 0.82)', backdropFilter: 'blur(10px)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="donate-modal-title"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{
              background: 'linear-gradient(145deg, rgba(20,20,30,0.98) 0%, rgba(11,11,18,0.99) 100%)',
              border: '1px solid rgba(201,168,76,0.3)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.75), inset 0 1px 0 rgba(201,168,76,0.18)',
            }}
          >
            {/* Ambient Glow */}
            <div
              className="absolute -top-20 -right-20 w-52 h-52 rounded-full pointer-events-none opacity-20 blur-3xl"
              style={{ background: '#c9a84c' }}
            />

            {/* Header */}
            <div className="relative z-10 px-6 pt-5 pb-4 border-b border-white/10 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(201,168,76,0.28), rgba(201,168,76,0.1))',
                    border: '1px solid rgba(201,168,76,0.45)',
                  }}
                >
                  <Heart size={18} className="text-amber-400 fill-amber-400/20" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Sparkles size={10} /> {t.donateModal.gatewayBadge}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        background: 'rgba(201,168,76,0.12)',
                        border: '1px solid rgba(201,168,76,0.3)',
                        color: '#f5e4a8',
                      }}
                    >
                      <Shield size={9} className="text-amber-400" /> {merchantName}
                    </span>
                  </div>
                  <h2 id="donate-modal-title" className="font-cinzel text-lg font-bold text-amber-200 mt-0.5">
                    {title}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label={t.donateModal.closeAria}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="relative z-10 px-6 pt-3 pb-1 flex items-center gap-2 text-[11px]">
              <span
                className={`px-2.5 py-1 rounded-full font-semibold ${
                  step === 'amount'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {t.donateModal.step1}
              </span>
              <div className="flex-1 h-px bg-white/10" />
              <span
                className={`px-2.5 py-1 rounded-full font-semibold ${
                  step === 'gateway'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'bg-white/5 text-stone-400 border border-white/10'
                }`}
              >
                {t.donateModal.step2}
              </span>
            </div>

            {/* Body */}
            <div className="relative z-10 p-6 pt-4">
              {subtitle && step === 'amount' && (
                <p className="text-xs text-stone-400 mb-4">{subtitle}</p>
              )}

              {/* STEP 1: Select Donation Amount */}
              {step === 'amount' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-300 mb-2">
                      {t.donateModal.selectAmountLabel}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {DONATION_AMOUNTS.map((tierAmount) => {
                        const isSelected = !customAmount && selectedAmount === tierAmount;
                        return (
                          <button
                            key={tierAmount}
                            type="button"
                            onClick={() => {
                              setSelectedAmount(tierAmount);
                              setCustomAmount('');
                              setErrorMessage('');
                            }}
                            className={`p-3 rounded-xl text-left transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-amber-400/20 border-amber-400/60 text-amber-200 shadow-md shadow-amber-950/30'
                                : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10 hover:border-amber-400/30'
                            }`}
                          >
                            <div className="text-sm font-bold">{formatRwf(tierAmount)}</div>
                            <div className="text-[10px] text-stone-400 mt-0.5">{t.donateModal.tiers[tierAmount]}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="donate-custom-amount"
                      className="block text-[10px] uppercase tracking-wider text-stone-400 mb-1.5"
                    >
                      {t.donateModal.customAmountLabel}
                    </label>
                    <div className="relative">
                      <input
                        id="donate-custom-amount"
                        type="number"
                        min="100"
                        step="100"
                        placeholder={t.donateModal.customAmountPlaceholder}
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setErrorMessage('');
                        }}
                        className="w-full bg-black/45 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-amber-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                      />
                      {customAmount && (
                        <span className="absolute right-3.5 top-3 text-xs font-semibold text-amber-400">
                          {formatRwf(parseInt(customAmount, 10) || 0)}
                        </span>
                      )}
                    </div>
                    {customAmount !== '' && effectiveAmount < 100 && (
                      <p className="text-[11px] text-amber-400 mt-1.5">
                        {t.donateModal.minAmountError}
                      </p>
                    )}
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle size={14} className="flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleProceedToGateway}
                    disabled={effectiveAmount < 100}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, rgba(201,168,76,0.95), rgba(184,134,11,0.95))',
                      color: '#0f0f16',
                      boxShadow: '0 8px 24px rgba(201,168,76,0.28)',
                    }}
                  >
                    <span>{tr('donateModal.proceedWith', { amount: formatRwf(effectiveAmount) })}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}

              {/* STEP 2: Unified MoMo Pay 156833 QR / Manual Proof & Paypack Auto Push */}
              {step === 'gateway' && (
                <div className="space-y-4">
                  {/* Selected Amount Summary Bar */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-400/10 border border-amber-400/25">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 block">
                        {t.donateModal.donationAmountLabel}
                      </span>
                      <span className="text-base font-bold text-amber-200 tabular-nums">{formatRwf(effectiveAmount)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('amount');
                        setErrorMessage('');
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
                    >
                      <ArrowLeft size={12} /> {t.donateModal.change}
                    </button>
                  </div>

                  <UnifiedPaymentFlow
                    amount={effectiveAmount}
                    minAmount={100}
                    merchantName={merchantName}
                    purpose={purpose}
                    requestId={requestId}
                    movieId={movieId}
                    gameId={gameId}
                    compact
                    showEmail={false}
                    resetTrigger={`${isOpen}-${step}`}
                    onConfirmed={(tx) => {
                      if (typeof onSuccess === 'function') onSuccess(tx);
                    }}
                    onDone={onClose}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
