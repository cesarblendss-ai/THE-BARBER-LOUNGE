import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/Button";
import { GalleryLightbox } from "@/components/GalleryLightbox";
import { SectionLabel } from "@/components/SectionLabel";
import { BOOKING_URL, SITE } from "@/lib/content";
import { getResolvedAllGallery, getResolvedGallerySections } from "@/lib/gallery-files";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Gallery — The Barber Lounge Antioch",
  description:
    "Browse fresh fades, beard work, kids cuts, and shop photos from The Barber Lounge in Antioch, CA.",
  path: "/gallery",
});

export default function GalleryPage() {
  const sections = getResolvedGallerySections();
  const allImages = getResolvedAllGallery();

  return (
    <>
      <section className="bg-bone px-4 pb-8 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>Gallery</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Our Work
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Real cuts from {SITE.name} in Antioch — tap any photo to enlarge.
          </p>
        </div>
      </section>

      {allImages.length === 0 ? (
        <section className="bg-bone px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-xl rounded-2xl border border-charcoal/10 bg-white p-8 text-center">
            <p className="text-charcoal/70">
              Photos coming soon. Drop JPG or PNG files into{" "}
              <code className="text-sm text-charcoal">public/gallery/</code> or upload at{" "}
              <Link href="/admin/gallery" className="text-brass hover:underline">
                /admin/gallery
              </Link>
              .
            </p>
          </div>
        </section>
      ) : sections.length > 1 ? (
        sections.map((section) => (
          <section
            key={section.id}
            className="bg-bone px-4 pb-16 sm:px-6 sm:pb-20"
            aria-labelledby={`gallery-${section.id}`}
          >
            <div className="mx-auto max-w-7xl">
              <h2
                id={`gallery-${section.id}`}
                className="font-serif text-2xl font-semibold text-charcoal sm:text-3xl"
              >
                {section.label}
              </h2>
              <div className="mt-8">
                <GalleryLightbox images={section.images} columns={4} />
              </div>
            </div>
          </section>
        ))
      ) : (
        <section className="bg-bone px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <GalleryLightbox images={allImages} columns={4} />
          </div>
        </section>
      )}

      <section className="border-t border-charcoal/10 bg-bone px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-serif text-2xl font-semibold text-charcoal">Ready for your cut?</h2>
          <div className="mt-6">
            <Button href={BOOKING_URL} external size="lg">
              Book Now
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
