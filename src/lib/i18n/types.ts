export type Locale = "en" | "es";

export const LOCALES: Locale[] = ["en", "es"];

export const LOCALE_COOKIE = "tbl_locale";
export const LOCALE_STORAGE_KEY = "tbl_locale";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "es";
}
