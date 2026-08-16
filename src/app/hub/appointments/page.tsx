import type { Metadata } from "next";

import { AdminAppointmentsClient } from "@/components/AdminAppointments";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/content";
import { HUB_SECTION_CLASS } from "@/lib/hub";

export const metadata: Metadata = {
  title: `Appointments — ${SITE.name}`,
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ key?: string }>;
};

export default async function AdminAppointmentsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <section className={HUB_SECTION_CLASS}>
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <SectionLabel>Cesar’s Hub</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Appointments
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Review website booking requests, confirm after entering in Booksy, and block slots that
            match your Booksy calendar.
          </p>
        </div>

        <div className="mt-10">
          <AdminAppointmentsClient authKey={params.key} />
        </div>
      </div>
    </section>
  );
}
