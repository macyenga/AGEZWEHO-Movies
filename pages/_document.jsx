import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="rw" className="dark" data-theme="dark">
 <Head>
  {/* Zero-FOUC High-Contrast Theme Initialization */}
  <script
    dangerouslySetInnerHTML={{
      __html: `(function(){try{var t=localStorage.getItem('agasobanuye_theme');var m=(t==='light'||t==='day'||t==='daylight')?'light':'dark';var r=document.documentElement;r.classList.remove('dark','light');r.classList.add(m);r.setAttribute('data-theme',m);r.style.colorScheme=m;}catch(e){}})();`,
    }}
  />
  {/* Fonts */}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

  {/* Favicon */}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="shortcut icon" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/favicon.svg" />
  <link rel="manifest" href="/site.webmanifest" />

  {/* Theme */}
  <meta name="theme-color" content="#c9a84c" />
  <meta name="msapplication-TileColor" content="#0a0a0f" />

  {/* Primary SEO */}
  <meta name="description" content="Agasobanuye.rw — Rwanda's #1 home for Agasobanuye movies, Live TV channels, multi-language Movie Subtitles & AI Subtitle Studio (Kinyarwanda, English, French, Swahili)." />
  <meta name="keywords" content="agasobanuye rocky 2026, agasobanuye 2026, agasobanuye sankara 2026, agasobanuye gashya 2026 netflix, agasobanuye agent kim, movie subtitles Rwanda, Kinyarwanda subtitles, subtitle studio, SRT VTT translator, Swahili subtitles, French subtitles, live TV Rwanda, Kigali live channels, Agasobanuye" />
  <meta name="author" content="Agasobanuye.rw" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="googlebot" content="index, follow" />
  <meta name="language" content="Kinyarwanda, English, French, Swahili, Kirundi" />
  <meta name="revisit-after" content="3 days" />
  <meta name="rating" content="general" />

  {/* Open Graph */}
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Agasobanuye.rw" />
  <meta property="og:title" content="Agasobanuye.rw — Filime z'Agasobanuye, Subtitles Studio &amp; Live TV" />
  <meta property="og:description" content="Rwanda's home for Agasobanuye movies, Live Rwanda TV channels, official movie subtitles (.SRT/.VTT) and multi-language Subtitle Studio." />
  <meta property="og:url" content="https://agasobanuye.rw" />
  <meta property="og:image" content="https://agasobanuye.rw/og-image.svg" />
  <meta property="og:locale" content="rw_RW" />

  {/* Twitter */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Agasobanuye.rw — Filime z'Agasobanuye, Subtitles Studio &amp; Live TV" />
  <meta name="twitter:description" content="Rwanda's home for Agasobanuye movies, Live Rwanda TV, and multi-language movie subtitles (.SRT/.VTT)." />
  <meta name="twitter:image" content="https://agasobanuye.rw/og-image.svg" />

  {/* Mobile */}
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-title" content="Agasobanuye.rw" />
  <meta name="application-name" content="Agasobanuye.rw" />

  {/* Google Verification & AdSense */}
  <meta name="google-site-verification" content="4R4CtipfBA-100wi1HYBeuWjzYxL5I_hYzQlkjIh9q0" />
  {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
    <>
      <meta name="google-adsense-account" content={process.env.NEXT_PUBLIC_ADSENSE_CLIENT} />
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(process.env.NEXT_PUBLIC_ADSENSE_CLIENT)}`}
        crossOrigin="anonymous"
      />
    </>
  )}

  {/* JSON-LD Structured Data */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Agasobanuye.rw",
      "alternateName": ["Agasobanuye", "Agasobanuye.rw", "Agasobanuye Subtitles Studio", "Agasobanuye Live TV"],
      "url": "https://agasobanuye.rw",
      "description": "Rwanda's home for Agasobanuye movies, Live Rwanda TV, official movie subtitles (.SRT/.VTT), and a multi-language Subtitle Studio supporting Kinyarwanda, English, French, Swahili, and Kirundi.",
      "inLanguage": ["rw", "en", "fr", "sw"],
      "areaServed": [
        { "@type": "Country", "name": "Rwanda" },
        { "@type": "Place", "name": "Worldwide Diaspora" }
      ],
      "publisher": {
        "@type": "Organization",
        "name": "Agasobanuye.rw",
        "url": "https://agasobanuye.rw",
        "sameAs": [
          "https://t.me/+250789690247",
          "https://t.me/+n3etNnm3RxI5NGZl",
          "https://www.instagram.com/agasobanuye.rw/",
          "https://www.tiktok.com/@agasobanuye.rw",
          "https://www.youtube.com/@agasobanuyerw"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+250789690247",
          "contactType": "customer support",
          "url": "https://t.me/+250789690247",
          "areaServed": "Worldwide",
          "availableLanguage": ["Kinyarwanda", "English", "French", "Swahili", "Kirundi"]
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
