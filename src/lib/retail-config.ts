/** Team barbers — used on the quick retail log page. */
export const RETAIL_BARBERS = [
  "Alexis Franco",
  "Braulio Gómez",
  "Cesar Silva",
  "Kristian Guerra",
  "Sebastian Guardado",
] as const;

/** Default PIN for local dev when RETAIL_LOG_PIN is unset. Do not rely on this in production. */
export const DEV_DEFAULT_RETAIL_LOG_PIN = "1847";

export function getEffectiveRetailLogPin(): string | null {
  const env = process.env.RETAIL_LOG_PIN?.trim();
  if (env) return env;
  if (process.env.NODE_ENV !== "production") return DEV_DEFAULT_RETAIL_LOG_PIN;
  return null;
}

export function isRetailLogPinRequired(): boolean {
  return getEffectiveRetailLogPin() !== null;
}

export function verifyRetailLogPin(provided: string | undefined | null): boolean {
  const required = getEffectiveRetailLogPin();
  if (!required) return true;
  return (provided ?? "").trim() === required;
}
