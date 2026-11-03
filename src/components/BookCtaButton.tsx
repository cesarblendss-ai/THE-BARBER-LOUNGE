"use client";

import { openLeadCapture } from "@/lib/booking-events";
import { BOOKING_URL } from "@/lib/content";

type BookCtaButtonProps = {
  label: string;
  source: string;
  booksyUrl?: string;
  service?: string;
  className?: string;
  analyticsLabel: string;
};

/** Same-page Book CTA — opens lead capture before Booksy handoff. */
export function BookCtaButton({
  label,
  source,
  booksyUrl = BOOKING_URL,
  service,
  className,
  analyticsLabel,
}: BookCtaButtonProps) {
  return (
    <button
      type="button"
      data-analytics-label={analyticsLabel}
      className={className}
      onClick={() =>
        openLeadCapture({
          source,
          booksyUrl,
          service,
        })
      }
    >
      {label}
    </button>
  );
}
