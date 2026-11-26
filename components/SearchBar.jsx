import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, onClear, placeholder = 'Search by title, genre, language...' }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  return (
    <div className="relative">
      <motion.div
        animate={{
          boxShadow: focused
            ? '0 0 0 1.5px var(--gold), var(--shadow-card)'
            : '0 0 0 1px var(--border)',
        }}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
        style={{
          background: 'var(--bg-input)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
        }}
      >
        <motion.div animate={{ color: focused ? 'var(--gold)' : 'var(--muted)' }} transition={{ duration: 0.15 }}>
          <Search size={16} />
        </motion.div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--text)' }}
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              type="button"
              onClick={() => {
                onClear();
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="transition-colors cursor-pointer"
              style={{ color: 'var(--muted)' }}
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div
        animate={{ scaleX: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="absolute bottom-0 left-4 right-4 h-px origin-left pointer-events-none"
        style={{ background: 'linear-gradient(90deg, var(--gold), var(--gold2), var(--gold))' }}
      />
    </div>
  );
}
