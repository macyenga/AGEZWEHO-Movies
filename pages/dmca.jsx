import Link from 'next/link';
import LegalPageShell from '../components/LegalPageShell';

const GOLD_LIGHT = '#e8c87a';

export default function DmcaPage() {
  return (
    <LegalPageShell
      title="DMCA & Copyright Takedown Policy"
      description="DMCA and copyright notice procedure for Agasobanuye.rw — fast link removal and rights-holder contact."
      canonical="https://agasobanuye.rw/dmca"
      eyebrow="Intellectual Property Compliance"
      activeHref="/dmca"
    >
      <section className="space-y-3">
        <h2 className="font-cinzel text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', color: GOLD_LIGHT }}>
          1. Respect for Copyright Holders
        </h2>
        <p>
          Agasobanuye.rw respects the intellectual property rights of filmmakers, distributors, studios, and subtitle
          authors. Because our platform indexes third-party external URLs and publicly embedded trailers, we maintain a
          strict notice-and-takedown workflow for any external reference reported by an authorized rights owner.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-cinzel text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', color: GOLD_LIGHT }}>
          2. How to Submit a Takedown Request
        </h2>
        <p>To request removal of an external link or listing, please include the following details:</p>
        <ul className="list-disc pl-6 space-y-1.5 text-sm" style={{ color: '#b8b4a8' }}>
          <li>Your full name, organization, and verifiable contact email or phone number.</li>
          <li>The exact Agasobanuye.rw page URL (e.g., https://agasobanuye.rw/movies/...) and the specific external URL.</li>
          <li>Identification of the copyrighted work claimed to be infringed.</li>
          <li>A good-faith statement that the disputed link is not authorized by the copyright owner or agent.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-cinzel text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', color: GOLD_LIGHT }}>
          3. Response Timeline
        </h2>
        <p>
          Verified notices submitted via our{' '}
          <Link href="/contact" className="underline" style={{ color: GOLD_LIGHT }}>
            Contact page
          </Link>{' '}
          are reviewed by site operator <strong style={{ color: '#f3efe3' }}>Iradukunda Didier</strong> and disabled or
          removed within <strong style={{ color: '#f3efe3' }}>24–48 hours</strong>.
        </p>
      </section>
    </LegalPageShell>
  );
}
