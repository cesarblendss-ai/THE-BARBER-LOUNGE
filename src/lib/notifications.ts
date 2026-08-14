import type { Appointment } from "@/lib/appointments-store";

/** Shop owner SMS/push target — always +1 925-209-5995 unless OWNER_PHONE overrides. */
export const DEFAULT_OWNER_PHONE = "+19252095995";

export type PushNotificationResult = {
  configured: boolean;
  pushSent: boolean;
  pushError?: string;
};

function resolveSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://the-barber-lounge-antioch.vercel.app";
}

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
      ? ` - ${appointment.guestCount} guests`
      : "";
  return `New booking: ${appointment.name}${guests}`;
}

export function resolveNtfyTopic(): string | null {
  return process.env.NTFY_TOPIC?.trim() || null;
}

/** ntfy HTTP headers must be ByteString (Latin-1); em dashes in titles break fetch on Vercel. */
function asciiHeader(value: string): string {
  return value
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/[^\x00-\xFF]/g, "?");
}

export async function sendNtfyPush(options: {
  title: string;
  body: string;
  tags?: string;
  priority?: "default" | "low" | "high" | "max" | "min" | "urgent";
  click?: string;
}): Promise<PushNotificationResult> {
  const topic = resolveNtfyTopic();
  const pushUrl = process.env.PUSH_NOTIFICATION_URL?.trim();

  if (!topic) {
    return { configured: false, pushSent: false };
  }

  try {
    const url = pushUrl || `https://ntfy.sh/${topic}`;
    const headers: Record<string, string> = {
      Title: asciiHeader(options.title),
      Tags: options.tags ?? "barber",
      Priority: options.priority ?? "high",
      "Content-Type": "text/plain; charset=utf-8",
    };
    if (options.click) {
      headers.Click = options.click;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: options.body,
    });

    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).trim();
      const pushError = `HTTP ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`;
      console.error("[ntfy] Push failed:", pushError);
      return { configured: true, pushSent: false, pushError };
    }

    console.log("[ntfy] Push sent to topic", topic);
    return { configured: true, pushSent: true };
  } catch (error) {
    const pushError = error instanceof Error ? error.message : String(error);
    console.error("[ntfy] Push request failed:", pushError);
    return { configured: true, pushSent: false, pushError };
  }
}

async function sendOwnerEmailBackup(title: string, body: string): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const notifyEmail = process.env.OWNER_EMAIL?.trim();
  if (!resendKey || !notifyEmail) return;

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

export async function notifyOwnerOfBooking(
  appointment: Appointment,
): Promise<PushNotificationResult> {
  const body = formatNotificationBody(appointment);
  const title = formatNotificationTitle(appointment);

  console.log("[booking-notification]", body);

  const push = await sendNtfyPush({
    title,
    body,
    tags: "barber,appointment",
    priority: "high",
    click: `${resolveSiteUrl()}/book`,
  });

  if (!push.configured) {
    console.warn("[ntfy] NTFY_TOPIC not set — push skipped (booking still saved)");
  }

  await sendOwnerEmailBackup(title, body);
  return push;
}

export async function sendTestBookingNotification(): Promise<PushNotificationResult> {
  return sendNtfyPush({
    title: "TBL test - booking alert",
    body: [
      "Test booking: Notification Check",
      "Haircut",
      "Wednesday 9:00 AM",
      "Phone: (925) 555-0100",
      "Code: TBL-TEST",
      "",
      "If you see this, ntfy is working on production.",
    ].join("\n"),
    tags: "barber,test",
    priority: "high",
    click: resolveSiteUrl(),
  });
}

export function getNtfyTopicForDisplay(): string | null {
  return resolveNtfyTopic();
}

export function getNtfySubscribeUrl(topic: string): string {
  return `https://ntfy.sh/${topic}`;
}

export type CabinetNotificationResult = PushNotificationResult;

export async function notifyCabinetOpened(options?: {
  logUrl?: string;
}): Promise<CabinetNotificationResult> {
  const logUrl = options?.logUrl ?? `${resolveSiteUrl()}/shop-log`;
  const body = [
    "Someone opened the product cabinet.",
    "Log the sale within 5 minutes:",
    logUrl,
  ].join("\n");

  console.log("[cabinet-notification]", body);

  const push = await sendNtfyPush({
    title: "Retail cabinet opened",
    body,
    tags: "barber,retail,warning",
    priority: "high",
    click: logUrl,
  });

  if (!push.configured) {
    console.warn("[ntfy] NTFY_TOPIC not set — cabinet ping skipped");
  }

  return push;
}
