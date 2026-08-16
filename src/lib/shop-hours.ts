import { HOURS } from "@/lib/content";

const SHOP_TZ = "America/Los_Angeles";
const DAY_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function getShopWeekday(now: Date = new Date()): (typeof DAY_ORDER)[number] {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: SHOP_TZ,
    weekday: "long",
  }).format(now);
  return (DAY_ORDER as readonly string[]).includes(weekday)
    ? (weekday as (typeof DAY_ORDER)[number])
    : "Sunday";
}

function hoursFor(day: string): string {
  return HOURS.find((entry) => entry.day === day)?.hours ?? "Closed";
}

function isClosed(hours: string): boolean {
  return hours.trim().toLowerCase() === "closed";
}

function nextOpenAfter(day: string): { day: string; open: string } | null {
  const start = DAY_ORDER.indexOf(day as (typeof DAY_ORDER)[number]);
  if (start < 0) return null;

  for (let offset = 1; offset <= 7; offset += 1) {
    const nextDay = DAY_ORDER[(start + offset) % 7];
    const hours = hoursFor(nextDay);
    if (!isClosed(hours)) {
      return { day: nextDay, open: hours.split(" – ")[0] ?? hours };
    }
  }
  return null;
}

/** One-line open/closed for hero + sticky — shop timezone, not the server's. */
export function getOpenTodayLabel(now: Date = new Date()): { closed: boolean; line: string } {
  const day = getShopWeekday(now);
  const hours = hoursFor(day);

  if (isClosed(hours)) {
    const next = nextOpenAfter(day);
    return {
      closed: true,
      line: next ? `Closed today · Open ${next.day} ${next.open}` : "Closed today",
    };
  }

  const close = hours.split(" – ")[1] ?? hours;
  return { closed: false, line: `Open today until ${close}` };
}

export function googleMapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
