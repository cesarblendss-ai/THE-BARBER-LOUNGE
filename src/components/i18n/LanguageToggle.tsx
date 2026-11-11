"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";

type LanguageToggleProps = {
  className?: string;
  /** Compact pill for headers (default). */
  size?: "sm" | "md";
};

/**
 * Top-right EN | ES control. Persists choice for the whole site.
 */
export function LanguageToggle({ className = "", size = "sm" }: LanguageToggleProps) {
  const { locale, setLocale, t } = useLanguage();
  const pad = size === "md" ? "px-2.5 py-1.5" : "px-2 py-1";
  const text = size === "md" ? "text-[12px]" : "text-[11px]";

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border border-white/15 bg-white/[0.04] ${pad} ${className}`}
      role="group"
      aria-label={t("lang.label")}
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        aria-label={t("lang.switchToEn")}
        className={`rounded-full px-2.5 py-0.5 font-semibold tracking-[0.12em] transition ${text} ${
          locale === "en"
            ? "bg-white/15 text-white"
            : "text-white/45 hover:text-white/80"
        }`}
      >
        {t("lang.en")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("es")}
        aria-pressed={locale === "es"}
        aria-label={t("lang.switchToEs")}
        className={`rounded-full px-2.5 py-0.5 font-semibold tracking-[0.12em] transition ${text} ${
          locale === "es"
            ? "bg-holly text-white"
            : "text-white/45 hover:text-white/80"
        }`}
      >
        {t("lang.es")}
      </button>
    </div>
  );
}
