"use client";

import { track } from "@vercel/analytics";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { CloseIcon, PhoneIcon } from "@/components/icons";
import { BOOKING_URL, SITE, SITE_BOOK_PATH } from "@/lib/content";
import {
  OPEN_LEAD_EVENT,
  type OpenLeadDetail,
} from "@/lib/booking-events";
import { parseJsonResponse } from "@/lib/fetch-json";

type FormState = {
  name: string;
  phone: string;
  email: string;
  smsOptIn: boolean;
  emailOptIn: boolean;
};

const INITIAL: FormState = {
  name: "",
  phone: "",
  email: "",
  smsOptIn: true,
  emailOptIn: true,
};

function booksyTarget(detail: OpenLeadDetail | null): string {
  return detail?.booksyUrl?.trim() || BOOKING_URL;
}

export function LeadCaptureModal() {
  const { locale, t } = useLanguage();
  const titleId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<OpenLeadDetail | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"book" | "callback" | null>(null);
  const [done, setDone] = useState<"book" | "callback" | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setError(null);
    setSubmitting(null);
    setDone(null);
    setForm(INITIAL);
    setDetail(null);
    previouslyFocusedRef.current?.focus();
  }, []);

  useEffect(() => {
    function onOpen(event: Event) {
      const custom = event as CustomEvent<OpenLeadDetail>;
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      setDetail(custom.detail ?? {});
      setForm(INITIAL);
      setError(null);
      setDone(null);
      setSubmitting(null);
      setOpen(true);
      track("lead_modal_opened", {
        source: custom.detail?.source ?? "unknown",
        service: custom.detail?.service ?? "",
      });
    }

    window.addEventListener(OPEN_LEAD_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_LEAD_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => nameRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const elements = Array.from(focusable).filter((el) => el.offsetParent !== null);
      if (elements.length === 0) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  const submit = async (intent: "book" | "callback") => {
    if (submitting) return;
    setSubmitting(intent);
    setError(null);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          service: detail?.service || undefined,
          source: detail?.source || "lead_modal",
          intent,
          smsOptIn: form.smsOptIn,
          emailOptIn: form.emailOptIn,
        }),
      });

      const data = await parseJsonResponse<{ error?: string; success?: boolean }>(res);
      if (!res.ok) {
        throw new Error(data?.error ?? "Could not save your info.");
      }

      track("lead_captured", {
        intent,
        source: detail?.source ?? "lead_modal",
        service: detail?.service ?? "",
        hasEmail: Boolean(form.email.trim()),
      });

      setDone(intent);

      if (intent === "book") {
        window.setTimeout(() => {
          window.location.assign(SITE_BOOK_PATH);
        }, 350);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Call us and we'll help.");
    } finally {
      setSubmitting(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close booking form"
        onClick={close}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92dvh,40rem)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-orange-500/30 bg-charcoal text-bone shadow-2xl sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p id={titleId} className="font-serif text-xl font-semibold text-white">
              {done === "callback"
                ? locale === "es"
                  ? "Te llamamos."
                  : "We'll call you."
                : done === "book"
                  ? locale === "es"
                    ? "Ya casi."
                    : "You're next."
                  : locale === "es"
                    ? "Asegura tu corte"
                    : "Lock in your cut"}
            </p>
            <p className="mt-1 text-sm text-white/55">
              {done
                ? locale === "es"
                  ? "Guardamos tus datos para contactarte."
                  : "We saved your info so we can reach you."
                : detail?.service
                  ? locale === "es"
                    ? `${detail.service} — deja tus datos, luego reserva aquí o te llamamos.`
                    : `${detail.service} — leave your info, then book on this site or get a call.`
                  : t("lead.body")}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-md p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label={t("lead.close")}
          >
            <CloseIcon className="h-5 w-5 stroke-current" />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-4">
          {done ? (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-white/75">
                {done === "callback"
                  ? `Hang tight — someone from The Barber Lounge will call ${form.phone || "you"} soon.`
                  : "Taking you to our booking page. If nothing happens, use the button below."}
              </p>
              <div className="flex flex-col gap-2">
                {done === "book" ? (
                  <a
                    href={SITE_BOOK_PATH}
                    data-analytics-label="Continue to /book (post lead)"
                    className="inline-flex items-center justify-center rounded-md bg-orange-500 px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-orange-400"
                  >
                    Continue booking →
                  </a>
                ) : null}
                <a
                  href={`tel:${SITE.phoneTel}`}
                  data-analytics-label="Call Now (post lead)"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-orange-400/50 px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-orange-100 transition hover:bg-orange-500/10"
                >
                  <PhoneIcon className="h-4 w-4 stroke-orange-100" />
                  Call {SITE.phone}
                </a>
                <button
                  type="button"
                  onClick={close}
                  className="text-sm text-white/50 underline-offset-2 hover:text-white hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void submit("book");
              }}
              noValidate
            >
              {detail?.service ? (
                <p className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.14em] text-orange-200/90">
                  {detail.service}
                </p>
              ) : null}

              <div>
                <label htmlFor="lead-name" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">
                  Name
                </label>
                <input
                  ref={nameRef}
                  id="lead-name"
                  name="name"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-3 text-sm text-white outline-none ring-orange-400/60 placeholder:text-white/35 focus:ring-2"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="lead-phone" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">
                  Phone
                </label>
                <input
                  id="lead-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-3 text-sm text-white outline-none ring-orange-400/60 placeholder:text-white/35 focus:ring-2"
                  placeholder="(925) 555-1234"
                />
              </div>

              <div>
                <label htmlFor="lead-email" className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">
                  Email <span className="normal-case tracking-normal text-white/35">(optional)</span>
                </label>
                <input
                  id="lead-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-3 text-sm text-white outline-none ring-orange-400/60 placeholder:text-white/35 focus:ring-2"
                  placeholder="you@email.com"
                />
              </div>

              <fieldset className="space-y-2 rounded-md border border-white/10 px-3 py-3">
                <legend className="px-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
                  Stay in the loop
                </legend>
                <label className="flex items-start gap-2.5 text-sm text-white/75">
                  <input
                    type="checkbox"
                    checked={form.smsOptIn}
                    onChange={(e) => setForm((prev) => ({ ...prev, smsOptIn: e.target.checked }))}
                    className="mt-1 h-4 w-4 rounded border-white/30 bg-black accent-orange-500"
                  />
                  <span>Text me about openings and seasonal cuts (SMS when the shop turns it on).</span>
                </label>
                <label className="flex items-start gap-2.5 text-sm text-white/75">
                  <input
                    type="checkbox"
                    checked={form.emailOptIn}
                    onChange={(e) => setForm((prev) => ({ ...prev, emailOptIn: e.target.checked }))}
                    className="mt-1 h-4 w-4 rounded border-white/30 bg-black accent-orange-500"
                  />
                  <span>Email me offers and reminders.</span>
                </label>
              </fieldset>

              {error ? (
                <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="submit"
                  disabled={Boolean(submitting)}
                  data-analytics-label="Lead continue to /book"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-orange-400 disabled:opacity-60"
                >
                  {submitting === "book" ? "Saving…" : "Save & continue booking"}
                  <span aria-hidden>→</span>
                </button>
                <button
                  type="button"
                  disabled={Boolean(submitting)}
                  data-analytics-label="Lead request callback"
                  onClick={() => void submit("callback")}
                  className="inline-flex w-full items-center justify-center rounded-md border border-white/25 bg-white/5 px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/10 disabled:opacity-60"
                >
                  {submitting === "callback" ? "Sending…" : "Request a call back"}
                </button>
                <a
                  href={`tel:${SITE.phoneTel}`}
                  data-analytics-label="Call Now (lead modal)"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-orange-400/50 px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-orange-100 transition hover:bg-orange-500/10"
                >
                  <PhoneIcon className="h-4 w-4 stroke-orange-100" />
                  Call {SITE.phone}
                </a>
              </div>

              <p className="pt-1 text-center text-xs text-white/40">
                Prefer Booksy?{" "}
                <a
                  href={booksyTarget(detail)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-200 underline-offset-2 hover:underline"
                  data-analytics-label="Open Booksy from lead modal"
                >
                  Open Booksy
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
