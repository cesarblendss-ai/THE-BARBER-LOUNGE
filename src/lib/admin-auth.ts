import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function getAdminKeyFromRequest(request: NextRequest): string | null {
  return (
    request.nextUrl.searchParams.get("key")?.trim() ||
    request.headers.get("x-admin-key")?.trim() ||
    request.cookies.get(ADMIN_KEY_COOKIE)?.value?.trim() ||
    null
  );
}

export function verifyAdminKey(request: NextRequest): boolean {
  const requiredKey = process.env.ADMIN_UPLOAD_KEY?.trim();
  if (!requiredKey) return true;

  const provided = getAdminKeyFromRequest(request);
  return provided === requiredKey;
}

export function unauthorizedAdminResponse(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const EDIT_MODE_COOKIE = "tbl_edit";
export const ADMIN_KEY_COOKIE = "tbl_admin_key";

/** Server-side check (layout, RSC) — matches verifyAdminKey cookie logic. */
export function isAdminAuthenticated(cookieStore: ReadonlyRequestCookies): boolean {
  const requiredKey = process.env.ADMIN_UPLOAD_KEY?.trim();
  if (!requiredKey) return true;
  const provided = cookieStore.get(ADMIN_KEY_COOKIE)?.value?.trim();
  return provided === requiredKey;
}
