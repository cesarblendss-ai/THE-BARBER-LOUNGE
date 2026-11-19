import type { Metadata } from "next";

import { SITE } from "@/lib/content";
import { SITE_URL } from "@/lib/constants";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Join our team",
  description:
    "Apply for barber jobs at The Barber Lounge and join our team in Antioch, CA. Sharp chairs, real craft, walk-in ready clients.",
  path: "/join-our-team",
});

const APPLY_MAIL = `mailto:${SITE.email}?subject=${encodeURIComponent(
  "Barber application — The Barber Lounge",
)}`;

export default function JoinOurTeamPage() {
  const jobJsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: "Barber",
    description:
      "Apply for barber jobs at The Barber Lounge and join our team. Looking for skilled barbers who can deliver clean fades, sharp line-ups, and a solid chairside experience in Antioch, CA.",
    datePosted: "2026-11-19",
    employmentType: "FULL_TIME",
    hiringOrganization: {
      "@type": "BarberShop",
      name: SITE.name,
      sameAs: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: "1518 A St",
        addressLocality: "Antioch",
        addressRegion: "CA",
        postalCode: "94509",
        addressCountry: "US",
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: "US",
    },
    directApply: true,
  };

  return (
    <section className="bg-black px-5 pb-24 pt-28 text-white sm:px-8 sm:pb-28 sm:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }}
      />

      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#C9A86C]/80">
          Careers
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          Join our team
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60">
          Apply for barber jobs at The Barber Lounge and join our team. We keep chairs busy with
          clients who want clean fades, sharp line-ups, and a shop that runs right.
        </p>

        <div className="mt-10 space-y-6 border-t border-white/10 pt-10 text-sm leading-relaxed text-white/70">
          <div>
            <h2 className="font-serif text-xl font-semibold text-white">Who we want</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Strong fades, tapers, and line-ups — no shortcuts</li>
              <li>Clean station, on-time, respectful with every client</li>
              <li>Comfortable building a chair and keeping regulars coming back</li>
              <li>Ready to work in Antioch at 1518 A St</li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-xl font-semibold text-white">How to apply</h2>
            <p className="mt-3">
              Send your name, phone, Instagram (or portfolio), and a short note on your experience.
              We&apos;ll reach back if there&apos;s a chair open.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={APPLY_MAIL}
            data-analytics-label="Apply email (join our team)"
            className="tim-gold-btn inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1a140c] transition hover:brightness-110"
          >
            Apply by email
            <span aria-hidden>→</span>
          </a>
          <a
            href={`tel:${SITE.phoneTel}`}
            data-analytics-label="Call shop (join our team)"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-[#C9A86C]/45 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E8D5A3] transition hover:bg-[#C9A86C]/10"
          >
            Call {SITE.phone}
          </a>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-label="DM Instagram (join our team)"
            className="inline-flex items-center justify-center rounded-md border border-white/20 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80 transition hover:border-white/40 hover:text-white"
          >
            DM {SITE.instagram}
          </a>
        </div>

        <p className="mt-8 text-xs text-white/40">
          The Barber Lounge · 1518 A St, Antioch, CA 94509
        </p>
      </div>
    </section>
  );
}
