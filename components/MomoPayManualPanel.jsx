import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Copy,
  Check,
  PhoneCall,
  Upload,
  ReceiptText,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageCircle,
  ExternalLink,
  RefreshCw,
  Info,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatRwf } from '../lib/paypack-client';
import {
  MOMO_MERCHANT_CONFIG,
  formatRwandaPhoneDisplay,
  buildMomoUssdCode,
  buildMomoTelUri,
  buildMomoQrPayload,
  validateManualProofInput,
  buildWhatsAppManualProofUrl,
} from '../lib/momo-manual';
import { useLanguage } from '../contexts/LanguageContext';

async function readAndOptimizeImage(file) {
  const MAX_DIM = 1280;
  const rawDataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read selected image.'));
    reader.readAsDataURL(file);
  });

  if (!rawDataUrl.startsWith('data:image/')) {
    throw new Error('Please choose a PNG, JPG, WEBP, or GIF image file.');
  }

  // Keep already-compact files as-is unless very large
  if (rawDataUrl.length <= 420_000 && /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(rawDataUrl)) {
    return rawDataUrl;
  }

  // Downscale oversized mobile screenshots cleanly on canvas
  const img = await new Promise((resolve, reject) => {
    const imageEl = new window.Image();
    imageEl.onload = () => resolve(imageEl);
    imageEl.onerror = () => reject(new Error('Could not decode selected image.'));
    imageEl.src = rawDataUrl;
  });

  const scale = Math.min(1, MAX_DIM / Math.max(img.width || MAX_DIM, img.height || MAX_DIM));
  const width = Math.max(1, Math.round((img.width || 800) * scale));
  const height = Math.max(1, Math.round((img.height || 800) * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return rawDataUrl;
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', 0.82);
}

export default function MomoPayManualPanel({
  amount = 1000,
  minAmount = 100,
  purpose = 'Support Agasobanuye.rw',
  merchantCode = MOMO_MERCHANT_CONFIG.merchantCode,
  merchantName = MOMO_MERCHANT_CONFIG.merchantName,
  supportPhone = MOMO_MERCHANT_CONFIG.supportPhone,
  requestId = null,
  movieId = null,
  gameId = null,
  subscriptionPlan = null,
  months = 1,
  defaultPhone = '',
  defaultEmail = '',
  showEmail = false,
  compact = false,
  onSubmitted = null,
  onConfirmed = null,
  onDone = null,
}) {
  const { t, tr } = useLanguage();
  const mt = t.momoManual;

  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const [manualTxId, setManualTxId] = useState('');
  const [screenshotData, setScreenshotData] = useState('');
  const [screenshotName, setScreenshotName] = useState('');
  const [compressing, setCompressing] = useState(false);

  const [phone, setPhone] = useState(defaultPhone);
  const [payerName, setPayerName] = useState('');
  const [email, setEmail] = useState(defaultEmail);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submission, setSubmission] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [confirmedState, setConfirmedState] = useState(false);

  const fileInputRef = useRef(null);

  const effectiveAmount = Number.isFinite(Number(amount)) ? Math.round(Number(amount)) : 0;
  const ussdCode = buildMomoUssdCode({ merchantCode, amount: effectiveAmount });
  const telUri = buildMomoTelUri({ merchantCode, amount: effectiveAmount });
  const qrPayload = buildMomoQrPayload({ merchantCode, amount: effectiveAmount });
  const formattedSupportPhone = formatRwandaPhoneDisplay(supportPhone);

  useEffect(() => {
    if (defaultEmail && !email) setEmail(defaultEmail);
  }, [defaultEmail, email]);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(qrPayload, {
      width: 240,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#0f0f16', light: '#ffffff' },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });
    return () => {
      active = false;
    };
  }, [qrPayload]);

  const handleCopy = async (key, value) => {
    try {
      await navigator.clipboard?.writeText(String(value));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((prev) => (prev === key ? '' : prev)), 1800);
    } catch {
      // Clipboard blocked in restricted frame
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage('');
    setCompressing(true);
    try {
      const optimized = await readAndOptimizeImage(file);
      setScreenshotData(optimized);
      setScreenshotName(file.name);
    } catch (err) {
      setErrorMessage(err.message || 'Could not process screenshot image.');
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const validation = validateManualProofInput({
      amount: effectiveAmount,
      minAmount,
      manualTxId,
      screenshotData,
      phone,
      payerName,
      email,
    });

    if (!validation.valid) {
      const firstErr = Object.values(validation.errors)[0];
      setErrorMessage(firstErr || 'Please check your payment details.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token || '';

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/payments/manual-proof', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: validation.normalized.amount,
          manual_tx_id: validation.normalized.manualTxId,
          screenshot_data: validation.normalized.screenshotData,
          phone: validation.normalized.phone,
          payer_name: validation.normalized.payerName,
          donor_email: validation.normalized.email,
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
        throw new Error(data.error || 'Could not submit payment proof.');
      }

      setSubmission(data);
      setStatusNote('');
      if (typeof onSubmitted === 'function') {
        onSubmitted(data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit payment proof.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!submission?.tx_ref) return;
    setCheckingStatus(true);
    setStatusNote('');
    try {
      const res = await fetch(`/api/payments/status?tx_ref=${encodeURIComponent(submission.tx_ref)}`);
      const data = await res.json().catch(() => ({}));
      if (data?.transaction?.status === 'completed') {
        setConfirmedState(true);
        setStatusNote(mt.confirmedSuccess);
        if (typeof onConfirmed === 'function') {
          onConfirmed(data.transaction);
        }
      } else {
        setStatusNote(mt.stillPending);
      }
    } catch {
      setStatusNote(mt.stillPending);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleReset = () => {
    setSubmission(null);
    setManualTxId('');
    setScreenshotData('');
    setScreenshotName('');
    setErrorMessage('');
    setStatusNote('');
    setConfirmedState(false);
  };

  const whatsappUrl = buildWhatsAppManualProofUrl({
    merchantCode,
    merchantName,
    amount: submission?.amount || effectiveAmount,
    manualTxId: submission?.manual_tx_id || manualTxId,
    txRef: submission?.tx_ref || '',
    phone,
    payerName,
    purpose,
  });

  if (submission) {
    return (
      <div className="space-y-3.5">
        <div
          className={`p-4 rounded-xl border space-y-3 ${
            confirmedState
              ? 'bg-emerald-500/10 border-emerald-500/35'
              : 'bg-amber-500/10 border-amber-500/30'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2
              size={22}
              className={`shrink-0 mt-0.5 ${confirmedState ? 'text-emerald-400' : 'text-amber-300'}`}
            />
            <div className="min-w-0 flex-1">
              <h4 className={`text-sm font-bold ${confirmedState ? 'text-emerald-300' : 'text-amber-200'}`}>
                {confirmedState ? mt.confirmedSuccess : mt.submittedTitle}
              </h4>
              <p className="text-xs text-stone-300 mt-1">
                {tr('momoManual.submittedBody', {
                  code: merchantCode,
                  amount: formatRwf(submission.amount || effectiveAmount),
                })}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-black/40 border border-white/10 p-3 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-400">{mt.siteRefLabel}</span>
              <span className="font-mono font-semibold text-amber-300 tabular-nums">{submission.tx_ref}</span>
            </div>
            {submission.manual_tx_id && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-stone-400">{mt.txIdResultLabel}</span>
                <span className="font-mono font-semibold text-stone-100 tabular-nums">{submission.manual_tx_id}</span>
              </div>
            )}
          </div>

          {statusNote && (
            <p className={`text-[11px] font-medium ${confirmedState ? 'text-emerald-300' : 'text-amber-300'}`}>
              {statusNote}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {!confirmedState && (
              <button
                type="button"
                onClick={handleCheckStatus}
                disabled={checkingStatus}
                className="flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-stone-100 cursor-pointer"
              >
                {checkingStatus ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                <span>{checkingStatus ? mt.checkingStatus : mt.checkStatus}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onDone || handleReset}
              className="py-2 px-3.5 rounded-lg text-xs font-semibold bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 cursor-pointer"
            >
              {onDone ? mt.done : mt.submitAnother}
            </button>
          </div>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all no-underline"
          style={{
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            color: '#ffffff',
            boxShadow: '0 6px 20px rgba(37,211,102,0.2)',
          }}
        >
          <MessageCircle size={15} />
          <span>{tr('momoManual.sendWhatsApp', { code: merchantCode })}</span>
          <ExternalLink size={12} className="opacity-80" />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Static QR + Merchant Code Display */}
      <div
        className={`rounded-xl border border-amber-400/30 bg-black/45 space-y-3 ${
          compact ? 'p-3.5' : 'p-4'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Scannable QR Code */}
          <div className="flex flex-col items-center shrink-0">
            <div className="bg-white p-2 rounded-xl shadow-md border-2 border-amber-400/60">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`MTN MoMo Pay ${merchantCode} QR Code`}
                  width={compact ? 120 : 140}
                  height={compact ? 120 : 140}
                  className="block rounded"
                />
              ) : (
                <div
                  className="flex flex-col items-center justify-center text-stone-800"
                  style={{ width: compact ? 120 : 140, height: compact ? 120 : 140 }}
                >
                  <QrCode size={40} />
                  <span className="text-[11px] font-bold mt-1">{merchantCode}</span>
                </div>
              )}
            </div>
            <span className="text-[10px] text-stone-400 text-center mt-1.5 max-w-[152px] leading-snug">
              {tr('momoManual.qrCaption', { code: merchantCode })}
            </span>
          </div>

          {/* Merchant ID, Name & MoMo Line */}
          <div className="flex-1 w-full min-w-0 space-y-2.5">
            <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-amber-400/10 border border-amber-400/30">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-amber-300/80 font-semibold">
                  {mt.merchantIdLabel}
                </div>
                <div className="text-2xl font-extrabold tracking-wider text-amber-300 tabular-nums leading-tight mt-0.5">
                  {merchantCode}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy('code', merchantCode)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/35 cursor-pointer shrink-0 whitespace-nowrap"
              >
                {copiedKey === 'code' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedKey === 'code' ? mt.copied : mt.copyCode}</span>
              </button>
            </div>

            <div className="rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-stone-400">{mt.merchantNameLabel}</span>
                <strong className="text-stone-100 font-semibold truncate">{merchantName}</strong>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-stone-400">{mt.supportLineLabel}</span>
                <button
                  type="button"
                  onClick={() => handleCopy('phone', supportPhone)}
                  className="inline-flex items-center gap-1.5 text-amber-200 hover:text-amber-100 font-semibold cursor-pointer tabular-nums whitespace-nowrap"
                  title={mt.copyPhone}
                >
                  <span>{formattedSupportPhone}</span>
                  {copiedKey === 'phone' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} className="opacity-75" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width USSD Quick Dial Row */}
        <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">
              {mt.ussdLabel}
            </span>
            <code className="text-xs font-mono font-bold text-amber-200 tabular-nums whitespace-nowrap">
              {ussdCode}
            </code>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={telUri}
              className="py-2 px-3 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 bg-yellow-400 text-stone-950 hover:bg-yellow-300 transition-colors no-underline whitespace-nowrap"
            >
              <PhoneCall size={12} />
              <span>{mt.dialNow}</span>
            </a>
            <button
              type="button"
              onClick={() => handleCopy('ussd', ussdCode)}
              className="py-2 px-3 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-stone-200 cursor-pointer whitespace-nowrap"
            >
              {copiedKey === 'ussd' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedKey === 'ussd' ? mt.copied : mt.copyUssd}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Honest Manual Verification Disclaimer */}
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/[0.07] border border-amber-500/20 text-[11px] text-stone-300 leading-relaxed">
        <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-200">{mt.manualNoteTitle}:</strong>{' '}
          {tr('momoManual.manualNoteBody', { code: merchantCode, name: merchantName })}
        </div>
      </div>

      {/* Proof Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            htmlFor={`momo-tx-id-${gameId || requestId || subscriptionPlan || 'default'}`}
            className="block text-[11px] font-semibold uppercase tracking-wider text-stone-300 mb-1.5 flex items-center gap-1.5"
          >
            <ReceiptText size={13} className="text-amber-400" />
            <span>{mt.txIdLabel}</span>
          </label>
          <input
            id={`momo-tx-id-${gameId || requestId || subscriptionPlan || 'default'}`}
            type="text"
            placeholder={mt.txIdPlaceholder}
            value={manualTxId}
            onChange={(e) => {
              setManualTxId(e.target.value);
              setErrorMessage('');
            }}
            className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm font-mono text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Screenshot Upload */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
              <ImageIcon size={13} className="text-amber-400" />
              <span>{mt.screenshotLabel}</span>
            </label>
            <span className="text-[10px] text-stone-400">{mt.orText}</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            className="sr-only"
          />

          {!screenshotData ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={compressing}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-amber-400/35 bg-black/30 hover:bg-amber-400/5 text-xs text-amber-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {compressing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              <span>{compressing ? mt.compressingImage : mt.chooseScreenshot}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/45 border border-emerald-500/35">
              <img
                src={screenshotData}
                alt="Payment screenshot preview"
                className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-emerald-300 truncate">{screenshotName || 'Receipt attached'}</p>
                <div className="flex items-center gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-amber-300 hover:underline cursor-pointer"
                  >
                    {mt.changeScreenshot}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshotData('');
                      setScreenshotName('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-[11px] text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={11} /> {mt.removeScreenshot}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Optional Sender Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <input
            type="tel"
            aria-label={mt.senderPhoneLabel}
            placeholder={mt.senderPhoneLabel}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-black/35 border border-white/10 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-400/40"
          />
          <input
            type="text"
            aria-label={mt.payerNameLabel}
            placeholder={mt.payerNameLabel}
            value={payerName}
            onChange={(e) => setPayerName(e.target.value)}
            className="w-full bg-black/35 border border-white/10 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-400/40"
          />
        </div>

        {showEmail && (
          <input
            type="email"
            aria-label={mt.emailLabel}
            placeholder={mt.emailLabel}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/35 border border-white/10 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-400/40"
          />
        )}

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || compressing || effectiveAmount < minAmount}
          className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-55"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.95), rgba(184,134,11,0.95))',
            color: '#0f0f16',
            boxShadow: '0 8px 24px rgba(201,168,76,0.24)',
          }}
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>{mt.submitting}</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={15} />
              <span>{tr('momoManual.submitProof', { amount: formatRwf(effectiveAmount) })}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
