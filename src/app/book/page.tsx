import type { Metadata } from "next";

import { TimBookWizard } from "@/components/book/TimBookWizard";
import { SITE } from "@/lib/content";
import { SITE_URL } from "@/lib/constants";

const title = "Book The Barber Lounge Antioch";
const description = `Book online at The Barber Lounge — ${SITE.address}. Signature cuts, same-site booking, Call ${SITE.phone}. Walk-ins welcome when chairs are open.`;
const url = `${SITE_URL}/book`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    siteName: SITE.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function BookPage() {
  return <TimBookWizard />;
}
