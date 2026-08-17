import type { Metadata } from "next";

import { EstimatesBoard } from "@hub/components/EstimatesBoard";
import { HUB_SECTION_CLASS } from "@hub/lib/hub";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: `Estimates — Cesar’s Hub — ${SITE.name}`,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ key?: string }>;
};

export default async function HubEstimatesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const authRequired = Boolean(process.env.HUB_KEY?.trim() || process.env.ADMIN_UPLOAD_KEY?.trim());

  return (
    <section className={HUB_SECTION_CLASS}>
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <SectionLabel>Cesar’s Hub</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Estimates
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Create a shareable estimate, then watch when the client opens it, signs, and pays the
            deposit.
          </p>
        </div>
        <EstimatesBoard authRequired={authRequired} initialKey={params.key} />
      </div>
    </section>
  );
}
