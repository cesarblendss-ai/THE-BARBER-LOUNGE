"use client";

import { track } from "@vercel/analytics";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { BookingReceipt, type ReceiptData } from "@/components/BookingReceipt";
import { PhoneIcon } from "@/components/icons";
import { getBooksyStafferUrl } from "@/lib/booksy";
import {
  ABOUT,
  BOOKABLE_SERVICES,
  BOOKING_URL,
  SITE,
  teamAvatarPath,
  type TeamMember,
} from "@/lib/content";
import { LOGO } from "@/lib/constants";
import { formatPhoneDisplay, normalizePhoneE164 } from "@/lib/sms-receipt";

type WizardStep = 1 | 2 | 3 | 4;

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

type ServiceOption = (typeof BOOKABLE_SERVICES)[number] & {
  id: string;
  /** Customer-facing label (Booksy / Tim UI). Submitted on booking. */
  displayName: string;
};

const SERVICES: ServiceOption[] = BOOKABLE_SERVICES.map((svc, index) => ({
  ...svc,
  id: index === 0 ? "signature-haircut" : "haircut-beard",
  displayName: index === 0 ? "Signature Haircut" : "Haircut & Beard",
}));

const ANY_BARBER = {
  name: "Any available",
  handle: null,
  booksyStafferId: null,
} as const satisfies TeamMember;

const STEP_TITLES: Record<WizardStep, string> = {
  1: "Choose Your Service",
  2: "Choose Your Barber",
  3: "Pick a Day & Time",
  4: "Your Details",
};

async function parseJsonResponse<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M19.5 13.2A7.5 7.5 0 0 1 10.8 4.5 7.6 7.6 0 1 0 19.5 13.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const BOOK_NAV = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "Barbers" },
  { href: "/testimonials", label: "Reviews" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

/** Client poll while picking day/time — keeps slots from going stale between cron passes. */
const AVAILABILITY_POLL_MS = 2 * 60 * 1000;

function formatSyncedAgo(iso: string | null): string | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  return hours === 1 ? "1 hr ago" : `${hours} hr ago`;
}

export function TimBookWizard() {
  const [step, setStep] = useState<WizardStep>(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [barberName, setBarberName] = useState<string | null>(null);
  const [day, setDay] = useState<DayOption | null>(null);
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [dayOptions, setDayOptions] = useState<DayOption[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingDays, setLoadingDays] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const selectedService = useMemo(
    () => SERVICES.find((s) => s.id === serviceId) ?? null,
    [serviceId],
  );

  const barbers: TeamMember[] = useMemo(() => [ANY_BARBER, ...ABOUT.team], []);

  const selectedBarber = useMemo(
    () => barbers.find((b) => b.name === barberName) ?? null,
    [barbers, barberName],
  );

  const booksyFallbackHref = useMemo(() => {
    if (selectedBarber?.booksyStafferId) {
      return getBooksyStafferUrl(selectedBarber.booksyStafferId);
    }
    return BOOKING_URL;
  }, [selectedBarber]);

  const fetchDays = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoadingDays(true);
    setError(null);
    try {
      const res = await fetch("/api/availability?upcomingDays=7", { cache: "no-store" });
      const data = await parseJsonResponse<{
        days?: DayOption[];
        error?: string;
        lastSyncedAt?: string;
      }>(res);
      if (!res.ok) throw new Error(data?.error ?? "Could not load days.");
      const days = data?.days ?? [];
      setDayOptions(days);
      if (data?.lastSyncedAt) setLastSyncedAt(data.lastSyncedAt);
      if (days.length === 0) {
        setError("No open days in the next week — call us to schedule.");
      }
    } catch (err) {
      setDayOptions([]);
      setError(err instanceof Error ? err.message : "Could not load days.");
    } finally {
      if (!opts?.silent) setLoadingDays(false);
    }
  }, []);

  const fetchTimes = useCallback(async (date: string, opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoadingTimes(true);
    setError(null);
    try {
      const res = await fetch(`/api/availability?date=${encodeURIComponent(date)}`, {
        cache: "no-store",
      });
      const data = await parseJsonResponse<{
        slots?: TimeSlot[];
        error?: string;
        lastSyncedAt?: string;
      }>(res);
      if (!res.ok) throw new Error(data?.error ?? "Could not load times.");
      setTimeSlots(data?.slots ?? []);
      if (data?.lastSyncedAt) setLastSyncedAt(data.lastSyncedAt);
    } catch (err) {
      setTimeSlots([]);
      setError(err instanceof Error ? err.message : "Could not load times.");
    } finally {
      if (!opts?.silent) setLoadingTimes(false);
    }
  }, []);

  useEffect(() => {
    if (step === 3) {
      void fetchDays();
    }
  }, [step, fetchDays]);

  // Keep day/time fresh while the customer is on step 3 (cron is every 10 min; poll faster).
  useEffect(() => {
    if (step !== 3 || receipt) return;
    const id = window.setInterval(() => {
      void fetchDays({ silent: true }).then(() => {
        if (day?.date) void fetchTimes(day.date, { silent: true });
      });
    }, AVAILABILITY_POLL_MS);
    return () => window.clearInterval(id);
  }, [step, receipt, day?.date, fetchDays, fetchTimes]);

  useEffect(() => {
    if (step >= 2) {
      const card = document.getElementById("booking-card");
      card?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(serviceId);
    if (step === 2) return Boolean(barberName);
    if (step === 3) return Boolean(day && slot);
    if (step === 4) return name.trim().length >= 2 && Boolean(normalizePhoneE164(phone));
    return false;
  }, [step, serviceId, barberName, day, slot, name, phone]);

  const goNext = () => {
    if (!canContinue) return;
    setError(null);
    if (step < 4) setStep((s) => (s + 1) as WizardStep);
  };

  const goBack = () => {
    setError(null);
    if (step > 1) setStep((s) => (s - 1) as WizardStep);
  };

  const selectService = (id: string) => {
    setServiceId(id);
    setError(null);
  };

  const selectBarber = (nameValue: string) => {
    setBarberName(nameValue);
    setError(null);
  };

  const submitBooking = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedService || !day || !slot || submitting) return;

    const e164 = normalizePhoneE164(phone);
    if (!e164) {
      setError("Please enter a valid 10-digit US phone number.");
      return;
    }

    const displayPhone = formatPhoneDisplay(phone);
    const displayName = name.trim();
    const serviceLabel =
      barberName && barberName !== ANY_BARBER.name
        ? `${selectedService.displayName} with ${barberName}`
        : selectedService.displayName;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/appointment-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: serviceLabel,
          preferredDay: day.dayName,
          preferredTime: slot.displayTime,
          slotDate: day.date,
          name: displayName,
          phone: displayPhone,
        }),
      });

      const data = await parseJsonResponse<{ receipt?: ReceiptData; error?: string }>(res);
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
      track("booking_submitted", {
        service: selectedService.displayName,
        source: "tim_book_ui",
      });

      // CRM / opt-in hook — campaigns stay Phase 2 until Twilio KYC; still store the preference.
      if (smsOptIn || emailOptIn) {
        void fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: displayName,
            phone: displayPhone,
            service: selectedService.displayName,
            source: "tim_book_ui",
            intent: "opt_in",
            smsOptIn,
            emailOptIn,
            notes: `Booked via /book · ${serviceLabel} · ${day.dayName} ${slot.displayTime}`,
          }),
        }).catch(() => {
          /* booking already succeeded — opt-in is best-effort */
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const callNowLink = (
    <a
      href={`tel:${SITE.phoneTel}`}
      data-analytics-label="Call Now (tim book)"
      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-[13px] font-semibold text-white/90 transition hover:border-white/35 hover:text-white"
    >
      <PhoneIcon className="h-4 w-4 stroke-current" />
      Call Now
    </a>
  );

  return (
    <div className="tim-book min-h-screen bg-black text-white">
      {/* Header — Tim Cho mock + Call Now */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Image
              src={LOGO.src}
              alt={LOGO.alt}
              width={180}
              height={59}
              priority
              className="h-8 w-auto object-contain brightness-0 invert sm:h-9"
            />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Booking navigation">
            {BOOK_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium text-white/90 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <div
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1"
              aria-label="Language"
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white">
                <span aria-hidden>🇺🇸</span> EN
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-white/45">
                <span aria-hidden>🇪🇸</span> ES
              </span>
            </div>
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70"
              title="Dark theme"
            >
              <MoonIcon className="h-4 w-4" />
            </span>
            {callNowLink}
            <a
              href="#booking-card"
              data-analytics-label="Book Now (tim book header)"
              className="tim-gold-btn inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold text-[#1a140c] shadow-[0_8px_24px_rgba(176,141,87,0.28)] transition hover:brightness-110"
            >
              <CalendarIcon className="h-4 w-4" />
              Book Now
            </a>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={`tel:${SITE.phoneTel}`}
              data-analytics-label="Call Now (tim book mobile header)"
              aria-label={`Call The Barber Lounge at ${SITE.phone}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white"
            >
              <PhoneIcon className="h-4 w-4 stroke-current" />
            </a>
            <button
              type="button"
              className="rounded-md p-2 text-white"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="block text-xl leading-none">{mobileOpen ? "×" : "☰"}</span>
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <nav
            className="border-t border-white/10 px-5 py-4 lg:hidden"
            aria-label="Mobile booking navigation"
          >
            <ul className="flex flex-col gap-3">
              {BOOK_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block text-sm text-white/80"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`tel:${SITE.phoneTel}`}
                  className="block text-sm font-semibold text-[#C9A86C]"
                  onClick={() => setMobileOpen(false)}
                >
                  Call Now · {SITE.phone}
                </a>
              </li>
            </ul>
          </nav>
        ) : null}
      </header>

      <div className="mx-auto max-w-[1180px] px-5 pb-28 pt-8 sm:px-8 sm:pt-10 lg:pb-16">
        {/* Hero */}
        <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
          <div className="animate-[tim-fade-up_0.7s_ease-out_both]">
            <p className="text-[13px] text-white/45">
              <Link href="/" className="transition hover:text-white/70">
                Home
              </Link>
              <span className="mx-1.5">/</span>
              <span className="text-white/70">Book Now</span>
            </p>

            <span className="tim-gold-pill mt-6 inline-flex rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1a140c]">
              Online Booking
            </span>

            <h1 className="mt-5 font-sans text-[clamp(2.6rem,6vw,4.25rem)] font-bold leading-[0.95] tracking-[-0.03em]">
              BOOK YOUR <span className="tim-gold-text">CUT.</span>
            </h1>

            <p className="mt-4 text-[15px] text-white/55 sm:text-base">
              Four steps. Pay in the shop.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#booking-card"
                className="tim-gold-btn inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold text-[#1a140c] transition hover:brightness-110"
              >
                Start booking
              </a>
              {callNowLink}
            </div>
          </div>

          <div className="relative animate-[tim-fade-up_0.85s_ease-out_0.08s_both]">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[28px] sm:rounded-[36px] lg:aspect-[4/3]">
              <Image
                src="/gallery/skin-fade-closeup.png"
                alt="Fresh fade haircut at The Barber Lounge"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover object-[42%_28%]"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black via-black/40 to-transparent" />
            </div>
          </div>
        </section>

        {/* Booking card */}
        <section
          id="booking-card"
          className="mt-10 animate-[tim-fade-up_0.8s_ease-out_0.12s_both] scroll-mt-24 rounded-[28px] border border-white/[0.07] bg-[#121212] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:mt-12 sm:rounded-[32px] sm:p-8"
          aria-labelledby="booking-step-title"
        >
          {receipt ? (
            <div className="mx-auto max-w-md py-4">
              <p className="mb-4 text-center text-[12px] font-semibold uppercase tracking-[0.18em] text-[#C9A86C]">
                Request received
              </p>
              <BookingReceipt receipt={receipt} />
              <div className="mt-5 flex flex-col items-center gap-3 text-center text-sm text-white/55">
                <p>
                  We&apos;ll confirm your time. Prefer Booksy?{" "}
                  <a
                    href={booksyFallbackHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C9A86C] underline-offset-2 hover:underline"
                  >
                    Open Booksy
                    {selectedBarber?.booksyStafferId && selectedBarber.name !== ANY_BARBER.name
                      ? ` with ${selectedBarber.name.split(" ")[0]}`
                      : ""}
                  </a>
                </p>
                <a
                  href={`tel:${SITE.phoneTel}`}
                  data-analytics-label="Call Now (tim book receipt)"
                  className="tim-gold-btn inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold text-[#1a140c] transition hover:brightness-110"
                >
                  <PhoneIcon className="h-4 w-4 stroke-current" />
                  Call Now · {SITE.phone}
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#C9A86C]">
                  Step {step} of 4
                </p>
                <h2
                  id="booking-step-title"
                  className="mt-2 text-[1.65rem] font-semibold tracking-tight text-white sm:text-[1.85rem]"
                >
                  {STEP_TITLES[step]}
                </h2>
                <div className="tim-gold-rule mt-4 h-px w-full" />
              </div>

              {step === 1 ? (
                <div
                  className="grid gap-3 sm:grid-cols-2"
                  role="radiogroup"
                  aria-label="Choose your service"
                >
                  {SERVICES.map((svc) => {
                    const selected = serviceId === svc.id;
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => selectService(svc.id)}
                        onDoubleClick={() => {
                          selectService(svc.id);
                          setStep(2);
                        }}
                        className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition sm:px-5 sm:py-5 ${
                          selected
                            ? "border-[#C9A86C]/70 bg-[#C9A86C]/10"
                            : "border-white/[0.08] bg-[#171717] hover:border-white/20"
                        }`}
                      >
                        <span>
                          <span className="block text-[15px] font-semibold text-white sm:text-base">
                            {svc.displayName}
                          </span>
                          <span className="mt-1 block text-[12px] text-white/45 sm:text-[13px]">
                            {svc.time} · {svc.description.split(",")[0]}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-3">
                          <span className="text-lg font-semibold text-white sm:text-xl">
                            {svc.price}
                          </span>
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                              selected
                                ? "border-[#C9A86C] bg-[#C9A86C]"
                                : "border-white/35 bg-transparent"
                            }`}
                            aria-hidden
                          >
                            {selected ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-[#1a140c]" />
                            ) : null}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {step === 2 ? (
                <div
                  className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                  role="radiogroup"
                  aria-label="Choose your barber"
                >
                  {barbers.map((barber) => {
                    const selected = barberName === barber.name;
                    const handle = barber.handle?.replace(/^@/, "").trim() ?? null;
                    const avatarSrc = handle ? teamAvatarPath(handle) : null;
                    const booksyHref = barber.booksyStafferId
                      ? getBooksyStafferUrl(barber.booksyStafferId)
                      : null;

                    return (
                      <div
                        key={barber.name}
                        className={`rounded-2xl border transition ${
                          selected
                            ? "border-[#C9A86C]/70 bg-[#C9A86C]/10"
                            : "border-white/[0.08] bg-[#171717] hover:border-white/20"
                        }`}
                      >
                        <button
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => selectBarber(barber.name)}
                          onDoubleClick={() => {
                            selectBarber(barber.name);
                            setStep(3);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-4 text-left"
                        >
                          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white/50">
                            {avatarSrc ? (
                              <Image
                                src={avatarSrc}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              barber.name.slice(0, 1)
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] font-semibold text-white">
                              {barber.name}
                            </span>
                            <span className="mt-0.5 block truncate text-[12px] text-white/45">
                              {handle ? `@${handle}` : "First chair open"}
                            </span>
                          </span>
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              selected
                                ? "border-[#C9A86C] bg-[#C9A86C]"
                                : "border-white/35 bg-transparent"
                            }`}
                            aria-hidden
                          >
                            {selected ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-[#1a140c]" />
                            ) : null}
                          </span>
                        </button>
                        {booksyHref ? (
                          <div className="border-t border-white/[0.06] px-4 py-2.5">
                            <a
                              href={booksyHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-analytics-label={`Booksy staffer ${barber.name}`}
                              className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C9A86C]/90 transition hover:text-[#E8D5A3]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Booksy · {barber.name.split(" ")[0]} →
                            </a>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-6">
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/45">
                        Day
                      </p>
                      <div className="flex items-center gap-3">
                        {formatSyncedAgo(lastSyncedAt) ? (
                          <p className="text-[10px] uppercase tracking-[0.1em] text-white/30">
                            Calendar {formatSyncedAgo(lastSyncedAt)}
                          </p>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            void fetchDays().then(() => {
                              if (day?.date) void fetchTimes(day.date);
                            });
                          }}
                          className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40 transition hover:text-white/70"
                        >
                          Refresh
                        </button>
                      </div>
                    </div>
                    {loadingDays ? (
                      <p className="text-sm text-white/50">Loading days…</p>
                    ) : dayOptions.length === 0 ? (
                      <p className="text-sm text-white/50">
                        No open days right now.{" "}
                        <a href={`tel:${SITE.phoneTel}`} className="text-[#C9A86C]">
                          Call {SITE.phone}
                        </a>
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Choose a day">
                        {dayOptions.map((option) => {
                          const selected = day?.date === option.date;
                          const disabled = option.availableCount === 0;
                          return (
                            <button
                              key={option.date}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              disabled={disabled}
                              onClick={() => {
                                setDay(option);
                                setSlot(null);
                                void fetchTimes(option.date);
                              }}
                              className={`rounded-full border px-4 py-2.5 text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-35 ${
                                selected
                                  ? "border-[#C9A86C] bg-[#C9A86C]/15 text-white"
                                  : "border-white/10 bg-[#171717] text-white/80 hover:border-white/25"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/45">
                      Time
                    </p>
                    {!day ? (
                      <p className="text-sm text-white/50">Pick a day to see open times.</p>
                    ) : loadingTimes ? (
                      <p className="text-sm text-white/50">Loading times…</p>
                    ) : timeSlots.length === 0 ? (
                      <p className="text-sm text-white/50">No open times that day — try another.</p>
                    ) : (
                      <div
                        className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5"
                        role="radiogroup"
                        aria-label="Choose a time"
                      >
                        {timeSlots.map((option) => {
                          const selected = slot?.displayTime === option.displayTime;
                          return (
                            <button
                              key={`${option.date}-${option.hour}`}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => setSlot(option)}
                              className={`rounded-xl border px-3 py-3 text-[13px] font-medium transition ${
                                selected
                                  ? "border-[#C9A86C] bg-[#C9A86C]/15 text-white"
                                  : "border-white/10 bg-[#171717] text-white/80 hover:border-white/25"
                              }`}
                            >
                              {option.displayTime}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <form
                  id="tim-book-contact"
                  className="mx-auto max-w-lg space-y-4"
                  onSubmit={submitBooking}
                >
                  <div className="rounded-2xl border border-white/[0.08] bg-[#171717] px-4 py-4 text-sm text-white/60">
                    <p>
                      <span className="text-white/40">Service</span>{" "}
                      {selectedService?.displayName ?? "—"} · {selectedService?.price}
                    </p>
                    <p className="mt-1">
                      <span className="text-white/40">Barber</span> {barberName ?? "—"}
                    </p>
                    <p className="mt-1">
                      <span className="text-white/40">When</span> {day?.label ?? "—"} ·{" "}
                      {slot?.displayTime ?? "—"}
                    </p>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.14em] text-white/45">
                      Name
                    </span>
                    <input
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#0e0e0e] px-4 py-3.5 text-[15px] text-white outline-none transition focus:border-[#C9A86C]/70"
                      placeholder="Your name"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.14em] text-white/45">
                      Phone
                    </span>
                    <input
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#0e0e0e] px-4 py-3.5 text-[15px] text-white outline-none transition focus:border-[#C9A86C]/70"
                      placeholder="(925) 555-0100"
                    />
                  </label>

                  <fieldset className="space-y-2 rounded-xl border border-white/[0.08] bg-[#121212] px-4 py-3">
                    <legend className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                      Stay in the loop
                    </legend>
                    <label className="flex items-start gap-2.5 text-[13px] text-white/70">
                      <input
                        type="checkbox"
                        checked={smsOptIn}
                        onChange={(e) => setSmsOptIn(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-white/30 bg-black accent-[#C9A86C]"
                      />
                      <span>Text me about openings and seasonal cuts when texts are available.</span>
                    </label>
                    <label className="flex items-start gap-2.5 text-[13px] text-white/70">
                      <input
                        type="checkbox"
                        checked={emailOptIn}
                        onChange={(e) => setEmailOptIn(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-white/30 bg-black accent-[#C9A86C]"
                      />
                      <span>Email me offers and reminders.</span>
                    </label>
                  </fieldset>

                  <p className="text-[13px] text-white/45">
                    Pay in the shop. We&apos;ll call to confirm. Shop line:{" "}
                    <a href={`tel:${SITE.phoneTel}`} className="text-[#C9A86C]">
                      {SITE.phone}
                    </a>
                  </p>
                </form>
              ) : null}

              {error ? (
                <p className="mt-5 text-sm text-red-300" role="alert">
                  {error}{" "}
                  {error.toLowerCase().includes("call") ? null : (
                    <a href={`tel:${SITE.phoneTel}`} className="underline underline-offset-2">
                      Call Now
                    </a>
                  )}
                </p>
              ) : null}

              <div className="mt-8 flex items-center justify-between gap-3">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="rounded-full border border-white/15 px-5 py-2.5 text-[13px] font-medium text-white/75 transition hover:border-white/30 hover:text-white"
                  >
                    Back
                  </button>
                ) : (
                  <span />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canContinue}
                    className="tim-gold-btn ml-auto inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold text-[#1a140c] transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue <span aria-hidden>›</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="tim-book-contact"
                    disabled={!canContinue || submitting}
                    className="tim-gold-btn ml-auto inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold text-[#1a140c] transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {submitting ? "Sending…" : "Request appointment"}
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Mobile sticky Call Now — global sticky bar is hidden on /book */}
      <nav
        aria-label="Call the shop"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto flex max-w-lg gap-2">
          <a
            href={`tel:${SITE.phoneTel}`}
            aria-label={`Call The Barber Lounge at ${SITE.phone}`}
            data-analytics-label="Call Now (tim book sticky)"
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#C9A86C]/45 px-4 py-3.5 text-sm font-semibold text-[#E8D5A3] transition hover:bg-[#C9A86C]/10"
          >
            <PhoneIcon className="h-4 w-4 stroke-current" />
            Call Now
          </a>
          <a
            href="#booking-card"
            data-analytics-label="Book Now (tim book sticky)"
            className="tim-gold-btn flex flex-1 items-center justify-center rounded-full px-4 py-3.5 text-sm font-semibold text-[#1a140c] transition hover:brightness-110"
          >
            Book
          </a>
        </div>
      </nav>
    </div>
  );
}
