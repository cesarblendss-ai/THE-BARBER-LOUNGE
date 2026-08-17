import { NextResponse } from "next/server";

import { getHubKey, HUB_KEY_COOKIE } from "@/lib/hub-auth";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  let body: { key?: string };
  try {
    body = (await request.json()) as { key?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const requiredKey = getHubKey();
  const providedKey = body.key?.trim() ?? "";

  if (requiredKey && providedKey !== requiredKey) {
    return NextResponse.json({ error: "Invalid hub key." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  if (requiredKey) {
    response.cookies.set(HUB_KEY_COOKIE, requiredKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
  }
  return response;
}
