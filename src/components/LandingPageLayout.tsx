import Link from "next/link";

import { Button } from "@/components/Button";
import { FaqAccordion } from "@/components/FaqAccordion";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/content";
import type { LandingPageConfig } from "@/lib/landing-pages";

type LandingPageLayoutProps = {
  config: LandingPageConfig;
};

export function LandingPageLayout({ config }: LandingPageLayoutProps) {
  return (
    <>
      <section className="bg-bone px-4 pb-8 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>{config.eyebrow}</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            {config.headline}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-charcoal/70">{config.subheadline}</p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button href={config.cta.href} external={config.cta.external} size="lg">
              {config.cta.label}
            </Button>
            {config.secondaryCta ? (
              <Button
                href={config.secondaryCta.href}
                external={config.secondaryCta.external}
                variant="ghost"
              >
                {config.secondaryCta.label}
              </Button>
            ) : null}
          </div>
          <p className="mt-6 text-sm text-charcoal/50">{SITE.address}</p>
        </div>
      </section>

      <section className="bg-bone px-4 py-12 sm:px-6" aria-label="Why choose us">
        <div className="mx-auto max-w-2xl">
          <ul className="space-y-4">
            {config.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-charcoal/80">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brass text-xs text-bone">
                  ✓
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {config.faqs.length > 0 ? (
        <section className="border-t border-charcoal/10 bg-bone px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-2xl">
            <h2 className="sr-only">Frequently asked questions</h2>
            <FaqAccordion
              items={config.faqs.map((f) => ({ q: f.question, a: f.answer }))}
            />
          </div>
        </section>
      ) : null}

      {config.relatedBlog ? (
        <section className="bg-bone px-4 py-8 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Link
              href={config.relatedBlog.href}
              className="text-sm font-medium text-brass underline-offset-2 hover:underline"
            >
              {config.relatedBlog.label} →
            </Link>
          </div>
        </section>
      ) : null}

      <section className="bg-bone px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-serif text-2xl font-semibold text-charcoal sm:text-3xl">
            Ready when you are.
          </h2>
          <div className="mt-6">
            <Button href={config.cta.href} external={config.cta.external} size="lg">
              {config.cta.label}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
