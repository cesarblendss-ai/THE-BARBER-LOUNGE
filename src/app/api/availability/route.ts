import { NextRequest, NextResponse } from "next/server";

import {
  checkAvailability,
  getAvailableSlotsForDate,
  getUpcomingBookableDays,
} from "@/lib/appointments-store";
import { formatSlotLabel } from "@/lib/availability";
import {
  getAvailabilitySnapshot,
  getLastSyncedAt,
} from "@/lib/availability-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Short browser/CDN TTL — client also polls; cron rebuilds every 10 min. */
const CACHE_CONTROL = "public, max-age=30, s-maxage=30, stale-while-revalidate=30";

async function withSyncMeta<T extends Record<string, unknown>>(payload: T) {
  const snapshot = await getAvailabilitySnapshot();
  const lastSyncedAt = snapshot.lastSyncedAt || (await getLastSyncedAt());
  return {
    ...payload,
    lastSyncedAt,
    booksyLiveSync: false as const,
    source: snapshot.source,
  };
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const date = params.get("date");
    const upcomingDays = params.get("upcomingDays");
    const day = params.get("day");
    const time = params.get("time");
    const preferCache = params.get("cache") !== "0";

    if (upcomingDays) {
      const count = Math.min(Math.max(parseInt(upcomingDays, 10) || 3, 1), 7);
      if (preferCache) {
        const snapshot = await getAvailabilitySnapshot();
        const days = snapshot.days.slice(0, count).map((d) => ({
          date: d.date,
          dayName: d.dayName,
          label: d.label,
          availableCount: d.availableCount,
        }));
        return NextResponse.json(
          await withSyncMeta({ days }),
          { headers: { "Cache-Control": CACHE_CONTROL } },
        );
      }
      const days = await getUpcomingBookableDays(count);
      return NextResponse.json(await withSyncMeta({ days }), {
        headers: { "Cache-Control": CACHE_CONTROL },
      });
    }

    if (date) {
      if (preferCache) {
        const snapshot = await getAvailabilitySnapshot();
        const cached = snapshot.slotsByDate[date];
        if (cached) {
          return NextResponse.json(
            await withSyncMeta({ date, slots: cached }),
            { headers: { "Cache-Control": CACHE_CONTROL } },
          );
        }
      }
      const slots = await getAvailableSlotsForDate(date);
      return NextResponse.json(
        await withSyncMeta({
          date,
          slots: slots.map((s) => ({
            date: s.date,
            hour: s.hour,
            displayTime: s.displayTime,
            label: formatSlotLabel(s),
          })),
        }),
        { headers: { "Cache-Control": CACHE_CONTROL } },
      );
    }

    if (day && time) {
      const result = await checkAvailability(day, time);
      return NextResponse.json(
        await withSyncMeta({
          ...result,
          alternatives: result.alternatives?.map((s) => ({
            ...s,
            label: formatSlotLabel(s),
          })),
        }),
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    // Status ping — used by /book + admin to show lastSyncedAt.
    if (params.get("meta") === "1") {
      const snapshot = await getAvailabilitySnapshot();
      return NextResponse.json(
        {
          lastSyncedAt: snapshot.lastSyncedAt,
          booksyLiveSync: false,
          source: snapshot.source,
          ttlMs: snapshot.ttlMs,
          dayCount: snapshot.days.length,
        },
        { headers: { "Cache-Control": CACHE_CONTROL } },
      );
    }

    return NextResponse.json(
      { error: "Provide date, upcomingDays, day+time, or meta=1 query params." },
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
    const snapshot = await getAvailabilitySnapshot();
    const days = snapshot.days.slice(0, count);
    return NextResponse.json(await withSyncMeta({ days }), {
      headers: { "Cache-Control": CACHE_CONTROL },
    });
  }

  if (body.date) {
    const snapshot = await getAvailabilitySnapshot();
    const cached = snapshot.slotsByDate[body.date];
    if (cached) {
      return NextResponse.json(await withSyncMeta({ date: body.date, slots: cached }), {
        headers: { "Cache-Control": CACHE_CONTROL },
      });
    }
    const slots = await getAvailableSlotsForDate(body.date);
    return NextResponse.json(
      await withSyncMeta({
        date: body.date,
        slots: slots.map((s) => ({
          date: s.date,
          hour: s.hour,
          displayTime: s.displayTime,
          label: formatSlotLabel(s),
        })),
      }),
      { headers: { "Cache-Control": CACHE_CONTROL } },
    );
  }

  return NextResponse.json({ error: "Provide date or upcomingDays in body." }, { status: 400 });
}
