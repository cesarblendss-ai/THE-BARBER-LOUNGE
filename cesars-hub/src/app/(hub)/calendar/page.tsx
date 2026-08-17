import type { Metadata } from "next";
import { cookies } from "next/headers";

import { HUB_SECTION_CLASS } from "@hub/lib/hub";
import { isHubAuthenticated } from "@hub/lib/hub-auth";
import { AdminWeekCalendarForm } from "@/components/AdminWeekCalendarForm";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/content";
import { getShopWeekPersistence } from "@/lib/shop-week-store";
import { getShopWeekView } from "@/lib/shop-week-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `This week — Cesar’s Hub — ${SITE.name}`,
  robots: { index: false, follow: false },
};

type HubCalendarPageProps = {
  searchParams: Promise<{ key?: string; week?: string }>;
};

export default async function HubCalendarPage({ searchParams }: HubCalendarPageProps) {
  const params = await searchParams;
  const authRequired = Boolean(process.env.HUB_KEY?.trim() || process.env.ADMIN_UPLOAD_KEY?.trim());
  const cookieStore = await cookies();
  const adminAuthenticated = isHubAuthenticated(cookieStore);
  const view = await getShopWeekView(params.week);
  const persistence = getShopWeekPersistence();

  return (
    <section className={HUB_SECTION_CLASS}>
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <SectionLabel>Cesar’s Hub</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Set this week
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Open, closed, notes, and blocked slots for the floor. This does not change Booksy.
          </p>
        </div>

        <p className="mt-6 rounded-xl border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal/70">
          {persistence === "postgres"
            ? "Saves to Postgres (production-safe)."
            : "Saves to local JSON. On Vercel this is ephemeral — add DATABASE_URL or TBLDB_* on Production so the week persists."}
        </p>

        <AdminWeekCalendarForm
          initialView={view}
          authRequired={authRequired}
          adminAuthenticated={adminAuthenticated}
          initialKey={params.key}
        />
      </div>
    </section>
  );
}
