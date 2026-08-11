import type { Appointment } from "@/lib/appointments-store";

/** Shop owner SMS/push target — always +1 925-209-5995 unless OWNER_PHONE overrides. */
export const DEFAULT_OWNER_PHONE = "+19252095995";

export type PushNotificationResult = {
  configured: boolean;
  pushSent: boolean;
  pushError?: string;
};

function formatNotificationBody(appointment: Appointment): string {
  const guests =
    appointment.guestCount && appointment.guestCount > 1
      ? ` (${appointment.guestCount} guests)`
      : "";
  return [
    `New booking: ${appointment.name}`,
    `${appointment.service}${guests}`,
    `${appointment.preferredDay} ${appointment.preferredTime}`,
    `Phone: ${appointment.phone}`,
    `Code: ${appointment.confirmationCode}`,
  ].join("\n");
}

function formatNotificationTitle(appointment: Appointment): string {
  const guests =
    appointment.guestCount && appointment.guestCount > 1
      ? ` — ${appointment.guestCount} guests`
      : "";
  return `New booking: ${appointment.name}${guests}`;
}

export async function notifyOwnerOfBooking(
  appointment: Appointment,
): Promise<PushNotificationResult> {
  const topic = process.env.NTFY_TOPIC?.trim();
  const pushUrl = process.env.PUSH_NOTIFICATION_URL?.trim();
  const body = formatNotificationBody(appointment);
  const title = formatNotificationTitle(appointment);

  console.log("[booking-notification]", body);

  let push: PushNotificationResult = { configured: false, pushSent: false };

  if (topic) {
    push = { configured: true, pushSent: false };
    try {
      const url = pushUrl || `https://ntfy.sh/${topic}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Title: title,
          Tags: "barber,appointment",
          Priority: "high",
        },
        body,
      });

      if (!res.ok) {
        const detail = (await res.text().catch(() => "")).trim();
        const pushError = `HTTP ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`;
        console.error("[ntfy] Push failed:", pushError);
        push = { configured: true, pushSent: false, pushError };
      } else {
        console.log("[ntfy] Push sent to topic", topic);
        push = { configured: true, pushSent: true };
      }
    } catch (error) {
      const pushError = error instanceof Error ? error.message : String(error);
      console.error("[ntfy] Push request failed:", pushError);
      push = { configured: true, pushSent: false, pushError };
    }
  } else {
    console.warn("[ntfy] NTFY_TOPIC not set — push skipped (booking still saved)");
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const notifyEmail = process.env.OWNER_EMAIL?.trim();
  if (resendKey && notifyEmail) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "The Barber Lounge <bookings@thebarberlounge.com>",
          to: [notifyEmail],
          subject: title,
          text: body,
        }),
      });
    } catch (error) {
      console.error("Resend email notification failed:", error);
    }
  }

  return push;
}

export function getNtfyTopicForDisplay(): string | null {
  return process.env.NTFY_TOPIC?.trim() || null;
}

export function getNtfySubscribeUrl(topic: string): string {
  return `https://ntfy.sh/${topic}`;
}

export type CabinetNotificationResult = PushNotificationResult;

export async function notifyCabinetOpened(options?: {
  logUrl?: string;
}): Promise<CabinetNotificationResult> {
  const topic = process.env.NTFY_TOPIC?.trim();
  const pushUrl = process.env.PUSH_NOTIFICATION_URL?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://the-barber-lounge-antioch.vercel.app";
  const logUrl = options?.logUrl ?? `${siteUrl}/shop-log`;
  const title = "Retail cabinet opened";
  const body = [
    "Someone opened the product cabinet.",
    "Log the sale within 5 minutes:",
    logUrl,
  ].join("\n");

  console.log("[cabinet-notification]", body);

  if (!topic) {
    console.warn("[ntfy] NTFY_TOPIC not set — cabinet ping skipped");
    return { configured: false, pushSent: false };
  }

  try {
    const url = pushUrl || `https://ntfy.sh/${topic}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Title: title,
        Tags: "barber,retail,warning",
        Priority: "high",
        Click: logUrl,
      },
      body,
    });

    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).trim();
      const pushError = `HTTP ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`;
      console.error("[ntfy] Cabinet push failed:", pushError);
      return { configured: true, pushSent: false, pushError };
    }

    console.log("[ntfy] Cabinet push sent to topic", topic);
    return { configured: true, pushSent: true };
  } catch (error) {
    const pushError = error instanceof Error ? error.message : String(error);
    console.error("[ntfy] Cabinet push request failed:", pushError);
    return { configured: true, pushSent: false, pushError };
  }
}
