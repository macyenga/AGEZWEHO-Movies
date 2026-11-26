import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, TrendingUp, Flame, ArrowRight } from 'lucide-react';
import { TOP_QUERIES, RISING_QUERIES, getQueryUrl } from '../lib/trending';

const BreakoutBadge = () => (
  <span className="text-[8px] px-1.5 py-0.5 rounded-md font-semibold"
    style={{ background:'var(--danger-bg)', color:'var(--danger)', border:'1px solid var(--danger-border)' }}>
    Breakout
  </span>
);

const RisingBadge = ({ percent }) => (
  <span className="text-[8px] px-1.5 py-0.5 rounded-md font-semibold"
    style={{ background:'var(--accent-bg)', color:'var(--gold2)', border:'1px solid var(--accent-border)' }}>
    {percent}
  </span>
);

function QueryItem({ q, index }) {
  const isBreakout = q.trend === 'Breakout';
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ x: 4 }}
      className="flex items-center gap-3 group"
    >
      <Link href={getQueryUrl(q.query)} className="flex-1 flex items-center gap-3 min-w-0">
        <span className="text-[11px] font-medium truncate hover:underline" style={{ color: 'var(--text2)' }}>
          {q.query}
        </span>
      </Link>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isBreakout ? <BreakoutBadge /> : <RisingBadge percent={q.trend} />}
        <span className="text-[9px] tabular-nums" style={{ color: 'var(--muted)' }}>{q.interest}</span>
      </div>
    </motion.div>
  );
}

export default function TrendingSearches({ compact = false }) {
  if (compact) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={12} style={{ color: 'var(--gold)' }} />
          <span className="section-tag" style={{ color: 'var(--gold)' }}>Trending Searches</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TOP_QUERIES.slice(0, 6).map((q, i) => (
            <motion.a key={q.query} href={getQueryUrl(q.query)}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
              style={{
                background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', color: 'var(--gold2)',
              }}>
              <Search size={10} /> {q.query}
            </motion.a>
          ))}
          <Link href="/finder">
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer">
              <ArrowRight size={10} /> More
            </motion.span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-10">
      <div className="flex items-center gap-3 mb-5">
        <Flame size={14} style={{ color: 'var(--gold)' }} />
        <span className="section-tag" style={{ color: 'var(--gold)' }}>Trending Agasobanuye Searches</span>
        <div className="flex-1 divider-soft" />
        <Link href="/finder">
          <span className="text-[10px] cursor-pointer hover:underline" style={{ color: 'var(--muted)' }}>Search all →</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Queries */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={12} style={{ color: 'var(--gold)' }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--gold2)' }}>Top Queries</span>
          </div>
          <div className="space-y-2">
            {TOP_QUERIES.map((q, i) => (
              <QueryItem key={q.query} q={q} index={i} badge="top" />
            ))}
          </div>
        </div>

        {/* Rising Queries */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--warn-border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Flame size={12} style={{ color: 'var(--warn)' }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--warn)' }}>Rising Queries</span>
          </div>
          <div className="space-y-2">
            {RISING_QUERIES.map((q, i) => (
              <QueryItem key={q.query} q={q} index={i} badge="rising" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}