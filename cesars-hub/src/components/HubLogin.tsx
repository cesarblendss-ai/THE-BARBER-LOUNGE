"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function HubLogin() {
  const search = useSearchParams();
  const biz = search.get("biz");
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ key }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Could not unlock the hub.");
      }
      window.location.reload();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not unlock the hub.");
    }
  }

  return (
    <section className="flex min-h-dvh flex-col bg-ink px-4 pb-16 pt-16 text-paper sm:px-6">
      <div className="mx-auto w-full max-w-md text-center">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-paper/50">
          Cesar Blends
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold">Cesar’s Hub</h1>
        <p className="mt-4 text-paper/70">
          Agency OS — SEO clients, wizards, estimates. Bookmark localhost:8743. Cursor is optional.
        </p>
        <p className="mt-3 break-all font-mono text-xs text-paper/40">
          http://localhost:8743/?biz={biz || "barber-lounge"}&production=1
        </p>
        <form onSubmit={(event) => void handleSubmit(event)} className="mt-10 text-left">
          <label className="block">
            <span className="text-sm font-medium text-paper/80">Hub key</span>
            <input
              type="password"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              placeholder="HUB_KEY"
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-paper outline-none ring-paper/30 focus:ring-2"
              autoComplete="off"
              required
            />
          </label>
          {message ? <p className="mt-3 text-sm text-red-300">{message}</p> : null}
          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-paper px-6 py-3 text-sm font-semibold uppercase tracking-wider text-ink hover:bg-paper/90 disabled:opacity-50"
          >
            {status === "loading" ? "Unlocking…" : "Unlock hub"}
          </button>
        </form>
        <p className="mt-6 text-xs text-paper/40">
          Key lives in env as HUB_KEY — not in chat, not in git.
        </p>
      </div>
    </section>
  );
}
