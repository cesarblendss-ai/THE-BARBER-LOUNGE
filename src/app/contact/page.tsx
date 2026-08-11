import type { Metadata } from "next";

import { Button } from "@/components/Button";
import { ContactForm } from "@/components/ContactForm";
import { EditableText } from "@/components/EditableText";
import { SectionLabel } from "@/components/SectionLabel";
import { ClockIcon, PinIcon } from "@/components/icons";
import { BOOKING_URL, CONTACT, SITE } from "@/lib/content";
import { getSiteContent } from "@/lib/get-site-content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact in Antioch, CA",
  description:
    "Have questions? Contact The Barber Lounge in Antioch for quotes and appointments. We're here to help!",
  path: "/contact",
});

const MAPS_QUERY = encodeURIComponent(CONTACT.address);
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;
const MAPS_EMBED = `https://maps.google.com/maps?q=${MAPS_QUERY}&output=embed`;

export default function ContactPage() {
  const content = getSiteContent();
  const { CONTACT: contactContent, SITE: site, HOURS } = content;
  const { hero, visit, form, cta } = contactContent;
  const { formFields } = CONTACT;

  return (
    <>
      <section className="bg-bone px-4 pb-8 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>
            <EditableText path="CONTACT.hero.sectionLabel" defaultValue={hero.sectionLabel} as="span" />
          </SectionLabel>
          <EditableText
            path="CONTACT.hero.headline"
            defaultValue={hero.headline}
            as="h1"
            className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl"
          />
          <EditableText
            path="CONTACT.hero.subheadline"
            defaultValue={hero.subheadline}
            as="p"
            className="mt-4 text-lg text-charcoal/70"
            multiline
          />
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button href={`tel:${SITE.phoneTel}`} size="lg">
              <EditableText path="CONTACT.hero.callNow" defaultValue={hero.callNow} as="span" />
            </Button>
            <Button href={BOOKING_URL} external size="lg">
              <EditableText path="CONTACT.hero.bookNow" defaultValue={hero.bookNow} as="span" />
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-bone px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionLabel>
              <EditableText path="CONTACT.visit.sectionLabel" defaultValue={visit.sectionLabel} as="span" />
            </SectionLabel>
            <address className="mt-4 not-italic">
              <p className="flex items-start gap-3 text-base text-charcoal">
                <PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brass"
                >
                  <EditableText path="SITE.address" defaultValue={site.address} as="span" />
                </a>
              </p>
              <p className="mt-4">
                <a href={`tel:${SITE.phoneTel}`} className="text-lg font-medium text-charcoal hover:text-brass">
                  <EditableText path="SITE.phone" defaultValue={site.phone} as="span" className="text-lg font-medium text-charcoal" />
                </a>
              </p>
              <p className="mt-2 text-charcoal/70">
                <a href={`mailto:${site.email}`} className="hover:text-brass">
                  <EditableText path="SITE.email" defaultValue={site.email} as="span" className="text-charcoal/70" />
                </a>
              </p>
              <p className="mt-2">
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brass-dark hover:text-brass"
                >
                  <EditableText path="SITE.instagram" defaultValue={site.instagram} as="span" className="font-medium text-brass-dark" />
                </a>
              </p>
            </address>

            <div className="mt-10">
              <div className="mb-4 flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-brass" />
                <EditableText
                  path="CONTACT.visit.hoursHeadline"
                  defaultValue={visit.hoursHeadline}
                  as="h2"
                  className="font-serif text-xl font-semibold text-charcoal"
                />
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {HOURS.map((row, index) => (
                    <tr key={row.day} className="border-b border-charcoal/10 last:border-0">
                      <th scope="row" className="py-2.5 pr-4 text-left font-medium text-charcoal">
                        <EditableText path={`HOURS.${index}.day`} defaultValue={row.day} as="span" className="font-medium text-charcoal" />
                      </th>
                      <td className="py-2.5 text-right text-charcoal/70">
                        <EditableText path={`HOURS.${index}.hours`} defaultValue={row.hours} as="span" className="text-charcoal/70" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-10 overflow-hidden rounded-2xl border border-charcoal/10">
              <iframe
                title={`Map showing ${site.address}`}
                src={MAPS_EMBED}
                className="h-64 w-full sm:h-80"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <p className="bg-white px-4 py-3 text-center text-sm">
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brass-dark hover:text-brass"
                >
                  <EditableText path="CONTACT.visit.openInMaps" defaultValue={visit.openInMaps} as="span" className="font-medium text-brass-dark" />
                </a>
              </p>
            </div>
          </div>

          <div>
            <SectionLabel>
              <EditableText path="CONTACT.form.sectionLabel" defaultValue={form.sectionLabel} as="span" />
            </SectionLabel>
            <EditableText
              path="CONTACT.form.headline"
              defaultValue={form.headline}
              as="h2"
              className="mt-2 font-serif text-2xl font-semibold text-charcoal sm:text-3xl"
            />
            <p className="mt-3 text-sm text-charcoal/60">
              <EditableText path="CONTACT.form.body" defaultValue={form.body} as="span" className="text-sm text-charcoal/60" />{" "}
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="text-brass-dark hover:underline">
                <EditableText path="CONTACT.form.bookOnlineLink" defaultValue={form.bookOnlineLink} as="span" className="text-brass-dark" />
              </a>{" "}
              for the fastest appointment.
            </p>
            <div className="mt-8 rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
              <ContactForm fields={formFields} />
            </div>
            <div className="mt-8 text-center">
              <Button href={cta.href} external size="lg">
                <EditableText path="CONTACT.cta.label" defaultValue={cta.label} as="span" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
