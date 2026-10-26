import type { Metadata } from "next";

import { BarberInstagramGrid } from "@/components/BarberInstagramGrid";
import { getSiteContent } from "@/lib/get-site-content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Barbers — The Barber Lounge Antioch",
  description:
    "Meet the barbers at The Barber Lounge in Antioch, CA. Follow each artist on Instagram.",
  path: "/about",
});

export default async function AboutPage() {
  const content = await getSiteContent();
  const members = content.ABOUT.team.members;

  return (
    <section className="bg-black px-5 pb-20 pt-28 text-white sm:px-8 sm:pb-28 sm:pt-32">
      <div className="mx-auto max-w-7xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">Barbers</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          The team
        </h1>
        <p className="mt-4 max-w-xl text-white/60">
          Tap a barber to open their Instagram and see recent work.
        </p>
        <div className="mt-12">
          <BarberInstagramGrid members={members} />
        </div>
      </div>
    </section>
  );
}
