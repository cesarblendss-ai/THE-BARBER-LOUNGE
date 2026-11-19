import type { Metadata } from "next";

import { JoinTeamApplyForm } from "@/components/JoinTeamApplyForm";
import { SITE } from "@/lib/content";
import { SITE_URL } from "@/lib/constants";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Join our team",
  description:
    "Apply for barber jobs at The Barber Lounge and join our team in Antioch. Licensed barbers, apprentices, garage cutters, and young talent welcome.",
  path: "/join-our-team",
});

export default function JoinOurTeamPage() {
  const jobJsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: "Barber / Apprentice Barber",
    description:
      "Join The Barber Lounge in Antioch, CA. Open to licensed barbers, apprentices, garage cutters, and younger talent — including high school barbers ready to learn.",
    datePosted: "2026-11-19",
    employmentType: ["FULL_TIME", "PART_TIME", "INTERN"],
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
    <section className="bg-bone px-5 pb-24 pt-28 text-charcoal sm:px-8 sm:pb-28 sm:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }}
      />

      <div className="mx-auto max-w-3xl text-center">
        <p className="font-serif text-sm uppercase tracking-[0.2em] text-charcoal/70">
          We&apos;re hiring!
        </p>
        <h1 className="mt-4 font-sans text-4xl font-bold tracking-tight text-charcoal sm:text-5xl">
          Join Our Team
        </h1>
        <p className="mx-auto mt-5 max-w-xl font-serif text-base leading-relaxed text-charcoal/75 sm:text-lg">
          Built for barbers who want a real chair, room to grow, and a shop that has their back —
          whether you&apos;re licensed, apprenticing, cutting in a garage, or still in high school
          and serious about the craft.
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-3xl">
        <h2 className="mb-8 text-center font-sans text-2xl font-bold tracking-tight text-charcoal">
          Apply Now
        </h2>
        <JoinTeamApplyForm />
      </div>

      <p className="mx-auto mt-16 max-w-3xl text-center text-xs text-charcoal/40">
        The Barber Lounge · 1518 A St, Antioch, CA 94509
      </p>
    </section>
  );
}
