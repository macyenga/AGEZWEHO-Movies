import { useRef } from 'react';
import { motion } from 'framer-motion';

const WIDTHS = { '3xl': 'max-w-3xl', '6xl': 'max-w-6xl' };

export default function FilterNav({ items = [], active = '', onSelect = () => {}, accent = '#c9a84c', maxWidth = '6xl', children }) {
  const navRef = useRef(null);
  const scroll = (dir) => {
    if (navRef.current) navRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="sticky top-[110px] md:top-[64px] z-40"
      style={{ background: 'rgba(10,10,16,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className={`relative ${WIDTHS[maxWidth] || 'max-w-6xl'} mx-auto px-4 sm:px-6`}>
        <div className="flex items-center gap-2">
          <div ref={navRef} className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-2.5 flex-1"
            style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
            {items.map(item => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <motion.button key={item.id} onClick={() => onSelect(item.id)}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all whitespace-nowrap"
                  style={{
                    background: isActive ? `${accent}26` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? `${accent}80` : 'rgba(255,255,255,0.08)'}`,
                    color: isActive ? accent : '#6a6a5a',
                    boxShadow: isActive ? `0 0 12px ${accent}1a` : 'none',
                  }}>
                  {Icon && <Icon size={10} />} {item.label}
                </motion.button>
              );
            })}
          </div>
          {children && <div className="flex-shrink-0">{children}</div>}
        </div>
      </div>
    </motion.div>
  );
}
