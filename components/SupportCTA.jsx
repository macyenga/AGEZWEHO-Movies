import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { HeartHandshake, Users, TrendingUp } from 'lucide-react';

const GOLD = '#c9a84c';

export default function SupportCTA() {
  const [stats, setStats] = useState(null);

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
    <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-10">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-20px' }}
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.16)' }}>
        <div className="orb absolute -top-24 right-0 w-[280px] h-[280px]" style={{ background: 'rgba(201,168,76,0.05)' }} />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="section-tag mb-2 flex items-center gap-2">
              <HeartHandshake size={11} style={{ color: GOLD }} /> Keep Us Free
            </div>
            <p className="text-xs leading-relaxed mb-1" style={{ color: '#8a8778' }}>
              Agezweho is <span className="font-semibold" style={{ color: '#e8c87a' }}>100% free</span> to watch because of viewers like you.
            </p>
            <p className="text-[11px] mb-4" style={{ color: '#6a6a5a' }}>
              A tiny MoMo donation covers hosting, uploads & bandwidth for the month.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: '#6a6a5a' }}>Raised this month</div>
                <div className="text-lg font-bold" style={{ color: GOLD }}>
                  {stats.monthlyTotal.toLocaleString()} <span style={{ color: '#8a8778', fontSize: 12, fontWeight: 400 }}>/ {stats.monthlyGoal.toLocaleString()} RWF</span>
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: '#6a6a5a' }}><Users size={8} /> Supporters</div>
                <div className="text-lg font-bold" style={{ color: '#e8e6f0' }}>{(stats.totalDonors || 0).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.16)' }}>
                <TrendingUp size={11} style={{ color: GOLD }} />
                <span className="text-[10px]" style={{ color: '#e8c87a' }}>{pct}% of monthly goal</span>
              </div>
            </div>

            <div className="mt-4 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.12)' }}>
              <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #a07828, #e8c87a)' }} />
            </div>
          </div>

          <Link href="/support" className="flex-shrink-0">
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.9), rgba(160,120,40,0.9))', color: '#0a0808', boxShadow: '0 12px 30px rgba(201,168,76,0.18)' }}>
              <HeartHandshake size={16} /> Support Us
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}