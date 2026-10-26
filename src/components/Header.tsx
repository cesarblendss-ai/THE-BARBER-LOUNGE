"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BOOKING_URL, SITE } from "@/lib/content";
import { LOGO } from "@/lib/constants";
import type { SiteContent } from "@/lib/site-content-types";
import { CloseIcon, MenuIcon } from "./icons";

type HeaderProps = {
  labels: SiteContent["HEADER"];
};

const NAV = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  { href: "/#services", label: "Services", match: (p: string) => p === "/services" },
  { href: "/about", label: "Barbers", match: (p: string) => p.startsWith("/about") },
  { href: "/contact", label: "Location", match: (p: string) => p.startsWith("/contact") },
] as const;

export function Header({ labels: _labels }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const solid = !isHome || scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? "border-b border-orange-500/25 bg-black/90 backdrop-blur-md"
          : "bg-transparent"
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
          <span className="absolute -right-3 -top-2 text-sm sm:-right-4 sm:text-base" aria-hidden>
            🕷️
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          {NAV.map((link) => {
            const active = link.match(pathname);
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
            data-analytics-label="Book Appointment (header)"
            className="inline-flex items-center rounded-md border border-orange-400/80 bg-orange-500/15 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-100 transition hover:bg-orange-400 hover:text-black"
          >
            Book Appointment
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <a
            href={`tel:${SITE.phoneTel}`}
            data-analytics-label="Call Now (mobile header)"
            className="rounded-md border border-white/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-white"
          >
            Call
          </a>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-label="Book Now (mobile header)"
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
            {NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
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
