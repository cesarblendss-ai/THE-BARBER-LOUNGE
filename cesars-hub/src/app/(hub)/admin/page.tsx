import type { Metadata } from "next";
import Link from "next/link";

import { HUB_SECTION_CLASS } from "@hub/lib/hub";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/content";
import { REVIEW_QR_PATH } from "@/lib/reviews";

export const metadata: Metadata = {
  title: `Website tools — Cesar’s Hub — ${SITE.name}`,
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
    href: REVIEW_QR_PATH,
    label: "Review QR card",
    detail: "Printable in-shop Google review QR",
  },
] as const;

export default function HubWebsiteToolsPage() {
  return (
    <section className={HUB_SECTION_CLASS}>
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <SectionLabel>Cesar’s Hub</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Website tools
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Edit copy, hero videos, and gallery for The Barber Lounge site.
          </p>
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
