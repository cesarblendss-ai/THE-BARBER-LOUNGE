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
  dbToggleBlockedSlot,
  dbUpdateAppointmentStatus,
} from "@/lib/appointments-db";
import { isDatabaseConfigured } from "@/lib/db";

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

async function readStore(): Promise<AppointmentsFile> {
  const fromDb = await dbLoadStore();
  if (fromDb) return fromDb;

  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as AppointmentsFile;
    return {
      appointments: parsed.appointments ?? [],
      blockedSlots: parsed.blockedSlots ?? [],
    };
  } catch {
    return { appointments: [], blockedSlots: [] };
  }
}

async function writeStore(data: AppointmentsFile): Promise<void> {
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

export function isSlotTaken(
  store: AppointmentsFile,
  date: string,
  hour: number,
): boolean {
  const key = slotKey(date, hour);
  const blocked = store.blockedSlots.some((b) => slotKey(b.date, b.hour) === key);
  if (blocked) return true;

  return activeAppointments(store.appointments).some(
    (a) => slotKey(a.slotDate, a.slotHour) === key,
  );
}

export async function checkAvailability(
  preferredDay: string,
  preferredTime: string,
) {
  const store = await readStore();
  return checkAvailabilityWithStore(
    { isSlotTaken: (date, hour) => isSlotTaken(store, date, hour) },
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

  if (isSlotTaken(store, slot.date, slot.hour)) {
    return {
      ok: false,
      reason: "slot_taken",
      alternatives: findAlternatives(
        { isSlotTaken: (date, hour) => isSlotTaken(store, date, hour) },
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
  try {
    if (isDatabaseConfigured()) {
      await dbInsertAppointment(appointment);
    } else {
      await writeStore(store);
    }
  } catch (error) {
    console.error("[appointments] persist failed", error);
    return { ok: false, reason: "storage_error" };
  }
  return { ok: true, appointment };
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
): Promise<{ blocked: boolean }> {
  if (isDatabaseConfigured()) {
    return dbToggleBlockedSlot(date, hour, reason);
  }

  const store = await readStore();
  const key = slotKey(date, hour);
  const existingIndex = store.blockedSlots.findIndex((b) => slotKey(b.date, b.hour) === key);

  if (existingIndex >= 0) {
    store.blockedSlots.splice(existingIndex, 1);
    await writeStore(store);
    return { blocked: false };
  }

  store.blockedSlots.push({ date, hour, reason });
  await writeStore(store);
  return { blocked: true };
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
): Promise<ParsedSlot[]> {
  const store = await readStore();
  const allSlots = generateSlotsForDate(dateStr, referenceDate);

  const ref = new Date(referenceDate);
  const todayStr = toDateStrLocal(ref);
  const currentHour = ref.getHours();

  return allSlots.filter((slot) => {
    if (slot.date === todayStr && slot.hour <= currentHour) return false;
    return !isSlotTaken(store, slot.date, slot.hour);
  });
}

function toDateStrLocal(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function getUpcomingBookableDays(count = 3): Promise<
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
      const slots = await getAvailableSlotsForDate(day.date);
      return {
        ...day,
        availableCount: slots.length,
      };
    }),
  );
  return results;
}

export { generateSlotsForDate, parsePreferredSlot, formatSlotSuggestion };
