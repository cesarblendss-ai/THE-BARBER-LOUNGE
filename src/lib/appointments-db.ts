/**
 * Postgres persistence for appointments — used when DATABASE_URL is set.
 * Falls back to JSON file via appointments-store.ts when not configured.
 */
import type { AppointmentStatus, Appointment, BlockedSlot } from "./appointments-store";
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

export async function dbLoadStore(): Promise<{
  appointments: Appointment[];
  blockedSlots: BlockedSlot[];
} | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const [appointments, blockedSlots] = await Promise.all([
    prisma.appointment.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.blockedSlot.findMany(),
  ]);

  return {
    appointments: appointments.map(mapAppointment),
    blockedSlots: blockedSlots.map((b) => ({
      date: b.date,
      hour: b.hour,
      reason: b.reason ?? undefined,
    })),
  };
}

export async function dbInsertAppointment(appointment: Appointment): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;

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
  const prisma = getPrisma();
  if (!prisma) return null;

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
): Promise<{ blocked: boolean }> {
  const prisma = getPrisma();
  if (!prisma) return { blocked: false };

  const existing = await prisma.blockedSlot.findUnique({
    where: { date_hour: { date, hour } },
  });

  if (existing) {
    await prisma.blockedSlot.delete({ where: { id: existing.id } });
    return { blocked: false };
  }

  await prisma.blockedSlot.create({ data: { date, hour, reason } });
  return { blocked: true };
}

export async function dbGetAppointmentByCode(code: string): Promise<Appointment | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const row = await prisma.appointment.findUnique({ where: { confirmationCode: code } });
  return row ? mapAppointment(row) : null;
}
