import type { Metadata } from "next";

import { AdminLeads } from "@/components/AdminLeads";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: `Leads — ${SITE.name}`,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ key?: string }>;
};

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const authRequired = Boolean(process.env.ADMIN_UPLOAD_KEY?.trim());

  return (
    <section className="bg-bone px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <SectionLabel>Admin</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Booking leads
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Name, phone, and email captured before Booksy — call-backs and opt-ins for when SMS/email
            campaigns go live.
          </p>
        </div>
        <AdminLeads authRequired={authRequired} initialKey={params.key} />
      </div>
    </section>
  );
}
