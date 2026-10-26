import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/Button";
import { CinematicHero } from "@/components/CinematicHero";
import { CinematicServices } from "@/components/CinematicServices";
import { EditableText } from "@/components/EditableText";
import { GalleryLightbox } from "@/components/GalleryLightbox";
import { HeroVideoGrid } from "@/components/HeroVideoGrid";
import { LeaveReviewSection } from "@/components/LeaveReviewSection";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { BOOKING_URL, SITE, TESTIMONIALS } from "@/lib/content";
import { getResolvedAllGallery } from "@/lib/gallery-files";
import { HERO_VIDEOS } from "@/lib/gallery";
import { getSiteContent } from "@/lib/get-site-content";
import {
  ensureHeroVideoPlaceholders,
  getHeroVideoVersion,
  withHeroVideoCacheBust,
} from "@/lib/hero-video";
import { buildPageMetadata } from "@/lib/seo";
import { SERVICE_AREA_CITIES } from "@/lib/service-area";

export const metadata: Metadata = buildPageMetadata({
  title: "Best Barbershop in Antioch, CA",
  description:
    "More than a haircut. Precision cuts and premium service at The Barber Lounge — 1518 A St, Antioch, CA. Book online or call (925) 209-5995.",
  path: "/",
});

export default async function HomePage() {
  const content = await getSiteContent();
  const { HOME } = content;
  const { hero, aboutTeaser, finalCta } = HOME;
  const galleryImages = getResolvedAllGallery();

  ensureHeroVideoPlaceholders();

  const heroVideos = HERO_VIDEOS.map((entry) => ({
    src: withHeroVideoCacheBust(entry.src, getHeroVideoVersion(entry.slot), entry.slot),
    alt: entry.alt,
  }));

  return (
    <div className="bg-black text-white">
      <CinematicHero
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        subheadline={hero.subheadline}
        primaryLabel={hero.ctaPrimary.label}
        primaryHref={hero.ctaPrimary.href || BOOKING_URL}
        secondaryLabel={hero.ctaSecondary.label}
        secondaryHref="/gallery"
      />

      <CinematicServices />

      <HeroVideoGrid
        videos={heroVideos}
        ctaHref={hero.ctaPrimary.href || BOOKING_URL}
        ctaLabel={hero.ctaPrimary.label}
        headline="See the craft in motion."
      />

      <section className="border-t border-white/10 bg-black px-5 py-16 sm:px-8 sm:py-24" aria-labelledby="about-heading">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">The Shop</p>
          <EditableText
            path="HOME.aboutTeaser.headline"
            defaultValue={aboutTeaser.headline}
            as="h2"
            id="about-heading"
            className="mt-3 font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          />
          <EditableText
            path="HOME.aboutTeaser.body"
            defaultValue={aboutTeaser.body}
            as="p"
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/65"
            multiline
          />
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={aboutTeaser.cta.href} variant="glass" className="ring-offset-black">
              <EditableText
                path="HOME.aboutTeaser.cta.label"
                defaultValue={aboutTeaser.cta.label}
                as="span"
              />
            </Button>
            <Button
              href={`tel:${SITE.phoneTel}`}
              variant="ghost"
              className="border-white/30 text-white hover:border-white hover:text-white ring-offset-black"
              analyticsLabel="Call Now (about teaser)"
            >
              Call {SITE.phone}
            </Button>
          </div>
        </div>
      </section>

      {galleryImages.length > 0 ? (
        <section
          id="gallery"
          className="border-t border-white/10 bg-black px-5 py-16 sm:px-8 sm:py-24"
          aria-labelledby="gallery-heading"
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">
                  Our Work
                </p>
                <h2
                  id="gallery-heading"
                  className="mt-3 font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl"
                >
                  Fresh cuts from the chair
                </h2>
                <p className="mt-3 max-w-xl text-white/55">
                  Real clients, real fades — tap any photo to enlarge.
                </p>
              </div>
              <Link
                href="/gallery"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60 transition hover:text-white"
              >
                View full gallery →
              </Link>
            </div>
            <div className="mt-10">
              <GalleryLightbox images={galleryImages.slice(0, 12)} columns={4} />
            </div>
          </div>
        </section>
      ) : null}

      <section
        className="border-t border-white/10 bg-black px-5 py-16 sm:px-8 sm:py-24"
        aria-labelledby="testimonials-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">
              {TESTIMONIALS.hero.subheadline}
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

      <div className="border-t border-white/10 bg-black">
        <LeaveReviewSection />
      </div>

      <section
        className="border-t border-white/10 bg-black px-5 py-16 sm:px-8 sm:py-20"
        aria-labelledby="areas-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">
                Service Area
              </p>
              <h2
                id="areas-heading"
                className="mt-3 font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              >
                East Bay cities we serve
              </h2>
              <p className="mt-3 max-w-xl text-white/55">
                One Antioch shop — clients drive from across Contra Costa and the Tri-Valley for
                consistent fades.
              </p>
            </div>
            <Link
              href="/locations"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60 transition hover:text-white"
            >
              All locations →
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">
            {SERVICE_AREA_CITIES.filter((c) => c.slug !== "antioch")
              .slice(0, 8)
              .map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/areas/${city.slug}`}
                    className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 transition hover:border-white/40 hover:text-white"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            <li>
              <Link
                href="/locations"
                className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white"
              >
                +8 more
              </Link>
            </li>
          </ul>
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
          <p className="mt-6 text-sm text-white/45">
            <EditableText
              path="SITE.address"
              defaultValue={content.SITE.address}
              as="span"
              className="text-sm text-white/45"
            />
          </p>
        </div>
      </section>
    </div>
  );
}
