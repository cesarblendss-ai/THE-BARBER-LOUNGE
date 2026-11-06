import { promises as fs } from "fs";
import path from "path";

import {
  getAvailableSlotsForDate,
  getUpcomingBookableDays,
} from "@/lib/appointments-store";
import { formatSlotLabel } from "@/lib/availability";
import {
  BOOKABLE_WINDOW_DAYS,
  SHOP_WIDE_BARBER,
  STAFF_BUSY_PRESETS,
  normalizeBarberKey,
} from "@/lib/busy-blocks";

/** Short TTL so walk-in / concurrent website bookings don't serve stale slots. */
export const AVAILABILITY_TTL_MS = 60_000;

/** How many upcoming days the sync agent rebuilds each pass (matches public book window). */
export const AVAILABILITY_SYNC_DAYS = BOOKABLE_WINDOW_DAYS;

export type SyncedSlot = {
  date: string;
  hour: number;
  displayTime: string;
  label: string;
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
  source: "appointments-store+hours";
  /** Honest note — Booksy has no public calendar API for third parties. */
  booksyLiveSync: false;
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
};

const LOCAL_META_PATH = path.join(process.cwd(), "data", "availability-sync.json");
const VERCEL_TMP_META_PATH = path.join("/tmp", "tbl-availability-sync.json");

let memorySnapshot: AvailabilitySnapshot | null = null;

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

async function buildSlice(barberName: string | null): Promise<{
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

/**
 * Rebuild availability from the appointments store + shop HOURS for every staffer.
 * This is NOT live Booksy calendar sync — Booksy has no public create/list API.
 */
export async function refreshAvailabilitySnapshot(
  reason: "cron" | "admin" | "api-miss" | "api-stale" | "booking" = "cron",
): Promise<AvailabilitySnapshot> {
  const started = Date.now();

  const shop = await buildSlice(null);
  const byBarber: Record<string, BarberAvailabilitySlice> = {};

  await Promise.all(
    STAFF_BUSY_PRESETS.map(async (staff) => {
      const slice = await buildSlice(staff.name);
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

  memorySnapshot = snapshot;

  await writeMeta({
    lastSyncedAt,
    dayCount: shop.days.length,
    totalOpenSlots,
    stafferCount: STAFF_BUSY_PRESETS.length,
    source: snapshot.source,
  });

  console.info(
    `[availability-sync] refresh ok reason=${reason} days=${shop.days.length} staffers=${STAFF_BUSY_PRESETS.length} openSlots=${totalOpenSlots} ms=${Date.now() - started} at=${lastSyncedAt}`,
  );

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
