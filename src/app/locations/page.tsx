import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/Button";
import { SectionLabel } from "@/components/SectionLabel";
import { BOOKING_URL, SITE } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { SERVICE_AREA_CITIES } from "@/lib/service-area";

export const metadata = buildPageMetadata({
  title: "Locations We Serve — East Bay Barbershop",
  description:
    "The Barber Lounge in Antioch serves clients across East Contra Costa — Pittsburg, Brentwood, Oakley, Concord, and 12 more cities within ~20 miles.",
  path: "/locations",
});

export default function LocationsHubPage() {
  const cities = SERVICE_AREA_CITIES.filter((c) => c.slug !== "antioch");

  return (
    <>
      <section className="bg-bone px-4 pb-8 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>~20 MILE SERVICE AREA</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            East Bay Cities We Serve
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            One shop on A St in Antioch — clients drive from across East Contra Costa and the
            Tri-Valley for consistent fades and signature cuts.
          </p>
          <p className="mt-2 text-sm text-charcoal/50">{SITE.address}</p>
          <div className="mt-8">
            <Button href={BOOKING_URL} external size="lg">
              Book Online
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-bone px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/areas/${city.slug}`}
                  className="block rounded-2xl border border-charcoal/10 bg-white p-5 transition-colors hover:border-brass/40"
                >
                  <p className="font-serif text-lg font-semibold text-charcoal">
                    Barbershop near {city.name}
                  </p>
                  <p className="mt-1 text-sm text-charcoal/60">Serving {city.name} from Antioch →</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-bone px-4 py-12 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-4 text-sm">
          <Link href="/kids-cuts" className="text-brass hover:underline">
            Kids cuts
          </Link>
          <Link href="/beard-studio" className="text-brass hover:underline">
            Beard studio
          </Link>
          <Link href="/services" className="text-brass hover:underline">
            Services
          </Link>
          <Link href="/blog" className="text-brass hover:underline">
            Blog
          </Link>
        </div>
      </section>
    </>
  );
}
