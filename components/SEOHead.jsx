import Head from 'next/head';

const SITE_URL = 'https://agezweho.com';
const SITE_NAME = 'Agezweho Movies';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`;

export default function SEOHead({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  canonical,
  jsonLd,
  noIndex = false,
  keywords,
}) {
  const t = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Rwanda's Home for Agasobanuye Movies & Entertainment`;
  const d = description || 'Rwanda\'s home for Agasobanuye movies, series & anime. Discover, download and watch your favourites — completely free.';
  const ogT = ogTitle || title || SITE_NAME;
  const ogD = ogDescription || d;
  const ogI = ogImage || DEFAULT_IMAGE;
  const c = canonical || (typeof window !== 'undefined' ? window.location.href : SITE_URL);

  return (
    <Head>
      <title>{t}</title>
      <meta name="description" content={d} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={c} />

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={ogT} />
      <meta property="og:description" content={ogD} />
      <meta property="og:image" content={ogI} />
      <meta property="og:url" content={c} />
      <meta property="og:locale" content="rw_RW" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogT} />
      <meta name="twitter:description" content={ogD} />
      <meta name="twitter:image" content={ogI} />
      <meta name="twitter:site" content="@agezweho" />

      <link rel="alternate" hrefLang="rw" href={c} />
      <link rel="alternate" hrefLang="en" href={c} />

      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd].filter(Boolean)),
          }}
        />
      )}
    </Head>
  );
}
