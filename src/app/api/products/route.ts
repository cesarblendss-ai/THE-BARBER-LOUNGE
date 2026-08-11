import { NextRequest, NextResponse } from "next/server";

import { isRetailLogPinRequired } from "@/lib/retail-config";
import { listProducts, upsertProduct } from "@/lib/retail-store";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest): boolean {
  const key = process.env.ADMIN_UPLOAD_KEY?.trim();
  if (!key) return true;
  const provided =
    request.nextUrl.searchParams.get("key") ||
    request.headers.get("x-admin-key") ||
    "";
  return provided === key;
}

export async function GET(request: NextRequest) {
  try {
    const activeOnly = request.nextUrl.searchParams.get("active") === "1";
    const products = await listProducts(activeOnly);
    return NextResponse.json({ products, pinRequired: isRetailLogPinRequired() });
  } catch (error) {
    console.error("[products] GET failed", error);
    return NextResponse.json({ error: "Could not load products." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: {
    id?: string;
    name?: string;
    priceCents?: number;
    stock?: number;
    active?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  if (!body.name?.trim() || typeof body.priceCents !== "number") {
    return NextResponse.json({ error: "name and priceCents required." }, { status: 400 });
  }

  const product = await upsertProduct({
    id: body.id,
    name: body.name,
    priceCents: body.priceCents,
    stock: body.stock ?? 0,
    active: body.active,
  });

  return NextResponse.json({ product });
}
