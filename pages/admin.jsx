import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEOHead from '../components/SEOHead';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import CinematicBackground from '../components/CinematicBackground';
import AddMovieForm from '../components/AddMovieForm';
import { supabase } from '../lib/supabase';
import {
  Shield, Film, Wallet, Mail, Users, Heart,
  CheckCircle2, XCircle, Loader2, Trash2, Plus, UserPlus, Edit3, List, ArrowLeft, Package,
  BarChart3, DollarSign, Search, RotateCcw, Filter, TrendingUp, X, Crown, Newspaper, ShoppingBag
} from 'lucide-react';

const TABS = [
  { id: 'movies', label: 'Agasobanuye Pending', icon: Film },
  { id: 'all-movies', label: 'All Agasobanuye', icon: List },
  { id: 'premium', label: 'Premium', icon: Package },
  { id: 'requests', label: 'Requests', icon: Heart },
  { id: 'transactions', label: 'Transactions', icon: Wallet },
  { id: 'donations', label: 'Donations', icon: Heart },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
  { id: 'payouts', label: 'Payouts', icon: DollarSign },
  { id: 'contacts', label: 'Messages', icon: Mail },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'shop', label: 'Shop', icon: ShoppingBag },
  { id: 'admins', label: 'Admins', icon: Users },
];

async function fetchAdminData(token) {
  const res = await fetch('/api/admin', { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('movies');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [addAdminEmail, setAddAdminEmail] = useState('');
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [addAdminError, setAddAdminError] = useState('');
  const [addAdminSuccess, setAddAdminSuccess] = useState('');
  const [editingMovie, setEditingMovie] = useState(null);
  const [creatingMovie, setCreatingMovie] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [txSearch, setTxSearch] = useState('');
  const [txFilter, setTxFilter] = useState('');
  const [txList, setTxList] = useState([]);
  const [txUserMap, setTxUserMap] = useState({});
  const [txLoading, setTxLoading] = useState(false);
  const [showManualTx, setShowManualTx] = useState(false);
  const [manualTxForm, setManualTxForm] = useState({ amount: '', phone: '', donor_email: '', request_id: '', game_id: '' });
  const [manualTxLoading, setManualTxLoading] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('daily');

  const [payouts, setPayouts] = useState(null);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [showProcessPayout, setShowProcessPayout] = useState(null);
  const [payoutForm, setPayoutForm] = useState({ amount: '', notes: '' });
  const [payoutActionLoading, setPayoutActionLoading] = useState(false);

  const [subscriptions, setSubscriptions] = useState([]);
  const [subUserMap, setSubUserMap] = useState({});
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth/login?redirect=/admin'); return; }

    const load = async () => {
      setLoading(true); setError('');
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (!token) throw new Error('No session');
        const result = await fetchAdminData(token);
        setData(result);
      } catch {
        router.push('/games');
        return;
      } finally { setLoading(false); }
    };
    load();
  }, [user, authLoading]);

  const refresh = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) return;
    const result = await fetchAdminData(token);
    setData(result);
  };

  const doAdminRequest = async (url, method, body) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) throw new Error('No session');
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.error || 'Action failed');
    return result;
  };

  const loadTransactions = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) return;
    setTxLoading(true);
    try {
      const params = new URLSearchParams();
      if (txFilter) params.set('status', txFilter);
      if (txSearch) params.set('search', txSearch);
      params.set('limit', '200');
      const res = await fetch(`/api/admin/transactions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const result = await res.json();
        setTxList(result.transactions || []);
        setTxUserMap(result.userMap || {});
      }
    } catch {} finally { setTxLoading(false); }
  };

  const loadAnalytics = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) return;
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${analyticsPeriod}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAnalytics(await res.json());
    } catch {} finally { setAnalyticsLoading(false); }
  };

  const loadPayouts = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) return;
    setPayoutsLoading(true);
    try {
      const res = await fetch('/api/admin/payouts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPayouts(await res.json());
    } catch {} finally { setPayoutsLoading(false); }
  };

  const loadSubscriptions = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) return;
    setSubLoading(true);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const result = await res.json();
        setSubscriptions(result.subscriptions || []);
        setSubUserMap(result.userMap || {});
      }
    } catch {} finally { setSubLoading(false); }
  };

  useEffect(() => { if (tab === 'transactions') loadTransactions(); }, [tab, txFilter]);
  useEffect(() => { if (tab === 'analytics') loadAnalytics(); }, [tab, analyticsPeriod]);
  useEffect(() => { if (tab === 'payouts') loadPayouts(); }, [tab]);
  useEffect(() => { if (tab === 'subscriptions') loadSubscriptions(); }, [tab]);

  const doAction = async (url, body, refreshKey) => {
    setActionLoading(refreshKey);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Action failed');
      await refresh();
    } catch (err) { setError(err.message || 'Action failed'); }
    finally { setActionLoading(null); }
  };

  const approveMovie = async (id) => {
    setActionLoading(`movie_${id}`);
    try {
      await doAdminRequest('/api/admin/movies', 'PATCH', { id, status: 'approved' });
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const rejectMovie = async (id) => {
    setActionLoading(`movie_${id}`);
    try {
      await doAdminRequest('/api/admin/movies', 'PATCH', { id, status: 'rejected' });
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

   const handleDeleteMovie = async (id) => {
     if (!confirm('Delete this movie permanently?')) return;
     setActionLoading(`del_${id}`);
     try {
       await doAdminRequest('/api/admin/movies', 'DELETE', { id });
       await refresh();
     } catch (err) { setError(err.message); }
     finally { setActionLoading(null); }
   };

   const handleCreateMovie = async (movieData) => {
     setEditLoading(true);
     try {
       const result = await doAdminRequest('/api/admin/movies', 'POST', movieData);
       setEditingMovie(null);
       setCreatingMovie(false);
       await refresh();
     } catch (err) { setError(err.message); }
     finally { setEditLoading(false); }
   };

  const handleEditMovie = async (updates) => {
    if (!editingMovie) return;
    setEditLoading(true);
    try {
      await doAdminRequest('/api/admin/movies', 'PATCH', { id: editingMovie.id, ...updates });
      setEditingMovie(null);
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setEditLoading(false); }
  };

  const handleFulfillRequest = async (id, fulfilled) => {
    setActionLoading(`req_${id}`);
    try {
      await doAdminRequest('/api/admin/requests', 'PATCH', { id, fulfilled });
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const handleDeleteRequest = async (id) => {
    if (!confirm('Delete this request permanently?')) return;
    setActionLoading(`delreq_${id}`);
    try {
      await doAdminRequest('/api/admin/requests', 'DELETE', { id });
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const handleUpdateGameStatus = async (id, status) => {
    setActionLoading(`game_${id}`);
    try {
      await doAdminRequest('/api/admin/games', 'PATCH', { id, status });
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const handleDeleteGame = async (id) => {
    if (!confirm('Delete this premium item permanently?')) return;
    setActionLoading(`delgame_${id}`);
    try {
      await doAdminRequest('/api/admin/games', 'DELETE', { id });
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const handleApproveNews = async (id) => {
    setActionLoading(`news_${id}`);
    try {
      await doAdminRequest('/api/admin/news', 'PATCH', { id, status: 'approved' });
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const handleRejectNews = async (id) => {
    setActionLoading(`news_${id}`);
    try {
      await doAdminRequest('/api/admin/news', 'PATCH', { id, status: 'rejected' });
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const handleDeleteNews = async (id) => {
    if (!confirm('Delete this news post permanently?')) return;
    setActionLoading(`delnews_${id}`);
    try {
      await doAdminRequest('/api/admin/news', 'DELETE', { id });
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const handleMarkSold = async (id) => {
    setActionLoading(`shop_${id}`);
    try {
      await doAdminRequest('/api/admin/shop', 'PATCH', { id, status: 'sold' });
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const handleReactivateShop = async (id) => {
    setActionLoading(`shop_${id}`);
    try {
      await doAdminRequest('/api/admin/shop', 'PATCH', { id, status: 'active' });
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const handleDeleteShopItem = async (id) => {
    if (!confirm('Delete this shop listing permanently?')) return;
    setActionLoading(`delshop_${id}`);
    try {
      await doAdminRequest('/api/admin/shop', 'DELETE', { id });
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!addAdminEmail.trim()) return;
    setAddAdminLoading(true); setAddAdminError(''); setAddAdminSuccess('');
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addAdminEmail.trim() }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to add admin');
      setAddAdminSuccess(`Admin added: ${addAdminEmail.trim()}`);
      setAddAdminEmail('');
      const adminData = await fetchAdminData(token);
      setData(adminData);
    } catch (err) {
      setAddAdminError(err.message);
    } finally { setAddAdminLoading(false); }
  };

  const handleRemoveAdmin = async (id) => {
    setActionLoading(`admin_${id}`);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/admin/admins', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to remove');
      const adminData = await fetchAdminData(token);
      setData(adminData);
    } catch {}
    finally { setActionLoading(null); }
  };

  const handleCancelTx = async (tx_ref) => {
    setActionLoading(`cancel_${tx_ref}`);
    try {
      await doAdminRequest('/api/admin/transactions?action=cancel', 'POST', { tx_ref });
      await loadTransactions();
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const handleRefundTx = async (tx_ref) => {
    if (!confirm('Refund this completed transaction? This will reverse votes/access.')) return;
    setActionLoading(`refund_${tx_ref}`);
    try {
      await doAdminRequest('/api/admin/transactions?action=refund', 'POST', { tx_ref });
      await loadTransactions();
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const handleManualTx = async (e) => {
    e.preventDefault();
    setManualTxLoading(true);
    try {
      await doAdminRequest('/api/admin/transactions?action=manual-create', 'POST', {
        amount: parseInt(manualTxForm.amount, 10),
        phone: manualTxForm.phone || undefined,
        donor_email: manualTxForm.donor_email || undefined,
        request_id: manualTxForm.request_id || undefined,
        game_id: manualTxForm.game_id || undefined,
      });
      setShowManualTx(false);
      setManualTxForm({ amount: '', phone: '', donor_email: '', request_id: '', game_id: '' });
      await loadTransactions();
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setManualTxLoading(false); }
  };

  const handleProcessPayout = async () => {
    if (!showProcessPayout || !payoutForm.amount) return;
    setPayoutActionLoading(true);
    try {
      await doAdminRequest('/api/admin/payouts?action=process', 'POST', {
        uploader_phone: showProcessPayout.momo_number,
        amount: parseInt(payoutForm.amount, 10),
        notes: payoutForm.notes || undefined,
      });
      setShowProcessPayout(null);
      setPayoutForm({ amount: '', notes: '' });
      await loadPayouts();
    } catch (err) { setError(err.message); }
    finally { setPayoutActionLoading(false); }
  };

  const handleMarkPaid = async (id) => {
    setActionLoading(`payout_${id}`);
    try {
      await doAdminRequest('/api/admin/payouts?action=mark-paid', 'POST', { id });
      await loadPayouts();
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead title="Admin" noIndex />
      <CinematicBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <Shield size={20} style={{ color: '#f87171' }} />
            </div>
            <div>
              <h1 className="font-cinzel text-xl" style={{ fontFamily: 'Cinzel,serif', color: '#f87171' }}>Admin Panel</h1>
              <p className="text-[10px]" style={{ color: '#6a6a5a' }}>{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
              <Loader2 size={32} style={{ color: '#c9a84c' }} />
            </motion.div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
          </div>
        ) : (
          <>
            {data && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 rounded-xl flex flex-wrap gap-4"
                style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                  <Film size={13} style={{ color: '#60a5fa' }} />
                  <span className="text-[10px]" style={{ color: '#6a6a5a' }}>Agasobanuye: <span style={{ color:'#e8e6f0' }}>{data.allMovies?.length || 0}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart size={13} style={{ color: '#fbbf24' }} />
                  <span className="text-[10px]" style={{ color: '#6a6a5a' }}>Total Votes: <span style={{ color:'#fbbf24' }}>{(data.allRequests || []).reduce((s, r) => s + (r.votes || 0), 0).toLocaleString()}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet size={13} style={{ color: '#22c55e' }} />
                  <span className="text-[10px]" style={{ color: '#6a6a5a' }}>Donations: <span style={{ color:'#22c55e' }}>{(data.completedDonations || []).reduce((s, d) => s + (d.amount || 0), 0).toLocaleString()} RWF</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} style={{ color: '#c9a84c' }} />
                  <span className="text-[10px]" style={{ color: '#6a6a5a' }}>Fulfilled: <span style={{ color:'#c9a84c' }}>{(data.allRequests || []).filter(r => r.fulfilled).length}</span></span>
                </div>
              </motion.div>
            )}

            <div className="flex gap-2 mb-6 flex-wrap">
              {TABS.map(t => (
                <motion.button key={t.id} onClick={() => setTab(t.id)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={tab === t.id
                    ? { background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#e8c87a' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#6a6a5a' }
                  }>
                  <t.icon size={14} />
                  {t.label}
                  {t.id === 'movies' && data?.pendingMovies?.length > 0 && (
                    <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: '#f87171', color: '#fff' }}>{data.pendingMovies.length}</span>
                  )}
                  {t.id === 'transactions' && data?.pendingTransactions?.length > 0 && (
                    <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: '#22c55e', color: '#000' }}>{data.pendingTransactions.length}</span>
                  )}
                </motion.button>
              ))}
            </div>

            {tab === 'movies' && (
              <div className="space-y-3">
                {data?.pendingMovies?.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: '#6a6a5a' }}>Nta Agasobanuye pending</p>
                ) : data?.pendingMovies?.map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {m.poster_url && <img src={m.poster_url} alt="" className="w-10 h-14 rounded-lg object-cover" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: '#e8e6f0' }}>{m.title}</div>
                      <div className="text-[10px]" style={{ color: '#6a6a5a' }}>{m.type} • {m.year} • {m.language}</div>
                      <div className="text-[10px] mt-1 flex gap-3" style={{ color: '#4a4a3a' }}>
                        {m.uploaded_by && <span>Uploaded by <span style={{ color:'#c9a84c' }}>{m.uploaded_by}</span></span>}
                        {m.uploader_momo_number && <span>MoMo: <span style={{ color:'#22c55e' }}>{m.uploader_momo_number}</span></span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => approveMovie(m.id)} disabled={actionLoading === `movie_${m.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                        {actionLoading === `movie_${m.id}` ? <Loader2 size={12} /> : <CheckCircle2 size={12} />} Approve
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => rejectMovie(m.id)} disabled={actionLoading === `movie_${m.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                        <XCircle size={12} /> Reject
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'all-movies' && (
              <div className="space-y-3">
                {editingMovie ? (
                  <div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setEditingMovie(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-4"
                      style={{ color: '#6a6a5a' }}>
                      <ArrowLeft size={13} /> Back to all movies
                    </motion.button>
                    <AddMovieForm
                      key={editingMovie.id}
                      initial={editingMovie}
                      onSave={handleEditMovie}
                      onCancel={() => setEditingMovie(null)}
                      loading={editLoading}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px]" style={{ color: '#6a6a5a' }}>Total: <span style={{ color:'#e8e6f0' }}>{data?.allMovies?.length || 0}</span> Agasobanuye</span>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setCreatingMovie(true)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold ml-auto"
                        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                        <Plus size={11} /> Add Movie
                      </motion.button>
                    </div>
                    {creatingMovie ? (
                      <div>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                          onClick={() => { setCreatingMovie(false); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-4"
                          style={{ color: '#6a6a5a' }}>
                          <ArrowLeft size={13} /> Back to all movies
                        </motion.button>
                        <AddMovieForm
                          initial={null}
                          onSave={handleCreateMovie}
                          onCancel={() => { setCreatingMovie(false); }}
                          loading={editLoading}
                        />
                      </div>
                    ) : data?.allMovies?.length === 0 ? (
                      <p className="text-sm text-center py-8" style={{ color: '#6a6a5a' }}>Nta Agasobanuye — no movies yet</p>
                    ) : data?.allMovies?.map(m => (
                      <div key={m.id} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {m.poster_url && <img src={m.poster_url} alt="" className="w-10 h-14 rounded-lg object-cover" />}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium" style={{ color: '#e8e6f0' }}>{m.title}</div>
                          <div className="text-[10px]" style={{ color: '#6a6a5a' }}>{m.type} • {m.year} • {m.language}</div>
                          <div className="text-[10px] mt-1" style={{ color: '#4a4a3a' }}>
                            <span className={m.status === 'approved' ? 'text-green-400' : m.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}>
                              {m.status}
                            </span>
                            {m.uploaded_by && <span> • by {m.uploaded_by}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setEditingMovie(m)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
                            <Edit3 size={11} /> Edit
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteMovie(m.id)} disabled={actionLoading === `del_${m.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                            {actionLoading === `del_${m.id}` ? <Loader2 size={11} /> : <Trash2 size={11} />} Delete
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {tab === 'premium' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px]" style={{ color: '#6a6a5a' }}>Total: <span style={{ color:'#e8e6f0' }}>{data?.allGames?.length || 0}</span> premium items</span>
                </div>
                {(() => {
                  const totalEarned = Object.values(data?.gameEarnings || {}).reduce((a, b) => a + b, 0);
                  return (
                    <div className="flex gap-4 mb-3 p-3 rounded-xl" style={{ background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.15)' }}>
                      <div className="text-[10px]"><span style={{ color:'#6a6a5a' }}>Total Earned: </span><span style={{ color:'#fbbf24' }}>{totalEarned.toLocaleString()} RWF</span></div>
                    </div>
                  );
                })()}
                {data?.allGames?.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: '#6a6a5a' }}>No premium content</p>
                ) : data?.allGames?.map(g => {
                  const earned = data?.gameEarnings?.[g.id] || 0;
                  return (
                    <div key={g.id} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {g.cover_url && <img src={g.cover_url} alt="" className="w-10 h-14 rounded-lg object-cover" />}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium" style={{ color: '#e8e6f0' }}>{g.title}</div>
                        <div className="text-[10px]" style={{ color: '#6a6a5a' }}>{g.category} {g.version ? <span>• v{g.version}</span> : ''}</div>
                        <div className="text-[10px] mt-1 flex gap-3 flex-wrap" style={{ color: '#4a4a3a' }}>
                          <span className={g.status === 'approved' ? 'text-green-400' : g.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}>
                            {g.status || 'approved'}
                          </span>
                          <span>Price: <span style={{ color:'#fbbf24' }}>{g.price || 50} RWF</span></span>
                          <span>Earned: <span style={{ color: earned > 0 ? '#22c55e' : '#4a4a3a' }}>{earned.toLocaleString()} RWF</span></span>
                          {g.uploader_momo_number && <span>MoMo: <span style={{ color:'#22c55e' }}>{g.uploader_momo_number}</span></span>}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        {g.status !== 'approved' && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateGameStatus(g.id, 'approved')} disabled={actionLoading === `game_${g.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                            {actionLoading === `game_${g.id}` ? <Loader2 size={11} /> : <CheckCircle2 size={11} />} Approve
                          </motion.button>
                        )}
                        {g.status !== 'rejected' && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateGameStatus(g.id, 'rejected')} disabled={actionLoading === `game_${g.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                            <XCircle size={11} /> Reject
                          </motion.button>
                        )}
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteGame(g.id)} disabled={actionLoading === `delgame_${g.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                          {actionLoading === `delgame_${g.id}` ? <Loader2 size={11} /> : <Trash2 size={11} />} Delete
                        </motion.button>
                      </div>
                          </div>
                      );
                    })}
              </div>
            )}

            {tab === 'requests' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px]" style={{ color: '#6a6a5a' }}>Total: <span style={{ color:'#e8e6f0' }}>{data?.allRequests?.length || 0}</span> requests</span>
                </div>
                {data?.allRequests?.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: '#6a6a5a' }}>No requests</p>
                ) : data?.allRequests?.map(r => (
                  <div key={r.id} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: '#e8e6f0' }}>{r.title}</div>
                      <div className="text-[10px]" style={{ color: '#6a6a5a' }}>
                        {r.year && <span>{r.year} • </span>}
                        {r.language && <span>{r.language} • </span>}
                        <span>{r.votes || 0} votes</span>
                        {r.requested_by && <span> • by {r.requested_by}</span>}
                      </div>
                      <div className="text-[10px] mt-1">
                        <span className={r.fulfilled ? 'text-green-400' : 'text-yellow-400'}>
                          {r.fulfilled ? 'Fulfilled ✓' : 'Pending'}
                        </span>
                        {r.donation_total > 0 && <span className="ml-3" style={{ color:'#c9a84c' }}>{r.donation_total.toLocaleString()} RWF</span>}
                        {data?.requestDonations?.[r.id] > 0 && <span className="ml-2" style={{ color:'#22c55e' }}>+{data.requestDonations[r.id].toLocaleString()} RWF earned</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleFulfillRequest(r.id, !r.fulfilled)} disabled={actionLoading === `req_${r.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                        style={{ background: r.fulfilled ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.12)', border: `1px solid ${r.fulfilled ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.3)'}`, color: r.fulfilled ? '#f87171' : '#22c55e' }}>
                        {actionLoading === `req_${r.id}` ? <Loader2 size={11} /> : r.fulfilled ? <XCircle size={11} /> : <CheckCircle2 size={11} />}
                        {r.fulfilled ? 'Unmark' : 'Fulfill'}
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteRequest(r.id)} disabled={actionLoading === `delreq_${r.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                        {actionLoading === `delreq_${r.id}` ? <Loader2 size={11} /> : <Trash2 size={11} />} Delete
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'transactions' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="flex-1 flex items-center gap-2 p-2 rounded-xl"
                    style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Search size={14} style={{ color: '#6a6a5a' }} />
                    <input type="text" value={txSearch} onChange={e => setTxSearch(e.target.value)}
                      placeholder="Search by ref, phone, email, user ID..."
                      className="flex-1 bg-transparent text-xs outline-none"
                      style={{ color: '#e8e6f0' }}
                      onKeyDown={e => { if (e.key === 'Enter') loadTransactions(); }} />
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={loadTransactions} disabled={txLoading}
                      className="px-3 py-1 rounded-lg text-[10px] font-semibold"
                      style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#e8c87a' }}>
                      {txLoading ? <Loader2 size={11} /> : 'Search'}
                    </motion.button>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 p-2 rounded-xl"
                      style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Filter size={14} style={{ color: '#6a6a5a' }} />
                      <select value={txFilter} onChange={e => setTxFilter(e.target.value)}
                        className="bg-transparent text-xs outline-none"
                        style={{ color: '#e8e6f0' }}>
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setShowManualTx(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold whitespace-nowrap"
                      style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                      <Plus size={12} /> Manual
                    </motion.button>
                  </div>
                </div>

                {showManualTx && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl mb-4"
                    style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold" style={{ color: '#60a5fa' }}>Manual Transaction</span>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setShowManualTx(false)}
                        className="p-1 rounded-lg" style={{ color: '#6a6a5a' }}>
                        <X size={14} />
                      </motion.button>
                    </div>
                    <form onSubmit={handleManualTx} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="number" required placeholder="Amount (RWF)" value={manualTxForm.amount}
                        onChange={e => setManualTxForm(f => ({ ...f, amount: e.target.value }))}
                        className="px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.06)', color: '#e8e6f0' }} />
                      <input type="text" placeholder="Phone (optional)" value={manualTxForm.phone}
                        onChange={e => setManualTxForm(f => ({ ...f, phone: e.target.value }))}
                        className="px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.06)', color: '#e8e6f0' }} />
                      <input type="email" placeholder="Donor email (optional)" value={manualTxForm.donor_email}
                        onChange={e => setManualTxForm(f => ({ ...f, donor_email: e.target.value }))}
                        className="px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.06)', color: '#e8e6f0' }} />
                      <input type="text" placeholder="Request ID (optional)" value={manualTxForm.request_id}
                        onChange={e => setManualTxForm(f => ({ ...f, request_id: e.target.value }))}
                        className="px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.06)', color: '#e8e6f0' }} />
                      <input type="text" placeholder="Game ID (optional)" value={manualTxForm.game_id}
                        onChange={e => setManualTxForm(f => ({ ...f, game_id: e.target.value }))}
                        className="px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.06)', color: '#e8e6f0' }} />
                      <div className="flex items-end">
                        <motion.button type="submit" disabled={manualTxLoading || !manualTxForm.amount}
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
                          style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                          {manualTxLoading ? <Loader2 size={12} /> : <CheckCircle2 size={12} />} Create & Confirm
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {txLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} style={{ color: '#c9a84c' }} className="animate-spin" />
                  </div>
                ) : txList.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: '#6a6a5a' }}>No transactions found</p>
                ) : (
                  <div className="space-y-2">
                    <span className="text-[10px]" style={{ color: '#6a6a5a' }}>{txList.length} transaction(s)</span>
                    {txList.map(tx => {
                      const voteCount = Math.max(1, Math.floor(tx.amount / 50));
                      const statusColor = tx.status === 'completed' ? '#22c55e' : tx.status === 'pending' ? '#fbbf24' : tx.status === 'cancelled' ? '#6a6a5a' : '#f87171';
                      const bgColor = tx.status === 'completed' ? 'rgba(34,197,94,0.03)' : tx.status === 'pending' ? 'rgba(251,191,36,0.04)' : 'rgba(14,14,22,0.6)';
                      const borderColor = tx.status === 'completed' ? 'rgba(34,197,94,0.12)' : tx.status === 'pending' ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)';
                      return (
                        <div key={tx.id} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${statusColor}15` }}>
                            {tx.status === 'completed' ? <CheckCircle2 size={16} style={{ color: statusColor }} />
                              : tx.status === 'cancelled' ? <XCircle size={16} style={{ color: statusColor }} />
                              : tx.status === 'refunded' ? <RotateCcw size={16} style={{ color: statusColor }} />
                              : <Wallet size={16} style={{ color: statusColor }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium" style={{ color: '#e8e6f0' }}>
                              {tx.amount?.toLocaleString()} RWF
                              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded`}
                                style={{ background: `${statusColor}15`, color: statusColor }}>
                                {tx.status}
                              </span>
                              {(tx.status === 'pending' || tx.status === 'completed') && (
                                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>+{voteCount} vote{voteCount > 1 ? 's' : ''}</span>
                              )}
                            </div>
                            <div className="text-[10px]" style={{ color: '#6a6a5a' }}>
                              Ref: <span style={{ color: statusColor }}>{tx.tx_ref}</span>
                              {tx.phone && <span> • Phone: {tx.phone}</span>}
                              {tx.user_id && <span> • User: {txUserMap[tx.user_id] || tx.user_id.slice(0, 8)}</span>}
                              {tx.donor_email && <span> • {tx.donor_email}</span>}
                              {tx.request_id && <span> • Req: {tx.request_id.slice(0, 8)}...</span>}
                              {tx.game_id && <span> • Game: {tx.game_id.slice(0, 8)}...</span>}
                              <span> • {new Date(tx.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {tx.status === 'pending' && (
                              <>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                  onClick={() => doAction('/api/admin/confirm-transaction', { tx_ref: tx.tx_ref }, `confirm_${tx.id}`)}
                                  disabled={actionLoading === `confirm_${tx.id}`}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap"
                                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                                  {actionLoading === `confirm_${tx.id}` ? <Loader2 size={12} /> : <CheckCircle2 size={12} />} Confirm
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                  onClick={() => handleCancelTx(tx.tx_ref)} disabled={actionLoading === `cancel_${tx.tx_ref}`}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap"
                                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                                  {actionLoading === `cancel_${tx.tx_ref}` ? <Loader2 size={12} /> : <XCircle size={12} />} Cancel
                                </motion.button>
                              </>
                            )}
                            {tx.status === 'completed' && (
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => handleRefundTx(tx.tx_ref)} disabled={actionLoading === `refund_${tx.tx_ref}`}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap"
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                                {actionLoading === `refund_${tx.tx_ref}` ? <Loader2 size={12} /> : <RotateCcw size={12} />} Refund
                              </motion.button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === 'donations' && (
              <div className="space-y-3">
                {!data?.completedDonations || data.completedDonations.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: '#6a6a5a' }}>No donations yet</p>
                ) : (
                  data.completedDonations.map((d, i) => (
                    <div key={d.id || i} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
                        <Heart size={16} style={{ color: '#22c55e' }} fill="#22c55e" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: '#e8e6f0' }}>{d.amount?.toLocaleString()} RWF</div>
                        <div className="text-[10px]" style={{ color: '#6a6a5a' }}>
                          {d.donor_name || 'Anonymous'} • {new Date(d.created_at).toLocaleDateString()}
                          {d.request_id && <span> • Request ID: {d.request_id.slice(0, 8)}...</span>}
                        </div>
                      </div>
                      {d.confirmed ? (
                        <span className="text-[10px] px-2 py-1 rounded" style={{
                          background: 'rgba(34,197,94,0.1)',
                          border: '1px solid rgba(34,197,94,0.3)',
                          color: '#22c55e'
                        }}>Confirmed</span>
                      ) : (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => doAction('/api/admin/confirm-donation', { id: d.id }, `donation_${d.id}`)}
                          disabled={actionLoading === `donation_${d.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                          {actionLoading === `donation_${d.id}` ? <Loader2 size={12} /> : <CheckCircle2 size={12} />} Confirm
                        </motion.button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'analytics' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[11px]" style={{ color: '#6a6a5a' }}>Period:</span>
                  <div className="flex gap-2">
                    {['daily', 'weekly', 'monthly'].map(p => (
                      <motion.button key={p} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setAnalyticsPeriod(p)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                        style={analyticsPeriod === p
                          ? { background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#e8c87a' }
                          : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#6a6a5a' }
                        }>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {analyticsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} style={{ color: '#c9a84c' }} className="animate-spin" />
                  </div>
                ) : analytics ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Total Revenue', value: `${analytics.totalRevenue?.toLocaleString()} RWF`, color: '#fbbf24' },
                        { label: 'Game Sales', value: `${analytics.gameSalesTotal?.toLocaleString()} RWF`, color: '#60a5fa' },
                        { label: 'Donations', value: `${analytics.donationTotal?.toLocaleString()} RWF`, color: '#22c55e' },
                        { label: 'Transactions', value: analytics.totalTransactions?.toLocaleString(), color: '#c9a84c' },
                      ].map(stat => (
                        <div key={stat.label} className="p-4 rounded-xl text-center"
                          style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div className="text-[10px] mb-1" style={{ color: '#6a6a5a' }}>{stat.label}</div>
                          <div className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp size={14} style={{ color: '#c9a84c' }} />
                        <span className="text-xs font-semibold" style={{ color: '#e8e6f0' }}>
                          Revenue Trend ({analyticsPeriod})
                        </span>
                      </div>
                      {analytics.revenueByPeriod?.length === 0 ? (
                        <p className="text-[10px] text-center py-4" style={{ color: '#6a6a5a' }}>No revenue data</p>
                      ) : (
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                          {analytics.revenueByPeriod?.slice().reverse().map(r => {
                            const maxRevenue = Math.max(...(analytics.revenueByPeriod || []).map(x => x.total), 1);
                            const pct = (r.total / maxRevenue) * 100;
                            return (
                              <div key={r.date} className="flex items-center gap-2">
                                <span className="text-[9px] w-20 flex-shrink-0" style={{ color: '#6a6a5a' }}>{r.date}</span>
                                <div className="flex-1 h-4 rounded-sm relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                  <div className="h-full rounded-sm absolute left-0 top-0" style={{
                                    width: `${Math.max(pct, 1)}%`,
                                    background: r.donations > r.gameSales
                                      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                                      : 'linear-gradient(90deg, #60a5fa, #3b82f6)',
                                    opacity: 0.8,
                                  }} />
                                </div>
                                <span className="text-[9px] w-16 text-right flex-shrink-0" style={{ color: '#e8e6f0' }}>{r.total.toLocaleString()} RWF</span>
                    </div>
                    );})}
                  </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Heart size={14} style={{ color: '#fbbf24' }} />
                          <span className="text-xs font-semibold" style={{ color: '#e8e6f0' }}>Top Requests</span>
                        </div>
                        {analytics.topRequests?.length === 0 ? (
                          <p className="text-[10px] text-center py-4" style={{ color: '#6a6a5a' }}>No request data</p>
                        ) : (
                          <div className="space-y-2">
                            {analytics.topRequests?.slice(0, 10).map((r, i) => (
                              <div key={r.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[9px] font-bold" style={{ color: i < 3 ? '#fbbf24' : '#6a6a5a' }}>#{i + 1}</span>
                                  <span className="text-[10px] truncate" style={{ color: '#e8e6f0' }}>{r.title}</span>
                                </div>
                                <span className="text-[9px] flex-shrink-0 ml-2" style={{ color: '#22c55e' }}>{r.donation_total?.toLocaleString()} RWF</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Package size={14} style={{ color: '#60a5fa' }} />
                          <span className="text-xs font-semibold" style={{ color: '#e8e6f0' }}>Top Games</span>
                        </div>
                        {analytics.topGames?.length === 0 ? (
                          <p className="text-[10px] text-center py-4" style={{ color: '#6a6a5a' }}>No game sales data</p>
                        ) : (
                          <div className="space-y-2">
                            {analytics.topGames?.slice(0, 10).map((g, i) => (
                              <div key={g.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[9px] font-bold" style={{ color: i < 3 ? '#60a5fa' : '#6a6a5a' }}>#{i + 1}</span>
                                  <span className="text-[10px] truncate" style={{ color: '#e8e6f0' }}>{g.title}</span>
                                </div>
                                <span className="text-[9px] flex-shrink-0 ml-2" style={{ color: '#60a5fa' }}>{g.revenue?.toLocaleString()} RWF</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Filter size={14} style={{ color: '#c9a84c' }} />
                        <span className="text-xs font-semibold" style={{ color: '#e8e6f0' }}>Transaction Status Breakdown</span>
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        {Object.entries(analytics.totalByStatus || {}).map(([status, count]) => {
                          const colors = { pending: '#fbbf24', completed: '#22c55e', cancelled: '#6a6a5a', refunded: '#f87171' };
                          return (
                            <div key={status} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: colors[status] || '#6a6a5a' }} />
                              <span className="text-[10px]" style={{ color: '#e8e6f0' }}>{status}: <span style={{ color: colors[status] }}>{count}</span></span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-center py-8" style={{ color: '#6a6a5a' }}>Failed to load analytics</p>
                )}
              </div>
            )}

            {tab === 'payouts' && (
              <div className="space-y-4">
                {payoutsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} style={{ color: '#c9a84c' }} className="animate-spin" />
                  </div>
                ) : payouts ? (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px]" style={{ color: '#6a6a5a' }}>
                        Total Paid Out: <span style={{ color: '#22c55e' }}>{payouts.totalPaidOut?.toLocaleString()} RWF</span>
                      </span>
                    </div>

                    {payouts.uploaders?.length > 0 ? (
                      <div className="space-y-3">
                        <span className="text-xs font-semibold" style={{ color: '#e8e6f0' }}>Game Uploaders (Premium)</span>
                        {payouts.uploaders.map(u => (
                          <div key={u.momo_number} className="p-4 rounded-xl"
                            style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium" style={{ color: '#e8e6f0' }}>MoMo: {u.momo_number}</span>
                              <span className="text-xs font-bold" style={{ color: '#22c55e' }}>{u.totalEarnings.toLocaleString()} RWF</span>
                            </div>
                            {u.games.map(g => (
                              <div key={g.id} className="flex items-center justify-between py-1">
                                <span className="text-[10px]" style={{ color: '#a8a49a' }}>{g.title}</span>
                                <span className="text-[10px]" style={{ color: '#fbbf24' }}>{g.earnings.toLocaleString()} RWF</span>
                              </div>
                            ))}
                            {u.totalEarnings > 0 && (
                              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
                                onClick={() => { setShowProcessPayout(u); setPayoutForm({ amount: String(u.totalEarnings), notes: '' }); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold mt-2"
                                style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#e8c87a' }}>
                                <DollarSign size={11} /> Process Payout
                              </motion.button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {payouts.movieUploaders?.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-xs font-semibold" style={{ color: '#e8e6f0' }}>Movie Uploaders (Gurira MB)</span>
                        {payouts.movieUploaders.map(u => (
                          <div key={u.name} className="p-4 rounded-xl"
                            style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium" style={{ color: '#e8e6f0' }}>
                                🤝 {u.name}
                                {u.momo_number && <span className="text-[10px] ml-2" style={{ color:'#6a6a5a' }}>({u.momo_number})</span>}
                              </span>
                              <span className="text-xs font-bold" style={{ color: '#22c55e' }}>{u.totalEarnings.toLocaleString()} RWF</span>
                            </div>
                            {u.movies.map(m => (
                              <div key={m.id} className="flex items-center justify-between py-1">
                                <span className="text-[10px]" style={{ color: '#a8a49a' }}>{m.title}</span>
                                <span className="text-[10px]" style={{ color: '#fbbf24' }}>{m.earnings.toLocaleString()} RWF</span>
                              </div>
                            ))}
                            {u.totalEarnings > 0 && (
                              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
                                onClick={() => { setShowProcessPayout({ momo_number: u.momo_number || u.name, totalEarnings: u.totalEarnings }); setPayoutForm({ amount: String(u.totalEarnings), notes: `Payout for ${u.name}` }); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold mt-2"
                                style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#e8c87a' }}>
                                <DollarSign size={11} /> Process Payout
                              </motion.button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {!payouts.uploaders?.length && !payouts.movieUploaders?.length && (
                      <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-[10px]" style={{ color: '#6a6a5a' }}>No uploaders with earnings yet</p>
                      </div>
                    )}

                    {showProcessPayout && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl"
                        style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.2)' }}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold" style={{ color: '#e8c87a' }}>
                            Process Payout — {showProcessPayout.momo_number}
                          </span>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setShowProcessPayout(null)}
                            className="p-1 rounded-lg" style={{ color: '#6a6a5a' }}>
                            <X size={14} />
                          </motion.button>
                        </div>
                        <div className="flex gap-3 items-end">
                          <div className="flex-1">
                            <div className="text-[9px] mb-1" style={{ color: '#6a6a5a' }}>Amount (RWF)</div>
                            <input type="number" value={payoutForm.amount}
                              onChange={e => setPayoutForm(f => ({ ...f, amount: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.06)', color: '#e8e6f0' }} />
                          </div>
                          <div className="flex-1">
                            <div className="text-[9px] mb-1" style={{ color: '#6a6a5a' }}>Notes (optional)</div>
                            <input type="text" value={payoutForm.notes}
                              onChange={e => setPayoutForm(f => ({ ...f, notes: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.06)', color: '#e8e6f0' }} />
                          </div>
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={handleProcessPayout} disabled={payoutActionLoading || !payoutForm.amount}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
                            style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#e8c87a' }}>
                            {payoutActionLoading ? <Loader2 size={12} /> : <DollarSign size={12} />} Create
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {payouts.payouts?.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <span className="text-xs font-semibold" style={{ color: '#e8e6f0' }}>Payout History</span>
                        {payouts.payouts.map(p => (
                          <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background: p.status === 'paid' ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.1)' }}>
                              <DollarSign size={14} style={{ color: p.status === 'paid' ? '#22c55e' : '#fbbf24' }} />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-medium" style={{ color: '#e8e6f0' }}>
                                {p.amount.toLocaleString()} RWF
                                <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded`}
                                  style={{ background: p.status === 'paid' ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.1)', color: p.status === 'paid' ? '#22c55e' : '#fbbf24' }}>
                                  {p.status}
                                </span>
                              </div>
                              <div className="text-[9px]" style={{ color: '#6a6a5a' }}>
                                {p.uploader_phone && <span>{p.uploader_phone} • </span>}
                                {p.notes && <span>{p.notes} • </span>}
                                {new Date(p.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            {p.status === 'pending' && (
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => handleMarkPaid(p.id)} disabled={actionLoading === `payout_${p.id}`}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-semibold"
                                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                                {actionLoading === `payout_${p.id}` ? <Loader2 size={10} /> : <CheckCircle2 size={10} />} Mark Paid
                              </motion.button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-center py-8" style={{ color: '#6a6a5a' }}>Failed to load payouts</p>
                )}
              </div>
            )}

            {tab === 'contacts' && (
              <div className="space-y-3">
                {!data?.contacts || data.contacts.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: '#6a6a5a' }}>No messages</p>
                ) : (
                  data.contacts.map((c, i) => (
                    <div key={c.id || i} className="p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-start gap-2 mb-2">
                        <Mail size={12} style={{ color: '#3b82f6', marginTop: 2 }} />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium" style={{ color: '#3b82f6' }}>{c.name}</span>
                          <span className="text-[10px] ml-2" style={{ color: '#6a6a5a' }}>{c.email}</span>
                          {c.created_at && <span className="text-[9px] ml-2" style={{ color: '#4a4a3a' }}>{new Date(c.created_at).toLocaleDateString()}</span>}
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={async () => {
                            if (!confirm('Delete this message?')) return;
                            setActionLoading(`contact_${c.id}`);
                            try {
                              await doAdminRequest('/api/admin/contacts', 'DELETE', { id: c.id });
                              await refresh();
                            } catch (err) { setError(err.message); }
                            finally { setActionLoading(null); }
                          }}
                          disabled={actionLoading === `contact_${c.id}`}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] flex-shrink-0"
                          style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                          {actionLoading === `contact_${c.id}` ? <Loader2 size={10} /> : <Trash2 size={10} />}
                        </motion.button>
                      </div>
                      {c.subject && <div className="text-xs mb-1" style={{ color: '#c9a84c' }}>{c.subject}</div>}
                      <p className="text-xs leading-relaxed" style={{ color: '#a8a49a' }}>{c.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'news' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px]" style={{ color: '#6a6a5a' }}>Total: <span style={{ color:'#e8e6f0' }}>{data?.allNews?.length || 0}</span> news posts</span>
                </div>
                {data?.allNews?.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: '#6a6a5a' }}>No news posts</p>
                ) : data?.allNews?.map(n => (
                  <div key={n.id} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {n.image_url && <img src={n.image_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-snug" style={{ color: '#e8e6f0' }}>{n.title}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: '#6a6a5a' }}>
                        {n.author_name} <span style={{ color:'#4a4a3a' }}>•</span> {n.category}
                      </div>
                      <div className="text-[10px] mt-1 flex gap-3 flex-wrap" style={{ color: '#4a4a3a' }}>
                        <span className={n.status === 'approved' ? 'text-green-400' : n.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}>
                          {n.status || 'pending'}
                        </span>
                        <span>{n.likes || 0} likes</span>
                        {n.publisher_momo && <span style={{ color:'#22c55e' }}>Tips enabled</span>}
                        <span>{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      {n.status !== 'approved' && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleApproveNews(n.id)} disabled={actionLoading === `news_${n.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                          {actionLoading === `news_${n.id}` ? <Loader2 size={11} /> : <CheckCircle2 size={11} />} Approve
                        </motion.button>
                      )}
                      {n.status !== 'rejected' && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleRejectNews(n.id)} disabled={actionLoading === `news_${n.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                          <XCircle size={11} /> Reject
                        </motion.button>
                      )}
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteNews(n.id)} disabled={actionLoading === `delnews_${n.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                        {actionLoading === `delnews_${n.id}` ? <Loader2 size={11} /> : <Trash2 size={11} />} Delete
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'shop' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px]" style={{ color: '#6a6a5a' }}>Total: <span style={{ color:'#e8e6f0' }}>{data?.allShop?.length || 0}</span> listings</span>
                </div>
                {data?.allShop?.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: '#6a6a5a' }}>No shop listings</p>
                ) : data?.allShop?.map(s => (
                  <div key={s.id} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {s.image_url && <img src={s.image_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-snug" style={{ color: '#e8e6f0' }}>{s.title}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: '#6a6a5a' }}>
                        {s.seller_name} <span style={{ color:'#4a4a3a' }}>•</span> {s.category}
                      </div>
                      <div className="text-[10px] mt-1 flex gap-3 flex-wrap" style={{ color: '#4a4a3a' }}>
                        <span className={s.status === 'active' ? 'text-green-400' : 'text-yellow-500'}>
                          {s.status}
                        </span>
                        {s.price && <span style={{ color:'#fbbf24' }}>{s.price}</span>}
                        <span style={{ color:'#25d366' }}>WA: {s.seller_whatsapp}</span>
                        <span>{new Date(s.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      {s.status === 'active' ? (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleMarkSold(s.id)} disabled={actionLoading === `shop_${s.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                          style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)', color: '#eab308' }}>
                          {actionLoading === `shop_${s.id}` ? <Loader2 size={11} /> : <CheckCircle2 size={11} />} Mark Sold
                        </motion.button>
                      ) : (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleReactivateShop(s.id)} disabled={actionLoading === `shop_${s.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                          {actionLoading === `shop_${s.id}` ? <Loader2 size={11} /> : <RotateCcw size={11} />} Reactivate
                        </motion.button>
                      )}
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteShopItem(s.id)} disabled={actionLoading === `delshop_${s.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                        {actionLoading === `delshop_${s.id}` ? <Loader2 size={11} /> : <Trash2 size={11} />} Delete
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'subscriptions' && (
              <div className="space-y-3">
                {subLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} style={{ color: '#c9a84c' }} className="animate-spin" />
                  </div>
                ) : subscriptions.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: '#6a6a5a' }}>No subscriptions yet</p>
                ) : (
                  <div className="space-y-2">
                    {(() => {
                      const active = subscriptions.filter(s => s.status === 'active');
                      const expired = subscriptions.filter(s => {
                        if (s.status !== 'active') return false;
                        return s.expires_at && new Date(s.expires_at) <= new Date();
                      });
                      const pending = subscriptions.filter(s => s.status === 'pending');
                      return (
                        <div className="flex gap-4 mb-3 p-3 rounded-xl" style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <span className="text-[10px]" style={{ color: '#6a6a5a' }}>Total: <span style={{ color: '#e8e6f0' }}>{subscriptions.length}</span></span>
                          <span className="text-[10px]" style={{ color: '#6a6a5a' }}>Active: <span style={{ color: '#22c55e' }}>{active.length - expired.length}</span></span>
                          <span className="text-[10px]" style={{ color: '#6a6a5a' }}>Expired: <span style={{ color: '#f87171' }}>{expired.length}</span></span>
                          <span className="text-[10px]" style={{ color: '#6a6a5a' }}>Pending: <span style={{ color: '#fbbf24' }}>{pending.length}</span></span>
                        </div>
                      );
                    })()}
                    <span className="text-[10px]" style={{ color: '#6a6a5a' }}>{subscriptions.length} subscription(s)</span>
                    {subscriptions.map(sub => {
                      const isExpired = sub.status === 'active' && sub.expires_at && new Date(sub.expires_at) <= new Date();
                      const actualStatus = isExpired ? 'expired' : sub.status;
                      const aC = isExpired ? '#f87171' : sub.status === 'active' ? '#22c55e' : sub.status === 'pending' ? '#fbbf24' : '#6a6a5a';
                      const aBg = isExpired ? 'rgba(239,68,68,0.03)' : sub.status === 'active' ? 'rgba(34,197,94,0.03)' : sub.status === 'pending' ? 'rgba(251,191,36,0.04)' : 'rgba(14,14,22,0.6)';
                      const aBd = isExpired ? 'rgba(239,68,68,0.12)' : sub.status === 'active' ? 'rgba(34,197,94,0.12)' : sub.status === 'pending' ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)';
                      return (
                      <div key={sub.id} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: aBg, border: `1px solid ${aBd}` }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${aC}15` }}>
                          <Crown size={16} style={{ color: aC }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium" style={{ color: '#e8e6f0' }}>
                            Pro
                            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded`}
                              style={{ background: `${aC}15`, color: aC }}>
                              {actualStatus}
                            </span>
                            {sub.expires_at && sub.status === 'active' && (
                              <span className="ml-1 text-[10px]" style={{ color: isExpired ? '#f87171' : '#6a6a5a' }}>
                                Expires: {new Date(sub.expires_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px]" style={{ color: '#6a6a5a' }}>
                            User: {subUserMap[sub.user_id] || sub.user_id?.slice(0, 8)}
                            {sub.phone && <span> • Phone: <span style={{ color: '#fbbf24' }}>{sub.phone}</span></span>}
                            {sub.amount && <span> • {sub.amount.toLocaleString()} RWF</span>}
                            {sub.tx_ref && <span> • Ref: <span style={{ color: '#38bdf8' }}>{sub.tx_ref.slice(0, 12)}</span></span>}
                            <span> • {new Date(sub.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {sub.status === 'pending' && (
                            <>
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={async () => {
                                  setActionLoading(`sub_${sub.id}`);
                                  try {
                                    const token = (await supabase.auth.getSession()).data.session?.access_token;
                                    const res = await fetch('/api/admin/approve-subscription', {
                                      method: 'POST',
                                      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ subscription_id: sub.id, action: 'approve' }),
                                    });
                                    const result = await res.json();
                                    if (!res.ok) throw new Error(result.error || 'Approve failed');
                                    await loadSubscriptions();
                                  } catch (err) { setError(err.message); }
                                  finally { setActionLoading(null); }
                                }}
                                disabled={actionLoading === `sub_${sub.id}`}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                                {actionLoading === `sub_${sub.id}` ? <Loader2 size={12} /> : <CheckCircle2 size={12} />} Approve
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={async () => {
                                  setActionLoading(`subrej_${sub.id}`);
                                  try {
                                    const token = (await supabase.auth.getSession()).data.session?.access_token;
                                    const res = await fetch('/api/admin/approve-subscription', {
                                      method: 'POST',
                                      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ subscription_id: sub.id, action: 'reject' }),
                                    });
                                    const result = await res.json();
                                    if (!res.ok) throw new Error(result.error || 'Reject failed');
                                    await loadSubscriptions();
                                  } catch (err) { setError(err.message); }
                                  finally { setActionLoading(null); }
                                }}
                                disabled={actionLoading === `subrej_${sub.id}`}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                                {actionLoading === `subrej_${sub.id}` ? <Loader2 size={12} /> : <XCircle size={12} />} Reject
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                    );})}
                  </div>
                )}
              </div>
            )}

            {tab === 'admins' && (
              <div className="space-y-4">
                <form onSubmit={handleAddAdmin} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(201,168,76,0.15)' }}>
                  <UserPlus size={16} style={{ color: '#c9a84c', flexShrink: 0 }} />
                  <input type="email" className="input-dark flex-1 px-3 py-2 rounded-lg text-sm" value={addAdminEmail}
                    onChange={e => setAddAdminEmail(e.target.value)} placeholder="Enter email to add admin" />
                  <motion.button type="submit" disabled={addAdminLoading || !addAdminEmail.trim()} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#e8c87a' }}>
                    {addAdminLoading ? <Loader2 size={12} /> : <Plus size={12} />} Add
                  </motion.button>
                </form>

                {addAdminError && (
                  <div className="px-4 py-2 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                    {addAdminError}
                  </div>
                )}
                {addAdminSuccess && (
                  <div className="px-4 py-2 rounded-xl text-xs" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}>
                    {addAdminSuccess}
                  </div>
                )}

                {data?.admins?.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: '#6a6a5a' }}>No admins yet</p>
                ) : (
                  <div className="space-y-2">
                    {data?.admins?.map(a => (
                      <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                          <Shield size={14} style={{ color: '#f87171' }} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm" style={{ color: '#e8e6f0' }}>{a.email}</div>
                          <div className="text-[10px]" style={{ color: '#6a6a5a' }}>Added {new Date(a.created_at).toLocaleDateString()}</div>
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleRemoveAdmin(a.id)} disabled={actionLoading === `admin_${a.id}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold"
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                          {actionLoading === `admin_${a.id}` ? <Loader2 size={11} /> : <Trash2 size={11} />} Remove
                        </motion.button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
