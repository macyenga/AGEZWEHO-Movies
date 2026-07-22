import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="rw">
 <Head>
  {/* Fonts */}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap" rel="stylesheet" />

  {/* Favicon */}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="shortcut icon" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/favicon.svg" />
  <link rel="manifest" href="/site.webmanifest" />

  {/* Theme */}
  <meta name="theme-color" content="#c9a84c" />
  <meta name="msapplication-TileColor" content="#0a0a0f" />

  {/* Primary SEO */}
  <meta name="description" content="Agezweho Movies — Rwanda's home for Agasobanuye movies, series & anime. Discover, download and watch your favourites — completely free." />
  <meta name="keywords" content="Agezweho Movies, Rwanda movies, Kinyarwanda movies, Agasobanuye, Rwandan entertainment, Burundi movies, Kirundi movies, free movie download, watch movies online, Bollywood, Hollywood, anime, web series, ibihugu bya Rwanda, amafilm ya Kinyarwanda" />
  <meta name="author" content="Agezweho Movies" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="googlebot" content="index, follow" />
  <meta name="language" content="Kinyarwanda, Kirundi, English" />
  <meta name="revisit-after" content="3 days" />
  <meta name="rating" content="general" />

  {/* Open Graph */}
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Agezweho Movies" />
  <meta property="og:title" content="Agezweho Movies — Rwanda's Home for Agasobanuye Entertainment" />
  <meta property="og:description" content="Rwanda's home for Agasobanuye movies, series & anime. Discover, download and watch your favourites — completely free." />
  <meta property="og:url" content="https://agezweho.com" />
  <meta property="og:image" content="https://agezweho.com/og-image.jpg" />
  <meta property="og:locale" content="rw_RW" />

  {/* Twitter */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Agezweho Movies — Rwanda's Home for Agasobanuye Entertainment" />
  <meta name="twitter:description" content="Rwanda's home for Agasobanuye movies, series & anime. Discover, download and watch your favourites — completely free." />
  <meta name="twitter:image" content="https://agezweho.com/og-image.jpg" />

  {/* Mobile */}
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-title" content="Agezweho Movies" />
  <meta name="application-name" content="Agezweho Movies" />

  {/* Google Verification */}
  <meta name="google-site-verification" content="APNA_CODE_YAHAN" />

  {/* JSON-LD Structured Data */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Agezweho Movies",
      "url": "https://agezweho.com",
      "description": "Rwanda's home for Agasobanuye movies, series & anime. Discover, download and watch your favourites — completely free.",
      "inLanguage": ["rw", "en"],
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://agezweho.com/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    })}}
  />
</Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
