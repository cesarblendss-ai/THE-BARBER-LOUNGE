"use client";

import { useState } from "react";

import { parseJsonResponse } from "@/lib/fetch-json";
import { formatUsd } from "@/lib/money";
import { SITE } from "@/lib/content";
import type { PublicEstimate } from "@/lib/estimates-types";

type Props = {
  token: string;
  initialEstimate: PublicEstimate;
  stripeConfigured: boolean;
  checkoutState?: "success" | "cancel" | null;
};

export function EstimatePublicView({
  token,
  initialEstimate,
  stripeConfigured,
  checkoutState = null,
}: Props) {
  const [estimate, setEstimate] = useState(initialEstimate);
  const [signedName, setSignedName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [paying, setPaying] = useState(false);

  const isPaid = estimate.status === "paid" || Boolean(estimate.paidAt);
  const isSigned = Boolean(estimate.signedAt && estimate.signedName);

  async function handleSign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSigning(true);
    setError(null);
    try {
      const response = await fetch(`/api/estimates/${token}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedName }),
      });
      const payload = await parseJsonResponse<{ estimate?: PublicEstimate; error?: string }>(
        response,
      );
      if (!response.ok || !payload?.estimate) {
        throw new Error(payload?.error ?? "Could not save your signature.");
      }
      setEstimate(payload.estimate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your signature.");
    } finally {
      setSigning(false);
    }
  }

  async function handlePay() {
    setPaying(true);
    setError(null);
    try {
      const response = await fetch(`/api/estimates/${token}/checkout`, { method: "POST" });
      const payload = await parseJsonResponse<{
        url?: string;
        alreadyPaid?: boolean;
        error?: string;
      }>(response);
      if (payload?.alreadyPaid) {
        window.location.assign(`/e/${token}`);
        return;
      }
      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error ?? "Could not start card payment.");
      }
      window.location.assign(payload.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start card payment.");
      setPaying(false);
    }
  }

  return (
    <div className="mt-10 space-y-8">
      {checkoutState === "success" && !isPaid ? (
        <p className="rounded-xl border border-brass/40 bg-white px-4 py-3 text-sm text-charcoal">
          Thanks — we&apos;re confirming your deposit now. This page updates once Stripe finishes.
        </p>
      ) : null}
      {checkoutState === "cancel" ? (
        <p className="rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal/80">
          Checkout was canceled. You can pay the deposit whenever you&apos;re ready.
        </p>
      ) : null}

      <div className="rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm sm:p-6">
        <p className="section-label">Estimate for</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-charcoal">{estimate.clientName}</h2>
        <p className="mt-2 text-sm text-charcoal/60">{SITE.name}</p>

        <ul className="mt-6 divide-y divide-charcoal/10">
          {estimate.lineItems.map((item, index) => (
            <li key={`${item.description}-${index}`} className="flex justify-between gap-4 py-3 text-sm">
              <span className="text-charcoal">{item.description}</span>
              <span className="shrink-0 font-medium text-charcoal">{formatUsd(item.amountCents)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between border-t border-charcoal/15 pt-4 text-base font-semibold text-charcoal">
          <span>Total</span>
          <span>{formatUsd(estimate.amountCents)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm text-charcoal/80">
          <span>Deposit due now</span>
          <span className="font-semibold text-brass-dark">{formatUsd(estimate.depositAmountCents)}</span>
        </div>

        {estimate.notes ? (
          <p className="mt-6 whitespace-pre-wrap rounded-xl bg-bone px-4 py-3 text-sm text-charcoal/80">
            {estimate.notes}
          </p>
        ) : null}
      </div>

      {isPaid ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
          <p className="font-serif text-2xl font-semibold">Deposit received</p>
          <p className="mt-2 text-sm">
            {estimate.signedName ? `Signed by ${estimate.signedName}. ` : null}
            We&apos;ll follow up to lock in the appointment.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="font-serif text-2xl font-semibold text-charcoal">Sign</h3>
            {isSigned ? (
              <p className="mt-3 text-sm text-charcoal/70">
                Signed by <strong>{estimate.signedName}</strong>
                {estimate.signedAt
                  ? ` on ${new Date(estimate.signedAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}`
                  : ""}
                .
              </p>
            ) : (
              <form onSubmit={(event) => void handleSign(event)} className="mt-4">
                <p className="text-sm text-charcoal/70">
                  Type your full name to agree to this estimate and the deposit below.
                </p>
                <label className="mt-4 block">
                  <span className="text-sm font-medium text-charcoal">Full name</span>
                  <input
                    value={signedName}
                    onChange={(event) => setSignedName(event.target.value)}
                    required
                    autoComplete="name"
                    className="mt-2 w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none ring-brass/30 focus:ring-2"
                  />
                </label>
                <button
                  type="submit"
                  disabled={signing}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-charcoal px-6 py-3 text-sm font-semibold uppercase tracking-wider text-bone transition-colors hover:bg-charcoal/90 disabled:opacity-50"
                >
                  {signing ? "Saving…" : "Sign estimate"}
                </button>
              </form>
            )}
          </div>

          <div className="rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="font-serif text-2xl font-semibold text-charcoal">Pay deposit</h3>
            <p className="mt-2 text-sm text-charcoal/70">
              Card payment on Stripe Checkout. Apple Pay shows automatically when your phone
              supports it.
            </p>
            <button
              type="button"
              onClick={() => void handlePay()}
              disabled={!isSigned || paying || !stripeConfigured}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-brass px-6 py-3 text-sm font-semibold uppercase tracking-wider text-bone transition-colors hover:bg-brass/90 disabled:opacity-50"
            >
              {paying ? "Opening checkout…" : `Pay ${formatUsd(estimate.depositAmountCents)} deposit`}
            </button>
            {!isSigned ? (
              <p className="mt-3 text-xs text-charcoal/55">Sign first, then pay.</p>
            ) : null}
            {!stripeConfigured ? (
              <p className="mt-3 text-sm text-charcoal/70">
                Card checkout isn&apos;t live yet. Call {SITE.phone} to pay the deposit.
              </p>
            ) : null}
          </div>
        </>
      )}

      {error ? <p className="text-sm text-burgundy">{error}</p> : null}
    </div>
  );
}
