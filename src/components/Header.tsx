"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BOOKING_URL, SITE } from "@/lib/content";
import { LOGO, NAV_LINKS } from "@/lib/constants";
import type { SiteContent } from "@/lib/site-content-types";
import { Button } from "./Button";
import { EditableText } from "./EditableText";
import { CloseIcon, MenuIcon } from "./icons";

type HeaderProps = {
  labels: SiteContent["HEADER"];
};

export function Header({ labels }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const firstLink = mobileNavRef.current?.querySelector<HTMLElement>("a, button");
    firstLink?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-charcoal/5 bg-bone/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="relative block shrink-0">
          <Image
            src={LOGO.src}
            alt={LOGO.alt}
            width={LOGO.width}
            height={LOGO.height}
            priority
            sizes="(max-width: 640px) 160px, 200px"
            className="h-auto w-[160px] object-contain sm:w-[200px]"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`text-sm font-medium transition-colors hover:text-brass-dark ${
                pathname === link.href
                  ? "border-b-2 border-brass pb-0.5 text-brass-dark"
                  : "text-charcoal/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button
            href={`tel:${SITE.phoneTel}`}
            variant="outline"
            size="default"
            analyticsLabel="Call Now (header)"
          >
            <EditableText path="HEADER.callNow" defaultValue={labels.callNow} as="span" />
          </Button>
          <Button href={BOOKING_URL} external size="default" analyticsLabel="Book Now (header)">
            <EditableText path="HEADER.bookNow" defaultValue={labels.bookNow} as="span" />
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <a
            href={`tel:${SITE.phoneTel}`}
            data-analytics-label="Call Now (mobile header)"
            className="rounded-full border border-brass px-3 py-2 text-xs font-semibold uppercase tracking-wide text-brass-dark"
          >
            Call
          </a>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-label="Book Now (mobile header)"
            className="rounded-full bg-brass px-3 py-2 text-xs font-semibold uppercase tracking-wide text-bone"
          >
            Book
          </a>
          <button
            ref={menuButtonRef}
            type="button"
            className="rounded-full p-2 text-charcoal"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
          >
            {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          ref={mobileNavRef}
          id="mobile-nav"
          className="border-t border-charcoal/5 bg-bone px-4 py-4 lg:hidden"
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className="block text-base font-medium text-charcoal/80 hover:text-brass-dark"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Button
                href={`tel:${SITE.phoneTel}`}
                variant="outline"
                className="w-full"
                analyticsLabel="Call Now (mobile menu)"
              >
                <EditableText path="HEADER.callNow" defaultValue={labels.callNow} as="span" />
              </Button>
            </li>
            <li>
              <Button
                href={BOOKING_URL}
                external
                className="w-full"
                analyticsLabel="Book Now (mobile menu)"
              >
                <EditableText path="HEADER.bookNow" defaultValue={labels.bookNow} as="span" />
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
