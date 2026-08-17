import type { Metadata } from "next";
import Link from "next/link";

import { hubQuery } from "@hub/lib/clients";

import { OnboardForm } from "@hub/components/OnboardForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Onboard wizard — Cesar’s Hub",
  robots: { index: false, follow: false },
};

export default async function OnboardWizardPage({
  searchParams,
}: {
  searchParams: Promise<{ biz?: string; production?: string }>;
}) {
  const params = await searchParams;
  const qs = hubQuery(params.biz?.trim() || "barber-lounge", params.production?.trim() || null);

  return (
    <section className="bg-paper px-4 pb-28 pt-8 sm:px-8 sm:pb-16">
      <div className="mx-auto max-w-3xl">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">
          Wizard
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-ink">Onboard wizard</h1>
        <p className="mt-3 text-lg text-ink/65">
          Intake for a new SEO client. Saves a profile next to The Barber Lounge and Yes We Can
          under <code className="text-ink">tools/seo-agent/clients/</code>.
        </p>
        <OnboardForm />
        <p className="mt-8 text-sm">
          <Link href={`/${qs}`} className="underline">
            Back to hub
          </Link>
        </p>
      </div>
    </section>
  );
}
