import type { Metadata } from "next";

import { Button } from "@/components/Button";
import { EditableText } from "@/components/EditableText";
import { SectionLabel } from "@/components/SectionLabel";
import { ServiceCard } from "@/components/ServiceCard";
import { getSiteContent } from "@/lib/get-site-content";
import { GALLERY } from "@/lib/gallery";
import { getResolvedServiceGalleries } from "@/lib/gallery-files";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata: Metadata = buildPageMetadata({
  title: "Barber Services in Antioch, CA",
  description:
    "Explore exceptional barber services in Antioch, CA. From fades to trims, we've got your style covered!",
  path: "/services",
});

const fallbackImages = [GALLERY.razorLineup];

export default async function ServicesPage() {
  const content = await getSiteContent();
  const { SERVICES } = content;
  const { hero, list, addOns, note, cta } = SERVICES;
  const serviceGalleries = getResolvedServiceGalleries();
  const signatureHaircutImages =
    serviceGalleries["Signature Haircut"].slice(0, 1);
  const signatureHaircutBeardImages =
    serviceGalleries["Signature Haircut & Beard"].slice(0, 1);

  return (
    <>
      <section className="bg-bone px-4 pb-8 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>
            <EditableText path="SERVICES.hero.sectionLabel" defaultValue={hero.sectionLabel} as="span" />
          </SectionLabel>
          <EditableText
            path="SERVICES.hero.headline"
            defaultValue={hero.headline}
            as="h1"
            className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl"
          />
          <EditableText
            path="SERVICES.hero.subheadline"
            defaultValue={hero.subheadline}
            as="p"
            className="mt-4 text-lg text-charcoal/70"
            multiline
          />
        </div>
      </section>

      <section className="bg-bone px-4 pb-16 sm:px-6 sm:pb-24" aria-labelledby="services-list-heading">
        <div className="mx-auto max-w-7xl">
          <h2 id="services-list-heading" className="sr-only">
            Service menu
          </h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((service, index) => (
              <ServiceCard
                key={service.name}
                name={service.name}
                description={service.description}
                price={service.price}
                time={service.time}
                pathPrefix={`SERVICES.list.${index}`}
                images={
                  service.name === "Signature Haircut"
                    ? signatureHaircutImages.length > 0
                      ? signatureHaircutImages
                      : fallbackImages
                    : service.name === "Signature Haircut & Beard"
                      ? signatureHaircutBeardImages.length > 0
                        ? signatureHaircutBeardImages
                        : fallbackImages
                      : serviceGalleries[service.name as keyof typeof serviceGalleries] ??
                        fallbackImages
                }
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-charcoal/10 bg-bone px-4 py-12 sm:px-6" aria-labelledby="addons-heading">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>
            <EditableText path="SERVICES.addOns.sectionLabel" defaultValue={addOns.sectionLabel} as="span" />
          </SectionLabel>
          <EditableText
            path="SERVICES.addOns.headline"
            defaultValue={addOns.headline}
            as="h2"
            className="mt-2 font-serif text-2xl font-semibold text-charcoal"
          />
          <EditableText
            path="SERVICES.addOns.body"
            defaultValue={addOns.body}
            as="p"
            className="mt-4 text-base leading-relaxed text-charcoal/70"
            multiline
          />
        </div>
      </section>

      <section className="bg-bone px-4 py-8 sm:px-6" aria-label="Pricing note">
        <div className="mx-auto max-w-3xl rounded-2xl border border-charcoal/10 bg-white p-6">
          <EditableText
            path="SERVICES.note"
            defaultValue={note}
            as="p"
            className="text-sm leading-relaxed text-charcoal/65"
            multiline
          />
        </div>
      </section>

      <section className="border-t border-charcoal/10 bg-bone px-4 py-12 sm:px-6" aria-labelledby="guides-heading">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>GROOMING GUIDES</SectionLabel>
          <h2 id="guides-heading" className="mt-2 font-serif text-2xl font-semibold text-charcoal">
            Learn before you book
          </h2>
          <ul className="mt-6 space-y-3 text-sm">
            <li>
              <Link href="/blog/best-fades-barbershop-antioch" className="text-brass hover:underline">
                Best fades in Antioch →
              </Link>
            </li>
            <li>
              <Link href="/blog/fade-vs-taper-haircut-antioch" className="text-brass hover:underline">
                Fade vs taper for kids →
              </Link>
            </li>
            <li>
              <Link href="/blog/beard-trim-antioch-grooming" className="text-brass hover:underline">
                Why beard trim matters →
              </Link>
            </li>
            <li>
              <Link href="/kids-cuts" className="text-brass hover:underline">
                Kids cuts at The Barber Lounge →
              </Link>
            </li>
            <li>
              <Link href="/beard-studio" className="text-brass hover:underline">
                Beard studio →
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section className="bg-bone px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-xl text-center">
          <div className="mt-4">
            <Button href={cta.href} external size="lg">
              <EditableText path="SERVICES.cta.label" defaultValue={cta.label} as="span" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
