"use client";

import Link from "next/link";
import { useState } from "react";

type AdminEditPageProps = {
  authRequired: boolean;
  initialKey?: string;
};

export function AdminEditForm({ authRequired, initialKey = "" }: AdminEditPageProps) {
  const [key, setKey] = useState(initialKey);
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
        body: JSON.stringify({ key: authRequired ? key : undefined }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Authentication failed");
      }

      // Full navigation ensures the new cookie is sent and edit mode activates immediately.
      window.location.assign("/?edit=1");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="mx-auto mt-10 max-w-md">
      {authRequired ? (
        <label className="block text-left">
          <span className="text-sm font-medium text-charcoal">Admin key</span>
          <input
            type="password"
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder="Enter ADMIN_UPLOAD_KEY"
            className="mt-2 w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none ring-brass/30 focus:ring-2"
            autoComplete="off"
            required
          />
        </label>
      ) : (
        <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950">
          <strong>Dev mode:</strong> No <code className="text-xs">ADMIN_UPLOAD_KEY</code> is set in{" "}
          <code className="text-xs">.env.local</code>. Edit mode will enable without a key. Set a key
          before deploying to production.
        </div>
      )}

      {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-brass px-6 py-3 text-sm font-semibold uppercase tracking-wider text-bone transition-colors hover:bg-brass/90 disabled:opacity-50"
      >
        {status === "loading" ? "Enabling…" : "Enable edit mode"}
      </button>

      <p className="mt-6 text-center text-xs text-charcoal/60">
        You&apos;ll go straight to the homepage with edit mode on. Look for the gold{" "}
        <strong>✎</strong> buttons next to text and the banner at the bottom.
      </p>

      <p className="mt-4 text-center text-xs text-charcoal/50">
        <Link href="/admin/gallery" className="text-brass hover:underline">
          Back to gallery admin
        </Link>
      </p>
    </form>
  );
}
