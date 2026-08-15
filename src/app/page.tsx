import type { Metadata } from "next";
import Image from "next/image";

import { Button } from "@/components/Button";
import { EditableText } from "@/components/EditableText";
import { HeroVideoGrid } from "@/components/HeroVideoGrid";
import { SectionLabel } from "@/components/SectionLabel";
import { ServiceCard } from "@/components/ServiceCard";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { LeaveReviewSection } from "@/components/LeaveReviewSection";
import { StarIcon } from "@/components/icons";
import { SITE, TESTIMONIALS } from "@/lib/content";
import { LOGO } from "@/lib/constants";
import { getSiteContent } from "@/lib/get-site-content";
import { GALLERY, HERO_VIDEOS } from "@/lib/gallery";
import { getResolvedServiceGalleries } from "@/lib/gallery-files";
import {
  ensureHeroVideoPlaceholders,
  getHeroVideoVersion,
  withHeroVideoCacheBust,
} from "@/lib/hero-video";
import { buildPageMetadata } from "@/lib/seo";
import { SERVICE_AREA_CITIES } from "@/lib/service-area";
import Link from "next/link";

export const metadata: Metadata = buildPageMetadata({
  title: "Best Barbershop in Antioch, CA",
  description:
    "Discover top-notch grooming at The Barber Lounge, Antioch's premier barbershop. Book your appointment today!",
  path: "/",
});

export default async function HomePage() {
  const content = await getSiteContent();
  const { HOME, SERVICES } = content;
  const { hero, valueProps, featuredServices, aboutTeaser, finalCta } = HOME;
  const serviceGalleries = getResolvedServiceGalleries();
  const signatureHaircutImages =
    serviceGalleries["Signature Haircut"].slice(0, 3);
  const signatureHaircutBeardImages =
    serviceGalleries["Signature Haircut & Beard"].slice(0, 3);

  ensureHeroVideoPlaceholders();

  const heroVideos = HERO_VIDEOS.map((entry) => ({
    src: withHeroVideoCacheBust(entry.src, getHeroVideoVersion(entry.slot), entry.slot),
    alt: entry.alt,
  }));

  const serviceDescriptions = Object.fromEntries(
    SERVICES.list.filter((s) => !s.name.startsWith("[")).map((s) => [s.name, s.description]),
  );

  return (
    <>
      <HeroVideoGrid
        videos={heroVideos}
        ctaHref={hero.ctaPrimary.href}
        ctaLabel={hero.ctaPrimary.label}
        headline={hero.headline}
      />

      <section className="hidden bg-bone px-4 py-16 md:block sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <Image
              src={LOGO.src}
              alt={LOGO.alt}
              width={LOGO.width}
              height={LOGO.height}
              priority
              sizes="(max-width: 640px) 280px, (max-width: 768px) 360px, 420px"
              className="h-auto w-[280px] object-contain sm:w-[360px] md:w-[420px]"
            />
          </div>
          <SectionLabel>
            <EditableText path="HOME.hero.eyebrow" defaultValue={hero.eyebrow} as="span" />
          </SectionLabel>
          <EditableText
            path="HOME.hero.headline"
            defaultValue={hero.headline}
            as="h1"
            className="mt-4 font-serif text-4xl font-semibold leading-tight text-charcoal sm:text-5xl lg:text-6xl"
          />
          <EditableText
            path="HOME.hero.subheadline"
            defaultValue={hero.subheadline}
            as="p"
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-charcoal/70 sm:text-lg"
            multiline
          />
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button href={hero.ctaPrimary.href} external size="lg">
              <EditableText
                path="HOME.hero.ctaPrimary.label"
                defaultValue={hero.ctaPrimary.label}
                as="span"
              />
            </Button>
            <Button href={`tel:${SITE.phoneTel}`} variant="outline" size="lg" analyticsLabel="Call Now (hero section)">
              Call {SITE.phone}
            </Button>
            <Button href={hero.ctaSecondary.href} variant="ghost" external>
              <EditableText
                path="HOME.hero.ctaSecondary.label"
                defaultValue={hero.ctaSecondary.label}
                as="span"
              />
            </Button>
          </div>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 text-sm text-charcoal/60">
            <StarIcon className="inline h-4 w-4 text-brass" />
            <EditableText path="HOME.hero.trustBar" defaultValue={hero.trustBar} as="span" className="text-sm text-charcoal/60" />
          </p>
        </div>
      </section>

      <section className="bg-bone px-4 pb-20 sm:px-6 sm:pb-28" aria-labelledby="services-heading">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <SectionLabel>
                <EditableText path="HOME.hero.eyebrow" defaultValue={hero.eyebrow} as="span" />
              </SectionLabel>
              <EditableText
                path="SERVICES.hero.headline"
                defaultValue={SERVICES.hero.headline}
                as="h2"
                id="services-heading"
                className="mt-2 font-serif text-3xl font-semibold text-charcoal sm:text-4xl lg:text-5xl"
              />
            </div>
            <Button href="/services" variant="outline" className="shrink-0">
              <EditableText
                path="HOME.servicesSection.viewAll"
                defaultValue={HOME.servicesSection.viewAll}
                as="span"
              />
            </Button>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {featuredServices.map((service, index) => (
              <div
                key={service.name}
                className={
                  service.name === "Signature Haircut" ||
                  service.name === "Signature Haircut & Beard"
                    ? "sm:col-span-2"
                    : undefined
                }
              >
                <ServiceCard
                  name={service.name}
                  description={serviceDescriptions[service.name] ?? ""}
                  price={service.price}
                  time={service.time}
                  pathPrefix={`HOME.featuredServices.${index}`}
                  images={
                    service.name === "Signature Haircut"
                      ? signatureHaircutImages.length > 0
                        ? signatureHaircutImages
                        : [GALLERY.signatureHaircut]
                      : service.name === "Signature Haircut & Beard"
                        ? signatureHaircutBeardImages.length > 0
                          ? signatureHaircutBeardImages
                          : [GALLERY.signatureHaircutBeard]
                        : serviceGalleries[service.name as keyof typeof serviceGalleries] ?? [
                            GALLERY.signatureHaircut,
                          ]
                  }
                />
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button href={hero.ctaPrimary.href} external size="lg">
              <EditableText
                path="HOME.servicesSection.bookNow"
                defaultValue={HOME.servicesSection.bookNow}
                as="span"
              />
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-bone px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="about-heading">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <SectionLabel>
              <EditableText path="HOME.valueProps.1.title" defaultValue={valueProps[1].title} as="span" />
            </SectionLabel>
            <EditableText
              path="HOME.aboutTeaser.headline"
              defaultValue={aboutTeaser.headline}
              as="h2"
              id="about-heading"
              className="mt-3 font-serif text-3xl font-semibold text-charcoal sm:text-4xl"
            />
            <EditableText
              path="HOME.aboutTeaser.body"
              defaultValue={aboutTeaser.body}
              as="p"
              className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-charcoal/70"
              multiline
            />
          </div>
          <ul className="mt-10 space-y-4">
            {valueProps.map((prop, index) => (
              <li key={prop.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brass text-xs text-bone">
                  ✓
                </span>
                <div>
                  <EditableText
                    path={`HOME.valueProps.${index}.title`}
                    defaultValue={prop.title}
                    as="p"
                    className="font-medium text-charcoal"
                  />
                  <EditableText
                    path={`HOME.valueProps.${index}.body`}
                    defaultValue={prop.body}
                    as="p"
                    className="mt-0.5 text-sm text-charcoal/60"
                    multiline
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 text-center">
            <Button href={aboutTeaser.cta.href} variant="burgundy">
              <EditableText
                path="HOME.aboutTeaser.cta.label"
                defaultValue={aboutTeaser.cta.label}
                as="span"
              />
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-bone px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="testimonials-heading">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <SectionLabel>{TESTIMONIALS.hero.subheadline}</SectionLabel>
            <h2
              id="testimonials-heading"
              className="mt-2 font-serif text-3xl font-semibold text-charcoal sm:text-4xl"
            >
              {TESTIMONIALS.hero.headline}
            </h2>
          </div>
          <div className="mt-12">
            <TestimonialCarousel quotes={TESTIMONIALS.quotes} />
          </div>
        </div>
      </section>

      <LeaveReviewSection />

      <section className="bg-bone px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="areas-heading">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <SectionLabel>SERVICE AREA</SectionLabel>
              <h2
                id="areas-heading"
                className="mt-2 font-serif text-3xl font-semibold text-charcoal sm:text-4xl"
              >
                East Bay Cities We Serve
              </h2>
              <p className="mt-3 max-w-xl text-charcoal/65">
                One Antioch shop — clients drive from across Contra Costa and the Tri-Valley for
                consistent fades.
              </p>
            </div>
            <Button href="/locations" variant="outline" className="shrink-0">
              All Locations
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">
            {SERVICE_AREA_CITIES.filter((c) => c.slug !== "antioch").slice(0, 8).map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/areas/${city.slug}`}
                  className="rounded-full border border-charcoal/15 px-4 py-2 text-sm text-charcoal/80 transition-colors hover:border-brass hover:text-brass"
                >
                  {city.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/locations"
                className="rounded-full border border-brass/30 px-4 py-2 text-sm font-medium text-brass"
              >
                +8 more
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section className="bg-bone px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="final-cta-heading">
        <div className="mx-auto max-w-3xl text-center">
          <EditableText
            path="HOME.finalCta.headline"
            defaultValue={finalCta.headline}
            as="h2"
            id="final-cta-heading"
            className="font-serif text-3xl font-semibold text-charcoal sm:text-4xl lg:text-5xl"
          />
          <div className="mt-8">
            <Button href={finalCta.cta.href} external size="lg">
              <EditableText path="HOME.finalCta.cta.label" defaultValue={finalCta.cta.label} as="span" />
            </Button>
          </div>
          <p className="mt-6 text-sm text-charcoal/60">
            <EditableText path="SITE.address" defaultValue={content.SITE.address} as="span" className="text-sm text-charcoal/60" />
          </p>
        </div>
      </section>
    </>
  );
}
