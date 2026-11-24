import { useState, useEffect } from 'react';
import {
  QrCode,
  Zap,
  Smartphone,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  PAYPACK_CLIENT_CONFIG,
  formatRwf,
  normalizeRwandaPhone,
  isValidRwandaPhone,
  buildWhatsAppConfirmationUrl,
} from '../lib/paypack-client';
import { useLanguage } from '../contexts/LanguageContext';
import MomoPayManualPanel from './MomoPayManualPanel';

export default function UnifiedPaymentFlow({
  amount = 1000,
  minAmount = 100,
  merchantName = PAYPACK_CLIENT_CONFIG.merchantName || 'Iradukunda Didier',
  purpose = 'Support Agasobanuye.rw',
  requestId = null,
  movieId = null,
  gameId = null,
  subscriptionPlan = null,
  months = 1,
  defaultPhone = '',
  defaultEmail = '',
  showEmail = false,
  showPayerName = true,
  compact = false,
  showWhatsappButton = true,
  showFooter = true,
  whatsappButtonText = '',
  onSubmitted = null,
  onConfirmed = null,
  onDone = null,
  onStatusChange = null,
  resetTrigger = null,
}) {
  const { t, tr } = useLanguage();

  // Unified tabs: 'manual' (MoMo Pay 156833 & QR) | 'paypack' (Auto Push via Paypack)
  const [paymentMethod, setPaymentMethod] = useState('manual');
  const [phone, setPhone] = useState(defaultPhone);
  const [payerName, setPayerName] = useState('');
  const [email, setEmail] = useState(defaultEmail);

  // Paypack states: 'idle' | 'initiating' | 'waiting_pin' | 'completed' | 'manual_needed' | 'failed'
  const [status, setStatus] = useState('idle');
  const [txRef, setTxRef] = useState('');
  const [paypackRef, setPaypackRef] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const effectiveAmount = Number.isFinite(Number(amount)) ? Math.round(Number(amount)) : 0;
  const resolvedWhatsappButtonText =
    whatsappButtonText || tr('donateModal.confirmWhatsApp', { merchant: merchantName });

  useEffect(() => {
    if (defaultEmail && !email) setEmail(defaultEmail);
  }, [defaultEmail, email]);

  useEffect(() => {
    setPaymentMethod('manual');
    setStatus('idle');
    setTxRef('');
    setPaypackRef('');
    setErrorMessage('');
    setInfoMessage('');
  }, [resetTrigger]);

  useEffect(() => {
    if (typeof onStatusChange === 'function') {
      onStatusChange({ paymentMethod, status, txRef });
    }
  }, [paymentMethod, status, txRef, onStatusChange]);

  const normalizedPhone = normalizeRwandaPhone(phone);
  const isMtn = /^07[89]/.test(normalizedPhone);
  const isAirtel = /^07[23]/.test(normalizedPhone);

  const resolvedWhatsappUrl = buildWhatsAppConfirmationUrl({
    whatsappLink: PAYPACK_CLIENT_CONFIG.whatsappLink,
    merchantName,
    amount: effectiveAmount,
    phone: normalizedPhone || phone,
    email,
    txRef,
    paypackRef,
    purpose,
  });

  // Poll transaction status while waiting for Paypack PIN approval
  useEffect(() => {
    if (paymentMethod !== 'paypack' || status !== 'waiting_pin' || !txRef) return;

    let attempts = 0;
    const maxAttempts = 36;

    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/payments/status?tx_ref=${encodeURIComponent(txRef)}`);
        const data = await res.json();
        if (data?.transaction?.status === 'completed') {
          setStatus('completed');
          if (typeof onConfirmed === 'function') onConfirmed(data.transaction);
          clearInterval(interval);
        } else if (data?.transaction?.status === 'failed') {
          setStatus('failed');
          setErrorMessage('Payment was cancelled or declined on your phone.');
          clearInterval(interval);
        }
      } catch {
        // transient network retry
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setStatus('manual_needed');
        setInfoMessage(
          `Waiting timed out. If you approved the prompt for "${merchantName}", confirm on WhatsApp below.`
        );
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentMethod, status, txRef, merchantName, onConfirmed]);

  const handlePaypackSubmit = async (e) => {
    e.preventDefault();
    if (effectiveAmount < minAmount) {
      setErrorMessage(`Minimum amount is ${formatRwf(minAmount)}.`);
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
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token || '';
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/payments/paypack', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: effectiveAmount,
          phone: normalizedPhone,
          name: payerName,
          payer_name: payerName,
          email,
          donor_email: email,
          purpose,
          request_id: requestId,
          movie_id: movieId,
          game_id: gameId,
          subscription_plan: subscriptionPlan,
          months,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start Paypack payment');
      }

      setTxRef(data.tx_ref || '');
      setPaypackRef(data.reference || '');
      if (typeof onSubmitted === 'function') {
        onSubmitted(data);
      }

      if (data.mode === 'prompt') {
        setStatus('waiting_pin');
        setInfoMessage(
          data.message ||
            `Prompt sent! Check your phone to enter your PIN to pay "${merchantName}" via Paypack.`
        );
      } else {
        setStatus('manual_needed');
        setInfoMessage(data.message || '');
      }
    } catch (err) {
      setStatus('failed');
      setErrorMessage(
        err.message || 'Could not reach Paypack gateway. Confirm directly via WhatsApp below.'
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

  const phoneInputId = `paypack-phone-${gameId || requestId || subscriptionPlan || 'default'}`;

  return (
    <div data-testid="unified-payment-flow" className="space-y-4">
      {/* Unified Payment Method Switcher */}
      {status === 'idle' && (
        <div
          role="tablist"
          aria-label="Payment method"
          className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/45 border border-white/10"
        >
          <button
            type="button"
            role="tab"
            aria-selected={paymentMethod === 'manual'}
            data-testid="payment-tab-manual"
            onClick={() => {
              setPaymentMethod('manual');
              setErrorMessage('');
            }}
            className={`py-2 px-2.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              paymentMethod === 'manual'
                ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                : 'text-stone-400 hover:text-stone-200 border border-transparent'
            }`}
          >
            <QrCode size={13} />
            <span>{t.momoManual.tabManual}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={paymentMethod === 'paypack'}
            data-testid="payment-tab-paypack"
            onClick={() => {
              setPaymentMethod('paypack');
              setErrorMessage('');
            }}
            className={`py-2 px-2.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              paymentMethod === 'paypack'
                ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                : 'text-stone-400 hover:text-stone-200 border border-transparent'
            }`}
          >
            <Zap size={13} />
            <span>{t.momoManual.tabGateway}</span>
          </button>
        </div>
      )}

      {paymentMethod === 'manual' ? (
        <MomoPayManualPanel
          amount={effectiveAmount}
          minAmount={minAmount}
          merchantName={merchantName}
          purpose={purpose}
          requestId={requestId}
          movieId={movieId}
          gameId={gameId}
          subscriptionPlan={subscriptionPlan}
          months={months}
          defaultPhone={defaultPhone}
          defaultEmail={defaultEmail}
          showEmail={showEmail}
          compact={compact}
          onSubmitted={onSubmitted}
          onConfirmed={onConfirmed}
          onDone={onDone}
        />
      ) : (
        <div className="space-y-4">
          {status === 'idle' || status === 'initiating' ? (
            <form onSubmit={handlePaypackSubmit} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor={phoneInputId}
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
                  id={phoneInputId}
                  type="tel"
                  required
                  placeholder={t.supportForm.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={status === 'initiating'}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-stone-400 mt-1.5">
                  {t.donateModal.paypackPromptHelp}{' '}
                  <strong className="text-amber-300">&quot;{merchantName}&quot;</strong>.
                </p>
              </div>

              {(showPayerName || showEmail) && (
                <div className={`grid grid-cols-1 ${showPayerName && showEmail ? 'sm:grid-cols-2' : ''} gap-2.5`}>
                  {showPayerName && (
                    <input
                      type="text"
                      aria-label={t.supportForm.namePlaceholder}
                      placeholder={t.supportForm.namePlaceholder}
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-400/40"
                    />
                  )}
                  {showEmail && (
                    <input
                      type="email"
                      aria-label={t.supportForm.emailPlaceholder}
                      placeholder={t.supportForm.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-400/40"
                    />
                  )}
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
                disabled={status === 'initiating' || effectiveAmount < minAmount}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.95), rgba(184,134,11,0.95))',
                  color: '#0f0f16',
                  boxShadow: '0 8px 24px rgba(201,168,76,0.28)',
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
                    <span>{tr('donateModal.payViaPaypack', { amount: formatRwf(effectiveAmount) })}</span>
                  </>
                )}
              </button>
            </form>
          ) : status === 'waiting_pin' ? (
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
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-stone-300 cursor-pointer"
              >
                {t.supportForm.changeNumber}
              </button>
            </div>
          ) : status === 'completed' ? (
            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
              <h4 className="font-bold text-base text-emerald-300">{t.supportForm.successTitle}</h4>
              <p className="text-xs text-stone-300">
                Murakoze cyane! <strong>{formatRwf(effectiveAmount)}</strong> →{' '}
                <strong>{merchantName}</strong>
              </p>
              {paypackRef && (
                <div className="text-[11px] font-mono text-emerald-200/80 bg-black/30 px-3 py-1.5 rounded-lg inline-block">
                  Ref: {paypackRef}
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={onDone || handleReset}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 cursor-pointer"
                >
                  {onDone ? t.donateModal.done : t.supportForm.sendAnother}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-stone-900/70 border border-stone-700/70 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-stone-200">{t.supportForm.noticeTitle}</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {infoMessage || errorMessage || resolvedWhatsappButtonText}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-amber-300 hover:text-amber-200 underline cursor-pointer"
              >
                {t.supportForm.tryAnotherNumber}
              </button>
            </div>
          )}

          {showWhatsappButton && (
            <div className="pt-3 border-t border-white/10">
              <a
                href={resolvedWhatsappUrl}
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
                <span>{resolvedWhatsappButtonText}</span>
                <ExternalLink size={12} className="opacity-80" />
              </a>
            </div>
          )}
        </div>
      )}

      {showFooter && (
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-stone-500">
          <a
            href="https://payments.paypack.rw"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            <span>{t.supportForm.poweredBy} (payments.paypack.rw)</span>
            <ExternalLink size={9} />
          </a>
          <span>{t.supportForm.networks}</span>
        </div>
      )}
    </div>
  );
}
