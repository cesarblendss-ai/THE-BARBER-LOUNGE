import type { Metadata } from "next";

import { AdminEstimates } from "@/components/AdminEstimates";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: `Estimates — ${SITE.name}`,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ key?: string }>;
};

export default async function AdminEstimatesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const authRequired = Boolean(process.env.ADMIN_UPLOAD_KEY?.trim());

  return (
    <section className="bg-bone px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <SectionLabel>Admin</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Estimates
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Create a shareable estimate, then watch when the client opens it, signs, and pays the
            deposit.
          </p>
        </div>
        <AdminEstimates authRequired={authRequired} initialKey={params.key} />
      </div>
    </section>
  );
}
