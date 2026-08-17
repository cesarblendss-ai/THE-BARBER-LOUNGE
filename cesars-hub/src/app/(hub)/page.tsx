import type { Metadata } from "next";
import Link from "next/link";

import { getSeoClient, hubQuery, listClientSeoRuns, listSeoClients } from "@hub/lib/clients";
import { HUB_LIVE_URL } from "@hub/lib/hub";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cesar’s Hub — Cesar Blends",
  robots: { index: false, follow: false },
};

export default async function HubHomePage({
  searchParams,
}: {
  searchParams: Promise<{ biz?: string; production?: string }>;
}) {
  const params = await searchParams;
  const biz = params.biz?.trim() || "barber-lounge";
  const production = params.production?.trim() || null;
  const qs = hubQuery(biz, production);
  const client = await getSeoClient(biz);
  const clients = await listSeoClients();
  const runs = client ? await listClientSeoRuns(client.slug) : [];
  const shopClient = client?.slug === "barber-lounge";

  const wizards = [
    {
      href: `/wizard/seo${qs}`,
      label: "SEO wizard",
      detail: "Monthly content run, GBP posts, blogs, schema",
    },
    {
      href: `/wizard/onboard${qs}`,
      label: "Onboard wizard",
      detail: "New client intake → SEO profile JSON",
    },
    {
      href: `/estimates${qs}`,
      label: "Estimate wizard",
      detail: "Create, share, e-sign, collect deposit",
    },
  ];

  return (
    <section className="bg-paper px-4 pb-28 pt-8 sm:px-8 sm:pb-16">
      <div className="mx-auto max-w-4xl">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">
          Cesar Blends
          {production === "1" ? " · Production" : ""}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-ink sm:text-5xl">Cesar’s Hub</h1>
        <p className="mt-3 text-lg text-ink/65">
          Agency OS for SEO clients and site builds. Cursor can freeze — this app should not.
        </p>
        <p className="mt-2 break-all font-mono text-xs text-ink/40">{HUB_LIVE_URL}</p>

        {client ? (
          <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/40">
              Active client
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">{client.name}</h2>
            <p className="mt-1 text-sm text-ink/60">
              {client.niche}
              {client.city ? ` · ${client.city}, ${client.state}` : ""}
              {client.package ? ` · ${client.package}` : ""}
            </p>
            {client.website ? (
              <a href={client.website} className="mt-2 inline-block break-all text-sm text-ink underline">
                {client.website}
              </a>
            ) : null}
            {runs[0] ? (
              <p className="mt-3 text-sm text-ink/55">
                Latest SEO output: <code className="text-ink">{runs[0]}</code>
              </p>
            ) : (
              <p className="mt-3 text-sm text-ink/55">No SEO output folder yet — run the SEO wizard.</p>
            )}
          </div>
        ) : null}

        <h2 className="mt-10 font-serif text-2xl font-semibold text-ink">Wizards</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {wizards.map((tile) => (
            <li key={tile.href}>
              <Link
                href={tile.href}
                className="block rounded-2xl border border-ink/10 bg-white p-5 transition-colors hover:border-ink/40"
              >
                <p className="font-serif text-xl font-semibold text-ink">{tile.label}</p>
                <p className="mt-1 text-sm text-ink/55">{tile.detail}</p>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 font-serif text-2xl font-semibold text-ink">SEO clients</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {clients.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/${hubQuery(item.slug, production)}`}
                className={`block rounded-2xl border p-4 ${
                  item.slug === client?.slug ? "border-ink bg-ink text-paper" : "border-ink/10 bg-white text-ink"
                }`}
              >
                <p className="font-serif text-lg font-semibold">{item.name}</p>
                <p className={`mt-1 text-sm ${item.slug === client?.slug ? "text-paper/70" : "text-ink/55"}`}>
                  {item.niche}
                  {item.city ? ` · ${item.city}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        {shopClient ? (
          <>
            <h2 className="mt-10 font-serif text-2xl font-semibold text-ink">Barber Lounge shop tools</h2>
            <p className="mt-2 text-sm text-ink/55">
              Floor tools for this client only — not the agency chrome.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { href: `/calendar${qs}`, label: "Week calendar" },
                { href: `/appointments${qs}`, label: "Appointments" },
                { href: `/products${qs}`, label: "Retail" },
                { href: `/shop-log${qs}`, label: "Shop log" },
                { href: `/sms-setup${qs}`, label: "SMS" },
                { href: `/notifications${qs}`, label: "Phone push" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm font-medium text-ink hover:border-ink/40"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-10 text-sm text-ink/55">
            Quote / site-rebuild wizard for this client lives in{" "}
            <code className="text-ink">docs/clients/</code> until the Yes We Can repo split.
          </p>
        )}
      </div>
    </section>
  );
}
