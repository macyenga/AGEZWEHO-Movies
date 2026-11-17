import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SEOHead from '../components/SEOHead';
import { useAuth } from '../contexts/AuthContext';
import CinematicBackground from '../components/CinematicBackground';
import AddMovieForm from '../components/AddMovieForm';
import AdminOverview from '../components/admin/AdminOverview';
import AdminAnalyticsPanel from '../components/admin/AdminAnalyticsPanel';
import {
  ComingSoonForm,
  GameForm,
  RequestForm,
  NewsForm,
  ShopForm,
  ManualDonationForm,
  GrantSubscriptionForm,
} from '../components/admin/AdminCategoryForms';
import { supabase } from '../lib/supabase';
import {
  computeAdminSummary,
  filterAdminMovies,
  filterAdminGames,
  filterAdminRequests,
  filterAdminNews,
  filterAdminShop,
  filterAdminDonations,
  filterAdminSubscriptions,
  filterAdminContacts,
  buildTransactionsCsv,
} from '../lib/admin-helpers';
import {
  Shield, Film, Wallet, Mail, Users, Heart, CalendarClock,
  CheckCircle2, XCircle, Loader2, Trash2, Plus, UserPlus, Edit3, List, ArrowLeft,
  Package, BarChart3, DollarSign, Search, RotateCcw, Crown, Newspaper, ShoppingBag,
  LayoutDashboard, Star, Rocket, Download, RefreshCw, ExternalLink, X, AlertCircle, Eye,
} from 'lucide-react';

const TAB_GROUPS = [
  {
    group: 'Workspace',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    group: 'Content & Catalog',
    items: [
      { id: 'movies', label: 'Pending Uploads', icon: Film },
      { id: 'all-movies', label: 'All Agasobanuye', icon: List },
      { id: 'coming-soon', label: 'Coming Soon', icon: CalendarClock },
      { id: 'premium', label: 'Games & Premium', icon: Package },
      { id: 'requests', label: 'Movie Requests', icon: Heart },
      { id: 'news', label: 'News & Amakuru', icon: Newspaper },
      { id: 'shop', label: 'Shop Listings', icon: ShoppingBag },
    ],
  },
  {
    group: 'Finance & Users',
    items: [
      { id: 'transactions', label: 'Transactions', icon: Wallet },
      { id: 'donations', label: 'Donations', icon: Heart },
      { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
      { id: 'payouts', label: 'Payouts', icon: DollarSign },
      { id: 'contacts', label: 'Messages', icon: Mail },
      { id: 'admins', label: 'Admins & Users', icon: Users },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap((g) => g.items);

async function fetchAdminData(token) {
  const res = await fetch('/api/admin', { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

function StatusBadge({ label, tone = 'muted' }) {
  const palette = {
    green: { bg: 'rgba(34,197,94,0.12)', bd: 'rgba(34,197,94,0.28)', fg: '#22c55e' },
    amber: { bg: 'rgba(251,191,36,0.12)', bd: 'rgba(251,191,36,0.28)', fg: '#fbbf24' },
    red: { bg: 'rgba(239,68,68,0.12)', bd: 'rgba(239,68,68,0.28)', fg: '#f87171' },
    blue: { bg: 'rgba(59,130,246,0.12)', bd: 'rgba(59,130,246,0.28)', fg: '#60a5fa' },
    gold: { bg: 'rgba(201,168,76,0.14)', bd: 'rgba(201,168,76,0.3)', fg: '#e8c87a' },
    muted: { bg: 'rgba(255,255,255,0.06)', bd: 'rgba(255,255,255,0.12)', fg: '#8e8a7e' },
  };
  const c = palette[tone] || palette.muted;
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded capitalize whitespace-nowrap"
      style={{ background: c.bg, border: `1px solid ${c.bd}`, color: c.fg }}
    >
      {label}
    </span>
  );
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmKey, setConfirmKey] = useState(null);

  // Movies & Pending states
  const [selectedPendingIds, setSelectedPendingIds] = useState([]);
  const [movieSearch, setMovieSearch] = useState('');
  const [movieStatusFilter, setMovieStatusFilter] = useState('all');
  const [movieGenreFilter, setMovieGenreFilter] = useState('all');
  const [movieFeaturedFilter, setMovieFeaturedFilter] = useState('all');
  const [editingMovie, setEditingMovie] = useState(null);
  const [creatingMovie, setCreatingMovie] = useState(false);
  const [movieFormLoading, setMovieFormLoading] = useState(false);

  // Coming soon states
  const [csSearch, setCsSearch] = useState('');
  const [creatingCs, setCreatingCs] = useState(false);
  const [editingCs, setEditingCs] = useState(null);
  const [csLoading, setCsLoading] = useState(false);

  // Games states
  const [gameSearch, setGameSearch] = useState('');
  const [gameStatusFilter, setGameStatusFilter] = useState('all');
  const [gameTierFilter, setGameTierFilter] = useState('all');
  const [creatingGame, setCreatingGame] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [gameFormLoading, setGameFormLoading] = useState(false);

  // Requests states
  const [reqSearch, setReqSearch] = useState('');
  const [reqStatusFilter, setReqStatusFilter] = useState('all');
  const [creatingReq, setCreatingReq] = useState(false);
  const [editingReq, setEditingReq] = useState(null);
  const [reqFormLoading, setReqFormLoading] = useState(false);

  // News states
  const [newsSearch, setNewsSearch] = useState('');
  const [newsStatusFilter, setNewsStatusFilter] = useState('all');
  const [creatingNews, setCreatingNews] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [newsFormLoading, setNewsFormLoading] = useState(false);

  // Shop states
  const [shopSearch, setShopSearch] = useState('');
  const [shopStatusFilter, setShopStatusFilter] = useState('all');
  const [creatingShop, setCreatingShop] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [shopFormLoading, setShopFormLoading] = useState(false);

  // Transactions states
  const [txSearch, setTxSearch] = useState('');
  const [txFilter, setTxFilter] = useState('');
  const [txList, setTxList] = useState([]);
  const [txUserMap, setTxUserMap] = useState({});
  const [txLoading, setTxLoading] = useState(false);
  const [showManualTx, setShowManualTx] = useState(false);
  const [manualTxForm, setManualTxForm] = useState({ amount: '', phone: '', donor_email: '', request_id: '', game_id: '' });
  const [manualTxLoading, setManualTxLoading] = useState(false);

  // Donations states
  const [donSearch, setDonSearch] = useState('');
  const [donStatusFilter, setDonStatusFilter] = useState('all');
  const [creatingDonation, setCreatingDonation] = useState(false);
  const [donationFormLoading, setDonationFormLoading] = useState(false);

  // Subscriptions states
  const [subscriptions, setSubscriptions] = useState([]);
  const [subUserMap, setSubUserMap] = useState({});
  const [subLoading, setSubLoading] = useState(false);
  const [subSearch, setSubSearch] = useState('');
  const [subStatusFilter, setSubStatusFilter] = useState('all');
  const [creatingSub, setCreatingSub] = useState(false);
  const [subFormLoading, setSubFormLoading] = useState(false);

  // Analytics & Payouts states
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('daily');
  const [payouts, setPayouts] = useState(null);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [showProcessPayout, setShowProcessPayout] = useState(null);
  const [payoutForm, setPayoutForm] = useState({ amount: '', notes: '' });
  const [payoutActionLoading, setPayoutActionLoading] = useState(false);

  // Contacts states
  const [contactSearch, setContactSearch] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState('all');

  // Admins states
  const [addAdminEmail, setAddAdminEmail] = useState('');
  const [addAdminLoading, setAddAdminLoading] = useState(false);

  const notifySuccess = (msg) => {
    setActionError('');
    setActionSuccess(msg);
  };
  const notifyError = (msg) => {
    setActionSuccess('');
    setActionError(msg || 'Action failed');
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login?redirect=/admin');
      return;
    }

    const load = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (!token) throw new Error('No session');
        const result = await fetchAdminData(token);
        setData(result);
      } catch (err) {
        if (err.message === 'Unauthorized') {
          router.push('/games');
          return;
        }
        setLoadError(err.message || 'Failed to load admin console');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, authLoading]);

  const refresh = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) return;
    setRefreshing(true);
    try {
      const result = await fetchAdminData(token);
      setData(result);
      setConfirmKey(null);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setRefreshing(false);
    }
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
    } catch {} finally {
      setTxLoading(false);
    }
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
    } catch {} finally {
      setAnalyticsLoading(false);
    }
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
    } catch {} finally {
      setPayoutsLoading(false);
    }
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
    } catch {} finally {
      setSubLoading(false);
    }
  };

  useEffect(() => { if (tab === 'transactions') loadTransactions(); }, [tab, txFilter]);
  useEffect(() => { if (tab === 'analytics') loadAnalytics(); }, [tab, analyticsPeriod]);
  useEffect(() => { if (tab === 'payouts') loadPayouts(); }, [tab]);
  useEffect(() => { if (tab === 'subscriptions') loadSubscriptions(); }, [tab]);

  const summary = useMemo(() => computeAdminSummary({
    allMovies: data?.allMovies || [],
    pendingMovies: data?.pendingMovies || [],
    allGames: data?.allGames || [],
    allRequests: data?.allRequests || [],
    allNews: data?.allNews || [],
    allShop: data?.allShop || [],
    comingSoon: data?.comingSoon || [],
    pendingTransactions: data?.pendingTransactions || [],
    completedTransactions: data?.completedTransactions || [],
    completedDonations: data?.completedDonations || [],
    subscriptions: subscriptions.length > 0 ? subscriptions : (data?.subscriptions || []),
    contacts: data?.contacts || [],
    admins: data?.admins || [],
  }), [data, subscriptions]);

  const movieGenres = useMemo(() => {
    const set = new Set((data?.allMovies || []).map((m) => m.genre).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [data]);

  const filteredMovies = useMemo(() => filterAdminMovies(data?.allMovies || [], {
    search: movieSearch,
    status: movieStatusFilter,
    genre: movieGenreFilter,
    featured: movieFeaturedFilter,
  }), [data, movieSearch, movieStatusFilter, movieGenreFilter, movieFeaturedFilter]);

  const filteredComingSoon = useMemo(() => {
    const list = data?.comingSoon || [];
    const q = csSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) =>
      [c.title, c.genre, c.interpreter, c.releaseDate, c.type].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [data, csSearch]);

  const filteredGames = useMemo(() => filterAdminGames(data?.allGames || [], {
    search: gameSearch,
    status: gameStatusFilter,
    tier: gameTierFilter,
  }), [data, gameSearch, gameStatusFilter, gameTierFilter]);

  const filteredRequests = useMemo(() => filterAdminRequests(data?.allRequests || [], {
    search: reqSearch,
    status: reqStatusFilter,
  }), [data, reqSearch, reqStatusFilter]);

  const filteredNews = useMemo(() => filterAdminNews(data?.allNews || [], {
    search: newsSearch,
    status: newsStatusFilter,
  }), [data, newsSearch, newsStatusFilter]);

  const filteredShop = useMemo(() => filterAdminShop(data?.allShop || [], {
    search: shopSearch,
    status: shopStatusFilter,
  }), [data, shopSearch, shopStatusFilter]);

  const filteredDonations = useMemo(() => filterAdminDonations(data?.completedDonations || [], {
    search: donSearch,
    status: donStatusFilter,
  }), [data, donSearch, donStatusFilter]);

  const filteredSubscriptions = useMemo(() => filterAdminSubscriptions(
    subscriptions,
    { search: subSearch, status: subStatusFilter },
    { ...(data?.userMap || {}), ...subUserMap }
  ), [subscriptions, subSearch, subStatusFilter, data, subUserMap]);

  const filteredContacts = useMemo(() => filterAdminContacts(data?.contacts || [], {
    search: contactSearch,
    status: contactStatusFilter,
  }), [data, contactSearch, contactStatusFilter]);

  const mergedUserMap = useMemo(() => ({ ...(data?.userMap || {}), ...subUserMap }), [data, subUserMap]);

  const selectTab = (nextTab) => {
    setTab(nextTab);
    setConfirmKey(null);
    setActionError('');
    setActionSuccess('');
  };

  const handleQuickCreate = (targetTab, createType) => {
    selectTab(targetTab);
    if (createType === 'movie') { setEditingMovie(null); setCreatingMovie(true); }
    if (createType === 'coming-soon') { setEditingCs(null); setCreatingCs(true); }
    if (createType === 'game') { setEditingGame(null); setCreatingGame(true); }
    if (createType === 'request') { setEditingReq(null); setCreatingReq(true); }
    if (createType === 'news') { setEditingNews(null); setCreatingNews(true); }
    if (createType === 'shop') { setEditingShop(null); setCreatingShop(true); }
    if (createType === 'transaction') { setShowManualTx(true); }
    if (createType === 'subscription') { setCreatingSub(true); }
  };

  // --- Movie handlers ---
  const handleUpdateMovie = async (id, updates, successMsg = 'Movie updated') => {
    setActionLoading(`movie_${id}`);
    try {
      await doAdminRequest('/api/admin/movies', 'PATCH', { id, ...updates });
      await refresh();
      notifySuccess(successMsg);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkMovies = async (bulkAction) => {
    if (selectedPendingIds.length === 0) return;
    setActionLoading(`bulk_${bulkAction}`);
    try {
      await doAdminRequest('/api/admin/movies', 'POST', {
        action: 'bulk',
        ids: selectedPendingIds,
        bulkAction,
      });
      const count = selectedPendingIds.length;
      setSelectedPendingIds([]);
      await refresh();
      notifySuccess(`Updated ${count} movie(s)`);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteMovie = async (id) => {
    setActionLoading(`del_${id}`);
    try {
      await doAdminRequest('/api/admin/movies', 'DELETE', { id });
      await refresh();
      notifySuccess('Movie deleted');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateMovie = async (movieData) => {
    setMovieFormLoading(true);
    try {
      await doAdminRequest('/api/admin/movies', 'POST', movieData);
      setCreatingMovie(false);
      await refresh();
      notifySuccess('Movie added to catalog');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setMovieFormLoading(false);
    }
  };

  const handleSaveEditedMovie = async (updates) => {
    if (!editingMovie) return;
    setMovieFormLoading(true);
    try {
      await doAdminRequest('/api/admin/movies', 'PATCH', { id: editingMovie.id, ...updates });
      setEditingMovie(null);
      await refresh();
      notifySuccess('Movie changes saved');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setMovieFormLoading(false);
    }
  };

  // --- Coming Soon handlers ---
  const handleSaveComingSoon = async (payload) => {
    setCsLoading(true);
    try {
      if (editingCs) {
        await doAdminRequest('/api/admin/coming-soon', 'PATCH', { id: editingCs.id, ...payload });
        setEditingCs(null);
        notifySuccess('Upcoming release updated');
      } else {
        await doAdminRequest('/api/admin/coming-soon', 'POST', payload);
        setCreatingCs(false);
        notifySuccess('Added to Coming Soon');
      }
      await refresh();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setCsLoading(false);
    }
  };

  const handlePublishComingSoon = async (id) => {
    setActionLoading(`pubcs_${id}`);
    try {
      await doAdminRequest('/api/admin/coming-soon?action=publish', 'POST', { id });
      await refresh();
      notifySuccess('Release published live to Agasobanuye catalog');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteComingSoon = async (id) => {
    setActionLoading(`delcs_${id}`);
    try {
      await doAdminRequest('/api/admin/coming-soon', 'DELETE', { id });
      await refresh();
      notifySuccess('Removed from Coming Soon');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // --- Games handlers ---
  const handleSaveGame = async (payload) => {
    setGameFormLoading(true);
    try {
      if (editingGame) {
        await doAdminRequest('/api/admin/games', 'PATCH', { id: editingGame.id, ...payload });
        setEditingGame(null);
        notifySuccess('Game item updated');
      } else {
        await doAdminRequest('/api/admin/games', 'POST', payload);
        setCreatingGame(false);
        notifySuccess('Game item created');
      }
      await refresh();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setGameFormLoading(false);
    }
  };

  const handlePatchGame = async (id, updates, msg) => {
    setActionLoading(`game_${id}`);
    try {
      await doAdminRequest('/api/admin/games', 'PATCH', { id, ...updates });
      await refresh();
      notifySuccess(msg);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteGame = async (id) => {
    setActionLoading(`delgame_${id}`);
    try {
      await doAdminRequest('/api/admin/games', 'DELETE', { id });
      await refresh();
      notifySuccess('Game item deleted');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // --- Requests handlers ---
  const handleSaveRequest = async (payload) => {
    setReqFormLoading(true);
    try {
      if (editingReq) {
        await doAdminRequest('/api/admin/requests', 'PATCH', { id: editingReq.id, ...payload });
        setEditingReq(null);
        notifySuccess('Request updated');
      } else {
        await doAdminRequest('/api/admin/requests', 'POST', payload);
        setCreatingReq(false);
        notifySuccess('Request created');
      }
      await refresh();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setReqFormLoading(false);
    }
  };

  const handleFulfillRequest = async (id, fulfilled) => {
    setActionLoading(`req_${id}`);
    try {
      await doAdminRequest('/api/admin/requests', 'PATCH', { id, fulfilled });
      await refresh();
      notifySuccess(fulfilled ? 'Marked fulfilled' : 'Reopened request');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRequest = async (id) => {
    setActionLoading(`delreq_${id}`);
    try {
      await doAdminRequest('/api/admin/requests', 'DELETE', { id });
      await refresh();
      notifySuccess('Request deleted');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // --- News handlers ---
  const handleSaveNews = async (payload) => {
    setNewsFormLoading(true);
    try {
      if (editingNews) {
        await doAdminRequest('/api/admin/news', 'PATCH', { id: editingNews.id, ...payload });
        setEditingNews(null);
        notifySuccess('News post updated');
      } else {
        await doAdminRequest('/api/admin/news', 'POST', payload);
        setCreatingNews(false);
        notifySuccess('News post published');
      }
      await refresh();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setNewsFormLoading(false);
    }
  };

  const handlePatchNewsStatus = async (id, status) => {
    setActionLoading(`news_${id}`);
    try {
      await doAdminRequest('/api/admin/news', 'PATCH', { id, status });
      await refresh();
      notifySuccess(`News post ${status}`);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteNews = async (id) => {
    setActionLoading(`delnews_${id}`);
    try {
      await doAdminRequest('/api/admin/news', 'DELETE', { id });
      await refresh();
      notifySuccess('News post deleted');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // --- Shop handlers ---
  const handleSaveShop = async (payload) => {
    setShopFormLoading(true);
    try {
      if (editingShop) {
        await doAdminRequest('/api/admin/shop', 'PATCH', { id: editingShop.id, ...payload });
        setEditingShop(null);
        notifySuccess('Shop listing updated');
      } else {
        await doAdminRequest('/api/admin/shop', 'POST', payload);
        setCreatingShop(false);
        notifySuccess('Shop listing created');
      }
      await refresh();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setShopFormLoading(false);
    }
  };

  const handleShopStatus = async (id, status) => {
    setActionLoading(`shop_${id}`);
    try {
      await doAdminRequest('/api/admin/shop', 'PATCH', { id, status });
      await refresh();
      notifySuccess(`Listing marked ${status}`);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteShopItem = async (id) => {
    setActionLoading(`delshop_${id}`);
    try {
      await doAdminRequest('/api/admin/shop', 'DELETE', { id });
      await refresh();
      notifySuccess('Shop listing deleted');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // --- Transactions handlers ---
  const handleExportTransactionsCsv = () => {
    const csv = buildTransactionsCsv(txList, txUserMap);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agasobanuye-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notifySuccess(`Exported ${txList.length} transaction(s) to CSV`);
  };

  const handleCancelTx = async (tx_ref) => {
    setActionLoading(`cancel_${tx_ref}`);
    try {
      await doAdminRequest('/api/admin/transactions?action=cancel', 'POST', { tx_ref });
      await loadTransactions();
      await refresh();
      notifySuccess('Transaction cancelled');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefundTx = async (tx_ref) => {
    setActionLoading(`refund_${tx_ref}`);
    try {
      await doAdminRequest('/api/admin/transactions?action=refund', 'POST', { tx_ref });
      await loadTransactions();
      await refresh();
      notifySuccess('Transaction refunded');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
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
      notifySuccess('Manual transaction created and confirmed');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setManualTxLoading(false);
    }
  };

  // --- Donations handlers ---
  const handleCreateDonation = async (payload) => {
    setDonationFormLoading(true);
    try {
      await doAdminRequest('/api/admin/donations', 'POST', payload);
      setCreatingDonation(false);
      await refresh();
      notifySuccess('Donation recorded');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setDonationFormLoading(false);
    }
  };

  const handleToggleDonationConfirm = async (id, confirmed) => {
    setActionLoading(`donation_${id}`);
    try {
      await doAdminRequest('/api/admin/donations', 'PATCH', { id, confirmed });
      await refresh();
      notifySuccess(confirmed ? 'Donation confirmed' : 'Donation marked pending');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDonation = async (id) => {
    setActionLoading(`deldon_${id}`);
    try {
      await doAdminRequest('/api/admin/donations', 'DELETE', { id });
      await refresh();
      notifySuccess('Donation deleted');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // --- Subscriptions handlers ---
  const handleGrantSubscription = async (payload) => {
    setSubFormLoading(true);
    try {
      await doAdminRequest('/api/admin/subscriptions', 'POST', payload);
      setCreatingSub(false);
      await loadSubscriptions();
      await refresh();
      notifySuccess(`Pro activated for ${payload.email}`);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setSubFormLoading(false);
    }
  };

  const handleApproveRejectSub = async (subId, action) => {
    setActionLoading(`sub_${subId}`);
    try {
      await doAdminRequest('/api/admin/approve-subscription', 'POST', { subscription_id: subId, action });
      await loadSubscriptions();
      await refresh();
      notifySuccess(action === 'approve' ? 'Pro subscription approved' : 'Subscription rejected');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePatchSub = async (subId, body, msg) => {
    setActionLoading(`sub_${subId}`);
    try {
      await doAdminRequest('/api/admin/subscriptions', 'PATCH', { id: subId, ...body });
      await loadSubscriptions();
      await refresh();
      notifySuccess(msg);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSub = async (subId) => {
    setActionLoading(`delsub_${subId}`);
    try {
      await doAdminRequest('/api/admin/subscriptions', 'DELETE', { id: subId });
      await loadSubscriptions();
      await refresh();
      notifySuccess('Subscription record deleted');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // --- Payouts handlers ---
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
      notifySuccess('Payout queued as pending');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setPayoutActionLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    setActionLoading(`payout_${id}`);
    try {
      await doAdminRequest('/api/admin/payouts?action=mark-paid', 'POST', { id });
      await loadPayouts();
      notifySuccess('Payout marked paid');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePayout = async (id) => {
    setActionLoading(`delpay_${id}`);
    try {
      await doAdminRequest('/api/admin/payouts', 'DELETE', { id });
      await loadPayouts();
      notifySuccess('Pending payout removed');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // --- Contacts handlers ---
  const handleToggleContactResolved = async (id, resolved) => {
    setActionLoading(`contact_${id}`);
    try {
      await doAdminRequest('/api/admin/contacts', 'PATCH', { id, resolved });
      await refresh();
      notifySuccess(resolved ? 'Message marked resolved' : 'Message reopened');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteContact = async (id) => {
    setActionLoading(`delcontact_${id}`);
    try {
      await doAdminRequest('/api/admin/contacts', 'DELETE', { id });
      await refresh();
      notifySuccess('Message deleted');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // --- Admins & Users handlers ---
  const handleAddAdmin = async (emailOverride) => {
    const email = (emailOverride || addAdminEmail).trim();
    if (!email) return;
    setAddAdminLoading(true);
    try {
      await doAdminRequest('/api/admin/admins', 'POST', { email });
      if (!emailOverride) setAddAdminEmail('');
      await refresh();
      notifySuccess(`Admin access granted to ${email}`);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setAddAdminLoading(false);
    }
  };

  const handleRemoveAdmin = async (id) => {
    setActionLoading(`admin_${id}`);
    try {
      await doAdminRequest('/api/admin/admins', 'DELETE', { id });
      await refresh();
      notifySuccess('Admin removed');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getTabBadge = (tabId) => {
    if (tabId === 'movies' && summary.pendingMovies > 0) return { count: summary.pendingMovies, bg: '#ef4444', fg: '#fff' };
    if (tabId === 'transactions' && summary.pendingTransactions > 0) return { count: summary.pendingTransactions, bg: '#22c55e', fg: '#000' };
    if (tabId === 'subscriptions' && summary.pendingSubscriptions > 0) return { count: summary.pendingSubscriptions, bg: '#fbbf24', fg: '#000' };
    if (tabId === 'contacts' && summary.unresolvedContacts > 0) return { count: summary.unresolvedContacts, bg: '#3b82f6', fg: '#fff' };
    return null;
  };

  const renderConfirmDelete = (key, label, onConfirm, busy) => {
    if (confirmKey === key) {
      return (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => { setConfirmKey(null); onConfirm(); }}
            disabled={busy}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
            style={{ background: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.5)', color: '#fecaca' }}
          >
            {busy ? <Loader2 size={11} className="animate-spin" /> : 'Confirm?'}
          </button>
          <button
            type="button"
            onClick={() => setConfirmKey(null)}
            className="px-2 py-1.5 rounded-lg text-xs"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#8e8a7e' }}
          >
            No
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setConfirmKey(key)}
        disabled={busy}
        aria-label={label}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.22)', color: '#f87171' }}
      >
        <Trash2 size={12} /> Delete
      </button>
    );
  };

  const activeTabMeta = ALL_TABS.find((t) => t.id === tab) || ALL_TABS[0];

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead title="Admin Console" noIndex />
      <CinematicBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-28">
        {/* Top Workspace Header */}
        <header
          className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-white/[0.08]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}
            >
              <Shield size={19} style={{ color: '#e8c87a' }} />
            </div>
            <div className="min-w-0">
              <h1 className="font-cinzel text-xl font-semibold truncate" style={{ fontFamily: 'Cinzel,serif', color: '#e8c87a' }}>
                Admin Console
              </h1>
              <p className="text-xs truncate" style={{ color: '#8e8a7e' }}>
                {user?.email || 'Administrator'} · {activeTabMeta.label}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing || loading}
              className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
            </button>
            <Link
              href="/"
              className="btn-primary flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap"
            >
              <ExternalLink size={13} /> View Site
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} style={{ color: '#c9a84c' }} className="animate-spin" />
          </div>
        ) : loadError ? (
          <div className="text-center py-16 p-6 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <p className="text-sm mb-4" style={{ color: '#f87171' }}>{loadError}</p>
            <button type="button" onClick={() => router.reload()} className="btn-primary px-4 py-2 rounded-lg text-xs">
              Retry
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Desktop Left Category Sidebar */}
            <aside
              className="hidden lg:block w-64 shrink-0 rounded-xl p-3 space-y-5 sticky top-20"
              style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {TAB_GROUPS.map((grp) => (
                <div key={grp.group}>
                  <div className="px-2.5 mb-1.5 text-[11px] font-semibold tracking-wider uppercase" style={{ color: '#6a6a5a' }}>
                    {grp.group}
                  </div>
                  <nav className="space-y-1">
                    {grp.items.map((item) => {
                      const Icon = item.icon;
                      const badge = getTabBadge(item.id);
                      const active = tab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selectTab(item.id)}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium"
                          style={active
                            ? { backgroundColor: 'rgba(201,168,76,0.14)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(201,168,76,0.32)', color: '#e8c87a' }
                            : { backgroundColor: 'transparent', borderWidth: '1px', borderStyle: 'solid', borderColor: 'transparent', color: '#b8b4a8' }}
                        >
                          <span className="flex items-center gap-2.5 truncate">
                            <Icon size={14} />
                            <span className="truncate">{item.label}</span>
                          </span>
                          {badge && (
                            <span
                              className="text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full shrink-0"
                              style={{ background: badge.bg, color: badge.fg }}
                            >
                              {badge.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </aside>

            {/* Mobile & Tablet Category Selector */}
            <div className="w-full lg:hidden space-y-2">
              <label htmlFor="mobile-admin-tab" className="sr-only">Admin Category</label>
              <select
                id="mobile-admin-tab"
                value={tab}
                onChange={(e) => selectTab(e.target.value)}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm font-medium"
              >
                {TAB_GROUPS.map((grp) => (
                  <optgroup key={grp.group} label={grp.group} style={{ background: '#0f0f16' }}>
                    {grp.items.map((item) => {
                      const badge = getTabBadge(item.id);
                      return (
                        <option key={item.id} value={item.id} style={{ background: '#0f0f16' }}>
                          {item.label}{badge ? ` (${badge.count})` : ''}
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Main Content Viewport */}
            <main className="flex-1 min-w-0 w-full space-y-4">
              {/* Dismissible Feedback Banners (Never Replace Dashboard!) */}
              {actionError && (
                <div
                  role="alert"
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.32)', color: '#fecaca' }}
                >
                  <span className="flex items-center gap-2"><AlertCircle size={15} style={{ color: '#f87171' }} /> {actionError}</span>
                  <button type="button" onClick={() => setActionError('')} aria-label="Dismiss error">
                    <X size={14} />
                  </button>
                </div>
              )}
              {actionSuccess && (
                <div
                  role="status"
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#bbf7d0' }}
                >
                  <span className="flex items-center gap-2"><CheckCircle2 size={15} style={{ color: '#22c55e' }} /> {actionSuccess}</span>
                  <button type="button" onClick={() => setActionSuccess('')} aria-label="Dismiss notice">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* OVERVIEW */}
              {tab === 'overview' && (
                <AdminOverview
                  summary={summary}
                  registeredUsersCount={data?.registeredUsers?.length || 0}
                  onNavigate={selectTab}
                  onQuickCreate={handleQuickCreate}
                />
              )}

              {/* ANALYTICS */}
              {tab === 'analytics' && (
                <AdminAnalyticsPanel
                  analytics={analytics}
                  loading={analyticsLoading}
                  period={analyticsPeriod}
                  onChangePeriod={setAnalyticsPeriod}
                />
              )}

              {/* PENDING UPLOADS (BULK + PER-ITEM MODERATION) */}
              {tab === 'movies' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>Pending Agasobanuye Uploads</h2>
                      <p className="text-xs" style={{ color: '#6a6a5a' }}>Approve, reject, edit metadata, or batch-moderate uploaded titles</p>
                    </div>
                    {data?.pendingMovies?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg cursor-pointer" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#b8b4a8' }}>
                          <input
                            type="checkbox"
                            checked={selectedPendingIds.length === data.pendingMovies.length && data.pendingMovies.length > 0}
                            onChange={(e) => setSelectedPendingIds(e.target.checked ? data.pendingMovies.map((m) => m.id) : [])}
                            className="w-3.5 h-3.5 accent-amber-400"
                          />
                          Select All ({data.pendingMovies.length})
                        </label>
                        {selectedPendingIds.length > 0 && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleBulkMovies('approve')}
                              disabled={Boolean(actionLoading)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                              style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}
                            >
                              Approve ({selectedPendingIds.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBulkMovies('reject')}
                              disabled={Boolean(actionLoading)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)', color: '#f87171' }}
                            >
                              Reject ({selectedPendingIds.length})
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {!data?.pendingMovies || data.pendingMovies.length === 0 ? (
                    <div className="p-8 rounded-xl text-center" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-xs mb-3" style={{ color: '#8e8a7e' }}>No pending Agasobanuye submissions awaiting review.</p>
                      <button type="button" onClick={() => setTab('all-movies')} className="btn-primary px-4 py-2 rounded-lg text-xs">
                        Browse All Agasobanuye
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {data.pendingMovies.map((m) => (
                        <div key={m.id} className="flex flex-wrap items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <input
                            type="checkbox"
                            aria-label={`Select ${m.title}`}
                            checked={selectedPendingIds.includes(m.id)}
                            onChange={(e) => setSelectedPendingIds((prev) => e.target.checked ? [...prev, m.id] : prev.filter((id) => id !== m.id))}
                            className="w-4 h-4 accent-amber-400 shrink-0"
                          />
                          {m.poster_url && <img src={m.poster_url} alt={m.title} referrerPolicy="no-referrer" className="w-10 h-14 rounded-lg object-cover shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate" style={{ color: '#e8e6f0' }}>{m.title}</div>
                            <div className="text-xs mt-0.5" style={{ color: '#8e8a7e' }}>
                              {m.type || 'Movie'} · {m.year || '—'} · {m.language || 'Kinyarwanda'}
                              {m.uploaded_by ? ` · by ${m.uploaded_by}` : ''}
                              {m.uploader_momo_number ? ` · MoMo ${m.uploader_momo_number}` : ''}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleUpdateMovie(m.id, { status: 'approved' }, `Approved "${m.title}"`)}
                              disabled={actionLoading === `movie_${m.id}`}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                              style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}
                            >
                              {actionLoading === `movie_${m.id}` ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateMovie(m.id, { status: 'rejected' }, `Rejected "${m.title}"`)}
                              disabled={actionLoading === `movie_${m.id}`}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
                            >
                              <XCircle size={12} /> Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => { setEditingMovie(m); setTab('all-movies'); }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}
                            >
                              <Edit3 size={12} /> Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ALL AGASOBANUYE MOVIES */}
              {tab === 'all-movies' && (
                <div className="space-y-4">
                  {editingMovie ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => setEditingMovie(null)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-4"
                        style={{ color: '#b8b4a8' }}
                      >
                        <ArrowLeft size={14} /> Back to All Agasobanuye
                      </button>
                      <AddMovieForm
                        key={editingMovie.id}
                        initial={editingMovie}
                        onSave={handleSaveEditedMovie}
                        onCancel={() => setEditingMovie(null)}
                        loading={movieFormLoading}
                      />
                    </div>
                  ) : creatingMovie ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => setCreatingMovie(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-4"
                        style={{ color: '#b8b4a8' }}
                      >
                        <ArrowLeft size={14} /> Back to All Agasobanuye
                      </button>
                      <AddMovieForm
                        initial={null}
                        onSave={handleCreateMovie}
                        onCancel={() => setCreatingMovie(false)}
                        loading={movieFormLoading}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h2 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>
                            All Agasobanuye ({filteredMovies.length} / {data?.allMovies?.length || 0})
                          </h2>
                          <p className="text-xs" style={{ color: '#6a6a5a' }}>Search, filter, feature on homepage hero, edit links, or moderate status</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCreatingMovie(true)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                          style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.32)', color: '#22c55e' }}
                        >
                          <Plus size={13} /> Add Movie
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <Search size={14} style={{ color: '#6a6a5a' }} />
                          <input
                            type="text"
                            value={movieSearch}
                            onChange={(e) => setMovieSearch(e.target.value)}
                            placeholder="Search title, uploader..."
                            className="bg-transparent text-xs outline-none w-full"
                            style={{ color: '#e8e6f0' }}
                          />
                        </div>
                        <select value={movieStatusFilter} onChange={(e) => setMovieStatusFilter(e.target.value)} className="input-dark px-3 py-2 rounded-lg text-xs">
                          <option value="all" style={{ background: '#0f0f16' }}>All Statuses</option>
                          <option value="approved" style={{ background: '#0f0f16' }}>Approved</option>
                          <option value="pending" style={{ background: '#0f0f16' }}>Pending</option>
                          <option value="rejected" style={{ background: '#0f0f16' }}>Rejected</option>
                        </select>
                        <select value={movieGenreFilter} onChange={(e) => setMovieGenreFilter(e.target.value)} className="input-dark px-3 py-2 rounded-lg text-xs">
                          {movieGenres.map((g) => (
                            <option key={g} value={g} style={{ background: '#0f0f16' }}>
                              {g === 'all' ? 'All Genres' : g}
                            </option>
                          ))}
                        </select>
                        <select value={movieFeaturedFilter} onChange={(e) => setMovieFeaturedFilter(e.target.value)} className="input-dark px-3 py-2 rounded-lg text-xs">
                          <option value="all" style={{ background: '#0f0f16' }}>All Visibility</option>
                          <option value="featured" style={{ background: '#0f0f16' }}>Featured Only</option>
                          <option value="standard" style={{ background: '#0f0f16' }}>Standard Only</option>
                        </select>
                      </div>

                      {filteredMovies.length === 0 ? (
                        <p className="text-xs text-center py-10" style={{ color: '#6a6a5a' }}>No movies match the current filters.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {filteredMovies.map((m) => (
                            <div key={m.id} className="flex flex-wrap items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              {m.poster_url && <img src={m.poster_url} alt={m.title} referrerPolicy="no-referrer" className="w-10 h-14 rounded-lg object-cover shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium truncate" style={{ color: '#e8e6f0' }}>{m.title}</span>
                                  <StatusBadge
                                    label={m.status || 'approved'}
                                    tone={m.status === 'approved' ? 'green' : m.status === 'pending' ? 'amber' : 'red'}
                                  />
                                  {m.featured && <StatusBadge label="Featured" tone="gold" />}
                                </div>
                                <div className="text-xs mt-1 flex flex-wrap items-center gap-2" style={{ color: '#8e8a7e' }}>
                                  <span>{m.type || 'Movie'}</span>
                                  <span>·</span>
                                  <span>{m.year || '—'}</span>
                                  <span>·</span>
                                  <span>{m.genre || 'Action'}</span>
                                  <span>·</span>
                                  <span className="inline-flex items-center gap-1 tabular-nums"><Eye size={11} /> {(m.views || 0).toLocaleString()}</span>
                                  {m.uploaded_by && <><span>·</span><span>by {m.uploaded_by}</span></>}
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateMovie(m.id, { featured: !m.featured }, m.featured ? `Unfeatured "${m.title}"` : `Featured "${m.title}"`)}
                                  disabled={actionLoading === `movie_${m.id}`}
                                  aria-label={m.featured ? `Unfeature ${m.title}` : `Feature ${m.title}`}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                  style={m.featured
                                    ? { background: 'rgba(201,168,76,0.16)', border: '1px solid rgba(201,168,76,0.35)', color: '#e8c87a' }
                                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#8e8a7e' }}
                                >
                                  <Star size={12} fill={m.featured ? '#e8c87a' : 'none'} /> {m.featured ? 'Featured' : 'Feature'}
                                </button>
                                {m.status !== 'approved' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateMovie(m.id, { status: 'approved' }, `Approved "${m.title}"`)}
                                    disabled={actionLoading === `movie_${m.id}`}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.28)', color: '#22c55e' }}
                                  >
                                    Approve
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateMovie(m.id, { status: 'rejected' }, `Hid "${m.title}"`)}
                                    disabled={actionLoading === `movie_${m.id}`}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                    style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}
                                  >
                                    Unpublish
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setEditingMovie(m)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                  style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}
                                >
                                  <Edit3 size={12} /> Edit
                                </button>
                                {renderConfirmDelete(`movie_${m.id}`, `Delete ${m.title}`, () => handleDeleteMovie(m.id), actionLoading === `del_${m.id}`)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* COMING SOON */}
              {tab === 'coming-soon' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>
                        Coming Soon Releases ({filteredComingSoon.length})
                      </h2>
                      <p className="text-xs" style={{ color: '#6a6a5a' }}>Manage homepage upcoming releases and promote them live when ready</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setEditingCs(null); setCreatingCs((v) => !v); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                      style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.32)', color: '#22c55e' }}
                    >
                      <Plus size={13} /> Add Upcoming Release
                    </button>
                  </div>

                  {(creatingCs || editingCs) && (
                    <ComingSoonForm
                      key={editingCs?.id || 'new-cs'}
                      initial={editingCs}
                      loading={csLoading}
                      onSave={handleSaveComingSoon}
                      onCancel={() => { setCreatingCs(false); setEditingCs(null); }}
                    />
                  )}

                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg max-w-sm" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Search size={14} style={{ color: '#6a6a5a' }} />
                    <input
                      type="text"
                      value={csSearch}
                      onChange={(e) => setCsSearch(e.target.value)}
                      placeholder="Search upcoming titles or interpreters..."
                      className="bg-transparent text-xs outline-none w-full"
                      style={{ color: '#e8e6f0' }}
                    />
                  </div>

                  {filteredComingSoon.length === 0 ? (
                    <p className="text-xs text-center py-8" style={{ color: '#6a6a5a' }}>No upcoming releases found.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredComingSoon.map((item) => (
                        <div key={item.id} className="flex flex-wrap items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {item.poster_url && <img src={item.poster_url} alt={item.title} referrerPolicy="no-referrer" className="w-10 h-14 rounded-lg object-cover shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium truncate" style={{ color: '#e8e6f0' }}>{item.title}</span>
                              <StatusBadge label={item.releaseDate || 'TBA'} tone="gold" />
                            </div>
                            <div className="text-xs mt-1" style={{ color: '#8e8a7e' }}>
                              {item.type || 'Movie'} · {item.genre || 'Action'} · {item.interpreter || 'Agasobanuye.rw'}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handlePublishComingSoon(item.id)}
                              disabled={actionLoading === `pubcs_${item.id}`}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                              style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}
                            >
                              {actionLoading === `pubcs_${item.id}` ? <Loader2 size={12} className="animate-spin" /> : <Rocket size={12} />} Release Now
                            </button>
                            <button
                              type="button"
                              onClick={() => { setCreatingCs(false); setEditingCs(item); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}
                            >
                              <Edit3 size={12} /> Edit
                            </button>
                            {renderConfirmDelete(`cs_${item.id}`, `Delete ${item.title}`, () => handleDeleteComingSoon(item.id), actionLoading === `delcs_${item.id}`)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* GAMES & PREMIUM */}
              {tab === 'premium' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>
                        Games & Premium Catalog ({filteredGames.length})
                      </h2>
                      <p className="text-xs" style={{ color: '#6a6a5a' }}>
                        Total game earnings: <span className="tabular-nums font-semibold" style={{ color: '#fbbf24' }}>
                          {Object.values(data?.gameEarnings || {}).reduce((a, b) => a + b, 0).toLocaleString()} RWF
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setEditingGame(null); setCreatingGame((v) => !v); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                      style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.32)', color: '#22c55e' }}
                    >
                      <Plus size={13} /> Add Game / Item
                    </button>
                  </div>

                  {(creatingGame || editingGame) && (
                    <GameForm
                      key={editingGame?.id || 'new-game'}
                      initial={editingGame}
                      loading={gameFormLoading}
                      onSave={handleSaveGame}
                      onCancel={() => { setCreatingGame(false); setEditingGame(null); }}
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Search size={14} style={{ color: '#6a6a5a' }} />
                      <input type="text" value={gameSearch} onChange={(e) => setGameSearch(e.target.value)}
                        placeholder="Search games, MoMo..." className="bg-transparent text-xs outline-none w-full" style={{ color: '#e8e6f0' }} />
                    </div>
                    <select value={gameStatusFilter} onChange={(e) => setGameStatusFilter(e.target.value)} className="input-dark px-3 py-2 rounded-lg text-xs">
                      <option value="all" style={{ background: '#0f0f16' }}>All Statuses</option>
                      <option value="approved" style={{ background: '#0f0f16' }}>Approved</option>
                      <option value="pending" style={{ background: '#0f0f16' }}>Pending</option>
                      <option value="rejected" style={{ background: '#0f0f16' }}>Rejected</option>
                    </select>
                    <select value={gameTierFilter} onChange={(e) => setGameTierFilter(e.target.value)} className="input-dark px-3 py-2 rounded-lg text-xs">
                      <option value="all" style={{ background: '#0f0f16' }}>All Tiers</option>
                      <option value="premium" style={{ background: '#0f0f16' }}>Premium Paid Only</option>
                      <option value="free" style={{ background: '#0f0f16' }}>Free Only</option>
                    </select>
                  </div>

                  {filteredGames.length === 0 ? (
                    <p className="text-xs text-center py-8" style={{ color: '#6a6a5a' }}>No games match the current filters.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredGames.map((g) => {
                        const earned = data?.gameEarnings?.[g.id] || 0;
                        return (
                          <div key={g.id} className="flex flex-wrap items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {g.cover_url && <img src={g.cover_url} alt={g.title} referrerPolicy="no-referrer" className="w-10 h-14 rounded-lg object-cover shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium truncate" style={{ color: '#e8e6f0' }}>{g.title}</span>
                                <StatusBadge
                                  label={g.status || 'approved'}
                                  tone={g.status === 'pending' ? 'amber' : g.status === 'rejected' ? 'red' : 'green'}
                                />
                                {g.premium ? <StatusBadge label={`${(g.price || 500).toLocaleString()} RWF`} tone="gold" /> : <StatusBadge label="Free" tone="blue" />}
                              </div>
                              <div className="text-xs mt-1 flex flex-wrap gap-2" style={{ color: '#8e8a7e' }}>
                                <span>{g.category || 'Action'}</span>
                                {g.version && <><span>·</span><span>v{g.version}</span></>}
                                <span>·</span>
                                <span className="tabular-nums">Earned: {earned.toLocaleString()} RWF</span>
                                {g.uploader_momo_number && <><span>·</span><span>MoMo {g.uploader_momo_number}</span></>}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handlePatchGame(g.id, { premium: !g.premium, price: !g.premium ? (g.price || 500) : 0 }, !g.premium ? 'Marked Premium' : 'Marked Free')}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.28)', color: '#e8c87a' }}
                              >
                                {g.premium ? 'Make Free' : 'Make Premium'}
                              </button>
                              {g.status !== 'approved' && (
                                <button type="button" onClick={() => handlePatchGame(g.id, { status: 'approved' }, 'Approved item')}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.28)', color: '#22c55e' }}>
                                  Approve
                                </button>
                              )}
                              {g.status !== 'rejected' && (
                                <button type="button" onClick={() => handlePatchGame(g.id, { status: 'rejected' }, 'Rejected item')}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                  style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
                                  Reject
                                </button>
                              )}
                              <button type="button" onClick={() => { setCreatingGame(false); setEditingGame(g); }}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
                                <Edit3 size={12} /> Edit
                              </button>
                              {renderConfirmDelete(`game_${g.id}`, `Delete ${g.title}`, () => handleDeleteGame(g.id), actionLoading === `delgame_${g.id}`)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* MOVIE REQUESTS */}
              {tab === 'requests' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>
                        Movie Requests ({filteredRequests.length})
                      </h2>
                      <p className="text-xs" style={{ color: '#6a6a5a' }}>Create, edit goals/votes, mark fulfilled, or clean up user requests</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setEditingReq(null); setCreatingReq((v) => !v); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                      style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.32)', color: '#22c55e' }}
                    >
                      <Plus size={13} /> Add Request
                    </button>
                  </div>

                  {(creatingReq || editingReq) && (
                    <RequestForm
                      key={editingReq?.id || 'new-req'}
                      initial={editingReq}
                      loading={reqFormLoading}
                      onSave={handleSaveRequest}
                      onCancel={() => { setCreatingReq(false); setEditingReq(null); }}
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Search size={14} style={{ color: '#6a6a5a' }} />
                      <input type="text" value={reqSearch} onChange={(e) => setReqSearch(e.target.value)}
                        placeholder="Search requested titles or requesters..." className="bg-transparent text-xs outline-none w-full" style={{ color: '#e8e6f0' }} />
                    </div>
                    <select value={reqStatusFilter} onChange={(e) => setReqStatusFilter(e.target.value)} className="input-dark px-3 py-2 rounded-lg text-xs">
                      <option value="all" style={{ background: '#0f0f16' }}>All Requests</option>
                      <option value="pending" style={{ background: '#0f0f16' }}>Open / Pending</option>
                      <option value="fulfilled" style={{ background: '#0f0f16' }}>Fulfilled</option>
                    </select>
                  </div>

                  {filteredRequests.length === 0 ? (
                    <p className="text-xs text-center py-8" style={{ color: '#6a6a5a' }}>No requests match filters.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredRequests.map((r) => (
                        <div key={r.id} className="flex flex-wrap items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium truncate" style={{ color: '#e8e6f0' }}>{r.title}</span>
                              <StatusBadge label={r.fulfilled ? 'Fulfilled' : 'Open'} tone={r.fulfilled ? 'green' : 'amber'} />
                            </div>
                            <div className="text-xs mt-1 flex flex-wrap gap-2" style={{ color: '#8e8a7e' }}>
                              <span className="tabular-nums">{r.votes || 0} votes</span>
                              <span>·</span>
                              <span className="tabular-nums" style={{ color: '#e8c87a' }}>
                                {(r.donation_total || 0).toLocaleString()} / {(r.donation_goal || 5000).toLocaleString()} RWF
                              </span>
                              {r.requested_by && <><span>·</span><span>by {r.requested_by}</span></>}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button type="button" onClick={() => handleFulfillRequest(r.id, !r.fulfilled)} disabled={actionLoading === `req_${r.id}`}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                              style={r.fulfilled
                                ? { background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }
                                : { background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                              {r.fulfilled ? 'Reopen' : 'Fulfill'}
                            </button>
                            <button type="button" onClick={() => { setCreatingReq(false); setEditingReq(r); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
                              <Edit3 size={12} /> Edit
                            </button>
                            {renderConfirmDelete(`req_${r.id}`, `Delete ${r.title}`, () => handleDeleteRequest(r.id), actionLoading === `delreq_${r.id}`)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* NEWS & AMAKURU */}
              {tab === 'news' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>News & Amakuru ({filteredNews.length})</h2>
                      <p className="text-xs" style={{ color: '#6a6a5a' }}>Publish original stories or moderate community articles</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setEditingNews(null); setCreatingNews((v) => !v); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                      style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.32)', color: '#22c55e' }}
                    >
                      <Plus size={13} /> Publish News
                    </button>
                  </div>

                  {(creatingNews || editingNews) && (
                    <NewsForm
                      key={editingNews?.id || 'new-news'}
                      initial={editingNews}
                      loading={newsFormLoading}
                      onSave={handleSaveNews}
                      onCancel={() => { setCreatingNews(false); setEditingNews(null); }}
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Search size={14} style={{ color: '#6a6a5a' }} />
                      <input type="text" value={newsSearch} onChange={(e) => setNewsSearch(e.target.value)}
                        placeholder="Search headlines, authors..." className="bg-transparent text-xs outline-none w-full" style={{ color: '#e8e6f0' }} />
                    </div>
                    <select value={newsStatusFilter} onChange={(e) => setNewsStatusFilter(e.target.value)} className="input-dark px-3 py-2 rounded-lg text-xs">
                      <option value="all" style={{ background: '#0f0f16' }}>All Statuses</option>
                      <option value="approved" style={{ background: '#0f0f16' }}>Approved</option>
                      <option value="pending" style={{ background: '#0f0f16' }}>Pending</option>
                      <option value="rejected" style={{ background: '#0f0f16' }}>Rejected</option>
                    </select>
                  </div>

                  {filteredNews.length === 0 ? (
                    <p className="text-xs text-center py-8" style={{ color: '#6a6a5a' }}>No news posts found.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredNews.map((n) => (
                        <div key={n.id} className="flex flex-wrap items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {n.image_url && <img src={n.image_url} alt={n.title} referrerPolicy="no-referrer" className="w-14 h-14 rounded-lg object-cover shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium" style={{ color: '#e8e6f0' }}>{n.title}</span>
                              <StatusBadge
                                label={n.status || 'pending'}
                                tone={n.status === 'approved' ? 'green' : n.status === 'rejected' ? 'red' : 'amber'}
                              />
                            </div>
                            <div className="text-xs mt-1" style={{ color: '#8e8a7e' }}>
                              {n.author_name || 'News'} · {n.category || 'Amakuru'} · {n.likes || 0} likes
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {n.status !== 'approved' && (
                              <button type="button" onClick={() => handlePatchNewsStatus(n.id, 'approved')}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                                Approve
                              </button>
                            )}
                            {n.status !== 'rejected' && (
                              <button type="button" onClick={() => handlePatchNewsStatus(n.id, 'rejected')}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
                                Reject
                              </button>
                            )}
                            <button type="button" onClick={() => { setCreatingNews(false); setEditingNews(n); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
                              <Edit3 size={12} /> Edit
                            </button>
                            {renderConfirmDelete(`news_${n.id}`, `Delete ${n.title}`, () => handleDeleteNews(n.id), actionLoading === `delnews_${n.id}`)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SHOP LISTINGS */}
              {tab === 'shop' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>Shop Listings ({filteredShop.length})</h2>
                      <p className="text-xs" style={{ color: '#6a6a5a' }}>Create products, edit prices/WhatsApp contacts, or mark inventory sold</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setEditingShop(null); setCreatingShop((v) => !v); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                      style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.32)', color: '#22c55e' }}
                    >
                      <Plus size={13} /> Add Listing
                    </button>
                  </div>

                  {(creatingShop || editingShop) && (
                    <ShopForm
                      key={editingShop?.id || 'new-shop'}
                      initial={editingShop}
                      loading={shopFormLoading}
                      onSave={handleSaveShop}
                      onCancel={() => { setCreatingShop(false); setEditingShop(null); }}
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Search size={14} style={{ color: '#6a6a5a' }} />
                      <input type="text" value={shopSearch} onChange={(e) => setShopSearch(e.target.value)}
                        placeholder="Search products, sellers..." className="bg-transparent text-xs outline-none w-full" style={{ color: '#e8e6f0' }} />
                    </div>
                    <select value={shopStatusFilter} onChange={(e) => setShopStatusFilter(e.target.value)} className="input-dark px-3 py-2 rounded-lg text-xs">
                      <option value="all" style={{ background: '#0f0f16' }}>All Listings</option>
                      <option value="active" style={{ background: '#0f0f16' }}>Active</option>
                      <option value="sold" style={{ background: '#0f0f16' }}>Sold</option>
                    </select>
                  </div>

                  {filteredShop.length === 0 ? (
                    <p className="text-xs text-center py-8" style={{ color: '#6a6a5a' }}>No shop listings found.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredShop.map((s) => (
                        <div key={s.id} className="flex flex-wrap items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {s.image_url && <img src={s.image_url} alt={s.title} referrerPolicy="no-referrer" className="w-14 h-14 rounded-lg object-cover shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium" style={{ color: '#e8e6f0' }}>{s.title}</span>
                              <StatusBadge label={s.status || 'active'} tone={s.status === 'active' ? 'green' : 'amber'} />
                            </div>
                            <div className="text-xs mt-1 flex flex-wrap gap-2" style={{ color: '#8e8a7e' }}>
                              <span style={{ color: '#e8c87a' }}>{s.price ? `${s.price} ${s.currency || 'RWF'}` : 'Negotiable'}</span>
                              <span>·</span>
                              <span>{s.seller_name}</span>
                              <span>·</span>
                              <span>WA {s.seller_whatsapp}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {s.status === 'active' ? (
                              <button type="button" onClick={() => handleShopStatus(s.id, 'sold')}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.28)', color: '#fbbf24' }}>
                                Mark Sold
                              </button>
                            ) : (
                              <button type="button" onClick={() => handleShopStatus(s.id, 'active')}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                                <RotateCcw size={12} /> Reactivate
                              </button>
                            )}
                            <button type="button" onClick={() => { setCreatingShop(false); setEditingShop(s); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
                              <Edit3 size={12} /> Edit
                            </button>
                            {renderConfirmDelete(`shop_${s.id}`, `Delete ${s.title}`, () => handleDeleteShopItem(s.id), actionLoading === `delshop_${s.id}`)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TRANSACTIONS */}
              {tab === 'transactions' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>Transactions Ledger ({txList.length})</h2>
                      <p className="text-xs" style={{ color: '#6a6a5a' }}>Search, filter, confirm MoMo payments, refund, create manual entries, or export CSV</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={handleExportTransactionsCsv} disabled={txList.length === 0}
                        className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap disabled:opacity-40">
                        <Download size={13} /> Export CSV
                      </button>
                      <button type="button" onClick={() => setShowManualTx((v) => !v)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                        style={{ background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                        <Plus size={13} /> Manual Tx
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Search size={14} style={{ color: '#6a6a5a' }} />
                      <input type="text" value={txSearch} onChange={(e) => setTxSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') loadTransactions(); }}
                        placeholder="Search ref, phone, email..." className="flex-1 bg-transparent text-xs outline-none" style={{ color: '#e8e6f0' }} />
                      <button type="button" onClick={loadTransactions} className="px-2.5 py-1 rounded text-xs font-medium"
                        style={{ background: 'rgba(201,168,76,0.14)', color: '#e8c87a' }}>
                        Search
                      </button>
                    </div>
                    <select value={txFilter} onChange={(e) => setTxFilter(e.target.value)} className="input-dark px-3 py-2 rounded-lg text-xs">
                      <option value="" style={{ background: '#0f0f16' }}>All Statuses</option>
                      <option value="pending" style={{ background: '#0f0f16' }}>Pending</option>
                      <option value="completed" style={{ background: '#0f0f16' }}>Completed</option>
                      <option value="cancelled" style={{ background: '#0f0f16' }}>Cancelled</option>
                      <option value="refunded" style={{ background: '#0f0f16' }}>Refunded</option>
                    </select>
                  </div>

                  {showManualTx && (
                    <form onSubmit={handleManualTx} className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(14,14,22,0.88)', border: '1px solid rgba(59,130,246,0.28)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold" style={{ color: '#60a5fa' }}>Create Manual Confirmed Transaction</span>
                        <button type="button" onClick={() => setShowManualTx(false)}><X size={14} style={{ color: '#8e8a7e' }} /></button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <input type="number" required placeholder="Amount (RWF)" value={manualTxForm.amount}
                          onChange={(e) => setManualTxForm((f) => ({ ...f, amount: e.target.value }))} className="input-dark px-3 py-2 rounded-lg text-xs" />
                        <input type="text" placeholder="Phone (optional)" value={manualTxForm.phone}
                          onChange={(e) => setManualTxForm((f) => ({ ...f, phone: e.target.value }))} className="input-dark px-3 py-2 rounded-lg text-xs" />
                        <input type="email" placeholder="Donor email (optional)" value={manualTxForm.donor_email}
                          onChange={(e) => setManualTxForm((f) => ({ ...f, donor_email: e.target.value }))} className="input-dark px-3 py-2 rounded-lg text-xs" />
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" disabled={manualTxLoading} className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold">
                          {manualTxLoading ? 'Saving...' : 'Create & Confirm'}
                        </button>
                      </div>
                    </form>
                  )}

                  {txLoading ? (
                    <div className="flex justify-center py-8"><Loader2 size={20} style={{ color: '#c9a84c' }} className="animate-spin" /></div>
                  ) : txList.length === 0 ? (
                    <p className="text-xs text-center py-8" style={{ color: '#6a6a5a' }}>No transactions found.</p>
                  ) : (
                    <div className="space-y-2">
                      {txList.map((tx) => (
                        <div key={tx.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold tabular-nums" style={{ color: '#e8e6f0' }}>{(tx.amount || 0).toLocaleString()} RWF</span>
                              <StatusBadge label={tx.status} tone={tx.status === 'completed' ? 'green' : tx.status === 'pending' ? 'amber' : tx.status === 'refunded' ? 'red' : 'muted'} />
                            </div>
                            <div className="text-xs mt-1" style={{ color: '#8e8a7e' }}>
                              Ref {tx.tx_ref}
                              {tx.phone ? ` · ${tx.phone}` : ''}
                              {tx.user_id ? ` · ${txUserMap[tx.user_id] || tx.user_id}` : ''}
                              {tx.donor_email ? ` · ${tx.donor_email}` : ''}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 shrink-0">
                            {tx.status === 'pending' && (
                              <>
                                <button type="button" onClick={async () => {
                                  setActionLoading(`confirm_${tx.id}`);
                                  try {
                                    await doAdminRequest('/api/admin/confirm-transaction', 'POST', { tx_ref: tx.tx_ref });
                                    await loadTransactions();
                                    await refresh();
                                    notifySuccess('Transaction confirmed');
                                  } catch (err) { notifyError(err.message); } finally { setActionLoading(null); }
                                }} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                                  style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                                  Confirm
                                </button>
                                <button type="button" onClick={() => handleCancelTx(tx.tx_ref)}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                                  Cancel
                                </button>
                              </>
                            )}
                            {tx.status === 'completed' && (
                              <button type="button" onClick={() => handleRefundTx(tx.tx_ref)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                                <RotateCcw size={12} /> Refund
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DONATIONS */}
              {tab === 'donations' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>Donations ({filteredDonations.length})</h2>
                      <p className="text-xs" style={{ color: '#6a6a5a' }}>Record manual support contributions, verify MoMo receipts, or reverse errors</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCreatingDonation((v) => !v)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                      style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.32)', color: '#22c55e' }}
                    >
                      <Plus size={13} /> Record Donation
                    </button>
                  </div>

                  {creatingDonation && (
                    <ManualDonationForm
                      requests={data?.allRequests || []}
                      loading={donationFormLoading}
                      onSave={handleCreateDonation}
                      onCancel={() => setCreatingDonation(false)}
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Search size={14} style={{ color: '#6a6a5a' }} />
                      <input type="text" value={donSearch} onChange={(e) => setDonSearch(e.target.value)}
                        placeholder="Search donor name, phone..." className="bg-transparent text-xs outline-none w-full" style={{ color: '#e8e6f0' }} />
                    </div>
                    <select value={donStatusFilter} onChange={(e) => setDonStatusFilter(e.target.value)} className="input-dark px-3 py-2 rounded-lg text-xs">
                      <option value="all" style={{ background: '#0f0f16' }}>All Donations</option>
                      <option value="confirmed" style={{ background: '#0f0f16' }}>Confirmed Only</option>
                      <option value="pending" style={{ background: '#0f0f16' }}>Pending Review</option>
                    </select>
                  </div>

                  {filteredDonations.length === 0 ? (
                    <p className="text-xs text-center py-8" style={{ color: '#6a6a5a' }}>No donations match filters.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredDonations.map((d) => {
                        const isConfirmed = d.confirmed !== false;
                        return (
                          <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold tabular-nums" style={{ color: '#e8e6f0' }}>{(d.amount || 0).toLocaleString()} RWF</span>
                                <StatusBadge label={isConfirmed ? 'Confirmed' : 'Pending'} tone={isConfirmed ? 'green' : 'amber'} />
                              </div>
                              <div className="text-xs mt-1" style={{ color: '#8e8a7e' }}>
                                {d.donor_name || 'Anonymous'}
                                {d.phone_last4 ? ` · MoMo *${d.phone_last4}` : ''}
                                {d.created_at ? ` · ${new Date(d.created_at).toLocaleDateString()}` : ''}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleDonationConfirm(d.id, !isConfirmed)}
                                disabled={actionLoading === `donation_${d.id}`}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                style={isConfirmed
                                  ? { background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }
                                  : { background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}
                              >
                                {isConfirmed ? 'Mark Pending' : 'Confirm'}
                              </button>
                              {renderConfirmDelete(`don_${d.id}`, `Delete donation ${d.id}`, () => handleDeleteDonation(d.id), actionLoading === `deldon_${d.id}`)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SUBSCRIPTIONS */}
              {tab === 'subscriptions' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>Pro Subscriptions ({filteredSubscriptions.length})</h2>
                      <p className="text-xs" style={{ color: '#6a6a5a' }}>Approve Pro upgrades, grant manual Pro access, extend expiry (+30d), or revoke</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCreatingSub((v) => !v)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                      style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.32)', color: '#22c55e' }}
                    >
                      <Plus size={13} /> Grant Pro Access
                    </button>
                  </div>

                  {creatingSub && (
                    <GrantSubscriptionForm
                      registeredUsers={data?.registeredUsers || []}
                      loading={subFormLoading}
                      onSave={handleGrantSubscription}
                      onCancel={() => setCreatingSub(false)}
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Search size={14} style={{ color: '#6a6a5a' }} />
                      <input type="text" value={subSearch} onChange={(e) => setSubSearch(e.target.value)}
                        placeholder="Search user email, phone, ref..." className="bg-transparent text-xs outline-none w-full" style={{ color: '#e8e6f0' }} />
                    </div>
                    <select value={subStatusFilter} onChange={(e) => setSubStatusFilter(e.target.value)} className="input-dark px-3 py-2 rounded-lg text-xs">
                      <option value="all" style={{ background: '#0f0f16' }}>All Subscriptions</option>
                      <option value="active" style={{ background: '#0f0f16' }}>Active</option>
                      <option value="pending" style={{ background: '#0f0f16' }}>Pending Approval</option>
                      <option value="expired" style={{ background: '#0f0f16' }}>Expired</option>
                      <option value="cancelled" style={{ background: '#0f0f16' }}>Cancelled</option>
                    </select>
                  </div>

                  {subLoading ? (
                    <div className="flex justify-center py-8"><Loader2 size={20} style={{ color: '#c9a84c' }} className="animate-spin" /></div>
                  ) : filteredSubscriptions.length === 0 ? (
                    <p className="text-xs text-center py-8" style={{ color: '#6a6a5a' }}>No subscriptions found.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredSubscriptions.map((sub) => {
                        const isExpired = sub.status === 'active' && sub.expires_at && new Date(sub.expires_at) <= new Date();
                        const effectiveStatus = isExpired ? 'expired' : (sub.status || 'pending');
                        return (
                          <div key={sub.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium" style={{ color: '#e8e6f0' }}>
                                  {mergedUserMap[sub.user_id] || sub.user_id}
                                </span>
                                <StatusBadge
                                  label={effectiveStatus}
                                  tone={effectiveStatus === 'active' ? 'green' : effectiveStatus === 'pending' ? 'amber' : effectiveStatus === 'expired' ? 'red' : 'muted'}
                                />
                              </div>
                              <div className="text-xs mt-1" style={{ color: '#8e8a7e' }}>
                                {sub.months || 1} mo · {(sub.amount || 1000).toLocaleString()} RWF
                                {sub.phone ? ` · ${sub.phone}` : ''}
                                {sub.expires_at ? ` · Expires ${new Date(sub.expires_at).toLocaleDateString()}` : ''}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              {sub.status === 'pending' && (
                                <>
                                  <button type="button" onClick={() => handleApproveRejectSub(sub.id, 'approve')}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                                    style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                                    Approve
                                  </button>
                                  <button type="button" onClick={() => handleApproveRejectSub(sub.id, 'reject')}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                                    Reject
                                  </button>
                                </>
                              )}
                              <button type="button" onClick={() => handlePatchSub(sub.id, { extend_days: 30 }, 'Extended Pro by 30 days')}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                style={{ background: 'rgba(201,168,76,0.14)', border: '1px solid rgba(201,168,76,0.3)', color: '#e8c87a' }}>
                                +30d Extend
                              </button>
                              {sub.status === 'active' ? (
                                <button type="button" onClick={() => handlePatchSub(sub.id, { status: 'cancelled' }, 'Subscription cancelled')}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                  style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
                                  Cancel
                                </button>
                              ) : (
                                <button type="button" onClick={() => handlePatchSub(sub.id, { status: 'active' }, 'Subscription activated')}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.28)', color: '#22c55e' }}>
                                  Activate
                                </button>
                              )}
                              {renderConfirmDelete(`sub_${sub.id}`, `Delete subscription ${sub.id}`, () => handleDeleteSub(sub.id), actionLoading === `delsub_${sub.id}`)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* PAYOUTS */}
              {tab === 'payouts' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>Creator Payouts Ledger</h2>
                      <p className="text-xs" style={{ color: '#6a6a5a' }}>
                        Total Paid Out: <span className="tabular-nums font-semibold" style={{ color: '#22c55e' }}>{(payouts?.totalPaidOut || 0).toLocaleString()} RWF</span>
                      </p>
                    </div>
                  </div>

                  {payoutsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 size={20} style={{ color: '#c9a84c' }} className="animate-spin" /></div>
                  ) : payouts ? (
                    <>
                      {showProcessPayout && (
                        <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(14,14,22,0.88)', border: '1px solid rgba(201,168,76,0.3)' }}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold" style={{ color: '#e8c87a' }}>Process Payout — {showProcessPayout.momo_number}</span>
                            <button type="button" onClick={() => setShowProcessPayout(null)}><X size={14} style={{ color: '#8e8a7e' }} /></button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
                            <div>
                              <label className="block text-xs mb-1" style={{ color: '#8e8a7e' }}>Amount (RWF)</label>
                              <input type="number" value={payoutForm.amount} onChange={(e) => setPayoutForm((f) => ({ ...f, amount: e.target.value }))}
                                className="input-dark w-full px-3 py-2 rounded-lg text-xs" />
                            </div>
                            <div>
                              <label className="block text-xs mb-1" style={{ color: '#8e8a7e' }}>Notes</label>
                              <input type="text" value={payoutForm.notes} onChange={(e) => setPayoutForm((f) => ({ ...f, notes: e.target.value }))}
                                className="input-dark w-full px-3 py-2 rounded-lg text-xs" />
                            </div>
                            <button type="button" onClick={handleProcessPayout} disabled={payoutActionLoading}
                              className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold">
                              {payoutActionLoading ? 'Saving...' : 'Queue Payout'}
                            </button>
                          </div>
                        </div>
                      )}

                      {payouts.movieUploaders?.length > 0 && (
                        <div className="space-y-2.5">
                          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8e8a7e' }}>Movie Uploaders</h3>
                          {payouts.movieUploaders.map((u) => (
                            <div key={u.name} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <div>
                                <div className="text-sm font-medium" style={{ color: '#e8e6f0' }}>
                                  {u.name} {u.momo_number ? `(${u.momo_number})` : ''}
                                </div>
                                <div className="text-xs mt-0.5 tabular-nums" style={{ color: '#22c55e' }}>{u.totalEarnings.toLocaleString()} RWF across {u.movies.length} title(s)</div>
                              </div>
                              <button type="button"
                                onClick={() => { setShowProcessPayout({ momo_number: u.momo_number || u.name }); setPayoutForm({ amount: String(u.totalEarnings), notes: `Payout for ${u.name}` }); }}
                                className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap">
                                Process Payout
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {payouts.uploaders?.length > 0 && (
                        <div className="space-y-2.5">
                          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8e8a7e' }}>Game Uploaders</h3>
                          {payouts.uploaders.map((u) => (
                            <div key={u.momo_number} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <div>
                                <div className="text-sm font-medium" style={{ color: '#e8e6f0' }}>MoMo {u.momo_number}</div>
                                <div className="text-xs mt-0.5 tabular-nums" style={{ color: '#22c55e' }}>{u.totalEarnings.toLocaleString()} RWF across {u.games.length} game(s)</div>
                              </div>
                              {u.totalEarnings > 0 && (
                                <button type="button"
                                  onClick={() => { setShowProcessPayout(u); setPayoutForm({ amount: String(u.totalEarnings), notes: '' }); }}
                                  className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap">
                                  Process Payout
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8e8a7e' }}>Payout History ({payouts.payouts?.length || 0})</h3>
                        {!payouts.payouts || payouts.payouts.length === 0 ? (
                          <p className="text-xs py-4" style={{ color: '#6a6a5a' }}>No payouts queued yet.</p>
                        ) : payouts.payouts.map((p) => (
                          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold tabular-nums" style={{ color: '#e8e6f0' }}>{(p.amount || 0).toLocaleString()} RWF</span>
                                <StatusBadge label={p.status} tone={p.status === 'paid' ? 'green' : 'amber'} />
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: '#8e8a7e' }}>
                                {p.uploader_phone} {p.notes ? `· ${p.notes}` : ''} · {new Date(p.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            {p.status === 'pending' && (
                              <div className="flex items-center gap-2 shrink-0">
                                <button type="button" onClick={() => handleMarkPaid(p.id)}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                                  style={{ background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                                  Mark Paid
                                </button>
                                {renderConfirmDelete(`pay_${p.id}`, `Cancel payout ${p.id}`, () => handleDeletePayout(p.id), actionLoading === `delpay_${p.id}`)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              )}

              {/* CONTACT MESSAGES */}
              {tab === 'contacts' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>Contact Messages ({filteredContacts.length})</h2>
                    <p className="text-xs" style={{ color: '#6a6a5a' }}>Reply via email, mark resolved, or remove spam inquiries</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Search size={14} style={{ color: '#6a6a5a' }} />
                      <input type="text" value={contactSearch} onChange={(e) => setContactSearch(e.target.value)}
                        placeholder="Search sender, subject, message..." className="bg-transparent text-xs outline-none w-full" style={{ color: '#e8e6f0' }} />
                    </div>
                    <select value={contactStatusFilter} onChange={(e) => setContactStatusFilter(e.target.value)} className="input-dark px-3 py-2 rounded-lg text-xs">
                      <option value="all" style={{ background: '#0f0f16' }}>All Messages</option>
                      <option value="unread" style={{ background: '#0f0f16' }}>Unread / Open</option>
                      <option value="resolved" style={{ background: '#0f0f16' }}>Resolved</option>
                    </select>
                  </div>

                  {filteredContacts.length === 0 ? (
                    <p className="text-xs text-center py-8" style={{ color: '#6a6a5a' }}>No contact messages found.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredContacts.map((c) => (
                        <div key={c.id} className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium" style={{ color: '#e8e6f0' }}>{c.name}</span>
                              <span className="text-xs" style={{ color: '#8e8a7e' }}>{c.email}</span>
                              <StatusBadge label={c.resolved ? 'Resolved' : 'Open'} tone={c.resolved ? 'green' : 'amber'} />
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {c.email && (
                                <a href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject || 'Agasobanuye.rw Support')}`}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                  style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
                                  Reply
                                </a>
                              )}
                              <button type="button" onClick={() => handleToggleContactResolved(c.id, !c.resolved)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.28)', color: '#22c55e' }}>
                                {c.resolved ? 'Reopen' : 'Mark Resolved'}
                              </button>
                              {renderConfirmDelete(`contact_${c.id}`, `Delete message from ${c.name}`, () => handleDeleteContact(c.id), actionLoading === `delcontact_${c.id}`)}
                            </div>
                          </div>
                          {c.subject && <div className="text-xs font-medium" style={{ color: '#e8c87a' }}>{c.subject}</div>}
                          <p className="text-xs leading-relaxed" style={{ color: '#b8b4a8' }}>{c.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ADMINS & REGISTERED USERS */}
              {tab === 'admins' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>Admin Access Control ({data?.admins?.length || 0})</h2>
                      <p className="text-xs" style={{ color: '#6a6a5a' }}>Grant or revoke admin console privileges (your active account is protected)</p>
                    </div>
                    <form
                      onSubmit={(e) => { e.preventDefault(); handleAddAdmin(); }}
                      className="flex flex-wrap items-center gap-3 p-4 rounded-xl"
                      style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(201,168,76,0.2)' }}
                    >
                      <UserPlus size={16} style={{ color: '#c9a84c' }} className="shrink-0" />
                      <input
                        type="email"
                        required
                        className="input-dark flex-1 min-w-[200px] px-3 py-2 rounded-lg text-xs"
                        value={addAdminEmail}
                        onChange={(e) => setAddAdminEmail(e.target.value)}
                        placeholder="Enter registered user email to grant admin..."
                      />
                      <button
                        type="submit"
                        disabled={addAdminLoading || !addAdminEmail.trim()}
                        className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                      >
                        {addAdminLoading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Grant Admin
                      </button>
                    </form>

                    <div className="space-y-2">
                      {(data?.admins || []).map((a) => {
                        const isSelf = a.email === user?.email || a.user_id === user?.id;
                        return (
                          <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div className="flex items-center gap-3">
                              <Shield size={15} style={{ color: '#e8c87a' }} />
                              <div>
                                <div className="text-sm font-medium" style={{ color: '#e8e6f0' }}>
                                  {a.email} {isSelf && <span className="text-xs ml-1" style={{ color: '#22c55e' }}>(You)</span>}
                                </div>
                                <div className="text-xs" style={{ color: '#6a6a5a' }}>Added {a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</div>
                              </div>
                            </div>
                            {!isSelf && (data?.admins?.length || 0) > 1 && (
                              renderConfirmDelete(`admin_${a.id}`, `Remove admin ${a.email}`, () => handleRemoveAdmin(a.id), actionLoading === `admin_${a.id}`)
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Registered Users Directory */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>Registered Accounts ({data?.registeredUsers?.length || 0})</h3>
                      <p className="text-xs" style={{ color: '#6a6a5a' }}>Promote verified members to Admin or activate Pro access</p>
                    </div>
                    {!data?.registeredUsers || data.registeredUsers.length === 0 ? (
                      <p className="text-xs py-4" style={{ color: '#6a6a5a' }}>No registered users found.</p>
                    ) : (
                      <div className="space-y-2">
                        {data.registeredUsers.map((u) => {
                          const isAdmin = (data?.admins || []).some((a) => a.email === u.email || a.user_id === u.id);
                          return (
                            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(14,14,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm" style={{ color: '#e8e6f0' }}>{u.email}</span>
                                  {isAdmin && <StatusBadge label="Admin" tone="gold" />}
                                </div>
                                <div className="text-xs" style={{ color: '#6a6a5a' }}>
                                  ID {u.id} · Joined {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 shrink-0">
                                {!isAdmin && (
                                  <button type="button" onClick={() => handleAddAdmin(u.email)} disabled={addAdminLoading}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                    style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.28)', color: '#e8c87a' }}>
                                    Promote to Admin
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
