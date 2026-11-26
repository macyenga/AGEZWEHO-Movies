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
          background: 'var(--bg-card)',
          border: '1px solid var(--border2)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--border2), transparent)' }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] gap-6 lg:gap-10 items-center">
          <div className="min-w-0">
            <div className="section-tag mb-2.5 flex items-center gap-2">
              <Mail size={12} style={{ color: 'var(--gold)' }} />
              <span>{copy.tag}</span>
            </div>

            <h2
              id="newsletter-signup-heading"
              className="font-cinzel font-semibold leading-snug mb-2.5"
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 'clamp(1.25rem, 2.2vw, 1.75rem)',
                color: 'var(--text)',
              }}
            >
              {copy.heading}
            </h2>

            <p className="text-xs sm:text-sm leading-relaxed max-w-xl" style={{ color: 'var(--text2)' }}>
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
                  background: 'var(--green-bg)',
                  border: '1px solid var(--green-border)',
                }}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--green)' }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>
                      {status === 'already' ? copy.alreadyTitle : copy.successTitle}
                    </div>
                    <p className="text-xs leading-relaxed break-words" style={{ color: 'var(--text2)' }}>
                      {status === 'already'
                        ? tr('newsletter.alreadyMessage', { email: confirmedEmail })
                        : tr('newsletter.successMessage', { email: confirmedEmail })}
                    </p>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="mt-3 text-[11px] font-medium underline cursor-pointer transition-opacity hover:opacity-80"
                      style={{ color: 'var(--green)' }}
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
                      style={{ color: status === 'error' ? 'var(--danger)' : 'var(--muted)' }}
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
                      className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                      style={status === 'error' ? { borderColor: 'var(--danger-border)' } : undefined}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    data-testid="newsletter-submit-btn"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-transform duration-150 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: 'var(--gold2)',
                      color: 'var(--accent-ink)',
                      boxShadow: '0 8px 20px rgba(180, 134, 11, 0.2)',
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
                    style={{ color: 'var(--danger)' }}
                  >
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </p>
                ) : (
                  <p id="newsletter-privacy-note" className="mt-2.5 text-[11px]" style={{ color: 'var(--muted)' }}>
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
