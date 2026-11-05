import Link from "next/link";

import { SITE_BOOK_PATH } from "@/lib/content";

type BookCtaButtonProps = {
  label: string;
  source: string;
  booksyUrl?: string;
  service?: string;
  className?: string;
  analyticsLabel: string;
};

/** Primary Book CTA — same-site `/book` funnel (Booksy remains fallback inside /book). */
export function BookCtaButton({
  label,
  source,
  className,
  analyticsLabel,
}: BookCtaButtonProps) {
  return (
    <Link
      href={SITE_BOOK_PATH}
      data-analytics-label={analyticsLabel}
      data-book-source={source}
      className={className}
    >
      {label}
    </Link>
  );
}
