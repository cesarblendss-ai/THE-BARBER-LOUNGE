import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const HUB_KEY_COOKIE = "cesars_hub_key";

export function getHubKey(): string | null {
  return process.env.HUB_KEY?.trim() || process.env.ADMIN_UPLOAD_KEY?.trim() || null;
}

export function getHubKeyFromRequest(request: NextRequest): string | null {
  return (
    request.nextUrl.searchParams.get("key")?.trim() ||
    request.headers.get("x-admin-key")?.trim() ||
    request.cookies.get(HUB_KEY_COOKIE)?.value?.trim() ||
    null
  );
}

export function verifyHubKey(request: NextRequest): boolean {
  const requiredKey = getHubKey();
  if (!requiredKey) return true;
  return getHubKeyFromRequest(request) === requiredKey;
}

export function unauthorizedHubResponse(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function isHubAuthenticated(cookieStore: ReadonlyRequestCookies): boolean {
  const requiredKey = getHubKey();
  if (!requiredKey) return true;
  return cookieStore.get(HUB_KEY_COOKIE)?.value?.trim() === requiredKey;
}
