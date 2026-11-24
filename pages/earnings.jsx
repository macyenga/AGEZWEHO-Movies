import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import {
  UPLOADER_MONETIZATION_CONFIG,
  estimateMonthlyUploaderEarnings,
} from '../lib/uploader-earnings';
import {
  Wallet,
  HeartHandshake,
  Eye,
  Gamepad2,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  LogIn,
  Smartphone,
  Clock,
  Film,
  Calculator,
} from 'lucide-react';

const GOLD = '#c9a84c';
const GOLD_LIGHT = '#e8c87a';

const STATUS_COLORS = {
  approved: { bg: 'rgba(34,197,94,0.12)', text: '#4ade80' },
  paid: { bg: 'rgba(34,197,94,0.12)', text: '#4ade80' },
  pending: { bg: 'rgba(234,179,8,0.12)', text: '#fbbf24' },
  rejected: { bg: 'rgba(239,68,68,0.12)', text: '#f87171' },
};

export default function UploaderEarningsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [walletData, setWalletData] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [walletError, setWalletError] = useState('');

  // Earnings simulator inputs
  const [simViews, setSimViews] = useState(25000);
  const [simTips, setSimTips] = useState(12000);
  const [simGameSales, setSimGameSales] = useState(10000);

  // Payout withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [payoutNote, setPayoutNote] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [payoutFeedback, setPayoutFeedback] = useState({ type: '', message: '' });
  const hasPrefilledRef = useRef(false);

  const estimate = estimateMonthlyUploaderEarnings({
    monthlyViews: simViews,
    viewerTipsRwf: simTips,
    gameUnlockRevenueRwf: simGameSales,
  });

  const loadWallet = useCallback(async () => {
    if (!user?.id) {
      setWalletData(null);
      hasPrefilledRef.current = false;
      return;
    }

    setLoadingWallet(true);
    setWalletError('');
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        setWalletError('Session expired. Please sign in again.');
        return;
      }

      const res = await fetch('/api/uploader/earnings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load creator earnings');
      }
      setWalletData(data);

      if (!hasPrefilledRef.current) {
        hasPrefilledRef.current = true;
        const firstMomo =
          data.summary?.movieBreakdown?.find((m) => m.momoNumber)?.momoNumber ||
          data.summary?.gameBreakdown?.find((g) => g.momoNumber)?.momoNumber ||
          '';
        if (firstMomo) {
          setMomoNumber((prev) => prev || firstMomo);
        }
        if (data.summary?.availableBalance >= UPLOADER_MONETIZATION_CONFIG.minPayoutRwf) {
          setWithdrawAmount((prev) => prev || String(data.summary.availableBalance));
        }
      }
    } catch (err) {
      setWalletError(err.message || 'Unable to load creator earnings.');
    } finally {
      setLoadingWallet(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) {
      loadWallet();
    }
  }, [authLoading, loadWallet]);

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    setPayoutFeedback({ type: '', message: '' });
    setSubmittingPayout(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        setPayoutFeedback({ type: 'error', message: 'Please sign in again to request a payout.' });
        return;
      }

      const res = await fetch('/api/uploader/earnings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(withdrawAmount),
          momoNumber,
          notes: payoutNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPayoutFeedback({ type: 'error', message: data.error || 'Could not submit payout request.' });
        return;
      }

      setWalletData({
        summary: data.summary,
        payouts: data.payouts,
        rules: data.rules,
      });
      setWithdrawAmount(
        data.summary?.availableBalance >= UPLOADER_MONETIZATION_CONFIG.minPayoutRwf
          ? String(data.summary.availableBalance)
          : ''
      );
      setPayoutNote('');
      setPayoutFeedback({
        type: 'success',
        message: `Payout request for ${Number(data.payout?.amount || 0).toLocaleString()} RWF queued for ${data.payout?.uploader_phone}.`,
      });
    } catch {
      setPayoutFeedback({ type: 'error', message: 'Network error submitting payout request.' });
    } finally {
      setSubmittingPayout(false);
    }
  };

  const summary = walletData?.summary;

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Creator & Uploader Earnings"
        description="How Agasobanuye.rw uploaders earn money from movies, series, and games via MTN MoMo and Airtel Money."
        canonical="https://agasobanuye.rw/earnings"
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-24">
        {/* Editorial Hero Header */}
        <header className="mb-10 pb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="section-tag mb-2.5 flex items-center gap-2">
            <Wallet size={12} style={{ color: GOLD }} />
            <span>{t.nav.creatorProgram}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1
                className="font-cinzel font-bold leading-tight mb-3"
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: 'clamp(1.75rem, 3.6vw, 2.85rem)',
                  color: '#f5f2e8',
                }}
              >
                Earn From Every Upload on Agasobanuye.rw
              </h1>
              <p className="text-sm leading-relaxed max-w-2xl" style={{ color: '#a8a496' }}>
                Upload working Agasobanuye movies, series, or modded games with your MTN MoMo or Airtel Money number. Every verified view, viewer tip, and paid game unlock builds your creator wallet automatically.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-transform hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)`,
                  color: '#09080b',
                }}
              >
                <Upload size={14} />
                <span>Upload Movie / Series</span>
              </Link>
              <Link
                href="/submit-game"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors hover:bg-white/10"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: '#e8e4d8',
                }}
              >
                <Gamepad2 size={14} />
                <span>Upload Game / App</span>
              </Link>
            </div>
          </div>
        </header>

        {/* 3 Revenue Streams (Numbered Editorial Rules) */}
        <section aria-label="Uploader revenue streams" className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(16,16,24,0.88)',
                border: '1px solid rgba(201,168,76,0.2)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold tracking-widest uppercase tabular-nums" style={{ color: GOLD }}>
                  01 · Viewer Tips
                </span>
                <HeartHandshake size={18} style={{ color: GOLD }} />
              </div>
              <div className="text-2xl font-bold mb-1.5 tabular-nums" style={{ color: '#f5f2e8' }}>
                50% Share
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#9c988b' }}>
                Every movie page features a &ldquo;Gurira MB&rdquo; button. When fans send MoMo Pay 156833 or Paypack support on your title, 50% goes directly to your balance.
              </p>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(16,16,24,0.88)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold tracking-widest uppercase tabular-nums" style={{ color: '#38bdf8' }}>
                  02 · View Milestones
                </span>
                <Eye size={18} style={{ color: '#38bdf8' }} />
              </div>
              <div className="text-2xl font-bold mb-1.5 tabular-nums" style={{ color: '#f5f2e8' }}>
                250 RWF / 1K Views
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#9c988b' }}>
                Approved movies and series earn a 250 RWF view bonus for every 1,000 verified views automatically as your audience grows.
              </p>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(16,16,24,0.88)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold tracking-widest uppercase tabular-nums" style={{ color: '#4ade80' }}>
                  03 · Premium Games &amp; Apps
                </span>
                <Gamepad2 size={18} style={{ color: '#4ade80' }} />
              </div>
              <div className="text-2xl font-bold mb-1.5 tabular-nums" style={{ color: '#f5f2e8' }}>
                70% Share
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#9c988b' }}>
                Set your unlock price (50+ RWF) on mods and games. Download links unlock only after verified payment, and you keep 70% of every unlock.
              </p>
            </div>
          </div>
        </section>

        {/* Creator Wallet + Interactive Estimator Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Creator Wallet & Withdrawal */}
          <div className="lg:col-span-7 space-y-6">
            <section
              data-testid="creator-wallet-section"
              className="rounded-2xl p-6 sm:p-7"
              style={{
                background: 'rgba(15,15,23,0.92)',
                border: '1px solid rgba(201,168,76,0.2)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="font-cinzel text-lg font-semibold" style={{ fontFamily: 'Cinzel, serif', color: '#f5f2e8' }}>
                    Your Creator Wallet
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: '#8a8679' }}>
                    Minimum withdrawal: {UPLOADER_MONETIZATION_CONFIG.minPayoutRwf.toLocaleString()} RWF · {UPLOADER_MONETIZATION_CONFIG.payoutSchedule}
                  </p>
                </div>
                {user && (
                  <span className="text-xs font-medium" style={{ color: '#b8b4a8' }}>
                    {user.email}
                  </span>
                )}
              </div>

              {!user ? (
                <div
                  data-testid="creator-wallet-guest"
                  className="rounded-xl p-6 text-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Wallet size={28} className="mx-auto mb-3" style={{ color: GOLD }} />
                  <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#f5f2e8' }}>
                    Sign in to track your uploads and withdraw via MoMo
                  </h3>
                  <p className="text-xs mb-5 max-w-md mx-auto" style={{ color: '#9c988b' }}>
                    Sign in before uploading movies or games so every title links to your creator account and earnings balance automatically.
                  </p>
                  <Link
                    href="/auth/login?redirect=/earnings"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)`,
                      color: '#09080b',
                    }}
                  >
                    <LogIn size={14} />
                    <span>Sign In to View Wallet</span>
                  </Link>
                </div>
              ) : loadingWallet && !summary ? (
                <div className="py-10 text-center text-xs" style={{ color: '#8a8679' }}>
                  Loading your creator earnings...
                </div>
              ) : walletError ? (
                <div
                  className="p-4 rounded-xl text-xs flex items-center gap-2"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.28)', color: '#fca5a5' }}
                >
                  <AlertCircle size={15} />
                  <span>{walletError}</span>
                </div>
              ) : summary ? (
                <div className="space-y-6">
                  {/* Balance KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
                    <div className="p-3.5 rounded-xl" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)' }}>
                      <div className="text-[11px] mb-1" style={{ color: '#c8b683' }}>Available</div>
                      <div className="text-lg font-bold" data-testid="wallet-available-balance" style={{ color: GOLD_LIGHT }}>
                        {summary.availableBalance.toLocaleString()} RWF
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="text-[11px] mb-1" style={{ color: '#8a8679' }}>Gross Earned</div>
                      <div className="text-lg font-bold" data-testid="wallet-gross-earned" style={{ color: '#f5f2e8' }}>
                        {summary.grossEarned.toLocaleString()} RWF
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="text-[11px] mb-1" style={{ color: '#8a8679' }}>Pending</div>
                      <div className="text-lg font-bold" style={{ color: '#fbbf24' }}>
                        {summary.pendingPayouts.toLocaleString()} RWF
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="text-[11px] mb-1" style={{ color: '#8a8679' }}>Paid Out</div>
                      <div className="text-lg font-bold" style={{ color: '#4ade80' }}>
                        {summary.paidOut.toLocaleString()} RWF
                      </div>
                    </div>
                  </div>

                  {/* Payout Request Form */}
                  <form
                    onSubmit={handleRequestPayout}
                    data-testid="payout-request-form"
                    className="p-4 sm:p-5 rounded-xl space-y-3"
                    style={{ background: 'rgba(8,8,14,0.8)', border: '1px solid rgba(255,255,255,0.09)' }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold flex items-center gap-2" style={{ color: '#f5f2e8' }}>
                        <Smartphone size={14} style={{ color: '#4ade80' }} />
                        Request MTN MoMo / Airtel Payout
                      </span>
                      <span className="text-[11px] tabular-nums" style={{ color: '#8a8679' }}>
                        Min {summary.minPayoutRwf.toLocaleString()} RWF
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="payout-momo-input" className="block text-[11px] mb-1" style={{ color: '#9c988b' }}>
                          Your MoMo Number
                        </label>
                        <input
                          id="payout-momo-input"
                          type="tel"
                          value={momoNumber}
                          onChange={(e) => setMomoNumber(e.target.value)}
                          placeholder="0788123456"
                          data-testid="payout-momo-input"
                          className="input-dark w-full px-3 py-2.5 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="payout-amount-input" className="block text-[11px] mb-1" style={{ color: '#9c988b' }}>
                          Amount (RWF)
                        </label>
                        <input
                          id="payout-amount-input"
                          type="number"
                          min={summary.minPayoutRwf}
                          max={summary.availableBalance || undefined}
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder={String(summary.minPayoutRwf)}
                          data-testid="payout-amount-input"
                          className="input-dark w-full px-3 py-2.5 rounded-lg text-sm tabular-nums"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="payout-note-input" className="block text-[11px] mb-1" style={{ color: '#9c988b' }}>
                        Registered MoMo Account Name (Optional)
                      </label>
                      <input
                        id="payout-note-input"
                        type="text"
                        value={payoutNote}
                        onChange={(e) => setPayoutNote(e.target.value)}
                        placeholder="e.g. Jean Claude M."
                        className="input-dark w-full px-3 py-2 rounded-lg text-xs"
                      />
                    </div>

                    {payoutFeedback.message && (
                      <div
                        data-testid="payout-feedback"
                        role="status"
                        className="p-3 rounded-lg text-xs flex items-center gap-2"
                        style={
                          payoutFeedback.type === 'success'
                            ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#86efac' }
                            : { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#fca5a5' }
                        }
                      >
                        {payoutFeedback.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        <span>{payoutFeedback.message}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submittingPayout || !summary.canWithdraw}
                      data-testid="payout-submit-btn"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)`,
                        color: '#09080b',
                      }}
                    >
                      <span>{submittingPayout ? 'Submitting Request...' : 'Withdraw to Mobile Money'}</span>
                      <ArrowRight size={14} />
                    </button>
                  </form>

                  {/* Uploaded Titles & Breakdown */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#b8b4a8' }}>
                      Uploaded Titles Earnings ({summary.movieBreakdown.length + summary.gameBreakdown.length})
                    </h3>
                    {summary.movieBreakdown.length === 0 && summary.gameBreakdown.length === 0 ? (
                      <p className="text-xs py-4" style={{ color: '#8a8679' }}>
                        No uploads linked to this account yet. Use Upload Movie or Upload Game while signed in to start earning.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {summary.movieBreakdown.map((m) => {
                          const tone = STATUS_COLORS[m.status] || STATUS_COLORS.pending;
                          return (
                            <div
                              key={`m-${m.id}`}
                              className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl"
                              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <Film size={13} style={{ color: GOLD }} />
                                  <Link href={`/movies/${m.id}`} className="text-sm font-medium truncate hover:text-amber-300" style={{ color: '#f5f2e8' }}>
                                    {m.title}
                                  </Link>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-medium capitalize" style={{ background: tone.bg, color: tone.text }}>
                                    {m.status}
                                  </span>
                                </div>
                                <div className="text-[11px] mt-1 tabular-nums" style={{ color: '#8a8679' }}>
                                  {m.views.toLocaleString()} views · Tips: {m.tipEarnings.toLocaleString()} RWF · View Bonus: {m.viewBonus.toLocaleString()} RWF
                                </div>
                              </div>
                              <div className="text-sm font-bold tabular-nums shrink-0" style={{ color: '#4ade80' }}>
                                {m.totalEarnings.toLocaleString()} RWF
                              </div>
                            </div>
                          );
                        })}

                        {summary.gameBreakdown.map((g) => {
                          const tone = STATUS_COLORS[g.status] || STATUS_COLORS.pending;
                          return (
                            <div
                              key={`g-${g.id}`}
                              className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl"
                              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <Gamepad2 size={13} style={{ color: '#4ade80' }} />
                                  <Link href={`/games/${g.id}`} className="text-sm font-medium truncate hover:text-amber-300" style={{ color: '#f5f2e8' }}>
                                    {g.title}
                                  </Link>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-medium capitalize" style={{ background: tone.bg, color: tone.text }}>
                                    {g.status}
                                  </span>
                                </div>
                                <div className="text-[11px] mt-1 tabular-nums" style={{ color: '#8a8679' }}>
                                  Unlock price: {g.price.toLocaleString()} RWF · 70% creator share
                                </div>
                              </div>
                              <div className="text-sm font-bold tabular-nums shrink-0" style={{ color: '#4ade80' }}>
                                {g.totalEarnings.toLocaleString()} RWF
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Recent Payout History */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#b8b4a8' }}>
                      Payout History ({walletData?.payouts?.length || 0})
                    </h3>
                    {!walletData?.payouts?.length ? (
                      <p className="text-xs" style={{ color: '#8a8679' }}>No payout requests submitted yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {walletData.payouts.map((p) => {
                          const tone = STATUS_COLORS[p.status] || STATUS_COLORS.pending;
                          return (
                            <div
                              key={p.id}
                              data-testid={`payout-row-${p.id}`}
                              className="flex items-center justify-between gap-3 p-3 rounded-xl text-xs"
                              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                              <div className="min-w-0">
                                <div className="font-semibold tabular-nums" style={{ color: '#f5f2e8' }}>
                                  {(p.amount || 0).toLocaleString()} RWF → {p.uploader_phone}
                                </div>
                                <div className="text-[11px] mt-0.5 flex items-center gap-1.5" style={{ color: '#8a8679' }}>
                                  <Clock size={11} />
                                  <span>{new Date(p.created_at).toLocaleDateString()}</span>
                                  {p.notes ? <span>· {p.notes}</span> : null}
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded text-[11px] font-semibold capitalize shrink-0" style={{ background: tone.bg, color: tone.text }}>
                                {p.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </section>
          </div>

          {/* Right: Interactive Earnings Estimator */}
          <aside className="lg:col-span-5">
            <div
              data-testid="earnings-estimator-card"
              className="rounded-2xl p-6 sm:p-7"
              style={{
                background: 'rgba(15,15,23,0.92)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
            >
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD }}>
                <Calculator size={14} />
                <span>Monthly Earnings Calculator</span>
              </div>
              <h2 className="font-cinzel text-lg font-semibold mb-2" style={{ fontFamily: 'Cinzel, serif', color: '#f5f2e8' }}>
                Estimate Your Uploader Income
              </h2>
              <p className="text-xs mb-6 leading-relaxed" style={{ color: '#9c988b' }}>
                Adjust expected views, fan donations, and paid game unlocks to preview how much you earn each month.
              </p>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5 tabular-nums">
                    <label htmlFor="sim-views-range" style={{ color: '#d6d2c4' }}>Monthly Views</label>
                    <span className="font-semibold" style={{ color: GOLD_LIGHT }}>{simViews.toLocaleString()}</span>
                  </div>
                  <input
                    id="sim-views-range"
                    type="range"
                    min="0"
                    max="200000"
                    step="1000"
                    value={simViews}
                    onChange={(e) => setSimViews(Number(e.target.value))}
                    className="w-full accent-[#c9a84c] cursor-pointer"
                  />
                  <div className="text-[11px] mt-1 tabular-nums" style={{ color: '#8a8679' }}>
                    View Bonus (250 RWF / 1K): {estimate.viewBonus.toLocaleString()} RWF
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5 tabular-nums">
                    <label htmlFor="sim-tips-range" style={{ color: '#d6d2c4' }}>Viewer Support Tips</label>
                    <span className="font-semibold" style={{ color: GOLD_LIGHT }}>{simTips.toLocaleString()} RWF</span>
                  </div>
                  <input
                    id="sim-tips-range"
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={simTips}
                    onChange={(e) => setSimTips(Number(e.target.value))}
                    className="w-full accent-[#c9a84c] cursor-pointer"
                  />
                  <div className="text-[11px] mt-1 tabular-nums" style={{ color: '#8a8679' }}>
                    Your 50% Share: {estimate.tipShare.toLocaleString()} RWF
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5 tabular-nums">
                    <label htmlFor="sim-games-range" style={{ color: '#d6d2c4' }}>Paid Game / App Unlocks</label>
                    <span className="font-semibold" style={{ color: GOLD_LIGHT }}>{simGameSales.toLocaleString()} RWF</span>
                  </div>
                  <input
                    id="sim-games-range"
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={simGameSales}
                    onChange={(e) => setSimGameSales(Number(e.target.value))}
                    className="w-full accent-[#c9a84c] cursor-pointer"
                  />
                  <div className="text-[11px] mt-1 tabular-nums" style={{ color: '#8a8679' }}>
                    Your 70% Share: {estimate.gameShare.toLocaleString()} RWF
                  </div>
                </div>
              </div>

              <div
                className="mt-6 pt-5 flex items-baseline justify-between gap-3 tabular-nums"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-xs font-medium" style={{ color: '#b8b4a8' }}>
                  Estimated Monthly Payout
                </span>
                <span className="text-2xl font-bold" data-testid="estimator-total" style={{ color: '#4ade80' }}>
                  {estimate.totalEstimatedRwf.toLocaleString()} RWF
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
