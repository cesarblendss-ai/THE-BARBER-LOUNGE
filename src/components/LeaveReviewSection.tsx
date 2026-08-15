import { Button } from "@/components/Button";
import { StarIcon } from "@/components/icons";
import { SITE } from "@/lib/content";
import { REVIEW_LANDING_PATH } from "@/lib/reviews";

type LeaveReviewSectionProps = {
  variant?: "light" | "dark";
};

export function LeaveReviewSection({ variant = "dark" }: LeaveReviewSectionProps) {
  const isDark = variant === "dark";

  return (
    <section
      className={
        isDark
          ? "border-y border-brass/15 bg-charcoal px-4 py-16 sm:px-6 sm:py-20"
          : "border-t border-charcoal/10 bg-bone px-4 py-16 sm:px-6 sm:py-20"
      }
      aria-labelledby="leave-review-heading"
    >
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center gap-1" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              className={`h-4 w-4 ${isDark ? "text-brass" : "text-brass"}`}
            />
          ))}
        </div>
        <p
          className={`mt-4 font-sans text-xs font-semibold uppercase tracking-label ${
            isDark ? "text-brass" : "text-charcoal/50"
          }`}
        >
          {SITE.rating}★ · {SITE.reviewCount}+ Google reviews
        </p>
        <h2
          id="leave-review-heading"
          className={`mt-3 font-serif text-3xl font-semibold sm:text-4xl ${
            isDark ? "text-bone" : "text-charcoal"
          }`}
        >
          Enjoyed your visit?
        </h2>
        <p
          className={`mx-auto mt-4 max-w-md text-base leading-relaxed ${
            isDark ? "text-bone/70" : "text-charcoal/65"
          }`}
        >
          A quick Google review helps Antioch find a barbershop that actually delivers. It takes
          about a minute — and it means a lot to the chair that got you right.
        </p>
        <div className="mt-8">
          <Button
            href={REVIEW_LANDING_PATH}
            variant={isDark ? "primary" : "outline"}
            size="lg"
            analyticsLabel="Leave a review (homepage)"
          >
            Leave a Review
          </Button>
        </div>
      </div>
    </section>
  );
}
