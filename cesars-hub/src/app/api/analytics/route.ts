import { NextRequest, NextResponse } from "next/server";

import type { AnalyticsBatchPayload } from "@/lib/analytics-types";
import { checkAnalyticsRateLimit, ingestAnalyticsEvents } from "@/lib/analytics-server";
import { isDatabaseConfigured } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Analytics database not configured" },
      { status: 503 },
    );
  }

  let body: AnalyticsBatchPayload;
  try {
    body = (await request.json()) as AnalyticsBatchPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.events) || body.events.length === 0) {
    return NextResponse.json({ ok: false, error: "No events" }, { status: 400 });
  }

  if (body.events.length > 50) {
    return NextResponse.json({ ok: false, error: "Batch too large" }, { status: 413 });
  }

  const rateKey =
    body.events.find((event) => event.type === "session")?.visitorId ??
    body.events.find((event) => "sessionId" in event)?.sessionId ??
    "anonymous";

  if (!checkAnalyticsRateLimit(rateKey)) {
    return NextResponse.json({ ok: false, error: "Rate limited" }, { status: 429 });
  }

  try {
    const result = await ingestAnalyticsEvents(body.events);

    return NextResponse.json({
      ok: true,
      sessionId: result.sessionId,
      pageViewIds: result.pageViewIds,
    });
  } catch (error) {
    console.error("[analytics] ingest failed:", error);
    return NextResponse.json({ ok: false, error: "Failed to store events" }, { status: 500 });
  }
}
