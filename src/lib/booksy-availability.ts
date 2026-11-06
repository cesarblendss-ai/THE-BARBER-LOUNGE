/**
 * Live Booksy customer availability (public booking flow — no login).
 *
 * Endpoint (same as the Booksy web widget):
 *   POST https://us.booksy.com/core/v2/customer_api/me/businesses/{id}/appointments/time_slots
 *
 * Auth for *reading* open slots:
 *   - `X-Api-Key` = Booksy's public web-client constant (shipped in their JS bundle to every
 *     anonymous visitor — NOT a shop secret, NOT Cesar's password)
 *   - `X-Fingerprint` = random UUID per request/process
 *   - No `x-access-token` / no Booksy account password required for time_slots
 *
 * NEVER store Booksy Biz passwords in env, chat, or git. If Booksy later requires a
 * customer session token for this read, document env name `BOOKSY_ACCESS_TOKEN` only —
 * value stays in Vercel, never in the repo.
 */

import {
  BOOKSY_BUSINESS_ID,
  BOOKSY_SERVICE_VARIANT,
  BOOKSY_WEB_API_KEY,
  BOOKSY_WEB_API_VERSION,
} from "@/lib/booksy";

const BOOKSY_CORE_BASE = "https://us.booksy.com/core/v2";

/** "Any available" staffer sentinel used by Booksy's public booking widget. */
export const BOOKSY_ANY_STAFFER_ID = -1;

export type BooksyClock = {
  hour: number;
  minute: number;
  /** e.g. "11:45 AM" */
  displayTime: string;
  /** Raw Booksy "HH:MM" (24h) */
  booksyTime: string;
};

export type BooksyDaySlots = {
  date: string;
  slots: BooksyClock[];
};

export type FetchBooksySlotsInput = {
  stafferId: number;
  serviceVariantId?: string | number;
  startDate: string;
  endDate: string;
};

export type FetchBooksySlotsResult = {
  ok: true;
  days: BooksyDaySlots[];
  stafferId: number;
  serviceVariantId: number;
} | {
  ok: false;
  error: string;
  status?: number;
  stafferId: number;
};

function randomFingerprint(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tbl-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Parse Booksy "HH:MM" (24h) into clock parts + customer display. */
export function parseBooksyTime(raw: string): BooksyClock | null {
  const match = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null;
  return {
    hour,
    minute,
    displayTime: formatClockDisplay(hour, minute),
    booksyTime: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

export function formatClockDisplay(hour: number, minute: number): string {
  const meridiem = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  if (minute === 0) return `${h}:00 ${meridiem}`;
  return `${h}:${String(minute).padStart(2, "0")} ${meridiem}`;
}

/**
 * Parse customer-facing times like "11:45 AM" / "1:00 PM" without rounding minutes
 * (unlike fuzzy chat parseTimeString which bumps :30+ to the next hour).
 */
export function parseClockDisplay(timeStr: string): { hour: number; minute: number } | null {
  const normalized = timeStr.trim().toLowerCase().replace(/\./g, "");
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = match[2] ? Number(match[2]) : 0;
  const meridiem = match[3];

  if (hour > 23 || minute > 59) return null;
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  if (!meridiem && hour <= 7) hour += 12;

  return { hour, minute };
}

function ymdAddDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d, 12);
  dt.setDate(dt.getDate() + days);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Shop-local calendar date (America/Los_Angeles). */
export function booksyTodayYmd(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function booksyEndYmd(dayCount: number, now: Date = new Date()): string {
  const start = booksyTodayYmd(now);
  return ymdAddDays(start, Math.max(dayCount - 1, 0));
}

export async function fetchBooksyTimeSlots(
  input: FetchBooksySlotsInput,
): Promise<FetchBooksySlotsResult> {
  const serviceVariantId = Number(
    input.serviceVariantId ?? BOOKSY_SERVICE_VARIANT.signatureHaircut,
  );
  const stafferId = input.stafferId;
  const url = `${BOOKSY_CORE_BASE}/customer_api/me/businesses/${BOOKSY_BUSINESS_ID}/appointments/time_slots`;

  const body = {
    subbookings: [
      {
        service_variant_id: serviceVariantId,
        staffer_id: stafferId,
        combo_children: [] as unknown[],
      },
    ],
    start_date: input.startDate,
    end_date: input.endDate,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": BOOKSY_WEB_API_KEY,
        "X-App-Version": BOOKSY_WEB_API_VERSION,
        "X-Fingerprint": randomFingerprint(),
        Origin: "https://booksy.com",
        Referer: "https://booksy.com/",
        "User-Agent":
          "Mozilla/5.0 (compatible; TheBarberLoungeAvailability/1.0; +https://thebarberloungeca.com)",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await res.text();
    if (!res.ok) {
      return {
        ok: false,
        error: `Booksy time_slots HTTP ${res.status}: ${text.slice(0, 240)}`,
        status: res.status,
        stafferId,
      };
    }

    let parsed: {
      time_slots?: Array<{ date?: string; slots?: Array<{ t?: string }> }>;
      staff_time_slots?: Array<{ date?: string; slots?: Array<{ t?: string }> }>;
    };
    try {
      parsed = JSON.parse(text) as typeof parsed;
    } catch {
      return {
        ok: false,
        error: "Booksy time_slots returned non-JSON",
        status: res.status,
        stafferId,
      };
    }

    const rawDays = parsed.time_slots?.length
      ? parsed.time_slots
      : parsed.staff_time_slots ?? [];

    const days: BooksyDaySlots[] = [];
    for (const day of rawDays) {
      if (!day?.date || !Array.isArray(day.slots)) continue;
      const slots: BooksyClock[] = [];
      for (const slot of day.slots) {
        if (!slot?.t) continue;
        const clock = parseBooksyTime(slot.t);
        if (clock) slots.push(clock);
      }
      days.push({ date: day.date, slots });
    }

    return {
      ok: true,
      days,
      stafferId,
      serviceVariantId,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Booksy fetch failed",
      stafferId,
    };
  }
}

/**
 * Pull open slots for every staffer + "Any" over the next `dayCount` shop-local days.
 * Uses Signature Haircut as the canonical probe (Haircut & Beard calendar is effectively the same).
 */
export async function fetchAllStafferBooksySlots(opts: {
  dayCount: number;
  staffers: Array<{ name: string; booksyStafferId: string }>;
  serviceVariantId?: string | number;
  now?: Date;
}): Promise<{
  ok: boolean;
  startDate: string;
  endDate: string;
  byStafferId: Record<string, BooksyDaySlots[]>;
  anyStaffer: BooksyDaySlots[];
  errors: string[];
}> {
  const now = opts.now ?? new Date();
  const startDate = booksyTodayYmd(now);
  const endDate = booksyEndYmd(opts.dayCount, now);
  const serviceVariantId = opts.serviceVariantId ?? BOOKSY_SERVICE_VARIANT.signatureHaircut;
  const errors: string[] = [];
  const byStafferId: Record<string, BooksyDaySlots[]> = {};

  const tasks: Array<{ key: string; stafferId: number }> = [
    { key: "any", stafferId: BOOKSY_ANY_STAFFER_ID },
    ...opts.staffers.map((s) => ({
      key: s.booksyStafferId,
      stafferId: Number(s.booksyStafferId),
    })),
  ];

  // Sequential with a tiny gap — polite to Booksy + avoids bursty serverless egress.
  for (const task of tasks) {
    const result = await fetchBooksyTimeSlots({
      stafferId: task.stafferId,
      serviceVariantId,
      startDate,
      endDate,
    });
    if (!result.ok) {
      errors.push(`${task.key}: ${result.error}`);
      continue;
    }
    byStafferId[task.key] = result.days;
  }

  const anyStaffer = byStafferId.any ?? [];
  const ok = errors.length === 0 && (anyStaffer.length > 0 || Object.keys(byStafferId).length > 1);

  return {
    ok,
    startDate,
    endDate,
    byStafferId,
    anyStaffer,
    errors,
  };
}
