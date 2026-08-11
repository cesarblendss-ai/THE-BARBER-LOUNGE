import type { Metadata } from "next";

import { Button } from "@/components/Button";
import { SectionLabel } from "@/components/SectionLabel";
import { BOOKING_URL, SITE } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Refer a Friend — The Barber Lounge Antioch",
  description:
    "Love your cut at The Barber Lounge? Share the shop with a friend and book their first visit online.",
  path: "/refer",
});

const SHARE_TEXT =
  "Check out The Barber Lounge in Antioch — sharp fades and real craft. Book online:";

export default function ReferPage() {
  const fullShare = `${SHARE_TEXT} ${BOOKING_URL}`;

  return (
    <>
      <section className="bg-bone px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>SHARE THE LOUNGE</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Know Someone Who Needs a Fresh Cut?
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Send them to The Barber Lounge — signature cuts, expert fades, and a barbershop that
            treats every chair like reputation is on the line.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button href={BOOKING_URL} external size="lg">
              Book for a Friend
            </Button>
            <Button href={`tel:${SITE.phoneTel}`} variant="ghost">
              Call {SITE.phone}
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-bone px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-xl rounded-2xl border border-charcoal/10 bg-white p-6 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-brass">Copy & share</p>
          <p className="mt-3 text-sm leading-relaxed text-charcoal/80">{fullShare}</p>
          <p className="mt-4 text-xs text-charcoal/50">
            Text this to a friend or share on Instagram — tag {SITE.instagram}
          </p>
        </div>
      </section>

      <section className="bg-bone px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-xl text-center text-sm text-charcoal/60">
          <p>{SITE.address}</p>
          <p className="mt-2">
            <a href={SITE.instagramUrl} className="text-brass hover:underline">
              {SITE.instagram}
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
