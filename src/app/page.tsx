import type { Metadata } from "next";

import { CinematicHero } from "@/components/CinematicHero";
import { CinematicServices } from "@/components/CinematicServices";
import { HomeFinalCta } from "@/components/HomeFinalCta";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { SITE, SITE_BOOK_PATH, TESTIMONIALS } from "@/lib/content";
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
        primaryHref={hero.ctaPrimary.href || SITE_BOOK_PATH}
        secondaryLabel={hero.ctaSecondary.label || "Call Now"}
        secondaryHref={hero.ctaSecondary.href || `tel:${SITE.phoneTel}`}
        videos={heroVideos}
      />

      {/* Conversion path first: services + book/call before social proof */}
      <CinematicServices />

      <section
        id="testimonials"
        className="border-t border-white/10 bg-black px-5 py-14 sm:px-8 sm:py-16"
        aria-labelledby="testimonials-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">
              {SITE.rating}★ · {SITE.reviewCount}+ reviews
            </p>
            <h2
              id="testimonials-heading"
              className="mt-3 font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              {TESTIMONIALS.hero.headline}
            </h2>
            <p className="mt-3 text-sm text-white/55">{TESTIMONIALS.hero.subheadline}</p>
          </div>
          <div className="mt-8">
            <TestimonialCarousel quotes={TESTIMONIALS.quotes} />
          </div>
        </div>
      </section>

      <HomeFinalCta
        headline={finalCta.headline}
        ctaLabel={finalCta.cta.label}
        ctaHref={finalCta.cta.href || SITE_BOOK_PATH}
      />
    </div>
  );
}
