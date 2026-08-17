import { NextRequest, NextResponse } from "next/server";

import { unauthorizedAdminResponse, verifyAdminKey } from "@/lib/admin-auth";
import { currentWeekStart, isDateStr, parseShopWeekUpload } from "@/lib/shop-week";
import { saveShopWeek } from "@/lib/shop-week-store";
import { getShopWeekView } from "@/lib/shop-week-view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function weekParam(request: NextRequest): string {
  const week = request.nextUrl.searchParams.get("week")?.trim() ?? "";
  return isDateStr(week) ? week : currentWeekStart();
}

export async function GET(request: NextRequest) {
  try {
    const view = await getShopWeekView(weekParam(request));
    return NextResponse.json(view);
  } catch (error) {
    console.error("[shop-week] GET failed", error);
    return NextResponse.json({ error: "Could not load this week's calendar." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAdminKey(request)) {
    return unauthorizedAdminResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const saved = await saveShopWeek(body, weekParam(request));
    const view = await getShopWeekView(saved.week.weekStart);
    return NextResponse.json({ ok: true, ...view });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save calendar.";
    const status = message.includes("DATABASE_URL") ? 503 : 500;
    console.error("[shop-week] PUT failed", error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminKey(request)) {
    return unauthorizedAdminResponse();
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload a JSON file with this week's calendar." }, { status: 400 });
  }

  const text = await file.text();
  try {
    const parsed = parseShopWeekUpload(text);
    const saved = await saveShopWeek(parsed, parsed.weekStart);
    const view = await getShopWeekView(saved.week.weekStart);
    return NextResponse.json({ ok: true, ...view });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import calendar.";
    const status = message.includes("valid JSON") ? 400 : message.includes("DATABASE_URL") ? 503 : 500;
    console.error("[shop-week] POST failed", error);
    return NextResponse.json({ error: message }, { status });
  }
}
