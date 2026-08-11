import { NextRequest, NextResponse } from "next/server";

import { unauthorizedAdminResponse, verifyAdminKey } from "@/lib/admin-auth";
import {
  listAppointments,
  toggleBlockedSlot,
  updateAppointmentStatus,
  type AppointmentStatus,
} from "@/lib/appointments-store";
import { generateSlotsForDate } from "@/lib/availability";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!verifyAdminKey(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const date = request.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    const store = await listAppointments();
    const slots = generateSlotsForDate(date);

    const appointmentsForDate = store.appointments.filter((a) => a.slotDate === date);
    const blockedForDate = store.blockedSlots.filter((b) => b.date === date);

    return NextResponse.json({
      date,
      appointments: store.appointments.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      schedule: slots.map((slot) => ({
        ...slot,
        blocked: blockedForDate.some((b) => b.hour === slot.hour),
        appointment: appointmentsForDate.find(
          (a) => a.slotHour === slot.hour && (a.status === "pending" || a.status === "confirmed"),
        ) ?? null,
      })),
      blockedSlots: store.blockedSlots,
    });
  } catch (error) {
    console.error("[appointments] GET failed", error);
    return NextResponse.json({ error: "Could not load appointments." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdminKey(request)) {
    return unauthorizedAdminResponse();
  }

  let body: {
    action?: "confirm" | "cancel" | "toggle-block";
    id?: string;
    date?: string;
    hour?: number;
    reason?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  if (body.action === "toggle-block" && body.date && typeof body.hour === "number") {
    const result = await toggleBlockedSlot(body.date, body.hour, body.reason);
    return NextResponse.json(result);
  }

  if (!body.id || !body.action || (body.action !== "confirm" && body.action !== "cancel")) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const status: AppointmentStatus = body.action === "confirm" ? "confirmed" : "cancelled";
  const updated = await updateAppointmentStatus(body.id, status);
  if (!updated) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }

  return NextResponse.json({ appointment: updated });
}
