"use client";

import { track } from "@vercel/analytics";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  BookingReceipt,
  receiptAnnouncement,
  type ReceiptData,
} from "@/components/BookingReceipt";
import { CloseIcon } from "@/components/icons";
import { BOOKING_URL, SITE } from "@/lib/content";
import { parseJsonResponse } from "@/lib/fetch-json";
import { normalizePhoneE164, formatPhoneDisplay } from "@/lib/sms-receipt";
import { WIZARD_SERVICES } from "@/lib/wizard-helpers";

type WizardStep = "service" | "day" | "time" | "phone" | "done";

type Message = { role: "user" | "assistant"; content: string };

type DayOption = {
  date: string;
  dayName: string;
  label: string;
  availableCount: number;
};

type TimeSlot = {
  date: string;
  hour: number;
  displayTime: string;
  label: string;
};

type Selections = {
  service: string | null;
  date: string | null;
  displayDay: string | null;
  time: string | null;
  displayTime: string | null;
  phone: string | null;
};

const PROMPTS: Record<Exclude<WizardStep, "done">, string> = {
  service: "Hey, what are you trying to get done?",
  day: "What day and time works best?",
  time: "Pick a time that works for you.",
  phone: "Got it. What's the best number to reach you?",
};

const TEASER_TEXT = "Book your cut →";
const TEASER_REAPPEAR_MS = 30_000;
const TEASER_AUTO_SHOW_MS = 5_000;

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function BookingFab({
  onOpen,
  onDismissTeaser,
  showTeaser,
  triggerRef,
}: {
  onOpen: () => void;
  onDismissTeaser: () => void;
  showTeaser: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div
      className="fixed bottom-[5.75rem] right-4 z-50 flex flex-col items-end gap-2 md:bottom-6"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {showTeaser && (
        <div
          className="booking-teaser-in relative max-w-[220px] rounded-2xl rounded-br-sm border border-charcoal/10 bg-bone px-3.5 py-2.5 pr-8 text-sm font-medium text-charcoal shadow-lg"
          role="status"
        >
          {TEASER_TEXT}
          <button
            type="button"
            onClick={onDismissTeaser}
            className="absolute right-2 top-2 rounded-full p-0.5 text-charcoal/45 transition-colors hover:bg-charcoal/5 hover:text-charcoal"
            aria-label="Dismiss booking hint"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
          <span
            className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-b border-r border-charcoal/10 bg-bone"
            aria-hidden
          />
        </div>
      )}

      <button
        ref={triggerRef}
        type="button"
        onClick={onOpen}
        data-analytics-label="Booking chat FAB"
        className="booking-fab-pulse relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-2 border-brass/80 bg-charcoal text-brass shadow-lg transition-transform hover:scale-105 hover:bg-charcoal/95 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-bone"
        aria-label="Open booking assistant"
      >
        <ChatBubbleIcon className="h-8 w-8" />
        <span
          className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-burgundy text-[10px] font-bold text-bone ring-2 ring-bone"
          aria-hidden
        >
          1
        </span>
      </button>
    </div>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-1" aria-label="Loading">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-charcoal/40 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-charcoal/40 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-charcoal/40 [animation-delay:300ms]" />
    </span>
  );
}

function ChipButton({
  children,
  onClick,
  disabled = false,
  selected = false,
  analyticsLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
  analyticsLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-analytics-label={analyticsLabel}
      className={`min-h-[48px] rounded-full border px-4 py-3 text-sm font-medium transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? "border-brass bg-brass text-bone shadow-sm"
          : "border-brass/40 bg-bone text-charcoal hover:border-brass hover:bg-brass/10"
      }`}
    >
      {children}
    </button>
  );
}

function ChipGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2 pt-1">{children}</div>;
}

export function BookingChatbot() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>("service");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selections, setSelections] = useState<Selections>({
    service: null,
    date: null,
    displayDay: null,
    time: null,
    displayTime: null,
    phone: null,
  });
  const [dayOptions, setDayOptions] = useState<DayOption[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingDays, setLoadingDays] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [otherInput, setOtherInput] = useState("");
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [showTeaser, setShowTeaser] = useState(true);
  const [teaserDismissed, setTeaserDismissed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const teaserTimerRef = useRef<number | null>(null);
  const autoHideTimerRef = useRef<number | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const addAssistantMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, { role: "assistant", content }]);
    setLiveAnnouncement(content);
  }, []);

  const addUserMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, { role: "user", content }]);
  }, []);

  const fetchDayOptions = useCallback(async () => {
    setLoadingDays(true);
    setError(null);
    try {
      const res = await fetch("/api/availability?upcomingDays=3");
      const data = await parseJsonResponse<{ days?: DayOption[]; error?: string }>(res);
      if (!res.ok) throw new Error(data?.error ?? "Could not load days.");
      if (!data) throw new Error("Could not load days.");
      setDayOptions(data.days ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load days.");
    } finally {
      setLoadingDays(false);
    }
  }, []);

  const fetchTimeSlots = useCallback(async (date: string) => {
    setLoadingTimes(true);
    setError(null);
    try {
      const res = await fetch(`/api/availability?date=${encodeURIComponent(date)}`);
      const data = await parseJsonResponse<{ slots?: TimeSlot[]; error?: string }>(res);
      if (!res.ok) throw new Error(data?.error ?? "Could not load times.");
      if (!data) throw new Error("Could not load times.");
      setTimeSlots(data.slots ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load times.");
    } finally {
      setLoadingTimes(false);
    }
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      addAssistantMessage(PROMPTS.service);
    }
  }, [open, messages.length, addAssistantMessage]);

  useEffect(() => {
    if (open) {
      setShowTeaser(false);
      return;
    }

    if (!teaserDismissed) {
      setShowTeaser(true);
      autoHideTimerRef.current = window.setTimeout(() => {
        setShowTeaser(false);
      }, TEASER_AUTO_SHOW_MS);
    }

    return () => {
      if (autoHideTimerRef.current) {
        window.clearTimeout(autoHideTimerRef.current);
      }
    };
  }, [open, teaserDismissed]);

  useEffect(() => {
    if (open) return;

    let lastScrollY = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - lastScrollY) < 60) return;
      lastScrollY = window.scrollY;
      if (teaserDismissed) {
        setTeaserDismissed(false);
        setShowTeaser(true);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open, teaserDismissed]);

  useEffect(() => {
    return () => {
      if (teaserTimerRef.current) window.clearTimeout(teaserTimerRef.current);
      if (autoHideTimerRef.current) window.clearTimeout(autoHideTimerRef.current);
    };
  }, []);

  const dismissTeaser = useCallback(() => {
    setShowTeaser(false);
    setTeaserDismissed(true);
    if (teaserTimerRef.current) window.clearTimeout(teaserTimerRef.current);
    teaserTimerRef.current = window.setTimeout(() => {
      setTeaserDismissed(false);
      setShowTeaser(true);
    }, TEASER_REAPPEAR_MS);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingDays, loadingTimes, submitting, receipt, step, scrollToBottom]);

  useEffect(() => {
    if (open && step === "phone") {
      const timer = window.setTimeout(() => phoneRef.current?.focus(), 150);
      return () => window.clearTimeout(timer);
    }
  }, [open, step]);

  const handleClose = useCallback(() => {
    setOpen(false);
    previouslyFocusedRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const elements = Array.from(focusable).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null,
      );
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
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  const handleSelectService = (label: string) => {
    addUserMessage(label);
    setSelections((prev) => ({ ...prev, service: label }));
    setStep("day");
    addAssistantMessage(PROMPTS.day);
    void fetchDayOptions();
  };

  const handleSelectDay = (day: DayOption) => {
    if (day.availableCount === 0) return;
    addUserMessage(day.label);
    setSelections((prev) => ({
      ...prev,
      date: day.date,
      displayDay: day.label,
    }));
    setStep("time");
    addAssistantMessage(PROMPTS.time);
    void fetchTimeSlots(day.date);
  };

  const handleSelectTime = (slot: TimeSlot) => {
    addUserMessage(slot.displayTime);
    setSelections((prev) => ({
      ...prev,
      time: slot.displayTime,
      displayTime: slot.displayTime,
    }));
    setStep("phone");
    addAssistantMessage(PROMPTS.phone);
  };

  const submitBooking = async (phoneRaw: string) => {
    const e164 = normalizePhoneE164(phoneRaw);
    if (!e164) {
      setError("Please enter a valid 10-digit US phone number.");
      return;
    }

    const phone = formatPhoneDisplay(phoneRaw);
    const { service, displayDay, displayTime, date } = selections;
    if (!service || !displayDay || !displayTime || !date) return;

    setSubmitting(true);
    setError(null);
    addUserMessage(phone);

    try {
      const res = await fetch("/api/appointment-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          preferredDay: displayDay,
          preferredTime: displayTime,
          slotDate: date,
          name: "Guest",
          phone,
        }),
      });

      const data = await parseJsonResponse<{
        receipt?: ReceiptData;
        error?: string;
      }>(res);

      if (!res.ok) {
        throw new Error(
          data?.error ??
            (res.status >= 500
              ? "Booking is temporarily unavailable. Please call us to schedule."
              : "Could not complete booking."),
        );
      }

      if (!data?.receipt) {
        throw new Error("Could not complete booking. Please try again or call us.");
      }

      setReceipt(data.receipt);
      setStep("done");
      setSelections((prev) => ({ ...prev, phone }));
      track("booking_submitted", { service });
      const confirmation = "You're all set. Here's your confirmation.";
      addAssistantMessage(confirmation);
      setLiveAnnouncement(receiptAnnouncement(data.receipt));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      addAssistantMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || step !== "phone") return;
    void submitBooking(phoneInput);
  };

  const handleOtherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = otherInput.trim();
    if (!text) return;
    addUserMessage(text);
    setOtherInput("");
    addAssistantMessage(
      `For anything outside a regular haircut or haircut and beard, give us a call at ${SITE.phone} or book on Booksy.`,
    );
  };

  const handleOpen = () => {
    setShowTeaser(false);
    setOpen(true);
  };

  const showServiceChips = step === "service" && !receipt;
  const showDayChips = step === "day" && !receipt;
  const showTimeChips = step === "time" && !receipt;
  const showPhoneInput = step === "phone" && !receipt;

  return (
    <>
      {!open && (
        <BookingFab
          onOpen={handleOpen}
          onDismissTeaser={dismissTeaser}
          showTeaser={showTeaser}
          triggerRef={triggerRef}
        />
      )}

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      {open && (
        <div
          ref={dialogRef}
          className="fixed bottom-24 left-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-charcoal/10 bg-bone shadow-2xl md:bottom-6 md:left-auto md:right-6 md:w-[420px] md:max-w-[420px] md:translate-x-0"
          style={{ maxHeight: "min(40rem, calc(100dvh - 5rem))" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-chat-title"
        >
          <header className="flex items-center justify-between border-b border-charcoal/10 bg-charcoal px-4 py-3">
            <div>
              <p id="booking-chat-title" className="font-serif text-base font-semibold text-bone">
                Book Your Visit
              </p>
              <p className="text-xs text-bone/60">The Barber Lounge · Antioch, CA</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-2 text-bone/70 transition-colors hover:bg-bone/10 hover:text-bone"
              aria-label="Close booking assistant"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-md bg-charcoal text-bone"
                        : "rounded-bl-md border border-charcoal/10 bg-bone text-charcoal"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {showServiceChips && (
                <ChipGroup>
                  {WIZARD_SERVICES.map((svc) => (
                    <ChipButton
                      key={svc.id}
                      onClick={() => handleSelectService(svc.label)}
                      analyticsLabel={`Wizard: ${svc.label}`}
                    >
                      {svc.label}
                    </ChipButton>
                  ))}
                </ChipGroup>
              )}

              {showDayChips && (
                <>
                  {loadingDays ? (
                    <div className="flex items-center gap-2 pt-1 text-xs text-charcoal/50">
                      <LoadingDots />
                      Checking availability…
                    </div>
                  ) : (
                    <ChipGroup>
                      {dayOptions.map((day) => (
                        <ChipButton
                          key={day.date}
                          onClick={() => handleSelectDay(day)}
                          disabled={day.availableCount === 0}
                          analyticsLabel={`Wizard: ${day.label}`}
                        >
                          {day.label}
                          {day.availableCount === 0 ? " · Full" : ""}
                        </ChipButton>
                      ))}
                    </ChipGroup>
                  )}
                </>
              )}

              {showTimeChips && (
                <>
                  {loadingTimes ? (
                    <div className="flex items-center gap-2 pt-1 text-xs text-charcoal/50">
                      <LoadingDots />
                      Loading times…
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <p className="pt-1 text-xs text-charcoal/55">
                      No open times that day. Pick another day or call us at{" "}
                      <a href={`tel:${SITE.phoneTel}`} className="text-brass-dark hover:underline">
                        {SITE.phone}
                      </a>
                      .
                    </p>
                  ) : (
                    <ChipGroup>
                      {timeSlots.map((slot) => (
                        <ChipButton
                          key={`${slot.date}-${slot.hour}`}
                          onClick={() => handleSelectTime(slot)}
                          analyticsLabel={`Wizard: ${slot.displayTime}`}
                        >
                          {slot.displayTime}
                        </ChipButton>
                      ))}
                    </ChipGroup>
                  )}
                </>
              )}

              {submitting && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-charcoal/10 bg-bone px-3.5 py-2.5 text-xs text-charcoal/60">
                    Confirming your appointment…
                  </div>
                </div>
              )}

              {receipt && (
                <div className="py-2">
                  <BookingReceipt receipt={receipt} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-charcoal/10 px-4 py-2 text-center">
            <p className="text-xs text-charcoal/60">
              Prefer to talk?{" "}
              <a href={`tel:${SITE.phoneTel}`} className="text-brass-dark hover:underline">
                {SITE.phone}
              </a>
            </p>
          </div>

          {showPhoneInput && (
            <form onSubmit={handlePhoneSubmit} className="border-t border-charcoal/10 p-3">
              {error && (
                <p className="mb-2 text-xs text-burgundy" role="alert">
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <input
                  ref={phoneRef}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="(925) 555-1234"
                  disabled={submitting}
                  className="min-w-0 flex-1 rounded-full border border-charcoal/15 bg-bone px-4 py-2.5 text-base text-charcoal placeholder:text-charcoal/50 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass disabled:opacity-60"
                  aria-label="Phone number"
                />
                <button
                  type="submit"
                  disabled={submitting || !phoneInput.trim()}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-charcoal text-bone transition-colors hover:bg-charcoal/90 disabled:opacity-40"
                  aria-label="Submit phone number"
                >
                  <SendIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          )}

          {!receipt && step !== "phone" && (
            <form onSubmit={handleOtherSubmit} className="border-t border-charcoal/10 p-3">
              <p className="mb-2 text-[11px] text-charcoal/45">Something else?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otherInput}
                  onChange={(e) => setOtherInput(e.target.value)}
                  placeholder="Ask a question…"
                  className="min-w-0 flex-1 rounded-full border border-charcoal/10 bg-bone px-4 py-2 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-brass/50 focus:outline-none focus:ring-1 focus:ring-brass/50"
                  aria-label="Other question"
                />
                <button
                  type="submit"
                  disabled={!otherInput.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-charcoal/15 text-charcoal/60 transition-colors hover:border-charcoal/30 disabled:opacity-40"
                  aria-label="Send question"
                >
                  <SendIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-charcoal/40">
                Or{" "}
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brass-dark hover:underline"
                >
                  book on Booksy
                </a>
              </p>
            </form>
          )}
        </div>
      )}
    </>
  );
}
