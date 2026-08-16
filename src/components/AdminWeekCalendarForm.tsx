"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatWeekRangeLabel, hourOptions, shiftWeekStart, type ShopWeek, type ShopWeekDay } from "@/lib/shop-week";
import type { ShopWeekView } from "@/lib/shop-week-view";

type AdminWeekCalendarFormProps = {
  initialView: ShopWeekView;
  authRequired: boolean;
  adminAuthenticated: boolean;
  initialKey?: string;
};

type SaveState = "idle" | "saving" | "success" | "error";

function cloneWeek(week: ShopWeek): ShopWeek {
  return {
    ...week,
    days: week.days.map((day) => ({
      ...day,
      blocks: day.blocks.map((block) => ({ ...block })),
    })),
  };
}

export function AdminWeekCalendarForm({
  initialView,
  authRequired,
  adminAuthenticated,
  initialKey = "",
}: AdminWeekCalendarFormProps) {
  const [week, setWeek] = useState<ShopWeek>(() => cloneWeek(initialView.week));
  const [authKey, setAuthKey] = useState(initialKey);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const hours = useMemo(() => hourOptions(), []);

  const needsKey = authRequired && !adminAuthenticated;

  async function loadWeek(weekStart: string) {
    setLoadingWeek(true);
    setMessage(null);
    setSaveState("idle");
    try {
      const response = await fetch(`/api/shop-week?week=${encodeURIComponent(weekStart)}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Could not load that week.");
      const payload = (await response.json()) as ShopWeekView;
      setWeek(cloneWeek(payload.week));
    } catch (error) {
      setSaveState("error");
      setMessage(error instanceof Error ? error.message : "Could not load that week.");
    } finally {
      setLoadingWeek(false);
    }
  }

  function updateDay(date: string, patch: Partial<ShopWeekDay>) {
    setWeek((current) => ({
      ...current,
      days: current.days.map((day) => {
        if (day.date !== date) return day;
        const next = { ...day, ...patch };
        if (next.status === "closed") {
          next.hours = "Closed";
          next.blocks = [];
        }
        return next;
      }),
    }));
    setSaveState("idle");
  }

  async function ensureAuthCookie(): Promise<boolean> {
    if (!authRequired) return true;
    if (adminAuthenticated && !authKey) return true;
    if (!authKey.trim()) {
      setSaveState("error");
      setMessage("Enter the admin key from .env.local or the Vercel dashboard.");
      return false;
    }

    const response = await fetch("/api/admin/edit-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ key: authKey.trim() }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? "Invalid admin key.");
    }
    return true;
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveState("saving");
    setMessage(null);

    try {
      const authed = await ensureAuthCookie();
      if (!authed) return;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authKey.trim()) headers["x-admin-key"] = authKey.trim();

      const response = await fetch(`/api/shop-week?week=${encodeURIComponent(week.weekStart)}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(week),
      });
      const payload = (await response.json().catch(() => null)) as
        | (ShopWeekView & { error?: string })
        | { error?: string }
        | null;
      if (!response.ok) {
        throw new Error(payload && "error" in payload ? payload.error : "Save failed.");
      }
      if (payload && "week" in payload) {
        setWeek(cloneWeek(payload.week));
      }
      setSaveState("success");
      setMessage("Week saved. Staff Hub will show this schedule.");
    } catch (error) {
      setSaveState("error");
      setMessage(error instanceof Error ? error.message : "Save failed.");
    }
  }

  async function handleUpload(file: File | null) {
    if (!file) return;
    setSaveState("saving");
    setMessage(null);
    try {
      const authed = await ensureAuthCookie();
      if (!authed) return;
      const body = new FormData();
      body.set("file", file);
      const headers: Record<string, string> = {};
      if (authKey.trim()) headers["x-admin-key"] = authKey.trim();

      const response = await fetch("/api/shop-week", {
        method: "POST",
        headers,
        credentials: "include",
        body,
      });
      const payload = (await response.json().catch(() => null)) as
        | (ShopWeekView & { error?: string })
        | { error?: string }
        | null;
      if (!response.ok) {
        throw new Error(payload && "error" in payload ? payload.error : "Upload failed.");
      }
      if (payload && "week" in payload) {
        setWeek(cloneWeek(payload.week));
      }
      setSaveState("success");
      setMessage("JSON uploaded and saved.");
    } catch (error) {
      setSaveState("error");
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  return (
    <form onSubmit={(event) => void handleSave(event)} className="mt-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-charcoal/10 bg-white px-4 py-3">
        <button
          type="button"
          className="rounded-full border border-charcoal/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal hover:border-brass"
          onClick={() => void loadWeek(shiftWeekStart(week.weekStart, -1))}
          disabled={loadingWeek}
        >
          Previous
        </button>
        <p className="font-serif text-lg font-semibold text-charcoal">
          {formatWeekRangeLabel(week.weekStart)}
        </p>
        <button
          type="button"
          className="rounded-full border border-charcoal/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal hover:border-brass"
          onClick={() => void loadWeek(shiftWeekStart(week.weekStart, 1))}
          disabled={loadingWeek}
        >
          Next
        </button>
      </div>

      {needsKey ? (
        <label className="block rounded-2xl border border-charcoal/10 bg-white p-4">
          <span className="text-sm font-medium text-charcoal">Admin key</span>
          <input
            type="password"
            value={authKey}
            onChange={(event) => setAuthKey(event.target.value)}
            placeholder="Enter ADMIN_UPLOAD_KEY"
            className="mt-2 w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none ring-brass/30 focus:ring-2"
            autoComplete="off"
            required
          />
          <p className="mt-2 text-xs text-charcoal/55">
            Same key as gallery and edit mode. Check <code>.env.local</code> or Vercel → Environment
            Variables. Never paste the value in chat.
          </p>
        </label>
      ) : authRequired ? (
        <p className="rounded-xl border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal/70">
          Signed in with the admin cookie. Saves are protected — unauthenticated writes return 401.
        </p>
      ) : (
        <p className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Dev mode: no admin key is set, so saves are open on this machine. Set{" "}
          <code>ADMIN_UPLOAD_KEY</code> before production.
        </p>
      )}

      <div className="space-y-4">
        {week.days.map((day) => (
          <fieldset key={day.date} className="rounded-2xl border border-charcoal/10 bg-white p-4 sm:p-5">
            <legend className="font-serif text-xl font-semibold text-charcoal">
              {day.dayName}{" "}
              <span className="font-sans text-sm font-normal text-charcoal/50">{day.date}</span>
            </legend>

            <div className="mt-3 flex gap-2">
              {(["open", "closed"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => updateDay(day.date, { status })}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                    day.status === status
                      ? "bg-charcoal text-bone"
                      : "border border-charcoal/15 text-charcoal/70 hover:border-brass"
                  }`}
                >
                  {status === "open" ? "Open" : "Closed"}
                </button>
              ))}
            </div>

            {day.status === "open" ? (
              <label className="mt-4 block">
                <span className="text-sm font-medium text-charcoal">Hours</span>
                <input
                  type="text"
                  value={day.hours}
                  onChange={(event) => updateDay(day.date, { hours: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-charcoal/15 px-4 py-3 text-sm text-charcoal outline-none ring-brass/30 focus:ring-2"
                />
              </label>
            ) : null}

            <label className="mt-4 block">
              <span className="text-sm font-medium text-charcoal">Notes for the team</span>
              <textarea
                value={day.notes}
                onChange={(event) => updateDay(day.date, { notes: event.target.value })}
                rows={2}
                maxLength={280}
                placeholder="Cesar out after 3. Walk-ins welcome."
                className="mt-2 w-full rounded-xl border border-charcoal/15 px-4 py-3 text-sm text-charcoal outline-none ring-brass/30 focus:ring-2"
              />
            </label>

            {day.status === "open" ? (
              <div className="mt-4">
                <p className="text-sm font-medium text-charcoal">Blocked slots</p>
                <p className="mt-1 text-xs text-charcoal/55">
                  Time reservations the floor should see — not a Booksy sync.
                </p>
                <ul className="mt-3 space-y-2">
                  {day.blocks.map((block, index) => (
                    <li key={`${day.date}-edit-block-${index}`} className="flex flex-wrap items-center gap-2">
                      <select
                        value={block.startHour}
                        onChange={(event) => {
                          const startHour = Number(event.target.value);
                          const blocks = day.blocks.map((item, i) =>
                            i === index
                              ? {
                                  ...item,
                                  startHour,
                                  endHour: item.endHour <= startHour ? Math.min(23, startHour + 1) : item.endHour,
                                }
                              : item,
                          );
                          updateDay(day.date, { blocks });
                        }}
                        className="rounded-xl border border-charcoal/15 bg-white px-3 py-2 text-sm"
                      >
                        {hours.map((option) => (
                          <option key={`start-${option.value}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-charcoal/40">to</span>
                      <select
                        value={block.endHour}
                        onChange={(event) => {
                          const endHour = Number(event.target.value);
                          const blocks = day.blocks.map((item, i) =>
                            i === index ? { ...item, endHour } : item,
                          );
                          updateDay(day.date, { blocks });
                        }}
                        className="rounded-xl border border-charcoal/15 bg-white px-3 py-2 text-sm"
                      >
                        {hours
                          .filter((option) => option.value > block.startHour)
                          .map((option) => (
                            <option key={`end-${option.value}`} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                      </select>
                      <input
                        type="text"
                        value={block.label}
                        onChange={(event) => {
                          const blocks = day.blocks.map((item, i) =>
                            i === index ? { ...item, label: event.target.value } : item,
                          );
                          updateDay(day.date, { blocks });
                        }}
                        placeholder="Time reservation"
                        className="min-w-[10rem] flex-1 rounded-xl border border-charcoal/15 px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        className="rounded-full bg-burgundy px-3 py-2 text-xs font-semibold uppercase tracking-wider text-bone"
                        onClick={() =>
                          updateDay(day.date, {
                            blocks: day.blocks.filter((_, i) => i !== index),
                          })
                        }
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-3 rounded-full border border-charcoal/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:border-brass"
                  onClick={() =>
                    updateDay(day.date, {
                      blocks: [...day.blocks, { startHour: 14, endHour: 15, label: "Time reservation" }],
                    })
                  }
                >
                  Add blocked slot
                </button>
              </div>
            ) : null}
          </fieldset>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-charcoal/20 bg-white px-4 py-4">
        <p className="text-sm font-medium text-charcoal">Or upload JSON</p>
        <p className="mt-1 text-xs text-charcoal/55">
          Optional. File should include <code>weekStart</code> and <code>days</code> with{" "}
          <code>status</code>, <code>hours</code>, <code>notes</code>, and <code>blocks</code>.
        </p>
        <input
          type="file"
          accept="application/json,.json"
          className="mt-3 block w-full text-sm text-charcoal/80"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            void handleUpload(file);
            event.target.value = "";
          }}
        />
      </div>

      {message ? (
        <p className={`text-sm ${saveState === "error" ? "text-red-700" : "text-charcoal/80"}`}>{message}</p>
      ) : null}

      <button
        type="submit"
        disabled={saveState === "saving" || loadingWeek}
        className="inline-flex w-full items-center justify-center rounded-full bg-brass px-6 py-3 text-sm font-semibold uppercase tracking-wider text-bone transition-colors hover:bg-brass/90 disabled:opacity-50 sm:w-auto"
      >
        {saveState === "saving" ? "Saving…" : "Save this week"}
      </button>

      <p className="text-center text-xs text-charcoal/50 sm:text-left">
        <Link href="/admin" className="text-brass hover:underline">
          Back to Staff Hub
        </Link>
      </p>
    </form>
  );
}
