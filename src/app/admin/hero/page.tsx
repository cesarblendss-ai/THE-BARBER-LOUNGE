import type { Metadata } from "next";

import { HeroVideoUpload, HeroVideoUploadFooter } from "@/components/HeroVideoUpload";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/content";
import { getHeroVideoPreviews } from "@/lib/hero-video";

export const metadata: Metadata = {
  title: `Update Hero Videos — ${SITE.name}`,
  robots: { index: false, follow: false },
};

type AdminHeroPageProps = {
  searchParams: Promise<{ key?: string }>;
};

export default async function AdminHeroPage({ searchParams }: AdminHeroPageProps) {
  const params = await searchParams;
  const authRequired = Boolean(process.env.ADMIN_UPLOAD_KEY);
  const previews = getHeroVideoPreviews();

  return (
    <section className="bg-bone px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <SectionLabel>Admin</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Update Hero Videos
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Upload three portrait clips for the homepage hero. Each slot plays side by side in a
            TikTok-style triple column.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {previews.map((preview) => (
            <HeroVideoUpload
              key={preview.slot}
              slot={preview.slot}
              label={preview.label}
              initialVideoSrc={preview.videoSrc}
              posterSrc={preview.posterSrc}
              hasVideo={preview.hasVideo}
              filename={preview.filename}
              authRequired={authRequired}
              authKey={params.key}
            />
          ))}
        </div>

        <HeroVideoUploadFooter />
      </div>
    </section>
  );
}
