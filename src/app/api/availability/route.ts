import { NextRequest, NextResponse } from "next/server";

import {
  checkAvailability,
  getAvailableSlotsForDate,
  getUpcomingBookableDays,
} from "@/lib/appointments-store";
import { formatSlotLabel } from "@/lib/availability";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const date = params.get("date");
    const upcomingDays = params.get("upcomingDays");
    const day = params.get("day");
    const time = params.get("time");

    if (upcomingDays) {
      const count = Math.min(Math.max(parseInt(upcomingDays, 10) || 3, 1), 7);
      const days = await getUpcomingBookableDays(count);
      return NextResponse.json({ days });
    }

    if (date) {
      const slots = await getAvailableSlotsForDate(date);
      return NextResponse.json({
        date,
        slots: slots.map((s) => ({
          date: s.date,
          hour: s.hour,
          displayTime: s.displayTime,
          label: formatSlotLabel(s),
        })),
      });
    }

    if (day && time) {
      const result = await checkAvailability(day, time);
      return NextResponse.json({
        ...result,
        alternatives: result.alternatives?.map((s) => ({
          ...s,
          label: formatSlotLabel(s),
        })),
      });
    }

    return NextResponse.json(
      { error: "Provide date, upcomingDays, or day+time query params." },
      { status: 400 },
    );
  } catch (error) {
    console.error("[availability] GET failed", error);
    return NextResponse.json({ error: "Could not load availability." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: { date?: string; upcomingDays?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.upcomingDays) {
    const count = Math.min(Math.max(body.upcomingDays, 1), 7);
    const days = await getUpcomingBookableDays(count);
    return NextResponse.json({ days });
  }

  if (body.date) {
    const slots = await getAvailableSlotsForDate(body.date);
    return NextResponse.json({
      date: body.date,
      slots: slots.map((s) => ({
        date: s.date,
        hour: s.hour,
        displayTime: s.displayTime,
        label: formatSlotLabel(s),
      })),
    });
  }

  return NextResponse.json({ error: "Provide date or upcomingDays in body." }, { status: 400 });
}
