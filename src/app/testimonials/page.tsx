import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { SectionLabel } from "@/components/SectionLabel";
import { StarIcon } from "@/components/icons";
import { TESTIMONIALS, GOOGLE_REVIEW_URL } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Reviews — Barbershop Antioch CA",
  description:
    "Read 180+ five-star Google reviews for The Barber Lounge in Antioch, CA. Real clients on Braulio, Lex, Cesar, Sebastian, and the full team.",
  path: "/testimonials",
});

export default function TestimonialsPage() {
  const { hero, quotes, cta } = TESTIMONIALS;

  return (
    <>
      <section className="bg-bone px-4 pb-8 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>Google Reviews</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            {hero.headline}
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">{hero.subheadline}</p>
          <div className="mt-4 flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className="h-5 w-5 text-brass" />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bone px-4 pb-16 sm:px-6 sm:pb-24" aria-label="Customer reviews">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
          {quotes.map((item) => (
            <article
              key={`${item.attribution}-${item.quote.slice(0, 24)}`}
              className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} className="h-3.5 w-3.5 text-brass" />
                ))}
              </div>
              <blockquote className="font-serif text-base leading-relaxed text-charcoal">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-charcoal/60">
                {item.attribution}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-charcoal/10 bg-bone px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-serif text-2xl font-semibold text-charcoal sm:text-3xl">
            Ready to see why Antioch keeps coming back?
          </h2>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button href={cta.href} external size="lg">
              {cta.label}
            </Button>
            {GOOGLE_REVIEW_URL ? (
              <Button href={GOOGLE_REVIEW_URL} external variant="outline">
                Leave a Google Review
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
