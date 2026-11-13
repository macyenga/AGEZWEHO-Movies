import { HeartHandshake } from 'lucide-react';
import { useDonate } from '../contexts/DonateContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function DonationFloat() {
  const { openDonate } = useDonate();
  const { t } = useLanguage();

  return (
    <div className="fixed z-[60] right-4 bottom-4 sm:right-5 sm:bottom-5">
      <button
        type="button"
        onClick={() => openDonate()}
        className="h-12 rounded-full px-4 flex items-center gap-2 text-xs font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.95), rgba(160,120,40,0.95))',
          color: '#0a0808',
          boxShadow: '0 12px 36px rgba(201,168,76,0.28)',
        }}
      >
        <HeartHandshake size={15} />
        <span>{t.nav.donate}</span>
      </button>
    </div>
  );
}