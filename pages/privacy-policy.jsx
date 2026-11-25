import Link from 'next/link';
import LegalPageShell from '../components/LegalPageShell';

const GOLD_LIGHT = '#e8c87a';

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      description="Privacy Policy for Agasobanuye.rw covering cookies, Google AdSense advertising preferences, local watchlist storage, and external link safety."
      canonical="https://agasobanuye.rw/privacy-policy"
      eyebrow="Data & Advertising Transparency"
      activeHref="/privacy-policy"
    >
      <section className="space-y-3">
        <h2 className="font-cinzel text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', color: GOLD_LIGHT }}>
          1. Information We Collect
        </h2>
        <p>
          Agasobanuye.rw collects only the information you voluntarily provide when submitting a movie request,
          subscribing to our release newsletter, contacting support, or creating a registered account (such as your name
          or email address). Anonymous visitors can browse movie guides, play inline previews, and download .SRT
          subtitles without registering.
        </p>
        <p>
          Preferences such as your saved Watchlist bookmarks, language choice (English or Kinyarwanda), and star ratings
          may be stored locally in your browser&apos;s <code className="text-xs px-1.5 py-0.5 rounded bg-white/5">localStorage</code>{' '}
          or synced securely to your authenticated Supabase profile when signed in.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-cinzel text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', color: GOLD_LIGHT }}>
          2. Google AdSense & Third-Party Advertising Cookies
        </h2>
        <p>
          Agasobanuye.rw may display advertisements served by Google AdSense and partner ad networks. Third-party vendors,
          including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other
          websites on the internet.
        </p>
        <p>
          Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit
          to Agasobanuye.rw and/or other sites. You may opt out of personalized advertising at any time by visiting{' '}
          <a
            href="https://adssettings.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: GOLD_LIGHT }}
          >
            Google Ads Settings
          </a>{' '}
          or{' '}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: GOLD_LIGHT }}
          >
            aboutads.info
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-cinzel text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', color: GOLD_LIGHT }}>
          3. Third-Party External Links & Embedded Previews
        </h2>
        <p>
          Our catalog includes links and embedded previews hosted on external third-party services (such as YouTube,
          Vimeo, Google Drive, Netflix, Amazon Prime Video, OpenSubtitles, and community channels). Clicking an external
          link leaves Agasobanuye.rw; we do not control and are not responsible for the privacy practices or cookie
          policies of external websites.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-cinzel text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', color: GOLD_LIGHT }}>
          4. Data Rights & Contact
        </h2>
        <p>
          You may request deletion of your newsletter email, user account, or submitted message at any time through our{' '}
          <Link href="/contact" className="underline" style={{ color: GOLD_LIGHT }}>
            Contact page
          </Link>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
