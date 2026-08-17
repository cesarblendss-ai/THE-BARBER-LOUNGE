import type { Metadata } from "next";
import Link from "next/link";

import { SectionLabel } from "@/components/SectionLabel";
import { BOOKING_URL, HOURS, SITE } from "@/lib/content";
import {
  HUB_DEAD_HOSTS,
  HUB_GITHUB_URL,
  HUB_LIVE_URL,
  HUB_SECTION_CLASS,
  HUB_VERCEL_URL,
} from "@/lib/hub";

export const metadata: Metadata = {
  title: `Shop manual — Cesar’s Hub — ${SITE.name}`,
  robots: { index: false, follow: false },
};

const SURFACES = [
  {
    name: "Cesar’s Hub",
    who: "You",
    url: HUB_LIVE_URL,
    use: "Calendar, bookings, retail, alerts, this manual",
  },
  {
    name: "Staff Hub",
    who: "Floor",
    url: "https://the-barber-lounge-antioch.vercel.app/admin",
    use: "This week (read), reviews, website uploads",
  },
  {
    name: "Public site",
    who: "Clients",
    url: "https://the-barber-lounge-antioch.vercel.app",
    use: "Marketing + Booksy",
  },
] as const;

export default function HubManualPage() {
  return (
    <section className={HUB_SECTION_CLASS}>
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <SectionLabel>Cesar’s Hub</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Shop manual
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            The business lives here and in GitHub. Cursor chats and OneDrive folders are not the
            backup.
          </p>
        </div>

        <article className="mt-10 space-y-8 text-charcoal/80">
          <section className="rounded-2xl border border-charcoal/10 bg-white p-5 sm:p-6">
            <h2 className="font-serif text-2xl font-semibold text-charcoal">If Cursor is gone</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5">
              <li>
                Open{" "}
                <a href={HUB_LIVE_URL} className="break-all text-brass hover:underline">
                  {HUB_LIVE_URL}
                </a>
              </li>
              <li>Unlock with the hub key from Vercel → Production → ADMIN_UPLOAD_KEY.</li>
              <li>Add to Home Screen. Run the shop from the tiles.</li>
              <li>
                Code backup:{" "}
                <a href={HUB_GITHUB_URL} className="break-all text-brass hover:underline">
                  {HUB_GITHUB_URL}
                </a>
              </li>
            </ol>
            <p className="mt-4 text-sm">
              You do not need an agent to take a booking, log retail, or post this week.
            </p>
            <p className="mt-3 text-sm">
              <span className="font-semibold text-charcoal">localhost:8743</span> was the old local
              dashboard (<code className="text-charcoal">?biz=barber-lounge</code>). It only exists
              on that computer while the process is running. Replace that bookmark with the live
              hub URL above.
            </p>
          </section>

          <section className="rounded-2xl border border-charcoal/10 bg-white p-5 sm:p-6">
            <h2 className="font-serif text-2xl font-semibold text-charcoal">Where it is stored</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <span className="font-semibold text-charcoal">Live app — </span>
                Vercel project{" "}
                <a href={HUB_VERCEL_URL} className="text-brass hover:underline">
                  the-barber-lounge
                </a>
              </li>
              <li>
                <span className="font-semibold text-charcoal">Code — </span>
                GitHub THE-BARBER-LOUNGE. Merge to main, then Vercel deploys.
              </li>
              <li>
                <span className="font-semibold text-charcoal">Shop data — </span>
                Postgres when DATABASE_URL / TBLDB_* is set. Otherwise JSON under data/ (ephemeral
                on Vercel).
              </li>
              <li>
                <span className="font-semibold text-charcoal">This page — </span>
                Built into the hub. Also{" "}
                <Link href="/hub" className="text-brass hover:underline">
                  /hub
                </Link>
                .
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-charcoal/10 bg-white p-5 sm:p-6">
            <h2 className="font-serif text-2xl font-semibold text-charcoal">Surfaces</h2>
            <ul className="mt-4 space-y-4">
              {SURFACES.map((surface) => (
                <li key={surface.name}>
                  <p className="font-semibold text-charcoal">
                    {surface.name}{" "}
                    <span className="font-normal text-charcoal/55">· {surface.who}</span>
                  </p>
                  <p className="text-sm">{surface.use}</p>
                  <a href={surface.url} className="mt-1 block break-all font-mono text-xs text-brass">
                    {surface.url}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              Do not use {HUB_DEAD_HOSTS.join(" or ")} until DNS is fixed — those park on
              HugeDomains.
            </p>
          </section>

          <section className="rounded-2xl border border-charcoal/10 bg-white p-5 sm:p-6">
            <h2 className="font-serif text-2xl font-semibold text-charcoal">{SITE.name}</h2>
            <p className="mt-3">{SITE.address}</p>
            <p>
              <a href={`tel:${SITE.phoneTel}`} className="text-brass hover:underline">
                {SITE.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${SITE.email}`} className="text-brass hover:underline">
                {SITE.email}
              </a>
            </p>
            <p>
              <a href={SITE.instagramUrl} className="text-brass hover:underline">
                {SITE.instagram}
              </a>
            </p>
            <p className="mt-3">
              Booksy:{" "}
              <a href={BOOKING_URL} className="break-all text-brass hover:underline">
                {BOOKING_URL}
              </a>
            </p>
            <ul className="mt-4 space-y-1 text-sm">
              {HOURS.map((row) => (
                <li key={row.day} className="flex justify-between gap-4">
                  <span className="font-medium text-charcoal">{row.day}</span>
                  <span>{row.hours}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">Haircut $50 · Cut &amp; beard $65</p>
          </section>
        </article>
      </div>
    </section>
  );
}
