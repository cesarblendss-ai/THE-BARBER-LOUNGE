import { NextRequest, NextResponse } from "next/server";

import { unauthorizedAdminResponse, verifyAdminKey } from "@/lib/admin-auth";
import { refreshAvailabilitySnapshot } from "@/lib/availability-sync";
import {
  normalizeBarberKey,
  parseBusyPaste,
  reasonForBarber,
  SHOP_WIDE_BARBER,
} from "@/lib/busy-blocks";
import {
  listAppointments,
  setBlockedHoursForDate,
  toggleBlockedSlot,
  updateAppointmentStatus,
  type AppointmentStatus,
  type SetBlockedHoursMode,
} from "@/lib/appointments-store";
import { generateSlotsForDate } from "@/lib/availability";

export const runtime = "nodejs";

async function rebuildAvailability(): Promise<void> {
  try {
    await refreshAvailabilitySnapshot("admin");
  } catch (error) {
    console.warn("[appointments] availability refresh after block change failed", error);
  }
}

export async function GET(request: NextRequest) {
  if (!verifyAdminKey(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const date = request.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    const barberParam = request.nextUrl.searchParams.get("barber");
    const barberKey = normalizeBarberKey(barberParam);
    const store = await listAppointments();
    const slots = generateSlotsForDate(date);

    const appointmentsForDate = store.appointments.filter((a) => a.slotDate === date);
    const blockedForDate = store.blockedSlots.filter((b) => b.date === date);
    const scopedBlocks = blockedForDate.filter(
      (b) =>
        normalizeBarberKey(b.barberName) === barberKey ||
        normalizeBarberKey(b.barberName) === SHOP_WIDE_BARBER,
    );

    return NextResponse.json({
      date,
      barber: barberKey || null,
      appointments: store.appointments.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      schedule: slots.map((slot) => {
        const personal = blockedForDate.find(
          (b) => b.hour === slot.hour && normalizeBarberKey(b.barberName) === barberKey,
        );
        const shopWide = blockedForDate.find(
          (b) =>
            b.hour === slot.hour && normalizeBarberKey(b.barberName) === SHOP_WIDE_BARBER,
        );
        return {
          ...slot,
          blocked: Boolean(personal || shopWide),
          blockedScope: personal ? "barber" : shopWide ? "shop" : null,
          blockReason: personal?.reason ?? shopWide?.reason ?? null,
          appointment:
            appointmentsForDate.find(
              (a) => a.slotHour === slot.hour && (a.status === "pending" || a.status === "confirmed"),
            ) ?? null,
        };
      }),
      blockedSlots: store.blockedSlots,
      blockedForDate: scopedBlocks,
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
    action?:
      | "confirm"
      | "cancel"
      | "toggle-block"
      | "set-blocks"
      | "paste-busy";
    id?: string;
    date?: string;
    hour?: number;
    hours?: number[];
    text?: string;
    reason?: string;
    barber?: string;
    mode?: SetBlockedHoursMode;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const barberKey = normalizeBarberKey(body.barber);

  if (body.action === "toggle-block" && body.date && typeof body.hour === "number") {
    const result = await toggleBlockedSlot(
      body.date,
      body.hour,
      body.reason ?? reasonForBarber(barberKey || null),
      barberKey,
    );
    await rebuildAvailability();
    return NextResponse.json(result);
  }

  if (body.action === "set-blocks" && body.date && Array.isArray(body.hours)) {
    const result = await setBlockedHoursForDate(body.date, body.hours, {
      mode: body.mode ?? "add",
      reason: body.reason ?? reasonForBarber(barberKey || null),
      barberName: barberKey,
    });
    await rebuildAvailability();
    return NextResponse.json({ ok: true, ...result });
  }

  if (body.action === "paste-busy" && body.date && typeof body.text === "string") {
    const parsed = parseBusyPaste(body.text);
    if (parsed.hours.length === 0) {
      return NextResponse.json(
        {
          error: "Could not parse any times. Try 10am, 11am or 10-12, 2pm-4pm (or paste ICS).",
          unmatched: parsed.unmatched,
        },
        { status: 400 },
      );
    }
    const result = await setBlockedHoursForDate(body.date, parsed.hours, {
      mode: body.mode ?? "add",
      reason: body.reason ?? reasonForBarber(barberKey || null),
      barberName: barberKey,
    });
    await rebuildAvailability();
    return NextResponse.json({
      ok: true,
      ...result,
      parsedHours: parsed.hours,
      unmatched: parsed.unmatched,
    });
  }

  if (!body.id || !body.action || (body.action !== "confirm" && body.action !== "cancel")) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const status: AppointmentStatus = body.action === "confirm" ? "confirmed" : "cancelled";
  const updated = await updateAppointmentStatus(body.id, status);
  if (!updated) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }

  await rebuildAvailability();
  return NextResponse.json({ appointment: updated });
}
