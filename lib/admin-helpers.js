export function computeAdminSummary({
  allMovies = [],
  pendingMovies = [],
  allGames = [],
  allRequests = [],
  allNews = [],
  allShop = [],
  comingSoon = [],
  pendingTransactions = [],
  completedTransactions = [],
  completedDonations = [],
  subscriptions = [],
  contacts = [],
  admins = [],
} = {}) {
  const approvedMovies = allMovies.filter((m) => m.status === 'approved').length;
  const featuredMovies = allMovies.filter((m) => Boolean(m.featured)).length;
  const totalViews = allMovies.reduce((sum, m) => sum + (Number(m.views) || 0), 0);

  const pendingGames = allGames.filter((g) => g.status === 'pending').length;
  const pendingNews = allNews.filter((n) => n.status === 'pending').length;
  const activeShop = allShop.filter((s) => s.status === 'active').length;
  const fulfilledRequests = allRequests.filter((r) => Boolean(r.fulfilled)).length;
  const totalVotes = allRequests.reduce((sum, r) => sum + (Number(r.votes) || 0), 0);

  const unresolvedContacts = contacts.filter((c) => !c.resolved).length;
  const pendingSubscriptions = subscriptions.filter((s) => s.status === 'pending').length;
  const activeSubscriptions = subscriptions.filter((s) => {
    if (s.status !== 'active') return false;
    return !s.expires_at || new Date(s.expires_at) > new Date();
  }).length;

  const confirmedDonationsList = completedDonations.filter((d) => d.confirmed !== false);
  const unconfirmedDonationsCount = completedDonations.filter((d) => d.confirmed === false).length;
  const directDonationsTotal = confirmedDonationsList.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const transactionRevenueTotal = completedTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalRevenue = directDonationsTotal + transactionRevenueTotal;

  const pendingModerationTotal =
    pendingMovies.length +
    pendingGames +
    pendingNews +
    pendingTransactions.length +
    pendingSubscriptions +
    unconfirmedDonationsCount +
    unresolvedContacts;

  return {
    totalMovies: allMovies.length,
    approvedMovies,
    pendingMovies: pendingMovies.length,
    featuredMovies,
    totalViews,
    totalGames: allGames.length,
    pendingGames,
    totalRequests: allRequests.length,
    fulfilledRequests,
    pendingRequests: allRequests.length - fulfilledRequests,
    totalVotes,
    totalNews: allNews.length,
    pendingNews,
    totalShop: allShop.length,
    activeShop,
    soldShop: allShop.length - activeShop,
    totalComingSoon: comingSoon.length,
    pendingTransactions: pendingTransactions.length,
    totalDonationsCount: completedDonations.length,
    unconfirmedDonationsCount,
    directDonationsTotal,
    transactionRevenueTotal,
    totalRevenue,
    activeSubscriptions,
    pendingSubscriptions,
    totalContacts: contacts.length,
    unresolvedContacts,
    totalAdmins: admins.length,
    pendingModerationTotal,
  };
}

function matchesSearch(fields, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  return fields.some((val) => String(val || '').toLowerCase().includes(q));
}

export function filterAdminMovies(movies = [], { search = '', status = 'all', genre = 'all', featured = 'all' } = {}) {
  return movies.filter((m) => {
    if (status !== 'all' && (m.status || 'approved') !== status) return false;
    if (genre !== 'all' && m.genre !== genre) return false;
    if (featured === 'featured' && !m.featured) return false;
    if (featured === 'standard' && m.featured) return false;
    return matchesSearch([m.title, m.uploaded_by, m.language, m.genre, m.type, m.year], search);
  });
}

export function filterAdminGames(games = [], { search = '', status = 'all', tier = 'all' } = {}) {
  return games.filter((g) => {
    const gStatus = g.status || 'approved';
    if (status !== 'all' && gStatus !== status) return false;
    if (tier === 'premium' && !g.premium) return false;
    if (tier === 'free' && g.premium) return false;
    return matchesSearch([g.title, g.category, g.version, g.uploader_momo_number], search);
  });
}

export function filterAdminRequests(requests = [], { search = '', status = 'all' } = {}) {
  return requests.filter((r) => {
    if (status === 'fulfilled' && !r.fulfilled) return false;
    if (status === 'pending' && r.fulfilled) return false;
    return matchesSearch([r.title, r.requested_by, r.note, r.language, r.year], search);
  });
}

export function filterAdminNews(newsList = [], { search = '', status = 'all' } = {}) {
  return newsList.filter((n) => {
    const nStatus = n.status || 'pending';
    if (status !== 'all' && nStatus !== status) return false;
    return matchesSearch([n.title, n.author_name, n.category, n.content], search);
  });
}

export function filterAdminShop(items = [], { search = '', status = 'all' } = {}) {
  return items.filter((s) => {
    const sStatus = s.status || 'active';
    if (status !== 'all' && sStatus !== status) return false;
    return matchesSearch([s.title, s.seller_name, s.category, s.seller_whatsapp, s.price], search);
  });
}

export function filterAdminDonations(donations = [], { search = '', status = 'all' } = {}) {
  return donations.filter((d) => {
    const isConfirmed = d.confirmed !== false;
    if (status === 'confirmed' && !isConfirmed) return false;
    if (status === 'pending' && isConfirmed) return false;
    return matchesSearch([d.donor_name, d.phone_last4, d.request_id, d.movie_id, d.amount], search);
  });
}

export function filterAdminSubscriptions(subscriptions = [], { search = '', status = 'all' } = {}, userMap = {}) {
  return subscriptions.filter((sub) => {
    const isExpired = sub.status === 'active' && sub.expires_at && new Date(sub.expires_at) <= new Date();
    const effectiveStatus = isExpired ? 'expired' : (sub.status || 'pending');
    if (status !== 'all' && effectiveStatus !== status) return false;
    const email = userMap[sub.user_id] || '';
    return matchesSearch([sub.user_id, email, sub.phone, sub.tx_ref, effectiveStatus], search);
  });
}

export function filterAdminContacts(contacts = [], { search = '', status = 'all' } = {}) {
  return contacts.filter((c) => {
    if (status === 'resolved' && !c.resolved) return false;
    if (status === 'unread' && c.resolved) return false;
    return matchesSearch([c.name, c.email, c.subject, c.message], search);
  });
}

export function comingSoonToMoviePayload(item) {
  const yearMatch = String(item?.releaseDate || '').match(/^(\d{4})/);
  const year = yearMatch ? yearMatch[1] : String(new Date().getUTCFullYear());
  return {
    title: String(item?.title || '').trim(),
    year,
    type: item?.type || 'Movie',
    language: item?.language || 'Kinyarwanda',
    genre: item?.genre || 'Action',
    rating: '8.5',
    poster_url: item?.poster_url || '',
    trailer_url: item?.trailer_url || '',
    overview: item?.overview || '',
    uploaded_by: item?.interpreter || 'Agasobanuye.rw',
    platforms: ['YouTube'],
    links: [],
    watch_links: item?.trailer_url ? [{ label: 'Watch Trailer', url: item.trailer_url }] : [],
    featured: true,
    status: 'approved',
  };
}

function escapeCsvCell(value) {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildTransactionsCsv(transactions = [], userMap = {}) {
  const headers = ['ID', 'Reference', 'Status', 'Amount_RWF', 'Phone', 'Email', 'User', 'Request_ID', 'Game_ID', 'Created_At'];
  const rows = transactions.map((tx) => [
    tx.id,
    tx.tx_ref,
    tx.status,
    tx.amount,
    tx.phone || '',
    tx.donor_email || '',
    tx.user_id ? (userMap[tx.user_id] || tx.user_id) : '',
    tx.request_id || '',
    tx.game_id || '',
    tx.created_at || '',
  ]);
  return [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}

export function buildModerationQueue(summary = {}) {
  const items = [
    { tab: 'movies', label: 'Pending Agasobanuye Uploads', count: summary.pendingMovies || 0, severity: 'high' },
    { tab: 'transactions', label: 'Pending MoMo Transactions', count: summary.pendingTransactions || 0, severity: 'high' },
    { tab: 'subscriptions', label: 'Pro Subscriptions Awaiting Approval', count: summary.pendingSubscriptions || 0, severity: 'high' },
    { tab: 'donations', label: 'Unconfirmed Donations', count: summary.unconfirmedDonationsCount || 0, severity: 'medium' },
    { tab: 'premium', label: 'Pending Games & Premium Items', count: summary.pendingGames || 0, severity: 'medium' },
    { tab: 'news', label: 'Pending News Submissions', count: summary.pendingNews || 0, severity: 'medium' },
    { tab: 'contacts', label: 'Unread Contact Messages', count: summary.unresolvedContacts || 0, severity: 'low' },
  ];
  return items.filter((item) => item.count > 0);
}
