import Link from 'next/link';
import LegalPageShell from '../components/LegalPageShell';

const GOLD_LIGHT = '#e8c87a';

export default function AboutPage() {
  return (
    <LegalPageShell
      title="About Agasobanuye.rw"
      description="Learn about Agasobanuye.rw, Rwanda's editorial movie guide, Kinyarwanda subtitle studio, and curated entertainment directory operated by Iradukunda Didier."
      canonical="https://agasobanuye.rw/about"
      eyebrow="Publisher & Editorial Mission"
      activeHref="/about"
    >
      <section className="space-y-3">
        <h2 className="font-cinzel text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', color: GOLD_LIGHT }}>
          Our Editorial Purpose
        </h2>
        <p>
          Agasobanuye.rw is a Rwandan cinema discovery, subtitle translation, and entertainment guide operated by{' '}
          <strong style={{ color: '#f3efe3' }}>Iradukunda Didier</strong>. Our goal is to help viewers in Rwanda and
          across the diaspora discover international films, series, anime, and Kinyarwanda-translated releases
          (Agasobanuye) through structured overviews, cultural context, official trailer previews, and synchronized
          subtitles.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-cinzel text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', color: GOLD_LIGHT }}>
          How External Links & Previews Work
        </h2>
        <p>
          Agasobanuye.rw does not host or upload copyrighted video files on our own servers. Instead, every release page
          combines original catalog curation, synopsis commentary, creator attribution, and embedded official trailers
          alongside clearly labeled external watch or cloud mirror links hosted on third-party platforms such as
          YouTube, Vimeo, Google Drive, Netflix, Amazon Prime Video, and community Telegram channels.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-cinzel text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', color: GOLD_LIGHT }}>
          Kinyarwanda Subtitle Studio & Creators
        </h2>
        <p>
          Alongside curated links, we operate a free <Link href="/subtitles" className="underline" style={{ color: GOLD_LIGHT }}>Official Subtitles & Kinyarwanda Studio</Link>{' '}
          where visitors can search official .SRT and .VTT dialogue tracks and convert or download bilingual
          Kinyarwanda subtitles. Verified community translators and uploaders also earn transparent support through our{' '}
          <Link href="/earnings" className="underline" style={{ color: GOLD_LIGHT }}>Creator Earnings</Link> program.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-cinzel text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', color: GOLD_LIGHT }}>
          Editorial Contact & Support
        </h2>
        <p>
          For press inquiries, content requests, partnership questions, or copyright notices, please reach us directly via{' '}
          <Link href="/contact" className="underline" style={{ color: GOLD_LIGHT }}>our Contact page</Link> or review our{' '}
          <Link href="/dmca" className="underline" style={{ color: GOLD_LIGHT }}>DMCA Takedown Policy</Link>.
        </p>
      </section>
    </LegalPageShell>
  );
}
