import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Subtitles, Download, Languages, Sparkles } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import OfficialSubtitleStudio from '../components/OfficialSubtitleStudio';

const GOLD_LIGHT = '#e8c87a';

export default function SubtitlesPage() {
  const router = useRouter();
  const initialQuery = typeof router.query.q === 'string' ? router.query.q : '';

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Official Subtitles & Kinyarwanda Translator — Agasobanuye.rw"
        description="Find and download the latest official movie and series subtitles (.SRT / .VTT) and translate them into Kinyarwanda."
        canonical="https://agasobanuye.rw/subtitles"
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-[#e8c87a]"
              style={{ color: '#8a8778' }}
            >
              <ArrowLeft size={13} />
              <span>Back to Catalog</span>
            </Link>

            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(201,168,76,0.12)',
                  border: '1px solid rgba(201,168,76,0.32)',
                }}
              >
                <Subtitles size={20} style={{ color: GOLD_LIGHT }} />
              </div>
              <div>
                <h1
                  className="font-cinzel font-bold text-xl sm:text-2xl tracking-wide"
                  style={{
                    fontFamily: 'Cinzel, serif',
                    background: 'linear-gradient(135deg,#f5e4a8,#c9a84c)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Official Subtitles & Kinyarwanda Studio
                </h1>
                <p className="text-xs sm:text-sm mt-0.5" style={{ color: '#9c988b' }}>
                  Search official movie and series subtitles, translate dialogue cues to Kinyarwanda, and download ready-to-play .SRT or .VTT files.
                </p>
              </div>
            </div>
          </div>

          <div
            className="grid grid-cols-3 gap-3 p-3 rounded-xl text-[11px]"
            style={{
              background: 'rgba(14,14,22,0.78)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#c8c3b6',
            }}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} style={{ color: GOLD_LIGHT }} />
              <span>Official Feeds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Languages size={13} style={{ color: '#7dd3fc' }} />
              <span>Kinyarwanda AI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Download size={13} style={{ color: '#86efac' }} />
              <span>.SRT & .VTT</span>
            </div>
          </div>
        </div>

        <OfficialSubtitleStudio initialQuery={initialQuery} />
      </div>
    </div>
  );
}
