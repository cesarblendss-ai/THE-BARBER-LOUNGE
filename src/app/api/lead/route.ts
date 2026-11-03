import { NextRequest, NextResponse } from "next/server";

import { unauthorizedAdminResponse, verifyAdminKey } from "@/lib/admin-auth";
import { createLead, listLeads, type LeadIntent } from "@/lib/leads-store";
import { sendNtfyPush } from "@/lib/notifications";
import { formatPhoneDisplay, normalizePhoneE164 } from "@/lib/sms-receipt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeadBody = {
  name?: string;
  phone?: string;
  email?: string;
  service?: string;
  source?: string;
  intent?: string;
  smsOptIn?: boolean;
  emailOptIn?: boolean;
  notes?: string;
};

const ALLOWED_INTENTS: LeadIntent[] = ["booksy", "callback", "opt_in"];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseIntent(raw: string | undefined): LeadIntent {
  if (raw && ALLOWED_INTENTS.includes(raw as LeadIntent)) {
    return raw as LeadIntent;
  }
  return "opt_in";
}

export async function GET(request: NextRequest) {
  if (!verifyAdminKey(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const leads = await listLeads();
    return NextResponse.json({ leads });
  } catch (error) {
    console.error("[lead] GET failed", error);
    return NextResponse.json({ error: "Could not load leads." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: LeadBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const name = body.name?.trim() ?? "";
    const phoneRaw = body.phone?.trim() ?? "";
    const emailRaw = body.email?.trim() ?? "";

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }

    const e164 = normalizePhoneE164(phoneRaw);
    if (!e164) {
      return NextResponse.json(
        { error: "Please provide a valid 10-digit US phone number." },
        { status: 400 },
      );
    }

    if (emailRaw && !isValidEmail(emailRaw)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const phone = formatPhoneDisplay(phoneRaw);
    const intent = parseIntent(body.intent);
    const smsOptIn = Boolean(body.smsOptIn);
    const emailOptIn = Boolean(body.emailOptIn);

    const lead = await createLead({
      name,
      phone,
      email: emailRaw || null,
      service: body.service?.trim() || null,
      source: body.source?.trim() || "website",
      intent,
      smsOptIn,
      emailOptIn,
      notes: body.notes?.trim() || null,
    });

    const intentLabel =
      intent === "callback" ? "Call back request" : intent === "booksy" ? "Booksy handoff" : "Opt-in";

    try {
      await sendNtfyPush({
        title: `New lead: ${lead.name}`,
        body: [
          intentLabel,
          lead.service ? `Service: ${lead.service}` : null,
          `Phone: ${lead.phone}`,
          lead.email ? `Email: ${lead.email}` : null,
          `Source: ${lead.source}`,
          smsOptIn ? "SMS opt-in: yes" : "SMS opt-in: no",
          emailOptIn ? "Email opt-in: yes" : "Email opt-in: no",
          "",
          "Campaign SMS/email still blocked until Twilio KYC + email provider.",
        ]
          .filter(Boolean)
          .join("\n"),
        tags: "barber,lead",
        priority: "high",
      });
    } catch (error) {
      console.error("[lead] ntfy notify failed", error);
    }

    // Campaign hooks are intentionally no-ops until Twilio KYC / email provider are live.
    // Persistence + owner ntfy is enough for Phase 1 conversion capture.
    console.log("[lead] captured", {
      id: lead.id,
      intent: lead.intent,
      source: lead.source,
      smsOptIn: lead.smsOptIn,
      emailOptIn: lead.emailOptIn,
    });

    return NextResponse.json({ success: true, lead: { id: lead.id, createdAt: lead.createdAt } });
  } catch (error) {
    console.error("[lead] unhandled error", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Could not save your info. Please call us — we'll get you in." },
      { status: 500 },
    );
  }
}
