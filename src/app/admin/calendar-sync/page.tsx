"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminBusyBlocks } from "@/components/AdminBusyBlocks";
import { BOOKABLE_WINDOW_DAYS, STAFF_BUSY_PRESETS } from "@/lib/busy-blocks";

type SyncStatus = {
  lastSyncedAt?: string;
  dayCount?: number;
  totalOpenSlots?: number;
  stafferCount?: number;
  staffers?: Array<{ name: string; booksyStafferId: string }>;
  source?: string;
  booksyLiveSync?: boolean;
  ttlMs?: number;
  note?: string;
  error?: string;
  ok?: boolean;
};

function formatAge(iso?: string): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return iso;
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  return `${Math.floor(mins / 60)} hr ago`;
}

export default function CalendarSyncAdminPage() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authRequired = true;

  const loadMeta = useCallback(async () => {
    try {
      const res = await fetch("/api/availability?meta=1", { cache: "no-store" });
      const data = (await res.json()) as SyncStatus;
      if (!res.ok) throw new Error(data.error ?? "Could not load sync status.");
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load sync status.");
    }
  }, []);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  const forceRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cron/refresh-availability", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
      const data = (await res.json()) as SyncStatus;
      if (!res.ok) throw new Error(data.error ?? "Force refresh failed.");
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Force refresh failed.");
    } finally {
      setLoading(false);
    }
  };

  const staffers = status?.staffers?.length ? status.staffers : STAFF_BUSY_PRESETS;

  return (
    <section className="bg-bone px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-brass">Staff</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-charcoal">
          Calendar sync + Booksy live
        </h1>
        <p className="mt-3 text-charcoal/70">
          /book pulls live open slots from Booksy&apos;s public customer booking API every 5
          minutes for <strong>every</strong> staffer (no password). Website appointments still
          overlay as busy. Busy-block paste below is a backup if Booksy is unreachable. Public
          book window: next {BOOKABLE_WINDOW_DAYS} open days.
        </p>

        <div className="mt-8 rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-charcoal/50">Last synced</dt>
              <dd className="mt-1 font-medium text-charcoal">
                {formatAge(status?.lastSyncedAt)}
              </dd>
              <dd className="mt-0.5 font-mono text-xs text-charcoal/45">
                {status?.lastSyncedAt ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-charcoal/50">Open slots (Any / shop)</dt>
              <dd className="mt-1 font-medium text-charcoal">
                {status?.totalOpenSlots ?? status?.dayCount ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-charcoal/50">Staffers refreshed</dt>
              <dd className="mt-1 font-medium text-charcoal">
                {status?.stafferCount ?? staffers.length}
              </dd>
              <dd className="mt-0.5 text-xs text-charcoal/45">
                {staffers.map((s) => s.name.split(" ")[0]).join(" · ")}
              </dd>
            </div>
            <div>
              <dt className="text-charcoal/50">Booksy live sync</dt>
              <dd className="mt-1 font-medium text-charcoal">
                {status?.booksyLiveSync ? "Yes — public time_slots" : "No — fallback / busy paste"}
              </dd>
              {status?.source ? (
                <dd className="mt-0.5 font-mono text-xs text-charcoal/45">{status.source}</dd>
              ) : null}
            </div>
          </dl>

          {status?.note ? (
            <p className="mt-4 rounded-xl bg-charcoal/5 px-3 py-2 text-xs text-charcoal/65">
              {status.note}
            </p>
          ) : null}

          {error ? (
            <p className="mt-4 text-sm text-burgundy" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void forceRefresh()}
              disabled={loading}
              className="rounded-full bg-charcoal px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-bone transition hover:bg-charcoal/90 disabled:opacity-50"
            >
              {loading ? "Refreshing…" : "Force refresh all staffers"}
            </button>
            <button
              type="button"
              onClick={() => void loadMeta()}
              className="rounded-full border border-charcoal/20 px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-charcoal transition hover:border-brass"
            >
              Reload status
            </button>
            <a
              href="/admin"
              className="rounded-full border border-charcoal/20 px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-charcoal transition hover:border-brass"
            >
              Back to hub
            </a>
          </div>
        </div>

        <AdminBusyBlocks authRequired={authRequired} />

        <div className="mt-8 rounded-2xl border border-charcoal/10 bg-white p-5 text-sm text-charcoal/70">
          <p className="font-semibold text-charcoal">Daily SOP (full team)</p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5">
            <li>
              Confirm <strong>Booksy live sync = Yes</strong> above. /book should match what a
              customer sees on Booksy for Alexis, Braulio, Cesar, Kristian, Sebastian.
            </li>
            <li>
              Force refresh if slots look stale. Cron hits <code>/api/cron/sync-booksy</code> every
              5 minutes (public API — never paste Booksy passwords into the site).
            </li>
            <li>
              Busy-block paste is backup only (Booksy outage or special holds). Prefer live sync.
            </li>
            <li>
              New web bookings open Booksy for the customer (prefilled). ntfy click = same
              one-tap Open Booksy for staff if they abandon. Prefer customer finish — zero
              retyping. See web bookings list above for Open Booksy →.
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
