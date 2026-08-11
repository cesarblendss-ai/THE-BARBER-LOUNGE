import { NextRequest, NextResponse } from "next/server";

import { createBookingAgent } from "@/lib/booking-agent";
import { BARBER_LOUNGE_CONFIG } from "@/lib/booking-config";
import { checkAvailability, parsePreferredSlot } from "@/lib/appointments-store";

export const runtime = "nodejs";

export type { BookingChatResponse } from "@/lib/booking-agent/types";

type ChatMessage = { role: "user" | "assistant"; content: string };

const bookingAgent = createBookingAgent(BARBER_LOUNGE_CONFIG);

function isAiEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function GET() {
  return NextResponse.json({ aiEnabled: isAiEnabled() });
}

export async function POST(request: NextRequest) {
  try {
    let body: { messages?: ChatMessage[] };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required." }, { status: 400 });
    }

    const sanitized = messages.filter(
      (m): m is ChatMessage =>
        m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    );

    if (sanitized.length === 0) {
      return NextResponse.json({ error: "No valid messages." }, { status: 400 });
    }

    const result = await bookingAgent.handleMessage(sanitized, {
      checkAvailability,
      canParseSlot: (day, time) => parsePreferredSlot(day, time) !== null,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[booking-chat] unhandled error", error);
    return NextResponse.json(
      { error: "Booking assistant is temporarily unavailable. Please try again or call the shop." },
      { status: 500 },
    );
  }
}
