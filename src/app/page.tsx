import type { Metadata } from "next";

import { CinematicHero } from "@/components/CinematicHero";
import { CinematicServices } from "@/components/CinematicServices";
import { EditableText } from "@/components/EditableText";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { BOOKING_URL, SITE, TESTIMONIALS } from "@/lib/content";
import { HERO_VIDEOS } from "@/lib/gallery";
import { getSiteContent } from "@/lib/get-site-content";
import {
  ensureHeroVideoPlaceholders,
  getHeroVideoVersion,
  withHeroVideoCacheBust,
} from "@/lib/hero-video";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Best Barbershop in Antioch, CA",
  description:
    "More than a haircut. Precision cuts and premium service at The Barber Lounge — 1518 A St, Antioch, CA. Book online or call (925) 209-5995.",
  path: "/",
});

export default async function HomePage() {
  const content = await getSiteContent();
  const { HOME } = content;
  const { hero, finalCta } = HOME;

  ensureHeroVideoPlaceholders();

  // Opener order: blue cape → neck lineup → finished trim (before he moves)
  const heroPlayOrder = [2, 3, 1] as const;
  const heroVideos = heroPlayOrder.map((slot) => {
    const entry = HERO_VIDEOS.find((item) => item.slot === slot)!;
    return {
      src: withHeroVideoCacheBust(entry.src, getHeroVideoVersion(entry.slot), entry.slot),
      alt: entry.alt,
    };
  });

  const firstVideoSrc = heroVideos[0]?.src;

  return (
    <div className="bg-black text-white">
      {firstVideoSrc ? (
        <link rel="preload" as="video" href={firstVideoSrc} type="video/mp4" />
      ) : null}
      <CinematicHero
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        subheadline={hero.subheadline}
        primaryLabel={hero.ctaPrimary.label}
        primaryHref={hero.ctaPrimary.href || BOOKING_URL}
        secondaryLabel={hero.ctaSecondary.label || "Call Now"}
        secondaryHref={hero.ctaSecondary.href || `tel:${SITE.phoneTel}`}
        videos={heroVideos}
      />

      <CinematicServices />

      <section
        id="testimonials"
        className="border-t border-white/10 bg-black px-5 py-16 sm:px-8 sm:py-24"
        aria-labelledby="testimonials-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">
              {SITE.rating}★ · {SITE.reviewCount}+ reviews
            </p>
            <h2
              id="testimonials-heading"
              className="mt-3 font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              {TESTIMONIALS.hero.headline}
            </h2>
          </div>
          <div className="mt-12">
            <TestimonialCarousel quotes={TESTIMONIALS.quotes} />
          </div>
        </div>
      </section>

      <section
        className="border-t border-white/10 bg-black px-5 py-20 sm:px-8 sm:py-28"
        aria-labelledby="final-cta-heading"
      >
        <div className="mx-auto max-w-3xl text-center">
          <EditableText
            path="HOME.finalCta.headline"
            defaultValue={finalCta.headline}
            as="h2"
            id="final-cta-heading"
            className="font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl"
          />
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={finalCta.cta.href || BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-label="Book Now (final CTA)"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-white/90"
            >
              <EditableText path="HOME.finalCta.cta.label" defaultValue={finalCta.cta.label} as="span" />
              <span aria-hidden>→</span>
            </a>
            <a
              href={`tel:${SITE.phoneTel}`}
              data-analytics-label="Call Now (final CTA)"
              className="inline-flex items-center justify-center rounded-md border border-white/60 px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
            >
              Call {SITE.phone}
            </a>
          </div>
          <p className="mt-6 text-sm text-white/45">{SITE.address}</p>
        </div>
      </section>
    </div>
  );
}
