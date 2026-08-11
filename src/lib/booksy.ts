import { BOOKING_URL, SITE } from "@/lib/content";

/**
 * Booksy integration limits (as of 2025):
 *
 * - No public API for third-party appointment creation. Booksy's partner REST API
 *   requires formal onboarding, RSA key-pair auth, and is not available to
 *   individual businesses embedding booking on their own sites.
 * - Consumer booking profile URLs (booksy.com/en-us/{slug}) do not document
 *   query parameters for pre-selecting service, date, or time.
 * - The embed/widget likewise does not expose deep-link prefill for external sites.
 *
 * Our bot collects service + preferred day/time + name + phone, checks internal
 * availability, creates a website appointment request, and shows a confirmation
 * receipt. Cesar gets a push notification and enters the booking in Booksy manually.
 * BOOKING_URL remains available as an optional secondary link.
 */

export type BookingIntent = {
  service: string;
  preferredDay: string;
  preferredTime: string;
  guestCount?: number;
};

/** Opens the shop's Booksy profile — no prefill params are supported. */
export function getBooksyBookingUrl(): string {
  return BOOKING_URL;
}

export function formatBookingSummary(intent: BookingIntent): string {
  const guests =
    intent.guestCount && intent.guestCount > 1
      ? `${intent.guestCount} guests`
      : null;

  return [
    "The Barber Lounge — booking request",
    `Service: ${intent.service}${guests ? ` (${guests})` : ""}`,
    `Preferred: ${intent.preferredDay} at ${intent.preferredTime}`,
    `Book online: ${BOOKING_URL}`,
    `Or call: ${SITE.phone}`,
  ].join("\n");
}
