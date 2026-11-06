/**
 * Booksy customer handoff deep links.
 *
 * Booksy's public web booking widget opens via:
 *   ?do=open-widget&variantId=<service>&stafferId=<barber>&date=YYYY-MM-DD
 *
 * Confirmed in Booksy's marketplace JS (`gh()` builder). Optional `time=HH:MM`
 * is passed when we know it — Booksy may still ask the customer to tap the slot.
 *
 * Appointment *create* (`POST .../me/appointments/business/{id}/`) requires a
 * customer `x-access-token` and books under that Booksy account — not usable
 * server-side for arbitrary website guests without their login. Deep-link
 * handoff keeps Booksy as the calendar of record with zero staff re-typing.
 */

import {
  BOOKSY_SERVICE_VARIANT,
  BOOKSY_STAFFER,
  getBooksyBookingUrl,
} from "@/lib/booksy";
import { ABOUT, BOOKING_URL } from "@/lib/content";

export type BooksyHandoffInput = {
  serviceVariantId?: string;
  stafferId?: string | null;
  /** Shop-local calendar date YYYY-MM-DD */
  date?: string | null;
  /** 24h HH:MM when known */
  time?: string | null;
};

export type BookingHandoffFields = {
  service: string;
  preferredTime: string;
  slotDate?: string | null;
  barberName?: string | null;
};

/** Map website service labels → Booksy Signature variant ids. */
export function resolveBooksyServiceVariantId(serviceLabel: string): string {
  const s = serviceLabel.toLowerCase();
  if (s.includes("beard")) return BOOKSY_SERVICE_VARIANT.signatureHaircutBeard;
  return BOOKSY_SERVICE_VARIANT.signatureHaircut;
}

/** Infer "with {Name}" from legacy service labels. */
export function barberNameFromServiceLabel(service: string): string | null {
  const match = service.match(/\bwith\s+(.+)$/i);
  if (!match) return null;
  return match[1].trim() || null;
}

/** Resolve Booksy staffer id from full or first name (ABOUT.team + known ids). */
export function resolveBooksyStafferId(barberName?: string | null): string | null {
  const raw = barberName?.trim();
  if (!raw || /^any\b/i.test(raw)) return null;

  const fromTeam = ABOUT.team.find(
    (m) =>
      m.booksyStafferId &&
      (m.name === raw ||
        m.name.toLowerCase() === raw.toLowerCase() ||
        m.name.toLowerCase().startsWith(raw.toLowerCase())),
  );
  if (fromTeam?.booksyStafferId) return fromTeam.booksyStafferId;

  const first = raw.split(/\s+/)[0] ?? "";
  const known: Record<string, string> = {
    Alexis: BOOKSY_STAFFER.alexisFranco,
    Braulio: BOOKSY_STAFFER.braulioGomez,
    Cesar: BOOKSY_STAFFER.cesarSilva,
    Kristian: BOOKSY_STAFFER.kristianGuerra,
    Sebastian: BOOKSY_STAFFER.sebastianGuardado,
  };
  for (const [name, id] of Object.entries(known)) {
    if (first.toLowerCase() === name.toLowerCase()) return id;
  }
  return null;
}

/** Parse "11:45 AM" / "1:00 PM" → "11:45" / "13:00". */
export function toBooksyTimeParam(preferredTime: string): string | null {
  const normalized = preferredTime.trim().toLowerCase().replace(/\./g, "");
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = match[2] ? Number(match[2]) : 0;
  const meridiem = match[3];

  if (hour > 23 || minute > 59) return null;
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  if (!meridiem && hour <= 7) hour += 12;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * Deep link that opens Booksy's booking widget with service (+ staffer/date/time)
 * preselected so the customer (or staff) finishes on Booksy's calendar.
 */
export function getBooksyHandoffUrl(input: BooksyHandoffInput = {}): string {
  const url = new URL(BOOKING_URL);
  const variantId = input.serviceVariantId ?? BOOKSY_SERVICE_VARIANT.signatureHaircut;

  url.searchParams.set("do", "open-widget");
  url.searchParams.set("variantId", variantId);
  // Legacy params still honored by older share links / profile CTAs.
  url.searchParams.set("service_variant_id", variantId);

  if (input.stafferId) {
    url.searchParams.set("stafferId", input.stafferId);
    url.searchParams.set("staffer", input.stafferId);
  }
  if (input.date && /^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    url.searchParams.set("date", input.date);
  }
  if (input.time && /^\d{2}:\d{2}$/.test(input.time)) {
    url.searchParams.set("time", input.time);
  }

  return url.toString();
}

/** Build handoff URL from a website booking / receipt. */
export function getBooksyHandoffFromBooking(fields: BookingHandoffFields): string {
  const barber =
    fields.barberName?.trim() || barberNameFromServiceLabel(fields.service) || null;
  return getBooksyHandoffUrl({
    serviceVariantId: resolveBooksyServiceVariantId(fields.service),
    stafferId: resolveBooksyStafferId(barber),
    date: fields.slotDate ?? null,
    time: toBooksyTimeParam(fields.preferredTime),
  });
}

/** Fallback shop profile when we have nothing to preselect. */
export function getBooksyProfileUrl(): string {
  return getBooksyBookingUrl();
}
