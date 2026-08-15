import type { Metadata } from "next";

import { Button } from "@/components/Button";
import { StarIcon } from "@/components/icons";
import { SITE } from "@/lib/content";
import {
  getGoogleReviewHref,
  isGoogleReviewConfigured,
} from "@/lib/reviews";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Leave a Google Review",
  description:
    "Share your experience at The Barber Lounge in Antioch, CA. Your Google review helps local clients find precision fades and signature service.",
  path: "/review",
});

export default function ReviewPage() {
  const configured = isGoogleReviewConfigured();

  return (
    <>
      <section className="min-h-[80vh] bg-charcoal px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-lg text-center">
          <div className="flex justify-center gap-1" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className="h-5 w-5 text-brass" />
            ))}
          </div>
          <p className="mt-5 font-sans text-xs font-semibold uppercase tracking-label text-brass">
            The Barber Lounge · Antioch
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-bone sm:text-5xl">
            Thank you for sitting in our chair.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-bone/70">
            {SITE.rating}★ from {SITE.reviewCount}+ clients — your words help the next person walking
            in know what to expect. One thoughtful review on Google goes a long way.
          </p>

          <div className="mt-10">
            {configured ? (
              <Button
                href={getGoogleReviewHref()}
                external
                size="lg"
                className="w-full max-w-sm shadow-lg"
                analyticsLabel="Leave a Google Review (review page)"
              >
                Leave a Google Review
              </Button>
            ) : (
              <p className="rounded-2xl border border-brass/25 bg-bone/5 px-5 py-4 text-sm text-bone/80">
                Review link is being configured — ask your barber or call{" "}
                <a href={`tel:${SITE.phoneTel}`} className="text-brass hover:underline">
                  {SITE.phone}
                </a>
                .
              </p>
            )}
          </div>

          <p className="mt-8 text-xs leading-relaxed text-bone/45">
            Opens Google in a new tab. We never see your draft until you publish on Google.
          </p>
        </div>
      </section>
    </>
  );
}
