import { NextRequest, NextResponse } from "next/server";

import { notifyCabinetOpened } from "@/lib/notifications";
import { SITE_URL } from "@/lib/constants";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CABINET_WEBHOOK_SECRET?.trim();
  if (!secret) return true;

  const provided =
    request.headers.get("x-cabinet-secret") ||
    request.nextUrl.searchParams.get("secret") ||
    "";
  return provided === secret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { event?: string; source?: string } = {};
  try {
    const text = await request.text();
    if (text.trim()) {
      body = JSON.parse(text) as { event?: string; source?: string };
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const logUrl = `${SITE_URL}/shop-log`;
  const push = await notifyCabinetOpened({ logUrl });

  return NextResponse.json({
    ok: true,
    event: body.event ?? "cabinet_opened",
    source: body.source ?? "unknown",
    notification: push,
    logUrl,
  });
}
