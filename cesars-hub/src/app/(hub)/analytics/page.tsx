import type { Metadata } from "next";
import Link from "next/link";

import { HUB_SECTION_CLASS } from "@hub/lib/hub";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { SectionLabel } from "@/components/SectionLabel";
import { getAnalyticsSummary } from "@/lib/analytics-server";
import { SITE } from "@/lib/content";
import { isDatabaseConfigured } from "@/lib/db";

export const metadata: Metadata = {
  title: `Analytics — Cesar’s Hub — ${SITE.name}`,
  robots: { index: false, follow: false },
};

export default async function HubAnalyticsPage() {
  const configured = isDatabaseConfigured();
  const summary = configured ? await getAnalyticsSummary() : null;

  return (
    <section className={HUB_SECTION_CLASS}>
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <SectionLabel>Cesar’s Hub</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Site Analytics
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Anonymous analytics — no personal data unless they book through the wizard.
          </p>
        </div>

        {!configured ? (
          <div className="mt-10 rounded-2xl border border-charcoal/10 bg-bone p-6 text-sm text-charcoal/80">
            <p className="font-medium text-charcoal">Database not connected</p>
            <p className="mt-2">
              Set <code className="text-charcoal">DATABASE_URL</code> in{" "}
              <code className="text-charcoal">.env.local</code> to enable analytics. On Vercel,
              connect Postgres under Storage and redeploy — the URL is injected automatically.
            </p>
          </div>
        ) : summary ? (
          <AnalyticsDashboard summary={summary} />
        ) : null}

        <div className="mt-8 space-y-2 text-center text-xs text-charcoal/45">
          <p>
            <Link href="/admin/gallery" className="text-brass hover:underline">
              Gallery admin
            </Link>
            {" · "}
            <Link href="/appointments" className="text-brass hover:underline">
              Appointments
            </Link>
            {" · "}
            <Link href="/notifications" className="text-brass hover:underline">
              Notifications
            </Link>
            {" · "}
            <Link href="/admin/edit" className="text-brass hover:underline">
              Edit site text
            </Link>
            {" · "}
            <Link href="/" className="text-brass hover:underline">
              Hub home
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
