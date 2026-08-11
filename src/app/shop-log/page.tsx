import type { Metadata } from "next";

import { ShopLogClient } from "@/components/ShopLogClient";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: `Shop Products — ${SITE.name}`,
  robots: { index: false, follow: false },
};

export default function ShopLogPage() {
  return (
    <section className="bg-bone px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
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
