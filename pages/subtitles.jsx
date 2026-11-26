import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Subtitles, Download, Languages, Sparkles, Globe } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import OfficialSubtitleStudio from '../components/OfficialSubtitleStudio';
import { OFFICIAL_SUBTITLE_LANGUAGES, STUDIO_TARGET_LANGUAGES } from '../lib/subtitles';

const SUBTITLES_JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Agasobanuye.rw Multi-Language Subtitle Studio',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    url: 'https://agasobanuye.rw/subtitles',
    description:
      'Search, download, edit, and translate official movie and series subtitles (.SRT and .VTT) across Kinyarwanda, English, French, Swahili, Kirundi, Luganda, Hindi, Spanish, Arabic, Korean, and Japanese.',
    inLanguage: ['rw', 'en', 'fr', 'sw', 'rn', 'es', 'ar', 'hi', 'ko', 'ja'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'RWF',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Does Agasobanuye.rw serve movie subtitles and support multiple languages?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Agasobanuye.rw includes a Multi-Language Subtitle Studio where you can search official OpenSubtitles releases in English, French, Swahili, Hindi, Spanish, Arabic, Korean, Japanese, Portuguese, German, and Chinese, and translate or edit .SRT and .VTT cues into Kinyarwanda, English, French, Swahili, Kirundi, Luganda, Spanish, or Arabic.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I upload my own .SRT or .VTT file into the Subtitle Studio?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Upload any .SRT or .VTT file directly in the studio, translate cue lines while keeping exact timestamps intact, edit dialogue manually, and export ready-to-play subtitle files.',
        },
      },
    ],
  },
];

export default function SubtitlesPage() {
  const router = useRouter();
  const initialQuery = typeof router.query.q === 'string' ? router.query.q : '';
  const sourceLanguages = OFFICIAL_SUBTITLE_LANGUAGES.filter((l) => l.id !== 'all');

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Multi-Language Subtitle Studio & Official Subtitles (.SRT / .VTT)"
        description="Search and download official movie and series subtitles (.SRT / .VTT) in multiple languages, and translate subtitles into Kinyarwanda, English, French, Swahili, and Kirundi using the Agasobanuye.rw Subtitle Studio."
        keywords="movie subtitles Rwanda, agasobanuye subtitles, multi-language subtitle studio, Kinyarwanda subtitle translator, SRT VTT download, Swahili subtitles, French subtitles, OpenSubtitles Rwanda"
        canonical="https://agasobanuye.rw/subtitles"
        jsonLd={SUBTITLES_JSON_LD}
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-28 md:pt-24 pb-24 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
              style={{ color: 'var(--text2)' }}
            >
              <ArrowLeft size={13} />
              <span>Back to Catalog</span>
            </Link>

            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'var(--accent-bg)',
                  border: '1px solid var(--accent-border)',
                }}
              >
                <Subtitles size={20} style={{ color: 'var(--gold2)' }} />
              </div>
              <div>
                <h1
                  className="font-cinzel font-bold text-xl sm:text-2xl tracking-wide"
                  style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold2)' }}
                >
                  Official Subtitles &amp; Multi-Language Subtitle Studio
                </h1>
                <p className="text-xs sm:text-sm mt-0.5 max-w-2xl" style={{ color: 'var(--text2)' }}>
                  Search official movie and series subtitles across 11+ languages, translate cue lines into Kinyarwanda, English, French, Swahili, or Kirundi, and download ready-to-play .SRT or .VTT tracks.
                </p>
              </div>
            </div>
          </div>

          <div
            className="grid grid-cols-3 gap-3 p-3 rounded-xl text-[11px]"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} style={{ color: 'var(--gold2)' }} />
              <span>Official Feeds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Languages size={13} style={{ color: 'var(--blue)' }} />
              <span>8+ Studio Outputs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Download size={13} style={{ color: 'var(--green)' }} />
              <span>.SRT &amp; .VTT</span>
            </div>
          </div>
        </div>

        {/* Supported Multi-Language Matrix (Visible & Search-Engine Indexable) */}
        <section
          aria-label="Supported subtitle studio languages"
          className="p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-start gap-3">
            <Globe size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
            <div className="space-y-1 text-xs">
              <div className="font-semibold" style={{ color: 'var(--text)' }}>
                Multi-Language Subtitle Support
              </div>
              <p style={{ color: 'var(--text2)' }}>
                <strong style={{ color: 'var(--text)' }}>Catalog Sources:</strong>{' '}
                {sourceLanguages.map((l) => l.label).join(' · ')}
              </p>
              <p style={{ color: 'var(--text2)' }}>
                <strong style={{ color: 'var(--text)' }}>Studio Translation Outputs:</strong>{' '}
                {STUDIO_TARGET_LANGUAGES.map((l) => l.label).join(' · ')}
              </p>
            </div>
          </div>
          <Link
            href="/requests"
            className="text-xs font-semibold hover:underline whitespace-nowrap shrink-0"
            style={{ color: 'var(--gold2)' }}
          >
            Request a Movie Subtitle →
          </Link>
        </section>

        <OfficialSubtitleStudio initialQuery={initialQuery} />
      </div>
    </div>
  );
}
