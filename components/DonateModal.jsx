import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Heart,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Shield,
  Zap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  PAYPACK_CLIENT_CONFIG,
  formatRwf,
  normalizeRwandaPhone,
  isValidRwandaPhone,
  buildWhatsAppConfirmationUrl,
} from '../lib/paypack-client';
import { useLanguage } from '../contexts/LanguageContext';

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

  // Step 1: 'amount' (select donation amount) -> Step 2: 'gateway' (enter phone & trigger Paypack)
  const [step, setStep] = useState('amount');
  const [selectedAmount, setSelectedAmount] = useState(defaultAmount);
  const [customAmount, setCustomAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [payerName, setPayerName] = useState('');

  // Gateway states: 'idle' | 'initiating' | 'waiting_pin' | 'completed' | 'manual_needed' | 'failed'
  const [gatewayState, setGatewayState] = useState('idle');
  const [txRef, setTxRef] = useState('');
  const [paypackRef, setPaypackRef] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Reset modal state cleanly whenever opened with new options
  useEffect(() => {
    if (isOpen) {
      setStep('amount');
      setSelectedAmount(defaultAmount || 1000);
      setCustomAmount('');
      setGatewayState('idle');
      setTxRef('');
      setPaypackRef('');
      setErrorMessage('');
      setInfoMessage('');
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
  const normalizedPhone = normalizeRwandaPhone(phone);
  const isMtn = /^07[89]/.test(normalizedPhone);
  const isAirtel = /^07[23]/.test(normalizedPhone);

  const whatsappUrl = buildWhatsAppConfirmationUrl({
    whatsappLink: PAYPACK_CLIENT_CONFIG.whatsappLink,
    merchantName,
    amount: effectiveAmount,
    phone: normalizedPhone || phone,
    txRef,
    paypackRef,
    purpose,
  });

  // Poll transaction status while waiting for customer PIN approval
  useEffect(() => {
    if (!isOpen || gatewayState !== 'waiting_pin' || !txRef) return;

    let attempts = 0;
    const maxAttempts = 36;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/payments/status?tx_ref=${encodeURIComponent(txRef)}`);
        const data = await res.json();
        if (data?.transaction?.status === 'completed') {
          setGatewayState('completed');
          if (typeof onSuccess === 'function') onSuccess(data.transaction);
          clearInterval(interval);
        } else if (data?.transaction?.status === 'failed') {
          setGatewayState('failed');
          setErrorMessage('Payment was cancelled or declined on your phone.');
          clearInterval(interval);
        }
      } catch {
        // transient network retry
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setGatewayState('manual_needed');
        setInfoMessage(
          `Waiting timed out. If you approved the prompt for "${merchantName}", confirm on WhatsApp below.`
        );
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, gatewayState, txRef, merchantName, onSuccess]);

  const handleProceedToGateway = () => {
    if (effectiveAmount < 100) {
      setErrorMessage('Minimum donation amount is 100 RWF.');
      return;
    }
    setErrorMessage('');
    setStep('gateway');
  };

  const handlePaypackSubmit = async (e) => {
    e.preventDefault();
    if (effectiveAmount < 100) {
      setErrorMessage('Minimum donation amount is 100 RWF.');
      return;
    }
    if (!isValidRwandaPhone(phone)) {
      setErrorMessage('Please enter a valid Rwandan MTN (078/079) or Airtel (072/073) number.');
      return;
    }

    setGatewayState('initiating');
    setErrorMessage('');
    setInfoMessage('');

    try {
      const res = await fetch('/api/payments/paypack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: effectiveAmount,
          phone: normalizedPhone,
          name: payerName,
          purpose,
          request_id: requestId,
          movie_id: movieId,
          game_id: gameId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start Paypack payment');
      }

      setTxRef(data.tx_ref || '');
      setPaypackRef(data.reference || '');

      if (data.mode === 'prompt') {
        setGatewayState('waiting_pin');
        setInfoMessage(
          data.message ||
            `Prompt sent! Check your phone to enter your PIN to pay "${merchantName}" via Paypack.`
        );
      } else {
        setGatewayState('manual_needed');
        setInfoMessage(data.message);
      }
    } catch (err) {
      setGatewayState('failed');
      setErrorMessage(
        err.message || 'Could not reach Paypack gateway. Confirm directly via WhatsApp below.'
      );
    }
  };

  const handleRetryGateway = () => {
    setGatewayState('idle');
    setErrorMessage('');
    setInfoMessage('');
    setTxRef('');
    setPaypackRef('');
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
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl"
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

              {/* STEP 2: Paypack Payment Gateway */}
              {step === 'gateway' && (
                <div className="space-y-4">
                  {/* Selected Amount Summary Bar */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-400/10 border border-amber-400/25">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 block">
                        {t.donateModal.donationAmountLabel}
                      </span>
                      <span className="text-base font-bold text-amber-200">{formatRwf(effectiveAmount)}</span>
                    </div>
                    {gatewayState === 'idle' && (
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
                    )}
                  </div>

                  {gatewayState === 'idle' || gatewayState === 'initiating' ? (
                    <form onSubmit={handlePaypackSubmit} className="space-y-3.5">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            htmlFor="donate-phone"
                            className="text-[11px] font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-1.5"
                          >
                            <Smartphone size={13} className="text-amber-400" /> {t.donateModal.phoneLabel}
                          </label>
                          {isMtn && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                              MTN MoMo
                            </span>
                          )}
                          {isAirtel && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                              Airtel Money
                            </span>
                          )}
                        </div>
                        <input
                          id="donate-phone"
                          type="tel"
                          required
                          autoFocus
                          placeholder={t.supportForm.phonePlaceholder}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={gatewayState === 'initiating'}
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                        />
                        <p className="text-[10px] text-stone-400 mt-1.5">
                          {t.donateModal.paypackPromptHelp}{' '}
                          <strong className="text-amber-300">&quot;{merchantName}&quot;</strong>.
                        </p>
                      </div>

                      <input
                        type="text"
                        aria-label={t.supportForm.namePlaceholder}
                        placeholder={t.supportForm.namePlaceholder}
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-400/40"
                      />

                      {errorMessage && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                          <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={gatewayState === 'initiating'}
                        className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                        style={{
                          background: 'linear-gradient(135deg, rgba(201,168,76,0.95), rgba(184,134,11,0.95))',
                          color: '#0f0f16',
                          boxShadow: '0 8px 24px rgba(201,168,76,0.28)',
                        }}
                      >
                        {gatewayState === 'initiating' ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>{t.supportForm.connecting}</span>
                          </>
                        ) : (
                          <>
                            <Zap size={16} />
                            <span>{tr('donateModal.payViaPaypack', { amount: formatRwf(effectiveAmount) })}</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : gatewayState === 'waiting_pin' ? (
                    <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-amber-500/20 border border-amber-500/40 animate-pulse">
                        <Smartphone size={24} className="text-amber-300" />
                      </div>
                      <h4 className="font-bold text-sm text-amber-200">{t.supportForm.approveTitle}</h4>
                      <p className="text-xs text-stone-300">
                        {normalizedPhone || phone} · <strong>{formatRwf(effectiveAmount)}</strong> →{' '}
                        <strong>&quot;{merchantName}&quot;</strong>
                      </p>
                      <div className="flex items-center justify-center gap-2 text-[11px] text-amber-300">
                        <Loader2 size={13} className="animate-spin" />
                        <span>{t.donateModal.waitingConfirmation}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRetryGateway}
                        className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-stone-300 cursor-pointer"
                      >
                        {t.supportForm.changeNumber}
                      </button>
                    </div>
                  ) : gatewayState === 'completed' ? (
                    <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                      <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
                      <h4 className="font-bold text-base text-emerald-300">{t.donateModal.receivedTitle}</h4>
                      <p className="text-xs text-stone-300">
                        Murakoze cyane! <strong>{formatRwf(effectiveAmount)}</strong> →{' '}
                        <strong>{merchantName}</strong>
                      </p>
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 cursor-pointer"
                      >
                        {t.donateModal.done}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-stone-900/70 border border-stone-700/70 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-stone-200">{t.supportForm.noticeTitle}</h4>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            {infoMessage ||
                              errorMessage ||
                              tr('donateModal.confirmWhatsApp', { merchant: merchantName })}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRetryGateway}
                        className="text-xs text-amber-300 hover:text-amber-200 underline cursor-pointer"
                      >
                        {t.supportForm.tryAnotherNumber}
                      </button>
                    </div>
                  )}

                  {/* Always-available WhatsApp confirmation button from .env */}
                  <div className="pt-3 border-t border-white/10">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer no-underline"
                      style={{
                        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                        color: '#ffffff',
                        boxShadow: '0 6px 20px rgba(37,211,102,0.22)',
                      }}
                    >
                      <MessageCircle size={16} />
                      <span>{tr('donateModal.confirmWhatsApp', { merchant: merchantName })}</span>
                      <ExternalLink size={12} className="opacity-80" />
                    </a>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-stone-500">
                <a
                  href="https://payments.paypack.rw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 flex items-center gap-1"
                >
                  <span>Paypack Rwanda (payments.paypack.rw)</span>
                  <ExternalLink size={9} />
                </a>
                <span>Merchant: {merchantName}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
