import type { Metadata } from "next";
import Link from "next/link";

import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/content";
import { getReviewLandingUrl, REVIEW_QR_PATH } from "@/lib/reviews";

export const metadata: Metadata = {
  title: `Staff Hub — ${SITE.name}`,
  robots: { index: false, follow: false },
};

const TILES = [
  {
    href: "/admin/edit",
    label: "Edit site text",
    detail: "Inline copy changes without code",
  },
  {
    href: "/admin/hero",
    label: "Hero videos",
    detail: "Upload homepage background clips",
  },
  {
    href: "/admin/gallery",
    label: "Gallery",
    detail: "Manage service and shop photos",
  },
  {
    href: "/admin/estimates",
    label: "Estimates",
    detail: "Create, track, e-sign, and collect deposits",
  },
  {
    href: REVIEW_QR_PATH,
    label: "Review QR card",
    detail: "Printable in-shop Google review QR",
  },
] as const;

export default function AdminHubPage() {
  const reviewLink = getReviewLandingUrl();

  return (
    <section className="bg-bone px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <SectionLabel>Staff</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Barber Lounge Hub
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Quick links for the team — review capture, content, and uploads.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-brass/30 bg-charcoal px-5 py-5 text-center sm:px-6">
          <p className="font-sans text-xs font-semibold uppercase tracking-label text-brass">
            Review link for clients
          </p>
          <p className="mt-2 text-sm text-bone/70">
            Text this after a great cut — opens our review page, then Google.
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
