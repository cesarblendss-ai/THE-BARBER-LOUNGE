import type { LandingPageConfig } from "./landing-pages";
import { BOOKING_URL, SITE } from "./content";
import { SERVICE_AREA_CITIES, type ServiceAreaCity } from "./service-area";

const AREA_OVERRIDES: Partial<Record<string, Partial<LandingPageConfig>>> = {
  pittsburg: {
    eyebrow: "SERVING PITTSBURG FROM ANTIOCH",
    headline: "Precision Fades for Pittsburg Clients",
    subheadline:
      "The Barber Lounge is on A St in Antioch — an easy drive from Pittsburg for fades, line-ups, and signature cuts without the guesswork.",
    relatedBlog: { label: "Best fades in Antioch", href: "/blog/best-fades-barbershop-antioch" },
  },
  brentwood: {
    eyebrow: "EAST CONTRA COSTA'S CRAFT BARBERSHOP",
    headline: "Brentwood-Area Cuts Without the Compromise",
    subheadline:
      "Antioch's Barber Lounge draws clients from Brentwood for consistent fades, calm kid-friendly service, and barbers who listen before they cut.",
    secondaryCta: { label: "Kids Cuts Info", href: "/kids-cuts" },
    relatedBlog: { label: "Fade vs taper guide", href: "/blog/fade-vs-taper-haircut-antioch" },
  },
};

export function buildAreaPage(city: ServiceAreaCity): LandingPageConfig {
  const { slug, name } = city;
  const override = AREA_OVERRIDES[slug] ?? {};

  const base: LandingPageConfig = {
    slug,
    path: `/areas/${slug}`,
    meta: {
      title: `Barbershop Near ${name}, CA — The Barber Lounge Antioch`,
      description: `Looking for a barbershop near ${name}? The Barber Lounge in Antioch serves ${name} with expert fades and signature cuts. Book online.`,
    },
    eyebrow: `SERVING ${name.toUpperCase()} FROM ANTIOCH`,
    headline: `Expert Fades for ${name} Clients`,
    subheadline: `We're on A St in Antioch — a convenient drive from ${name} for fades, line-ups, and signature grooming.`,
    bullets: [
      "Signature Haircut — $50 · consultation + Hot Lather Finish",
      "Signature Haircut & Beard — $65",
      "Expert fades: low, mid, high, skin blends",
      "Booksy booking · on-site parking · kid-friendly",
    ],
    faqs: [
      {
        question: `Do you serve ${name}?`,
        answer: `Yes. 1518 A St, Antioch — many ${name} clients book with us for consistent quality.`,
      },
      {
        question: "How do I book?",
        answer: `Booksy online or call ${SITE.phone}. Walk-ins when chairs are open.`,
      },
    ],
    cta: { label: "Book Your Cut", href: BOOKING_URL, external: true },
    secondaryCta: { label: `Call ${SITE.phone}`, href: `tel:${SITE.phoneTel}` },
    relatedBlog: {
      label: "Best fades in Antioch",
      href: "/blog/best-fades-barbershop-antioch",
    },
  };

  return { ...base, ...override, meta: { ...base.meta, ...override.meta } };
}

export function getAllAreaSlugs(): string[] {
  return SERVICE_AREA_CITIES.filter((c) => c.slug !== "antioch").map((c) => c.slug);
}

export function getAreaConfigBySlug(slug: string): LandingPageConfig | undefined {
  const city = SERVICE_AREA_CITIES.find((c) => c.slug === slug.toLowerCase());
  if (!city || city.slug === "antioch") return undefined;
  return buildAreaPage(city);
}
