import { NextRequest, NextResponse } from "next/server";

import { verifyAdminKey } from "@/lib/admin-auth";
import { refreshAvailabilitySnapshot } from "@/lib/availability-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Calendar refresh agent — Vercel Cron (every 10 minutes) + admin force refresh.
 *
 * Pulls live open slots from Booksy's public customer `time_slots` API for every
 * staffer (Alexis, Braulio, Cesar, Kristian, Sebastian) + "Any available", then
 * overlays website appointments / busy blocks. Falls back to HOURS + store if
 * Booksy is unreachable. No Booksy password — public web API key only.
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
      booksySyncErrors: snapshot.booksySyncErrors ?? [],
      ttlMs: snapshot.ttlMs,
      note: snapshot.booksyLiveSync
        ? "Live Booksy open slots (public customer time_slots) for every staffer + Any. Website appointments still overlay as busy."
        : "Booksy live pull failed — fell back to website appointments + busy blocks + shop hours. Check booksySyncErrors.",
    });
  } catch (error) {
    console.error("[cron/refresh-availability] failed", error);
    return NextResponse.json({ error: "Availability refresh failed." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
