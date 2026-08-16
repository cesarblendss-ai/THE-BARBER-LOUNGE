"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HUB_NAV } from "@/lib/hub";

function navActive(pathname: string, href: string, match: "exact" | "prefix"): boolean {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HubShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/hub";

  return (
    <div className="min-h-dvh bg-bone">
      <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-charcoal text-bone">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/hub" className="min-w-0">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-label text-brass">
              The Barber Lounge
            </p>
            <p className="truncate font-serif text-lg font-semibold leading-tight">Cesar’s Hub</p>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Hub">
            {HUB_NAV.map((item) => {
              const active = navActive(pathname, item.href, item.match);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                    active ? "bg-brass text-bone" : "text-bone/70 hover:bg-bone/10 hover:text-bone"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {children}

      <nav
        aria-label="Hub"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-charcoal/10 bg-charcoal/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden"
      >
        <ul className="grid grid-cols-5">
          {HUB_NAV.map((item) => {
            const active = navActive(pathname, item.href, item.match);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center px-1 py-2.5 text-[11px] font-semibold uppercase tracking-wider ${
                    active ? "text-brass" : "text-bone/60"
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
  );
}
