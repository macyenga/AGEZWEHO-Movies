// In-memory fallback database for AI Studio environment

const INITIAL_MOVIES = [
  {
    id: 'pushpa-2-the-rule',
    title: 'Pushpa 2: The Rule',
    year: '2024',
    type: 'Movie',
    language: 'Telugu/Hindi',
    genre: 'Action',
    rating: '8.3',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
    overview: 'Pushpa Raj expands his red-sandalwood smuggling empire and faces a fierce new antagonist bent on destroying everything he has built.',
    links: [
      { label: 'Fast Server 1080p', url: 'https://archive.org', color: '#c9a84c', info: '2.4 GB' },
      { label: 'Direct Download 720p', url: 'https://archive.org', color: '#38bdf8', info: '1.1 GB' },
    ],
    watch_links: [
      { label: 'Stream HD (Agasobanuye)', url: 'https://www.youtube.com' },
    ],
    platforms: ['Netflix', 'Amazon Prime Video'],
    featured: true,
    status: 'approved',
    uploaded_by: 'Rocky Kimomo',
    uploader_earnings: 15000,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'agasobanuye-rocky-2026-agent',
    title: 'Agasobanuye: Rocky 2026 — The Agent',
    year: '2026',
    type: 'Movie',
    language: 'Kinyarwanda',
    genre: 'Action',
    rating: '8.9',
    poster_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80',
    overview: 'Agasobanuye gashya 2026 kasobanuwe na Rocky Kimomo. Intambara y abasirikare bakomeye n umutekano w igihugu.',
    links: [
      { label: '1080p Agasobanuye Full HD', url: 'https://archive.org', color: '#c9a84c', info: '1.8 GB' },
    ],
    watch_links: [
      { label: 'Watch Agasobanuye Online', url: 'https://www.youtube.com' },
    ],
    platforms: ['YouTube'],
    featured: true,
    status: 'approved',
    uploaded_by: 'Rocky Studio',
    uploader_earnings: 32000,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'agasobanuye-sankara-2026-bloodline',
    title: 'Agasobanuye: Sankara 2026 — Bloodline',
    year: '2026',
    type: 'Movie',
    language: 'Kinyarwanda',
    genre: 'Thriller',
    rating: '8.5',
    poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80',
    overview: 'Filime y igitangaza isobanuwe na Sankara muri 2026. Inkuru y amabanga akomeye y umuryango n ubwicanyi buteguye.',
    links: [
      { label: 'Download 720p HD', url: 'https://archive.org', color: '#c9a84c', info: '1.2 GB' },
    ],
    watch_links: [
      { label: 'Watch Online', url: 'https://www.youtube.com' },
    ],
    platforms: ['Netflix'],
    featured: false,
    status: 'approved',
    uploaded_by: 'Sankara HD',
    uploader_earnings: 18500,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'stree-2',
    title: 'Stree 2: Sarkate Ka Aatank',
    year: '2024',
    type: 'Movie',
    language: 'Hindi',
    genre: 'Horror',
    rating: '7.9',
    poster_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    overview: 'The gang of Chanderi faces a far more terrifying supernatural force than Stree — one that may require an unlikely alliance to defeat.',
    links: [
      { label: 'Download 1080p', url: 'https://archive.org', color: '#c9a84c', info: '2.1 GB' },
    ],
    watch_links: [
      { label: 'Stream HD', url: 'https://www.netflix.com' },
    ],
    platforms: ['Netflix'],
    featured: true,
    status: 'approved',
    uploaded_by: 'Fey Movies',
    uploader_earnings: 8000,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'mirzapur-s3',
    title: 'Mirzapur Season 3',
    year: '2024',
    type: 'Series',
    language: 'Hindi/English',
    genre: 'Drama',
    rating: '8.1',
    poster_url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=500&auto=format&fit=crop&q=80',
    overview: 'The power struggle for control of Mirzapur reaches a boiling point as old loyalties shatter and new blood rises to claim the throne.',
    links: [
      { label: 'All Episodes Pack (1080p)', url: 'https://archive.org', color: '#c9a84c', info: '8.4 GB' },
    ],
    watch_links: [
      { label: 'Amazon Prime Video', url: 'https://www.primevideo.com' },
    ],
    platforms: ['Amazon Prime Video'],
    featured: false,
    status: 'approved',
    uploaded_by: 'Junior Giti',
    uploader_earnings: 24000,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'animal-2023',
    title: 'Animal',
    year: '2023',
    type: 'Movie',
    language: 'Hindi',
    genre: 'Action',
    rating: '6.8',
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    overview: 'A sons obsessive devotion to his father spirals into violence and vengeance as corporate conspiracies and family betrayals collide.',
    links: [
      { label: 'Download 1080p Extended', url: 'https://archive.org', color: '#c9a84c', info: '3.2 GB' },
    ],
    watch_links: [
      { label: 'Netflix', url: 'https://www.netflix.com' },
    ],
    platforms: ['Netflix'],
    featured: false,
    status: 'approved',
    uploaded_by: 'Yanga Media',
    uploader_earnings: 12000,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'solo-leveling-anime',
    title: 'Solo Leveling: Arise',
    year: '2024',
    type: 'Anime',
    language: 'Japanese/English Sub',
    genre: 'Fantasy',
    rating: '8.8',
    poster_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
    overview: 'In a world where hunters must battle deadly monsters to protect humanity, Sung Jinwoo discovers a quest only he can see.',
    links: [
      { label: 'Batch Season 1 (1080p)', url: 'https://archive.org', color: '#c9a84c', info: '4.8 GB' },
    ],
    watch_links: [
      { label: 'Crunchyroll', url: 'https://www.crunchyroll.com' },
    ],
    platforms: ['Netflix'],
    featured: false,
    status: 'approved',
    uploaded_by: 'AnimeRwanda',
    uploader_earnings: 9500,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'gorillas-in-the-mist-rwanda',
    title: 'Rwanda: The Land of a Thousand Hills',
    year: '2025',
    type: 'Documentary',
    language: 'English/Kinyarwanda',
    genre: 'Adventure',
    rating: '9.2',
    poster_url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=500&auto=format&fit=crop&q=80',
    overview: 'A breathtaking cinematic exploration of Volcanoes National Park, the endangered Mountain Gorillas, and the transformation of Rwanda.',
    links: [
      { label: '4K Ultra HD', url: 'https://archive.org', color: '#c9a84c', info: '4.2 GB' },
    ],
    watch_links: [
      { label: 'Stream 4K', url: 'https://www.youtube.com' },
    ],
    platforms: ['YouTube'],
    featured: false,
    status: 'approved',
    uploaded_by: 'Kigali Discovery',
    uploader_earnings: 6000,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];

const INITIAL_REQUESTS = [
  {
    id: 'req-1',
    title: 'KGF Chapter 3',
    requested_by: 'Vikram',
    note: 'Rocky Bhai is back — please add ASAP with Agasobanuye!',
    votes: 36,
    donation_goal: 5000,
    donation_total: 2500,
    fulfilled: false,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'req-2',
    title: 'Panchayat Season 4',
    requested_by: 'Ananya',
    note: 'Best Indian comedy drama series. Waiting eagerly!',
    votes: 28,
    donation_goal: 5000,
    donation_total: 1800,
    fulfilled: false,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'req-3',
    title: 'Kalki 2898-AD Part 2',
    requested_by: 'Rohan',
    note: 'Prabhas and Amitabh Bachchan — this will be epic.',
    votes: 19,
    donation_goal: 5000,
    donation_total: 900,
    fulfilled: false,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

const INITIAL_GAMES = [
  {
    id: 'gta-sa-rwanda',
    title: 'GTA San Andreas: Rwanda Mod (Kigali Edition)',
    type: 'Game',
    category: 'Action',
    version: '2.5.0',
    rating: '4.9',
    cover_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80',
    overview: 'Play GTA San Andreas with Kigali landmarks, BK Arena, Nyabugogo bus station, and custom Rwandan music radio.',
    links: [
      { label: 'Download APK + OBB (2.1 GB)', url: 'https://archive.org' },
    ],
    premium: false,
    price: 0,
    uploader_momo_number: '0789690247',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'fifa-24-rwanda-ppsspp',
    title: 'FIFA 24 PPSSPP: Rwanda Premier League',
    type: 'Game',
    category: 'Sports',
    version: '1.8.2',
    rating: '4.8',
    cover_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=80',
    overview: 'Full Rwandan league rosters: APR FC, Rayon Sports, Kiyovu Sports, Police FC with real kits and stadiums on PSP/Android emulator.',
    links: [
      { label: 'Download ISO File (1.4 GB)', url: 'https://archive.org' },
    ],
    premium: true,
    price: 500,
    uploader_momo_number: '0789690247',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

const INITIAL_NEWS = [
  {
    id: 'news-rocky-2026',
    title: 'Filime nshya za Agasobanuye Rocky 2026 zasohotse uyu munsi',
    content: 'Umuvuzi w amafilime w icyamamare mu Rwanda Rocky Kimomo yashyize hanze ibice bishya by amafilime ategerejwe na benshi. Abakunzi b amafilime bishimiye cyane uburyo yasobanuye neza ibice bikomeye by iyi filime.',
    image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80',
    category: 'Amakuru',
    author_name: 'Agasobanuye.rw News',
    likes: 54,
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'news-cinema-rwanda-2026',
    title: 'Iterambere ry Agasobanuye mu Rwanda n imikoranire mishya',
    content: 'Abasobanuzi b amafilime mu Rwanda barimo Sankara na Junior Giti batangaje ko bagiye gukorana bya hafi mu rwego rwo kugeza ku banyarwanda amashusho meza kandi asobanutse mu Kinyarwanda cyiza.',
    image_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&auto=format&fit=crop&q=80',
    category: 'Entertainment',
    author_name: 'Kigali Showbiz',
    likes: 38,
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const INITIAL_SHOP = [
  {
    id: 'shop-ps5-dualsense',
    title: 'PS5 DualSense Wireless Controller (Midnight Black)',
    description: 'Original brand new PS5 controller with haptic feedback and adaptive triggers. Delivery anywhere in Kigali.',
    price: '65,000',
    currency: 'RWF',
    image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=80',
    category: 'Gaming',
    seller_name: 'Kigali Gaming Hub',
    seller_whatsapp: '+250789690247',
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'shop-netflix-sub',
    title: 'Netflix Premium 4K UHD — 1 Month Account',
    description: 'Private profile with PIN lock. High speed streaming on TV, Phone and Laptop. Instant delivery via WhatsApp.',
    price: '9,500',
    currency: 'RWF',
    image_url: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500&auto=format&fit=crop&q=80',
    category: 'Subscriptions',
    seller_name: 'Digital Stream Kigali',
    seller_whatsapp: '+250789690247',
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// Global in-memory storage (preserved across route invocations in same node process)
if (!global.__aiStudioDbStore) {
  global.__aiStudioDbStore = {
    movies: [...INITIAL_MOVIES],
    requests: [...INITIAL_REQUESTS],
    games: [...INITIAL_GAMES],
    news: [...INITIAL_NEWS],
    shop: [...INITIAL_SHOP],
    contacts: [],
    donations: [
      {
        id: 'don-1',
        movie_id: 'pushpa-2-the-rule',
        donor_name: 'Eric N.',
        amount: 2000,
        phone_last4: '1234',
        confirmed: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'don-2',
        movie_id: 'agasobanuye-rocky-2026-agent',
        donor_name: 'Jean Paul',
        amount: 5000,
        phone_last4: '5678',
        confirmed: true,
        created_at: new Date().toISOString(),
      },
    ],
    transactions: [],
    subscriptions: [],
    admins: [
      { id: 'admin-1', user_id: 'mock-admin-id', email: process.env.ADMIN_EMAIL || 'macyenga@gmail.com' }
    ],
  };
}

const store = global.__aiStudioDbStore;

function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  if (typeof a === 'string' && typeof b === 'string') {
    const da = Date.parse(a);
    const db = Date.parse(b);
    if (!isNaN(da) && !isNaN(db) && (a.includes('T') || a.includes('-')) && (b.includes('T') || b.includes('-'))) {
      return da - db;
    }
  }
  return String(a).localeCompare(String(b));
}

function createQueryBuilder(table) {
  let items = (store[table] || []).map(item => ({ ...item }));
  let isSingle = false;
  let isMaybeSingle = false;
  let selectOptions = {};

  const builder = {
    select(fields, options) {
      if (options) {
        selectOptions = { ...selectOptions, ...options };
      }
      return builder;
    },
    eq(col, val) {
      items = items.filter(i => {
        if (typeof val === 'boolean') return Boolean(i[col]) === val;
        return String(i[col]) === String(val);
      });
      return builder;
    },
    neq(col, val) {
      items = items.filter(i => String(i[col]) !== String(val));
      return builder;
    },
    gte(col, val) {
      items = items.filter(i => compareValues(i[col], val) >= 0);
      return builder;
    },
    gt(col, val) {
      items = items.filter(i => compareValues(i[col], val) > 0);
      return builder;
    },
    lte(col, val) {
      items = items.filter(i => compareValues(i[col], val) <= 0);
      return builder;
    },
    lt(col, val) {
      items = items.filter(i => compareValues(i[col], val) < 0);
      return builder;
    },
    is(col, val) {
      if (val === null) {
        items = items.filter(i => i[col] === null || i[col] === undefined);
      } else {
        items = items.filter(i => i[col] === val);
      }
      return builder;
    },
    not(col, op, val) {
      if (op === 'is' && val === null) {
        items = items.filter(i => i[col] !== null && i[col] !== undefined);
      } else if (op === 'eq') {
        items = items.filter(i => String(i[col]) !== String(val));
      } else if (op === 'in') {
        const set = new Set(Array.isArray(val) ? val.map(String) : []);
        items = items.filter(i => !set.has(String(i[col])));
      } else {
        items = items.filter(i => i[col] !== val);
      }
      return builder;
    },
    in(col, valList) {
      const set = new Set(Array.isArray(valList) ? valList.map(String) : []);
      items = items.filter(i => set.has(String(i[col])));
      return builder;
    },
    contains(col, val) {
      items = items.filter(i => {
        const target = i[col];
        if (Array.isArray(target)) {
          return Array.isArray(val) ? val.every(v => target.includes(v)) : target.includes(val);
        }
        return false;
      });
      return builder;
    },
    filter(col, op, val) {
      if (op === 'eq') return builder.eq(col, val);
      if (op === 'neq') return builder.neq(col, val);
      if (op === 'gte') return builder.gte(col, val);
      if (op === 'gt') return builder.gt(col, val);
      if (op === 'lte') return builder.lte(col, val);
      if (op === 'lt') return builder.lt(col, val);
      if (op === 'is') return builder.is(col, val);
      if (op === 'in') return builder.in(col, val);
      if (op === 'ilike') return builder.ilike(col, val);
      return builder;
    },
    match(queryObj) {
      items = items.filter(i => Object.entries(queryObj || {}).every(([k, v]) => String(i[k]) === String(v)));
      return builder;
    },
    ilike(col, pattern) {
      const clean = String(pattern).replace(/%/g, '').toLowerCase();
      items = items.filter(i => String(i[col] || '').toLowerCase().includes(clean));
      return builder;
    },
    or(filterStr) {
      try {
        const parts = filterStr.split(',');
        items = items.filter(item => {
          return parts.some(part => {
            const [field, op, pattern] = part.split('.');
            if (field && pattern) {
              const clean = pattern.replace(/%/g, '').toLowerCase();
              return String(item[field] || '').toLowerCase().includes(clean);
            }
            return false;
          });
        });
      } catch {
        // keep items
      }
      return builder;
    },
    order(col, { ascending = true } = {}) {
      items.sort((a, b) => {
        const diff = compareValues(a[col], b[col]);
        return ascending ? diff : -diff;
      });
      return builder;
    },
    limit(n) {
      items = items.slice(0, n);
      return builder;
    },
    range(from, to) {
      items = items.slice(from, to + 1);
      return builder;
    },
    single() {
      isSingle = true;
      return builder;
    },
    maybeSingle() {
      isMaybeSingle = true;
      return builder;
    },
    insert(rows) {
      if (!store[table]) store[table] = [];
      const rowList = Array.isArray(rows) ? rows : [rows];
      const inserted = rowList.map((r, idx) => {
        const newRow = {
          id: r.id || `${table}-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
          created_at: r.created_at || new Date().toISOString(),
          ...r,
        };
        store[table].unshift(newRow);
        return newRow;
      });
      items = inserted;
      return builder;
    },
    update(updates) {
      if (store[table]) {
        for (let i = 0; i < store[table].length; i++) {
          const row = store[table][i];
          const matches = items.some(it => it.id === row.id);
          if (matches) {
            store[table][i] = { ...row, ...updates };
          }
        }
      }
      items = items.map(it => ({ ...it, ...updates }));
      return builder;
    },
    delete() {
      if (store[table]) {
        const idsToDelete = new Set(items.map(it => it.id));
        store[table] = store[table].filter(r => !idsToDelete.has(r.id));
      }
      return builder;
    },
    then(resolve, reject) {
      const totalCount = items.length;
      if (selectOptions.head) {
        return Promise.resolve({ data: null, error: null, count: totalCount }).then(resolve, reject);
      }
      let result;
      if (isSingle) {
        if (items.length > 0) {
          result = { data: items[0], error: null, count: 1 };
        } else {
          result = { data: null, error: { message: 'Row not found' }, count: 0 };
        }
      } else if (isMaybeSingle) {
        result = { data: items[0] || null, error: null, count: items.length ? 1 : 0 };
      } else {
        result = { data: items, error: null, count: totalCount };
      }
      return Promise.resolve(result).then(resolve, reject);
    },
  };

  return builder;
}

export function createMockSupabaseClient() {
  const mockUser = {
    id: 'mock-admin-id',
    email: process.env.ADMIN_EMAIL || 'macyenga@gmail.com',
  };

  return {
    from(table) {
      return createQueryBuilder(table);
    },
    rpc(fnName, args = {}) {
      if (fnName === 'increment_news_likes') {
        const news = store.news || [];
        const item = news.find(n => n.id === args.row_id);
        if (item) {
          item.likes = (item.likes || 0) + 1;
          return Promise.resolve({ data: item.likes, error: null });
        }
        return Promise.resolve({ data: 1, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    },
    auth: {
      async getSession() {
        return {
          data: {
            session: {
              access_token: 'mock-session-token',
              user: mockUser,
            },
          },
          error: null,
        };
      },
      onAuthStateChange(cb) {
        if (typeof cb === 'function') {
          setTimeout(() => {
            cb('SIGNED_IN', {
              access_token: 'mock-session-token',
              user: mockUser,
            });
          }, 0);
        }
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        };
      },
      async signInWithPassword({ email, password }) {
        return {
          data: {
            user: { id: 'mock-admin-id', email: email || mockUser.email },
            session: { access_token: 'mock-session-token', user: mockUser },
          },
          error: null,
        };
      },
      async signOut() {
        return { error: null };
      },
      async getUser(token) {
        return {
          data: { user: mockUser },
          error: null,
        };
      },
      admin: {
        async listUsers() {
          return {
            data: {
              users: [
                {
                  id: mockUser.id,
                  email: mockUser.email,
                  created_at: new Date().toISOString(),
                },
              ],
            },
            error: null,
          };
        },
        async createUser({ email }) {
          return {
            data: { user: { id: `user-${Date.now()}`, email } },
            error: null,
          };
        },
        async getUser(token) {
          return { data: { user: mockUser }, error: null };
        },
        async deleteUser(userId) {
          return { data: { user: { id: userId } }, error: null };
        },
      },
    },
  };
}

export { store };
