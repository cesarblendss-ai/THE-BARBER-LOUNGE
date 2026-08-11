import type { Metadata } from "next";

import { LandingPageLayout } from "@/components/LandingPageLayout";
import { BEARD_STUDIO_PAGE } from "@/lib/landing-pages";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: BEARD_STUDIO_PAGE.meta.title,
  description: BEARD_STUDIO_PAGE.meta.description,
  path: BEARD_STUDIO_PAGE.path,
});

export default function BeardStudioPage() {
  return <LandingPageLayout config={BEARD_STUDIO_PAGE} />;
}
