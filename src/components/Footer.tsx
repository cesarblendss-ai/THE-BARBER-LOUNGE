import Image from "next/image";
import Link from "next/link";

import { EditableText } from "@/components/EditableText";
import { BOOKING_URL, SITE } from "@/lib/content";
import { LOGO, NAV_LINKS } from "@/lib/constants";
import type { SiteContent } from "@/lib/site-content-types";
import { PinIcon } from "./icons";

type FooterProps = {
  content: SiteContent;
  adminAuthenticated?: boolean;
};

export function Footer({ content, adminAuthenticated = false }: FooterProps) {
  const { SITE: site, HOURS, FOOTER } = content;

  return (
    <footer className="border-t border-bone/10 bg-charcoal text-bone">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Link href="/" className="inline-block">
            <Image
              src={LOGO.src}
              alt={LOGO.alt}
              width={LOGO.width}
              height={LOGO.height}
              sizes="(max-width: 640px) 140px, 160px"
              className="h-auto w-[140px] brightness-0 invert filter sm:w-[160px]"
            />
          </Link>
          <p className="mt-4 flex items-start gap-2 text-sm text-bone">
            <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
            <EditableText path="SITE.address" defaultValue={site.address} as="span" className="text-bone" />
          </p>
          <p className="mt-2 text-sm">
            <a href={`tel:${SITE.phoneTel}`} className="text-bone hover:text-brass">
              <EditableText path="SITE.phone" defaultValue={site.phone} as="span" className="text-bone" />
            </a>
          </p>
          <p className="mt-2 text-sm">
            <a href={`mailto:${site.email}`} className="text-bone hover:text-brass">
              <EditableText path="SITE.email" defaultValue={site.email} as="span" className="text-bone" />
            </a>
          </p>
        </div>

        <div>
          <p className="section-label mb-4 text-brass">
            <EditableText path="FOOTER.hoursLabel" defaultValue={FOOTER.hoursLabel} as="span" />
          </p>
          <ul className="space-y-1 text-sm text-bone">
            {HOURS.map((item, index) => (
              <li key={item.day} className="flex justify-between gap-4">
                <EditableText
                  path={`HOURS.${index}.day`}
                  defaultValue={item.day}
                  as="span"
                  className="text-bone"
                />
                <EditableText
                  path={`HOURS.${index}.hours`}
                  defaultValue={item.hours}
                  as="span"
                  className="text-bone"
                />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <nav aria-label="Footer navigation">
            <p className="section-label mb-4 text-brass">
              <EditableText path="FOOTER.quickLinksLabel" defaultValue={FOOTER.quickLinksLabel} as="span" />
            </p>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-bone hover:text-brass">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={`tel:${SITE.phoneTel}`} className="text-bone hover:text-brass">
                  <EditableText path="FOOTER.callNow" defaultValue={FOOTER.callNow} as="span" className="text-bone" />
                </a>
              </li>
              <li>
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bone hover:text-brass"
                >
                  <EditableText path="FOOTER.bookOnline" defaultValue={FOOTER.bookOnline} as="span" className="text-bone" />
                </a>
              </li>
              <li>
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bone hover:text-brass"
                >
                  <EditableText path="SITE.instagram" defaultValue={site.instagram} as="span" className="text-bone" />
                </a>
              </li>
              <li>
                <Link href="/locations" className="text-bone hover:text-brass">
                  Locations we serve
                </Link>
              </li>
              <li>
                <Link href="/areas/pittsburg" className="text-bone hover:text-brass">
                  Pittsburg area
                </Link>
              </li>
              <li>
                <Link href="/areas/brentwood" className="text-bone hover:text-brass">
                  Brentwood area
                </Link>
              </li>
              <li>
                <Link href="/refer" className="text-bone hover:text-brass">
                  Refer a friend
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t border-bone/10 px-4 py-6 text-center text-xs text-bone/60 sm:px-6">
        <p>
          © {new Date().getFullYear()}{" "}
          <EditableText path="SITE.name" defaultValue={site.name} as="span" className="text-bone/60" />.{" "}
          <EditableText path="FOOTER.copyright" defaultValue={FOOTER.copyright} as="span" className="text-bone/60" />
        </p>
        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {adminAuthenticated ? (
            <>
              <Link
                href="/admin"
                className="text-sm font-medium text-brass underline-offset-2 hover:underline"
              >
                Staff hub
              </Link>
              <span className="text-bone/30" aria-hidden="true">
                ·
              </span>
              <Link
                href="/admin/edit"
                className="text-bone/50 hover:text-brass"
              >
                <EditableText path="FOOTER.editSiteText" defaultValue={FOOTER.editSiteText} as="span" />
              </Link>
              <span className="text-bone/30" aria-hidden="true">
                ·
              </span>
              <Link href="/admin/hero" className="text-bone/50 hover:text-brass">
                <EditableText path="FOOTER.updateHeroVideos" defaultValue={FOOTER.updateHeroVideos} as="span" />
              </Link>
              <span className="text-bone/30" aria-hidden="true">
                ·
              </span>
              <Link href="/admin/gallery" className="text-bone/50 hover:text-brass">
                <EditableText path="FOOTER.manageGallery" defaultValue={FOOTER.manageGallery} as="span" />
              </Link>
              <span className="text-bone/30" aria-hidden="true">
                ·
              </span>
              <Link href="/admin/calendar" className="text-bone/50 hover:text-brass">
                This week
              </Link>
              <span className="text-bone/30" aria-hidden="true">
                ·
              </span>
            </>
          ) : null}
          <Link href="/shop-log" className="text-bone/50 hover:text-brass">
            Log product
          </Link>
        </p>
      </div>
    </footer>
  );
}
