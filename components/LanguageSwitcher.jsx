import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGE_META } from '../lib/i18n';

export default function LanguageSwitcher({
  variant = 'compact', // 'compact' | 'expanded'
  testIdPrefix = 'lang',
  className = '',
}) {
  const { language, setLanguage, t } = useLanguage();
  const isExpanded = variant === 'expanded';

  const options = [
    { code: 'en', label: isExpanded ? LANGUAGE_META.en.label : LANGUAGE_META.en.shortLabel, full: LANGUAGE_META.en.label },
    { code: 'rw', label: isExpanded ? LANGUAGE_META.rw.label : LANGUAGE_META.rw.shortLabel, full: LANGUAGE_META.rw.label },
  ];

  return (
    <div
      role="group"
      aria-label={t.lang.switcherAria}
      data-testid={`${testIdPrefix}-switcher`}
      data-active-lang={language}
      className={`inline-flex items-center gap-1 rounded-xl p-0.5 flex-shrink-0 ${
        isExpanded ? 'w-full justify-between px-1.5 py-1' : ''
      } ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(201, 168, 76, 0.24)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <span
        className={`inline-flex items-center gap-1.5 pl-1.5 pr-0.5 ${
          isExpanded ? 'text-xs font-medium' : 'hidden sm:inline-flex'
        }`}
        style={{ color: '#c9a84c' }}
        aria-hidden="true"
      >
        <Languages size={isExpanded ? 14 : 13} />
        {isExpanded && <span>{t.lang.label}</span>}
      </span>

      <div className="inline-flex items-center gap-0.5">
        {options.map((opt) => {
          const active = language === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLanguage(opt.code)}
              aria-pressed={active}
              aria-label={opt.code === 'rw' ? t.lang.switchToRw : t.lang.switchToEn}
              title={opt.full}
              data-testid={`${testIdPrefix}-btn-${opt.code}`}
              className={`rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center ${
                isExpanded
                  ? 'min-h-[38px] px-3 text-xs'
                  : 'min-h-[30px] sm:min-h-[32px] px-2 py-1 text-[11px]'
              }`}
              style={
                active
                  ? {
                      background: 'linear-gradient(135deg, #f5e4a8 0%, #c9a84c 100%)',
                      color: '#0a0808',
                      boxShadow: '0 2px 10px rgba(201, 168, 76, 0.28)',
                    }
                  : {
                      background: 'transparent',
                      color: '#b8b4a8',
                    }
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
