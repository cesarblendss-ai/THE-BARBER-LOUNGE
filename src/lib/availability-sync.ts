import { promises as fs } from "fs";
import path from "path";

import {
  getAvailableSlotsForDate,
  getUpcomingBookableDays,
  isSlotTaken as storeIsSlotTaken,
  loadAppointmentsStoreForSync,
} from "@/lib/appointments-store";
import { formatSlotLabel } from "@/lib/availability";
import {
  booksyTodayYmd,
  fetchAllStafferBooksySlots,
  type BooksyDaySlots,
} from "@/lib/booksy-availability";
import {
  BOOKABLE_WINDOW_DAYS,
  SHOP_WIDE_BARBER,
  STAFF_BUSY_PRESETS,
  normalizeBarberKey,
} from "@/lib/busy-blocks";
import { displayDayForDate } from "@/lib/booking-agent/format";

/** Short TTL so walk-in / concurrent website bookings don't serve stale slots. */
export const AVAILABILITY_TTL_MS = 60_000;

/** How many upcoming days the sync agent rebuilds each pass (matches public book window). */
export const AVAILABILITY_SYNC_DAYS = BOOKABLE_WINDOW_DAYS;

export type SyncedSlot = {
  date: string;
  hour: number;
  /** Minutes past the hour (Booksy may offer :45 starts). */
  minute?: number;
  displayTime: string;
  label: string;
  /** Raw Booksy "HH:MM" when sourced from live sync. */
  booksyTime?: string;
};

export type SyncedDay = {
  date: string;
  dayName: string;
  label: string;
  availableCount: number;
};

export type BarberAvailabilitySlice = {
  barberName: string;
  booksyStafferId: string | null;
  days: SyncedDay[];
  slotsByDate: Record<string, SyncedSlot[]>;
};

export type AvailabilitySnapshot = {
  lastSyncedAt: string;
  source: "booksy-live+website-appointments" | "appointments-store+hours";
  /** True when open slots were pulled from Booksy's public customer time_slots API. */
  booksyLiveSync: boolean;
  booksySyncErrors?: string[];
  /** Shop-wide / "Any available" slice */
  days: SyncedDay[];
  slotsByDate: Record<string, SyncedSlot[]>;
  /** Per-staffer slices — cron refreshes every Booksy staffer on the roster */
  byBarber: Record<string, BarberAvailabilitySlice>;
  staffers: Array<{ name: string; booksyStafferId: string }>;
  ttlMs: number;
};

type SyncMetaFile = {
  lastSyncedAt: string;
  dayCount: number;
  totalOpenSlots: number;
  stafferCount: number;
  source: string;
  booksyLiveSync: boolean;
};

const LOCAL_META_PATH = path.join(process.cwd(), "data", "availability-sync.json");
const VERCEL_TMP_META_PATH = path.join("/tmp", "tbl-availability-sync.json");

let memorySnapshot: AvailabilitySnapshot | null = null;

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function resolveMetaPath(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return VERCEL_TMP_META_PATH;
  }
  return LOCAL_META_PATH;
}

async function writeMeta(meta: SyncMetaFile): Promise<void> {
  const primary = resolveMetaPath();
  try {
    await fs.mkdir(path.dirname(primary), { recursive: true });
    await fs.writeFile(primary, JSON.stringify(meta, null, 2), "utf8");
  } catch (error) {
    if (primary !== VERCEL_TMP_META_PATH) {
      try {
        await fs.mkdir(path.dirname(VERCEL_TMP_META_PATH), { recursive: true });
        await fs.writeFile(VERCEL_TMP_META_PATH, JSON.stringify(meta, null, 2), "utf8");
        return;
      } catch {
        /* fall through */
      }
    }
    console.warn("[availability-sync] could not persist meta file", error);
  }
}

async function readMetaFile(): Promise<SyncMetaFile | null> {
  for (const filePath of [resolveMetaPath(), LOCAL_META_PATH, VERCEL_TMP_META_PATH]) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as SyncMetaFile;
      if (parsed?.lastSyncedAt) return parsed;
    } catch {
      /* try next */
    }
  }
  return null;
}

function isFresh(snapshot: AvailabilitySnapshot | null): boolean {
  if (!snapshot?.lastSyncedAt) return false;
  const age = Date.now() - new Date(snapshot.lastSyncedAt).getTime();
  return age >= 0 && age < AVAILABILITY_TTL_MS;
}

function dayMeta(dateStr: string, availableCount: number, reference: Date): SyncedDay {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d, 12);
  const dayName = DAY_NAMES[date.getDay()];
  return {
    date: dateStr,
    dayName,
    label: displayDayForDate(date, reference),
    availableCount,
  };
}

async function loadTakenChecker(): Promise<(date: string, hour: number, barberName: string | null) => boolean> {
  const store = await loadAppointmentsStoreForSync();
  return (date, hour, barberName) => storeIsSlotTaken(store, date, hour, barberName);
}

function booksyDaysToSlice(
  booksyDays: BooksyDaySlots[],
  barberName: string | null,
  isTaken: (date: string, hour: number, barberName: string | null) => boolean,
  reference: Date,
  windowDays: number,
): { days: SyncedDay[]; slotsByDate: Record<string, SyncedSlot[]> } {
  const today = booksyTodayYmd(reference);
  const slotsByDate: Record<string, SyncedSlot[]> = {};
  const days: SyncedDay[] = [];

  const sorted = [...booksyDays].sort((a, b) => a.date.localeCompare(b.date));

  for (const day of sorted) {
    if (day.date < today) continue;

    const slots: SyncedSlot[] = [];
    for (const clock of day.slots) {
      // Hide times already held by website appointments / busy blocks (hour granularity).
      if (isTaken(day.date, clock.hour, barberName)) continue;

      // Skip past hours for today (shop-local wall clock approximated via server now).
      if (day.date === today) {
        const nowHour = Number(
          new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Los_Angeles",
            hour: "numeric",
            hour12: false,
          }).format(reference),
        );
        if (clock.hour < nowHour) continue;
        if (clock.hour === nowHour && clock.minute === 0) continue;
      }

      slots.push({
        date: day.date,
        hour: clock.hour,
        minute: clock.minute,
        displayTime: clock.displayTime,
        label: `${displayDayForDate(new Date(day.date + "T12:00:00"), reference)} at ${clock.displayTime}`,
        booksyTime: clock.booksyTime,
      });
    }

    if (slots.length === 0) continue;
    slotsByDate[day.date] = slots;
    days.push(dayMeta(day.date, slots.length, reference));
    if (days.length >= windowDays) break;
  }

  return { days, slotsByDate };
}

async function buildStoreFallbackSlice(barberName: string | null): Promise<{
  days: SyncedDay[];
  slotsByDate: Record<string, SyncedSlot[]>;
}> {
  const days = await getUpcomingBookableDays(AVAILABILITY_SYNC_DAYS, barberName);
  const slotsByDate: Record<string, SyncedSlot[]> = {};

  await Promise.all(
    days.map(async (day) => {
      const slots = await getAvailableSlotsForDate(day.date, new Date(), barberName);
      slotsByDate[day.date] = slots.map((s) => ({
        date: s.date,
        hour: s.hour,
        displayTime: s.displayTime,
        label: formatSlotLabel(s),
      }));
    }),
  );

  return { days, slotsByDate };
}

async function buildFromBooksyLive(
  reason: string,
): Promise<AvailabilitySnapshot | null> {
  const started = Date.now();
  const reference = new Date();
  const pull = await fetchAllStafferBooksySlots({
    dayCount: Math.max(AVAILABILITY_SYNC_DAYS + 4, 7),
    staffers: STAFF_BUSY_PRESETS,
    now: reference,
  });

  if (pull.errors.length && pull.anyStaffer.length === 0 && Object.keys(pull.byStafferId).length <= 1) {
    console.warn(
      `[availability-sync] booksy live pull failed reason=${reason} errors=${pull.errors.join(" | ")}`,
    );
    return null;
  }

  let isTaken: (date: string, hour: number, barberName: string | null) => boolean;
  try {
    isTaken = await loadTakenChecker();
  } catch (error) {
    console.warn("[availability-sync] could not load appointments store for overlay", error);
    isTaken = () => false;
  }

  const shop = booksyDaysToSlice(pull.anyStaffer, null, isTaken, reference, AVAILABILITY_SYNC_DAYS);
  const byBarber: Record<string, BarberAvailabilitySlice> = {};

  for (const staff of STAFF_BUSY_PRESETS) {
    const raw = pull.byStafferId[staff.booksyStafferId] ?? [];
    const slice = booksyDaysToSlice(raw, staff.name, isTaken, reference, AVAILABILITY_SYNC_DAYS);
    byBarber[staff.name] = {
      barberName: staff.name,
      booksyStafferId: staff.booksyStafferId,
      days: slice.days,
      slotsByDate: slice.slotsByDate,
    };
  }

  // If Booksy returned nothing usable for shop-wide, treat as failure → fallback.
  if (shop.days.length === 0 && Object.values(byBarber).every((b) => b.days.length === 0)) {
    console.warn(
      `[availability-sync] booksy live returned zero open days reason=${reason} errors=${pull.errors.join(" | ") || "none"}`,
    );
    return null;
  }

  const lastSyncedAt = new Date().toISOString();
  const totalOpenSlots = Object.values(shop.slotsByDate).reduce((sum, slots) => sum + slots.length, 0);

  const snapshot: AvailabilitySnapshot = {
    lastSyncedAt,
    source: "booksy-live+website-appointments",
    booksyLiveSync: true,
    booksySyncErrors: pull.errors.length ? pull.errors : undefined,
    days: shop.days,
    slotsByDate: shop.slotsByDate,
    byBarber,
    staffers: STAFF_BUSY_PRESETS.map((s) => ({
      name: s.name,
      booksyStafferId: s.booksyStafferId,
    })),
    ttlMs: AVAILABILITY_TTL_MS,
  };

  console.info(
    `[availability-sync] booksy live ok reason=${reason} days=${shop.days.length} staffers=${STAFF_BUSY_PRESETS.length} openSlots=${totalOpenSlots} errors=${pull.errors.length} ms=${Date.now() - started} at=${lastSyncedAt}`,
  );

  return snapshot;
}

async function buildFromStoreFallback(
  reason: string,
): Promise<AvailabilitySnapshot> {
  const started = Date.now();
  const shop = await buildStoreFallbackSlice(null);
  const byBarber: Record<string, BarberAvailabilitySlice> = {};

  await Promise.all(
    STAFF_BUSY_PRESETS.map(async (staff) => {
      const slice = await buildStoreFallbackSlice(staff.name);
      byBarber[staff.name] = {
        barberName: staff.name,
        booksyStafferId: staff.booksyStafferId,
        days: slice.days,
        slotsByDate: slice.slotsByDate,
      };
    }),
  );

  const lastSyncedAt = new Date().toISOString();
  const totalOpenSlots = Object.values(shop.slotsByDate).reduce((sum, slots) => sum + slots.length, 0);

  const snapshot: AvailabilitySnapshot = {
    lastSyncedAt,
    source: "appointments-store+hours",
    booksyLiveSync: false,
    days: shop.days,
    slotsByDate: shop.slotsByDate,
    byBarber,
    staffers: STAFF_BUSY_PRESETS.map((s) => ({
      name: s.name,
      booksyStafferId: s.booksyStafferId,
    })),
    ttlMs: AVAILABILITY_TTL_MS,
  };

  console.info(
    `[availability-sync] store fallback ok reason=${reason} days=${shop.days.length} staffers=${STAFF_BUSY_PRESETS.length} openSlots=${totalOpenSlots} ms=${Date.now() - started} at=${lastSyncedAt}`,
  );

  return snapshot;
}

/**
 * Rebuild availability — prefers live Booksy open slots (public customer API).
 * Falls back to appointments store + HOURS + busy blocks if Booksy is unreachable.
 */
export async function refreshAvailabilitySnapshot(
  reason: "cron" | "admin" | "api-miss" | "api-stale" | "booking" = "cron",
): Promise<AvailabilitySnapshot> {
  let snapshot = await buildFromBooksyLive(reason);
  if (!snapshot) {
    snapshot = await buildFromStoreFallback(reason);
  }

  memorySnapshot = snapshot;

  const totalOpenSlots = Object.values(snapshot.slotsByDate).reduce(
    (sum, slots) => sum + slots.length,
    0,
  );

  await writeMeta({
    lastSyncedAt: snapshot.lastSyncedAt,
    dayCount: snapshot.days.length,
    totalOpenSlots,
    stafferCount: STAFF_BUSY_PRESETS.length,
    source: snapshot.source,
    booksyLiveSync: snapshot.booksyLiveSync,
  });

  return snapshot;
}

export async function getAvailabilitySnapshot(
  opts: { force?: boolean } = {},
): Promise<AvailabilitySnapshot> {
  if (!opts.force && isFresh(memorySnapshot)) {
    return memorySnapshot!;
  }

  if (!opts.force && memorySnapshot) {
    return refreshAvailabilitySnapshot("api-stale");
  }

  return refreshAvailabilitySnapshot(opts.force ? "admin" : "api-miss");
}

export function pickBarberSlice(
  snapshot: AvailabilitySnapshot,
  barberName?: string | null,
): { days: SyncedDay[]; slotsByDate: Record<string, SyncedSlot[]>; barberName: string } {
  const key = normalizeBarberKey(barberName);
  if (!key) {
    return { days: snapshot.days, slotsByDate: snapshot.slotsByDate, barberName: SHOP_WIDE_BARBER };
  }
  const slice = snapshot.byBarber[key];
  if (slice) {
    return { days: slice.days, slotsByDate: slice.slotsByDate, barberName: key };
  }
  // Unknown barber name — fall back to shop-wide rather than inventing Booksy data.
  return { days: snapshot.days, slotsByDate: snapshot.slotsByDate, barberName: key };
}

export async function getLastSyncedAt(): Promise<string | null> {
  if (memorySnapshot?.lastSyncedAt) return memorySnapshot.lastSyncedAt;
  const meta = await readMetaFile();
  return meta?.lastSyncedAt ?? null;
}

export function getMemorySnapshot(): AvailabilitySnapshot | null {
  return memorySnapshot;
}
