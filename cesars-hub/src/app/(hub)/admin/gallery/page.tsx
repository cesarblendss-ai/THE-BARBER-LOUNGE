import type { Metadata } from "next";

import { HUB_SECTION_CLASS } from "@hub/lib/hub";

import { GalleryBulkUpload } from "@/components/GalleryBulkUpload";
import { GalleryUpload, GalleryUploadFooter } from "@/components/GalleryUpload";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/content";
import { getGalleryUploadPreviews } from "@/lib/gallery-admin";

export const metadata: Metadata = {
  title: `Manage Gallery — ${SITE.name}`,
  robots: { index: false, follow: false },
};

type AdminGalleryPageProps = {
  searchParams: Promise<{ key?: string }>;
};

export default async function AdminGalleryPage({ searchParams }: AdminGalleryPageProps) {
  const params = await searchParams;
  const authRequired = Boolean(process.env.ADMIN_UPLOAD_KEY);
  const previews = getGalleryUploadPreviews();

  return (
    <section className={HUB_SECTION_CLASS}>
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <SectionLabel>Cesar’s Hub</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Manage Gallery
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Upload photos by category, or use smart bulk upload below. Files save to{" "}
            <code className="text-sm text-charcoal/80">public/gallery/</code> with auto-numbered
            names.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 xl:grid-cols-4">
          {previews.map((preview) => (
            <GalleryUpload
              key={preview.category}
              category={preview.category}
              label={preview.label}
              prefix={preview.prefix}
              existingCount={preview.existingCount}
              authRequired={authRequired}
              authKey={params.key}
            />
          ))}
        </div>

        <GalleryBulkUpload authRequired={authRequired} authKey={params.key} />

        <GalleryUploadFooter />
      </div>
    </section>
  );
}
