import type { Metadata } from "next";
import Link from "next/link";

import { HubInstallHint } from "@/components/HubInstallHint";
import { SectionLabel } from "@/components/SectionLabel";
import { StaffWeekCalendar } from "@/components/StaffWeekCalendar";
import { SITE } from "@/lib/content";
import { HUB_LIVE_URL, HUB_SECTION_CLASS } from "@/lib/hub";
import { getReviewLandingUrl, REVIEW_QR_PATH } from "@/lib/reviews";
import { getShopWeekView } from "@/lib/shop-week-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Cesar’s Hub — ${SITE.name}`,
  robots: { index: false, follow: false },
};

const TILES = [
  {
    href: "/hub/estimates",
    label: "Estimates",
    detail: "Create, share, e-sign, collect deposit",
  },
  {
    href: "/hub/manual",
    label: "Shop manual",
    detail: "URLs, recovery, hours — stored here, not in Cursor",
  },
  {
    href: "/hub/calendar",
    label: "Set this week",
    detail: "Open, closed, notes, blocked slots",
  },
  {
    href: "/hub/appointments",
    label: "Appointments",
    detail: "Website requests — enter in Booksy",
  },
  {
    href: "/hub/products",
    label: "Retail",
    detail: "Inventory, barber grabs, Friday settle",
  },
  {
    href: "/shop-log",
    label: "Shop log",
    detail: "Barbers log product on the floor",
  },
  {
    href: "/hub/analytics",
    label: "Site traffic",
    detail: "Anonymous visits — not Google call taps",
  },
  {
    href: "/hub/notifications",
    label: "Phone push",
    detail: "ntfy alerts when someone books",
  },
  {
    href: "/hub/sms-setup",
    label: "SMS setup",
    detail: "Twilio receipts — KYC still pending",
  },
  {
    href: REVIEW_QR_PATH,
    label: "Review QR",
    detail: "Printable Google review card",
  },
  {
    href: "/admin",
    label: "Website tools",
    detail: "Edit copy, hero videos, gallery",
  },
] as const;

export default async function HubHomePage() {
  const weekView = await getShopWeekView();
  const reviewLink = getReviewLandingUrl();

  return (
    <section className={HUB_SECTION_CLASS}>
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <SectionLabel>The Barber Lounge</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Cesar’s Hub
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            This is the shop OS. It lives on the live site and in GitHub. Cursor is optional.
          </p>
          <p className="mt-3 break-all font-mono text-xs text-charcoal/50">{HUB_LIVE_URL}</p>
        </div>

        <HubInstallHint />

        <div className="mt-10">
          <StaffWeekCalendar view={weekView} />
        </div>

        <div className="mt-8 rounded-2xl border border-brass/30 bg-charcoal px-5 py-5 text-center sm:px-6">
          <p className="font-sans text-xs font-semibold uppercase tracking-label text-brass">
            Review link for clients
          </p>
          <a
            href={reviewLink}
            className="mt-3 inline-block break-all font-mono text-sm text-bone underline-offset-2 hover:text-brass hover:underline"
          >
            {reviewLink}
          </a>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {TILES.map((tile) => (
            <li key={tile.href}>
              <Link
                href={tile.href}
                className="block rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm transition-colors hover:border-brass/40"
              >
                <p className="font-serif text-xl font-semibold text-charcoal">{tile.label}</p>
                <p className="mt-1 text-sm text-charcoal/60">{tile.detail}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
