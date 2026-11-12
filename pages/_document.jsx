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
  <meta name="description" content="Agasobanuye.rw — Rwanda's #1 home for Agasobanuye movies, series & anime — Agasobanuye Rocky 2026, Rocky Kimomo, Sankara 2026, Agent Kim, Gashya 2026 Netflix, Fey, Junior Giti, Mujyosi Store. Watch, download, stream free." />
  <meta name="keywords" content="agasobanuye rocky 2026, agasobanuye 2026, agasobanuye sankara 2026, agasobanuye gashya 2026 netflix, agasobanuye agent kim, agent kim reactivated, agasobanuye by rocky kimomo, agasobanuye by sankara, agasobanuye by fey 2025, agasobanuye by junior giti, mujyosi store download, agahinde agasobanuye na rocky, amakuru agezweho, igihe amakuru mashya, igihe amakuru, amazina agezweho, M23 Rwanda, kigali today, Rwanda movies, Kinyarwanda movies, Agasobanuye, Rwandan entertainment, free movie download" />
  <meta name="author" content="Agasobanuye.rw" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="googlebot" content="index, follow" />
  <meta name="language" content="Kinyarwanda, Kirundi, English" />
  <meta name="revisit-after" content="3 days" />
  <meta name="rating" content="general" />

  {/* Open Graph */}
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Agasobanuye.rw" />
  <meta property="og:title" content="Agasobanuye.rw — Filime z'Agasobanuye Rocky 2026, Sankara, Agent Kim" />
  <meta property="og:description" content="Agasobanuye.rw — Rwanda's #1 home for Agasobanuye movies — Rocky 2026, Rocky Kimomo, Sankara 2026, Agent Kim, Gashya 2026 Netflix. Watch, download, stream free." />
  <meta property="og:url" content="https://agasobanuye.rw" />
  <meta property="og:image" content="https://agasobanuye.rw/og-image.svg" />
  <meta property="og:locale" content="rw_RW" />

  {/* Twitter */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Agasobanuye.rw — Filime z'Agasobanuye Rocky 2026, Sankara, Agent Kim" />
  <meta name="twitter:description" content="Agasobanuye.rw — Rwanda's #1 home for Agasobanuye movies — Rocky 2026, Sankara 2026, Agent Kim, Gashya Netflix." />
  <meta name="twitter:image" content="https://agasobanuye.rw/og-image.svg" />

  {/* Mobile */}
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-title" content="Agasobanuye.rw" />
  <meta name="application-name" content="Agasobanuye.rw" />

  {/* Google Verification */}
  <meta name="google-site-verification" content="4R4CtipfBA-100wi1HYBeuWjzYxL5I_hYzQlkjIh9q0" />

  {/* JSON-LD Structured Data */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Agasobanuye.rw",
      "alternateName": ["Agasobanuye", "Agasobanuye.rw", "Agasobanuye Movies Rwanda"],
      "url": "https://agasobanuye.rw",
      "description": "Rwanda's home for Agasobanuye movies — Agasobanuye Rocky 2026, Sankara 2026, Agent Kim, Gashya 2026 Netflix.",
      "inLanguage": ["rw", "en"],
      "areaServed": {
        "@type": "Country",
        "name": "Rwanda"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Agasobanuye.rw",
        "url": "https://agasobanuye.rw",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+250789690247",
          "contactType": "customer support",
          "areaServed": "RW",
          "availableLanguage": ["Kinyarwanda", "English"]
        }
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://agasobanuye.rw/finder?q={search_term_string}",
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
