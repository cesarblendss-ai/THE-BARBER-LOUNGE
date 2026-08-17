"use client";

import { useState } from "react";

export function OnboardForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
        slug?: string;
        file?: string;
      } | null;
      if (!response.ok) {
        throw new Error(body?.error ?? "Could not save client.");
      }
      setStatus("done");
      setMessage(`Saved ${body?.file ?? "client profile"}.`);
      if (body?.slug) {
        window.location.assign(`/?biz=${encodeURIComponent(body.slug)}&production=1`);
      }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not save client.");
    }
  }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none ring-ink/20 focus:ring-2";

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="mt-8 space-y-5 rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
      <label className="block">
        <span className="text-sm font-medium">Business name</span>
        <input name="name" required className={fieldClass} placeholder="The Barber Lounge" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Niche</span>
        <input name="niche" required className={fieldClass} placeholder="barbershop" />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">City</span>
          <input name="city" required className={fieldClass} placeholder="Antioch" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">State</span>
          <input name="state" required maxLength={2} className={fieldClass} placeholder="CA" />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium">Phone</span>
        <input name="phone" className={fieldClass} placeholder="(925) 209-5995" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Website</span>
        <input name="website" className={fieldClass} placeholder="https://" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Package</span>
        <select name="package" className={fieldClass} defaultValue="Growth">
          <option>Starter</option>
          <option>Growth</option>
          <option>Dominator</option>
          <option>Custom Launch</option>
        </select>
      </label>
      {message ? (
        <p className={`text-sm ${status === "error" ? "text-red-700" : "text-ink/70"}`}>{message}</p>
      ) : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-wider text-paper hover:bg-ink/90 disabled:opacity-50"
      >
        {status === "loading" ? "Saving…" : "Save client"}
      </button>
    </form>
  );
}
