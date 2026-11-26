import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import { submitContact } from '../lib/supabase';
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Mail,
  MessageSquare,
  User,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getDirectContactChannels, getSocialConfig } from '../lib/social-config';

const EMPTY = { name: '', email: '', subject: '', message: '' };

const CONTACT_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Agasobanuye.rw',
  url: 'https://agasobanuye.rw/contact',
  description:
    'Contact Agasobanuye.rw directly on Telegram (+250789690247), WhatsApp (+250789690247), email, or via message form — open for Rwanda viewers and abroad supporters.',
  mainEntity: {
    '@type': 'Organization',
    name: 'Agasobanuye.rw',
    url: 'https://agasobanuye.rw',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+250789690247',
      contactType: 'customer support',
      url: 'https://t.me/+250789690247',
      email: 'macyenga@gmail.com',
      areaServed: 'Worldwide',
      availableLanguage: ['Kinyarwanda', 'English', 'French', 'Swahili'],
    },
  },
};

export default function Contact() {
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  const socialCfg = getSocialConfig();
  const channels = getDirectContactChannels();

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.message.trim()) e.message = 'Message is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await submitContact(form);
      setSuccess(true);
      setForm(EMPTY);
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (val, id) => {
    navigator.clipboard?.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Contact Us — Telegram (+250789690247), WhatsApp & Abroad Support"
        description="Talk directly with Agasobanuye.rw on Telegram (+250789690247), WhatsApp, or email. Support for Rwanda viewers and abroad diaspora fans."
        keywords="contact Agasobanuye.rw, Telegram +250789690247, WhatsApp Agasobanuye, diaspora Rwanda cinema support"
        canonical="https://agasobanuye.rw/contact"
        jsonLd={CONTACT_JSON_LD}
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-28 md:pt-24 pb-24 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline mb-3"
            style={{ color: 'var(--text2)' }}
          >
            <ArrowLeft size={13} /> Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
            >
              <Mail size={20} style={{ color: 'var(--gold2)' }} />
            </div>
            <div>
              <h1
                className="font-cinzel font-bold text-xl sm:text-2xl"
                style={{ fontFamily: 'Cinzel,serif', color: 'var(--gold2)' }}
              >
                {t.pages.contact.heading}
              </h1>
              <p className="text-xs" style={{ color: 'var(--text2)' }}>
                {t.pages.contact.subheading} · Direct chat for Rwanda &amp; abroad viewers
              </p>
            </div>
          </div>
          <div className="divider-gold w-20" />
        </motion.div>

        {/* Direct Communication Channels (Telegram +250789690247, WhatsApp, Email) */}
        <section
          aria-label="Direct communication channels"
          data-testid="direct-talk-channels"
          className="p-5 rounded-2xl space-y-4"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--accent-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] flex items-center gap-1.5" style={{ color: 'var(--gold2)' }}>
                <Globe size={12} />
                <span>Talk Directly With Us (Rwanda &amp; Abroad)</span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
                Need help supporting from abroad, requesting a subtitle/movie, or activating your Private Vault pass? Message us directly on Telegram{' '}
                <strong className="tabular-nums" style={{ color: 'var(--text)' }}>
                  {socialCfg.telegramPhone}
                </strong>
                .
              </p>
            </div>
            <Link
              href="/support"
              className="text-xs font-semibold hover:underline whitespace-nowrap"
              style={{ color: 'var(--gold2)' }}
            >
              Support Options →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="p-3.5 rounded-xl flex flex-col justify-between gap-2.5"
                style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border)' }}
              >
                <div>
                  <div className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
                    {ch.id.includes('telegram') ? (
                      <Send size={13} style={{ color: 'var(--blue)' }} />
                    ) : ch.id.includes('whatsapp') ? (
                      <MessageCircle size={13} style={{ color: 'var(--green)' }} />
                    ) : (
                      <Mail size={13} style={{ color: 'var(--gold2)' }} />
                    )}
                    <span>{ch.name}</span>
                  </div>
                  <div className="text-xs font-mono font-bold mt-1 tabular-nums" style={{ color: 'var(--gold2)' }}>
                    {ch.handle}
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                    {ch.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={ch.href}
                    target={ch.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={ch.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    data-testid={`contact-channel-${ch.id}`}
                    className="btn-primary flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                  >
                    <span>Open Chat</span>
                    <ExternalLink size={11} />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(ch.copyValue, ch.id)}
                    className="btn-ghost px-2.5 py-2 rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer"
                    aria-label={`Copy ${ch.name}`}
                  >
                    {copiedId === ch.id ? <Check size={12} style={{ color: 'var(--green)' }} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Success */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 p-6 rounded-2xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--green-border)' }}
            >
              <CheckCircle2 size={46} className="mx-auto mb-3" style={{ color: 'var(--green)' }} />
              <h3 className="font-cinzel text-xl mb-1.5" style={{ fontFamily: 'Cinzel,serif', color: 'var(--green)' }}>
                Message Sent!
              </h3>
              <p className="text-xs mb-5" style={{ color: 'var(--text2)' }}>
                We&apos;ll get back to you soon. For faster replies, reach us on Telegram {socialCfg.telegramPhone}.
              </p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Send size={13} /> Send Another Message
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        {!success && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 p-5 rounded-2xl"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gold2)' }}>
              Send a Web Message
            </div>

            <div>
              <label
                htmlFor="contact-name"
                className="flex items-center gap-1.5 text-[11px] font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--muted)' }}
              >
                <User size={11} /> Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="contact-name"
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Your name"
              />
              {errors.name && (
                <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="flex items-center gap-1.5 text-[11px] font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--muted)' }}
              >
                <Mail size={11} /> Email <span className="opacity-60">(optional)</span>
              </label>
              <input
                id="contact-email"
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="your@email.com"
                type="email"
              />
            </div>

            <div>
              <label
                htmlFor="contact-subject"
                className="text-[11px] font-semibold mb-1.5 uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: 'var(--muted)' }}
              >
                <MessageCircle size={11} /> Subject <span className="opacity-60">(optional)</span>
              </label>
              <input
                id="contact-subject"
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
                value={form.subject}
                onChange={(e) => set('subject', e.target.value)}
                placeholder="Abroad support, movie inquiry, subtitle request..."
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="flex items-center gap-1.5 text-[11px] font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--muted)' }}
              >
                <MessageSquare size={11} /> Message <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                id="contact-message"
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm resize-none"
                rows={4}
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                placeholder="Write your message here..."
              />
              {errors.message && (
                <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>
                  {errors.message}
                </p>
              )}
            </div>

            {errors.submit && (
              <p className="text-xs" style={{ color: 'var(--danger)' }}>
                {errors.submit}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-60"
            >
              <Send size={14} />
              <span>{loading ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
