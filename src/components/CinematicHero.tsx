"use client";

import Image from "next/image";
import Link from "next/link";

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
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/gallery/storefront-night.jpg"
        alt="The Barber Lounge storefront at night — 1518 A St, Antioch, CA"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[58%_42%] sm:object-[55%_40%] motion-safe:animate-hero-ken"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/55 to-black/10"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-28 pt-28 sm:px-8 sm:pb-32 lg:justify-center lg:pb-36">
        <div className="max-w-xl motion-safe:animate-fade-up">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/70 sm:text-xs">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-serif text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {headline}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
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
            <Link
              href={secondaryHref}
              data-analytics-label="View Our Work (cinematic hero)"
              className="inline-flex items-center justify-center rounded-md border border-white/70 bg-transparent px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/70 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-4 sm:grid-cols-3 sm:gap-0 sm:px-8 sm:py-5">
          <a
            href="https://maps.google.com/?q=1518+A+St,+Antioch,+CA+94509"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-white/85 transition hover:text-white sm:border-r sm:border-white/10 sm:pr-6"
          >
            <PinIcon className="h-4 w-4 shrink-0 stroke-white" />
            <span>{SITE.address}</span>
          </a>
          <a
            href={`tel:${SITE.phoneTel}`}
            data-analytics-label="Call or Text (hero info bar)"
            className="flex items-center gap-3 text-sm text-white/85 transition hover:text-white sm:border-r sm:border-white/10 sm:px-6"
          >
            <PhoneIcon className="h-4 w-4 shrink-0 stroke-white" />
            <span>
              {SITE.phone} <span className="text-white/50">Call or Text</span>
            </span>
          </a>
          <div className="flex items-center gap-3 text-sm text-white/85 sm:pl-6">
            <ClockIcon className="h-4 w-4 shrink-0 stroke-white" />
            <span>Walk-Ins Welcome, Appointments Preferred</span>
          </div>
        </div>
      </div>

    </section>
  );
}
