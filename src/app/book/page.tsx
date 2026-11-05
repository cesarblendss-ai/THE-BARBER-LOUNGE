import type { Metadata } from "next";

import { TimBookWizard } from "@/components/book/TimBookWizard";
import { SITE } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Book Your Cut",
  description: `Book online at The Barber Lounge — ${SITE.address}. Four steps. Pay in the shop. Call ${SITE.phone}.`,
  path: "/book",
});

export default function BookPage() {
  return <TimBookWizard />;
}
