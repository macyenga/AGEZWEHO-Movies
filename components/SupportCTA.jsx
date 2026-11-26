import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { HeartHandshake, Users, TrendingUp } from 'lucide-react';
import { useDonate } from '../contexts/DonateContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PAYPACK_CLIENT_CONFIG } from '../lib/paypack-client';

const GOLD = 'var(--gold)';

export default function SupportCTA() {
  const [stats, setStats] = useState(null);
  const { openDonate } = useDonate();
  const { t, tr } = useLanguage();

  useEffect(() => {
    fetch('/api/donations/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const pct = stats.monthlyGoal > 0
    ? Math.min(100, Math.round((stats.monthlyTotal / stats.monthlyGoal) * 100))
    : 0;

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border2)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="orb absolute -top-24 right-0 w-[280px] h-[280px]" style={{ background: 'var(--accent-bg)' }} />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="section-tag mb-2 flex items-center gap-2">
              <HeartHandshake size={11} style={{ color: GOLD }} /> {t.supportCta.tag}
            </div>
            <p className="text-xs sm:text-sm leading-relaxed mb-1" style={{ color: 'var(--text2)' }}>
              {t.supportCta.headlinePrefix} <span className="font-semibold" style={{ color: 'var(--gold2)' }}>{t.supportCta.headlineHighlight}</span> {t.supportCta.headlineSuffix}
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
              {t.supportCta.paypackPrefix} <strong style={{ color: 'var(--gold2)' }}>{t.supportCta.paypackNetwork}</strong> {t.supportCta.paypackDetails} <strong style={{ color: 'var(--gold)' }}>{PAYPACK_CLIENT_CONFIG.merchantName}</strong> {t.supportCta.paypackSuffix}
            </p>

            <div className="flex items-center gap-6 flex-wrap tabular-nums">
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>{t.supportCta.raisedThisMonth}</div>
                <div className="text-lg font-bold" style={{ color: GOLD }}>
                  {stats.monthlyTotal.toLocaleString()} <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 400 }}>/ {stats.monthlyGoal.toLocaleString()} RWF</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: 'var(--muted)' }}><Users size={10} /> {t.supportCta.supporters}</div>
                <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>{(stats.totalDonors || 0).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--gold2)' }}>
                <TrendingUp size={13} style={{ color: GOLD }} />
                <span>{tr('supportCta.goalPct', { pct })}</span>
              </div>
            </div>

            <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg4)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: 'var(--gold2)' }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center gap-2.5 flex-shrink-0">
            <motion.button
              type="button"
              onClick={() => openDonate({ defaultAmount: 1000 })}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold cursor-pointer"
              style={{ background: 'var(--gold2)', color: 'var(--accent-ink)', boxShadow: '0 8px 24px rgba(180, 134, 11, 0.22)' }}
            >
              <HeartHandshake size={16} /> {t.supportCta.donateNow}
            </motion.button>
            <Link href="/support" className="text-center text-[11px] underline hover:opacity-80 transition-opacity" style={{ color: 'var(--muted)' }}>
              {t.supportCta.fullSupportPage}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}