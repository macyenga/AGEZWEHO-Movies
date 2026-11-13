import { useRef, useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Swords,
  Laugh,
  Theater,
  Zap,
  Ghost,
  Heart,
  Rocket,
  Wand2,
  Sparkles,
  Siren,
  Eye,
} from 'lucide-react';
import { MOVIE_CATEGORIES } from '../lib/movie-filters';
import { useLanguage } from '../contexts/LanguageContext';
import { getCategoryLabel } from '../lib/i18n';

const CATEGORY_ICONS = {
  All: Compass,
  Action: Swords,
  Comedy: Laugh,
  Drama: Theater,
  Thriller: Zap,
  Horror: Ghost,
  Romance: Heart,
  'Sci-Fi': Rocket,
  Fantasy: Wand2,
  Animation: Sparkles,
  Adventure: Compass,
  Crime: Siren,
  Mystery: Eye,
};

export default function CategoryFilterBar({
  categories = MOVIE_CATEGORIES,
  activeCategory = 'All',
  onSelectCategory = () => {},
  counts = {},
  label,
}) {
  const { language, t } = useLanguage();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [updateScrollButtons, categories.length]);

  const scrollByAmount = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 240, behavior: 'smooth' });
  };

  const handleSelect = (category, event) => {
    onSelectCategory(category);
    if (event?.currentTarget && typeof event.currentTarget.scrollIntoView === 'function') {
      event.currentTarget.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  };

  const allItems = ['All', ...categories];

  return (
    <div className="mb-5" aria-label={label || t.homeSections.filterByCategoryAria}>
      <div className="relative flex items-center gap-1.5">
        {/* Left scroll button */}
        <button
          type="button"
          onClick={() => scrollByAmount(-1)}
          disabled={!canScrollLeft}
          aria-label="Scroll categories left"
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-25 disabled:cursor-default"
          style={{
            background: 'rgba(20,20,30,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: canScrollLeft ? '#e8c87a' : '#4a4a3a',
          }}
        >
          <ChevronLeft size={14} />
        </button>

        {/* Horizontal scrolling category track */}
        <div className="relative flex-1 min-w-0">
          {canScrollLeft && (
            <div
              className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-10"
              style={{ background: 'linear-gradient(90deg, rgba(10,10,15,0.95), transparent)' }}
            />
          )}
          {canScrollRight && (
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 z-10"
              style={{ background: 'linear-gradient(270deg, rgba(10,10,15,0.95), transparent)' }}
            />
          )}

          <div
            ref={scrollRef}
            onScroll={updateScrollButtons}
            data-testid="category-scroll-track"
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 px-0.5 flex-nowrap"
            style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
          >
            {allItems.map((category) => {
              const Icon = CATEGORY_ICONS[category] || Compass;
              const isActive = (activeCategory || 'All') === category;
              const count = typeof counts[category] === 'number' ? counts[category] : null;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={(e) => handleSelect(category, e)}
                  aria-pressed={isActive}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer"
                  style={
                    isActive
                      ? {
                          background: 'linear-gradient(135deg, rgba(201,168,76,0.22), rgba(201,168,76,0.1))',
                          border: '1px solid rgba(201,168,76,0.55)',
                          color: '#f5e4a8',
                          boxShadow: '0 2px 12px rgba(201,168,76,0.16)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#9b9889',
                        }
                  }
                >
                  <Icon size={11} style={{ color: isActive ? '#e8c87a' : '#6a6a5a' }} />
                  <span>{getCategoryLabel(category, language)}</span>
                  {count !== null && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                      style={{
                        background: isActive ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)',
                        color: isActive ? '#f5e4a8' : '#6a6a5a',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right scroll button */}
        <button
          type="button"
          onClick={() => scrollByAmount(1)}
          disabled={!canScrollRight}
          aria-label="Scroll categories right"
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-25 disabled:cursor-default"
          style={{
            background: 'rgba(20,20,30,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: canScrollRight ? '#e8c87a' : '#4a4a3a',
          }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
