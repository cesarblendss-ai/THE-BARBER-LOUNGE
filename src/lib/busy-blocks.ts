/**
 * Phone-friendly busy-time parsing + shop-wide Booksy staffer presets.
 * Used by /admin/calendar-sync so Cesar can mirror Booksy chairs for EVERY barber
 * (not Alexis-only). Website still cannot live-pull Booksy — no public API.
 */
import { parseTimeString } from "@/lib/booking-agent/availability";
import { ABOUT, BOOKING_URL } from "@/lib/content";
import { BOOKSY_STAFFER, getBooksyStafferUrl } from "@/lib/booksy";

/** Public bookable window — short while Booksy can't sync live. */
export const BOOKABLE_WINDOW_DAYS = 3;

/** Hours after a website booking that stay blocked (same chair buffer). 0 = off. */
export const POST_CUT_BUFFER_HOURS = 0;

/** Empty string = shop-wide block (applies to every barber + "Any available"). */
export const SHOP_WIDE_BARBER = "";

export type StaffBusyPreset = {
  name: string;
  handle: string | null;
  booksyStafferId: string;
  booksyUrl: string;
};

/** Full Booksy staffer set currently on the shop profile (Bryant omitted unless in ABOUT.team). */
export const STAFF_BUSY_PRESETS: StaffBusyPreset[] = ABOUT.team
  .filter((m): m is typeof m & { booksyStafferId: string } => Boolean(m.booksyStafferId))
  .map((m) => ({
    name: m.name,
    handle: m.handle,
    booksyStafferId: m.booksyStafferId!,
    booksyUrl: getBooksyStafferUrl(m.booksyStafferId!),
  }));

export const KNOWN_STAFFER_IDS: Record<string, string> = {
  Alexis: BOOKSY_STAFFER.alexisFranco,
  Braulio: BOOKSY_STAFFER.braulioGomez,
  Cesar: BOOKSY_STAFFER.cesarSilva,
  Kristian: BOOKSY_STAFFER.kristianGuerra,
  Sebastian: BOOKSY_STAFFER.sebastianGuardado,
};

export function shopBooksyUrl(): string {
  return BOOKING_URL;
}

export function normalizeBarberKey(barberName?: string | null): string {
  const trimmed = barberName?.trim() ?? "";
  if (!trimmed) return SHOP_WIDE_BARBER;
  if (/^any\b/i.test(trimmed)) return SHOP_WIDE_BARBER;
  return trimmed;
}

export function resolveStaffPreset(barberName?: string | null): StaffBusyPreset | null {
  const key = normalizeBarberKey(barberName);
  if (!key) return null;
  return (
    STAFF_BUSY_PRESETS.find((s) => s.name === key) ??
    STAFF_BUSY_PRESETS.find((s) => s.name.toLowerCase().startsWith(key.toLowerCase())) ??
    null
  );
}

function expandHourRange(start: number, end: number): number[] {
  const hours: number[] = [];
  if (end <= start) {
    hours.push(start);
    return hours;
  }
  for (let h = start; h < end; h++) {
    hours.push(h);
  }
  return hours;
}

/**
 * Parse free-text busy times for one calendar day.
 * Accepts: "10am, 11, 2pm" · "10-12, 2pm-4pm" · "10:00 AM – 1:00 PM" · "13:00-15:00"
 */
export function parseBusyPaste(text: string): { hours: number[]; unmatched: string[] } {
  const hours = new Set<number>();
  const unmatched: string[] = [];

  const cleaned = text
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\bnoon\b/gi, "12pm")
    .trim();

  if (!cleaned) return { hours: [], unmatched: [] };

  if (/BEGIN:VEVENT/i.test(cleaned) || /BEGIN:VCALENDAR/i.test(cleaned)) {
    return parseIcsBusyHours(cleaned);
  }

  const tokens = cleaned.split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean);

  for (const token of tokens) {
    const rangeMatch = token.match(/^(.+?)\s*(?:-|–|—|to)\s*(.+)$/i);
    if (rangeMatch) {
      const start = parseTimeString(rangeMatch[1].trim());
      const end = parseTimeString(rangeMatch[2].trim());
      if (start === null || end === null) {
        unmatched.push(token);
        continue;
      }
      for (const h of expandHourRange(start, end)) {
        if (h >= 0 && h <= 23) hours.add(h);
      }
      continue;
    }

    const hour = parseTimeString(token);
    if (hour === null) {
      unmatched.push(token);
      continue;
    }
    hours.add(hour);
  }

  return {
    hours: [...hours].sort((a, b) => a - b),
    unmatched,
  };
}

/** Extract busy hours from an ICS blob (VEVENT DTSTART/DTEND), local wall-clock hours. */
export function parseIcsBusyHours(ics: string): { hours: number[]; unmatched: string[] } {
  const hours = new Set<number>();
  const unmatched: string[] = [];
  const events = ics.split(/BEGIN:VEVENT/i).slice(1);

  for (const raw of events) {
    const block = raw.split(/END:VEVENT/i)[0] ?? raw;
    const startMatch = block.match(/DTSTART(?:;[^:]*)?:([0-9TZX+-]+)/i);
    const endMatch = block.match(/DTEND(?:;[^:]*)?:([0-9TZX+-]+)/i);
    if (!startMatch) {
      unmatched.push("VEVENT missing DTSTART");
      continue;
    }

    const start = parseIcsDateTime(startMatch[1]);
    const end = endMatch ? parseIcsDateTime(endMatch[1]) : null;
    if (!start) {
      unmatched.push(startMatch[1]);
      continue;
    }

    const startHour = start.getHours();
    if (!end) {
      hours.add(startHour);
      continue;
    }

    const cursor = new Date(start);
    cursor.setMinutes(0, 0, 0);
    while (cursor < end) {
      hours.add(cursor.getHours());
      cursor.setHours(cursor.getHours() + 1);
      if (hours.size > 48) break;
    }
  }

  return {
    hours: [...hours].sort((a, b) => a - b),
    unmatched,
  };
}

function parseIcsDateTime(value: string): Date | null {
  const v = value.trim();
  if (/^\d{8}$/.test(v)) {
    const y = Number(v.slice(0, 4));
    const m = Number(v.slice(4, 6));
    const d = Number(v.slice(6, 8));
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  }

  const match = v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/);
  if (!match) return null;

  const y = Number(match[1]);
  const mo = Number(match[2]);
  const d = Number(match[3]);
  const h = Number(match[4]);
  const mi = Number(match[5]);
  const s = Number(match[6] ?? "0");
  const isUtc = Boolean(match[7]);

  if (isUtc) {
    return new Date(Date.UTC(y, mo - 1, d, h, mi, s));
  }
  return new Date(y, mo - 1, d, h, mi, s);
}

export function reasonForBarber(barberName: string | null | undefined, source = "Booksy"): string {
  const key = normalizeBarberKey(barberName);
  if (!key) return `${source} busy (shop-wide)`;
  return `${source} · ${key}`;
}

/** Alexis Franco — highest Booksy volume; default admin preset. */
export function getAlexisPreset(): StaffBusyPreset | null {
  return (
    STAFF_BUSY_PRESETS.find((s) => s.booksyStafferId === BOOKSY_STAFFER.alexisFranco) ?? null
  );
}

export function isAlexisServiceLabel(service: string, explicitBarber?: string | null): boolean {
  const alexis = getAlexisPreset();
  if (!alexis) return /alexis|lexblendzz/i.test(service);
  return appointmentMatchesBarber(service, alexis.name, explicitBarber);
}

/** Infer barber from legacy "Service with Name" labels when no dedicated field exists. */
export function barberFromServiceLabel(service: string): string | null {
  const match = service.match(/\bwith\s+(.+)$/i);
  if (!match) return null;
  const raw = match[1].trim();
  const preset = resolveStaffPreset(raw);
  return preset?.name ?? raw;
}

export function appointmentMatchesBarber(
  service: string,
  barberName: string,
  explicitBarber?: string | null,
): boolean {
  const key = normalizeBarberKey(barberName);
  if (!key) return false;
  const explicit = normalizeBarberKey(explicitBarber);
  if (explicit) return explicit === key;

  const inferred = barberFromServiceLabel(service);
  if (inferred && normalizeBarberKey(inferred) === key) return true;

  const svc = service.toLowerCase();
  const first = key.split(/\s+/)[0]?.toLowerCase();
  if (first && svc.includes(`with ${first}`)) return true;
  return svc.includes(`with ${key.toLowerCase()}`);
}

export function isUnscopedService(service: string, explicitBarber?: string | null): boolean {
  if (normalizeBarberKey(explicitBarber)) return false;
  if (barberFromServiceLabel(service)) return false;
  return !STAFF_BUSY_PRESETS.some((s) => appointmentMatchesBarber(service, s.name));
}
