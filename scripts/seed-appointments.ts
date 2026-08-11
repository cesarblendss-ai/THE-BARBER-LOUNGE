/**
 * One-time import: data/appointments.json → Postgres (when DATABASE_URL is set).
 *
 * Usage:
 *   npx vercel env pull .env.local   # optional — get DATABASE_URL
 *   npm run db:push
 *   npm run db:seed
 */
import { readFileSync } from "fs";
import path from "path";

import { PrismaClient } from "@prisma/client";

type JsonAppointment = {
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
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

type JsonStore = {
  appointments: JsonAppointment[];
  blockedSlots: Array<{ date: string; hour: number; reason?: string }>;
};

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL not set. Connect Vercel Postgres first.");
    process.exit(1);
  }

  const dataPath = path.join(process.cwd(), "data", "appointments.json");
  const raw = readFileSync(dataPath, "utf8");
  const store = JSON.parse(raw) as JsonStore;

  const prisma = new PrismaClient();

  let apptCount = 0;
  for (const a of store.appointments ?? []) {
    await prisma.appointment.upsert({
      where: { confirmationCode: a.confirmationCode },
      create: {
        id: a.id,
        confirmationCode: a.confirmationCode,
        service: a.service,
        preferredDay: a.preferredDay,
        preferredTime: a.preferredTime,
        slotDate: a.slotDate,
        slotHour: a.slotHour,
        name: a.name,
        phone: a.phone,
        guestCount: a.guestCount,
        status: a.status,
        createdAt: new Date(a.createdAt),
        updatedAt: new Date(a.updatedAt),
      },
      update: {
        status: a.status,
        updatedAt: new Date(a.updatedAt),
      },
    });
    apptCount++;
  }

  let blockCount = 0;
  for (const b of store.blockedSlots ?? []) {
    await prisma.blockedSlot.upsert({
      where: { date_hour: { date: b.date, hour: b.hour } },
      create: { date: b.date, hour: b.hour, reason: b.reason },
      update: { reason: b.reason },
    });
    blockCount++;
  }

  console.log(`Seeded ${apptCount} appointments, ${blockCount} blocked slots.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
