import type { Metadata } from "next";
import Link from "next/link";

import { getSeoClient, hubQuery, listClientSeoRuns } from "@hub/lib/clients";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SEO wizard — Cesar’s Hub",
  robots: { index: false, follow: false },
};

export default async function SeoWizardPage({
  searchParams,
}: {
  searchParams: Promise<{ biz?: string; production?: string }>;
}) {
  const params = await searchParams;
  const biz = params.biz?.trim() || "barber-lounge";
  const qs = hubQuery(biz, params.production?.trim() || null);
  const client = await getSeoClient(biz);
  const runs = client ? await listClientSeoRuns(client.slug) : [];
  const name = client?.name ?? "Client";

  return (
    <section className="bg-paper px-4 pb-28 pt-8 sm:px-8 sm:pb-16">
      <div className="mx-auto max-w-3xl">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">
          Wizard
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-ink">SEO wizard</h1>
        <p className="mt-3 text-lg text-ink/65">
          Monthly content for <span className="font-medium text-ink">{name}</span>. Runs live in{" "}
          <code className="text-ink">tools/seo-agent/</code> — this screen is the control panel so
          you do not need a frozen Desktop chat.
        </p>

        <ol className="mt-8 space-y-4 rounded-2xl border border-ink/10 bg-white p-5 text-sm text-ink/80 sm:p-6">
          <li>
            <span className="font-semibold text-ink">1.</span> Open a terminal in the repo.
          </li>
          <li>
            <span className="font-semibold text-ink">2.</span> Run:
            <pre className="mt-2 overflow-x-auto rounded-lg bg-ink px-4 py-3 font-mono text-xs text-paper">
              cd tools/seo-agent{"\n"}python run.py seo &quot;{name}&quot; --memory
            </pre>
          </li>
          <li>
            <span className="font-semibold text-ink">3.</span> Then{" "}
            <code className="text-ink">python run.py publish-check</code> before importing blogs.
          </li>
        </ol>

        <h2 className="mt-10 font-serif text-2xl font-semibold text-ink">Output folders</h2>
        {runs.length ? (
          <ul className="mt-4 space-y-2">
            {runs.map((run) => (
              <li
                key={run}
                className="rounded-xl border border-ink/10 bg-white px-4 py-3 font-mono text-sm text-ink"
              >
                tools/seo-agent/output/{run}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-ink/55">No runs on disk yet.</p>
        )}

        <p className="mt-8 text-sm">
          <Link href={`/${qs}`} className="underline">
            Back to hub
          </Link>
        </p>
      </div>
    </section>
  );
}
