import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import SEOHead from '../../components/SEOHead';
import { supabaseAdmin } from '../../lib/server/supabase-admin';
import CinematicBackground from '../../components/CinematicBackground';
import AdBanner from '../../components/ads/AdBanner';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Download, ExternalLink, Package, Star, Shield, Zap, Lock, CheckCircle2, Loader2, Heart, Phone, Send, Crown } from 'lucide-react';

const UNLOCK_KEY = 'agezweho_unlocked_games';
const GAME_TX_KEY = 'agezweho_game_transactions';

export default function GameDetail({ game }) {
  const { user, isPro } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [donateStep, setDonateStep] = useState('confirm');
  const [processing, setProcessing] = useState(false);
  const [donorPhone, setDonorPhone] = useState('');
  const [downloadLinks, setDownloadLinks] = useState(Array.isArray(game?.links) ? game.links : []);
  const [pendingTxRef, setPendingTxRef] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const donateAmount = game?.price || 100;

  const loadUnlockedLinks = useCallback(async () => {
    if (!game?.id || !user) return false;

    if (isPro) {
      setDownloadLinks(Array.isArray(game?.links) ? game.links : []);
      setUnlocked(true);
      return true;
    }

    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) return false;

    const res = await fetch(`/api/games/${game.id}/links`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return false;

    setDownloadLinks(data.links || []);
    setUnlocked(true);

    const unlockedGames = JSON.parse(localStorage.getItem(UNLOCK_KEY) || '{}');
    localStorage.setItem(UNLOCK_KEY, JSON.stringify({ ...unlockedGames, [game.id]: true }));
    return true;
  }, [game?.id, user, isPro, game?.links]);

  const checkPaymentStatus = useCallback(async (txRef = pendingTxRef) => {
    if (!txRef) return false;
    setPaymentError('');

    const res = await fetch(`/api/payments/status?tx_ref=${encodeURIComponent(txRef)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPaymentError(data.error || 'Payment not found yet');
      return false;
    }

    if (data.transaction?.status === 'completed' && data.transaction?.game_id === game?.id) {
      const loaded = await loadUnlockedLinks();
      if (!loaded) setPaymentError('Payment is confirmed, but links could not be loaded. Please sign in again.');
      return loaded;
    }

    setPaymentError('Payment is still pending admin confirmation.');
    return false;
  }, [game?.id, loadUnlockedLinks, pendingTxRef]);

  useEffect(() => {
    if (!game?.id) return;
    if (game.premium === false) {
      setUnlocked(true);
      setDownloadLinks(Array.isArray(game.links) ? game.links : []);
      return;
    }

    const txRefs = JSON.parse(localStorage.getItem(GAME_TX_KEY) || '{}');
    if (txRefs[game.id]) {
      setPendingTxRef(txRefs[game.id]);
      checkPaymentStatus(txRefs[game.id]);
    }
  }, [checkPaymentStatus, game?.id, game?.links, game?.premium]);

  const handleDonate = async () => {
    if (!user || !donorPhone.trim()) return;
    setProcessing(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: donateAmount, user_id: user.id, phone: donorPhone, game_id: game.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const txRefs = JSON.parse(localStorage.getItem(GAME_TX_KEY) || '{}');
      localStorage.setItem(GAME_TX_KEY, JSON.stringify({ ...txRefs, [game.id]: data.tx_ref }));
      setPendingTxRef(data.tx_ref);
      setDonateStep('submitted');
      if (!data.payment_url) throw new Error('RwandaPay is not configured yet. Please try again later.');
      window.location.assign(data.payment_url);
      return;
    } catch (err) {
      setPaymentError(err.message || 'Could not start payment');
      setDonateStep('confirm');
    } finally {
      setProcessing(false);
    }
  };

  if (!game) return (
    <div className="min-h-screen flex items-center justify-center bg-deep">
      <CinematicBackground />
      <div className="text-center z-10">
        <h1 className="font-cinzel text-xl mb-4" style={{ fontFamily:'Cinzel,serif', color:'#a78bfa' }}>Not Found</h1>
        <Link href="/games"><span className="btn-ghost px-4 py-2 rounded-lg text-sm inline-block cursor-pointer">← Back</span></Link>
      </div>
    </div>
  );

  const links = downloadLinks;
  const themeColor = '#c9a84c';
  const themeBg = 'rgba(201,168,76,0.12)';
  const themeBorder = 'rgba(201,168,76,0.25)';

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title={game.title}
        description={game.overview || `Download ${game.title} for free on Agezweho Movies — Rwanda's home for premium content and Agasobanuye entertainment.`}
        keywords={`${game.title} download, ${game.title} ${game.version || ''}, ${game.category || ''} games, modded apps, premium content Rwanda`}
        ogImage={game.cover_url || undefined}
        canonical={`https://agezweho.com/games/${game.id}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: game.title,
          url: `https://agezweho.com/games/${game.id}`,
          image: game.cover_url || 'https://agezweho.com/og-image.svg',
          description: game.overview || `Download ${game.title} on Agezweho Movies`,
          applicationCategory: game.category || 'GameApplication',
          operatingSystem: 'Android, Windows',
          offers: {
            '@type': 'Offer',
            price: game.price || '0',
            priceCurrency: 'RWF',
            availability: 'https://schema.org/InStock',
          },
        }}
      />
      <CinematicBackground />

      {/* Ambient bg from cover */}
      {game.cover_url && (
        <div className="fixed inset-0 pointer-events-none z-0"
          style={{ backgroundImage:`url(${game.cover_url})`, backgroundSize:'cover',
            backgroundPosition:'center', filter:'blur(80px) saturate(0.2)', opacity:0.08 }} />
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-20">

        {/* Back */}
        <motion.div initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} className="mb-8">
          <Link href="/games">
            <motion.div whileHover={{ x:-3 }} className="inline-flex items-center gap-1.5 text-xs transition-colors"
              style={{ color:'#6a6a5a' }}
              onMouseEnter={e=>e.currentTarget.style.color=themeColor}
              onMouseLeave={e=>e.currentTarget.style.color='#6a6a5a'}>
              <ArrowLeft size={13} /> Back to Games
            </motion.div>
          </Link>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

          {/* Cover */}
          <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
            className="flex-shrink-0 w-full md:w-52">

            <div className="relative rounded-2xl overflow-hidden"
              style={{ border:`1px solid ${themeBorder}`, boxShadow:`0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${themeColor}15` }}>
              {game.cover_url ? (
                <img src={game.cover_url} alt={game.title} className="w-full aspect-[3/4] object-cover" />
              ) : (
                <div className="w-full aspect-[3/4] flex items-center justify-center" style={{ background: themeBg }}>
                  <Package size={56} style={{ color: themeColor, opacity:0.5 }} />
                </div>
              )}
              {/* Glow overlay */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ boxShadow:`inset 0 0 40px ${themeColor}10` }} />
            </div>

            {/* Meta */}
            <div className="mt-4 space-y-2">
              {[
                ['Category', game.category],
                ['Version',  game.version ? `v${game.version}` : null],
              ].filter(([,v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color:'#4a4a3a' }}>{k}</span>
                  <span className="text-xs" style={{ color:'#b8b4a8' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Features badge */}
            <div className="mt-4 p-3 rounded-xl" style={{ background: themeBg, border:`1px solid ${themeBorder}` }}>
              <div className="text-[9px] uppercase tracking-widest mb-2" style={{ color: themeColor }}>Details</div>
              <div className="space-y-1.5">
                {['Free Download', 'Community Verified'].map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px]" style={{ color:'#b8b4a8' }}>
                    <Shield size={9} style={{ color: themeColor }} /> {f}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>

              {/* Category badge */}
              <span className="inline-block mb-3 text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-widest"
                style={{ background: themeBg, border:`1px solid ${themeBorder}`, color: themeColor }}>
                {game.category}
              </span>

              {/* Disclaimer — for ALL */}
<motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
  className="mb-4 px-4 py-2.5 rounded-xl flex items-center gap-2.5"
  style={{ background:'rgba(234,179,8,0.06)', border:'1px solid rgba(234,179,8,0.2)' }}>
  <span className="text-base flex-shrink-0">⚠️</span>
  <p className="text-[11px] leading-relaxed" style={{ color:'#8a8060' }}>
    <span className="font-semibold" style={{ color:'#fbbf24' }}>Disclaimer: </span>
    Some Games & Modded apps on this page may be flagged as suspicious by antivirus tools or your browser — this is common for cracked/patched files. Download and use entirely at your own risk. We are not responsible for any damage, data loss, or legal issues. If unsure, always prefer the official versions.
  </p>
</motion.div>

              {/* Title */}
              <h1 className="font-cinzel font-bold leading-tight mb-3"
                style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(1.5rem,4vw,2.4rem)',
                  color: themeColor,
                  textShadow: `0 0 30px ${themeColor}40`,
                  filter: `drop-shadow(0 0 20px ${themeColor}30)` }}>
                {game.title}
              </h1>

              {/* Rating + Version */}
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                {game.rating && (
                  <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_,i) => (
                      <Star key={i} size={14}
                        fill={i < Math.round(parseFloat(game.rating)/2) ? themeColor : 'none'}
                        style={{ color: i < Math.round(parseFloat(game.rating)/2) ? themeColor : 'rgba(255,255,255,0.12)' }} />
                    ))}
                    <span className="text-lg font-bold ml-1" style={{ color: themeColor, fontFamily:'Cinzel,serif' }}>
                      {game.rating}
                    </span>
                    <span className="text-xs" style={{ color:'#4a4a3a' }}>/10</span>
                  </div>
                )}
                {game.version && (
                  <span className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{ background: themeBg, border:`1px solid ${themeBorder}`, color: themeColor }}>
                    <Zap size={10} className="inline mr-1" />v{game.version}
                  </span>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {game.version && (
                  <span className="badge badge-muted">v{game.version}</span>
                )}
              </div>

              {/* Overview */}
              {game.overview && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }} className="mb-8">
                  <div className="section-tag mb-2">Description</div>
                  <p className="text-sm leading-relaxed" style={{ color:'#a8a49a' }}>{game.overview}</p>
                </motion.div>
              )}
            </motion.div>

            {/* Donation Unlock Gate */}
            {game.premium !== false && !unlocked ? (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl text-center"
                style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.2)' }}>
                <Lock size={32} style={{ color: '#fbbf24', margin: '0 auto 12px' }} />
                <h3 className="font-cinzel text-lg mb-2" style={{ fontFamily: 'Cinzel,serif', color: '#fbbf24' }}>
                  {isPro ? 'Pro Access' : 'Donate to Unlock'}
                </h3>
                <p className="text-xs mb-4" style={{ color: '#8a8060' }}>
                  {isPro
                    ? 'You are Pro! Download links are being unlocked...'
                    : `Download links are locked. Donate <strong>${donateAmount} RWF</strong> via MTN MoMo to unlock.`
                  }
                </p>
                {user ? (
                  isPro ? (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold"
                      style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                      <Crown size={14} /> Unlocking for Pro...
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setShowDonate(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                        style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                        <Heart size={14} /> Donate {donateAmount} RWF
                      </motion.button>
                      <Link href="/subscribe">
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-semibold cursor-pointer"
                          style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', color: '#b8a060' }}>
                          <Crown size={12} /> Or go Pro — unlock all for 2,000 RWF/month
                        </motion.div>
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Link href={`/auth/login?redirect=/games/${game.id}`}>
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                        style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#e8c87a' }}>
                        Sign In to Unlock
                      </motion.div>
                    </Link>
                    <Link href="/subscribe">
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-semibold cursor-pointer"
                        style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', color: '#b8a060' }}>
                        <Crown size={12} /> Or go Pro for unlimited access
                      </motion.div>
                    </Link>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
                <div className="section-tag mb-4 flex items-center gap-2">
                  <Download size={11} /> Download Links
                </div>

                {links.length === 0 ? (
                  <p className="text-sm italic" style={{ color:'#4a4a3a' }}>No download links added yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {links.map((l, i) => (
                      <motion.a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                        initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                        transition={{ delay: 0.3 + i*0.06 }}
                        whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }}
                        className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold"
                        style={{
                          background: `${themeColor}18`,
                          border: `1px solid ${themeColor}40`,
                          color: themeColor,
                          textDecoration:'none',
                          boxShadow: `0 4px 20px ${themeColor}15`,
                        }}>
                        <Download size={14} />
                        {l.label || 'Download'}
                        <ExternalLink size={11} style={{ opacity:0.6 }} />
                      </motion.a>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Donation Modal */}
            <AnimatePresence>
              {showDonate && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
                  onClick={() => { if (donateStep !== 'pay' && donateStep !== 'success') { setShowDonate(false); setDonateStep('confirm'); } }}>
                  <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-sm rounded-2xl p-6 relative"
                    style={{ background: 'rgba(12,12,24,0.95)', border: '1px solid rgba(201,168,76,0.2)' }}
                    onClick={e => e.stopPropagation()}>

                    {donateStep === 'confirm' && (
                      <>
                        <Package size={40} style={{ color: '#fbbf24', margin: '0 auto 12px', display: 'block' }} />
                        <h3 className="font-cinzel text-lg mb-2 text-center" style={{ fontFamily: 'Cinzel,serif', color: '#fbbf24' }}>Unlock with Donation</h3>
                        <p className="text-xs text-center mb-3" style={{ color: '#8a8060' }}>
                          Donate <strong>{donateAmount} RWF</strong> to unlock download links for this content.
                        </p>
                        <Link href="/subscribe">
                          <div className="p-2 rounded-xl mb-4 text-center cursor-pointer" style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)' }}>
                            <p className="text-[10px]" style={{ color: '#b8a060' }}>
                              <Crown size={10} style={{ display:'inline', verticalAlign:'middle', marginRight:4 }} />
                              Go Pro for 2,000 RWF/month — unlock all premium content, no per-item fees
                            </p>
                          </div>
                        </Link>
                        <div className="mb-4">
                          <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: '#6a6a5a' }}>Your MTN Phone Number</label>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Phone size={14} style={{ color: '#6a6a5a' }} />
                            <input type="tel" value={donorPhone} onChange={e => setDonorPhone(e.target.value)}
                              placeholder="078XXXXXXX"
                              className="flex-1 bg-transparent text-sm outline-none" style={{ color: '#e8e6f0' }} />
                          </div>
                        </div>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={handleDonate} disabled={processing || !donorPhone.trim()}
                          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold"
                          style={{ background: !donorPhone.trim() ? 'rgba(255,255,255,0.05)' : 'rgba(251,191,36,0.12)', border: `1px solid ${!donorPhone.trim() ? 'rgba(255,255,255,0.08)' : 'rgba(251,191,36,0.3)'}`, color: !donorPhone.trim() ? '#4a4a3a' : '#fbbf24' }}>
                          {processing ? <Loader2 size={14} /> : <Send size={14} />}
                          {processing ? 'Submitting...' : `Submit — Send ${donateAmount} RWF`}
                        </motion.button>
                      </>
                    )}

                    {donateStep === 'submitted' && (
                      <div className="text-center py-4">
                        <CheckCircle2 size={40} style={{ color: '#22c55e', margin: '0 auto 12px', display: 'block' }} />
                        <h3 className="font-cinzel text-lg mb-1" style={{ fontFamily: 'Cinzel,serif', color: '#22c55e' }}>Payment Started!</h3>
                        <p className="text-xs mb-2" style={{ color: '#8a8060' }}>
                          Complete your <strong>{donateAmount} RWF</strong> payment in the RwandaPay prompt on your phone.
                        </p>
                        <p className="text-xs mb-4" style={{ color: '#6b6b8a' }}>
                          Your number <strong style={{ color: '#fbbf24' }}>{donorPhone}</strong> helps us link the payment to you.
                        </p>
                        {pendingTxRef && (
                          <p className="text-[10px] mb-3 break-all" style={{ color: '#6a6a5a' }}>
                            Ref: <span style={{ color: '#fbbf24' }}>{pendingTxRef}</span>
                          </p>
                        )}
                        {paymentError && (
                          <p className="text-[11px] mb-3" style={{ color: '#f87171' }}>{paymentError}</p>
                        )}
                        <div className="flex gap-2 justify-center flex-wrap">
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => checkPaymentStatus()}
                            className="px-5 py-2 rounded-xl text-xs font-semibold"
                            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}>
                            Check Status
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => { setShowDonate(false); setDonateStep('confirm'); setDonorPhone(''); }}
                            className="px-5 py-2 rounded-xl text-xs font-semibold"
                            style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c' }}>
                            Done
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AdBanner size="300x250" className="mb-6" />

            {/* Disclaimer */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
              className="mt-6 p-4 rounded-xl"
              style={{ background:'rgba(234,179,8,0.05)', border:'1px solid rgba(234,179,8,0.15)' }}>
              <p className="text-[11px] leading-relaxed" style={{ color:'#8a8060' }}>
                ⚠️ <span style={{ color:'#fbbf24' }}>Disclaimer:</span> Download and use at your own risk.
                We are not responsible for any issues. Always scan files before installing.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const { data: game } = await supabaseAdmin
      .from('games')
      .select('*')
      .eq('id', params.id)
      .eq('status', 'approved')
      .single();
    if (!game) return { notFound: true };
    return {
      props: {
        game: {
          ...game,
          links: game.premium === false ? (game.links || []) : [],
        },
      },
    };
  } catch { return { notFound: true }; }
}
