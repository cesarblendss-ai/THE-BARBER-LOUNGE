/** Client-side booking / lead capture events (same-page conversion). */

export const OPEN_LEAD_EVENT = "tbl:open-lead";
export const OPEN_BOOKING_CHAT_EVENT = "tbl:open-booking-chat";

export type OpenLeadDetail = {
  /** Prefill service interest (e.g. Signature Haircut). */
  service?: string;
  /** Booksy deep link to open after opt-in. */
  booksyUrl?: string;
  /** Analytics / CRM source label. */
  source?: string;
};

export function openLeadCapture(detail: OpenLeadDetail = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_LEAD_EVENT, { detail }));
}

export function openBookingChat(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_BOOKING_CHAT_EVENT));
}
