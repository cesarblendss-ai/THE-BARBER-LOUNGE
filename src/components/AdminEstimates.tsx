"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { parseJsonResponse } from "@/lib/fetch-json";
import { formatUsd } from "@/lib/money";
import type { Estimate, EstimateStatus } from "@/lib/estimates-types";

type AdminEstimate = Estimate & { shareUrl: string };

type LineDraft = {
  id: string;
  description: string;
  amount: string;
};

type ListResponse = {
  estimates?: AdminEstimate[];
  stripeConfigured?: boolean;
  error?: string;
};

const STATUS_LABEL: Record<EstimateStatus, string> = {
  created: "Created",
  opened: "Opened",
  signed: "Signed",
  paid: "Deposit paid",
};

const STATUS_CLASS: Record<EstimateStatus, string> = {
  created: "bg-charcoal/10 text-charcoal",
  opened: "bg-brass/15 text-brass-dark",
  signed: "bg-brass/25 text-brass-dark",
  paid: "bg-emerald-100 text-emerald-900",
};

function newLineDraft(): LineDraft {
  return { id: crypto.randomUUID(), description: "", amount: "" };
}

function formatTimestamp(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminEstimates({
  authRequired,
  initialKey = "",
}: {
  authRequired: boolean;
  initialKey?: string;
}) {
  const [adminKey, setAdminKey] = useState(initialKey);
  const [unlocked, setUnlocked] = useState(!authRequired);
  const [authError, setAuthError] = useState<string | null>(null);
  const [estimates, setEstimates] = useState<AdminEstimate[]>([]);
  const [stripeConfigured, setStripeConfigured] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [clientName, setClientName] = useState("");
  const [notes, setNotes] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [lineItems, setLineItems] = useState<LineDraft[]>([newLineDraft()]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const adminHeaders = useMemo(() => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authRequired && adminKey.trim()) {
      headers["x-admin-key"] = adminKey.trim();
    }
    return headers;
  }, [adminKey, authRequired]);

  const loadEstimates = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/estimates", { headers: adminHeaders });
      const payload = await parseJsonResponse<ListResponse>(response);
      if (response.status === 401) {
        setUnlocked(false);
        setLoadError("Enter your admin key to see estimates.");
        return;
      }
      if (!response.ok) {
        throw new Error(payload?.error ?? "Could not load estimates.");
      }
      setUnlocked(true);
      setEstimates(payload?.estimates ?? []);
      setStripeConfigured(payload?.stripeConfigured !== false);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load estimates.");
    } finally {
      setLoading(false);
    }
  }, [adminHeaders]);

  useEffect(() => {
    if (!authRequired || unlocked || initialKey) {
      void loadEstimates();
    }
  }, [authRequired, initialKey, loadEstimates, unlocked]);

  async function handleUnlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError(null);
    try {
      const response = await fetch("/api/admin/edit-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminKey }),
      });
      if (!response.ok) {
        throw new Error("Invalid admin key.");
      }
      setUnlocked(true);
      await loadEstimates();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not unlock.");
    }
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    setCreatedUrl(null);

    const filledLines = lineItems
      .map((item) => ({
        description: item.description.trim(),
        amount: item.amount.trim(),
      }))
      .filter((item) => item.description || item.amount);

    try {
      const response = await fetch("/api/estimates", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          clientName,
          notes,
          depositAmount,
          amount: filledLines.length === 0 ? totalAmount : undefined,
          lineItems: filledLines,
        }),
      });
      const payload = await parseJsonResponse<{ estimate?: AdminEstimate; error?: string }>(response);
      if (!response.ok || !payload?.estimate) {
        throw new Error(payload?.error ?? "Could not create estimate.");
      }

      setEstimates((current) => [payload.estimate as AdminEstimate, ...current]);
      setCreatedUrl(payload.estimate.shareUrl);
      setClientName("");
      setNotes("");
      setDepositAmount("");
      setTotalAmount("");
      setLineItems([newLineDraft()]);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not create estimate.");
    } finally {
      setSaving(false);
    }
  }

  async function copyLink(url: string, token: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(token);
      window.setTimeout(() => setCopiedToken((current) => (current === token ? null : current)), 2000);
    } catch {
      setFormError("Could not copy the link — select it and copy manually.");
    }
  }

  if (authRequired && !unlocked) {
    return (
      <form onSubmit={(event) => void handleUnlock(event)} className="mx-auto mt-10 max-w-md">
        <label className="block text-left">
          <span className="text-sm font-medium text-charcoal">Admin key</span>
          <input
            type="password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            placeholder="Enter ADMIN_UPLOAD_KEY"
            className="mt-2 w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none ring-brass/30 focus:ring-2"
            autoComplete="off"
            required
          />
        </label>
        {authError ? <p className="mt-3 text-sm text-burgundy">{authError}</p> : null}
        <button
          type="submit"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-brass px-6 py-3 text-sm font-semibold uppercase tracking-wider text-bone transition-colors hover:bg-brass/90"
        >
          Unlock estimates
        </button>
      </form>
    );
  }

  return (
    <div className="mt-10 space-y-10">
      {!stripeConfigured ? (
        <p className="rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Stripe keys are not set yet. You can still create and share estimates; the Pay deposit
          button stays off until <code className="text-xs">STRIPE_SECRET_KEY</code> is in Vercel.
        </p>
      ) : null}

      <form
        onSubmit={(event) => void handleCreate(event)}
        className="rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm sm:p-6"
      >
        <h2 className="font-serif text-2xl font-semibold text-charcoal">New estimate</h2>
        <p className="mt-1 text-sm text-charcoal/60">
          Add a client, the work, and the deposit. You&apos;ll get a private link to text them.
        </p>

        <label className="mt-6 block">
          <span className="text-sm font-medium text-charcoal">Client name</span>
          <input
            value={clientName}
            onChange={(event) => setClientName(event.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none ring-brass/30 focus:ring-2"
          />
        </label>

        <div className="mt-6">
          <p className="text-sm font-medium text-charcoal">Line items</p>
          <p className="mt-1 text-xs text-charcoal/55">
            Description + amount, or skip this and enter a total below.
          </p>
          <ul className="mt-3 space-y-3">
            {lineItems.map((item, index) => (
              <li key={item.id} className="grid gap-2 sm:grid-cols-[1fr_8rem_auto]">
                <input
                  value={item.description}
                  onChange={(event) =>
                    setLineItems((current) =>
                      current.map((row) =>
                        row.id === item.id ? { ...row, description: event.target.value } : row,
                      ),
                    )
                  }
                  placeholder={`Item ${index + 1}`}
                  className="rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none ring-brass/30 focus:ring-2"
                />
                <input
                  value={item.amount}
                  onChange={(event) =>
                    setLineItems((current) =>
                      current.map((row) =>
                        row.id === item.id ? { ...row, amount: event.target.value } : row,
                      ),
                    )
                  }
                  inputMode="decimal"
                  placeholder="$0.00"
                  className="rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none ring-brass/30 focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() =>
                    setLineItems((current) =>
                      current.length === 1 ? [newLineDraft()] : current.filter((row) => row.id !== item.id),
                    )
                  }
                  className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-burgundy hover:bg-burgundy/10"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setLineItems((current) => [...current, newLineDraft()])}
            className="mt-3 text-sm font-semibold text-brass-dark hover:underline"
          >
            Add line item
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-charcoal">Total amount (if no line items)</span>
            <input
              value={totalAmount}
              onChange={(event) => setTotalAmount(event.target.value)}
              inputMode="decimal"
              placeholder="$0.00"
              className="mt-2 w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none ring-brass/30 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-charcoal">Deposit amount</span>
            <input
              value={depositAmount}
              onChange={(event) => setDepositAmount(event.target.value)}
              inputMode="decimal"
              placeholder="$0.00"
              required
              className="mt-2 w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none ring-brass/30 focus:ring-2"
            />
          </label>
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-medium text-charcoal">Notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none ring-brass/30 focus:ring-2"
            placeholder="Timing, extras, or anything the client should know."
          />
        </label>

        {formError ? <p className="mt-4 text-sm text-burgundy">{formError}</p> : null}
        {createdUrl ? (
          <p className="mt-4 break-all rounded-xl bg-bone px-4 py-3 text-sm text-charcoal">
            Link ready:{" "}
            <a href={createdUrl} className="font-medium text-brass-dark underline-offset-2 hover:underline">
              {createdUrl}
            </a>
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-brass px-8 py-3 text-sm font-semibold uppercase tracking-wider text-bone transition-colors hover:bg-brass/90 disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create estimate"}
        </button>
      </form>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-2xl font-semibold text-charcoal">Tracker</h2>
          <button
            type="button"
            onClick={() => void loadEstimates()}
            className="text-sm font-semibold text-brass-dark hover:underline"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
        {loadError ? <p className="mt-3 text-sm text-burgundy">{loadError}</p> : null}

        {estimates.length === 0 && !loading ? (
          <p className="mt-4 text-sm text-charcoal/60">No estimates yet. Create one above.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {estimates.map((estimate) => (
              <li
                key={estimate.id}
                className="rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-xl font-semibold text-charcoal">
                      {estimate.clientName}
                    </p>
                    <p className="mt-1 text-sm text-charcoal/60">
                      {formatUsd(estimate.amountCents)} total · {formatUsd(estimate.depositAmountCents)}{" "}
                      deposit
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${STATUS_CLASS[estimate.status]}`}
                  >
                    {STATUS_LABEL[estimate.status]}
                  </span>
                </div>
                <dl className="mt-4 grid gap-2 text-sm text-charcoal/70 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase tracking-label text-charcoal/45">Opened</dt>
                    <dd>{formatTimestamp(estimate.openedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-label text-charcoal/45">Signed</dt>
                    <dd>
                      {formatTimestamp(estimate.signedAt)}
                      {estimate.signedName ? ` · ${estimate.signedName}` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-label text-charcoal/45">Paid</dt>
                    <dd>{formatTimestamp(estimate.paidAt)}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <code className="max-w-full break-all text-xs text-charcoal/70">
                    {estimate.shareUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => void copyLink(estimate.shareUrl, estimate.token)}
                    className="rounded-full border border-charcoal/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal hover:border-brass hover:text-brass-dark"
                  >
                    {copiedToken === estimate.token ? "Copied" : "Copy link"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
