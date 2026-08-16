"use client";

import { useEffect, useState } from "react";

import type { SmsSetupStatus } from "@/lib/sms-setup-status";

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
          ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
        aria-hidden
      >
        {ok ? "✓" : "✕"}
      </span>
      <span className={ok ? "text-charcoal" : "text-charcoal/80"}>
        {label} {ok ? "— set" : "— missing"}
      </span>
    </div>
  );
}

export function SmsSetupStatus() {
  const [status, setStatus] = useState<SmsSetupStatus | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/sms-setup-status")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load status");
        return res.json() as Promise<SmsSetupStatus>;
      })
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="text-sm text-amber-900">
        Could not load status. Restart the dev server and refresh this page.
      </p>
    );
  }

  if (!status) {
    return <p className="text-sm text-charcoal/60">Checking configuration…</p>;
  }

  const allSet = status.accountSid && status.phoneNumber && status.authToken;

  return (
    <div className="space-y-3">
      <StatusRow label="TWILIO_ACCOUNT_SID" ok={status.accountSid} />
      <StatusRow label="TWILIO_PHONE_NUMBER" ok={status.phoneNumber} />
      <StatusRow label="TWILIO_AUTH_TOKEN" ok={status.authToken} />
      {allSet ? (
        <p className="pt-1 text-sm font-medium text-green-800">
          All set — SMS receipts should work after a dev server restart.
        </p>
      ) : (
        <p className="pt-1 text-sm text-amber-900">
          Finish the steps below, save <code className="text-charcoal">.env.local</code>, then
          restart the dev server.
        </p>
      )}
    </div>
  );
}
