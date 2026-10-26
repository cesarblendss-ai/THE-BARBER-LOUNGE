import type { Metadata } from "next";

import { BarberProfileGrid } from "@/components/BarberProfileGrid";
import { ABOUT, BOOKING_URL } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Barbers — The Barber Lounge Antioch",
  description:
    "Meet the barbers at The Barber Lounge in Antioch, CA. Book Alexis, Braulio, Cesar, Kristian, or Sebastian on Booksy.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <section className="bg-black px-5 pb-24 pt-28 text-white sm:px-8 sm:pb-28 sm:pt-32">
      <div className="mx-auto max-w-7xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">Barbers</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          Book your barber
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60">
          Choose who you want in the chair. Each button opens Booksy with that barber ready to book.
        </p>

        <div className="mt-10">
          <BarberProfileGrid members={ABOUT.team} />
        </div>

        <div className="mt-12 flex flex-col items-start gap-3 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/55">Not sure who to book? Start on Booksy and pick from the team.</p>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-label="Book Appointment (barbers footer)"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-white/90"
          >
            Book Appointment
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
