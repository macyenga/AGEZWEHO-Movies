import Link from 'next/link';
import LegalPageShell from '../components/LegalPageShell';

const GOLD_LIGHT = '#e8c87a';

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of Service & External Link Disclaimer"
      description="Terms of Service for Agasobanuye.rw outlining our editorial catalog role, external link disclaimer, creator submissions, and community rules."
      canonical="https://agasobanuye.rw/terms"
      eyebrow="Platform Rules & Link Attribution"
      activeHref="/terms"
    >
      <section className="space-y-3">
        <h2 className="font-cinzel text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', color: GOLD_LIGHT }}>
          1. Editorial Catalog & External Link Policy
        </h2>
        <p>
          Agasobanuye.rw operates as an entertainment information index, review hub, subtitle studio, and link directory.
          We do not store, host, or stream proprietary film files on our infrastructure. All watch mirrors, cloud file
          links, and official platform references remain hosted on independent third-party domains and are presented
          for informational and discovery purposes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-cinzel text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', color: GOLD_LIGHT }}>
          2. Creator & Community Submissions
        </h2>
        <p>
          Uploaders and translators submitting release listings, descriptions, or .SRT / .VTT subtitle files warrant
          that their submitted metadata and descriptions are accurate and do not violate applicable laws or third-party
          rights. Administrators review pending submissions before public listing.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-cinzel text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', color: GOLD_LIGHT }}>
          3. Creator Support & Payments
        </h2>
        <p>
          Voluntary viewer contributions and Pro memberships processed via MTN MoMo Pay (Merchant ID 156833 — Iradukunda
          Didier) or Paypack Rwanda support platform hosting and creator payouts as detailed on our{' '}
          <Link href="/earnings" className="underline" style={{ color: GOLD_LIGHT }}>
            Creator Earnings
          </Link>{' '}
          and{' '}
          <Link href="/support" className="underline" style={{ color: GOLD_LIGHT }}>
            Support
          </Link>{' '}
          pages.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-cinzel text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', color: GOLD_LIGHT }}>
          4. Changes to Terms
        </h2>
        <p>
          We may update these terms to reflect new subtitle tools, editorial guidelines, or advertising compliance
          requirements. Continued use of Agasobanuye.rw signifies acceptance of the updated terms.
        </p>
      </section>
    </LegalPageShell>
  );
}
