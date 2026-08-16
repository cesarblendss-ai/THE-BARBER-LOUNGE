import { BOOKING_URL, SITE } from "@/lib/content";

export function StickyBookButton() {
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-brass/20 bg-charcoal/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto flex max-w-lg gap-2">
        <a
          href={`tel:${SITE.phoneTel}`}
          aria-label={`Call The Barber Lounge at ${SITE.phone}`}
          data-analytics-label="Call Now (sticky)"
          className="flex min-h-12 flex-1 items-center justify-center rounded-full border border-brass/35 px-3 py-3.5 text-center text-sm font-semibold uppercase tracking-wider text-brass transition-colors hover:border-brass hover:bg-brass/10"
        >
          Call {SITE.phone}
        </a>
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Book an appointment online"
          data-analytics-label="Book Now (sticky)"
          className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-brass px-3 py-3.5 text-sm font-semibold uppercase tracking-wider text-bone transition-colors hover:bg-brass/90"
        >
          Book Now
        </a>
      </div>
    </nav>
  );
}
