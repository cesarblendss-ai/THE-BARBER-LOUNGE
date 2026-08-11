import type { Metadata } from "next";

import { LandingPageLayout } from "@/components/LandingPageLayout";
import { KIDS_CUTS_PAGE } from "@/lib/landing-pages";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: KIDS_CUTS_PAGE.meta.title,
  description: KIDS_CUTS_PAGE.meta.description,
  path: KIDS_CUTS_PAGE.path,
});

export default function KidsCutsPage() {
  return <LandingPageLayout config={KIDS_CUTS_PAGE} />;
}
