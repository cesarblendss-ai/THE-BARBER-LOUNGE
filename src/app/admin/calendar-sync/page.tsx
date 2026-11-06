"use client";

import { useCallback, useEffect, useState } from "react";

type SyncStatus = {
  lastSyncedAt?: string;
  dayCount?: number;
  totalOpenSlots?: number;
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

  return (
    <section className="bg-bone px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-brass">Staff</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-charcoal">Calendar sync</h1>
        <p className="mt-3 text-charcoal/70">
          Website availability rebuilds from appointments + shop hours. Vercel cron runs every 10
          minutes. Live Booksy calendar sync is not possible without a Booksy API.
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
              <dt className="text-charcoal/50">Open slots (next week)</dt>
              <dd className="mt-1 font-medium text-charcoal">
                {status?.totalOpenSlots ?? status?.dayCount ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-charcoal/50">Source</dt>
              <dd className="mt-1 font-medium text-charcoal">
                {status?.source ?? "appointments-store+hours"}
              </dd>
            </div>
            <div>
              <dt className="text-charcoal/50">Booksy live sync</dt>
              <dd className="mt-1 font-medium text-charcoal">
                {status?.booksyLiveSync ? "Yes" : "No — not available"}
              </dd>
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
              {loading ? "Refreshing…" : "Force refresh"}
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
      </div>
    </section>
  );
}
