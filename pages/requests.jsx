import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRequests, addRequest, voteRequest } from '../lib/supabase';
import CinematicBackground from '../components/CinematicBackground';
import SearchBar from '../components/SearchBar';
import { Star, ChevronUp, Send, Sparkles, CheckCircle2, Heart, Copy, Check, Smartphone } from 'lucide-react';

const USSD_CODE = '*182*8*1*156833#';
const DONATION_AMOUNTS = [100, 500, 1000, 2000];

export default function Requests({ requests: initial }) {
  const [requests, setRequests] = useState(initial || []);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ title: '', year: '', language: '', source: '' });
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState({});
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [donateModal, setDonateModal] = useState(null);
  const [donateAmount, setDonateAmount] = useState(1000);
  const [copiedUssd, setCopiedUssd] = useState(false);
  const [donateStep, setDonateStep] = useState('select');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!initial) getRequests().then(setRequests);
  }, []);

  const filtered = requests.filter(r =>
    !query || r.title.toLowerCase().includes(query.toLowerCase())
  );
  const pending = filtered.filter(r => !r.fulfilled);
  const fulfilled = filtered.filter(r => r.fulfilled);

  const handleVote = async (req) => {
    if (voted[req.id]) return;
    setVoted(v => ({ ...v, [req.id]: true }));
    try {
      const updated = await voteRequest(req.id, req.votes);
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
    } catch { setVoted(v => ({ ...v, [req.id]: false })); }
  };

  const handleDonate = () => {
    setProcessing(true);
    try {
      setDonateStep('success');
    } finally {
      setProcessing(false);
    }
  };

  const openDonate = (req) => {
    setDonateModal(req);
    setDonateAmount(1000);
    setDonateStep('select');
    setCopiedUssd(false);
  };

  const copyUssd = () => {
    navigator.clipboard?.writeText(USSD_CODE);
    setCopiedUssd(true);
    setTimeout(() => setCopiedUssd(false), 2000);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.year?.trim()) errs.year = 'Year is required';
    if (!form.language?.trim()) errs.language = 'Language is required';
    if (!form.source?.trim()) errs.source = 'Please select an option';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const r = await addRequest({
        title: form.title,
        year: form.year,
        language: form.language,
        source: form.source,
        votes: 0,
        fulfilled: false
      });
      setRequests(prev => [r, ...prev]);
      setForm({ title: '', year: '', language: '', source: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { setErrors({ submit: err.message }); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-grid">
      <CinematicBackground />
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles size={14} className="text-[#ff0080]" />
            <span className="section-label">Community</span>
            <Sparkles size={14} className="text-[#c9a84c]" />
          </div>
          <h1 className="font-cinzel font-black text-3xl sm:text-4xl tracking-[4px] mb-3"
            style={{ fontFamily: 'Orbitron, monospace' }}>
            <span className="text-gold">MOVIE</span>{' '}
            <span className="text-gold-glow">REQUESTS</span>
          </h1>
          <div className="hero-line w-32 mx-auto mb-4" />
          <p className="text-[#6b6b8a] text-sm leading-relaxed max-w-md mx-auto">
            Can&apos;t find your favourite movie? Request it and let others upvote it to get it added faster.
          </p>
        </motion.div>

        {/* Guidance box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-5 p-4 rounded-xl"
          style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}
        >
          <p className="text-[11px] font-semibold mb-2" style={{ color: '#c9a84c' }}>
            📌 Important:
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: '#a6a5a' }}>
            Please fill all details carefully and accurately. Enter the exact Movie/Series
            title, release year, and language. Incomplete, incorrect, or random
            information can make it difficult to find and process your request. The more
            accurate the details, the faster your request can be fulfilled.
            <span style={{ color: '#FFCC00' }}> You can also donate MB to prioritize your request!</span> Thank you! 😊
          </p>
        </motion.div>

        {/* Request form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 p-6 rounded-2xl"
          style={{ background: 'rgba(13,13,26,0.8)', border: '1px solid rgba(201,168,76,0.12)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Star size={15} className="text-[#c9a84c]" />
            <span className="text-[11px] uppercase tracking-[3px] text-[#c9a84c]">Submit a Request</span>
          </div>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl text-sm text-[#c9a84c]"
                style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}
              >
                <CheckCircle2 size={16} /> Request submitted! Others can now upvote it.
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] text-[#6b6b8a] uppercase tracking-widest mb-1.5">
                Movie / Series Title <span style={{ color: '#e05c3a' }}>*</span>
              </label>
              <input
                className={`input-dark w-full px-3 py-2.5 rounded-lg text-sm ${errors.title ? 'border-red-500/50' : ''}`}
                value={form.title}
                onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors({}); }}
                placeholder="e.g. KGF Chapter 3"
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={{ color: '#6a6a5a' }}>
                Year <span style={{ color: '#e05c3a' }}>*</span>
              </label>
              <input
                className={`input-dark w-full px-3 py-2.5 rounded-lg text-sm ${errors.year ? 'border-red-500/50' : ''}`}
                value={form.year || ''}
                onChange={e => { setForm(f => ({ ...f, year: e.target.value })); setErrors({}); }}
                placeholder="e.g. 2025"
              />
              {errors.year && <p className="text-red-400 text-xs mt-1">{errors.year}</p>}
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={{ color: '#6a6a5a' }}>
                Language <span style={{ color: '#e05c3a' }}>*</span>
              </label>
              <input
                className={`input-dark w-full px-3 py-2.5 rounded-lg text-sm ${errors.language ? 'border-red-500/50' : ''}`}
                value={form.language || ''}
                onChange={e => { setForm(f => ({ ...f, language: e.target.value })); setErrors({}); }}
                placeholder="e.g. Hindi, English, Tamil..."
              />
              {errors.language && <p className="text-red-400 text-xs mt-1">{errors.language}</p>}
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={{ color: '#6a6a5a' }}>
                Where did you hear about FlixBase? <span style={{ color: '#e05c3a' }}>*</span>
              </label>
              <select
                className={`input-dark w-full px-3 py-2.5 rounded-lg text-sm cursor-pointer ${errors.source ? 'border-red-500/50' : ''}`}
                value={form.source || ''}
                onChange={e => { setForm(f => ({ ...f, source: e.target.value })); setErrors({}); }}
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <option value="" style={{ background: '#0f0f16' }}>Select an option...</option>
                <option value="Telegram" style={{ background: '#0f0f16' }}>Telegram</option>
                <option value="WhatsApp" style={{ background: '#0f0f16' }}>WhatsApp</option>
                <option value="Google Search" style={{ background: '#0f0f16' }}>Google Search</option>
                <option value="Instagram" style={{ background: '#0f0f16' }}>Instagram</option>
                <option value="YouTube" style={{ background: '#0f0f16' }}>YouTube</option>
                <option value="Friend" style={{ background: '#0f0f16' }}>Friend / Word of mouth</option>
                <option value="Other" style={{ background: '#0f0f16' }}>Other</option>
              </select>
              {errors.source && <p className="text-red-400 text-xs mt-1">{errors.source}</p>}
            </div>
            {errors.submit && <p className="text-red-400 text-xs">{errors.submit}</p>}
            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold"
              data-hover
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <Send size={15} />
                </motion.div>
              ) : <Send size={15} />}
              {loading ? 'Submitting...' : 'Submit Request'}
            </motion.button>
          </div>
        </motion.div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar value={query} onChange={setQuery} onClear={() => setQuery('')} placeholder="Search requests..." />
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-6 text-sm">
          <span className="text-[#6b6b8a]"><span className="text-[#e8e6f0] font-medium">{pending.length}</span> pending</span>
          <span className="text-[#6b6b8a]"><span className="text-[#c9a84c] font-medium">{fulfilled.length}</span> fulfilled</span>
        </div>

        {/* Pending requests */}
        {pending.length === 0 ? (
          <div className="text-center py-8 text-[#6b6b8a] text-sm">
            {query ? `No requests match "${query}"` : 'No pending requests.'}
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {pending.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4 p-4 rounded-xl group transition-colors"
                style={{ background: 'rgba(13,13,26,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}
                whileHover={{ borderColor: 'rgba(201,168,76,0.15)' }}
              >
                {/* Vote button */}
                <motion.button
                  onClick={() => handleVote(r)}
                  disabled={voted[r.id]}
                  whileHover={!voted[r.id] ? { scale: 1.05 } : {}}
                  whileTap={!voted[r.id] ? { scale: 0.95 } : {}}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all flex-shrink-0"
                  style={voted[r.id]
                    ? { background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', cursor: 'default' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }
                  }
                  data-hover
                >
                  <ChevronUp size={16} className={voted[r.id] ? 'text-[#c9a84c]' : 'text-[#6b6b8a]'} />
                  <span className={`text-sm font-bold font-cinzel ${voted[r.id] ? 'text-[#c9a84c]' : 'text-[#e8e6f0]'}`}
                    style={{ fontFamily: 'Orbitron, monospace' }}>
                    {r.votes}
                  </span>
                </motion.button>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#e8e6f0] text-sm mb-0.5">{r.title}</div>
                  {r.note && <div className="text-[#8888a0] text-xs mt-1.5 leading-relaxed">{r.note}</div>}
                </div>

                {/* Donate button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openDonate(r)}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl flex-shrink-0"
                  style={{
                    background: 'rgba(255,204,0,0.08)',
                    border: '1px solid rgba(255,204,0,0.25)',
                    cursor: 'pointer'
                  }}
                >
                  <Heart size={14} style={{ color: '#FFCC00' }} fill="#FFCC00" />
                  <span className="text-[10px] font-medium" style={{ color: '#FFCC00' }}>
                    Donate MB
                  </span>
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Fulfilled section */}
        {fulfilled.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 size={15} className="text-[#c9a84c]" />
              <span className="text-[11px] uppercase tracking-[3px] text-[#6b6b8a]">Already Added</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
            <div className="space-y-2">
              {fulfilled.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(13,13,26,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <CheckCircle2 size={14} className="text-[#c9a84c] flex-shrink-0" />
                  <span className="text-[#e8e6f0] text-sm">{r.title}</span>
                  <span className="text-[10px] ml-auto"
                    style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c', padding: '2px 8px', borderRadius: 4 }}>
                    Added ✓
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ══ DONATE MODAL ══ */}
        <AnimatePresence>
          {donateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
              onClick={() => setDonateModal(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl overflow-hidden"
                style={{ background: 'rgba(13,13,26,0.95)', border: '1px solid rgba(201,168,76,0.2)' }}
              >
                {donateStep === 'select' && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <Heart size={18} style={{ color: '#c9a84c' }} fill="#c9a84c" />
                        <h3 className="font-semibold text-lg" style={{ fontFamily: 'Cinzel,serif', color: '#e8c87a' }}>
                          Support This Request
                        </h3>
                      </div>
                      <button onClick={() => setDonateModal(null)} className="text-[#6b6b8a] hover:text-white text-lg">✕</button>
                    </div>

                    <p className="text-sm mb-1" style={{ color: '#e8e6f0' }}>{donateModal.title}</p>
                    <p className="text-xs mb-5" style={{ color: '#6b6b8a' }}>
                      The more MB donated, the faster this movie gets uploaded
                    </p>

                    {/* Amount Selection */}
                    <div className="mb-5">
                      <label className="block text-[11px] uppercase tracking-widest mb-2" style={{ color: '#6b6b8a' }}>
                        Select Amount (RWF)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {DONATION_AMOUNTS.map(amount => (
                          <motion.button
                            key={amount}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setDonateAmount(amount)}
                            className="py-3 rounded-xl text-sm font-semibold transition-all"
                            style={{
                              background: donateAmount === amount ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${donateAmount === amount ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
                              color: donateAmount === amount ? '#e8c87a' : '#6b6b8a'
                            }}
                          >
                            {amount.toLocaleString()} RWF
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDonateStep('pay')}
                      className="w-full py-3 rounded-xl text-sm font-semibold"
                      style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', color: '#e8c87a' }}
                    >
                      Continue to Payment →
                    </motion.button>
                  </div>
                )}

                {donateStep === 'pay' && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <Smartphone size={18} style={{ color: '#FFCC00' }} />
                        <h3 className="font-semibold text-lg" style={{ fontFamily: 'Cinzel,serif', color: '#FFCC00' }}>
                          Momo Pay
                        </h3>
                      </div>
                      <button onClick={() => setDonateModal(null)} className="text-[#6b6b8a] hover:text-white text-lg">✕</button>
                    </div>

                    <p className="text-sm mb-4" style={{ color: '#e8e6f0' }}>
                      Donate <span style={{ color: '#FFCC00', fontWeight: 700 }}>{donateAmount.toLocaleString()} RWF</span> worth of MB to support:
                    </p>
                    <p className="text-sm mb-5 font-medium" style={{ color: '#c9a84c' }}>{donateModal.title}</p>

                    {/* USSD Code */}
                    <div className="p-4 rounded-xl mb-4 text-center" style={{ background: 'rgba(255,204,0,0.06)', border: '1px solid rgba(255,204,0,0.2)' }}>
                      <p className="text-xs mb-2" style={{ color: '#8a8060' }}>Step 1: Dial this USSD code</p>
                      <p className="text-xl font-bold tracking-wider mb-3" style={{ color: '#FFCC00', fontFamily: 'monospace' }}>
                        {USSD_CODE}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={copyUssd}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium mx-auto"
                        style={{
                          background: copiedUssd ? 'rgba(34,197,94,0.15)' : 'rgba(255,204,0,0.1)',
                          border: `1px solid ${copiedUssd ? 'rgba(34,197,94,0.4)' : 'rgba(255,204,0,0.3)'}`,
                          color: copiedUssd ? '#22c55e' : '#FFCC00'
                        }}
                      >
                        {copiedUssd ? <Check size={14} /> : <Copy size={14} />}
                        {copiedUssd ? 'Copied!' : 'Copy Code'}
                      </motion.button>
                    </div>

                    {/* Instructions */}
                    <div className="p-4 rounded-xl mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-xs mb-2 font-semibold" style={{ color: '#c9a84c' }}>Step 2: Follow the prompts</p>
                      <ol className="text-xs space-y-1.5" style={{ color: '#8a8778' }}>
                        <li>1. Enter your Momo PIN</li>
                        <li>2. Confirm the amount: <span style={{ color: '#FFCC00' }}>{donateAmount.toLocaleString()} RWF</span></li>
                        <li>3. Complete the payment</li>
                      </ol>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDonate}
                      disabled={processing}
                      className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                      style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e' }}
                    >
                      {processing ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                          <Heart size={16} />
                        </motion.div>
                      ) : <Check size={16} />}
                      {processing ? 'Processing...' : "I've Completed Payment"}
                    </motion.button>

                    <p className="text-center text-[10px] mt-3" style={{ color: '#4a4a3a' }}>
                      Your support helps us upload this movie sooner! 🙏
                    </p>
                  </div>
                )}

                {donateStep === 'success' && (
                  <div className="p-6 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
                    >
                      <CheckCircle2 size={32} style={{ color: '#22c55e' }} />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#22c55e' }}>Thank You!</h3>
                    <p className="text-sm mb-1" style={{ color: '#e8e6f0' }}>
                      Your donation of <span style={{ color: '#c9a84c', fontWeight: 700 }}>{donateAmount.toLocaleString()} RWF</span> has been recorded.
                    </p>
                    <p className="text-xs mb-5" style={{ color: '#6b6b8a' }}>
                      {donateModal.title} is now closer to being uploaded!
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDonateModal(null)}
                      className="px-6 py-2.5 rounded-xl text-sm font-medium"
                      style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c' }}
                    >
                      Done
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const requests = await getRequests();
    return { props: { requests }, revalidate: 30 };
  } catch {
    return { props: { requests: [] }, revalidate: 30 };
  }
}
