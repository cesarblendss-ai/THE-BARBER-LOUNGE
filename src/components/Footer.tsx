import Link from "next/link";

import { EditableText } from "@/components/EditableText";
import { BOOKING_URL, SITE } from "@/lib/content";
import type { SiteContent } from "@/lib/site-content-types";

type FooterProps = {
  content: SiteContent;
  /** Kept for layout compatibility — staff links are not rendered publicly. */
  adminAuthenticated?: boolean;
};

const FOOTER_NAV = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/about", label: "Barbers" },
  { href: "/contact", label: "Location" },
] as const;

export function Footer({ content }: FooterProps) {
  const { SITE: site, HOURS, FOOTER } = content;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      {/* Intentional details band */}
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-6 sm:px-8 sm:pb-16 sm:pt-8 lg:pb-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/40">
              Visit
            </p>
            <a
              href="https://maps.google.com/?q=1518+A+St,+Antioch,+CA+94509"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block max-w-[16rem] font-serif text-xl leading-snug tracking-tight text-white transition hover:text-white/75 sm:text-2xl"
            >
              <EditableText path="SITE.address" defaultValue={site.address} as="span" />
            </a>
            <div className="mt-5 space-y-2 text-sm">
              <a
                href={`tel:${SITE.phoneTel}`}
                className="block text-white/70 transition hover:text-white"
              >
                <EditableText path="SITE.phone" defaultValue={site.phone} as="span" />
              </a>
              <a
                href={`mailto:${site.email}`}
                className="block break-all text-white/55 transition hover:text-white"
              >
                <EditableText path="SITE.email" defaultValue={site.email} as="span" />
              </a>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white/55 transition hover:text-white"
              >
                <EditableText path="SITE.instagram" defaultValue={site.instagram} as="span" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/40">
              <EditableText path="FOOTER.hoursLabel" defaultValue={FOOTER.hoursLabel} as="span" />
            </p>
            <ul className="mt-4 space-y-2.5">
              {HOURS.map((item, index) => {
                const closed = /closed/i.test(item.hours);
                return (
                  <li
                    key={item.day}
                    className={`flex items-baseline justify-between gap-6 text-sm ${
                      closed ? "text-white/35" : "text-white/75"
                    }`}
                  >
                    <EditableText
                      path={`HOURS.${index}.day`}
                      defaultValue={item.day}
                      as="span"
                      className="tracking-wide"
                    />
                    <EditableText
                      path={`HOURS.${index}.hours`}
                      defaultValue={item.hours}
                      as="span"
                      className="text-right tabular-nums"
                    />
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/40">
              <EditableText
                path="FOOTER.quickLinksLabel"
                defaultValue={FOOTER.quickLinksLabel}
                as="span"
              />
            </p>
            <nav aria-label="Footer navigation" className="mt-4">
              <ul className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-1 lg:gap-y-3">
                {FOOTER_NAV.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm uppercase tracking-[0.18em] text-white/70 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm uppercase tracking-[0.18em] text-white transition hover:text-white/70"
                  >
                    <EditableText
                      path="FOOTER.bookOnline"
                      defaultValue={FOOTER.bookOnline}
                      as="span"
                    />
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${SITE.phoneTel}`}
                    className="text-sm uppercase tracking-[0.18em] text-white/70 transition hover:text-white"
                  >
                    <EditableText path="FOOTER.callNow" defaultValue={FOOTER.callNow} as="span" />
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Oversized wordmark — the lasting impression */}
      <div className="mx-auto max-w-[100rem] px-3 pb-8 sm:px-5 sm:pb-10 lg:px-8 lg:pb-12">
        <p
          aria-label="The Barber Lounge"
          className="select-none text-center font-serif font-semibold uppercase leading-[0.86] tracking-[-0.045em] text-white/[0.92] sm:tracking-[-0.055em]"
          style={{
            fontSize: "clamp(2.6rem, 11.2vw, 9.75rem)",
          }}
        >
          <span className="block sm:inline">The Barber</span>
          <span className="hidden sm:inline"> </span>
          <span className="block sm:inline">Lounge</span>
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="h-px w-full bg-white/15" aria-hidden />
        <p className="py-5 text-center text-[11px] tracking-[0.14em] text-white/35 sm:py-6">
          © {year}{" "}
          <EditableText path="SITE.name" defaultValue={site.name} as="span" />
          <span className="mx-2 text-white/20" aria-hidden>
            ·
          </span>
          <EditableText path="FOOTER.copyright" defaultValue={FOOTER.copyright} as="span" />
        </p>
      </div>
    </footer>
  );
}
