import { NextRequest, NextResponse } from "next/server";

import { verifyAdminKey } from "@/lib/admin-auth";
import { refreshAvailabilitySnapshot } from "@/lib/availability-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Calendar refresh agent — Vercel Cron (every 10 minutes) + admin force refresh.
 *
 * Rebuilds slot cache from appointments store + HOURS for EVERY Booksy staffer
 * (Alexis, Braulio, Cesar, Kristian, Sebastian) plus shop-wide / "Any available".
 * Does NOT pull live Booksy calendar (no public third-party API).
 */
function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization")?.trim();
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;

  // Vercel Cron invocations include this header on Hobby/Pro.
  if (request.headers.get("x-vercel-cron") === "1") return true;

  // Manual admin force-refresh (cookie / x-admin-key / ?key=).
  if (verifyAdminKey(request)) return true;

  // Local / unset secret — allow in development only.
  if (!cronSecret && process.env.NODE_ENV !== "production") return true;

  return false;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reason = verifyAdminKey(request) ? "admin" : "cron";
    const snapshot = await refreshAvailabilitySnapshot(reason);
    return NextResponse.json({
      ok: true,
      lastSyncedAt: snapshot.lastSyncedAt,
      dayCount: snapshot.days.length,
      totalOpenSlots: Object.values(snapshot.slotsByDate).reduce(
        (sum, slots) => sum + slots.length,
        0,
      ),
      stafferCount: snapshot.staffers.length,
      staffers: snapshot.staffers,
      source: snapshot.source,
      booksyLiveSync: snapshot.booksyLiveSync,
      ttlMs: snapshot.ttlMs,
      note: "Synced shop-wide + per-barber slices from website appointments, busy blocks, and shop hours. Live Booksy calendar requires paste/export for each staffer — Booksy has no public create/list API.",
    });
  } catch (error) {
    console.error("[cron/refresh-availability] failed", error);
    return NextResponse.json({ error: "Availability refresh failed." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
