/**
 * Postgres persistence for appointments — used when DATABASE_URL is set.
 * Falls back to JSON file via appointments-store.ts when not configured.
 */
import type { AppointmentStatus, Appointment, BlockedSlot } from "./appointments-store";
import { normalizeBarberKey, reasonForBarber, SHOP_WIDE_BARBER } from "./busy-blocks";
import { getPrisma } from "./db";

function mapAppointment(row: {
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
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): Appointment {
  return {
    id: row.id,
    confirmationCode: row.confirmationCode,
    service: row.service,
    preferredDay: row.preferredDay,
    preferredTime: row.preferredTime,
    slotDate: row.slotDate,
    slotHour: row.slotHour,
    name: row.name,
    phone: row.phone,
    guestCount: row.guestCount,
    status: row.status as AppointmentStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapBlockedSlot(row: {
  date: string;
  hour: number;
  reason: string | null;
  barberName?: string | null;
}): BlockedSlot {
  return {
    date: row.date,
    hour: row.hour,
    reason: row.reason ?? undefined,
    barberName: normalizeBarberKey(row.barberName),
  };
}

function requirePrisma() {
  const prisma = getPrisma();
  if (!prisma) {
    throw new Error("Database configured but Prisma client unavailable");
  }
  return prisma;
}

export async function dbLoadStore(): Promise<{
  appointments: Appointment[];
  blockedSlots: BlockedSlot[];
}> {
  const prisma = requirePrisma();

  const [appointments, blockedSlots] = await Promise.all([
    prisma.appointment.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.blockedSlot.findMany(),
  ]);

  return {
    appointments: appointments.map(mapAppointment),
    blockedSlots: blockedSlots.map((b) =>
      mapBlockedSlot({
        date: b.date,
        hour: b.hour,
        reason: b.reason,
        barberName: "barberName" in b ? (b as { barberName?: string }).barberName : SHOP_WIDE_BARBER,
      }),
    ),
  };
}

export async function dbMigrateStore(data: {
  appointments: Appointment[];
  blockedSlots: BlockedSlot[];
}): Promise<void> {
  const prisma = requirePrisma();

  for (const appointment of data.appointments) {
    await prisma.appointment.upsert({
      where: { id: appointment.id },
      create: {
        id: appointment.id,
        confirmationCode: appointment.confirmationCode,
        service: appointment.service,
        preferredDay: appointment.preferredDay,
        preferredTime: appointment.preferredTime,
        slotDate: appointment.slotDate,
        slotHour: appointment.slotHour,
        name: appointment.name,
        phone: appointment.phone,
        guestCount: appointment.guestCount,
        status: appointment.status,
        createdAt: new Date(appointment.createdAt),
        updatedAt: new Date(appointment.updatedAt),
      },
      update: {},
    });
  }

  for (const slot of data.blockedSlots) {
    const barberName = normalizeBarberKey(slot.barberName);
    await prisma.blockedSlot.upsert({
      where: {
        date_hour_barberName: { date: slot.date, hour: slot.hour, barberName },
      },
      create: {
        date: slot.date,
        hour: slot.hour,
        reason: slot.reason,
        barberName,
      },
      update: {},
    });
  }
}

export async function dbInsertAppointment(appointment: Appointment): Promise<void> {
  const prisma = requirePrisma();

  await prisma.appointment.create({
    data: {
      id: appointment.id,
      confirmationCode: appointment.confirmationCode,
      service: appointment.service,
      preferredDay: appointment.preferredDay,
      preferredTime: appointment.preferredTime,
      slotDate: appointment.slotDate,
      slotHour: appointment.slotHour,
      name: appointment.name,
      phone: appointment.phone,
      guestCount: appointment.guestCount,
      status: appointment.status,
      createdAt: new Date(appointment.createdAt),
      updatedAt: new Date(appointment.updatedAt),
    },
  });
}

export async function dbUpdateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  updatedAt: string,
): Promise<Appointment | null> {
  const prisma = requirePrisma();

  try {
    const row = await prisma.appointment.update({
      where: { id },
      data: { status, updatedAt: new Date(updatedAt) },
    });
    return mapAppointment(row);
  } catch {
    return null;
  }
}

export async function dbToggleBlockedSlot(
  date: string,
  hour: number,
  reason?: string,
  barberName?: string | null,
): Promise<{ blocked: boolean; barberName: string }> {
  const prisma = requirePrisma();
  const key = normalizeBarberKey(barberName);

  const existing = await prisma.blockedSlot.findUnique({
    where: { date_hour_barberName: { date, hour, barberName: key } },
  });

  if (existing) {
    await prisma.blockedSlot.delete({ where: { id: existing.id } });
    return { blocked: false, barberName: key };
  }

  await prisma.blockedSlot.create({
    data: {
      date,
      hour,
      reason: reason ?? reasonForBarber(key || null),
      barberName: key,
    },
  });
  return { blocked: true, barberName: key };
}

export async function dbSetBlockedHoursForDate(
  date: string,
  hours: number[],
  opts: {
    mode?: "add" | "remove" | "replace";
    reason?: string;
    barberName?: string | null;
  } = {},
): Promise<{
  date: string;
  barberName: string;
  blockedHours: number[];
  added: number[];
  removed: number[];
  reason?: string;
}> {
  const prisma = requirePrisma();
  const mode = opts.mode ?? "add";
  const barberKey = normalizeBarberKey(opts.barberName);
  const target = new Set(hours);
  const reason = opts.reason ?? reasonForBarber(barberKey || null);

  const existing = await prisma.blockedSlot.findMany({
    where: { date, barberName: barberKey },
  });
  const before = new Set(existing.map((b) => b.hour));

  let nextHours: Set<number>;
  if (mode === "replace") {
    nextHours = new Set(target);
  } else if (mode === "remove") {
    nextHours = new Set([...before].filter((h) => !target.has(h)));
  } else {
    nextHours = new Set([...before, ...target]);
  }

  const toRemove = existing.filter((b) => !nextHours.has(b.hour));
  const toAdd = [...nextHours].filter((h) => !before.has(h));

  if (toRemove.length > 0) {
    await prisma.blockedSlot.deleteMany({
      where: { id: { in: toRemove.map((b) => b.id) } },
    });
  }

  for (const hour of toAdd) {
    await prisma.blockedSlot.create({
      data: { date, hour, reason, barberName: barberKey },
    });
  }

  if (reason && (mode === "add" || mode === "replace")) {
    const keep = [...nextHours].filter((h) => before.has(h) && target.has(h));
    if (keep.length > 0) {
      await prisma.blockedSlot.updateMany({
        where: { date, barberName: barberKey, hour: { in: keep } },
        data: { reason },
      });
    }
  }

  const after = nextHours;
  return {
    date,
    barberName: barberKey,
    blockedHours: [...after].sort((a, b) => a - b),
    added: toAdd.sort((a, b) => a - b),
    removed: toRemove.map((b) => b.hour).sort((a, b) => a - b),
    reason,
  };
}

export async function dbGetAppointmentByCode(code: string): Promise<Appointment | null> {
  const prisma = requirePrisma();

  const row = await prisma.appointment.findUnique({ where: { confirmationCode: code } });
  return row ? mapAppointment(row) : null;
}
