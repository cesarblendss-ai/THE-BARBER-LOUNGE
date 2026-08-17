import type { Metadata } from "next";

import { HUB_SECTION_CLASS } from "@hub/lib/hub";
import { SectionLabel } from "@/components/SectionLabel";
import { ShopLogClient } from "@/components/ShopLogClient";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: `Shop Products — Cesar’s Hub — ${SITE.name}`,
  robots: { index: false, follow: false },
};

export default function HubShopLogPage() {
  return (
    <section className={HUB_SECTION_CLASS}>
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <SectionLabel>Shop</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Shop Products
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            See what&apos;s in stock. Barbers tap <strong className="font-medium text-charcoal">Team log</strong> to record a sale.
          </p>
        </div>

        <div className="mt-10">
          <ShopLogClient />
        </div>
      </div>
    </section>
  );
}
