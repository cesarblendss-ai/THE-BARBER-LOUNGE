import type { Metadata } from "next";

import { AdminProductsClient } from "@/components/AdminProducts";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/content";
import { HUB_SECTION_CLASS } from "@/lib/hub";

export const metadata: Metadata = {
  title: `Retail Products — ${SITE.name}`,
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ key?: string }>;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <section className={HUB_SECTION_CLASS}>
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <SectionLabel>Cesar’s Hub</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Retail Products
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Track shop inventory, barber purchases, and weekly settlement. Barbers log at{" "}
            <code className="text-charcoal">/shop-log</code>.
          </p>
        </div>

        <div className="mt-10">
          <AdminProductsClient authKey={params.key} />
        </div>
      </div>
    </section>
  );
}
