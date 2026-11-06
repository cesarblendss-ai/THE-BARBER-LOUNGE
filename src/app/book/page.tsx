import type { Metadata } from "next";

import { TimBookWizard } from "@/components/book/TimBookWizard";
import { SITE } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Book The Barber Lounge Antioch",
  description: `Book online at The Barber Lounge — ${SITE.address}. Signature cuts, same-site booking, Call ${SITE.phone}. Walk-ins welcome when chairs are open.`,
  path: "/book",
});

export default function BookPage() {
  return <TimBookWizard />;
}
