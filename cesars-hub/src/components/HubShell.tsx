"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type ClientLink = { slug: string; name: string };

function withQuery(pathname: string, biz: string | null, production: string | null): string {
  const params = new URLSearchParams();
  if (biz) params.set("biz", biz);
  if (production) params.set("production", production);
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function navActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const NAV = [
  { href: "/", label: "Home" },
  { href: "/wizard/seo", label: "SEO wizard" },
  { href: "/wizard/onboard", label: "Onboard" },
  { href: "/estimates", label: "Estimates" },
] as const;

export function HubShell({
  children,
  clients,
}: {
  children: React.ReactNode;
  clients: ClientLink[];
}) {
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();
  const biz = search.get("biz") || clients[0]?.slug || "barber-lounge";
  const production = search.get("production");
  const shopOpen = biz === "barber-lounge";

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="flex min-h-dvh">
        <aside className="hidden w-64 shrink-0 flex-col bg-ink text-paper sm:flex">
          <div className="border-b border-white/10 px-5 py-5">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-paper/50">
              Cesar Blends
            </p>
            <p className="mt-1 font-serif text-xl font-semibold">Cesar’s Hub</p>
            {production === "1" ? (
              <p className="mt-2 inline-block rounded-full border border-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-paper/70">
                Production
              </p>
            ) : null}
          </div>

          <div className="px-3 py-4">
            <p className="px-2 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-paper/40">
              Clients
            </p>
            <ul className="mt-2 space-y-1">
              {clients.map((client) => {
                const active = client.slug === biz;
                return (
                  <li key={client.slug}>
                    <Link
                      href={withQuery("/", client.slug, production)}
                      className={`block rounded-lg px-2 py-2 text-sm ${
                        active ? "bg-paper text-ink" : "text-paper/70 hover:bg-white/10 hover:text-paper"
                      }`}
                    >
                      {client.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <nav className="mt-2 px-3" aria-label="Hub">
            <p className="px-2 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-paper/40">
              Wizards
            </p>
            <ul className="mt-2 space-y-1">
              {NAV.map((item) => {
                const href = withQuery(item.href, biz, production);
                const active = navActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={href}
                      className={`block rounded-lg px-2 py-2 text-sm ${
                        active ? "bg-white/15 text-paper" : "text-paper/70 hover:bg-white/10 hover:text-paper"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {shopOpen ? (
            <nav className="mt-4 px-3 pb-6" aria-label="Barber Lounge shop">
              <p className="px-2 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-paper/40">
                Barber Lounge shop
              </p>
              <ul className="mt-2 space-y-1 text-sm text-paper/70">
                <li>
                  <Link className="block rounded-lg px-2 py-2 hover:bg-white/10 hover:text-paper" href={withQuery("/calendar", biz, production)}>
                    Week calendar
                  </Link>
                </li>
                <li>
                  <Link className="block rounded-lg px-2 py-2 hover:bg-white/10 hover:text-paper" href={withQuery("/appointments", biz, production)}>
                    Appointments
                  </Link>
                </li>
                <li>
                  <Link className="block rounded-lg px-2 py-2 hover:bg-white/10 hover:text-paper" href={withQuery("/products", biz, production)}>
                    Retail
                  </Link>
                </li>
              </ul>
            </nav>
          ) : null}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur sm:hidden">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50">
              Cesar Blends
            </p>
            <p className="font-serif text-lg font-semibold">Cesar’s Hub</p>
          </header>
          {children}
          <nav
            aria-label="Hub"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-ink pb-[max(0.5rem,env(safe-area-inset-bottom))] text-paper sm:hidden"
          >
            <ul className="grid grid-cols-4">
              {NAV.map((item) => {
                const active = navActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={withQuery(item.href, biz, production)}
                      className={`flex flex-col items-center px-1 py-2.5 text-[11px] font-semibold uppercase tracking-wider ${
                        active ? "text-paper" : "text-paper/50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
