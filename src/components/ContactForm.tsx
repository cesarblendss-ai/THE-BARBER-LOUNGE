"use client";

import { useState, type FormEvent } from "react";
import { BOOKING_URL, CONTACT } from "@/lib/content";
import { Button } from "./Button";

type ContactFormProps = {
  fields: readonly string[];
};

type FieldConfig = {
  name: string;
  type: string;
  required?: boolean;
};

const fieldMap: Record<string, FieldConfig> = {
  Name: { name: "name", type: "text", required: true },
  Phone: { name: "phone", type: "tel", required: true },
  Email: { name: "email", type: "email", required: true },
  "Preferred Barber": { name: "barber", type: "text" },
  Message: { name: "message", type: "textarea" },
};

function validateField(name: string, value: string): string | null {
  const trimmed = value.trim();

  if (name === "name" && !trimmed) return "Name is required.";
  if (name === "phone" && !trimmed) return "Phone number is required.";
  if (name === "email") {
    if (!trimmed) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Enter a valid email address.";
  }

  return null;
}

export function ContactForm({ fields }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextErrors: Record<string, string> = {};

    for (const label of fields) {
      const config = fieldMap[label];
      if (!config) continue;

      const value = String(formData.get(config.name) ?? "");
      const error = config.required || config.name === "email" ? validateField(config.name, value) : null;
      if (error) nextErrors[config.name] = error;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitted(false);
      const firstInvalid = event.currentTarget.querySelector<HTMLElement>("[aria-invalid='true']");
      firstInvalid?.focus();
      return;
    }

    setErrors({});
    const name = String(formData.get("name") ?? "");
    const phone = String(formData.get("phone") ?? "");
    const email = String(formData.get("email") ?? "");
    const barber = String(formData.get("barber") ?? "");
    const message = String(formData.get("message") ?? "");

    const subject = encodeURIComponent(`Contact from ${name || "Website Visitor"}`);
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        `Preferred Barber: ${barber}`,
        "",
        message,
      ].join("\n"),
    );

    window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {hasErrors ? (
          <div
            role="alert"
            className="rounded-xl border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-sm text-burgundy"
          >
            <p className="font-medium">Please fix the following:</p>
            <ul className="mt-1 list-inside list-disc">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {fields.map((label) => {
          const config = fieldMap[label];
          if (!config) return null;

          const errorId = `${config.name}-error`;
          const fieldError = errors[config.name];

          if (config.type === "textarea") {
            return (
              <div key={label}>
                <label htmlFor={config.name} className="mb-2 block text-sm font-medium text-charcoal">
                  {label}
                </label>
                <textarea
                  id={config.name}
                  name={config.name}
                  rows={4}
                  aria-invalid={fieldError ? true : undefined}
                  aria-describedby={fieldError ? errorId : undefined}
                  className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-brass focus:ring-1 focus:ring-brass"
                />
                {fieldError ? (
                  <p id={errorId} className="mt-1.5 text-sm text-burgundy" role="alert">
                    {fieldError}
                  </p>
                ) : null}
              </div>
            );
          }

          return (
            <div key={label}>
              <label htmlFor={config.name} className="mb-2 block text-sm font-medium text-charcoal">
                {label}
                {config.required ? (
                  <span className="text-burgundy" aria-hidden="true">
                    {" "}
                    *
                  </span>
                ) : null}
                {config.required ? <span className="sr-only"> (required)</span> : null}
              </label>
              <input
                id={config.name}
                name={config.name}
                type={config.type}
                required={config.required}
                aria-required={config.required || undefined}
                aria-invalid={fieldError ? true : undefined}
                aria-describedby={fieldError ? errorId : undefined}
                className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-brass focus:ring-1 focus:ring-brass"
              />
              {fieldError ? (
                <p id={errorId} className="mt-1.5 text-sm text-burgundy" role="alert">
                  {fieldError}
                </p>
              ) : null}
            </div>
          );
        })}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full border-2 border-charcoal/20 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-charcoal transition-all hover:border-brass hover:text-brass-dark"
          >
            Send Message
          </button>
          <Button href={BOOKING_URL} external size="default">
            Book Online
          </Button>
        </div>
      </form>

      {submitted ? (
        <p className="mt-4 text-sm text-charcoal/70" role="status">
          Your email app should open shortly. For the fastest booking, use Book Online above.
        </p>
      ) : null}
    </div>
  );
}
