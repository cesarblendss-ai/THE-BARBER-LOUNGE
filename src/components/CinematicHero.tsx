"use client";

import Image from "next/image";

import { ClockIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { SITE } from "@/lib/content";

type CinematicHeroProps = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export function CinematicHero({
  eyebrow,
  headline,
  subheadline,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CinematicHeroProps) {
  return (
    <section className="relative isolate flex min-h-[78svh] flex-col overflow-hidden bg-black text-white md:min-h-[100svh]">
      <div className="absolute inset-0">
        <Image
          src="/gallery/storefront-night.jpg?v=4"
          alt="The Barber Lounge storefront at night — 1518 A St, Antioch, CA"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_40%] md:object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pb-28 pt-28 sm:px-8 sm:pb-32 lg:justify-center lg:pb-36">
        <div className="max-w-[21rem] sm:max-w-xl lg:max-w-2xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/85 sm:text-[11px]">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-serif text-[clamp(2.75rem,8.5vw,5.5rem)] font-semibold leading-[0.96] tracking-[-0.03em] text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.55)]">
            {headline}
          </h1>
          <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-white/85 sm:text-lg">
            {subheadline}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={primaryHref}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-label="Book Appointment (cinematic hero)"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {primaryLabel}
              <span aria-hidden>→</span>
            </a>
            <a
              href={secondaryHref}
              data-analytics-label="View Our Work (cinematic hero)"
              className="inline-flex items-center justify-center rounded-md border border-white/75 bg-black/20 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {secondaryLabel}
            </a>
          </div>
        </div>
      </div>

      <div className="relative z-20 mt-auto border-t border-white/10 bg-black/55 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl gap-3 px-5 py-3.5 sm:grid-cols-3 sm:gap-0 sm:px-8 sm:py-4">
          <a
            href="https://maps.google.com/?q=1518+A+St,+Antioch,+CA+94509"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-white/90 transition hover:text-white sm:border-r sm:border-white/10 sm:pr-6"
          >
            <PinIcon className="h-4 w-4 shrink-0 stroke-white" />
            <span>{SITE.address}</span>
          </a>
          <a
            href={`tel:${SITE.phoneTel}`}
            data-analytics-label="Call or Text (hero info bar)"
            className="flex items-center gap-3 text-sm text-white/90 transition hover:text-white sm:border-r sm:border-white/10 sm:px-6"
          >
            <PhoneIcon className="h-4 w-4 shrink-0 stroke-white" />
            <span>
              {SITE.phone} <span className="text-white/55">Call or Text</span>
            </span>
          </a>
          <div className="flex items-center gap-3 text-sm text-white/90 sm:pl-6">
            <ClockIcon className="h-4 w-4 shrink-0 stroke-white" />
            <span>Walk-Ins Welcome, Appointments Preferred</span>
          </div>
        </div>
      </div>
    </section>
  );
}
