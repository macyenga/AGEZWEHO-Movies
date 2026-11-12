import { supabaseAdmin } from '../lib/server/supabase-admin';

const SITE_URL = 'https://agasobanuye.rw';

function url(loc, priority = '0.5', changefreq = 'monthly', lastmod = '') {
  return `<url><loc>${SITE_URL}${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

export async function getServerSideProps({ res }) {
  const staticPages = [
    url('/', '1.0', 'daily'),
    url('/finder', '0.7', 'weekly'),
    url('/news', '0.9', 'daily'),
    url('/requests', '0.9', 'daily'),
    url('/games', '0.9', 'daily'),
    url('/live', '0.8', 'daily'),
    url('/shop', '0.7', 'weekly'),
    url('/subscribe', '0.7', 'weekly'),
    url('/support', '0.5', 'monthly'),
    url('/collection', '0.6', 'monthly'),
    url('/contact', '0.5', 'monthly'),
    url('/submit', '0.6', 'weekly'),
  ];

  const [{ data: movies }, { data: games }, { data: requests }, { data: news }, { data: shop }] = await Promise.all([
    supabaseAdmin.from('movies').select('id, created_at').eq('status', 'approved').limit(1000),
    supabaseAdmin.from('games').select('id, created_at').eq('status', 'approved').limit(1000),
    supabaseAdmin.from('requests').select('id, created_at').limit(500),
    supabaseAdmin.from('news').select('id, created_at').eq('status', 'approved').limit(1000),
    supabaseAdmin.from('shop').select('id, created_at').limit(500),
  ]);

  const movieUrls = (movies || []).map(m =>
    url(`/movies/${m.id}`, '0.9', 'weekly', m.created_at || '')
  );
  const gameUrls = (games || []).map(g =>
    url(`/games/${g.id}`, '0.8', 'weekly', g.created_at || '')
  );
  const requestUrls = (requests || []).map(() => url('/requests', '0.7', 'daily'));
  const newsUrls = (news || []).map(n =>
    url(`/news/${n.id}`, '0.8', 'daily', n.created_at || '')
  );
  const shopUrls = (shop || []).map(s =>
    url(`/shop/${s.id}`, '0.6', 'weekly', s.created_at || '')
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...staticPages, ...movieUrls, ...gameUrls, ...requestUrls, ...newsUrls, ...shopUrls].join('')}</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function Sitemap() { return null; }
