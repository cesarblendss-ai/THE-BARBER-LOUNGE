import type { Metadata } from "next";

import { EditableText } from "@/components/EditableText";
import { ClockIcon, PinIcon, PhoneIcon } from "@/components/icons";
import { CONTACT, SITE } from "@/lib/content";
import { getSiteContent } from "@/lib/get-site-content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Location — Antioch, CA",
  description:
    "Find The Barber Lounge at 1518 A St, Antioch, CA. Hours, phone, and directions.",
  path: "/contact",
});

const MAPS_QUERY = encodeURIComponent(CONTACT.address);
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;
const MAPS_EMBED = `https://maps.google.com/maps?q=${MAPS_QUERY}&output=embed`;

export default async function ContactPage() {
  const content = await getSiteContent();
  const { SITE: site, HOURS } = content;

  return (
    <section className="bg-black px-5 pb-20 pt-28 text-white sm:px-8 sm:pb-28 sm:pt-32">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">Location</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          Visit the shop
        </h1>

        <address className="mt-10 not-italic">
          <p className="flex items-start gap-3 text-base text-white/90">
            <PinIcon className="mt-0.5 h-5 w-5 shrink-0 stroke-white/80" />
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <EditableText path="SITE.address" defaultValue={site.address} as="span" />
            </a>
          </p>
          <p className="mt-5 flex items-center gap-3">
            <PhoneIcon className="h-5 w-5 shrink-0 stroke-white/80" />
            <a
              href={`tel:${SITE.phoneTel}`}
              className="text-lg font-medium text-white hover:text-white/80"
              data-analytics-label="Call Now (location page)"
            >
              <EditableText path="SITE.phone" defaultValue={site.phone} as="span" />
            </a>
          </p>
          <p className="mt-4 text-white/55">
            <a href={`mailto:${site.email}`} className="hover:text-white">
              <EditableText path="SITE.email" defaultValue={site.email} as="span" />
            </a>
          </p>
          <p className="mt-2">
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white/70 hover:text-white"
            >
              <EditableText path="SITE.instagram" defaultValue={site.instagram} as="span" />
            </a>
          </p>
        </address>

        <div className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <ClockIcon className="h-5 w-5 stroke-white/80" />
            <h2 className="font-serif text-xl font-semibold text-white">Hours</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {HOURS.map((row, index) => (
                <tr key={row.day} className="border-b border-white/10 last:border-0">
                  <th scope="row" className="py-2.5 pr-4 text-left font-medium text-white">
                    <EditableText path={`HOURS.${index}.day`} defaultValue={row.day} as="span" />
                  </th>
                  <td className="py-2.5 text-right text-white/60">
                    <EditableText path={`HOURS.${index}.hours`} defaultValue={row.hours} as="span" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-white/15">
          <iframe
            title={`Map showing ${site.address}`}
            src={MAPS_EMBED}
            className="h-72 w-full sm:h-96"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <p className="bg-white/[0.03] px-4 py-3 text-center text-sm">
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white/70 hover:text-white"
            >
              Open in Google Maps
            </a>
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href={`tel:${SITE.phoneTel}`}
            data-analytics-label="Call Now (location CTA)"
            className="inline-flex items-center justify-center rounded-md bg-white px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-white/90"
          >
            Call Now
          </a>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-white/60 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
          >
            Get Directions
          </a>
        </div>
      </div>
    </section>
  );
}
