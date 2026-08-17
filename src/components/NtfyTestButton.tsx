"use client";

import { useState } from "react";

type Props = {
  authRequired: boolean;
};

export function NtfyTestButton({ authRequired }: Props) {
  const [adminKey, setAdminKey] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendTest = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const headers: Record<string, string> = {};
      if (authRequired && adminKey.trim()) {
        headers["x-admin-key"] = adminKey.trim();
      }

      const res = await fetch("/api/ntfy-test", { method: "POST", headers });
      const data = (await res.json()) as {
        ok?: boolean;
        pushSent?: boolean;
        pushError?: string;
        error?: string;
        hint?: string;
      };

      if (!res.ok) {
        setStatus(data.error ?? data.hint ?? "Test failed.");
        return;
      }

      if (data.pushSent) {
        setStatus(data.hint ?? "Test push sent — check your ntfy app.");
      } else {
        setStatus(data.pushError ?? data.hint ?? "Push did not send.");
      }
    } catch {
      setStatus("Could not reach /api/ntfy-test.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-charcoal/10 bg-charcoal/5 p-4">
      <h3 className="font-serif text-lg text-charcoal">Send test push</h3>
      <p className="mt-2 text-sm text-charcoal/70">
        Fires a test booking alert through production ntfy — no fake appointment saved.
      </p>

      {authRequired && (
        <input
          type="password"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          placeholder="ADMIN_UPLOAD_KEY"
          className="mt-3 w-full rounded-lg border border-charcoal/15 bg-bone px-3 py-2 text-sm"
        />
      )}

      <button
        type="button"
        onClick={sendTest}
        disabled={loading || (authRequired && !adminKey.trim())}
        className="mt-3 rounded-lg bg-brass px-4 py-2 text-sm font-medium text-bone disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send test notification"}
      </button>

      {status && <p className="mt-3 text-sm text-charcoal/80">{status}</p>}
    </div>
  );
}
