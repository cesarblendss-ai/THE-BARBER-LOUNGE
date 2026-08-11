import { NextRequest, NextResponse } from "next/server";

import { getAnalyticsSummary } from "@/lib/analytics-server";
import { verifyAdminKey, unauthorizedAdminResponse } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!verifyAdminKey(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const summary = await getAnalyticsSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("[analytics] summary failed:", error);
    return NextResponse.json({ error: "Failed to load analytics summary" }, { status: 500 });
  }
}
