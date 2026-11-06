import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

import { BARBER_LOUNGE_CONFIG } from "@/lib/booking-config";
import { createAvailabilityEngine } from "@/lib/booking-agent/availability";
import { displayDayForDate, formatDisplayTime, formatSlotSuggestion } from "@/lib/booking-agent/format";
import { parseTimeString } from "@/lib/booking-agent/availability";
import type { ParsedSlot } from "@/lib/booking-agent/types";
import {
  dbGetAppointmentByCode,
  dbInsertAppointment,
  dbLoadStore,
  dbMigrateStore,
  dbSetBlockedHoursForDate,
  dbToggleBlockedSlot,
  dbUpdateAppointmentStatus,
} from "@/lib/appointments-db";
import { isDatabaseConfigured } from "@/lib/db";
import {
  POST_CUT_BUFFER_HOURS,
  SHOP_WIDE_BARBER,
  STAFF_BUSY_PRESETS,
  appointmentMatchesBarber,
  isUnscopedService,
  normalizeBarberKey,
  reasonForBarber,
} from "@/lib/busy-blocks";

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export type Appointment = {
  id: string;
  confirmationCode: string;
  service: string;
  preferredDay: string;
  preferredTime: string;
  slotDate: string;
  slotHour: number;
  name: string;
  phone: string;
  guestCount: number | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type BlockedSlot = {
  date: string;
  hour: number;
  reason?: string;
  /** Empty / omitted = shop-wide. Full barber name for per-chair Booksy mirrors. */
  barberName?: string;
};

type AppointmentsFile = {
  appointments: Appointment[];
  blockedSlots: BlockedSlot[];
};

const DATA_PATH = path.join(process.cwd(), "data", "appointments.json");
const availabilityEngine = createAvailabilityEngine(BARBER_LOUNGE_CONFIG.hours);
const { parsePreferredSlot, findAlternatives, checkAvailabilityWithStore, slotKey, generateSlotsForDate, isHourWithinBusinessHours } =
  availabilityEngine;

function resolveSlotFromDate(dateStr: string, preferredTime: string): ParsedSlot | null {
  const hour = parseTimeString(preferredTime);
  if (hour === null) return null;

  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d, 12);
  const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()];
  if (!isHourWithinBusinessHours(dayName, hour)) return null;

  return {
    date: dateStr,
    hour,
    displayDay: displayDayForDate(date),
    displayTime: formatDisplayTime(hour),
  };
}

async function readJsonStore(): Promise<AppointmentsFile> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as AppointmentsFile;
    return {
      appointments: parsed.appointments ?? [],
      blockedSlots: (parsed.blockedSlots ?? []).map((b) => ({
        date: b.date,
        hour: b.hour,
        reason: b.reason,
        barberName: normalizeBarberKey(b.barberName),
      })),
    };
  } catch {
    return { appointments: [], blockedSlots: [] };
  }
}

async function readStore(): Promise<AppointmentsFile> {
  if (isDatabaseConfigured()) {
    const fromDb = await dbLoadStore();

    if (fromDb.appointments.length === 0 && fromDb.blockedSlots.length === 0) {
      const fromJson = await readJsonStore();
      if (fromJson.appointments.length > 0 || fromJson.blockedSlots.length > 0) {
        await dbMigrateStore(fromJson);
        return fromJson;
      }
    }

    return fromDb;
  }

  return readJsonStore();
}

async function writeStore(data: AppointmentsFile): Promise<void> {
  if (isDatabaseConfigured()) {
    throw new Error(
      "Appointments cannot be saved to JSON when DATABASE_URL is set. Use Postgres persistence.",
    );
  }

  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  const tempPath = `${DATA_PATH}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tempPath, DATA_PATH);
}

function generateConfirmationCode(referenceDate: Date = new Date()): string {
  const y = referenceDate.getFullYear();
  const m = String(referenceDate.getMonth() + 1).padStart(2, "0");
  const d = String(referenceDate.getDate()).padStart(2, "0");
  const suffix = randomBytes(2).toString("hex").toUpperCase();
  return `TBL-${y}${m}${d}-${suffix}`;
}

function activeAppointments(appointments: Appointment[]): Appointment[] {
  return appointments.filter((a) => a.status === "pending" || a.status === "confirmed");
}

function blockMatchesBarber(block: BlockedSlot, barberKey: string): boolean {
  return normalizeBarberKey(block.barberName) === barberKey;
}

/**
 * Slot taken rules (shop-wide Booksy bottleneck — every staffer, not Alexis-only):
 * - Shop-wide blocks always apply
 * - Selected barber: that barber's blocks + appointments for them + unscoped web bookings
 * - "Any available": shop-wide blocks, unscoped bookings, or every staffer personally busy
 */
export function isSlotTaken(
  store: AppointmentsFile,
  date: string,
  hour: number,
  barberName?: string | null,
): boolean {
  const key = slotKey(date, hour);
  const barberKey = normalizeBarberKey(barberName);

  const shopWideBlocked = store.blockedSlots.some(
    (b) => slotKey(b.date, b.hour) === key && blockMatchesBarber(b, SHOP_WIDE_BARBER),
  );
  if (shopWideBlocked) return true;

  const active = activeAppointments(store.appointments).filter(
    (a) => slotKey(a.slotDate, a.slotHour) === key,
  );

  if (barberKey) {
    const barberBlocked = store.blockedSlots.some(
      (b) => slotKey(b.date, b.hour) === key && blockMatchesBarber(b, barberKey),
    );
    if (barberBlocked) return true;

    return active.some(
      (a) =>
        appointmentMatchesBarber(a.service, barberKey) || isUnscopedService(a.service),
    );
  }

  // Any available — open if at least one staffer is free.
  if (active.some((a) => isUnscopedService(a.service))) return true;

  if (STAFF_BUSY_PRESETS.length === 0) {
    return active.length > 0;
  }

  return STAFF_BUSY_PRESETS.every((staff) => {
    const personalBlock = store.blockedSlots.some(
      (b) => slotKey(b.date, b.hour) === key && blockMatchesBarber(b, staff.name),
    );
    if (personalBlock) return true;
    return active.some((a) => appointmentMatchesBarber(a.service, staff.name));
  });
}

export async function checkAvailability(
  preferredDay: string,
  preferredTime: string,
  barberName?: string | null,
) {
  const store = await readStore();
  return checkAvailabilityWithStore(
    { isSlotTaken: (date, hour) => isSlotTaken(store, date, hour, barberName) },
    preferredDay,
    preferredTime,
  );
}

export type CreateAppointmentInput = {
  service: string;
  preferredDay: string;
  preferredTime: string;
  slotDate?: string;
  name: string;
  phone: string;
  guestCount?: number | null;
  barberName?: string | null;
};

export async function createAppointmentRequest(
  input: CreateAppointmentInput,
): Promise<{ ok: true; appointment: Appointment } | { ok: false; reason: string; alternatives?: ParsedSlot[] }> {
  const store = await readStore();
  let slot = input.slotDate
    ? resolveSlotFromDate(input.slotDate, input.preferredTime)
    : parsePreferredSlot(input.preferredDay, input.preferredTime);
  if (!slot) {
    return { ok: false, reason: "invalid_slot" };
  }

  const barberKey = normalizeBarberKey(input.barberName);

  if (isSlotTaken(store, slot.date, slot.hour, barberKey || null)) {
    return {
      ok: false,
      reason: "slot_taken",
      alternatives: findAlternatives(
        { isSlotTaken: (date, hour) => isSlotTaken(store, date, hour, barberKey || null) },
        slot,
      ),
    };
  }

  const now = new Date().toISOString();
  const appointment: Appointment = {
    id: randomBytes(8).toString("hex"),
    confirmationCode: generateConfirmationCode(),
    service: input.service,
    preferredDay: slot.displayDay,
    preferredTime: slot.displayTime,
    slotDate: slot.date,
    slotHour: slot.hour,
    name: input.name.trim(),
    phone: input.phone.trim(),
    guestCount: input.guestCount ?? null,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  store.appointments.push(appointment);

  const bufferHours = collectPostCutBufferHours(slot.date, slot.hour);
  for (const bufferHour of bufferHours) {
    if (!isSlotTaken(store, slot.date, bufferHour, barberKey || null)) {
      store.blockedSlots.push({
        date: slot.date,
        hour: bufferHour,
        reason: `Buffer after ${appointment.confirmationCode}`,
        barberName: barberKey || SHOP_WIDE_BARBER,
      });
    }
  }

  try {
    if (isDatabaseConfigured()) {
      await dbInsertAppointment(appointment);
      if (bufferHours.length > 0) {
        await dbSetBlockedHoursForDate(slot.date, bufferHours, {
          mode: "add",
          reason: `Buffer after ${appointment.confirmationCode}`,
          barberName: barberKey || SHOP_WIDE_BARBER,
        });
      }
    } else {
      await writeStore(store);
    }
  } catch (error) {
    console.error("[appointments] persist failed", error);
    return { ok: false, reason: "storage_error" };
  }
  return { ok: true, appointment };
}

function collectPostCutBufferHours(dateStr: string, hour: number): number[] {
  if (POST_CUT_BUFFER_HOURS <= 0) return [];
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d, 12);
  const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
    dateObj.getDay()
  ];
  const hours: number[] = [];
  for (let i = 1; i <= POST_CUT_BUFFER_HOURS; i++) {
    const bufferHour = hour + i;
    if (bufferHour > 23) break;
    if (!isHourWithinBusinessHours(dayName, bufferHour)) break;
    hours.push(bufferHour);
  }
  return hours;
}

export async function listAppointments(): Promise<AppointmentsFile> {
  return readStore();
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<Appointment | null> {
  const updatedAt = new Date().toISOString();
  if (isDatabaseConfigured()) {
    return dbUpdateAppointmentStatus(id, status, updatedAt);
  }

  const store = await readStore();
  const appointment = store.appointments.find((a) => a.id === id);
  if (!appointment) return null;
  appointment.status = status;
  appointment.updatedAt = new Date().toISOString();
  await writeStore(store);
  return appointment;
}

export async function toggleBlockedSlot(
  date: string,
  hour: number,
  reason?: string,
  barberName?: string | null,
): Promise<{ blocked: boolean; barberName: string }> {
  const barberKey = normalizeBarberKey(barberName);
  if (isDatabaseConfigured()) {
    return dbToggleBlockedSlot(date, hour, reason, barberKey);
  }

  const store = await readStore();
  const existingIndex = store.blockedSlots.findIndex(
    (b) => b.date === date && b.hour === hour && blockMatchesBarber(b, barberKey),
  );

  if (existingIndex >= 0) {
    store.blockedSlots.splice(existingIndex, 1);
    await writeStore(store);
    return { blocked: false, barberName: barberKey };
  }

  store.blockedSlots.push({
    date,
    hour,
    reason: reason ?? reasonForBarber(barberKey || null),
    barberName: barberKey,
  });
  await writeStore(store);
  return { blocked: true, barberName: barberKey };
}

export type SetBlockedHoursMode = "add" | "remove" | "replace";

export type SetBlockedHoursResult = {
  date: string;
  barberName: string;
  blockedHours: number[];
  added: number[];
  removed: number[];
  reason?: string;
};

/**
 * Bulk set busy hours for a day — phone-friendly admin path for Booksy chairs.
 * Scoped per barberName (empty = shop-wide). Replace only clears that scope.
 */
export async function setBlockedHoursForDate(
  date: string,
  hours: number[],
  opts: { mode?: SetBlockedHoursMode; reason?: string; barberName?: string | null } = {},
): Promise<SetBlockedHoursResult> {
  const mode: SetBlockedHoursMode = opts.mode ?? "add";
  const barberKey = normalizeBarberKey(opts.barberName);
  const uniqueHours = [...new Set(hours.filter((h) => Number.isInteger(h) && h >= 0 && h <= 23))].sort(
    (a, b) => a - b,
  );

  if (isDatabaseConfigured()) {
    return dbSetBlockedHoursForDate(date, uniqueHours, {
      mode,
      reason: opts.reason,
      barberName: barberKey,
    });
  }

  const store = await readStore();
  const before = new Set(
    store.blockedSlots
      .filter((b) => b.date === date && blockMatchesBarber(b, barberKey))
      .map((b) => b.hour),
  );
  const target = new Set(uniqueHours);

  let nextHours: Set<number>;
  if (mode === "replace") {
    nextHours = new Set(target);
  } else if (mode === "remove") {
    nextHours = new Set([...before].filter((h) => !target.has(h)));
  } else {
    nextHours = new Set([...before, ...target]);
  }

  const reason = opts.reason ?? reasonForBarber(barberKey || null);

  store.blockedSlots = [
    ...store.blockedSlots.filter((b) => !(b.date === date && blockMatchesBarber(b, barberKey))),
    ...[...nextHours]
      .sort((a, b) => a - b)
      .map((hour) => ({
        date,
        hour,
        reason,
        barberName: barberKey,
      })),
  ];

  await writeStore(store);

  const after = nextHours;
  const added = [...after].filter((h) => !before.has(h)).sort((a, b) => a - b);
  const removed = [...before].filter((h) => !after.has(h)).sort((a, b) => a - b);

  return {
    date,
    barberName: barberKey,
    blockedHours: [...after].sort((a, b) => a - b),
    added,
    removed,
    reason,
  };
}

export async function getAppointmentByCode(code: string): Promise<Appointment | null> {
  if (isDatabaseConfigured()) {
    return dbGetAppointmentByCode(code);
  }
  const store = await readStore();
  return store.appointments.find((a) => a.confirmationCode === code) ?? null;
}

export async function getAvailableSlotsForDate(
  dateStr: string,
  referenceDate: Date = new Date(),
  barberName?: string | null,
): Promise<ParsedSlot[]> {
  const store = await readStore();
  const allSlots = generateSlotsForDate(dateStr, referenceDate);

  const ref = new Date(referenceDate);
  const todayStr = toDateStrLocal(ref);
  const currentHour = ref.getHours();
  const barberKey = normalizeBarberKey(barberName) || null;

  return allSlots.filter((slot) => {
    if (slot.date === todayStr && slot.hour <= currentHour) return false;
    return !isSlotTaken(store, slot.date, slot.hour, barberKey);
  });
}

function toDateStrLocal(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function getUpcomingBookableDays(
  count = 3,
  barberName?: string | null,
): Promise<
  Array<{
    date: string;
    dayName: string;
    label: string;
    availableCount: number;
  }>
> {
  const { getNextBookableDays } = await import("@/lib/wizard-helpers");
  const days = getNextBookableDays(count);
  const results = await Promise.all(
    days.map(async (day) => {
      const slots = await getAvailableSlotsForDate(day.date, new Date(), barberName);
      return {
        ...day,
        availableCount: slots.length,
      };
    }),
  );
  return results;
}

export { generateSlotsForDate, parsePreferredSlot, formatSlotSuggestion };
