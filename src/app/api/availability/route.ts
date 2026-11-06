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
  pickBarberSlice,
} from "@/lib/availability-sync";
import { BOOKABLE_WINDOW_DAYS, normalizeBarberKey } from "@/lib/busy-blocks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Short browser/CDN TTL — client also polls; cron rebuilds every 10 min. */
const CACHE_CONTROL = "public, max-age=30, s-maxage=30, stale-while-revalidate=30";

async function withSyncMeta<T extends Record<string, unknown>>(
  payload: T,
  barberName?: string | null,
) {
  const snapshot = await getAvailabilitySnapshot();
  const lastSyncedAt = snapshot.lastSyncedAt || (await getLastSyncedAt());
  return {
    ...payload,
    lastSyncedAt,
    booksyLiveSync: false as const,
    source: snapshot.source,
    barber: normalizeBarberKey(barberName) || null,
    staffers: snapshot.staffers,
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
    const barber = params.get("barber");

    if (upcomingDays) {
      const count = Math.min(
        Math.max(parseInt(upcomingDays, 10) || BOOKABLE_WINDOW_DAYS, 1),
        BOOKABLE_WINDOW_DAYS,
      );
      if (preferCache) {
        const snapshot = await getAvailabilitySnapshot();
        const slice = pickBarberSlice(snapshot, barber);
        const days = slice.days.slice(0, count).map((d) => ({
          date: d.date,
          dayName: d.dayName,
          label: d.label,
          availableCount: d.availableCount,
        }));
        return NextResponse.json(await withSyncMeta({ days }, barber), {
          headers: { "Cache-Control": CACHE_CONTROL },
        });
      }
      const days = await getUpcomingBookableDays(count, barber);
      return NextResponse.json(await withSyncMeta({ days }, barber), {
        headers: { "Cache-Control": CACHE_CONTROL },
      });
    }

    if (date) {
      if (preferCache) {
        const snapshot = await getAvailabilitySnapshot();
        const slice = pickBarberSlice(snapshot, barber);
        const cached = slice.slotsByDate[date];
        if (cached) {
          return NextResponse.json(
            await withSyncMeta({ date, slots: cached }, barber),
            { headers: { "Cache-Control": CACHE_CONTROL } },
          );
        }
      }
      const slots = await getAvailableSlotsForDate(date, new Date(), barber);
      return NextResponse.json(
        await withSyncMeta(
          {
            date,
            slots: slots.map((s) => ({
              date: s.date,
              hour: s.hour,
              displayTime: s.displayTime,
              label: formatSlotLabel(s),
            })),
          },
          barber,
        ),
        { headers: { "Cache-Control": CACHE_CONTROL } },
      );
    }

    if (day && time) {
      const result = await checkAvailability(day, time, barber);
      return NextResponse.json(
        await withSyncMeta(
          {
            ...result,
            alternatives: result.alternatives?.map((s) => ({
              ...s,
              label: formatSlotLabel(s),
            })),
          },
          barber,
        ),
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    if (params.get("meta") === "1") {
      const snapshot = await getAvailabilitySnapshot();
      return NextResponse.json(
        {
          lastSyncedAt: snapshot.lastSyncedAt,
          booksyLiveSync: false,
          source: snapshot.source,
          ttlMs: snapshot.ttlMs,
          dayCount: snapshot.days.length,
          stafferCount: snapshot.staffers.length,
          staffers: snapshot.staffers,
          totalOpenSlots: Object.values(snapshot.slotsByDate).reduce(
            (sum, slots) => sum + slots.length,
            0,
          ),
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
  let body: { date?: string; upcomingDays?: number; barber?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const barber = body.barber;

  if (body.upcomingDays) {
    const count = Math.min(Math.max(body.upcomingDays, 1), BOOKABLE_WINDOW_DAYS);
    const snapshot = await getAvailabilitySnapshot();
    const slice = pickBarberSlice(snapshot, barber);
    const days = slice.days.slice(0, count);
    return NextResponse.json(await withSyncMeta({ days }, barber), {
      headers: { "Cache-Control": CACHE_CONTROL },
    });
  }

  if (body.date) {
    const snapshot = await getAvailabilitySnapshot();
    const slice = pickBarberSlice(snapshot, barber);
    const cached = slice.slotsByDate[body.date];
    if (cached) {
      return NextResponse.json(await withSyncMeta({ date: body.date, slots: cached }, barber), {
        headers: { "Cache-Control": CACHE_CONTROL },
      });
    }
    const slots = await getAvailableSlotsForDate(body.date, new Date(), barber);
    return NextResponse.json(
      await withSyncMeta(
        {
          date: body.date,
          slots: slots.map((s) => ({
            date: s.date,
            hour: s.hour,
            displayTime: s.displayTime,
            label: formatSlotLabel(s),
          })),
        },
        barber,
      ),
      { headers: { "Cache-Control": CACHE_CONTROL } },
    );
  }

  return NextResponse.json({ error: "Provide date or upcomingDays in body." }, { status: 400 });
}
