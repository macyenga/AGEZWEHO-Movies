import { useState, useEffect } from 'react';
import {
  Heart,
  Smartphone,
  CheckCircle2,
  MessageCircle,
  Shield,
  Loader2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  PAYPACK_CLIENT_CONFIG,
  formatRwf,
  normalizeRwandaPhone,
  isValidRwandaPhone,
  buildWhatsAppConfirmationUrl,
} from '../lib/paypack-client';
import { useLanguage } from '../contexts/LanguageContext';

const DEFAULT_PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function SupportUs({
  variant = 'full', // 'full' | 'card' | 'compact'
  title,
  subtitle,
  merchantName = PAYPACK_CLIENT_CONFIG.merchantName || 'Agasobanuye',
  defaultAmount = 1000,
  presetAmounts = DEFAULT_PRESET_AMOUNTS,
  purpose = 'Donation / Support Us',
  defaultPhone = '',
  defaultEmail = '',
  whatsappLink = PAYPACK_CLIENT_CONFIG.whatsappLink,
  whatsappButtonText,
  showWhatsappButton = true,
  requestId = null,
  movieId = null,
  gameId = null,
  onSuccess = null,
  className = '',
}) {
  const { t, tr } = useLanguage();
  const resolvedTitle = title || t.supportForm.defaultTitle;
  const resolvedSubtitle = subtitle || t.supportForm.defaultSubtitle;
  const resolvedWhatsappButtonText = whatsappButtonText || t.supportForm.whatsappDefaultText;
  const [amount, setAmount] = useState(defaultAmount);
  const [customAmount, setCustomAmount] = useState('');
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);
  const [payerName, setPayerName] = useState('');

  // Transaction states: 'idle' | 'initiating' | 'waiting_pin' | 'completed' | 'manual_needed' | 'failed'
  const [status, setStatus] = useState('idle');
  const [txRef, setTxRef] = useState('');
  const [paypackRef, setPaypackRef] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const effectiveAmount = customAmount ? parseInt(customAmount, 10) || 0 : amount;

  // Detect Rwandan mobile operator for live badge feedback
  const normalizedPhone = normalizeRwandaPhone(phone);
  const isMtn = /^07[89]/.test(normalizedPhone);
  const isAirtel = /^07[23]/.test(normalizedPhone);

  // Configurable WhatsApp confirmation link defined in .env, passing merchant name 'Agasobanuye'
  const resolvedWhatsappUrl = buildWhatsAppConfirmationUrl({
    whatsappLink,
    merchantName,
    amount: effectiveAmount,
    phone: normalizedPhone || phone,
    email,
    txRef,
    paypackRef,
    purpose,
  });

  // Poll transaction status while waiting for customer PIN confirmation on phone
  useEffect(() => {
    if (status !== 'waiting_pin' || !txRef) return;

    let attempts = 0;
    const maxAttempts = 36; // ~108s total

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/payments/status?tx_ref=${encodeURIComponent(txRef)}`);
        const data = await res.json();
        if (data?.transaction?.status === 'completed') {
          setStatus('completed');
          if (typeof onSuccess === 'function') onSuccess(data.transaction);
          clearInterval(interval);
        } else if (data?.transaction?.status === 'failed') {
          setStatus('failed');
          setErrorMessage('Payment was cancelled or failed on your phone.');
          clearInterval(interval);
        }
      } catch {
        // transient network retry
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setStatus('manual_needed');
        setInfoMessage(
          `Waiting timed out. If you approved the prompt for "${merchantName}", tap "${whatsappButtonText}" below.`
        );
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status, txRef, merchantName, whatsappButtonText, onSuccess]);

  const handlePaypackSubmit = async (e) => {
    e.preventDefault();
    if (effectiveAmount < 100) {
      setErrorMessage('Minimum support amount is 100 RWF.');
      return;
    }
    if (!isValidRwandaPhone(phone)) {
      setErrorMessage('Please enter a valid Rwandan MTN (078/079) or Airtel (072/073) number.');
      return;
    }

    setStatus('initiating');
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
          email,
          purpose,
          request_id: requestId,
          movie_id: movieId,
          game_id: gameId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate Paypack payment');
      }

      setTxRef(data.tx_ref || '');
      setPaypackRef(data.reference || '');

      if (data.mode === 'prompt') {
        setStatus('waiting_pin');
        setInfoMessage(
          data.message ||
            `Prompt sent! Check your phone to enter your PIN to pay "${merchantName}" via Paypack.`
        );
      } else {
        setStatus('manual_needed');
        setInfoMessage(data.message);
      }
    } catch (err) {
      setStatus('failed');
      setErrorMessage(
        err.message || 'Paypack initiation failed. Please try again or confirm via WhatsApp.'
      );
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setErrorMessage('');
    setInfoMessage('');
    setTxRef('');
    setPaypackRef('');
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl glass-card transition-all ${
        variant === 'compact' ? 'p-4 sm:p-5' : 'p-5 sm:p-7'
      } ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(20,20,30,0.9) 0%, rgba(12,12,18,0.97) 100%)',
        border: '1px solid rgba(201,168,76,0.28)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,168,76,0.15)',
      }}
    >
      {/* Ambient background glow */}
      <div
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{ background: '#c9a84c' }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full pointer-events-none opacity-15 blur-3xl"
        style={{ background: '#25D366' }}
      />

      {/* Header */}
      <div className="relative z-10 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(201,168,76,0.25), rgba(201,168,76,0.1))',
                border: '1px solid rgba(201,168,76,0.4)',
              }}
            >
              <Heart size={17} className="text-amber-400 fill-amber-400/20" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                <Sparkles size={11} /> {t.supportForm.badge}
              </span>
              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-amber-200">{resolvedTitle}</h3>
            </div>
          </div>

          {/* Merchant Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{
              background: 'rgba(201,168,76,0.12)',
              border: '1px solid rgba(201,168,76,0.3)',
              color: '#f5e4a8',
            }}
          >
            <Shield size={12} className="text-amber-400" />
            <span>
              {t.supportForm.merchantLabel} <strong className="text-amber-300">{merchantName}</strong>
            </span>
          </div>
        </div>

        {resolvedSubtitle && <p className="text-xs text-stone-400 max-w-xl">{resolvedSubtitle}</p>}
      </div>

      {/* Amount Selector */}
      <div className="relative z-10 mb-5">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-300 mb-2">
          {t.supportForm.selectAmount}
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
          {presetAmounts.map((amt) => {
            const isSelected = !customAmount && amount === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setAmount(amt);
                  setCustomAmount('');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400/25 border-amber-400/60 text-amber-200 shadow-md shadow-amber-900/20 scale-[1.02]'
                    : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10 hover:border-amber-400/30'
                }`}
              >
                {formatRwf(amt)}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <input
            type="number"
            min="100"
            step="100"
            placeholder={t.supportForm.customAmountPlaceholder}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400/50"
          />
          {customAmount && (
            <span className="absolute right-3 top-2.5 text-[10px] font-semibold text-amber-400">
              = {formatRwf(parseInt(customAmount, 10) || 0)}
            </span>
          )}
        </div>
      </div>

      {/* Paypack Push Payment Form / Live State */}
      <div className="relative z-10">
        {status === 'idle' || status === 'initiating' ? (
          <form onSubmit={handlePaypackSubmit} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                  <Smartphone size={13} className="text-amber-400" /> {t.supportForm.phoneLabel}
                </label>
                {isMtn && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    MTN Mobile Money
                  </span>
                )}
                {isAirtel && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                    Airtel Money
                  </span>
                )}
              </div>

              <input
                type="tel"
                required
                placeholder={t.supportForm.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={status === 'initiating'}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
              />
              <p className="text-[10px] text-stone-400 mt-1.5">
                {t.supportForm.phoneHelpPrefix}{' '}
                <strong className="text-amber-300">&quot;{merchantName}&quot;</strong>.
              </p>
            </div>

            {variant === 'full' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder={t.supportForm.namePlaceholder}
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-400/40"
                />
                <input
                  type="email"
                  placeholder={t.supportForm.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-400/40"
                />
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'initiating' || effectiveAmount < 100}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, rgba(201,168,76,0.92), rgba(184,134,11,0.92))',
                color: '#0f0f16',
                boxShadow: '0 8px 24px rgba(201,168,76,0.25)',
              }}
            >
              {status === 'initiating' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t.supportForm.connecting}</span>
                </>
              ) : (
                <>
                  <Zap size={16} />
                  <span>{tr('supportForm.payViaPaypack', { amount: formatRwf(effectiveAmount) })}</span>
                </>
              )}
            </button>
          </form>
        ) : status === 'waiting_pin' ? (
          <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-amber-500/20 border border-amber-500/40 animate-pulse">
              <Smartphone size={24} className="text-amber-300" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-200">{t.supportForm.approveTitle}</h4>
              <p className="text-xs text-stone-300 mt-1 max-w-sm mx-auto">
                <strong>{formatRwf(effectiveAmount)}</strong> · <strong>{normalizedPhone || phone}</strong> ·{' '}
                <strong>&quot;{merchantName}&quot;</strong>
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-amber-300 font-medium">
              <Loader2 size={13} className="animate-spin" />
              <span>{t.supportForm.waitingPin}</span>
            </div>

            <div className="pt-2 border-t border-amber-500/20 flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-stone-300 cursor-pointer"
              >
                {t.supportForm.changeNumber}
              </button>
            </div>
          </div>
        ) : status === 'completed' ? (
          <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-emerald-500/20 border border-emerald-500/40">
              <CheckCircle2 size={24} className="text-emerald-400" />
            </div>
            <h4 className="font-bold text-base text-emerald-300">{t.supportForm.successTitle}</h4>
            <p className="text-xs text-stone-300">
              Murakoze cyane! <strong>{formatRwf(effectiveAmount)}</strong> · <strong>{merchantName}</strong>
            </p>
            {paypackRef && (
              <div className="text-[11px] font-mono text-emerald-200/80 bg-black/30 px-3 py-1.5 rounded-lg inline-block">
                Ref: {paypackRef}
              </div>
            )}
            <div>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 cursor-pointer"
              >
                {t.supportForm.sendAnother}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-700/60 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-stone-200">{t.supportForm.noticeTitle}</h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {infoMessage || errorMessage || resolvedWhatsappButtonText}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-amber-300 hover:text-amber-200 underline cursor-pointer"
              >
                {t.supportForm.tryAnotherNumber}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Configurable WhatsApp Confirmation Button */}
      {showWhatsappButton && (
        <div className="relative z-10 mt-5 pt-4 border-t border-amber-500/15">
          <a
            href={resolvedWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg group no-underline"
            style={{
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(37,211,102,0.25)',
            }}
          >
            <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
            <span>{resolvedWhatsappButtonText}</span>
            <ExternalLink size={14} className="opacity-80" />
          </a>

          <div className="flex items-center justify-between text-[10px] text-stone-400 mt-2 px-1">
            <span>
              {t.supportForm.redirectsWithMerchant} <strong className="text-stone-200">{merchantName}</strong>
            </span>
            <span className="text-stone-500">{formatRwf(effectiveAmount)}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 mt-3 pt-3 flex items-center justify-between text-[9px] text-stone-500 border-t border-white/5">
        <a
          href="https://payments.paypack.rw"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-amber-400 flex items-center gap-1 transition-colors"
        >
          <span>
            {t.supportForm.poweredBy} (payments.paypack.rw)
          </span>
          <ExternalLink size={9} />
        </a>
        <span>{t.supportForm.networks}</span>
      </div>
    </div>
  );
}
