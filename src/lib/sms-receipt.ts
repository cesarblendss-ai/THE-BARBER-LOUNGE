import { SITE } from "@/lib/content";
import { DEFAULT_OWNER_PHONE } from "@/lib/notifications";

export type SmsReceipt = {
  confirmationCode: string;
  service: string;
  preferredDay: string;
  preferredTime: string;
  name: string;
  phone: string;
  guestCount: number | null;
};

export type SmsDeliveryResult = {
  configured: boolean;
  customerSent: boolean;
  ownerSent: boolean;
  /** Last Twilio error code when a send failed (e.g. 572006 trial template restriction). */
  lastErrorCode?: number;
  /** Human-readable Twilio error message from the last failed send. */
  lastErrorMessage?: string;
};

/** Trial accounts must use a predefined template name as Body, not custom text. */
const TRIAL_SMS_TEMPLATE = "sms_appointment_reminders";

type TwilioErrorBody = {
  code?: number;
  message?: string;
  more_info?: string;
  status?: number;
};

/** Normalize US phone to E.164 (+1XXXXXXXXXX). */
export function normalizePhoneE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

/** Format for display: (925) 555-1234 */
export function formatPhoneDisplay(phone: string): string {
  const e164 = normalizePhoneE164(phone);
  if (!e164) return phone.trim();
  const digits = e164.slice(2);
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatServiceLine(service: string, guestCount: number | null): string {
  if (guestCount && guestCount > 1) {
    const label = service.endsWith("s") ? service : `${service}s`;
    return `${guestCount} ${label}`;
  }
  return service;
}

export function formatReceiptSms(receipt: SmsReceipt): string {
  return [
    "THE BARBER LOUNGE",
    "Appointment Confirmed ✓",
    "─────────────────",
    receipt.confirmationCode,
    formatServiceLine(receipt.service, receipt.guestCount),
    `${receipt.preferredDay} · ${receipt.preferredTime}`,
    receipt.name,
    "1518 A St, Antioch CA",
    "─────────────────",
    `Questions? ${SITE.phone}`,
  ].join("\n");
}

export function formatOwnerReceiptSms(receipt: SmsReceipt): string {
  const phoneDisplay = formatPhoneDisplay(receipt.phone);
  const serviceLine = `${formatServiceLine(receipt.service, receipt.guestCount)} · ${receipt.preferredDay} ${receipt.preferredTime}`;

  return [
    `NEW BOOKING — ${receipt.confirmationCode}`,
    `${receipt.name} · ${phoneDisplay}`,
    serviceLine,
    "Enter in Booksy → /admin/appointments",
  ].join("\n");
}

function getTwilioConfig():
  | { accountSid: string; authToken: string; fromNumber: string }
  | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER?.trim();
  if (!accountSid || !authToken || !fromNumber) return null;
  return { accountSid, authToken, fromNumber };
}

export function isSmsConfigured(): boolean {
  return getTwilioConfig() !== null;
}

export function isTwilioTrialMode(): boolean {
  const value = process.env.TWILIO_TRIAL_MODE?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function getSmsBody(receipt: SmsReceipt, variant: "customer" | "owner"): string {
  if (isTwilioTrialMode()) {
    return TRIAL_SMS_TEMPLATE;
  }
  return variant === "owner" ? formatOwnerReceiptSms(receipt) : formatReceiptSms(receipt);
}

async function parseTwilioErrorResponse(res: Response): Promise<TwilioErrorBody & { raw: string }> {
  const raw = await res.text();
  try {
    return { ...(JSON.parse(raw) as TwilioErrorBody), raw };
  } catch {
    return { message: raw, status: res.status, raw };
  }
}

function logTwilioError(context: string, err: TwilioErrorBody, httpStatus: number): void {
  const code = err.code ?? "unknown";
  console.error(
    `[sms] Twilio error (${context}): HTTP ${httpStatus}, code=${code} — ${err.message ?? "no message"}`,
  );
  if (err.more_info) {
    console.error("[sms] Twilio docs:", err.more_info);
  }
  if (err.code === 572006) {
    console.error(
      "[sms] Trial account: custom SMS bodies are blocked. Set TWILIO_TRIAL_MODE=1 in .env.local (uses appointment-reminder template) or upgrade at https://console.twilio.com/billing/upgrade",
    );
  }
  if (err.code === 20003) {
    console.error(
      "[sms] Trust Hub KYC not approved — complete your primary compliance profile at https://console.twilio.com/us1/develop/trusthub/compliance-profiles/primary",
    );
  }
  if (err.code === 30034) {
    console.error(
      "[sms] A2P 10DLC registration required for US SMS — register at https://console.twilio.com/us1/develop/sms/regulatory-compliance/a2p-10dlc",
    );
  }
  if (err.code === 572002 || err.code === 21608 || err.code === 14111) {
    console.error(
      "[sms] Unverified destination: add the recipient at https://console.twilio.com/us1/develop/phone-numbers/manage/verified",
    );
  }
  if (err.message?.toLowerCase().includes("compliance profile")) {
    console.error(
      "[sms] Complete Trust Hub KYC at https://console.twilio.com/us1/develop/trusthub/compliance-profiles/primary",
    );
  }
}

async function sendSms(
  to: string,
  body: string,
  options?: { quiet?: boolean; context?: string },
): Promise<{ ok: boolean; messageSid?: string; error?: TwilioErrorBody & { raw?: string } }> {
  const config = getTwilioConfig();
  if (!config) {
    if (!options?.quiet) {
      console.log("[sms] Twilio not configured — add TWILIO_* to .env.local");
    }
    return { ok: false };
  }

  const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");
  const params = new URLSearchParams({ To: to, Body: body });
  // Trial API only allows To, Body, and StatusCallback — Twilio assigns the From number.
  if (!isTwilioTrialMode()) {
    params.set("From", config.fromNumber);
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );

    if (!res.ok) {
      const err = await parseTwilioErrorResponse(res);
      if (!options?.quiet) {
        logTwilioError(options?.context ?? `to ${to}`, err, res.status);
      }
      return { ok: false, error: { ...err, raw: err.raw } };
    }

    const data = (await res.json()) as { sid?: string };
    if (!options?.quiet) {
      console.log(`[sms] Sent to ${to}${isTwilioTrialMode() ? " (trial template)" : ""}`);
    }
    return { ok: true, messageSid: data.sid };
  } catch (error) {
    if (!options?.quiet) {
      console.error("[sms] Twilio request failed:", error);
    }
    return { ok: false };
  }
}

export async function sendSmsReceipt({
  to,
  receipt,
  variant = "customer",
  quiet = false,
}: {
  to: string;
  receipt: SmsReceipt;
  variant?: "customer" | "owner";
  quiet?: boolean;
}): Promise<boolean> {
  const body = getSmsBody(receipt, variant);
  const result = await sendSms(to, body, { quiet, context: variant });
  return result.ok;
}

/** Send a one-off test SMS (dev / admin diagnostics). */
export async function sendTestSms(
  to: string,
  message = "TBL test from debug script",
): Promise<{
  ok: boolean;
  messageSid?: string;
  errorCode?: number;
  errorMessage?: string;
  errorRaw?: string;
}> {
  const body = isTwilioTrialMode() ? TRIAL_SMS_TEMPLATE : message;
  const result = await sendSms(to, body, { context: "test" });
  return {
    ok: result.ok,
    messageSid: result.messageSid,
    errorCode: result.error?.code,
    errorMessage: result.error?.message,
    errorRaw: result.error?.raw,
  };
}

export async function sendBookingNotifications(receipt: SmsReceipt): Promise<SmsDeliveryResult> {
  const configured = isSmsConfigured();
  if (!configured) {
    console.log("[sms] Twilio not configured — add TWILIO_* to .env.local");
    return { configured: false, customerSent: false, ownerSent: false };
  }

  if (isTwilioTrialMode()) {
    console.log(
      "[sms] TWILIO_TRIAL_MODE enabled — using predefined template; custom receipt text is sent after account upgrade",
    );
  }

  const customerE164 = normalizePhoneE164(receipt.phone);
  const ownerPhone = process.env.OWNER_PHONE?.trim() || DEFAULT_OWNER_PHONE || SITE.phoneTel;

  let customerSent = false;
  let ownerSent = false;
  let lastErrorCode: number | undefined;
  let lastErrorMessage: string | undefined;

  if (customerE164) {
    const customerBody = getSmsBody(receipt, "customer");
    const customerResult = await sendSms(customerE164, customerBody, { context: "customer" });
    customerSent = customerResult.ok;
    if (!customerResult.ok && customerResult.error) {
      lastErrorCode = customerResult.error.code;
      lastErrorMessage = customerResult.error.message;
    }
  } else {
    console.error("[sms] Invalid customer phone:", receipt.phone);
  }

  const ownerBody = getSmsBody(receipt, "owner");
  const ownerResult = await sendSms(ownerPhone, ownerBody, { context: "owner" });
  ownerSent = ownerResult.ok;
  if (!ownerResult.ok) {
    if (ownerResult.error) {
      lastErrorCode = ownerResult.error.code;
      lastErrorMessage = ownerResult.error.message;
    }
    console.error(
      "[sms] CRITICAL: owner notification not delivered",
      lastErrorCode ? `(Twilio code ${lastErrorCode})` : "",
    );
  }

  return {
    configured: true,
    customerSent,
    ownerSent,
    lastErrorCode,
    lastErrorMessage,
  };
}
