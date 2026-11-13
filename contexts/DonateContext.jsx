import { createContext, useContext, useState, useCallback } from 'react';
import DonateModal from '../components/DonateModal';
import { PAYPACK_CLIENT_CONFIG } from '../lib/paypack-client';

const DEFAULT_OPTIONS = {
  title: 'Donate to Agasobanuye.rw',
  subtitle: 'Select a donation amount, then proceed to Paypack (MTN MoMo & Airtel Money).',
  merchantName: PAYPACK_CLIENT_CONFIG.merchantName || 'Agasobanuye',
  defaultAmount: 1000,
  purpose: 'Donation / Support Agasobanuye.rw',
  requestId: null,
  movieId: null,
  gameId: null,
  onSuccess: null,
};

const DonateContext = createContext({
  isOpen: false,
  options: DEFAULT_OPTIONS,
  openDonate: () => {},
  closeDonate: () => {},
});

export function DonateProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);

  const openDonate = useCallback((customOptions = {}) => {
    setOptions({
      ...DEFAULT_OPTIONS,
      ...customOptions,
    });
    setIsOpen(true);
  }, []);

  const closeDonate = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <DonateContext.Provider value={{ isOpen, options, openDonate, closeDonate }}>
      {children}
      <DonateModal isOpen={isOpen} onClose={closeDonate} options={options} />
    </DonateContext.Provider>
  );
}

export function useDonate() {
  return useContext(DonateContext);
}
