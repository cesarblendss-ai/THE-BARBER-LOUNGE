import type { Metadata } from "next";

import { Button } from "@/components/Button";
import { EditableText } from "@/components/EditableText";
import { FaqAccordion } from "@/components/FaqAccordion";
import { SectionLabel } from "@/components/SectionLabel";
import { getSiteContent } from "@/lib/get-site-content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "FAQ — Barbershop Antioch CA",
  description:
    "Common questions about booking, walk-ins, parking, hours, and services at The Barber Lounge barbershop in Antioch, CA.",
  path: "/faq",
});

export default function FaqPage() {
  const content = getSiteContent();
  const { FAQ, FAQ_PAGE } = content;

  return (
    <>
      <section className="bg-bone px-4 pb-8 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>
            <EditableText path="FAQ_PAGE.sectionLabel" defaultValue={FAQ_PAGE.sectionLabel} as="span" />
          </SectionLabel>
          <EditableText
            path="FAQ_PAGE.headline"
            defaultValue={FAQ_PAGE.headline}
            as="h1"
            className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl"
          />
          <EditableText
            path="FAQ_PAGE.subheadline"
            defaultValue={FAQ_PAGE.subheadline}
            as="p"
            className="mt-4 text-lg text-charcoal/70"
            multiline
          />
        </div>
      </section>

      <section className="bg-bone px-4 pb-16 sm:px-6 sm:pb-24" aria-label="FAQ accordion">
        <div className="mx-auto max-w-3xl">
          <FaqAccordion items={FAQ} />
        </div>
      </section>

      <section className="border-t border-charcoal/10 bg-bone px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <EditableText
            path="FAQ_PAGE.ctaHeadline"
            defaultValue={FAQ_PAGE.ctaHeadline}
            as="h2"
            className="font-serif text-2xl font-semibold text-charcoal sm:text-3xl"
          />
          <EditableText
            path="FAQ_PAGE.ctaBody"
            defaultValue={FAQ_PAGE.ctaBody}
            as="p"
            className="mt-3 text-charcoal/70"
            multiline
          />
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button href={content.CONTACT.cta.href} external size="lg">
              <EditableText path="FAQ_PAGE.bookNow" defaultValue={FAQ_PAGE.bookNow} as="span" />
            </Button>
            <Button href="/contact" variant="ghost">
              <EditableText path="FAQ_PAGE.contactUs" defaultValue={FAQ_PAGE.contactUs} as="span" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
