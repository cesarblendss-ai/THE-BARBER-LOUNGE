import Link from "next/link";

import { EditableText } from "@/components/EditableText";
import { BOOKING_URL, SITE } from "@/lib/content";
import type { SiteContent } from "@/lib/site-content-types";

type FooterProps = {
  content: SiteContent;
  adminAuthenticated?: boolean;
};

const FOOTER_NAV = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/about", label: "Barbers" },
  { href: "/contact", label: "Location" },
] as const;

/** Clean conversion footer — no oversized wordmark, no public staff links. */
export function Footer({ content }: FooterProps) {
  const { SITE: site, HOURS, FOOTER } = content;
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-orange-500/25 bg-black text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-14 md:grid-cols-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-orange-300/70">
            Visit
          </p>
          <a
            href="https://maps.google.com/?q=1518+A+St,+Antioch,+CA+94509"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-sm leading-relaxed text-white/80 transition hover:text-orange-200"
          >
            <EditableText path="SITE.address" defaultValue={site.address} as="span" />
          </a>
          <a
            href={`tel:${SITE.phoneTel}`}
            className="mt-2 block text-sm text-white/70 transition hover:text-orange-200"
          >
            <EditableText path="SITE.phone" defaultValue={site.phone} as="span" />
          </a>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-sm text-white/55 transition hover:text-orange-200"
          >
            <EditableText path="SITE.instagram" defaultValue={site.instagram} as="span" />
          </a>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-orange-300/70">
            <EditableText path="FOOTER.hoursLabel" defaultValue={FOOTER.hoursLabel} as="span" />
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-white/70">
            {HOURS.map((item, index) => (
              <li key={item.day} className="flex justify-between gap-4">
                <EditableText path={`HOURS.${index}.day`} defaultValue={item.day} as="span" />
                <EditableText path={`HOURS.${index}.hours`} defaultValue={item.hours} as="span" />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-orange-300/70">
            <EditableText
              path="FOOTER.quickLinksLabel"
              defaultValue={FOOTER.quickLinksLabel}
              as="span"
            />
          </p>
          <nav aria-label="Footer navigation" className="mt-3">
            <ul className="space-y-2 text-sm">
              {FOOTER_NAV.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 transition hover:text-orange-200">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-200 transition hover:text-orange-100"
                >
                  <EditableText path="FOOTER.bookOnline" defaultValue={FOOTER.bookOnline} as="span" />
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t border-orange-500/20 px-5 py-5 text-center text-[11px] tracking-wide text-white/40 sm:px-8">
        © {year} <EditableText path="SITE.name" defaultValue={site.name} as="span" /> ·{" "}
        <EditableText path="FOOTER.copyright" defaultValue={FOOTER.copyright} as="span" /> · Happy
        Halloween
      </div>
    </footer>
  );
}
