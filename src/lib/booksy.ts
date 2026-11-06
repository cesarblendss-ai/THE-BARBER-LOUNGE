import { BOOKING_URL, SITE } from "@/lib/content";

/**
 * Booksy integration notes:
 *
 * - Live *availability* is readable via the same public customer `time_slots` endpoint
 *   the Booksy booking widget uses (see `booksy-availability.ts`). No login / password.
 * - No public API for third-party appointment *creation* on custom sites — website
 *   bookings remain requests staff confirm in Booksy.
 * - Profile deep links: `service_variant_id` / `staffer` hand off to Booksy.
 *
 * Security: never ask for or store Booksy Biz passwords in chat, git, or env.
 * The web `X-Api-Key` below is Booksy's publishable client constant (in their JS
 * bundle for every anonymous visitor) — not a shop credential.
 */

/** Booksy business id for The Barber Lounge (US marketplace). */
export const BOOKSY_BUSINESS_ID = "1180862";

/**
 * Booksy's public web-client API key (constant shipped to browsers).
 * Override only if Booksy rotates the web key: set `BOOKSY_WEB_API_KEY` in Vercel.
 */
export const BOOKSY_WEB_API_KEY =
  process.env.BOOKSY_WEB_API_KEY?.trim() || "web-e3d812bf-d7a2-445d-ab38-55589ae6a121";

export const BOOKSY_WEB_API_VERSION = "3.0";

/** Booksy service variant IDs from the live shop profile (Signature menu). */
export const BOOKSY_SERVICE_VARIANT = {
  signatureHaircut: "16190327",
  signatureHaircutBeard: "16190328",
} as const;

/**
 * Booksy staffer / resource IDs from the live shop profile (us-1180862).
 * Deep-link with `?staffer=<id>` so the customer lands on that barber.
 */
export const BOOKSY_STAFFER = {
  alexisFranco: "1124582",
  braulioGomez: "1740160",
  cesarSilva: "1653463",
  kristianGuerra: "1659337",
  sebastianGuardado: "1691142",
} as const;

export type BookingIntent = {
  service: string;
  preferredDay: string;
  preferredTime: string;
  guestCount?: number;
};

/** Opens the shop's Booksy profile. */
export function getBooksyBookingUrl(): string {
  return BOOKING_URL;
}

/** Opens Booksy focused on a specific service variant when possible. */
export function getBooksyServiceUrl(serviceVariantId: string): string {
  const url = new URL(BOOKING_URL);
  url.searchParams.set("service_variant_id", serviceVariantId);
  return url.toString();
}

/** Opens Booksy with a specific barber (staffer) pre-selected. */
export function getBooksyStafferUrl(stafferId: string): string {
  const url = new URL(BOOKING_URL);
  url.searchParams.set("staffer", stafferId);
  return url.toString();
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
