import type { Metadata } from "next";

import { SITE } from "@/lib/content";
import { SITE_URL } from "@/lib/constants";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Join our team",
  description:
    "Apply for barber jobs at The Barber Lounge and join our team in Antioch. Room for licensed barbers, apprentices, garage cutters, and young talent ready to grow.",
  path: "/join-our-team",
});

const APPLY_MAIL = `mailto:${SITE.email}?subject=${encodeURIComponent(
  "I'd like to join The Barber Lounge",
)}`;

const BENEFITS = [
  {
    title: "A real chair, not a hustle",
    body: "Steady walk-ins and regulars already coming through the door. You spend more time cutting — less time chasing clients from scratch.",
  },
  {
    title: "Room to grow",
    body: "Licensed, apprentice, cutting in a garage, still in school — if you want to get better and put in the work, we’ll meet you where you are and help you level up.",
  },
  {
    title: "People in your corner",
    body: "You’re not alone at a station. Shop support, tips from the team, and a culture that looks out for each other when the day gets busy.",
  },
  {
    title: "Your craft, your name",
    body: "Build your book, post your work, and make a name in Antioch. We want you known for your cuts — not buried under someone else’s brand.",
  },
] as const;

const WHO = [
  "Barbers already on a chair who want a better shop to call home",
  "Apprentices who need reps, guidance, and a real floor to learn on",
  "Garage and house cutters ready to step into a proper shop",
  "Younger barbers — including high school — who take the craft seriously",
] as const;

export default function JoinOurTeamPage() {
  const jobJsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: "Barber / Apprentice Barber",
    description:
      "Join The Barber Lounge in Antioch, CA. Open to licensed barbers, apprentices, garage cutters, and younger talent. Benefits include a busy chair, mentorship, shop support, and room to build your own book.",
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
    <section className="bg-black px-5 pb-24 pt-28 text-white sm:px-8 sm:pb-28 sm:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }}
      />

      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/40">
          Working at the Lounge
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          Join our team
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
          This shop was built for barbers who want a place that takes care of them — not just a
          chair to rent and figure out alone. If you love cutting hair and want room to grow, we
          want to hear from you.
        </p>

        <div className="mt-14">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-white">
            What you get here
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/50">
            The point isn’t a hard sell. It’s a fair shot at building a career with people who
            actually have your back.
          </p>
          <ul className="mt-8 space-y-8">
            {BENEFITS.map((item) => (
              <li key={item.title} className="border-t border-white/10 pt-6">
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 border-t border-white/10 pt-10">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-white">
            Who this is for
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/50">
            We’re willing to take apprentices. Garage barbers. Younger barbers. Even if you’re still
            in high school and serious about the craft — we want to help everybody who shows up
            ready to learn and work.
          </p>
          <ul className="mt-6 space-y-3 text-sm leading-relaxed text-white/70">
            {WHO.map((line) => (
              <li key={line} className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/40" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 border-t border-white/10 pt-10">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-white">
            Say hello
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
            No long application. Tell us who you are, where you’ve been cutting, and what you’re
            looking for. Drop a line by email, call the shop, or send a DM — we’ll talk it through
            like people.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={APPLY_MAIL}
              data-analytics-label="Email (join our team)"
              className="inline-flex items-center justify-center rounded-md border border-white/25 bg-white px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-white/90"
            >
              Email the shop
            </a>
            <a
              href={`tel:${SITE.phoneTel}`}
              data-analytics-label="Call shop (join our team)"
              className="inline-flex items-center justify-center rounded-md border border-white/25 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85 transition hover:border-white/45 hover:text-white"
            >
              Call {SITE.phone}
            </a>
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-label="DM Instagram (join our team)"
              className="inline-flex items-center justify-center rounded-md border border-white/25 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85 transition hover:border-white/45 hover:text-white"
            >
              DM {SITE.instagram}
            </a>
          </div>
        </div>

        <p className="mt-12 text-xs text-white/35">
          The Barber Lounge · 1518 A St, Antioch, CA 94509
        </p>
      </div>
    </section>
  );
}
