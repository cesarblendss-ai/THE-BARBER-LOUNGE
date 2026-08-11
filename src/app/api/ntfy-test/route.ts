import { NextRequest, NextResponse } from "next/server";

import { verifyAdminKey, unauthorizedAdminResponse } from "@/lib/admin-auth";
import { resolveNtfyTopic, sendTestBookingNotification } from "@/lib/notifications";

export const runtime = "nodejs";

/** Send a test ntfy push using production NTFY_TOPIC (admin key required). */
export async function POST(request: NextRequest) {
  if (!verifyAdminKey(request)) {
    return unauthorizedAdminResponse();
  }

  const topic = resolveNtfyTopic();
  if (!topic) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error: "NTFY_TOPIC not set — add it in Vercel → Settings → Environment Variables (Production).",
      },
      { status: 503 },
    );
  }

  const push = await sendTestBookingNotification();

  return NextResponse.json({
    ok: push.pushSent,
    configured: push.configured,
    pushSent: push.pushSent,
    pushError: push.pushError,
    topicConfigured: true,
    hint: push.pushSent
      ? "Check your ntfy app — you should see a test booking alert within a few seconds."
      : "Push failed — check Vercel function logs for [ntfy] errors.",
  });
}

export async function GET(request: NextRequest) {
  if (!verifyAdminKey(request)) {
    return unauthorizedAdminResponse();
  }

  const topic = resolveNtfyTopic();
  return NextResponse.json({
    configured: Boolean(topic),
    topicSet: Boolean(topic),
    hint: topic
      ? "POST to this endpoint (with x-admin-key header) to send a test push."
      : "Set NTFY_TOPIC on Vercel Production, redeploy, then retry.",
  });
}
