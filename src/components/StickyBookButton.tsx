import { BOOKING_URL, SITE } from "@/lib/content";

export function StickyBookButton() {
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-charcoal/10 bg-bone/95 p-3 backdrop-blur-md md:hidden"
    >
      <div className="flex gap-2">
        <a
          href={`tel:${SITE.phoneTel}`}
          aria-label={`Call The Barber Lounge at ${SITE.phone}`}
          data-analytics-label="Call Now (sticky)"
          className="flex flex-1 items-center justify-center rounded-full border-2 border-brass px-4 py-3.5 text-sm font-semibold uppercase tracking-wider text-brass-dark transition-colors hover:bg-brass hover:text-bone"
        >
          Call Now
        </a>
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Book an appointment online"
          data-analytics-label="Book Now (sticky)"
          className="flex flex-1 items-center justify-center rounded-full bg-brass px-4 py-3.5 text-sm font-semibold uppercase tracking-wider text-bone transition-colors hover:bg-brass/90"
        >
          Book Now
        </a>
      </div>
    </nav>
  );
}
