"use client";

import { FormEvent, useId, useRef, useState } from "react";

import { parseJsonResponse } from "@/lib/fetch-json";

type FormState = {
  name: string;
  phone: string;
  email: string;
  instagram: string;
  licenseStatus: string;
  location: string;
};

const INITIAL: FormState = {
  name: "",
  phone: "",
  email: "",
  instagram: "",
  licenseStatus: "",
  location: "Antioch — 1518 A St",
};

const fieldClass =
  "w-full rounded-sm border-0 bg-[#E8E8E8] px-4 py-3.5 font-serif text-[15px] text-charcoal placeholder:text-charcoal/55 outline-none transition focus:ring-2 focus:ring-charcoal/20";

export function JoinTeamApplyForm() {
  const formId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const attachmentNames = files.map((f) => f.name).join(", ");
    const notes = [
      `License / school: ${form.licenseStatus.trim()}`,
      `Location interest: ${form.location.trim()}`,
      `Instagram: ${form.instagram.trim()}`,
      attachmentNames ? `Attachments named: ${attachmentNames}` : "Attachments: none",
    ].join("\n");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          source: "join-our-team",
          intent: "hiring",
          notes,
        }),
      });
      const data = await parseJsonResponse<{ error?: string }>(res);
      if (!res.ok) {
        throw new Error(data?.error ?? "Could not send your application.");
      }
      setDone(true);
      setForm(INITIAL);
      setFiles([]);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Call the shop.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-sm border border-charcoal/10 bg-white px-6 py-10 text-center">
        <p className="font-serif text-lg text-charcoal">Got it — thanks for reaching out.</p>
        <p className="mt-3 text-sm text-charcoal/60">
          We’ll look it over and get back to you if there’s a chair that fits.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-6 text-sm font-medium text-charcoal underline underline-offset-4"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-3xl" noValidate>
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <div className="flex flex-col gap-4">
          <label className="sr-only" htmlFor={`${formId}-name`}>
            Name
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            autoComplete="name"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={fieldClass}
            placeholder="Name*"
          />

          <label className="sr-only" htmlFor={`${formId}-phone`}>
            Phone
          </label>
          <input
            id={`${formId}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={fieldClass}
            placeholder="Phone*"
          />

          <label className="sr-only" htmlFor={`${formId}-email`}>
            Email
          </label>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={fieldClass}
            placeholder="Email*"
          />

          <label className="sr-only" htmlFor={`${formId}-instagram`}>
            Instagram
          </label>
          <input
            id={`${formId}-instagram`}
            name="instagram"
            required
            value={form.instagram}
            onChange={(e) => update("instagram", e.target.value)}
            className={fieldClass}
            placeholder="Instagram*"
          />
        </div>

        <div className="flex flex-col gap-4">
          <label className="sr-only" htmlFor={`${formId}-license`}>
            License or apprenticeship status
          </label>
          <textarea
            id={`${formId}-license`}
            name="licenseStatus"
            required
            rows={5}
            value={form.licenseStatus}
            onChange={(e) => update("licenseStatus", e.target.value)}
            className={`${fieldClass} min-h-[9.5rem] resize-y`}
            placeholder="Are you a licensed barber / in Barber school / acquiring apprenticeship license*"
          />

          <label className="sr-only" htmlFor={`${formId}-location`}>
            Location interest
          </label>
          <input
            id={`${formId}-location`}
            name="location"
            required
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            className={fieldClass}
            placeholder="Which location are you interested in joining? *"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-charcoal/10 pt-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 text-sm text-charcoal/70 transition hover:text-charcoal"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 stroke-current"
            fill="none"
            strokeWidth="1.75"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.44 11.05l-8.49 8.49a5.25 5.25 0 11-7.42-7.43l8.48-8.48a3.5 3.5 0 014.95 4.95l-8.49 8.48a1.75 1.75 0 11-2.47-2.47l7.78-7.78"
            />
          </svg>
          Attachments
        </button>
        <p className="text-sm text-charcoal/50">Attachments ({files.length})</p>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
      </div>

      {files.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-charcoal/55">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`}>{file.name}</li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-8 w-full rounded-sm bg-charcoal px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-bone transition hover:bg-charcoal/90 disabled:opacity-60 sm:w-auto sm:min-w-[12rem]"
      >
        {submitting ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}
