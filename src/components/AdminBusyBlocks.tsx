"use client";

import { useCallback, useEffect, useState } from "react";

import {
  STAFF_BUSY_PRESETS,
  shopBooksyUrl,
  type StaffBusyPreset,
} from "@/lib/busy-blocks";
import { formatDisplayTime } from "@/lib/booking-agent/format";

type ScheduleSlot = {
  date: string;
  hour: number;
  displayTime: string;
  blocked: boolean;
  blockedScope?: "barber" | "shop" | null;
  appointment: { confirmationCode: string; name: string; service: string } | null;
};

type BusyBlocksProps = {
  authRequired: boolean;
  initialKey?: string;
};

type BarberSelection = StaffBusyPreset | { name: "Shop-wide"; booksyStafferId: null; booksyUrl: string; handle: null };

const SHOP_WIDE_OPTION: BarberSelection = {
  name: "Shop-wide",
  handle: null,
  booksyStafferId: null,
  booksyUrl: shopBooksyUrl(),
};

function todayIsoLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function adminHeaders(authRequired: boolean, key: string): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (authRequired && key.trim()) {
    headers["x-admin-key"] = key.trim();
  }
  return headers;
}

export function AdminBusyBlocks({ authRequired, initialKey = "" }: BusyBlocksProps) {
  const [key, setKey] = useState(initialKey);
  const [date, setDate] = useState(todayIsoLocal);
  const [barber, setBarber] = useState<BarberSelection>(
    STAFF_BUSY_PRESETS[0] ?? SHOP_WIDE_OPTION,
  );
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [paste, setPaste] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(!authRequired);

  const barberQuery =
    barber.booksyStafferId == null ? "" : `&barber=${encodeURIComponent(barber.name)}`;
  const barberPayload =
    barber.booksyStafferId == null ? undefined : barber.name;

  const loadDay = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments?date=${encodeURIComponent(date)}${barberQuery}`, {
        headers: adminHeaders(authRequired, key),
        cache: "no-store",
        credentials: "include",
      });
      const data = (await res.json()) as {
        schedule?: ScheduleSlot[];
        error?: string;
      };
      if (res.status === 401) {
        setUnlocked(false);
        throw new Error("Enter admin key to manage busy blocks.");
      }
      if (!res.ok) throw new Error(data.error ?? "Could not load schedule.");
      setSchedule(data.schedule ?? []);
      setUnlocked(true);
    } catch (err) {
      setSchedule([]);
      setError(err instanceof Error ? err.message : "Could not load schedule.");
    } finally {
      setLoading(false);
    }
  }, [authRequired, barberQuery, date, key]);

  useEffect(() => {
    if (!authRequired || unlocked || key.trim()) {
      void loadDay();
    }
  }, [authRequired, unlocked, key, loadDay]);

  const patch = async (body: Record<string, unknown>) => {
    setSaving(true);
    setError(null);
    setNote(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: adminHeaders(authRequired, key),
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        error?: string;
        blockedHours?: number[];
        added?: number[];
        removed?: number[];
        unmatched?: string[];
        blocked?: boolean;
        barberName?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Update failed.");
      if (Array.isArray(data.blockedHours)) {
        const unmatched =
          data.unmatched && data.unmatched.length > 0
            ? ` Unmatched: ${data.unmatched.join(", ")}.`
            : "";
        const scope = data.barberName ? data.barberName : "shop-wide";
        setNote(
          `${scope}: blocked ${data.blockedHours.map((h) => formatDisplayTime(h)).join(", ") || "none"}.${unmatched}`,
        );
      } else if (typeof data.blocked === "boolean") {
        setNote(data.blocked ? "Hour blocked." : "Hour opened.");
      }
      await loadDay();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const toggleHour = (hour: number) => {
    void patch({
      action: "toggle-block",
      date,
      hour,
      barber: barberPayload,
    });
  };

  const applyPaste = (mode: "add" | "replace") => {
    if (!paste.trim()) {
      setError("Paste busy times first — e.g. 10am-1pm, 3pm");
      return;
    }
    void patch({
      action: "paste-busy",
      date,
      text: paste,
      mode,
      barber: barberPayload,
    });
  };

  const clearDay = () => {
    void patch({
      action: "set-blocks",
      date,
      hours: [],
      mode: "replace",
      barber: barberPayload,
    });
  };

  const blockAllOpen = () => {
    const hours = schedule.filter((s) => !s.appointment).map((s) => s.hour);
    void patch({
      action: "set-blocks",
      date,
      hours,
      mode: "replace",
      barber: barberPayload,
    });
  };

  return (
    <div className="mt-8 space-y-5">
      {authRequired && !unlocked ? (
        <div className="rounded-2xl border border-charcoal/10 bg-white p-4">
          <label htmlFor="busy-admin-key" className="block text-sm font-medium text-charcoal">
            Admin key
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="busy-admin-key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full rounded-lg border border-charcoal/20 px-3 py-2.5 text-sm"
              placeholder="Paste ADMIN_UPLOAD_KEY"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => void loadDay()}
              disabled={loading}
              className="rounded-lg bg-charcoal px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-bone disabled:opacity-60"
            >
              {loading ? "Loading…" : "Unlock"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-brass/40 bg-charcoal px-4 py-4 text-bone sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-brass">
          Shop-wide Booksy mirror
        </p>
        <p className="mt-2 text-sm text-bone/75">
          Live Booksy sync is primary. Use paste when you need a manual hold, or if{" "}
          <strong>Booksy live sync</strong> shows No. When <strong>any</strong> barber fills chairs on
          Booksy, select them below and block those hours so{" "}
          <a href="/book" className="text-brass underline-offset-2 hover:underline">
            /book
          </a>{" "}
          stops offering that chair.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {barber.booksyStafferId ? (
            <a
              href={barber.booksyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-brass px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal"
            >
              Open {barber.name.split(" ")[0]} on Booksy →
            </a>
          ) : null}
          <a
            href={shopBooksyUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-bone/30 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-bone"
          >
            Shop Booksy
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-charcoal/10 bg-white p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-charcoal">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-charcoal/20 px-3 py-2.5 text-sm"
            />
          </label>
          <fieldset>
            <legend className="text-sm font-medium text-charcoal">Barber / scope</legend>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setBarber(SHOP_WIDE_OPTION)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  barber.booksyStafferId == null
                    ? "border-charcoal bg-charcoal text-bone"
                    : "border-charcoal/20 text-charcoal hover:border-brass"
                }`}
              >
                Shop-wide
              </button>
              {STAFF_BUSY_PRESETS.map((staff) => {
                const selected = barber.booksyStafferId === staff.booksyStafferId;
                return (
                  <button
                    key={staff.booksyStafferId}
                    type="button"
                    onClick={() => setBarber(staff)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                      selected
                        ? "border-charcoal bg-charcoal text-bone"
                        : "border-charcoal/20 text-charcoal hover:border-brass"
                    }`}
                  >
                    {staff.name.split(" ")[0]}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-charcoal/50">
              Per-barber blocks only hide when that barber is selected on /book. Shop-wide hides
              for everyone.
            </p>
          </fieldset>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-charcoal">
              Tap hours to block / open
              {barber.booksyStafferId ? ` · ${barber.name.split(" ")[0]}` : " · shop-wide"}
            </p>
            <button
              type="button"
              onClick={() => void loadDay()}
              className="text-xs font-semibold uppercase tracking-wide text-charcoal/50 hover:text-charcoal"
            >
              Reload
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-charcoal/50">Loading schedule…</p>
          ) : schedule.length === 0 ? (
            <p className="text-sm text-charcoal/50">No shop hours that day (closed).</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {schedule.map((slot) => {
                const taken = Boolean(slot.appointment);
                return (
                  <button
                    key={slot.hour}
                    type="button"
                    disabled={saving || taken}
                    onClick={() => toggleHour(slot.hour)}
                    className={`rounded-xl border px-2 py-3 text-center text-sm font-medium transition disabled:cursor-not-allowed ${
                      taken
                        ? "border-charcoal/10 bg-charcoal/5 text-charcoal/40"
                        : slot.blocked
                          ? "border-burgundy/40 bg-burgundy/10 text-burgundy"
                          : "border-charcoal/15 bg-bone text-charcoal hover:border-brass"
                    }`}
                  >
                    <span className="block">{slot.displayTime}</span>
                    <span className="mt-0.5 block text-[10px] uppercase tracking-wide opacity-70">
                      {taken
                        ? "Web booked"
                        : slot.blocked
                          ? slot.blockedScope === "shop"
                            ? "Shop busy"
                            : "Busy"
                          : "Open"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving || schedule.length === 0}
              onClick={blockAllOpen}
              className="rounded-full border border-charcoal/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal disabled:opacity-50"
            >
              Block all open
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={clearDay}
              className="rounded-full border border-charcoal/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal disabled:opacity-50"
            >
              Clear this scope
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-charcoal/10 pt-5">
          <label htmlFor="busy-paste" className="block text-sm font-medium text-charcoal">
            Paste busy times (phone-fast)
          </label>
          <p className="mt-1 text-xs text-charcoal/50">
            Examples: <code className="text-[11px]">10am-1pm, 3pm, 5-6</code> · or paste an ICS
            export if Zapier/Make/Google dumps one.
          </p>
          <textarea
            id="busy-paste"
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-lg border border-charcoal/20 px-3 py-2.5 text-sm"
            placeholder="10am-12pm, 2pm, 4-6pm"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => applyPaste("add")}
              className="rounded-full bg-charcoal px-4 py-2 text-xs font-semibold uppercase tracking-wide text-bone disabled:opacity-50"
            >
              {saving ? "Saving…" : "Add blocks"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => applyPaste("replace")}
              className="rounded-full border border-charcoal/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-charcoal disabled:opacity-50"
            >
              Replace this scope
            </button>
          </div>
        </div>
      </div>

      {note ? (
        <p className="rounded-xl border border-brass/30 bg-brass/10 px-4 py-3 text-sm text-charcoal">
          {note}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-xl border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-sm text-burgundy">
          {error}
        </p>
      ) : null}
    </div>
  );
}
