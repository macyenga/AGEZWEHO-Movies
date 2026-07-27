import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Heart, Smartphone } from 'lucide-react';

export default function DonationFloat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed z-[60] right-4 bottom-4 sm:right-5 sm:bottom-5">
      {open && (
        <div className="mb-3 w-[min(92vw,320px)] rounded-2xl p-4"
          style={{ background: 'rgba(13,13,22,0.96)', border: '1px solid rgba(255,204,0,0.24)', boxShadow: '0 18px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(18px)' }}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,204,0,0.12)', border: '1px solid rgba(255,204,0,0.3)' }}>
              <Smartphone size={19} style={{ color: '#FFCC00' }} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold" style={{ color: '#FFCC00' }}>Support Agezweho</div>
              <div className="text-[11px] leading-relaxed" style={{ color: '#8a8778' }}>
                Keep new movies coming faster with MTN MoMo support. Admin confirms after payment.
              </div>
            </div>
          </div>

          <div className="rounded-xl px-3 py-3 mb-3 text-center" style={{ background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,204,0,0.18)' }}>
            <p className="text-[10px] mb-1" style={{ color: '#8a8778' }}>MoMo Number</p>
            <p className="font-bold tracking-wider" style={{ color: '#FFCC00', fontFamily: 'monospace', fontSize: '16px' }}>{process.env.NEXT_PUBLIC_MOMO_NUMBER || '0789690247'}</p>
          </div>

          <div className="rounded-xl px-3 py-3 mb-4 text-center" style={{ background: 'rgba(255,204,0,0.05)', border: '1px solid rgba(255,204,0,0.18)' }}>
            <p className="text-[10px] mb-1" style={{ color: '#8a8778' }}>Or dial USSD Pay Code</p>
            <p className="font-bold tracking-wider text-sm" style={{ color: '#FFCC00', fontFamily: 'monospace' }}>{process.env.NEXT_PUBLIC_USSD_CODE || '*182*8*1*156833#'}</p>
          </div>

          <div className="flex gap-2">
            <Link href="/requests" className="flex-1">
              <span className="block text-center py-2.5 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(255,204,0,0.1)', border: '1px solid rgba(255,204,0,0.3)', color: '#FFCC00' }}>
                Boost a Request
              </span>
            </Link>
            <Link href="/support" className="flex-1">
              <span className="block text-center py-2.5 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', color: '#e8c87a' }}>
                Donate
              </span>
            </Link>
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5">
            <CheckCircle2 size={10} style={{ color: '#fbbf24' }} />
            <span className="text-[9px]" style={{ color: '#4a4a3a' }}>Admin confirms after payment</span>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(v => !v)}
        className="h-12 rounded-full px-4 flex items-center gap-2 text-xs font-bold"
        style={{ background: 'linear-gradient(135deg, rgba(255,204,0,0.95), rgba(201,168,76,0.95))', color: '#161006', boxShadow: '0 12px 36px rgba(255,204,0,0.22)' }}>
        <Heart size={15} fill="currentColor" />
        MoMo Donate
      </button>
    </div>
  );
}
