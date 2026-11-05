"use client";

import { useCallback, useState } from "react";

import { parseJsonResponse } from "@/lib/fetch-json";
import type { Lead } from "@/lib/leads-store";

type AdminLeadsProps = {
  authRequired: boolean;
  initialKey?: string;
};

export function AdminLeads({ authRequired, initialKey = "" }: AdminLeadsProps) {
  const [key, setKey] = useState(initialKey);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = {};
      if (authRequired && key.trim()) {
        headers["x-admin-key"] = key.trim();
      }
      const res = await fetch("/api/lead", { headers });
      const data = await parseJsonResponse<{ leads?: Lead[]; error?: string }>(res);
      if (!res.ok) {
        throw new Error(data?.error ?? "Could not load leads.");
      }
      setLeads(data?.leads ?? []);
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load leads.");
      setLoaded(false);
    } finally {
      setLoading(false);
    }
  }, [authRequired, key]);

  return (
    <div className="mt-8 space-y-4">
      {authRequired ? (
        <div className="rounded-2xl border border-charcoal/10 bg-white p-4">
          <label htmlFor="admin-lead-key" className="block text-sm font-medium text-charcoal">
            Admin key
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="admin-lead-key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full rounded-lg border border-charcoal/20 px-3 py-2.5 text-sm"
              placeholder="Paste ADMIN_UPLOAD_KEY"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="rounded-lg bg-charcoal px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-bone disabled:opacity-60"
            >
              {loading ? "Loading…" : "Load leads"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-lg bg-charcoal px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-bone disabled:opacity-60"
        >
          {loading ? "Loading…" : "Load leads"}
        </button>
      )}

      {error ? (
        <p role="alert" className="rounded-xl border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-sm text-burgundy">
          {error}
        </p>
      ) : null}

      {loaded ? (
        <div className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white">
          {leads.length === 0 ? (
            <p className="px-4 py-6 text-sm text-charcoal/60">No leads yet.</p>
          ) : (
            <ul className="divide-y divide-charcoal/10">
              {leads.map((lead) => (
                <li key={lead.id} className="px-4 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-serif text-lg font-semibold text-charcoal">{lead.name}</p>
                    <p className="text-xs uppercase tracking-wide text-charcoal/45">
                      {lead.intent} · {new Date(lead.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-charcoal/80">
                    {lead.phone}
                    {lead.email ? ` · ${lead.email}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-charcoal/60">
                    {lead.service ? `${lead.service} · ` : ""}
                    {lead.source}
                    {lead.smsOptIn ? " · SMS opt-in" : ""}
                    {lead.emailOptIn ? " · Email opt-in" : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <p className="text-xs text-charcoal/50">
        SMS campaigns and CRM haircut notes are blocked until Twilio Trust Hub KYC and an email
        provider are live. Leads are stored for outreach once those are on.
      </p>
    </div>
  );
}
