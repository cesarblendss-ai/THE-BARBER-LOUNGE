import { NextRequest, NextResponse } from "next/server";

import { isRetailLogPinRequired, verifyRetailLogPin } from "@/lib/retail-config";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isRetailLogPinRequired()) {
    return NextResponse.json({ ok: true, pinRequired: false });
  }

  let body: { pin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const pin = body.pin?.trim() ?? "";
  if (!/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: "Enter a 4-digit code." }, { status: 400 });
  }

  if (!verifyRetailLogPin(pin)) {
    return NextResponse.json({ error: "Wrong code." }, { status: 401 });
  }

  return NextResponse.json({ ok: true, pinRequired: true });
}
