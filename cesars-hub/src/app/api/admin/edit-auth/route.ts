import { NextResponse } from "next/server";

import {
  ADMIN_KEY_COOKIE,
  EDIT_MODE_COOKIE,
  verifyAdminKey,
} from "@/lib/admin-auth";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function isEditModeEnabled(request: Request): boolean {
  return (request as import("next/server").NextRequest).cookies.get(EDIT_MODE_COOKIE)?.value === "1";
}

export async function GET(request: Request) {
  const authRequired = Boolean(process.env.ADMIN_UPLOAD_KEY?.trim());
  return NextResponse.json({
    editMode: isEditModeEnabled(request),
    authRequired,
  });
}

export async function POST(request: Request) {
  let body: { key?: string };
  try {
    body = (await request.json()) as { key?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const requiredKey = process.env.ADMIN_UPLOAD_KEY?.trim();
  const providedKey = body.key?.trim() ?? "";

  if (requiredKey && providedKey !== requiredKey) {
    return NextResponse.json(
      {
        error: requiredKey
          ? "Invalid admin key — check ADMIN_UPLOAD_KEY in .env.local"
          : "Invalid admin key",
      },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true, editMode: true });

  // Client-readable so EditModeRoot can detect edit mode without a full server round-trip.
  response.cookies.set(EDIT_MODE_COOKIE, "1", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  if (requiredKey) {
    response.cookies.set(ADMIN_KEY_COOKIE, requiredKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
  }

  return response;
}

export async function DELETE(request: Request) {
  if (!verifyAdminKey(request as import("next/server").NextRequest)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, editMode: false });
  response.cookies.set(EDIT_MODE_COOKIE, "", { httpOnly: false, path: "/", maxAge: 0 });
  response.cookies.set(ADMIN_KEY_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
