import { NextRequest, NextResponse } from "next/server";

import { createAppointmentRequest } from "@/lib/appointments-store";
import { notifyOwnerOfBooking, type PushNotificationResult } from "@/lib/notifications";
import {
  formatPhoneDisplay,
  sendBookingNotifications,
  type SmsDeliveryResult,
} from "@/lib/sms-receipt";

export const runtime = "nodejs";

type RequestBody = {
  service?: string;
  preferredDay?: string;
  preferredTime?: string;
  slotDate?: string;
  name?: string;
  phone?: string;
  guestCount?: number | null;
};

function normalizePhone(phone: string): string | null {
  const formatted = formatPhoneDisplay(phone);
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 || (digits.length === 11 && digits.startsWith("1"))) {
    return formatted;
  }
  return null;
}

function bookingErrorMessage(reason: string): string {
  if (reason === "slot_taken") return "That time just got booked. Pick another slot.";
  if (reason === "storage_error") {
    return "Online booking is temporarily unavailable. Please call us to schedule.";
  }
  return "That time isn't available.";
}

export async function POST(request: NextRequest) {
  try {
    let body: RequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const service = body.service?.trim();
    const preferredDay = body.preferredDay?.trim();
    const preferredTime = body.preferredTime?.trim();
    const name = body.name?.trim();
    const phoneRaw = body.phone?.trim();

    if (!service || !preferredDay || !preferredTime || !name || !phoneRaw) {
      return NextResponse.json(
        { error: "service, preferredDay, preferredTime, name, and phone are required." },
        { status: 400 },
      );
    }

    const phone = normalizePhone(phoneRaw);
    if (!phone) {
      return NextResponse.json({ error: "Please provide a valid phone number." }, { status: 400 });
    }

    const result = await createAppointmentRequest({
      service,
      preferredDay,
      preferredTime,
      slotDate: body.slotDate?.trim(),
      name,
      phone,
      guestCount: typeof body.guestCount === "number" ? body.guestCount : null,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          error: bookingErrorMessage(result.reason),
          available: false,
          alternatives: result.alternatives ?? [],
        },
        { status: result.reason === "storage_error" ? 503 : 409 },
      );
    }

    const { appointment } = result;
    const smsReceipt = {
      confirmationCode: appointment.confirmationCode,
      service: appointment.service,
      preferredDay: appointment.preferredDay,
      preferredTime: appointment.preferredTime,
      name: appointment.name,
      phone: appointment.phone,
      guestCount: appointment.guestCount,
    };

    let sms: SmsDeliveryResult = { configured: false, customerSent: false, ownerSent: false };
    try {
      sms = await sendBookingNotifications(smsReceipt);
      if (sms.configured && !sms.ownerSent) {
        console.error(
          "[sms] CRITICAL: owner SMS not delivered",
          sms.lastErrorCode ? `(Twilio ${sms.lastErrorCode}: ${sms.lastErrorMessage ?? ""})` : "",
        );
      }
    } catch (error) {
      console.error("[sms] CRITICAL: sendBookingNotifications threw", error);
    }

    let push: PushNotificationResult = { configured: false, pushSent: false };
    try {
      push = await notifyOwnerOfBooking(appointment);
      if (push.configured && !push.pushSent) {
        console.error("[ntfy] CRITICAL: owner push not delivered", push.pushError ?? "");
      }
    } catch (error) {
      console.error("[booking-notification] ntfy failed:", error);
    }

    return NextResponse.json({
      success: true,
      receipt: {
        confirmationCode: appointment.confirmationCode,
        service: appointment.service,
        preferredDay: appointment.preferredDay,
        preferredTime: appointment.preferredTime,
        name: appointment.name,
        phone: appointment.phone,
        guestCount: appointment.guestCount,
        status: appointment.status,
        createdAt: appointment.createdAt,
        customerSmsSent: sms.customerSent,
      },
      sms,
      push,
    });
  } catch (error) {
    console.error("[appointment-request] unhandled error", error);
    return NextResponse.json(
      { error: "Could not complete booking. Please call us to confirm your visit." },
      { status: 500 },
    );
  }
}
