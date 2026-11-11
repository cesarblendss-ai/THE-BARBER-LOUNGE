import type { Metadata } from "next";

import { CinematicServices } from "@/components/CinematicServices";
import { EditableText } from "@/components/EditableText";
import { SITE, SITE_BOOK_PATH } from "@/lib/content";
import { getSiteContent } from "@/lib/get-site-content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Barber Services in Antioch, CA",
  description:
    "Signature Haircut $50 and Haircut & Beard $65 at The Barber Lounge in Antioch, CA. Book online or call.",
  path: "/services",
});

export default async function ServicesPage() {
  const content = await getSiteContent();
  const { SERVICES } = content;
  const { note, cta } = SERVICES;

  return (
    <div className="bg-black text-white">
      <section className="px-5 pb-4 pt-28 sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">Services</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Book your cut
          </h1>
          <p className="mt-4 max-w-xl text-white/60">
            Two clear options. Tap a card to book online, or call {SITE.phone}.
          </p>
        </div>
      </section>

      <CinematicServices />

      <section className="border-t border-white/10 px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <EditableText
            path="SERVICES.note"
            defaultValue={note}
            as="p"
            className="text-sm leading-relaxed text-white/55"
            multiline
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={cta.href || SITE_BOOK_PATH}
              {...((cta.href || SITE_BOOK_PATH).startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="inline-flex items-center justify-center rounded-md bg-holly px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-holly-bright"
            >
              <EditableText path="SERVICES.cta.label" defaultValue={cta.label} as="span" />
            </a>
            <a
              href={`tel:${SITE.phoneTel}`}
              className="inline-flex items-center justify-center rounded-md border border-pine/60 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-snow transition hover:bg-pine/15"
            >
              Call Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
