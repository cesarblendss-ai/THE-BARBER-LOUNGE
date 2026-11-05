"use client";

import { EditableText } from "@/components/EditableText";
import { SITE, SITE_BOOK_PATH } from "@/lib/content";

type HomeFinalCtaProps = {
  headline: string;
  ctaLabel: string;
  ctaHref?: string;
};

export function HomeFinalCta({ headline, ctaLabel, ctaHref }: HomeFinalCtaProps) {
  const href = ctaHref || SITE_BOOK_PATH;
  const external = href.startsWith("http");

  return (
    <section
      className="border-t border-orange-500/20 bg-black px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-16"
      aria-labelledby="final-cta-heading"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-orange-300/70">
          Ready when you are
        </p>
        <EditableText
          path="HOME.finalCta.headline"
          defaultValue={headline}
          as="h2"
          id="final-cta-heading"
          className="mt-3 font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl"
        />
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/55">
          Book online in four steps on this site — or call the shop and we&apos;ll get you in the chair.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            data-analytics-label="Book Now (final CTA)"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-orange-400 sm:w-auto"
          >
            <EditableText path="HOME.finalCta.cta.label" defaultValue={ctaLabel} as="span" />
            <span aria-hidden>→</span>
          </a>
          <a
            href={`tel:${SITE.phoneTel}`}
            data-analytics-label="Call Now (final CTA)"
            className="inline-flex w-full items-center justify-center rounded-md border border-orange-400/50 px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-orange-100 transition hover:bg-orange-500/10 sm:w-auto"
          >
            Call {SITE.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
