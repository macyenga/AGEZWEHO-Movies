import { supabaseAdmin } from '../lib/server/supabase-admin';
import { generateSitemapXml } from '../lib/sitemap';

export async function getServerSideProps({ res }) {
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://agasobanuye.rw';
  const sitemap = await generateSitemapXml({
    siteUrl,
    client: supabaseAdmin,
  });

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
