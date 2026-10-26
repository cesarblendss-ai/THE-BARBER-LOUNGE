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

const CINEMATIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/about", label: "Barbers" },
  { href: "/#work", label: "Work" },
  { href: "/contact", label: "Location" },
] as const;

export function Header({ labels }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const isHome = pathname === "/";
  const nav = isHome ? CINEMATIC_NAV : NAV_LINKS;

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

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

  if (isHome) {
    return (
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled || open ? "border-b border-white/10 bg-black/85 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="relative block shrink-0">
            <Image
              src={LOGO.src}
              alt={LOGO.alt}
              width={LOGO.width}
              height={LOGO.height}
              priority
              sizes="(max-width: 640px) 150px, 190px"
              className="h-auto w-[150px] object-contain brightness-0 invert sm:w-[190px]"
            />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            {nav.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-[11px] font-medium uppercase tracking-[0.22em] transition ${
                    active ? "border-b border-white pb-1 text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:block">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-label="Book Appointment (cinematic header)"
              className="inline-flex items-center rounded-md border border-white/80 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-black"
            >
              Book Appointment
            </a>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={`tel:${SITE.phoneTel}`}
              data-analytics-label="Call Now (mobile cinematic header)"
              className="rounded-md border border-white/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-white"
            >
              Call
            </a>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-label="Book Now (mobile cinematic header)"
              className="rounded-md bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-black"
            >
              Book
            </a>
            <button
              ref={menuButtonRef}
              type="button"
              className="rounded-md p-2 text-white"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen(!open)}
            >
              {open ? <CloseIcon className="h-6 w-6 stroke-white" /> : <MenuIcon className="h-6 w-6 stroke-white" />}
            </button>
          </div>
        </div>

        {open && (
          <nav
            ref={mobileNavRef}
            id="mobile-nav"
            className="border-t border-white/10 bg-black px-5 py-4 lg:hidden"
            aria-label="Mobile navigation"
          >
            <ul className="flex flex-col gap-4">
              {nav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className="block text-sm font-medium uppercase tracking-[0.18em] text-white/80 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
    );
  }

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
