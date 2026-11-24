import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { isValidNewsletterEmail, normalizeNewsletterEmail } from '../lib/newsletter';

const GOLD = '#c9a84c';
const GOLD_LIGHT = '#e8c87a';

export default function NewsletterSignup({ source = 'homepage' }) {
  const { language, t, tr } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | already | error
  const [confirmedEmail, setConfirmedEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const copy = t.newsletter;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalized = normalizeNewsletterEmail(email);

    if (!normalized) {
      setStatus('error');
      setErrorMessage(copy.emptyEmail);
      return;
    }

    if (!isValidNewsletterEmail(normalized)) {
      setStatus('error');
      setErrorMessage(copy.invalidEmail);
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalized,
          source,
          language,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || copy.genericError);
        return;
      }

      setConfirmedEmail(data.email || normalized);
      setEmail('');
      setStatus(data.alreadySubscribed ? 'already' : 'success');
    } catch {
      setStatus('error');
      setErrorMessage(copy.genericError);
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setErrorMessage('');
    setConfirmedEmail('');
  };

  const isSuccess = status === 'success' || status === 'already';

  return (
    <section
      aria-labelledby="newsletter-signup-heading"
      data-testid="newsletter-signup-section"
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10"
    >
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 lg:p-10"
        style={{
          background: 'linear-gradient(135deg, rgba(16,16,24,0.94) 0%, rgba(11,11,17,0.96) 100%)',
          border: '1px solid rgba(201,168,76,0.2)',
          boxShadow: '0 18px 48px rgba(0,0,0,0.42)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.45), transparent)' }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] gap-6 lg:gap-10 items-center">
          <div className="min-w-0">
            <div className="section-tag mb-2.5 flex items-center gap-2">
              <Mail size={12} style={{ color: GOLD }} />
              <span>{copy.tag}</span>
            </div>

            <h2
              id="newsletter-signup-heading"
              className="font-cinzel font-semibold leading-snug mb-2.5"
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 'clamp(1.25rem, 2.2vw, 1.75rem)',
                color: '#f5f2e8',
              }}
            >
              {copy.heading}
            </h2>

            <p className="text-xs sm:text-sm leading-relaxed max-w-xl" style={{ color: '#a5a193' }}>
              {copy.description}
            </p>
          </div>

          <div className="min-w-0">
            {isSuccess ? (
              <div
                data-testid="newsletter-success"
                role="status"
                aria-live="polite"
                className="rounded-xl p-4 sm:p-5"
                style={{
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(74,222,128,0.28)',
                }}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: '#4ade80' }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold mb-1" style={{ color: '#dcfce7' }}>
                      {status === 'already' ? copy.alreadyTitle : copy.successTitle}
                    </div>
                    <p className="text-xs leading-relaxed break-words" style={{ color: '#bbf7d0' }}>
                      {status === 'already'
                        ? tr('newsletter.alreadyMessage', { email: confirmedEmail })
                        : tr('newsletter.successMessage', { email: confirmedEmail })}
                    </p>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="mt-3 text-[11px] font-medium underline cursor-pointer transition-colors hover:text-white"
                      style={{ color: '#86efac' }}
                    >
                      {copy.addAnother}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate data-testid="newsletter-form">
                <label htmlFor="newsletter-email-input" className="sr-only">
                  {copy.emailLabel}
                </label>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1 min-w-0">
                    <Mail
                      size={15}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: status === 'error' ? '#f87171' : '#8a8679' }}
                    />
                    <input
                      id="newsletter-email-input"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') {
                          setStatus('idle');
                          setErrorMessage('');
                        }
                      }}
                      placeholder={copy.emailPlaceholder}
                      disabled={status === 'submitting'}
                      aria-invalid={status === 'error'}
                      aria-describedby={status === 'error' ? 'newsletter-email-error' : 'newsletter-privacy-note'}
                      data-testid="newsletter-email-input"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-[#f5f2e8] placeholder-[#6b685c] transition-colors focus:outline-none"
                      style={{
                        background: 'rgba(6,6,11,0.85)',
                        border:
                          status === 'error'
                            ? '1px solid rgba(248,113,113,0.65)'
                            : '1px solid rgba(255,255,255,0.14)',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    data-testid="newsletter-submit-btn"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-transform duration-150 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)`,
                      color: '#09080b',
                      boxShadow: '0 10px 26px rgba(201,168,76,0.2)',
                    }}
                  >
                    <span>{status === 'submitting' ? copy.submitting : copy.submit}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {status === 'error' && errorMessage ? (
                  <p
                    id="newsletter-email-error"
                    data-testid="newsletter-error"
                    role="alert"
                    aria-live="polite"
                    className="mt-2.5 flex items-center gap-1.5 text-xs"
                    style={{ color: '#fca5a5' }}
                  >
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </p>
                ) : (
                  <p id="newsletter-privacy-note" className="mt-2.5 text-[11px]" style={{ color: '#787467' }}>
                    {copy.privacyNote}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
