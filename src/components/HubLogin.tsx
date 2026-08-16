"use client";

import { useState } from "react";

import { HubInstallHint } from "@/components/HubInstallHint";
import { HUB_LIVE_URL, HUB_PATH } from "@/lib/hub";

export function HubLogin() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/admin/edit-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ key }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Could not unlock the hub.");
      }
      window.location.assign(HUB_PATH);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not unlock the hub.");
    }
  }

  return (
    <section className="flex min-h-dvh flex-col bg-bone px-4 pb-16 pt-16 sm:px-6">
      <div className="mx-auto w-full max-w-md text-center">
        <p className="font-sans text-xs font-semibold uppercase tracking-label text-charcoal/60">
          The Barber Lounge
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal">Cesar’s Hub</h1>
        <p className="mt-4 text-charcoal/70">
          Shop operating system. Bookmark this page. It keeps working if Cursor is gone.
        </p>
        <p className="mt-3 break-all font-mono text-xs text-charcoal/45">{HUB_LIVE_URL}</p>
        <form onSubmit={(event) => void handleSubmit(event)} className="mt-10 text-left">
          <label className="block">
            <span className="text-sm font-medium text-charcoal">Hub key</span>
            <input
              type="password"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              placeholder="Same key as site admin"
              className="mt-2 w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none ring-brass/30 focus:ring-2"
              autoComplete="off"
              required
            />
          </label>
          {message ? <p className="mt-3 text-sm text-red-700">{message}</p> : null}
          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-brass px-6 py-3 text-sm font-semibold uppercase tracking-wider text-bone hover:bg-brass/90 disabled:opacity-50"
          >
            {status === "loading" ? "Unlocking…" : "Unlock hub"}
          </button>
        </form>
        <HubInstallHint />
        <p className="mt-6 text-xs text-charcoal/50">
          Key lives in Vercel Production as ADMIN_UPLOAD_KEY — not in chat, not in git.
        </p>
      </div>
    </section>
  );
}
