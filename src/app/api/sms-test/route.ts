import { NextRequest, NextResponse } from "next/server";

import { isSmsConfigured, isTwilioTrialMode, sendTestSms } from "@/lib/sms-receipt";

export const runtime = "nodejs";

const DEFAULT_TEST_TO = "+19252095995";

/** Dev-only: send a test SMS to verify Twilio credentials and trial settings. */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production." }, { status: 404 });
  }

  const adminKey = process.env.ADMIN_UPLOAD_KEY?.trim();
  if (adminKey) {
    const provided = request.headers.get("x-admin-key")?.trim();
    if (provided !== adminKey) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  if (!isSmsConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Twilio not configured — set TWILIO_* in .env.local" },
      { status: 503 },
    );
  }

  const to = request.nextUrl.searchParams.get("to")?.trim() || DEFAULT_TEST_TO;
  const message = request.nextUrl.searchParams.get("message")?.trim() || "TBL test from debug script";

  const result = await sendTestSms(to, message);

  return NextResponse.json({
    ok: result.ok,
    to,
    trialMode: isTwilioTrialMode(),
    errorCode: result.errorCode,
    errorMessage: result.errorMessage,
  });
}
