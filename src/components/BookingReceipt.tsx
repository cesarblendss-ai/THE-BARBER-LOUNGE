"use client";

import { useCallback, useState } from "react";
import Image from "next/image";

import { getBooksyBookingUrl } from "@/lib/booksy";
import { GOOGLE_REVIEW_URL, SITE } from "@/lib/content";
import { LOGO } from "@/lib/constants";

export type ReceiptData = {
  confirmationCode: string;
  service: string;
  preferredDay: string;
  preferredTime: string;
  name: string;
  phone: string;
  guestCount: number | null;
  status: string;
  createdAt: string;
  customerSmsSent?: boolean;
};

function formatReceiptDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BookingReceipt({ receipt }: { receipt: ReceiptData }) {
  const calendarUrl = `/api/appointments/${encodeURIComponent(receipt.confirmationCode)}/calendar`;
  const customerSmsSent = receipt.customerSmsSent === true;
  const [copied, setCopied] = useState(false);

  const copyConfirmation = useCallback(async () => {
    const text = `${receipt.confirmationCode} — ${receipt.service}, ${receipt.preferredDay} ${receipt.preferredTime} at The Barber Lounge, ${SITE.address}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }, [receipt]);

  return (
    <div
      className="booking-receipt mx-auto w-full max-w-[320px] overflow-hidden rounded-xl border border-charcoal/10 bg-[#F7F4EF] shadow-md print:border print:border-charcoal/30 print:shadow-none"
      role="region"
      aria-label="Appointment confirmed"
    >
      <div className="border-b border-dashed border-charcoal/20 px-5 py-4 text-center">
        <Image
          src={LOGO.src}
          alt={LOGO.alt}
          width={160}
          height={53}
          className="mx-auto h-auto w-[140px] object-contain"
          priority
        />
      </div>

      <div className="border-b border-dashed border-charcoal/20 px-5 py-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brass">
          Appointment Confirmed
        </p>
        <p
          className="mt-2 font-mono text-lg font-semibold tracking-wider text-charcoal"
          aria-label={`Confirmation number ${receipt.confirmationCode}`}
        >
          {receipt.confirmationCode}
        </p>
        <p className="mt-1 text-[11px] text-charcoal/50">
          {formatReceiptDate(receipt.createdAt)}
        </p>
      </div>

      <dl className="space-y-3 px-5 py-4 text-sm text-charcoal">
        <div className="flex justify-between gap-3 border-b border-charcoal/8 pb-2">
          <dt className="text-charcoal/50">Service</dt>
          <dd className="text-right font-medium">{receipt.service}</dd>
        </div>
        {receipt.guestCount && receipt.guestCount > 1 ? (
          <div className="flex justify-between gap-3 border-b border-charcoal/8 pb-2">
            <dt className="text-charcoal/50">Guests</dt>
            <dd className="text-right font-medium">{receipt.guestCount}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3 border-b border-charcoal/8 pb-2">
          <dt className="text-charcoal/50">When</dt>
          <dd className="text-right font-medium">
            {receipt.preferredDay}
            <br />
            {receipt.preferredTime}
          </dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-charcoal/8 pb-2">
          <dt className="text-charcoal/50">Name</dt>
          <dd className="text-right font-medium">{receipt.name}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-charcoal/50">Phone</dt>
          <dd className="text-right font-medium">{receipt.phone}</dd>
        </div>
      </dl>

      <div className="border-t border-dashed border-charcoal/20 px-5 py-4 text-center">
        {customerSmsSent ? (
          <p className="mb-2 text-xs font-medium text-brass">Receipt sent to your phone</p>
        ) : (
          <p className="mb-2 text-xs text-charcoal/50">
            Text receipt unavailable — save your confirmation below
          </p>
        )}
        <p className="text-xs leading-relaxed text-charcoal/60">
          {customerSmsSent ? (
            <>
              We&apos;ll text you if anything changes.
              <br />
              See you at {SITE.address.split(",")[0]}.
            </>
          ) : (
            <>
              Save this confirmation for your records.
              <br />
              See you at {SITE.address.split(",")[0]}.
            </>
          )}
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={copyConfirmation}
            className="rounded-full border border-charcoal/15 bg-bone px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal transition-colors hover:border-brass hover:text-brass"
          >
            {copied ? "Copied!" : "Copy Confirmation"}
          </button>
          <a
            href={calendarUrl}
            download
            className="rounded-full border border-charcoal/15 bg-bone px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal transition-colors hover:border-brass hover:text-brass"
          >
            Add to Calendar
          </a>
          <a
            href={getBooksyBookingUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-charcoal/45 underline-offset-2 hover:text-brass hover:underline"
          >
            Manage on Booksy
          </a>
          <a
            href="/refer"
            className="text-[11px] text-charcoal/45 underline-offset-2 hover:text-brass hover:underline"
          >
            Refer a friend →
          </a>
          {GOOGLE_REVIEW_URL ? (
            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-brass underline-offset-2 hover:underline"
            >
              Leave us a Google review
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function receiptAnnouncement(receipt: ReceiptData): string {
  const guests =
    receipt.guestCount && receipt.guestCount > 1 ? ` for ${receipt.guestCount} guests` : "";
  return `Appointment confirmed. Confirmation number ${receipt.confirmationCode}. ${receipt.service}${guests}, ${receipt.preferredDay} at ${receipt.preferredTime}.`;
}
