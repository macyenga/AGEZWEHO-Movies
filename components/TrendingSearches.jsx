import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, TrendingUp, Flame, ArrowRight } from 'lucide-react';
import { TOP_QUERIES, RISING_QUERIES, getQueryUrl } from '../lib/trending';

const BreakoutBadge = () => (
  <span className="text-[8px] px-1.5 py-0.5 rounded-md font-semibold"
    style={{ background:'rgba(239,68,68,0.12)', color:'#f87171', border:'1px solid rgba(239,68,68,0.25)' }}>
    Breakout
  </span>
);

const RisingBadge = ({ percent }) => (
  <span className="text-[8px] px-1.5 py-0.5 rounded-md font-semibold"
    style={{ background:'rgba(201,168,76,0.12)', color:'#c9a84c', border:'1px solid rgba(201,168,76,0.25)' }}>
    {percent}
  </span>
);

function QueryItem({ q, index, badge }) {
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
        <span className="text-[11px] font-medium truncate" style={{ color: '#b8b4a8' }}>
          {q.query}
        </span>
      </Link>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isBreakout ? <BreakoutBadge /> : <RisingBadge percent={q.trend} />}
        <span className="text-[9px] tabular-nums" style={{ color: '#4a4a3a' }}>{q.interest}</span>
      </div>
    </motion.div>
  );
}

export default function TrendingSearches({ compact = false }) {
  if (compact) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={12} style={{ color: '#c9a84c' }} />
          <span className="section-tag" style={{ color: '#c9a84c' }}>Trending Searches</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TOP_QUERIES.slice(0, 6).map((q, i) => (
            <motion.a key={q.query} href={getQueryUrl(q.query)}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
              style={{
                background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)', color: '#c9a84c',
              }}>
              <Search size={10} /> {q.query}
            </motion.a>
          ))}
          <Link href="/finder">
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#8a8778' }}>
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
        <Flame size={14} style={{ color: '#c9a84c' }} />
        <span className="section-tag" style={{ color: '#c9a84c' }}>Trending Agasobanuye Searches</span>
        <div className="flex-1 divider-soft" />
        <Link href="/finder">
          <span className="text-[10px] cursor-pointer hover:underline" style={{ color: '#6a6a5a' }}>Search all →</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Queries */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(14,14,22,0.5)', border: '1px solid rgba(201,168,76,0.1)' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={12} style={{ color: '#c9a84c' }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#e8c87a' }}>Top Queries</span>
          </div>
          <div className="space-y-2">
            {TOP_QUERIES.map((q, i) => (
              <QueryItem key={q.query} q={q} index={i} badge="top" />
            ))}
          </div>
        </div>

        {/* Rising Queries */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(14,14,22,0.5)', border: '1px solid rgba(251,191,36,0.1)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Flame size={12} style={{ color: '#fbbf24' }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#fbbf24' }}>Rising Queries</span>
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