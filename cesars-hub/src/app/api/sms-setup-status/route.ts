import { NextResponse } from "next/server";

import { getSmsSetupStatus } from "@/lib/sms-setup-status";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getSmsSetupStatus());
}
