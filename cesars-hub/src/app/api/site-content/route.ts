import { NextResponse } from "next/server";

import { unauthorizedAdminResponse, verifyAdminKey } from "@/lib/admin-auth";
import { getSiteContent, updateSiteContentValue } from "@/lib/get-site-content";

export async function GET() {
  return NextResponse.json(await getSiteContent());
}

export async function PATCH(request: Request) {
  if (!verifyAdminKey(request as import("next/server").NextRequest)) {
    return unauthorizedAdminResponse();
  }

  let body: { path?: string; value?: string };
  try {
    body = (await request.json()) as { path?: string; value?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { path, value } = body;
  if (!path || typeof value !== "string") {
    return NextResponse.json({ error: "path and value are required" }, { status: 400 });
  }

  try {
    const content = await updateSiteContentValue(path, value);
    return NextResponse.json({ ok: true, content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
