import { BOOKING_URL, SITE } from "@/lib/content";
import { PhoneIcon } from "./icons";

export function StickyBookButton() {
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-orange-500/30 bg-black/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto flex max-w-lg gap-2">
        <a
          href={`tel:${SITE.phoneTel}`}
          aria-label={`Call The Barber Lounge at ${SITE.phone}`}
          data-analytics-label="Call Now (sticky)"
          className="flex shrink-0 items-center justify-center rounded-md border border-orange-400/50 px-4 py-3.5 text-orange-100 transition-colors hover:bg-orange-500/15"
        >
          <PhoneIcon className="h-5 w-5 stroke-orange-100" />
        </a>
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Book an appointment online"
          data-analytics-label="Book Appointment (sticky)"
          className="flex flex-1 items-center justify-center rounded-md bg-orange-500 px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-black transition-colors hover:bg-orange-400"
        >
          🎃 Book Appointment
        </a>
      </div>
    </nav>
  );
}
