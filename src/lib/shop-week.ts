import { HOURS } from "@/lib/content";
import { formatDisplayTime } from "@/lib/booking-agent/format";

export const SHOP_TIMEZONE = "America/Los_Angeles";

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type DayName = (typeof DAY_NAMES)[number];
export type ShopDayStatus = "open" | "closed";

export type ShopWeekBlock = {
  startHour: number;
  endHour: number;
  label: string;
};

export type ShopWeekDay = {
  date: string;
  dayName: DayName;
  status: ShopDayStatus;
  hours: string;
  notes: string;
  blocks: ShopWeekBlock[];
};

export type ShopWeek = {
  weekStart: string;
  days: ShopWeekDay[];
  updatedAt: string | null;
};

export type ShopWeekPersistence = "postgres" | "json";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_NOTES = 280;
const MAX_HOURS = 80;
const MAX_BLOCK_LABEL = 80;
const MAX_BLOCKS_PER_DAY = 8;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function isDateStr(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Calendar date parts in the shop timezone (not the server's local TZ). */
export function getShopDateParts(now: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  weekday: DayName;
} {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: SHOP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  });
  const parts = fmt.formatToParts(now);
  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const weekday = lookup.weekday as DayName;
  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    weekday: DAY_NAMES.includes(weekday) ? weekday : "Sunday",
  };
}

export function shopTodayStr(now: Date = new Date()): string {
  const { year, month, day } = getShopDateParts(now);
  return formatDateStr(year, month, day);
}

function addDaysToDateStr(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return formatDateStr(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function dayNameFromDateStr(dateStr: string): DayName {
  const [y, m, d] = dateStr.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return DAY_NAMES[weekday];
}

/** Sunday-start week in shop TZ — matches shop hours (Sunday open). */
export function getWeekStartSunday(dateStr: string): string {
  const dayName = dayNameFromDateStr(dateStr);
  const offset = DAY_NAMES.indexOf(dayName);
  return addDaysToDateStr(dateStr, -offset);
}

export function currentWeekStart(now: Date = new Date()): string {
  return getWeekStartSunday(shopTodayStr(now));
}

export function shiftWeekStart(weekStart: string, weekDelta: number): string {
  return addDaysToDateStr(weekStart, weekDelta * 7);
}

export function getWeekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysToDateStr(weekStart, i));
}

export function formatWeekRangeLabel(weekStart: string): string {
  const dates = getWeekDates(weekStart);
  const start = dates[0];
  const end = dates[6];
  const startLabel = formatShortDate(start);
  const endLabel = formatShortDate(end);
  const startYear = start.slice(0, 4);
  const endYear = end.slice(0, 4);
  if (startYear === endYear) {
    return `${startLabel} – ${endLabel}`;
  }
  return `${startLabel}, ${startYear} – ${endLabel}, ${endYear}`;
}

export function formatShortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function formatBlockRange(block: ShopWeekBlock): string {
  const start = formatDisplayTime(block.startHour);
  const end = formatDisplayTime(block.endHour);
  return `${start} – ${end}`;
}

function hoursForDay(dayName: DayName): string {
  return HOURS.find((h) => h.day === dayName)?.hours ?? "Closed";
}

export function buildDefaultDay(date: string): ShopWeekDay {
  const dayName = dayNameFromDateStr(date);
  const hours = hoursForDay(dayName);
  const closed = hours.trim().toLowerCase() === "closed";
  return {
    date,
    dayName,
    status: closed ? "closed" : "open",
    hours,
    notes: "",
    blocks: [],
  };
}

export function buildDefaultWeek(weekStart: string): ShopWeek {
  const start = isDateStr(weekStart) ? getWeekStartSunday(weekStart) : currentWeekStart();
  return {
    weekStart: start,
    days: getWeekDates(start).map(buildDefaultDay),
    updatedAt: null,
  };
}

function clampHour(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(23, Math.max(0, Math.round(n)));
}

function sanitizeBlock(raw: unknown): ShopWeekBlock | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const startHour = clampHour(rec.startHour, 9);
  let endHour = clampHour(rec.endHour, startHour + 1);
  if (endHour <= startHour) endHour = Math.min(23, startHour + 1);
  if (endHour <= startHour) return null;
  const label =
    typeof rec.label === "string" ? rec.label.trim().slice(0, MAX_BLOCK_LABEL) : "";
  return {
    startHour,
    endHour,
    label: label || "Time reservation",
  };
}

function sanitizeDay(raw: unknown, fallbackDate: string): ShopWeekDay {
  const defaults = buildDefaultDay(fallbackDate);
  if (!raw || typeof raw !== "object") return defaults;
  const rec = raw as Record<string, unknown>;
  const date =
    typeof rec.date === "string" && isDateStr(rec.date) ? rec.date : fallbackDate;
  const status: ShopDayStatus = rec.status === "closed" ? "closed" : "open";
  const hours =
    typeof rec.hours === "string" && rec.hours.trim()
      ? rec.hours.trim().slice(0, MAX_HOURS)
      : defaults.hours;
  const notes = typeof rec.notes === "string" ? rec.notes.trim().slice(0, MAX_NOTES) : "";
  const blocksRaw = Array.isArray(rec.blocks) ? rec.blocks : [];
  const blocks = blocksRaw
    .slice(0, MAX_BLOCKS_PER_DAY)
    .map(sanitizeBlock)
    .filter((b): b is ShopWeekBlock => Boolean(b));

  return {
    date: fallbackDate,
    dayName: dayNameFromDateStr(fallbackDate),
    status: date === fallbackDate ? status : defaults.status,
    hours: status === "closed" ? "Closed" : hours,
    notes,
    blocks: status === "closed" ? [] : blocks,
  };
}

export function sanitizeShopWeek(input: unknown, fallbackWeekStart?: string): ShopWeek {
  const rec = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const rawStart =
    typeof rec.weekStart === "string" && isDateStr(rec.weekStart)
      ? rec.weekStart
      : fallbackWeekStart && isDateStr(fallbackWeekStart)
        ? fallbackWeekStart
        : currentWeekStart();
  const weekStart = getWeekStartSunday(rawStart);
  const dates = getWeekDates(weekStart);
  const incomingDays = Array.isArray(rec.days) ? rec.days : [];
  const byDate = new Map<string, unknown>();
  for (const day of incomingDays) {
    if (day && typeof day === "object" && "date" in day) {
      const date = (day as { date?: unknown }).date;
      if (typeof date === "string" && isDateStr(date)) byDate.set(date, day);
    }
  }

  const updatedAt =
    typeof rec.updatedAt === "string" && rec.updatedAt.trim() ? rec.updatedAt : null;

  return {
    weekStart,
    days: dates.map((date) => sanitizeDay(byDate.get(date), date)),
    updatedAt,
  };
}

export function parseShopWeekUpload(raw: string): ShopWeek {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("That file is not valid JSON.");
  }
  return sanitizeShopWeek(parsed);
}

export function hourOptions(): Array<{ value: number; label: string }> {
  const hours: Array<{ value: number; label: string }> = [];
  for (let h = 8; h <= 19; h += 1) {
    hours.push({ value: h, label: formatDisplayTime(h) });
  }
  return hours;
}
