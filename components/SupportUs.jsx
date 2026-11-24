import { useState } from 'react';
import { Heart, Shield, Sparkles } from 'lucide-react';
import { PAYPACK_CLIENT_CONFIG, formatRwf } from '../lib/paypack-client';
import { useLanguage } from '../contexts/LanguageContext';
import UnifiedPaymentFlow from './UnifiedPaymentFlow';

const DEFAULT_PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function SupportUs({
  variant = 'full', // 'full' | 'card' | 'compact'
  title,
  subtitle,
  merchantName = PAYPACK_CLIENT_CONFIG.merchantName || 'Iradukunda Didier',
  defaultAmount = 1000,
  presetAmounts = DEFAULT_PRESET_AMOUNTS,
  purpose = 'Donation / Support Us',
  defaultPhone = '',
  defaultEmail = '',
  whatsappButtonText,
  showWhatsappButton = true,
  requestId = null,
  movieId = null,
  gameId = null,
  onSuccess = null,
  className = '',
}) {
  const { t } = useLanguage();
  const resolvedTitle = title || t.supportForm.defaultTitle;
  const resolvedSubtitle = subtitle || t.supportForm.defaultSubtitle;
  const resolvedWhatsappButtonText = whatsappButtonText || t.supportForm.whatsappDefaultText;
  const [amount, setAmount] = useState(defaultAmount);
  const [customAmount, setCustomAmount] = useState('');

  const effectiveAmount = customAmount ? parseInt(customAmount, 10) || 0 : amount;

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
                className={`py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap tabular-nums transition-all border cursor-pointer ${
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

      {/* Unified Payment Area: Manual MoMo 156833 QR + Proof OR Paypack Push */}
      <div className="relative z-10">
        <UnifiedPaymentFlow
          amount={effectiveAmount}
          minAmount={100}
          merchantName={merchantName}
          purpose={purpose}
          requestId={requestId}
          movieId={movieId}
          gameId={gameId}
          defaultPhone={defaultPhone}
          defaultEmail={defaultEmail}
          showEmail={variant === 'full'}
          showPayerName={variant === 'full'}
          compact={variant === 'compact'}
          showWhatsappButton={showWhatsappButton}
          whatsappButtonText={resolvedWhatsappButtonText}
          onConfirmed={onSuccess}
        />
      </div>
    </div>
  );
}
