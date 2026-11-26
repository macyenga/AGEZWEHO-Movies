import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const GOLD = 'var(--gold)';
const GOLD_LIGHT = 'var(--gold2)';

export default function MovieFaqSection({ faqs = [], movieTitle = '' }) {
  const [openIds, setOpenIds] = useState(() => (faqs[0]?.id ? [faqs[0].id] : []));

  if (!Array.isArray(faqs) || faqs.length === 0) return null;

  const toggleItem = (id) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <section
      id="faq"
      aria-labelledby="movie-faq-heading"
      data-testid="movie-faq-section"
      className="space-y-3 scroll-mt-24"
    >
      <div
        className="flex flex-wrap items-center justify-between gap-2 pb-2.5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <h2
          id="movie-faq-heading"
          className="text-sm font-semibold flex items-center gap-2"
          style={{ color: 'var(--text)' }}
        >
          <HelpCircle size={15} style={{ color: GOLD_LIGHT }} />
          <span>Frequently Asked Questions{movieTitle ? ` — ${movieTitle}` : ''}</span>
        </h2>
        <span className="text-xs tabular-nums" style={{ color: 'var(--muted)' }}>
          {faqs.length} answers
        </span>
      </div>

      <div
        className="divide-y divide-[var(--border-subtle)] rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {faqs.map((faq) => {
          const isOpen = openIds.includes(faq.id);
          const panelId = `movie-faq-panel-${faq.id}`;
          return (
            <div key={faq.id} className="transition-colors hover:bg-[var(--bg-ghost)]">
              <h3 className="m-0">
                <button
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold leading-snug" style={{ color: isOpen ? GOLD_LIGHT : 'var(--text)' }}>
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className="shrink-0 transition-transform duration-200"
                    style={{
                      color: isOpen ? GOLD : 'var(--muted)',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>
              </h3>
              <div
                id={panelId}
                hidden={!isOpen}
                className="px-5 pb-4 text-xs sm:text-sm leading-relaxed"
                style={{ color: 'var(--text2)' }}
              >
                {faq.answer}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
