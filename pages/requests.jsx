import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, getRequests, addRequest } from '../lib/supabase';
import CinematicBackground from '../components/CinematicBackground';
import AdBanner from '../components/ads/AdBanner';
import SearchBar from '../components/SearchBar';
import SEOHead from '../components/SEOHead';
import { useAuth } from '../contexts/AuthContext';
import {
  Star, ChevronUp, Send, Sparkles, CheckCircle2, Smartphone, Heart, Loader2, Phone, Crown,
  ArrowLeft, Inbox, Search, TrendingUp, Clock,
} from 'lucide-react';

export default function Requests({ requests: initial }) {
  const { user, isPro } = useAuth();
  const [requests, setRequests] = useState(initial || []);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ title: '', year: '', language: '', source: '', requested_by: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState({});
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [donateModal, setDonateModal] = useState(null);
  const [donateStep, setDonateStep] = useState('pay');
  const [processing, setProcessing] = useState(false);
  const [donorPhone, setDonorPhone] = useState('');
  const [voteAmount, setVoteAmount] = useState(100);
  const voteBoost = Math.max(1, Math.floor(voteAmount / 50));

  useEffect(() => {
    if (!initial) getRequests().then(setRequests);
  }, []);

  const filtered = requests.filter(r =>
    !query || r.title.toLowerCase().includes(query.toLowerCase())
  );
  const pending = filtered.filter(r => !r.fulfilled);
  const fulfilled = filtered.filter(r => r.fulfilled);

  const handleVote = (req) => {
    if (voted[req.id]) return;
    setDonateModal(req);
    setDonateStep('pay');
    setDonorPhone('');
    setVoteAmount(100);
  };

  const handleProVote = async (req) => {
    if (voted[req.id]) return;
    setProcessing(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/requests/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: req.id, skipPayment: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVoted(prev => ({ ...prev, [req.id]: true }));
      setRequests(prev => prev.map(r => r.id === data.request.id ? data.request : r));
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleDonate = async () => {
    if (!donorPhone.trim()) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: voteAmount,
          request_id: donateModal.id,
          phone: donorPhone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDonateStep('submitted');
      setVoted(prev => ({ ...prev, [donateModal.id]: true }));
      if (data.payment_url) {
        window.location.assign(data.payment_url);
      }
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setProcessing(false);
    }
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
        fulfilled: false,
      });
      setRequests(prev => [r, ...prev]);
      setForm({ title: '', year: '', language: '', source: '', requested_by: '', note: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { setErrors({ submit: err.message }); }
    finally { setLoading(false); }
  };

  const totalVotes = requests.reduce((s, r) => s + (r.votes || 0), 0);

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Movie Requests — Agasobanuye Rocky 2026, Agent Kim & More"
        description="Request agasobanuye movies, series, and anime on Agasobanuye.rw — vote for Rocky 2026, Rocky Kimomo, Sankara 2026, Agent Kim reactivated, Gashya 2026 Netflix, Fey, Junior Giti, Yanga episodes you want added next"
        keywords="agasobanuye request, agasobanuye rocky 2026, agasobanuye by rocky kimomo, agasobanuye sankara 2026, agasobanuye agent kim, agent kim reactivated, agasobanuye gashya 2026 netflix, agasobanuye by fey 2025, agasobanuye by junior giti, agasobanuye by yanga, agahinde agasobanuye na rocky, movie requests Rwanda, Kinyarwanda movies"
        canonical="https://agasobanuye.rw/requests"
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}>
              <Inbox size={20} style={{ color: '#c9a84c' }} />
            </div>
            <div>
              <h1 className="font-cinzel font-bold text-lg" style={{
                fontFamily: 'Cinzel,serif',
                background: 'linear-gradient(135deg,#f5e4a8,#c9a84c)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Movie Requests</h1>
              <p className="text-[10px]" style={{ color: '#6a6a5a' }}>Request and vote for movies to be added</p>
            </div>
          </div>
          <div className="divider-gold w-16" />
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)' }}>
            <Inbox size={11} style={{ color: '#c9a84c' }} />
            <span className="text-[10px]" style={{ color: '#6a6a5a' }}><span style={{ color:'#e8e6f0' }}>{pending.length}</span> pending</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
            <CheckCircle2 size={11} style={{ color: '#22c55e' }} />
            <span className="text-[10px]" style={{ color: '#6a6a5a' }}><span style={{ color:'#e8e6f0' }}>{fulfilled.length}</span> fulfilled</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.12)' }}>
            <TrendingUp size={11} style={{ color: '#f97316' }} />
            <span className="text-[10px]" style={{ color: '#6a6a5a' }}><span style={{ color:'#e8e6f0' }}>{totalVotes}</span> votes</span>
          </div>
        </motion.div>

        {/* Guidance box */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-5 p-4 rounded-xl"
          style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <p className="text-[10px] font-semibold mb-1.5" style={{ color: '#c9a84c' }}>
            Important
          </p>
          <p className="text-[10px] leading-relaxed" style={{ color: '#8a8778' }}>
            Fill all details accurately — exact title, year, language. Incomplete info delays processing.
            <span style={{ color: '#fbbf24' }}> Upvote is 100 RWF via MoMo.</span>
          </p>
        </motion.div>

        {/* Request form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="mb-8 p-5 rounded-2xl"
          style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(201,168,76,0.12)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Star size={14} style={{ color: '#c9a84c' }} />
            <span className="text-[10px] font-semibold uppercase tracking-[2px]" style={{ color: '#c9a84c' }}>Submit a Request</span>
          </div>

          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl text-xs"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}>
                <CheckCircle2 size={14} /> Request submitted! Others can now upvote it.
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color:'#6a6a5a' }}>
                Movie / Series Title <span style={{ color:'#e05c3a' }}>*</span>
              </label>
              <input className={`input-dark w-full px-3 py-2 rounded-lg text-sm ${errors.title ? 'border-red-500/40' : ''}`}
                value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors({}); }}
                placeholder="e.g. KGF Chapter 3" />
              {errors.title && <p className="text-red-400 text-[10px] mt-1">{errors.title}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color:'#6a6a5a' }}>
                  Year <span style={{ color:'#e05c3a' }}>*</span>
                </label>
                <input className={`input-dark w-full px-3 py-2 rounded-lg text-sm ${errors.year ? 'border-red-500/40' : ''}`}
                  value={form.year || ''} onChange={e => { setForm(f => ({ ...f, year: e.target.value })); setErrors({}); }}
                  placeholder="e.g. 2025" />
                {errors.year && <p className="text-red-400 text-[10px] mt-1">{errors.year}</p>}
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color:'#6a6a5a' }}>
                  Language <span style={{ color:'#e05c3a' }}>*</span>
                </label>
                <input className={`input-dark w-full px-3 py-2 rounded-lg text-sm ${errors.language ? 'border-red-500/40' : ''}`}
                  value={form.language || ''} onChange={e => { setForm(f => ({ ...f, language: e.target.value })); setErrors({}); }}
                  placeholder="e.g. Hindi, English" />
                {errors.language && <p className="text-red-400 text-[10px] mt-1">{errors.language}</p>}
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color:'#6a6a5a' }}>
                Where did you hear about Agasobanuye.rw? <span style={{ color:'#e05c3a' }}>*</span>
              </label>
              <select className={`input-dark w-full px-3 py-2 rounded-lg text-sm cursor-pointer ${errors.source ? 'border-red-500/40' : ''}`}
                value={form.source || ''} onChange={e => { setForm(f => ({ ...f, source: e.target.value })); setErrors({}); }}
                style={{ background:'rgba(255,255,255,0.03)' }}>
                <option value="" style={{ background:'#0f0f16' }}>Select...</option>
                <option value="Telegram" style={{ background:'#0f0f16' }}>Telegram</option>
                <option value="WhatsApp" style={{ background:'#0f0f16' }}>WhatsApp</option>
                <option value="Google Search" style={{ background:'#0f0f16' }}>Google Search</option>
                <option value="Instagram" style={{ background:'#0f0f16' }}>Instagram</option>
                <option value="YouTube" style={{ background:'#0f0f16' }}>YouTube</option>
                <option value="Friend" style={{ background:'#0f0f16' }}>Friend</option>
                <option value="Other" style={{ background:'#0f0f16' }}>Other</option>
              </select>
              {errors.source && <p className="text-red-400 text-[10px] mt-1">{errors.source}</p>}
            </div>
            {errors.submit && <p className="text-red-400 text-[10px]">{errors.submit}</p>}
            <motion.button onClick={handleSubmit} disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg,rgba(201,168,76,0.15),rgba(180,140,60,0.08))',
                border: '1px solid rgba(201,168,76,0.3)',
                color: '#c9a84c',
                boxShadow: '0 0 16px rgba(201,168,76,0.06)',
              }}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {loading ? 'Submitting...' : 'Submit Request'}
            </motion.button>
          </div>
        </motion.div>

        {/* Search */}
        <div className="mb-5">
          <SearchBar value={query} onChange={setQuery} onClear={() => setQuery('')} placeholder="Search requests..." />
        </div>

        {/* Pending requests */}
        {pending.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)' }}>
              <Inbox size={28} style={{ color: '#4a4a3a' }} />
            </div>
            <p className="text-sm" style={{ color: '#6a6a5a' }}>
              {query ? `No requests match "${query}"` : 'No pending requests'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 mb-8">
            {pending.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-start gap-4 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Vote button */}
                <motion.button onClick={() => isPro ? handleProVote(r) : handleVote(r)}
                  disabled={voted[r.id] || processing}
                  whileHover={!voted[r.id] && !processing ? { scale: 1.05 } : {}}
                  whileTap={!voted[r.id] && !processing ? { scale: 0.95 } : {}}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all flex-shrink-0"
                  style={voted[r.id]
                    ? { background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', cursor: 'default' }
                    : isPro
                      ? { background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }
                  }>
                  {isPro ? (
                    <Crown size={14} style={{ color: voted[r.id] ? '#c9a84c' : '#fbbf24' }} />
                  ) : (
                    <ChevronUp size={16} className={voted[r.id] ? 'text-[#c9a84c]' : 'text-[#6a6a5a]'} />
                  )}
                  <span className={`text-sm font-bold font-cinzel ${voted[r.id] ? 'text-[#c9a84c]' : isPro ? 'text-[#fbbf24]' : 'text-[#e8e6f0]'}`}
                    style={{ fontFamily: 'Cinzel,serif' }}>
                    {r.votes}
                  </span>
                  <span className="text-[8px]" style={{ color: voted[r.id] ? '#c9a84c' : isPro ? '#fbbf24' : '#4a4a3a' }}>
                    {isPro ? 'Pro' : '100 RWF'}
                  </span>
                </motion.button>

                <div className="flex-1 min-w-0 pt-1">
                  <div className="text-sm font-medium mb-0.5" style={{ color: '#e8e6f0' }}>{r.title}</div>
                  <div className="flex items-center gap-2 text-[10px]" style={{ color: '#4a4a3a' }}>
                    <span>by {r.requested_by || 'Anonymous'}</span>
                    {r.year && <><span>·</span><span>{r.year}</span></>}
                    {r.language && <><span>·</span><span>{r.language}</span></>}
                  </div>
                  {r.note && <div className="text-[11px] mt-1.5 leading-relaxed" style={{ color: '#8a8778' }}>{r.note}</div>}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Donate Modal */}
        <AnimatePresence>
          {donateModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
              onClick={() => setDonateModal(null)}>
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl overflow-hidden"
                style={{ background: 'rgba(12,12,24,0.95)', border: '1px solid rgba(201,168,76,0.2)' }}>
                {donateStep === 'pay' && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Smartphone size={18} style={{ color: '#fbbf24' }} />
                        <h3 className="font-cinzel text-lg font-semibold" style={{ fontFamily: 'Cinzel,serif', color: '#fbbf24' }}>
                          Boost Vote
                        </h3>
                      </div>
                      <button onClick={() => setDonateModal(null)} className="text-[#4a4a3a] hover:text-white text-lg">✕</button>
                    </div>

                    <p className="text-sm mb-4" style={{ color: '#e8e6f0' }}>{donateModal.title}</p>

                    <div className="p-4 rounded-xl mb-4 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-[10px] mb-2" style={{ color: '#6a6a5a' }}>Choose amount</p>
                      <div className="flex gap-2 justify-center mb-3">
                        {[50, 100, 200, 500].map(a => (
                          <motion.button key={a} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setVoteAmount(a)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={voteAmount === a
                              ? { background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24' }
                              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4a4a3a' }
                            }>{a} RWF</motion.button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <input type="number" value={voteAmount} onChange={e => setVoteAmount(Math.max(50, parseInt(e.target.value) || 50))}
                          min="100" step="50"
                          className="w-24 text-center px-2 py-1.5 rounded-lg text-sm font-bold outline-none"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24', fontFamily: 'Cinzel,serif' }} />
                        <span className="text-xs" style={{ color: '#4a4a3a' }}>RWF</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-3 py-2 rounded-lg mb-4"
                      style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)' }}>
                      <span className="text-xs" style={{ color: '#4a4a3a' }}>Vote boost</span>
                      <span className="text-sm font-bold" style={{ color: '#22c55e' }}>+{voteBoost} vote{voteBoost > 1 ? 's' : ''}</span>
                    </div>

                    <div className="mb-4">
                      <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: '#6a6a5a' }}>
                        Your MTN Phone Number
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Phone size={13} style={{ color: '#4a4a3a' }} />
                        <input type="tel" value={donorPhone} onChange={e => setDonorPhone(e.target.value)}
                          placeholder="078XXXXXXX"
                          className="flex-1 bg-transparent text-sm outline-none" style={{ color: '#e8e6f0' }} />
                      </div>
                      <p className="text-[9px] mt-1" style={{ color: '#3a3a2a' }}>Admin uses this to verify your payment.</p>
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleDonate} disabled={processing || !donorPhone.trim()}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                      style={{
                        background: !donorPhone.trim() ? 'rgba(255,255,255,0.05)' : 'rgba(251,191,36,0.12)',
                        border: `1px solid ${!donorPhone.trim() ? 'rgba(255,255,255,0.08)' : 'rgba(251,191,36,0.3)'}`,
                        color: !donorPhone.trim() ? '#3a3a2a' : '#fbbf24',
                      }}>
                      {processing ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
                      {processing ? 'Submitting...' : `Send ${voteAmount} RWF — +${voteBoost} vote${voteBoost > 1 ? 's' : ''}`}
                    </motion.button>
                  </div>
                )}

                {donateStep === 'submitted' && (
                  <div className="p-6 text-center">
                    <CheckCircle2 size={48} style={{ color: '#22c55e', margin: '0 auto 12px' }} />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#22c55e' }}>Payment Started!</h3>
                    <p className="text-sm mb-4" style={{ color: '#e8e6f0' }}>
                      Complete your <strong>{voteAmount} RWF</strong> payment in the RwandaPay prompt on your phone.
                    </p>
                    <div className="p-3 rounded-xl mb-4 text-xs" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                      <p style={{ color: '#6a6a5a' }}>Your number <strong style={{ color: '#fbbf24' }}>{donorPhone}</strong></p>
                    </div>
                    <p className="text-[10px] mb-5" style={{ color: '#4a4a3a' }}>Votes appear automatically once RwandaPay confirms the payment.</p>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => { setDonateModal(null); getRequests().then(d => setRequests(d)); }}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c' }}>
                      Done
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <AdBanner size="728x90" className="flex-1" />
          <AdBanner size="300x250" className="sm:w-[300px]" />
        </div>

        {/* Fulfilled section */}
        {fulfilled.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 size={13} style={{ color: '#22c55e' }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#22c55e' }}>Already Added</span>
              <div className="flex-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
            </div>
            <div className="space-y-2">
              {fulfilled.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(14,14,22,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <CheckCircle2 size={13} style={{ color: '#22c55e', flexShrink: 0 }} />
                  <span className="text-sm" style={{ color: '#e8e6f0' }}>{r.title}</span>
                  <span className="text-[9px] ml-auto px-2 py-0.5 rounded font-medium"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}>
                    Added ✓
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const requests = await getRequests();
    return { props: { requests } };
  } catch {
    return { props: { requests: [] } };
  }
}
