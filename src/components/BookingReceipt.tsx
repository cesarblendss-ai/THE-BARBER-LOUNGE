"use client";

import { useCallback, useState } from "react";
import Image from "next/image";

import { getBooksyHandoffFromBooking } from "@/lib/booksy-handoff";
import { SITE } from "@/lib/content";
import { REVIEW_LANDING_PATH } from "@/lib/reviews";
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
  /** Booksy deep link with service/staffer/date/time preselected. */
  booksyHandoffUrl?: string;
  slotDate?: string;
  barberName?: string | null;
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

  const booksyHandoffUrl =
    receipt.booksyHandoffUrl ??
    getBooksyHandoffFromBooking({
      service: receipt.service,
      preferredTime: receipt.preferredTime,
      slotDate: receipt.slotDate,
      barberName: receipt.barberName,
    });

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
      aria-label="Appointment request received"
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
          Almost done — finish on Booksy
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
        <p className="mb-3 text-xs leading-relaxed text-charcoal/70">
          Booksy is our live calendar. Confirm your cut there so the chair is
          locked — we prefilled your service
          {receipt.barberName ? `, barber,` : ""} and day.
        </p>

        <div className="flex flex-col gap-2">
          <a
            href={booksyHandoffUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-label="Finish on Booksy (receipt)"
            className="rounded-full bg-charcoal px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone transition-colors hover:bg-brass hover:text-charcoal"
          >
            Finish on Booksy →
          </a>
          {customerSmsSent ? (
            <p className="text-[11px] font-medium text-brass">Receipt also sent to your phone</p>
          ) : (
            <p className="text-[11px] text-charcoal/50">
              Text receipt unavailable — save your confirmation below
            </p>
          )}
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
            href="/refer"
            className="text-[11px] text-charcoal/45 underline-offset-2 hover:text-brass hover:underline"
          >
            Refer a friend →
          </a>
          <a
            href={REVIEW_LANDING_PATH}
            className="mt-1 rounded-full border border-brass/30 bg-bone px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-brass transition-colors hover:border-brass hover:bg-brass/5"
          >
            Leave a Google review
          </a>
        </div>
      </div>
    </div>
  );
}

export function receiptAnnouncement(receipt: ReceiptData): string {
  const guests =
    receipt.guestCount && receipt.guestCount > 1 ? ` for ${receipt.guestCount} guests` : "";
  return `Request received. Confirmation number ${receipt.confirmationCode}. ${receipt.service}${guests}, ${receipt.preferredDay} at ${receipt.preferredTime}. Finish on Booksy to lock your chair.`;
}
