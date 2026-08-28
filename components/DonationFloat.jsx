import { useState } from 'react';
import Link from 'next/link';
import { HeartHandshake, Loader2, X } from 'lucide-react';

const GOLD = '#c9a84c';

const QUICK_TIERS = [500, 1000, 2000];

export default function DonationFloat() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(1000);
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleDonate = async () => {
    setError('');
    if (!amount || amount < 100) {
      setError('Minimum donation is 100 RWF.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, phone: phone || null }),
      });
      const data = await res.json().catch(() => ({}));

      if (data.payment_url) {
        window.location.assign(data.payment_url);
        return;
      }
      setError(data.error || data.message || 'Could not start the payment. Please try again.');
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed z-[60] right-4 bottom-4 sm:right-5 sm:bottom-5">
      {open && (
        <div className="mb-3 w-[min(92vw,320px)] rounded-2xl p-4"
          style={{ background: 'rgba(13,13,22,0.96)', border: '1px solid rgba(201,168,76,0.28)', boxShadow: '0 18px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(18px)' }}>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <HeartHandshake size={19} style={{ color: GOLD }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold" style={{ color: '#e8c87a' }}>Support Agezweho</div>
              <div className="text-[11px] leading-relaxed" style={{ color: '#8a8778' }}>
                Keep the movies free with a quick MoMo donation.
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="flex-shrink-0 -mr-1 -mt-1"
              aria-label="Close">
              <X size={14} style={{ color: '#6a6a5a' }} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-2">
            {QUICK_TIERS.map(t => (
              <button key={t} onClick={() => setAmount(t)}
                className="py-2 rounded-xl text-xs font-bold transition-all"
                style={amount === t
                  ? { background: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.5)', color: '#e8c87a' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#8a8778' }}>
                {t.toLocaleString()}
              </button>
            ))}
          </div>

          <input
            type="tel" placeholder="MoMo number (optional)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-xs outline-none mb-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#e8e6f0' }}
          />

          {error && (
            <div className="mb-2 px-3 py-2 rounded-xl text-[10px]" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <button onClick={handleDonate} disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.95), rgba(160,120,40,0.95))', color: '#0a0808' }}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <HeartHandshake size={14} />}
            {submitting ? 'Starting…' : `Donate ${amount.toLocaleString()} RWF`}
          </button>

          <div className="mt-3 flex items-center justify-between">
            <Link href="/support">
              <span className="text-[10px] underline" style={{ color: '#6a6a5a' }}>More ways to support</span>
            </Link>
            <span className="text-[9px]" style={{ color: '#4a4a3a' }}>Powered by RwandaPay</span>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(v => !v)}
        className="h-12 rounded-full px-4 flex items-center gap-2 text-xs font-bold"
        style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.95), rgba(160,120,40,0.95))', color: '#0a0808', boxShadow: '0 12px 36px rgba(201,168,76,0.22)' }}>
        <HeartHandshake size={15} />
        Support
      </button>
    </div>
  );
}